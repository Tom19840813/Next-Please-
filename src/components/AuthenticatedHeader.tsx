
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './UserMenu';

const AuthenticatedHeader: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex items-center space-x-4">
      {user && <UserMenu />}
    </div>
  );
};

export default AuthenticatedHeader;
