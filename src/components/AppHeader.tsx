import React from 'react';
import { useGameContext } from '../context/GameContext';
const AppHeader: React.FC = () => {
  const {
    score
  } = useGameContext();
  return <header className="absolute top-0 left-0 right-0 z-50 px- py-3 bg-gradient-to-r from-game-purple to-game-blue flex items-center justify-between">
      <div className="text-white text-lg font-bold mx-0">Next Please!</div>
      <div className="flex gap-2 items-center">
        <span className="text-white text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
          8 Games
        </span>
        <span className="hidden sm:block text-white text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
          Swipe to change games
        </span>
      </div>
    </header>;
};
export default AppHeader;