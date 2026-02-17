import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameContext } from '../../context/GameContext';

const PADS = [
  { id: 0, activeClass: 'bg-foreground', baseClass: 'bg-foreground/20' },
  { id: 1, activeClass: 'bg-foreground/80', baseClass: 'bg-foreground/15' },
  { id: 2, activeClass: 'bg-foreground/60', baseClass: 'bg-foreground/10' },
  { id: 3, activeClass: 'bg-foreground/90', baseClass: 'bg-muted' },
];

const SimonSays: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [round, setRound] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flashPad = useCallback((padId: number, duration = 400): Promise<void> => {
    return new Promise(resolve => {
      setActivePad(padId);
      setTimeout(() => {
        setActivePad(null);
        setTimeout(resolve, 150);
      }, duration);
    });
  }, []);

  const showSequence = useCallback(async (seq: number[]) => {
    setIsShowingSequence(true);
    await new Promise(r => setTimeout(r, 500));
    for (const padId of seq) {
      await flashPad(padId);
    }
    setIsShowingSequence(false);
    setPlayerIndex(0);
  }, [flashPad]);

  const addToSequence = useCallback(() => {
    const next = Math.floor(Math.random() * 4);
    setSequence(prev => {
      const newSeq = [...prev, next];
      showSequence(newSeq);
      return newSeq;
    });
    setRound(r => r + 1);
  }, [showSequence]);

  const startGame = () => {
    setSequence([]);
    setPlayerIndex(0);
    setScore(0);
    setRound(0);
    setGameOver(false);
    setGameActive(true);
    // Start first round after a beat
    setTimeout(() => {
      const first = Math.floor(Math.random() * 4);
      const seq = [first];
      setSequence(seq);
      setRound(1);
      showSequence(seq);
    }, 600);
  };

  const handlePadClick = async (padId: number) => {
    if (!gameActive || isShowingSequence) return;

    await flashPad(padId, 200);

    if (padId !== sequence[playerIndex]) {
      // Wrong!
      setGameActive(false);
      setGameOver(true);
      setBestScore(b => Math.max(b, score));
      incrementScore(score);
      return;
    }

    const points = 10 + round * 2;
    setScore(s => s + points);

    if (playerIndex + 1 === sequence.length) {
      // Completed the sequence — add next
      setTimeout(addToSequence, 800);
    } else {
      setPlayerIndex(i => i + 1);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  return (
    <div className="game-card bg-card p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-foreground mb-1">Simon Says</h2>
      <p className="text-sm text-muted-foreground mb-4">Repeat the pattern from memory!</p>

      {!gameActive && !gameOver && (
        <div className="flex-1 flex items-center justify-center">
          <button onClick={startGame} className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/80">
            Start Game
          </button>
        </div>
      )}

      {(gameActive || gameOver) && (
        <div className="flex-1 flex flex-col items-center gap-4 w-full max-w-xs">
          <div className="flex justify-between w-full text-sm">
            <div className="px-3 py-1 bg-card rounded-full border border-border font-semibold text-foreground">
              Round {round}
            </div>
            <div className="px-3 py-1 bg-card rounded-full border border-border font-semibold text-foreground">
              Score: {score}
            </div>
          </div>

          {isShowingSequence && (
            <p className="text-sm text-muted-foreground animate-pulse">Watch the pattern...</p>
          )}
          {!isShowingSequence && gameActive && (
            <p className="text-sm text-muted-foreground">Your turn! Repeat the pattern.</p>
          )}

          <div className="grid grid-cols-2 gap-3 w-full">
            {PADS.map(pad => (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.id)}
                disabled={isShowingSequence || !gameActive}
                className={`aspect-square rounded-2xl border-2 border-border transition-all duration-150
                  ${activePad === pad.id ? `${pad.activeClass} scale-95` : `${pad.baseClass} hover:opacity-80`}
                  ${isShowingSequence || !gameActive ? 'cursor-default' : 'cursor-pointer active:scale-95'}
                `}
              />
            ))}
          </div>

          {gameOver && (
            <div className="text-center mt-4">
              <h3 className="text-lg font-bold text-foreground mb-1">Wrong Pattern!</h3>
              <p className="text-sm text-muted-foreground mb-1">You reached round {round} with {score} points</p>
              {bestScore > 0 && <p className="text-xs text-muted-foreground mb-3">Best: {bestScore}</p>}
              <button onClick={startGame} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-primary/80">
                Play Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimonSays;
