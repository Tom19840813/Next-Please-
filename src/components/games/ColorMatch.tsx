import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../context/GameContext';
import { Timer } from 'lucide-react';

const COLORS = [
  { name: 'RED', hsl: 'hsl(0, 70%, 55%)' },
  { name: 'BLUE', hsl: 'hsl(220, 70%, 55%)' },
  { name: 'GREEN', hsl: 'hsl(140, 60%, 45%)' },
  { name: 'YELLOW', hsl: 'hsl(50, 80%, 55%)' },
  { name: 'PURPLE', hsl: 'hsl(280, 60%, 55%)' },
  { name: 'ORANGE', hsl: 'hsl(30, 80%, 55%)' },
];

const ColorMatch: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [displayWord, setDisplayWord] = useState('');
  const [displayColor, setDisplayColor] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(false); // true = match, false = no match
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [correct, setCorrect] = useState(0);

  const generateRound = () => {
    const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const isMatch = Math.random() > 0.5;
    const inkColor = isMatch ? wordColor : COLORS.filter(c => c.name !== wordColor.name)[Math.floor(Math.random() * (COLORS.length - 1))];
    
    setDisplayWord(wordColor.name);
    setDisplayColor(inkColor.hsl);
    setCorrectAnswer(isMatch);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setStreak(0);
    setBestStreak(0);
    setRounds(0);
    setCorrect(0);
    setGameOver(false);
    setGameActive(true);
    generateRound();
  };

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

  const handleAnswer = (userSaysMatch: boolean) => {
    setRounds(r => r + 1);
    if (userSaysMatch === correctAnswer) {
      const points = 10 + Math.min(streak * 2, 20);
      setScore(s => s + points);
      setStreak(s => {
        const ns = s + 1;
        setBestStreak(b => Math.max(b, ns));
        return ns;
      });
      setCorrect(c => c + 1);
    } else {
      setScore(s => Math.max(0, s - 5));
      setStreak(0);
    }
    generateRound();
  };

  return (
    <div className="game-card bg-card p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-foreground mb-1">Color Match</h2>
      <p className="text-sm text-muted-foreground mb-4">Does the word match its color?</p>

      {!gameActive && !gameOver && (
        <div className="flex-1 flex items-center justify-center">
          <button onClick={startGame} className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/80">
            Start Game
          </button>
        </div>
      )}

      {gameActive && (
        <div className="flex-1 flex flex-col items-center gap-6 w-full max-w-sm">
          <div className="flex justify-between w-full text-sm">
            <div className="flex items-center gap-1 px-3 py-1 bg-card rounded-full border border-border">
              <Timer size={14} />
              <span className={`font-semibold ${timeLeft < 10 ? 'text-destructive' : 'text-foreground'}`}>{timeLeft}s</span>
            </div>
            <div className="px-3 py-1 bg-card rounded-full border border-border font-semibold text-foreground">
              {streak > 1 && `🔥 ${streak}x `}Score: {score}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <span className="text-6xl font-black tracking-wider" style={{ color: displayColor }}>
              {displayWord}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">Does the <b>word</b> match the <b>ink color</b>?</p>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 py-4 rounded-xl border-2 border-foreground/20 bg-card text-foreground font-bold text-lg hover:bg-foreground hover:text-background transition-all"
            >
              ✓ Match
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 py-4 rounded-xl border-2 border-foreground/20 bg-card text-foreground font-bold text-lg hover:bg-foreground hover:text-background transition-all"
            >
              ✗ No Match
            </button>
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
              <span className="text-muted-foreground">Accuracy:</span>
              <span className="text-right font-bold text-foreground">{rounds > 0 ? Math.round((correct / rounds) * 100) : 0}%</span>
              <span className="text-muted-foreground">Best Streak:</span>
              <span className="text-right font-bold text-foreground">{bestStreak}</span>
              <span className="text-muted-foreground">Rounds:</span>
              <span className="text-right font-bold text-foreground">{rounds}</span>
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

export default ColorMatch;
