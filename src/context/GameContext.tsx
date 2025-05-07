
import React, { createContext, useContext, useState } from 'react';

export type GameType = 'sudoku' | 'tetris' | 'quiz' | 'memory' | 'math' | 'emoji' | 'wordscramble' | 'balloons';

interface GameContextType {
  currentGame: GameType;
  score: number;
  setCurrentGame: (game: GameType) => void;
  incrementScore: (points: number) => void;
  resetScore: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentGame, setCurrentGame] = useState<GameType>('sudoku');
  const [score, setScore] = useState(0);

  const incrementScore = (points: number) => {
    setScore((prevScore) => prevScore + points);
  };

  const resetScore = () => {
    setScore(0);
  };

  return (
    <GameContext.Provider
      value={{
        currentGame,
        score,
        setCurrentGame,
        incrementScore,
        resetScore
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
