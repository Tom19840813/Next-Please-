
import React from 'react';
import { Link } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from './ui/button';
import { Home, Trophy, Award, Crown } from 'lucide-react';
import UserMenu from './UserMenu';
import ProBadge from './ProBadge';

const AppHeader: React.FC = () => {
  const { score } = useGameContext();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 py-3 bg-card/95 backdrop-blur-sm border-b border-border flex items-center justify-between">
      <Link to="/">
        <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted text-lg font-bold neon-text">
          <Home className="h-4 w-4 mr-2" />
          Next Please!
        </Button>
      </Link>
      
      <div className="flex gap-2 items-center">
        <span className="text-foreground text-sm bg-muted px-3 py-1 rounded-full border border-border">
          8 Games
        </span>
        <span className="hidden sm:block text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full border border-border">
          Swipe to change games
        </span>
        
        {user && (
          <>
            {isPro && <ProBadge size="sm" />}
            {!isPro && (
              <Link to="/upgrade">
                <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted border border-primary/50">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline ml-1">Go Pro</span>
                </Button>
              </Link>
            )}
            <Link to="/leaderboard">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted">
                <Trophy className="h-4 w-4 text-secondary" />
                <span className="hidden sm:inline ml-1">Leaderboard</span>
              </Button>
            </Link>
            <Link to="/hall-of-fame">
              <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted">
                <Award className="h-4 w-4 text-accent" />
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
