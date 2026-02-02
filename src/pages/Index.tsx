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
      <div className="min-h-screen bg-background arcade-grid">
        <AppHeader />
        
        <div className="pt-14 h-screen">
          <GameContainer />
        </div>
        
        <div className="absolute bottom-20 left-0 right-0 z-50 text-center text-xs">
          <div className="inline-block bg-card/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-border shadow-lg">
            <span className="text-foreground font-medium">Swipe to switch games • New content every play</span>
          </div>
        </div>

        {/* Game Invitations */}
        <GameInvitations />

        {/* Visitor Counter */}
        <VisitorCounter />
      </div>
    </GameProvider>;
};
export default Index;