import React, { useState, useEffect } from 'react';
import SudokuGame from './games/SudokuGame';
import TetrisGame from './games/TetrisGame';
import QuizGame from './games/QuizGame';
import MemoryGame from './games/MemoryGame';
import MathGame from './games/MathGame';
import EmojiMatch from './games/EmojiMatch';
import WordScramble from './games/WordScramble';
import SpeedClick from './games/SpeedClick';
import { GameType, useGameContext } from '../context/GameContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
const GAMES: GameType[] = ['sudoku', 'tetris', 'quiz', 'memory', 'math', 'emoji', 'wordscramble', 'speedclick'];
const GameContainer: React.FC = () => {
  const {
    currentGame,
    setCurrentGame,
    score
  } = useGameContext();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      navigateToNextGame();
    } else if (isRightSwipe) {
      navigateToPreviousGame();
    }
  };
  const navigateToNextGame = () => {
    if (transitioning) return;
    const currentIndex = GAMES.indexOf(currentGame);
    const nextIndex = (currentIndex + 1) % GAMES.length;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentGame(GAMES[nextIndex]);
      setTransitioning(false);
    }, 300);
  };
  const navigateToPreviousGame = () => {
    if (transitioning) return;
    const currentIndex = GAMES.indexOf(currentGame);
    const prevIndex = (currentIndex - 1 + GAMES.length) % GAMES.length;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentGame(GAMES[prevIndex]);
      setTransitioning(false);
    }, 300);
  };
  const renderCurrentGame = () => {
    switch (currentGame) {
      case 'sudoku':
        return <SudokuGame />;
      case 'tetris':
        return <TetrisGame />;
      case 'quiz':
        return <QuizGame />;
      case 'memory':
        return <MemoryGame />;
      case 'math':
        return <MathGame />;
      case 'emoji':
        return <EmojiMatch />;
      case 'wordscramble':
        return <WordScramble />;
      case 'speedclick':
        return <SpeedClick />;
      default:
        return <div>Game not found</div>;
    }
  };
  return <div className="relative w-full h-full overflow-hidden" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="absolute top-4 left-4 z-50 bg-white bg-opacity-80 px-3 rounded-full text-game-purple font-bold py-[4px]">
        Score: {score}
      </div>

      <div className={`w-full h-full ${transitioning ? 'animate-slide-out-left' : 'animate-fade-in'}`}>
        {renderCurrentGame()}
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-50">
        {GAMES.map((game, index) => <div key={game} className={`h-2 w-2 rounded-full ${currentGame === game ? 'bg-game-purple' : 'bg-gray-300'}`} />)}
      </div>
      
      <button onClick={navigateToPreviousGame} className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 hover:bg-opacity-80 p-2 rounded-full z-40" aria-label="Previous game">
        <ChevronLeft className="text-game-purple" />
      </button>
      
      <button onClick={navigateToNextGame} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-60 hover:bg-opacity-80 p-2 rounded-full z-40" aria-label="Next game">
        <ChevronRight className="text-game-purple" />
      </button>
    </div>;
};
export default GameContainer;