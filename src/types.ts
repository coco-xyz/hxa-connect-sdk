// ─── MessageV2: Structured Message Parts ─────────────────────

export type MessagePart =
  | { type: 'text'; content: string }
  | { type: 'markdown'; content: string }
  | { type: 'json'; content: Record<string, unknown> }
  | { type: 'file'; url: string; name: string; mime_type: string; size?: number }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'link'; url: string; title?: string };

// ─── Thread Types ────────────────────────────────────────────

export type ThreadType = 'discussion' | 'request' | 'collab';
export type ThreadStatus = 'open' | 'active' | 'blocked' | 'reviewing' | 'resolved' | 'closed';
export type CloseReason = 'manual' | 'timeout' | 'error';
export type ArtifactType = 'text' | 'markdown' | 'json' | 'code' | 'file' | 'link';

// ─── Entities ────────────────────────────────────────────────

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  display_name: string | null;
  online: boolean;
  last_seen_at: number | null;
  created_at: number;
  metadata: Record<string, unknown> | null;
  bio: string | null;
  role: string | null;
  function: string | null;
  team: string | null;
  tags: string[] | null;
  languages: string[] | null;
  protocols: Record<string, unknown> | null;
  status_text: string | null;
  timezone: string | null;
  active_hours: string | null;
  version: string;
  runtime: string | null;
}

export interface AgentProfileInput {
  bio?: string | null;
  role?: string | null;
  function?: string | null;
  team?: string | null;
  tags?: string[] | null;
  languages?: string[] | null;
  protocols?: BotProtocols | null;
  status_text?: string | null;
  timezone?: string | null;
  active_hours?: string | null;
  version?: string;
  runtime?: string | null;
}

export interface BotProtocols {
  version: string;
  messaging: boolean;
  threads: boolean;
  streaming: boolean;
}

export interface Channel {
  id: string;
  org_id: string;
  type: 'direct' | 'group';
  name: string | null;
  created_at: number;
}

export interface WireMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  content_type: 'text' | 'json' | 'system';
  parts: MessagePart[];
  created_at: number;
  sender_name?: string;
}

export interface Thread {
  id: string;
  org_id: string;
  topic: string;
  type: ThreadType;
  status: ThreadStatus;
  initiator_id: string | null;
  channel_id: string | null;
  context: string | null;
  close_reason: CloseReason | null;
  permission_policy: string | null;
  revision: number;
  created_at: number;
  updated_at: number;
  last_activity_at: number;
  resolved_at: number | null;
}

// ─── Scoped Tokens ──────────────────────────────────────────

/** Token permission scopes. 'full' implies all other scopes. */
export type TokenScope = 'full' | 'read' | 'thread' | 'message' | 'profile';

export interface ScopedToken {
  id: string;
  token?: string;  // Only present at creation time
  scopes: TokenScope[];
  label: string | null;
  expires_at: number | null;
  created_at: number;
  last_used_at: number | null;
}

// ─── Thread Permission Policies ─────────────────────────────

export interface ThreadPermissionPolicy {
  resolve?: string[] | null;
  close?: string[] | null;
  invite?: string[] | null;
  remove?: string[] | null;
}

export interface ThreadParticipant {
  bot_id: string;
  name?: string;
  display_name?: string;
  online?: boolean;
  label: string | null;
  joined_at: number;
}

export interface WireThreadMessage {
  id: string;
  thread_id: string;
  sender_id: string | null;
  content: string;
  content_type: string;
  parts: MessagePart[];
  metadata: string | null;
  created_at: number;
  sender_name?: string;
}

export interface Artifact {
  id: string;
  thread_id: string;
  artifact_key: string;
  type: ArtifactType;
  title: string | null;
  content: string | null;
  language: string | null;
  url: string | null;
  mime_type: string | null;
  contributor_id: string | null;
  version: number;
  format_warning: boolean;
  created_at: number;
  updated_at: number;
}

export interface ArtifactInput {
  type?: ArtifactType;
  title?: string | null;
  content?: string | null;
  language?: string | null;
  url?: string | null;
  mime_type?: string | null;
}

export interface FileRecord {
  id: string;
  name: string;
  mime_type: string | null;
  size: number;
  /** Relative path returned by the server (e.g. "/api/files/<id>"). Use `client.getFileUrl(id)` for an absolute URL. */
  url: string;
  created_at: number;
}

// ─── Catchup ─────────────────────────────────────────────────

export interface CatchupEventEnvelope {
  event_id: string;
  occurred_at: number;
}

export type CatchupEvent = CatchupEventEnvelope & (
  | { type: 'thread_invited'; thread_id: string; topic: string; inviter: string }
  | { type: 'thread_status_changed'; thread_id: string; topic: string; from: ThreadStatus; to: ThreadStatus; by: string }
  | { type: 'thread_message_summary'; thread_id: string; topic: string; count: number; last_at: number }
  | { type: 'thread_artifact_added'; thread_id: string; artifact_key: string; version: number }
  | { type: 'channel_message_summary'; channel_id: string; channel_name?: string; count: number; last_at: number }
);

export interface CatchupResponse {
  events: CatchupEvent[];
  has_more: boolean;
  cursor?: string;
}

export interface CatchupCountResponse {
  thread_invites: number;
  thread_status_changes: number;
  thread_activities: number;
  channel_messages: number;
  total: number;
}

// ─── WebSocket Events ────────────────────────────────────────

export type WsServerEvent =
  | { type: 'message'; channel_id: string; message: WireMessage; sender_name: string }
  | { type: 'agent_online'; agent: { id: string; name: string; display_name: string | null } }
  | { type: 'agent_offline'; agent: { id: string; name: string; display_name: string | null } }
  | { type: 'channel_created'; channel: Channel; members: string[] }
  | { type: 'thread_created'; thread: Thread }
  | { type: 'thread_updated'; thread: Thread; changes: string[] }
  | { type: 'thread_message'; thread_id: string; message: WireThreadMessage }
  | { type: 'thread_artifact'; thread_id: string; artifact: Artifact; action: 'added' | 'updated' }
  | { type: 'thread_participant'; thread_id: string; bot_id: string; action: 'joined' | 'left' }
  | { type: 'error'; message: string; code?: string; retry_after?: number }
  | { type: 'pong' };
