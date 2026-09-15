import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { text } from "node:stream/consumers";
import { after, before, test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createBridge, type BridgeOptions } from "../src/bridge.ts";

const TOOL = {
  name: "search",
  title: "Search articles",
  description: "Search articles.",
  inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  annotations: { readOnlyHint: true, openWorldHint: true }
};

const seenLanguages: Array<string | undefined> = [];
const seenDiagnostics: Array<string | string[] | undefined> = [];

// A stand-in for hamir.app: stateless Streamable HTTP answering with plain JSON, like the real one.
const hosted = createServer(async (req, res) => {
  if (req.method !== "POST") return void res.writeHead(405, { Allow: "POST" }).end();

  const message = JSON.parse(await text(req));
  seenLanguages.push(req.headers["accept-language"]);
  seenDiagnostics.push(req.headers["hamir-diagnostics"]);
  if (message.id === undefined) return void res.writeHead(202).end();

  const results: Record<string, unknown> = {
    initialize: {
      protocolVersion: message.params?.protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "hamir", version: "test" },
      instructions: "Read the news through hamir."
    },
    "tools/list": { tools: [TOOL] },
    "tools/call": {
      content: [{ type: "text", text: `searched ${message.params?.arguments?.query}` }],
      structuredContent: { articles: [] },
      isError: false
    }
  };
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ jsonrpc: "2.0", id: message.id, result: results[message.method] }));
});

let url: string;
before(async () => {
  hosted.listen(0, "127.0.0.1");
  await once(hosted, "listening");
  const address = hosted.address();
  assert.ok(address && typeof address === "object");
  url = `http://127.0.0.1:${address.port}/mcp`;
});
after(() => hosted.close());

async function connectedClient(options: BridgeOptions): Promise<Client> {
  const bridge = await createBridge(options);
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await bridge.connect(serverSide);
  const client = new Client({ name: "test", version: "0" });
  await client.connect(clientSide);
  return client;
}

test("forwards the hosted tool list untouched, annotations included", async () => {
  const { tools } = await (await connectedClient({ url })).listTools();
  assert.deepEqual(tools.map((tool) => tool.name), ["search"]);
  assert.equal(tools[0]?.title, "Search articles");
  assert.equal(tools[0]?.annotations?.readOnlyHint, true);
});

test("forwards tool calls and their structured results", async () => {
  const result = await (await connectedClient({ url })).callTool({ name: "search", arguments: { query: "glacier" } });
  assert.deepEqual(result.content, [{ type: "text", text: "searched glacier" }]);
  assert.deepEqual(result.structuredContent, { articles: [] });
});

test("carries the hosted server's instructions", async () => {
  assert.equal((await connectedClient({ url })).getInstructions(), "Read the news through hamir.");
});

test("sends a valid language tag and never an invalid one", async () => {
  seenLanguages.length = 0;
  await (await connectedClient({ url, language: "uk" })).listTools();
  assert.ok(seenLanguages.includes("uk"));

  seenLanguages.length = 0;
  await (await connectedClient({ url, language: "not a language!" })).listTools();
  // fetch fills in its own `*` when none is set.
  assert.ok(seenLanguages.every((value) => value === undefined || value === "*"));
});

test("error reports stay off unless turned on", async () => {
  seenDiagnostics.length = 0;
  await (await connectedClient({ url })).listTools();
  assert.deepEqual(new Set(seenDiagnostics), new Set(["off"]));

  seenDiagnostics.length = 0;
  await (await connectedClient({ url, errorReports: true })).listTools();
  assert.deepEqual(new Set(seenDiagnostics), new Set(["on"]));
});

test("an unreachable server is a clear error, not a crash", async () => {
  const unreachable = await connectedClient({ url: "http://127.0.0.1:9/mcp" });
  await assert.rejects(unreachable.listTools(), /hamir could not be reached/);
});
