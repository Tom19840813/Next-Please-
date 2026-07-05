import { defineMcp } from "@lovable.dev/mcp-js";
import listGamesTool from "./tools/list-games";
import getLeaderboardTool from "./tools/get-leaderboard";

export default defineMcp({
  name: "swipe-and-play-arcade-mcp",
  title: "Swipe & Play Arcade MCP",
  version: "0.1.0",
  instructions:
    "Tools for the Swipe & Play Arcade. Use `list_games` to see the available retro games, and `get_leaderboard` to fetch top scores (optionally filtered by game id).",
  tools: [listGamesTool, getLeaderboardTool],
});
