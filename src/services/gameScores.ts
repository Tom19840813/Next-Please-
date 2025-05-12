
import { supabase } from "@/integrations/supabase/client";
import { GameType } from "@/context/GameContext";

export interface GameScore {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  created_at: string;
  username?: string | null;
}

export const saveGameScore = async (gameType: GameType, score: number) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    console.error("User not authenticated");
    return null;
  }

  const { data, error } = await supabase
    .from("game_scores")
    .insert({
      user_id: user.user.id,
      game_type: gameType,
      score: score
    })
    .select();

  if (error) {
    console.error("Error saving score:", error);
    return null;
  }

  return data[0];
};

export const getLeaderboard = async (gameType?: GameType, limit = 10) => {
  let query = supabase
    .from("game_scores")
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .order('score', { ascending: false })
    .limit(limit);

  if (gameType) {
    query = query.eq('game_type', gameType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  return data.map(item => ({
    ...item,
    username: item.profiles?.username || 'Anonymous',
  }));
};

export const getUserBestScores = async (gameType?: GameType) => {
  const { data: user } = await supabase.auth.getUser();
  
  if (!user.user) {
    return [];
  }

  let query = supabase
    .from("game_scores")
    .select()
    .eq('user_id', user.user.id)
    .order('score', { ascending: false });

  if (gameType) {
    query = query.eq('game_type', gameType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching user scores:", error);
    return [];
  }

  return data;
};
