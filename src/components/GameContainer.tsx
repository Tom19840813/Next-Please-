import React, { useState, lazy, Suspense } from 'react';
import { GameType, useGameContext } from '../context/GameContext';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const SudokuGame = lazy(() => import('./games/SudokuGame'));
const TetrisGame = lazy(() => import('./games/TetrisGame'));
const QuizGame = lazy(() => import('./games/QuizGame'));
const MemoryGame = lazy(() => import('./games/MemoryGame'));
const MathGame = lazy(() => import('./games/MathGame'));
const EmojiMatch = lazy(() => import('./games/EmojiMatch'));
const WordScramble = lazy(() => import('./games/WordScramble'));
const BalloonPop = lazy(() => import('./games/BalloonPop'));
const SnakeGame = lazy(() => import('./games/SnakeGame'));
const TypingGame = lazy(() => import('./games/TypingGame'));
const ColorMatch = lazy(() => import('./games/ColorMatch'));
const WhackAMole = lazy(() => import('./games/WhackAMole'));
const SimonSays = lazy(() => import('./games/SimonSays'));


const GAMES: GameType[] = ['sudoku', 'tetris', 'quiz', 'memory', 'math', 'emoji', 'wordscramble', 'balloons', 'snake', 'typing', 'colormatch', 'whackamole', 'simon'];

const GameContainer: React.FC = () => {
  const { currentGame, setCurrentGame } = useGameContext();
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


      <div className={`w-full h-full ${transitioning ? 'animate-slide-out-left' : 'animate-fade-in'}`}>
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>}>
          {renderCurrentGame()}
        </Suspense>
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
