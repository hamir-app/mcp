# hamir MCP server

Keep in touch with your favorite topics with [hamir](https://hamir.app) and your AI agent of choice.

- "What stories are most sources covering today?"
- "What has The Kyiv Independent published lately?"
- "Show me hamir's packs about technology."
- "Save this to hamir with a note: read before Friday."

## Tools

None of them change anything on hamir's server.

| Tool                  | Returns                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| `search`              | Articles matching a query, each with an id for `fetch`                         |
| `fetch`               | One article: title, source, date, link and the snippet where allowed           |
| `search_sources`      | News sites, magazines and blogs by name, website or topic                      |
| `get_source_articles` | The newest articles from one source                                            |
| `todays_coverage`     | The stories the most sources are covering                                      |
| `list_packs`          | hamir's hand-picked packs of sources                                           |
| `get_pack`            | The sources in one pack                                                        |
| `save_articles`       | One link that saves up to 50 articles, with notes, once you confirm in the app |

Articles come back as headline, source, date and link. The feed's own snippet is included only where
the source allows AI summaries. Article text is never returned, and results are capped per call.

## Connect

The server is at `https://hamir.app/mcp` (Streamable HTTP, no sign-in). Add that URL to any MCP client.

| Client                                            | How                                                                  |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| ChatGPT                                           | Developer mode, then Plugins → **+** → server URL, No Authentication |
| Claude (web and mobile)                           | Settings → Connectors → Add custom connector, No sign-in             |
| Claude Code                                       | `claude mcp add -t http -s user hamir https://hamir.app/mcp`         |
| Codex                                             | `codex mcp add hamir --url https://hamir.app/mcp`                    |
| Cursor, VS Code, Gemini CLI, Zed and 6 more       | [docs/clients.md](docs/clients.md)                                   |

## Desktop extension

For Claude Desktop, this repo also builds a one-click extension: download `hamir.mcpb` from the
[latest release](https://github.com/hamir-app/mcp/releases/latest) and open it. It's a small local bridge to
the same server, so new tools appear without an update, and it adds settings for language and error
reports.

| Variable              | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `HAMIR_LANGUAGE`      | Language for pack names and labels, such as `uk` |
| `HAMIR_ERROR_REPORTS` | `true` to send error reports; off otherwise      |
| `HAMIR_MCP_URL`       | Another server to forward to, for development    |

## Development

```sh
npm install
npm run typecheck && npm test
npm run sync-manifest    # copy tools and languages from the server into manifest.json
npm run pack             # build hamir.mcpb
```

## Privacy Policy

The full policy is at [hamir.app/privacy](https://hamir.app/privacy).

- **Collected:** each tool call's arguments (such as a search query) and the language setting. No account, name, email, cookie or device identifier. Your conversation is not sent.
- **Use and storage:** arguments are used to answer the call and are not stored. Your IP address is used for rate limiting, in counters that expire within five minutes, and is written with your user agent to hamir's request logs.
- **Sharing:** none. You can opt in to anonymous error reports ("Send error reports" in the
  extension's settings, or `HAMIR_ERROR_REPORTS=true`), which go to hamir's self-hosted tracker without your IP address, cookies or what you searched for.
- **Retention:** arguments are not kept. Request logs (IP address, user agent and path, never arguments) are deleted after 30 days, and error reports after 90.
- **Contact:** hello@hamir.app

## Licence

The code is [MIT](LICENSE). The hamir name and logo (`icon.png`) are not covered: they identify the
hamir app, and forks must use their own.
