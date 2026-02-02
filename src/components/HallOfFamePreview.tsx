import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHallOfFame } from '../services/gameScores';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, Medal, ArrowRight, Loader2 } from 'lucide-react';

interface TopPlayer {
  userId: string;
  username: string;
  avatar_url: string | null;
  totalScore: number;
  gamesPlayed: number;
}

const generateRandomPlayers = (): TopPlayer[] => {
  const randomNames = ['ArcadeKing', 'PixelQueen', 'RetroMaster', 'NeonNinja', 'GameWizard'];
  return randomNames.slice(0, 3).map((name, idx) => ({
    userId: `random-${idx}`,
    username: name,
    avatar_url: null,
    totalScore: Math.floor(Math.random() * 5000) + 1000,
    gamesPlayed: Math.floor(Math.random() * 50) + 10,
  })).sort((a, b) => b.totalScore - a.totalScore);
};

const HallOfFamePreview: React.FC = () => {
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        const players = await getHallOfFame('allTime', 3);
        if (players.length === 0) {
          setTopPlayers(generateRandomPlayers());
          setIsDemo(true);
        } else {
          setTopPlayers(players.slice(0, 3));
          setIsDemo(false);
        }
      } catch (error) {
        console.error('Error fetching hall of fame:', error);
        setTopPlayers(generateRandomPlayers());
        setIsDemo(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTopPlayers();
  }, []);

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-5 w-5 text-foreground" />;
      case 1: return <Medal className="h-4 w-4 text-muted-foreground" />;
      case 2: return <Medal className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg text-foreground">Hall of Fame</CardTitle>
            {isDemo && (
              <span className="text-[10px] px-2 py-0.5 bg-primary/20 border border-primary/30 rounded-full text-primary">
                Demo
              </span>
            )}
          </div>
          <Link to="/hall-of-fame">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {topPlayers.map((player, idx) => (
              <div 
                key={player.userId}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-6 flex justify-center">
                  {getMedalIcon(idx)}
                </div>
                <Avatar className="h-8 w-8 border border-primary/30">
                  {player.avatar_url && <AvatarImage src={player.avatar_url} />}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {(player.username?.[0] || 'A').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{player.username}</p>
                  <p className="text-xs text-muted-foreground">{player.gamesPlayed} games</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-secondary">{player.totalScore.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HallOfFamePreview;
