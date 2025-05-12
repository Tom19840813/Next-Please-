
import React, { useState, useEffect } from 'react';
import AppHeader from '../components/AppHeader';
import { GameType } from '../context/GameContext';
import { GameScore, getLeaderboard, getUserBestScores } from '../services/gameScores';
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
import { useAuth } from '@/context/AuthContext';
import { Loader2, Star, Medal } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const gameLabels: Record<GameType, string> = {
  sudoku: 'Sudoku',
  tetris: 'Tetris',
  quiz: 'Quiz',
  memory: 'Memory',
  math: 'Math',
  emoji: 'Emoji Match',
  wordscramble: 'Word Scramble',
  balloons: 'Balloon Pop'
};

const Leaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameType | 'all'>('all');
  const [leaderboard, setLeaderboard] = useState<GameScore[]>([]);
  const [userScores, setUserScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const gameType = activeTab === 'all' ? undefined : activeTab as GameType;
        const scores = await getLeaderboard(gameType, 50);
        setLeaderboard(scores);
        
        if (user) {
          const uScores = await getUserBestScores(gameType);
          setUserScores(uScores);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        toast({
          title: "Error",
          description: "Failed to load leaderboard data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, user]);

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return <Medal className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Medal className="h-5 w-5 text-amber-700" />;
      default: return <span className="text-sm font-medium">{index + 1}</span>;
    }
  };

  const isUserScore = (score: GameScore) => {
    return user && score.user_id === user.id;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <AppHeader />
      
      <main className="container mx-auto px-4 pt-20 pb-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6 text-game-purple">Leaderboard</h1>
          
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as GameType | 'all')}
            className="w-full"
          >
            <div className="flex justify-center mb-6">
              <TabsList className="bg-white/70">
                <TabsTrigger value="all">All Games</TabsTrigger>
                <TabsTrigger value="sudoku">Sudoku</TabsTrigger>
                <TabsTrigger value="tetris">Tetris</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
                <TabsTrigger value="memory">Memory</TabsTrigger>
                <TabsTrigger value="math">Math</TabsTrigger>
                <TabsTrigger value="emoji">Emoji</TabsTrigger>
                <TabsTrigger value="wordscramble">Words</TabsTrigger>
                <TabsTrigger value="balloons">Balloons</TabsTrigger>
              </TabsList>
            </div>

            {user && userScores.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Your Best Scores
                </h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Game</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userScores.slice(0, 5).map((score) => (
                        <TableRow key={score.id}>
                          <TableCell className="font-medium">
                            {gameLabels[score.game_type as GameType] || score.game_type}
                          </TableCell>
                          <TableCell className="text-right">{score.score}</TableCell>
                          <TableCell className="text-right text-sm text-gray-500">
                            {new Date(score.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <TabsContent value={activeTab} className="mt-0">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-3">
                  {activeTab === 'all' ? 'Top Scores Across All Games' : `Top ${gameLabels[activeTab as GameType]} Scores`}
                </h2>
                
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-10 w-10 animate-spin text-game-purple" />
                  </div>
                ) : leaderboard.length === 0 ? (
                  <p className="text-center py-10 text-gray-500">No scores recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Rank</TableHead>
                          <TableHead>Player</TableHead>
                          {activeTab === 'all' && <TableHead>Game</TableHead>}
                          <TableHead className="text-right">Score</TableHead>
                          <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaderboard.map((score, index) => (
                          <TableRow 
                            key={score.id} 
                            className={isUserScore(score) ? "bg-purple-50" : ""}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center justify-center">
                                {getMedalEmoji(index)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-game-purple text-white text-xs">
                                    {(score.username?.[0] || 'A').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{score.username || 'Anonymous'}</span>
                                {isUserScore(score) && (
                                  <span className="text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {activeTab === 'all' && (
                              <TableCell>
                                {gameLabels[score.game_type as GameType] || score.game_type}
                              </TableCell>
                            )}
                            <TableCell className="text-right font-semibold">
                              {score.score}
                            </TableCell>
                            <TableCell className="text-right text-sm text-gray-500">
                              {new Date(score.created_at).toLocaleDateString()}
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

export default Leaderboard;
