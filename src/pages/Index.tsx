import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import GameContainer from '../components/GameContainer';
import AppHeader from '../components/AppHeader';
import VisitorCounter from '../components/VisitorCounter';
import GameInvitations from '../components/GameInvitations';
import { GameProvider } from '../context/GameContext';
import { GameType } from '../context/GameContext';
import { DifficultyLevel } from '@/types/difficulty';
const Index: React.FC = () => {
  const { gameId } = useParams<{ gameId?: string }>();
  const [searchParams] = useSearchParams();
  const initialGame = (gameId as GameType) || 'sudoku';
  const initialDifficulty = (searchParams.get('difficulty') as DifficultyLevel) || 'medium';
  
  return <GameProvider initialGame={initialGame} initialDifficulty={initialDifficulty}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <AppHeader />
        
        <div className="pt-14 h-screen">
          <GameContainer />
        </div>
        
        <div className="absolute bottom-2 left-0 right-0 z-50 text-center text-xs text-gray-500 py-[25px]">
          Swipe or use arrow buttons to change games • All games feature random content each time you play
        </div>

        {/* Game Invitations */}
        <GameInvitations />

        {/* Visitor Counter */}
        <VisitorCounter />
      </div>
    </GameProvider>;
};
export default Index;