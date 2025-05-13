
import React, { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
import { getUserBestScores } from '../services/gameScores';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Medal } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TopPlayer {
  userId: string;
  username: string;
  totalScore: number;
  gamesPlayed: number;
  bestGame?: {
    game_type: string;
    score: number;
  };
}

const HallOfFame: React.FC = () => {
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [timeFrame, setTimeFrame] = useState<'allTime' | 'monthly' | 'weekly'>('allTime');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTopPlayers = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch aggregated data from the server
        // For now, we'll simulate this using the existing API
        const scores = await getUserBestScores();
        
        // Group by user and calculate totals
        const playerMap = new Map<string, TopPlayer>();
        
        scores.forEach(score => {
          if (!score.user_id) return;
          
          if (!playerMap.has(score.user_id)) {
            playerMap.set(score.user_id, {
              userId: score.user_id,
              username: 'Anonymous', // Default username
              totalScore: 0,
              gamesPlayed: 0,
              bestGame: undefined
            });
          }
          
          const player = playerMap.get(score.user_id)!;
          player.totalScore += score.score;
          player.gamesPlayed += 1;
          
          // Track best game
          if (!player.bestGame || score.score > player.bestGame.score) {
            player.bestGame = {
              game_type: score.game_type,
              score: score.score
            };
          }
        });
        
        // Convert to array and sort by total score
        const sortedPlayers = Array.from(playerMap.values())
          .sort((a, b) => b.totalScore - a.totalScore)
          .slice(0, 20);
          
        setTopPlayers(sortedPlayers);
      } catch (error) {
        console.error('Error fetching hall of fame data:', error);
        toast({
          title: "Error",
          description: "Failed to load hall of fame data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopPlayers();
  }, [timeFrame, toast]);

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return <Medal className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Medal className="h-5 w-5 text-amber-700" />;
      default: return <span className="text-sm font-medium">{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <AppHeader />
      
      <main className="container mx-auto px-4 pt-20 pb-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6 text-game-purple">Hall of Fame</h1>
          
          <Tabs 
            defaultValue="allTime" 
            value={timeFrame} 
            onValueChange={(value) => setTimeFrame(value as 'allTime' | 'monthly' | 'weekly')}
            className="w-full"
          >
            <div className="flex justify-center mb-6">
              <TabsList className="bg-white/70">
                <TabsTrigger value="allTime">All Time</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={timeFrame} className="mt-0">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-3">
                  {timeFrame === 'allTime' ? 'All-Time Champions' : 
                   timeFrame === 'monthly' ? 'Monthly Champions' : 'Weekly Champions'}
                </h2>
                
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-game-purple" />
                  </div>
                ) : topPlayers.length === 0 ? (
                  <p className="text-center py-10 text-gray-500">No players found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Rank</TableHead>
                          <TableHead>Player</TableHead>
                          <TableHead className="text-right">Total Score</TableHead>
                          <TableHead className="text-right">Games Played</TableHead>
                          <TableHead>Best Game</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topPlayers.map((player, index) => (
                          <TableRow key={player.userId}>
                            <TableCell className="font-medium">
                              <div className="flex items-center justify-center">
                                {getMedalEmoji(index)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-game-purple text-white text-xs">
                                    {(player.username?.[0] || 'A').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{player.username || 'Anonymous'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {player.totalScore.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {player.gamesPlayed}
                            </TableCell>
                            <TableCell>
                              {player.bestGame ? `${player.bestGame.game_type} (${player.bestGame.score})` : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
