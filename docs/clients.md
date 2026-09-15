# Connecting clients

Server: `https://hamir.app/mcp`, Streamable HTTP, no sign-in. Every client below connects to it
directly. Checked against each client's documentation in September 2026.

## ChatGPT

Settings → Security and login → Developer mode on. Then chatgpt.com/plugins → **+** → MCP server URL
`https://hamir.app/mcp`, **No Authentication**. Paid plans, web only. Deep research only uses
servers with tools named `search` and `fetch`, so hamir works in regular chats.
[Docs](https://developers.openai.com/api/docs/guides/developer-mode)

## Claude (web, iPhone, Android)

Settings → Connectors → Add custom connector. Name `hamir`, URL `https://hamir.app/mcp`,
authentication **No sign-in**. A connector added on the web also appears in the mobile apps. Free
plans allow one custom connector. [Docs](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)

## Claude Code

```sh
claude mcp add --transport http --scope user hamir https://hamir.app/mcp
```

Or in a project's `.mcp.json`:

```json
{
  "mcpServers": { "hamir": { "type": "http", "url": "https://hamir.app/mcp" } }
}
```

[Docs](https://code.claude.com/docs/en/mcp)

## Cline

MCP Servers → Remote Servers, transport **Streamable HTTP**. Or in the settings JSON:

```json
{
  "mcpServers": {
    "hamir": { "type": "streamableHttp", "url": "https://hamir.app/mcp" }
  }
}
```

Set `type`: without it Cline uses the older SSE transport. [Docs](https://docs.cline.bot/mcp/mcp-overview)

## Codex

```sh
codex mcp add hamir --url https://hamir.app/mcp
```

Or `~/.codex/config.toml`:

```toml
[mcp_servers.hamir]
url = "https://hamir.app/mcp"
```

[Docs](https://learn.chatgpt.com/docs/extend/mcp)

## Continue

`.continue/mcpServers/hamir.yaml` (agent mode only):

```yaml
name: hamir
version: 0.0.1
schema: v1
mcpServers:
  - name: hamir
    type: streamable-http
    url: https://hamir.app/mcp
```

[Docs](https://docs.continue.dev/customize/deep-dives/mcp)

## Cursor

`~/.cursor/mcp.json`:

```json
{ "mcpServers": { "hamir": { "url": "https://hamir.app/mcp" } } }
```

[Docs](https://cursor.com/docs/mcp)

## Gemini CLI

```sh
gemini mcp add --scope user --transport http hamir https://hamir.app/mcp
```

Or `~/.gemini/settings.json`:

```json
{
  "mcpServers": { "hamir": { "type": "http", "url": "https://hamir.app/mcp" } }
}
```

Set `type`: a bare `url` is treated as the older SSE transport, which hamir doesn't serve.
[Docs](https://geminicli.com/docs/tools/mcp-server/)

## Goose

`~/.config/goose/config.yaml`:

```yaml
extensions:
  hamir:
    name: hamir
    type: streamable_http
    uri: https://hamir.app/mcp
    enabled: true
    timeout: 300
```

[Docs](https://goose-docs.ai/docs/getting-started/using-extensions)

## JetBrains AI Assistant and Junie

AI Assistant: Settings → Tools → AI Assistant → Model Context Protocol → Add. Junie:
`~/.junie/mcp/mcp.json`. Both use:

```json
{ "mcpServers": { "hamir": { "url": "https://hamir.app/mcp" } } }
```

[AI Assistant docs](https://www.jetbrains.com/help/ai-assistant/mcp.html) ·
[Junie docs](https://junie.jetbrains.com/docs/junie-cli-mcp-configuration.html)

## LM Studio

Program tab → Install → Edit `mcp.json` (version 0.3.17 or later):

```json
{ "mcpServers": { "hamir": { "url": "https://hamir.app/mcp" } } }
```

[Docs](https://lmstudio.ai/docs/app/mcp)

## VS Code with GitHub Copilot

`.vscode/mcp.json`, or **MCP: Open User Configuration**:

```json
{ "servers": { "hamir": { "type": "http", "url": "https://hamir.app/mcp" } } }
```

The key is `servers`, not `mcpServers`. On Copilot Business and Enterprise, an admin must allow MCP
servers. [Docs](https://code.visualstudio.com/docs/agent-customization/mcp-servers)

## Windsurf (Devin Desktop)

Devin agent, `~/.config/devin/mcp_config.json`:

```json
{
  "mcpServers": {
    "hamir": { "url": "https://hamir.app/mcp", "transport": "http" }
  }
}
```

Legacy Cascade agent, `~/.codeium/windsurf/mcp_config.json`:

```json
{ "mcpServers": { "hamir": { "serverUrl": "https://hamir.app/mcp" } } }
```

[Docs](https://docs.devin.ai/cli/extensibility/mcp/configuration)

## Zed

`~/.config/zed/settings.json`:

```json
{ "context_servers": { "hamir": { "url": "https://hamir.app/mcp" } } }
```

[Docs](https://zed.dev/docs/ai/mcp)
