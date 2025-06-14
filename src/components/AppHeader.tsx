
import React from 'react';
import { Link } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from './ui/button';
import { Home, Trophy, Award } from 'lucide-react';
import UserMenu from './UserMenu';

const AppHeader: React.FC = () => {
  const { score } = useGameContext();
  const { user } = useAuth();
  
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 py-3 bg-gradient-to-r from-game-purple to-game-blue flex items-center justify-between">
      <Link to="/">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 text-lg font-bold">
          <Home className="h-4 w-4 mr-2" />
          Next Please!
        </Button>
      </Link>
      
      <div className="flex gap-2 items-center">
        <span className="text-white text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
          8 Games
        </span>
        <span className="hidden sm:block text-white text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
          Swipe to change games
        </span>
        
        {user && (
          <>
            <Link to="/leaderboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Trophy className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Leaderboard</span>
              </Button>
            </Link>
            <Link to="/hall-of-fame">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <Award className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Hall of Fame</span>
              </Button>
            </Link>
            <UserMenu />
          </>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
