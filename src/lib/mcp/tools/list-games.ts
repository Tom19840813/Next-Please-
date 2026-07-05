import { defineTool } from "@lovable.dev/mcp-js";

const GAMES = [
  { id: "sudoku", name: "Sudoku" },
  { id: "tetris", name: "Tetris" },
  { id: "quiz", name: "Quiz" },
  { id: "memory", name: "Memory" },
  { id: "math", name: "Math Game" },
  { id: "emoji", name: "Emoji Match" },
  { id: "wordscramble", name: "Word Scramble" },
  { id: "balloons", name: "Balloon Pop" },
  { id: "snake", name: "Snake" },
  { id: "typing", name: "Typing Game" },
  { id: "colormatch", name: "Color Match" },
  { id: "whackamole", name: "Whack-a-Mole" },
  { id: "simon", name: "Simon Says" },
];

export default defineTool({
  name: "list_games",
  title: "List games",
  description: "List all games available in the Swipe & Play Arcade with their ids and display names.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(GAMES, null, 2) }],
    structuredContent: { games: GAMES },
  }),
});
