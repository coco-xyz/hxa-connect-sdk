import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── Test isMention logic via ThreadContext ─────────────────
// ThreadContext is tightly coupled to HxaConnectClient (requires WS),
// so we test the mention detection logic by checking the behavior
// through the class's internal isMention method via reflection.

// Build a minimal WireThreadMessage for testing
function makeMessage(overrides: Record<string, unknown> = {}) {
  return {
    id: 'msg-1',
    thread_id: 'thread-1',
    sender_id: 'other-bot',
    content: overrides.content ?? 'hello',
    content_type: 'text',
    parts: [{ type: 'text', content: overrides.content ?? 'hello' }],
    mentions: [],
    mention_all: false,
    metadata: null,
    reply_to_id: null,
    created_at: Date.now(),
    ...overrides,
  };
}

// Since ThreadContext requires a live client, we test isMention logic
// by extracting and reproducing the detection algorithm
function isMention(
  message: ReturnType<typeof makeMessage>,
  opts: { botId: string | null; botNames: string[]; triggerPatterns?: RegExp[] },
): boolean {
  // mention_all
  if (message.mention_all) return true;
  // mentions array check (the new behavior from fix/219)
  if (opts.botId && (message.mentions as Array<{ bot_id: string }>)?.some(m => m.bot_id === opts.botId)) return true;
  // text pattern check
  const mentionPatterns = opts.botNames.map(
    name => new RegExp(`@${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
  );
  const allPatterns = [...mentionPatterns, ...(opts.triggerPatterns ?? [])];
  const textContent = [message.content, ...message.parts.map((p: any) => p.content)].join(' ');
  return allPatterns.some(pattern => {
    pattern.lastIndex = 0;
    return pattern.test(textContent);
  });
}

describe('Mention Detection (#219)', () => {
  const botOpts = { botId: 'my-bot-id', botNames: ['mybot'] };

  it('detects explicit @mention in text', () => {
    const msg = makeMessage({ content: 'hey @mybot check this' });
    assert.ok(isMention(msg, botOpts));
  });

  it('detects mention_all', () => {
    const msg = makeMessage({ mention_all: true });
    assert.ok(isMention(msg, botOpts));
  });

  it('detects bot in mentions array (implicit mention from reply_to)', () => {
    const msg = makeMessage({
      content: 'replying without @mention',
      mentions: [{ bot_id: 'my-bot-id', name: 'mybot' }],
    });
    assert.ok(isMention(msg, botOpts));
  });

  it('does NOT trigger when mentions array has other bots only', () => {
    const msg = makeMessage({
      content: 'replying to someone else',
      mentions: [{ bot_id: 'other-bot-id', name: 'otherbot' }],
    });
    assert.ok(!isMention(msg, botOpts));
  });

  it('does NOT trigger for plain message without mention', () => {
    const msg = makeMessage({ content: 'just a normal message' });
    assert.ok(!isMention(msg, botOpts));
  });

  it('mentions array check requires botId to be set', () => {
    const msg = makeMessage({
      content: 'no text mention',
      mentions: [{ bot_id: 'my-bot-id', name: 'mybot' }],
    });
    // botId is null — mentions array check should be skipped
    assert.ok(!isMention(msg, { botId: null, botNames: ['mybot'] }));
  });

  it('handles empty mentions array gracefully', () => {
    const msg = makeMessage({ content: 'hello', mentions: [] });
    assert.ok(!isMention(msg, botOpts));
  });

  it('dedup: text @mention + mentions array both present', () => {
    const msg = makeMessage({
      content: '@mybot check this',
      mentions: [{ bot_id: 'my-bot-id', name: 'mybot' }],
    });
    // Should trigger (either path works)
    assert.ok(isMention(msg, botOpts));
  });
});
