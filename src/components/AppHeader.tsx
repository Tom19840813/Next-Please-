
import React from 'react';

const AppHeader: React.FC = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 py-3 bg-gradient-to-r from-game-purple to-game-blue flex items-center justify-between">
      <div className="text-white text-lg font-bold">Swipe Arcade</div>
      <div className="flex gap-2">
        <span className="text-white text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
          Swipe to change games
        </span>
      </div>
    </header>
  );
};

export default AppHeader;
