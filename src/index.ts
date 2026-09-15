import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createBridge } from "./bridge.ts";

// Stdout carries the protocol; logging goes to stderr.
const { HAMIR_MCP_URL, HAMIR_LANGUAGE, HAMIR_ERROR_REPORTS } = process.env;
const bridge = await createBridge({
  url: HAMIR_MCP_URL,
  language: HAMIR_LANGUAGE,
  // The desktop extension passes its checkbox through as "true" or "false".
  errorReports: HAMIR_ERROR_REPORTS === "true",
});
await bridge.connect(new StdioServerTransport());
