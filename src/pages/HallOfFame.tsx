import React, { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
import { getHallOfFame } from '../services/gameScores';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Medal, Trophy, Flame, Star, Crown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TopPlayer {
  userId: string;
  username: string;
  avatar_url: string | null;
  totalScore: number;
  gamesPlayed: number;
  bestGame?: {
    game_type: string;
    score: number;
  };
}

// Random fallback players when no data exists
const generateRandomPlayers = (): TopPlayer[] => {
  const randomNames = ['ArcadeKing', 'PixelQueen', 'RetroMaster', 'NeonNinja', 'GameWizard'];
  const avatarColors = ['bg-purple-600', 'bg-pink-600', 'bg-cyan-600', 'bg-yellow-600', 'bg-green-600'];
  const games = ['sudoku', 'tetris', 'quiz', 'memory', 'math'];
  
  return randomNames.map((name, idx) => ({
    userId: `random-${idx}`,
    username: name,
    avatar_url: null,
    totalScore: Math.floor(Math.random() * 5000) + 1000,
    gamesPlayed: Math.floor(Math.random() * 50) + 10,
    bestGame: {
      game_type: games[Math.floor(Math.random() * games.length)],
      score: Math.floor(Math.random() * 1000) + 200
    }
  })).sort((a, b) => b.totalScore - a.totalScore);
};

const HallOfFame: React.FC = () => {
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [timeFrame, setTimeFrame] = useState<'allTime' | 'monthly' | 'weekly'>('allTime');
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTopPlayers = async () => {
      setLoading(true);
      try {
        const players = await getHallOfFame(timeFrame, 20);
        if (players.length === 0) {
          // No real data, show demo players
          setTopPlayers(generateRandomPlayers());
          setIsDemo(true);
        } else {
          setTopPlayers(players);
          setIsDemo(false);
        }
      } catch (error) {
        console.error('Error fetching hall of fame data:', error);
        // On error, show demo players
        setTopPlayers(generateRandomPlayers());
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopPlayers();
  }, [timeFrame]);

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-6 w-6 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.8)]" />;
      case 1: return <Medal className="h-5 w-5 text-muted-foreground drop-shadow-[0_0_6px_hsl(var(--muted-foreground)/0.6)]" />;
      case 2: return <Medal className="h-5 w-5 text-accent drop-shadow-[0_0_6px_hsl(var(--accent)/0.6)]" />;
      default: return <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const getGameEmoji = (gameType: string) => {
    const emojis: Record<string, string> = {
      sudoku: '🔢', tetris: '🧱', quiz: '❓', memory: '🧠',
      math: '➕', emoji: '😀', wordscramble: '📝', balloons: '🎈'
    };
    return emojis[gameType] || '🎮';
  };

  return (
    <div className="min-h-screen bg-background arcade-grid">
      <AppHeader />
      
      <main className="container mx-auto px-4 pt-24 pb-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="h-10 w-10 text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.8)]" />
              <h1 className="text-4xl font-bold text-foreground neon-text">
                Hall of Fame
              </h1>
              <Trophy className="h-10 w-10 text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.8)]" />
            </div>
            <p className="text-muted-foreground">
              {isDemo ? 'Demo leaderboard - Play to claim your spot!' : 'The legends who conquered the arcade'}
            </p>
            {isDemo && (
              <span className="inline-block mt-2 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs text-primary">
                Sample Data
              </span>
            )}
          </div>
          
          <Tabs 
            defaultValue="allTime" 
            value={timeFrame} 
            onValueChange={(value) => setTimeFrame(value as 'allTime' | 'monthly' | 'weekly')}
            className="w-full"
          >
            <div className="flex justify-center mb-6">
              <TabsList className="bg-card/90 border border-border">
                <TabsTrigger value="allTime" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Star className="h-4 w-4 mr-1" /> All Time
                </TabsTrigger>
                <TabsTrigger value="monthly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Flame className="h-4 w-4 mr-1" /> Monthly
                </TabsTrigger>
                <TabsTrigger value="weekly" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Trophy className="h-4 w-4 mr-1" /> Weekly
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={timeFrame} className="mt-0">
              <div className="bg-card/90 backdrop-blur-sm rounded-xl border border-border p-6 neon-border">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading champions...</p>
                  </div>
                ) : topPlayers.length === 0 ? (
                  <div className="text-center py-16">
                    <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-xl text-muted-foreground mb-2">No champions yet!</p>
                    <p className="text-sm text-muted-foreground">Be the first to claim your spot in the Hall of Fame</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Top 3 Podium */}
                    {topPlayers.length >= 3 && (
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {[1, 0, 2].map((idx) => {
                          const player = topPlayers[idx];
                          if (!player) return null;
                          const isFirst = idx === 0;
                          return (
                            <div 
                              key={player.userId}
                              className={`flex flex-col items-center p-4 rounded-xl ${
                                isFirst 
                                  ? 'bg-gradient-to-b from-primary/20 to-transparent border-2 border-primary/50 order-2 -mt-4' 
                                  : idx === 1 
                                    ? 'bg-gradient-to-b from-muted/40 to-transparent border border-muted order-1'
                                    : 'bg-gradient-to-b from-accent/20 to-transparent border border-accent/30 order-3'
                              }`}
                            >
                              <div className="mb-2">{getMedalIcon(idx)}</div>
                              <Avatar className={`${isFirst ? 'h-16 w-16' : 'h-12 w-12'} border-2 ${
                                isFirst ? 'border-primary' : idx === 1 ? 'border-muted-foreground' : 'border-accent'
                              }`}>
                                {player.avatar_url && <AvatarImage src={player.avatar_url} />}
                                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                  {(player.username?.[0] || 'A').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <p className={`font-bold mt-2 ${isFirst ? 'text-lg text-primary' : 'text-foreground'}`}>
                                {player.username}
                              </p>
                              <p className={`font-mono ${isFirst ? 'text-2xl text-primary' : 'text-xl text-secondary'}`}>
                                {player.totalScore.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">{player.gamesPlayed} games</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Rest of leaderboard */}
                    {topPlayers.slice(3).map((player, idx) => (
                      <div 
                        key={player.userId}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-border"
                      >
                        <div className="w-8 flex justify-center">
                          {getMedalIcon(idx + 3)}
                        </div>
                        <Avatar className="h-10 w-10 border border-primary/50">
                          {player.avatar_url && <AvatarImage src={player.avatar_url} />}
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {(player.username?.[0] || 'A').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{player.username}</p>
                          <p className="text-xs text-muted-foreground">{player.gamesPlayed} games played</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-lg text-secondary">{player.totalScore.toLocaleString()}</p>
                          {player.bestGame && (
                            <p className="text-xs text-muted-foreground">
                              Best: {getGameEmoji(player.bestGame.game_type)} {player.bestGame.score}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default HallOfFame;
