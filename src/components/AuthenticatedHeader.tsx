
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './UserMenu';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Award, Trophy, Home } from 'lucide-react';

const AuthenticatedHeader: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex items-center space-x-4">
      <Link to="/">
        <Button variant="ghost" size="sm" className="flex gap-1 items-center">
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Button>
      </Link>
      <Link to="/leaderboard">
        <Button variant="ghost" size="sm" className="flex gap-1 items-center">
          <Trophy className="h-4 w-4" />
          <span>Leaderboard</span>
        </Button>
      </Link>
      <Link to="/hall-of-fame">
        <Button variant="ghost" size="sm" className="flex gap-1 items-center">
          <Award className="h-4 w-4" />
          <span>Hall of Fame</span>
        </Button>
      </Link>
      {user && <UserMenu />}
    </div>
  );
};

export default AuthenticatedHeader;
