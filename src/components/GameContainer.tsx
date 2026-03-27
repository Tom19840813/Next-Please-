import React, { useState, useEffect } from 'react';
import SudokuGame from './games/SudokuGame';
import TetrisGame from './games/TetrisGame';
import QuizGame from './games/QuizGame';
import MemoryGame from './games/MemoryGame';
import MathGame from './games/MathGame';
import EmojiMatch from './games/EmojiMatch';
import WordScramble from './games/WordScramble';
import BalloonPop from './games/BalloonPop';
import SnakeGame from './games/SnakeGame';
import TypingGame from './games/TypingGame';
import ColorMatch from './games/ColorMatch';
import WhackAMole from './games/WhackAMole';
import SimonSays from './games/SimonSays';
import { GameType, useGameContext } from '../context/GameContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GAMES: GameType[] = ['sudoku', 'tetris', 'quiz', 'memory', 'math', 'emoji', 'wordscramble', 'balloons', 'snake', 'typing', 'colormatch', 'whackamole', 'simon'];

const GameContainer: React.FC = () => {
  const { currentGame, setCurrentGame, score } = useGameContext();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) navigateToNextGame();
    else if (distance < -minSwipeDistance) navigateToPreviousGame();
  };

  const navigateToNextGame = () => {
    if (transitioning) return;
    const nextIndex = (GAMES.indexOf(currentGame) + 1) % GAMES.length;
    setTransitioning(true);
    setTimeout(() => { setCurrentGame(GAMES[nextIndex]); setTransitioning(false); }, 300);
  };

  const navigateToPreviousGame = () => {
    if (transitioning) return;
    const prevIndex = (GAMES.indexOf(currentGame) - 1 + GAMES.length) % GAMES.length;
    setTransitioning(true);
    setTimeout(() => { setCurrentGame(GAMES[prevIndex]); setTransitioning(false); }, 300);
  };

  const renderCurrentGame = () => {
    switch (currentGame) {
      case 'sudoku': return <SudokuGame />;
      case 'tetris': return <TetrisGame />;
      case 'quiz': return <QuizGame />;
      case 'memory': return <MemoryGame />;
      case 'math': return <MathGame />;
      case 'emoji': return <EmojiMatch />;
      case 'wordscramble': return <WordScramble />;
      case 'balloons': return <BalloonPop />;
      case 'snake': return <SnakeGame />;
      case 'typing': return <TypingGame />;
      case 'colormatch': return <ColorMatch />;
      case 'whackamole': return <WhackAMole />;
      case 'simon': return <SimonSays />;
      default: return <div>Game not found</div>;
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="absolute top-4 left-4 z-50 glass px-3 rounded-full text-primary font-bold py-1 text-sm">
        Score: {score}
      </div>

      <div className={`w-full h-full ${transitioning ? 'animate-slide-out-left' : 'animate-fade-in'}`}>
        {renderCurrentGame()}
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-50">
        {GAMES.map((game) => (
          <div key={game} className={`h-2 w-2 rounded-full transition-colors ${currentGame === game ? 'bg-primary neon-glow-cyan' : 'bg-muted'}`} />
        ))}
      </div>
      
      <button onClick={navigateToPreviousGame} className="absolute left-2 top-1/2 -translate-y-1/2 glass hover:neon-glow-cyan p-2 rounded-full z-40 transition-all" aria-label="Previous game">
        <ChevronLeft className="text-primary" />
      </button>
      
      <button onClick={navigateToNextGame} className="absolute right-2 top-1/2 -translate-y-1/2 glass hover:neon-glow-cyan p-2 rounded-full z-40 transition-all" aria-label="Next game">
        <ChevronRight className="text-primary" />
      </button>
    </div>
  );
};

export default GameContainer;
