import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const GRID_SIZE = 20;
const CELL_SIZE = 16;
const INITIAL_SPEED = 150;

const SnakeGame: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const directionRef = useRef<Direction>('RIGHT');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  const spawnFood = useCallback((currentSnake: Position[]): Position => {
    let pos: Position;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const startGame = () => {
    const initial = [{ x: 10, y: 10 }];
    setSnake(initial);
    setFood(spawnFood(initial));
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
    setGameActive(true);
  };

  const moveSnake = useCallback(() => {
    setSnake(prev => {
      const head = { ...prev[0] };
      const dir = directionRef.current;

      if (dir === 'UP') head.y -= 1;
      if (dir === 'DOWN') head.y += 1;
      if (dir === 'LEFT') head.x -= 1;
      if (dir === 'RIGHT') head.x += 1;

      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameActive(false);
        setGameOver(true);
        return prev;
      }

      // Self collision
      if (prev.some(s => s.x === head.x && s.y === head.y)) {
        setGameActive(false);
        setGameOver(true);
        return prev;
      }

      const newSnake = [head, ...prev];

      // Eat food
      if (head.x === food.x && head.y === food.y) {
        setScore(s => {
          const newScore = s + 10;
          incrementScore(10);
          return newScore;
        });
        setFood(spawnFood(newSnake));
        setSpeed(s => Math.max(s - 5, 60));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, spawnFood, incrementScore]);

  useEffect(() => {
    if (!gameActive) {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      return;
    }
    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [gameActive, speed, moveSnake]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key;
      if ((key === 'ArrowUp' || key === 'w') && directionRef.current !== 'DOWN') { directionRef.current = 'UP'; setDirection('UP'); }
      if ((key === 'ArrowDown' || key === 's') && directionRef.current !== 'UP') { directionRef.current = 'DOWN'; setDirection('DOWN'); }
      if ((key === 'ArrowLeft' || key === 'a') && directionRef.current !== 'RIGHT') { directionRef.current = 'LEFT'; setDirection('LEFT'); }
      if ((key === 'ArrowRight' || key === 'd') && directionRef.current !== 'LEFT') { directionRef.current = 'RIGHT'; setDirection('RIGHT'); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Touch controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && directionRef.current !== 'LEFT') { directionRef.current = 'RIGHT'; setDirection('RIGHT'); }
      else if (dx < 0 && directionRef.current !== 'RIGHT') { directionRef.current = 'LEFT'; setDirection('LEFT'); }
    } else {
      if (dy > 0 && directionRef.current !== 'UP') { directionRef.current = 'DOWN'; setDirection('DOWN'); }
      else if (dy < 0 && directionRef.current !== 'DOWN') { directionRef.current = 'UP'; setDirection('UP'); }
    }
  };

  return (
    <div className="game-card bg-card p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-foreground mb-1">Snake</h2>
      <p className="text-sm text-muted-foreground mb-4">Eat food, grow longer, don't crash!</p>

      {!gameActive && !gameOver && (
        <button onClick={startGame} className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/80">
          Start Game
        </button>
      )}

      {gameOver && (
        <div className="text-center mb-4">
          <p className="text-lg font-bold text-foreground mb-1">Game Over! Score: {score}</p>
          <button onClick={startGame} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-primary/80">
            Play Again
          </button>
        </div>
      )}

      {(gameActive || gameOver) && (
        <>
          <div className="text-sm font-semibold text-foreground mb-2">Score: {score}</div>
          <div
            className="border border-border rounded bg-muted/30 relative"
            style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {snake.map((seg, i) => (
              <div
                key={i}
                className={`absolute rounded-sm ${i === 0 ? 'bg-foreground' : 'bg-foreground/60'}`}
                style={{ left: seg.x * CELL_SIZE, top: seg.y * CELL_SIZE, width: CELL_SIZE - 1, height: CELL_SIZE - 1 }}
              />
            ))}
            <div
              className="absolute rounded-full bg-primary"
              style={{ left: food.x * CELL_SIZE, top: food.y * CELL_SIZE, width: CELL_SIZE - 1, height: CELL_SIZE - 1 }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SnakeGame;
