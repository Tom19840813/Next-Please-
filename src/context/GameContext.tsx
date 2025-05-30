
import React, { createContext, useContext, useState } from 'react';
import { saveGameScore } from '../services/gameScores';

export type GameType = 'sudoku' | 'tetris' | 'quiz' | 'memory' | 'math' | 'emoji' | 'wordscramble' | 'balloons';

interface GameContextType {
  currentGame: GameType;
  score: number;
  setCurrentGame: (game: GameType) => void;
  incrementScore: (points: number) => void;
  resetScore: () => void;
  saveScore: () => Promise<void>;
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
  
  const saveScore = async () => {
    if (score <= 0) return;
    
    try {
      await saveGameScore(currentGame, score);
    } catch (error) {
      console.error("Failed to save score:", error);
    }
  };

  return (
    <GameContext.Provider
      value={{
        currentGame,
        score,
        setCurrentGame,
        incrementScore,
        resetScore,
        saveScore
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
