import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import listCausesTool from "./tools/list-causes";

export default defineMcp({
  name: "cashforcause-mcp",
  title: "CashForCause MCP",
  version: "0.1.0",
  instructions:
    "Tools exposing CashForCause public data. Use `echo` to verify connectivity and `list_causes` to browse the public causes catalog.",
  tools: [echoTool, listCausesTool],
});
