import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../context/GameContext';
import { Timer } from 'lucide-react';

const WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'pack', 'judge',
  'river', 'flame', 'ghost', 'pixel', 'orbit', 'spark', 'bloom', 'swift', 'crane', 'frost',
  'brave', 'dream', 'light', 'stone', 'cloud', 'sword', 'ocean', 'tower', 'magic', 'storm',
  'quest', 'blaze', 'lunar', 'solar', 'nexus', 'prism', 'shade', 'ember', 'vault', 'drift',
  'algorithm', 'keyboard', 'function', 'variable', 'database', 'network', 'browser', 'compile',
  'abstract', 'platform', 'sequence', 'terminal', 'protocol', 'generate', 'overflow', 'dynamic',
];

const generateSentence = (): string => {
  const count = 5 + Math.floor(Math.random() * 4);
  return Array.from({ length: count }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ');
};

const TypingGame: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalChars, setTotalChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);

  const startGame = () => {
    setCurrentText(generateSentence());
    setUserInput('');
    setScore(0);
    setTimeLeft(30);
    setWpm(0);
    setWordsTyped(0);
    setAccuracy(100);
    setTotalChars(0);
    setCorrectChars(0);
    setGameOver(false);
    setGameActive(true);
    startTimeRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 100);
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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    // Track accuracy
    let correct = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === currentText[i]) correct++;
    }
    setTotalChars(prev => prev + 1);
    setCorrectChars(prev => prev + (value[value.length - 1] === currentText[value.length - 1] ? 1 : 0));

    // Check if completed
    if (value === currentText) {
      const points = Math.max(10, Math.floor(currentText.length / 2));
      setScore(prev => prev + points);
      setWordsTyped(prev => prev + currentText.split(' ').length);
      
      // Calculate WPM
      const elapsed = (Date.now() - startTimeRef.current) / 60000;
      if (elapsed > 0) {
        setWpm(Math.round((wordsTyped + currentText.split(' ').length) / elapsed));
      }

      setCurrentText(generateSentence());
      setUserInput('');
    }

    // Update accuracy
    if (totalChars > 0) {
      setAccuracy(Math.round((correctChars / totalChars) * 100));
    }
  };

  return (
    <div className="game-card bg-card p-4 flex flex-col">
      <h2 className="text-2xl font-bold text-foreground text-center mb-1">Typing Speed</h2>
      <p className="text-sm text-muted-foreground text-center mb-4">Type as fast and accurately as you can!</p>

      {!gameActive && !gameOver && (
        <div className="flex-1 flex items-center justify-center">
          <button onClick={startGame} className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/80">
            Start Game
          </button>
        </div>
      )}

      {gameActive && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1 px-3 py-1 bg-card rounded-full border border-border">
              <Timer size={14} className="text-foreground" />
              <span className={`font-semibold ${timeLeft < 10 ? 'text-destructive' : 'text-foreground'}`}>{timeLeft}s</span>
            </div>
            <div className="px-3 py-1 bg-card rounded-full border border-border font-semibold text-foreground">{wpm} WPM</div>
            <div className="px-3 py-1 bg-card rounded-full border border-border font-semibold text-foreground">{score} pts</div>
          </div>

          <div className="bg-muted/30 rounded-xl p-4 border border-border font-mono text-lg leading-relaxed">
            {currentText.split('').map((char, i) => {
              let className = 'text-muted-foreground';
              if (i < userInput.length) {
                className = userInput[i] === char ? 'text-foreground' : 'text-destructive underline';
              } else if (i === userInput.length) {
                className = 'text-foreground bg-foreground/20 rounded';
              }
              return <span key={i} className={className}>{char}</span>;
            })}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInput}
            className="w-full bg-card border border-border rounded-lg px-4 py-3 text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="Start typing..."
            autoFocus
          />
        </div>
      )}

      {gameOver && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <h3 className="text-xl font-bold text-foreground">Time's Up!</h3>
          <div className="bg-card rounded-lg border border-border p-4 w-full max-w-xs">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Score:</span>
              <span className="text-right font-bold text-foreground">{score}</span>
              <span className="text-muted-foreground">WPM:</span>
              <span className="text-right font-bold text-foreground">{wpm}</span>
              <span className="text-muted-foreground">Accuracy:</span>
              <span className="text-right font-bold text-foreground">{accuracy}%</span>
              <span className="text-muted-foreground">Words:</span>
              <span className="text-right font-bold text-foreground">{wordsTyped}</span>
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

export default TypingGame;
