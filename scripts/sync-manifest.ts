import { readFile, writeFile } from "node:fs/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { DEFAULT_URL, VERSION } from "../src/bridge.ts";

const url = new URL(process.env.HAMIR_MCP_URL || DEFAULT_URL);
const manifestPath = new URL("../manifest.json", import.meta.url);
const { engines } = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);

const client = new Client({ name: "hamir-mcp-manifest", version: VERSION });
await client.connect(new StreamableHTTPClientTransport(url));
const { tools } = await client.listTools();
await client.close();

const languages = new Set(
  tools.flatMap(({ inputSchema }) => {
    const language = inputSchema.properties?.language;
    if (!language || !("enum" in language) || !Array.isArray(language.enum))
      return [];
    return language.enum.filter((value) => typeof value === "string");
  }),
);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.version = VERSION;
manifest.compatibility.runtimes.node = engines.node;
manifest.tools = tools.map(({ name, description }) => ({ name, description }));
const languageList = [...languages].join(", ");
manifest.user_config.language.description = `Language for pack names and labels: ${languageList}. Leave empty for the server's default.`;

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `manifest.json: ${tools.length} tools, languages ${languageList}, from ${url}`,
);
