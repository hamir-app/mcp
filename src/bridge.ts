import { readFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FetchLike } from "@modelcontextprotocol/sdk/shared/transport.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

export const VERSION: string = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
).version;

export const DEFAULT_URL = "https://hamir.app/mcp";

// Long enough for a normal handshake, short enough that a slow network doesn't hold up the client.
const INSTRUCTIONS_WAIT_MS = 3_000;

export interface BridgeOptions {
  /** Empty means the hosted server; set it to develop against a local one. */
  url?: string;
  /** Sent as Accept-Language; the server decides which languages it supports. */
  language?: string;
  /** Lets hamir's error tracker see failures in your calls. Off unless turned on. */
  errorReports?: boolean;
  fetch?: FetchLike;
}

const reason = (error: unknown) =>
  error instanceof Error ? error.message : String(error);
const unreachable = (error: unknown) =>
  `hamir could not be reached: ${reason(error)}`;

function languageTag(language: string | undefined): string | undefined {
  if (!language) return undefined;
  try {
    return Intl.getCanonicalLocales(language)[0];
  } catch {
    return undefined;
  }
}

// The tools live on the hosted server, the only place their limits can be enforced. This process
// forwards to it, so a tool added there reaches every client with no release here. That is why it
// sets the raw handlers: `registerTool` would need a local copy of each schema.
export async function createBridge({
  url,
  language,
  errorReports,
  fetch,
}: BridgeOptions = {}): Promise<McpServer> {
  const endpoint = new URL(url || DEFAULT_URL);
  const headers = new Headers({
    "User-Agent": `hamir-mcp/${VERSION}`,
    "Hamir-Diagnostics": errorReports ? "on" : "off",
  });
  const tag = languageTag(language);
  if (tag) headers.set("Accept-Language", tag);

  let remote: Promise<Client> | undefined;
  const connect = () =>
    (remote ??= (async () => {
      const client = new Client({ name: "hamir-mcp", version: VERSION });
      await client.connect(
        new StreamableHTTPClientTransport(endpoint, {
          requestInit: { headers },
          fetch,
        }),
      );
      return client;
    })().catch((error: unknown) => {
      remote = undefined;
      throw new McpError(ErrorCode.InternalError, unreachable(error));
    }));

  // The server's instructions describe its tools; carrying them over keeps one source for both.
  const instructions = await Promise.race([
    connect().then((client) => client.getInstructions()),
    sleep(INSTRUCTIONS_WAIT_MS, undefined, { ref: false }),
  ]).catch(() => undefined);

  const bridge = new McpServer(
    { name: "hamir", version: VERSION },
    { capabilities: { tools: {} }, ...(instructions ? { instructions } : {}) },
  );

  bridge.server.setRequestHandler(ListToolsRequestSchema, async ({ params }) =>
    (await connect()).listTools(params),
  );

  bridge.server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
    const client = await connect();
    try {
      return await client.callTool(params);
    } catch (error) {
      if (error instanceof McpError) throw error;
      // A dropped connection shouldn't strand every later call on a dead client.
      remote = undefined;
      return {
        content: [{ type: "text", text: unreachable(error) }],
        isError: true,
      };
    }
  });

  return bridge;
}
