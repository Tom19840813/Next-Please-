import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "get_leaderboard",
  title: "Get leaderboard",
  description:
    "Get the top scores from the arcade. Optionally filter by a specific game id (e.g. 'snake', 'tetris').",
  inputSchema: {
    gameType: z
      .string()
      .optional()
      .describe("Optional game id to filter scores, e.g. 'snake'."),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe("How many top scores to return (default 10, max 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ gameType, limit }) => {
    const supabase = supabaseClient();
    let query = supabase
      .from("game_scores")
      .select("id, user_id, game_type, score, created_at")
      .order("score", { ascending: false })
      .limit(limit ?? 10);

    if (gameType) query = query.eq("game_type", gameType);

    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const userIds = [...new Set((data ?? []).map((r) => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);
    const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.username]));

    const rows = (data ?? []).map((r) => ({
      game_type: r.game_type,
      score: r.score,
      player: nameMap.get(r.user_id) ?? "Anonymous",
      created_at: r.created_at,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(rows, null, 2) }],
      structuredContent: { leaderboard: rows },
    };
  },
});
