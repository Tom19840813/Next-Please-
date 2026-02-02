
import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../context/GameContext';
import { Timer } from 'lucide-react';

interface Balloon {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
  points: number;
  type: 'normal' | 'bonus' | 'bomb';
}

const BalloonPop: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [combo, setCombo] = useState(0);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const lastBalloonRef = useRef<number>(0);
  
  // Colors for grayscale theme
  const balloonColors = [
    'bg-foreground/80 text-background',
    'bg-foreground/60 text-background',
    'bg-foreground/70 text-background',
    'bg-muted-foreground text-background',
    'bg-foreground/50 text-background',
    'bg-foreground/90 text-background',
  ];

  // Start the game
  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setLevel(1);
    setGameActive(true);
    setBalloons([]);
    setCombo(0);
    lastBalloonRef.current = Date.now();
  };

  // Game timer effect
  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive]);

  // End the game
  const endGame = () => {
    setGameActive(false);
    cancelAnimationFrame(frameRef.current);
    incrementScore(score);
  };

  // Manage difficulty based on level
  useEffect(() => {
    if (!gameActive) return;
    
    // Increase level every 15 seconds
    const levelTimer = setTimeout(() => {
      if (gameActive) {
        setLevel(prev => Math.min(prev + 1, 5));
      }
    }, 15000);
    
    return () => clearTimeout(levelTimer);
  }, [level, gameActive]);

  // Animation loop for balloon movement
  useEffect(() => {
    if (!gameActive || !gameAreaRef.current) return;

    const gameArea = gameAreaRef.current;
    const gameAreaHeight = gameArea.clientHeight;
    
    const animate = () => {
      // Move existing balloons
      setBalloons(prev => prev
        .map(balloon => ({
          ...balloon,
          y: balloon.y - balloon.speed,
        }))
        // Remove balloons that have floated off screen
        .filter(balloon => balloon.y + balloon.size > 0)
      );
      
      // Add new balloons based on level
      const now = Date.now();
      const spawnInterval = Math.max(1000 - level * 150, 300); // Decreases with level
      
      if (now - lastBalloonRef.current > spawnInterval) {
        lastBalloonRef.current = now;
        
        const gameAreaWidth = gameArea.clientWidth;
        
        // Random balloon properties
        const size = Math.floor(Math.random() * 20) + 40; // 40-60px
        const speed = Math.random() * (0.5 + level * 0.3) + 1; // Increases with level
        const x = Math.random() * (gameAreaWidth - size);
        
        // Determine balloon type (with probabilities)
        let type: 'normal' | 'bonus' | 'bomb' = 'normal';
        const typeDraw = Math.random();
        if (typeDraw > 0.95) type = 'bomb';
        else if (typeDraw > 0.85) type = 'bonus';
        
        // Points based on size (smaller = more points)
        const basePoints = Math.floor((60 - size) / 5) + 5;
        const points = type === 'bonus' ? basePoints * 2 : basePoints;
        
        // Random color from palette
        const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
        
        // Add new balloon
        setBalloons(prev => [...prev, {
          id: `balloon-${now}-${Math.random()}`,
          x,
          y: gameAreaHeight,
          size,
          speed,
          color,
          points,
          type
        }]);
      }
      
      frameRef.current = requestAnimationFrame(animate);
    };
    
    frameRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(frameRef.current);
  }, [gameActive, level]);

  // Handle balloon click
  const popBalloon = (id: string, balloonType: 'normal' | 'bonus' | 'bomb', points: number) => {
    setBalloons(prev => prev.filter(balloon => balloon.id !== id));
    
    // Handle different balloon types
    if (balloonType === 'bomb') {
      setScore(prev => Math.max(prev - 20, 0));
      setCombo(0);
      return;
    }
    
    // Update combo
    setCombo(prev => prev + 1);
    if (comboTimer) clearTimeout(comboTimer);
    
    // Reset combo after 1.5 seconds of no pops
    const timer = setTimeout(() => setCombo(0), 1500);
    setComboTimer(timer);
    
    // Calculate points with combo multiplier
    const comboMultiplier = Math.min(1 + combo * 0.1, 2); // Max 2x multiplier
    const comboPoints = Math.floor(points * comboMultiplier);
    
    // Add bonus time for bonus balloons
    if (balloonType === 'bonus') {
      setTimeLeft(prev => Math.min(prev + 5, 60));
    }
    
    // Update score
    setScore(prev => prev + comboPoints);
  };

  return (
    <div className="game-card bg-card p-4 flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-foreground">Balloon Pop</h2>
        <p className="text-sm text-muted-foreground">Pop balloons to score points! Avoid the bombs.</p>
      </div>

      {!gameActive && score === 0 && (
        <div className="flex flex-col items-center justify-center flex-grow">
          <p className="mb-4 text-center text-foreground">Pop as many balloons as you can in 60 seconds!</p>
          <button
            onClick={startGame}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-bold hover:bg-primary/80 transition-colors"
          >
            Start Game
          </button>
        </div>
      )}

      {!gameActive && score > 0 && (
        <div className="flex flex-col items-center justify-center flex-grow">
          <h3 className="text-xl font-bold mb-2 text-foreground">Game Over!</h3>
          <p className="text-lg mb-1 text-foreground">Final Score: <span className="font-bold">{score}</span></p>
          <p className="mb-4 text-muted-foreground">You reached level {level}!</p>
          <button
            onClick={startGame}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/80 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {gameActive && (
        <>
          <div className="flex justify-between mb-4">
            <div className="px-4 py-1 bg-card rounded-full shadow border border-border flex items-center gap-1">
              <Timer size={16} className="text-foreground" />
              <span className="text-sm font-semibold text-foreground">{timeLeft}s</span>
            </div>
            <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
              <span className="text-sm font-semibold text-foreground">Level: {level}</span>
            </div>
            <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
              <span className="text-sm font-semibold text-foreground">Score: {score}</span>
            </div>
          </div>

          {combo > 1 && (
            <div className="absolute top-16 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold animate-pulse-light z-10">
              {combo}x Combo!
            </div>
          )}

          <div 
            ref={gameAreaRef}
            className="flex-grow relative bg-muted/30 rounded-xl overflow-hidden border border-border"
            style={{ minHeight: "300px" }}
          >
            {balloons.map((balloon) => (
              <button
                key={balloon.id}
                onClick={() => popBalloon(balloon.id, balloon.type, balloon.points)}
                className={`absolute rounded-full flex items-center justify-center cursor-pointer transform hover:scale-105 transition-transform ${
                  balloon.type === 'normal' ? balloon.color :
                  balloon.type === 'bonus' ? 'bg-secondary text-secondary-foreground' : 'bg-destructive text-destructive-foreground'
                }`}
                style={{
                  width: `${balloon.size}px`,
                  height: `${balloon.size}px`,
                  left: `${balloon.x}px`,
                  bottom: `${balloon.y}px`,
                }}
                aria-label={`Pop ${balloon.type} balloon`}
              >
                {balloon.type === 'bomb' && '💣'}
                {balloon.type === 'bonus' && '+5s'}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BalloonPop;
