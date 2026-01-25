
import { supabase } from "@/integrations/supabase/client";
import { GameType } from "@/context/GameContext";

export interface GameScore {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  created_at: string;
  username?: string | null;
  avatar_url?: string | null;
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
      id,
      user_id,
      game_type,
      score,
      created_at
    `)
    .order('score', { ascending: false })
    .limit(limit);

  if (gameType) {
    query = query.eq('game_type', gameType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  // Fetch profiles for all unique user_ids
  const userIds = [...new Set(data.map(item => item.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  return data.map(item => ({
    ...item,
    username: profileMap.get(item.user_id)?.username || 'Anonymous',
    avatar_url: profileMap.get(item.user_id)?.avatar_url || null
  }));
};

export const getHallOfFame = async (timeFrame: 'allTime' | 'monthly' | 'weekly' = 'allTime', limit = 20) => {
  // Calculate date filter based on timeframe
  let dateFilter: string | null = null;
  const now = new Date();
  
  if (timeFrame === 'weekly') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    dateFilter = weekAgo.toISOString();
  } else if (timeFrame === 'monthly') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    dateFilter = monthAgo.toISOString();
  }

  let query = supabase
    .from("game_scores")
    .select("user_id, game_type, score, created_at")
    .order('score', { ascending: false });

  if (dateFilter) {
    query = query.gte('created_at', dateFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching hall of fame:', error);
    return [];
  }

  // Aggregate scores by user
  const playerMap = new Map<string, {
    userId: string;
    totalScore: number;
    gamesPlayed: number;
    bestGame?: { game_type: string; score: number };
  }>();

  data.forEach(score => {
    if (!playerMap.has(score.user_id)) {
      playerMap.set(score.user_id, {
        userId: score.user_id,
        totalScore: 0,
        gamesPlayed: 0,
        bestGame: undefined
      });
    }

    const player = playerMap.get(score.user_id)!;
    player.totalScore += score.score;
    player.gamesPlayed += 1;

    if (!player.bestGame || score.score > player.bestGame.score) {
      player.bestGame = { game_type: score.game_type, score: score.score };
    }
  });

  // Fetch profiles
  const userIds = [...playerMap.keys()];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .in("id", userIds);

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Convert to array, add profile data, and sort
  return Array.from(playerMap.values())
    .map(player => ({
      ...player,
      username: profileMap.get(player.userId)?.username || 'Anonymous',
      avatar_url: profileMap.get(player.userId)?.avatar_url || null
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);
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
