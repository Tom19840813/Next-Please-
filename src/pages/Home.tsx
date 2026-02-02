import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GameDifficultyModal from '@/components/GameDifficultyModal';
import OnlineUsers from '@/components/OnlineUsers';
import GameInvitations from '@/components/GameInvitations';
import ProBadge from '@/components/ProBadge';
import HallOfFamePreview from '@/components/HallOfFamePreview';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  Gamepad2, 
  Brain, 
  Zap, 
  Grid3X3, 
  Users, 
  Trophy,
  Calculator,
  Smile,
  Type,
  Circle,
  Crown,
  Sparkles
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const [selectedGame, setSelectedGame] = useState<{id: string; title: string; color: string} | null>(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);

  const games = [
    {
      id: 'sudoku',
      title: 'Sudoku',
      description: 'Classic number puzzle game',
      icon: Grid3X3,
      color: 'hsl(0 0% 25%)'
    },
    {
      id: 'tetris',
      title: 'Tetris',
      description: 'Stack falling blocks perfectly',
      icon: Gamepad2,
      color: 'hsl(0 0% 30%)'
    },
    {
      id: 'quiz',
      title: 'Quiz',
      description: 'Test your knowledge',
      icon: Brain,
      color: 'hsl(0 0% 35%)'
    },
    {
      id: 'memory',
      title: 'Memory',
      description: 'Match pairs of cards',
      icon: Users,
      color: 'hsl(0 0% 40%)'
    },
    {
      id: 'math',
      title: 'Math Game',
      description: 'Quick arithmetic challenges',
      icon: Calculator,
      color: 'hsl(0 0% 25%)'
    },
    {
      id: 'emoji',
      title: 'Emoji Match',
      description: 'Find matching emoji pairs',
      icon: Smile,
      color: 'hsl(0 0% 30%)'
    },
    {
      id: 'wordscramble',
      title: 'Word Scramble',
      description: 'Unscramble the letters',
      icon: Type,
      color: 'hsl(0 0% 35%)'
    },
    {
      id: 'balloons',
      title: 'Balloon Pop',
      description: 'Pop balloons as fast as you can',
      icon: Circle,
      color: 'hsl(0 0% 40%)'
    }
  ];

  return (
    <div className="min-h-screen bg-background arcade-grid">
      {/* Header */}
      <header className="bg-card/90 backdrop-blur-sm border-b border-border shadow-lg">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground neon-text">Next Please!</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                {isPro && <ProBadge size="sm" />}
                <Link to="/leaderboard">
                  <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted">
                    <Trophy className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Leaderboard</span>
                  </Button>
                </Link>
                {!isPro && (
                  <Link to="/upgrade">
                    <Button size="sm" className="bg-primary text-primary-foreground">
                      <Crown className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Go Pro</span>
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-primary text-foreground hover:bg-primary hover:text-primary-foreground">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <h2 className="text-4xl font-bold text-foreground">Choose Your Game</h2>
            <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">
            Select a game to start playing. All games feature random content each time!
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <Card 
                key={game.id} 
                className="group bg-card/80 backdrop-blur-sm border-border hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1"
              >
                <CardHeader className="text-center">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-transform duration-300 group-hover:scale-110 neon-border"
                    style={{ backgroundColor: game.color }}
                  >
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg text-foreground">{game.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30 transition-all"
                    onClick={() => setSelectedGame({ id: game.id, title: game.title, color: game.color })}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hall of Fame Preview */}
        <div className="mb-12 max-w-md mx-auto">
          <HallOfFamePreview />
        </div>

        {/* Call to Action */}
        <div className="text-center bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-8">
          <h3 className="text-2xl font-bold text-foreground mb-3">Ready to Play?</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Jump into any game and start having fun! {user ? 'Your scores will be saved automatically.' : 'Sign in to save your scores and compete on the leaderboard.'}
          </p>
          <Link to="/play">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl">
              <Gamepad2 className="h-5 w-5 mr-2" />
              Start Playing
            </Button>
          </Link>
        </div>
      </main>

      {/* Game Difficulty Modal */}
      {selectedGame && (
        <GameDifficultyModal
          gameId={selectedGame.id}
          gameName={selectedGame.title}
          gameColor={selectedGame.color}
          isOpen={!!selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}

      {/* Game Invitations */}
      <GameInvitations />

      {/* Online Users Panel */}
      {user && showOnlineUsers && (
        <div className="fixed top-20 right-4 z-50">
          <OnlineUsers onClose={() => setShowOnlineUsers(false)} />
        </div>
      )}

      {/* Online Users Toggle Button */}
      {user && (
        <Button
          onClick={() => setShowOnlineUsers(!showOnlineUsers)}
          className="fixed bottom-16 right-4 z-40 rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
          size="icon"
        >
          <Users className="h-6 w-6" />
        </Button>
      )}

    </div>
  );
};

export default Home;
