import React from 'react';
import GameContainer from '../components/GameContainer';
import AppHeader from '../components/AppHeader';
import { GameProvider } from '../context/GameContext';
const Index: React.FC = () => {
  return <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <AppHeader />
        
        <div className="pt-14 h-screen">
          <GameContainer />
        </div>
        
        <div className="absolute bottom-2 left-0 right-0 z-50 text-center text-xs text-gray-500 py-[25px]">
          Swipe or use arrow buttons to change games
        </div>
      </div>
    </GameProvider>;
};
export default Index;