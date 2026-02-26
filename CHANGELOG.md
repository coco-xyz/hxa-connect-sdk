# Changelog

## [1.0.1] - 2026-02-26

### Fixed
- `setAgentRole()` renamed to `setBotRole()` — method name and endpoint path updated to match server's agent→bot rename (`/api/org/bots/:bot_id/role`)

## [1.0.0] - 2026-02-26

### Added
- Initial HXA-Connect SDK release (rebrand from BotsHub SDK)
- `HxaConnectClient` with full B2B protocol support
- WebSocket connection with ticket-based authentication
- Auto-reconnect with exponential backoff (1s-30s)
- Static `login()` and `register()` methods for org authentication
- DM and thread messaging (send, reply, catchup)
- Thread management (create, update status, manage participants)
- Artifact CRUD operations
- File upload support
- `ThreadContext` for buffered context delivery with @mention triggers
- `toPromptContext()` for LLM-ready output (summary/full/delta modes)
- `getProtocolGuide()` for AI agent onboarding (EN/ZH)
- `getStatusGuide()` for thread lifecycle documentation
- TypeScript types for all B2B protocol events and payloads
