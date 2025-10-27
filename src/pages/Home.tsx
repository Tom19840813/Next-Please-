
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GameDifficultyModal from '@/components/GameDifficultyModal';
import VisitorCounter from '@/components/VisitorCounter';
import OnlineUsers from '@/components/OnlineUsers';
import GameInvitations from '@/components/GameInvitations';
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
  Award
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<{id: string; title: string; color: string} | null>(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);

  const games = [
    {
      id: 'sudoku',
      title: 'Sudoku',
      description: 'Classic number puzzle game',
      icon: Grid3X3,
      color: '#3B82F6'
    },
    {
      id: 'tetris',
      title: 'Tetris',
      description: 'Stack falling blocks perfectly',
      icon: Gamepad2,
      color: '#8B5CF6'
    },
    {
      id: 'quiz',
      title: 'Quiz',
      description: 'Test your knowledge',
      icon: Brain,
      color: '#22C55E'
    },
    {
      id: 'memory',
      title: 'Memory',
      description: 'Match pairs of cards',
      icon: Users,
      color: '#EC4899'
    },
    {
      id: 'math',
      title: 'Math Game',
      description: 'Quick arithmetic challenges',
      icon: Calculator,
      color: '#F97316'
    },
    {
      id: 'emoji',
      title: 'Emoji Match',
      description: 'Find matching emoji pairs',
      icon: Smile,
      color: '#EAB308'
    },
    {
      id: 'wordscramble',
      title: 'Word Scramble',
      description: 'Unscramble the letters',
      icon: Type,
      color: '#6366F1'
    },
    {
      id: 'balloons',
      title: 'Balloon Pop',
      description: 'Pop balloons as fast as you can',
      icon: Circle,
      color: '#EF4444'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-game-purple to-game-blue text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Next Please!</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/leaderboard">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Trophy className="h-4 w-4 mr-1" />
                    Leaderboard
                  </Button>
                </Link>
                <Link to="/hall-of-fame">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Award className="h-4 w-4 mr-1" />
                    Hall of Fame
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Game</h2>
          <p className="text-gray-600">Select a game to start playing. All games feature random content each time!</p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
                    style={{ backgroundColor: game.color }}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
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

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">Ready to Play?</h3>
          <p className="text-gray-600 mb-4">
            Jump into any game and start having fun! {user ? 'Your scores will be saved automatically.' : 'Sign in to save your scores and compete on the leaderboard.'}
          </p>
          <Link to="/play">
            <Button size="lg" className="bg-game-purple hover:bg-game-purple/90">
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
          className="fixed bottom-20 right-4 z-40 rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <Users className="h-6 w-6" />
        </Button>
      )}

      {/* Visitor Counter */}
      <VisitorCounter />
    </div>
  );
};

export default Home;
