import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../context/GameContext';
import { Timer } from 'lucide-react';

const GRID = 9; // 3x3
const MOLE_SHOW_MIN = 600;
const MOLE_SHOW_MAX = 1200;

const WhackAMole: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [activeMoles, setActiveMoles] = useState<Set<number>>(new Set());
  const [whackedMoles, setWhackedMoles] = useState<Set<number>>(new Set());
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [level, setLevel] = useState(1);
  const moleTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const spawnTimer = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setHits(0);
    setMisses(0);
    setLevel(1);
    setActiveMoles(new Set());
    setWhackedMoles(new Set());
    setGameOver(false);
    setGameActive(true);
  };

  // Timer
  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(false);
          setGameOver(true);
          incrementScore(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive, score, incrementScore]);

  // Level up
  useEffect(() => {
    if (!gameActive) return;
    const t = setTimeout(() => setLevel(l => Math.min(l + 1, 5)), 8000);
    return () => clearTimeout(t);
  }, [level, gameActive]);

  // Spawn moles
  useEffect(() => {
    if (!gameActive) return;

    const spawn = () => {
      const hole = Math.floor(Math.random() * GRID);
      setActiveMoles(prev => {
        const next = new Set(prev);
        next.add(hole);
        return next;
      });

      // Auto-hide after a duration
      const hideDelay = Math.max(MOLE_SHOW_MIN, MOLE_SHOW_MAX - level * 100);
      const hideTimer = setTimeout(() => {
        setActiveMoles(prev => {
          const next = new Set(prev);
          if (next.has(hole)) {
            setMisses(m => m + 1);
            next.delete(hole);
          }
          return next;
        });
        setWhackedMoles(prev => { const n = new Set(prev); n.delete(hole); return n; });
      }, hideDelay);

      moleTimers.current.set(hole, hideTimer);

      const nextSpawn = Math.max(400, 1000 - level * 120);
      spawnTimer.current = setTimeout(spawn, nextSpawn);
    };

    spawnTimer.current = setTimeout(spawn, 500);

    return () => {
      if (spawnTimer.current) clearTimeout(spawnTimer.current);
      moleTimers.current.forEach(t => clearTimeout(t));
      moleTimers.current.clear();
    };
  }, [gameActive, level]);

  const whack = (hole: number) => {
    if (!activeMoles.has(hole) || whackedMoles.has(hole)) return;

    setWhackedMoles(prev => { const n = new Set(prev); n.add(hole); return n; });
    setActiveMoles(prev => { const n = new Set(prev); n.delete(hole); return n; });
    
    const points = 10 + level * 2;
    setScore(s => s + points);
    setHits(h => h + 1);

    // Clear the auto-hide timer
    const t = moleTimers.current.get(hole);
    if (t) { clearTimeout(t); moleTimers.current.delete(hole); }

    // Clear whacked visual
    setTimeout(() => {
      setWhackedMoles(prev => { const n = new Set(prev); n.delete(hole); return n; });
    }, 200);
  };

  return (
    <div className="game-card bg-card p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-foreground mb-1">Whack-a-Mole</h2>
      <p className="text-sm text-muted-foreground mb-4">Whack the moles before they hide!</p>

      {!gameActive && !gameOver && (
        <div className="flex-1 flex items-center justify-center">
          <button onClick={startGame} className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/80">
            Start Game
          </button>
        </div>
      )}

      {gameActive && (
        <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="flex justify-between w-full text-sm">
            <div className="flex items-center gap-1 px-3 py-1 bg-card rounded-full border border-border">
              <Timer size={14} />
              <span className={`font-semibold ${timeLeft < 10 ? 'text-destructive' : 'text-foreground'}`}>{timeLeft}s</span>
            </div>
            <div className="px-3 py-1 bg-card rounded-full border border-border font-semibold text-foreground">Lvl {level}</div>
            <div className="px-3 py-1 bg-card rounded-full border border-border font-semibold text-foreground">{score}</div>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            {Array.from({ length: GRID }, (_, i) => (
              <button
                key={i}
                onClick={() => whack(i)}
                className={`aspect-square rounded-xl border-2 flex items-center justify-center text-3xl transition-all duration-100
                  ${whackedMoles.has(i) 
                    ? 'bg-foreground/20 border-foreground/30 scale-95' 
                    : activeMoles.has(i) 
                      ? 'bg-foreground/10 border-foreground/40 hover:bg-foreground/20 cursor-pointer' 
                      : 'bg-muted/30 border-border'
                  }`}
              >
                {activeMoles.has(i) && !whackedMoles.has(i) && '🐹'}
                {whackedMoles.has(i) && '💥'}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h3 className="text-xl font-bold text-foreground">Time's Up!</h3>
          <div className="bg-card rounded-lg border border-border p-4 w-full max-w-xs">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Score:</span>
              <span className="text-right font-bold text-foreground">{score}</span>
              <span className="text-muted-foreground">Hits:</span>
              <span className="text-right font-bold text-foreground">{hits}</span>
              <span className="text-muted-foreground">Missed:</span>
              <span className="text-right font-bold text-foreground">{misses}</span>
              <span className="text-muted-foreground">Accuracy:</span>
              <span className="text-right font-bold text-foreground">{hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0}%</span>
            </div>
          </div>
          <button onClick={startGame} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-primary/80">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default WhackAMole;
