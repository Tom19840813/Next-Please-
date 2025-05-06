
import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../../context/GameContext';
import { Timer, Star } from 'lucide-react';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  points: number;
  color: string;
  timeLeft: number; // Time before target disappears
  clicked: boolean;
}

const SpeedClick: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [level, setLevel] = useState<number>(1);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [gameStats, setGameStats] = useState<{
    targetsSpawned: number;
    targetsClicked: number;
    accuracy: number;
  }>({
    targetsSpawned: 0,
    targetsClicked: 0,
    accuracy: 0
  });
  
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Game loop using requestAnimationFrame for smooth animations
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const targetSpawnTimerRef = useRef<number>(0);
  
  // Start the game
  const startGame = () => {
    setGameActive(true);
    setTargets([]);
    setScore(0);
    setTimeLeft(30);
    setLevel(1);
    setCombo(0);
    setMaxCombo(0);
    setGameStats({
      targetsSpawned: 0,
      targetsClicked: 0,
      accuracy: 0
    });
    
    lastTimeRef.current = performance.now();
    targetSpawnTimerRef.current = 0;
    
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Main game loop
  const gameLoop = (timestamp: number) => {
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    
    // Update game state
    updateGameState(deltaTime);
    
    // Continue the loop if game is still active
    if (gameActive) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  };
  
  // Update all game state based on elapsed time
  const updateGameState = (deltaTime: number) => {
    // Update timer
    setTimeLeft(prevTime => {
      const newTime = prevTime - deltaTime / 1000;
      if (newTime <= 0) {
        endGame();
        return 0;
      }
      return newTime;
    });
    
    // Spawn new targets
    targetSpawnTimerRef.current += deltaTime;
    // Spawn rate decreases as level increases (spawns more frequently)
    const spawnRate = Math.max(1500 - (level * 150), 500);
    
    if (targetSpawnTimerRef.current >= spawnRate) {
      spawnTarget();
      targetSpawnTimerRef.current = 0;
    }
    
    // Update existing targets
    setTargets(prevTargets =>
      prevTargets.map(target => {
        // Skip if already clicked
        if (target.clicked) return target;
        
        // Reduce target time
        const newTimeLeft = target.timeLeft - deltaTime / 1000;
        
        // Remove target if time expired
        if (newTimeLeft <= 0) {
          setCombo(0); // Break combo when a target is missed
          return { ...target, timeLeft: 0, clicked: true };
        }
        
        return { ...target, timeLeft: newTimeLeft };
      })
    );
  };
  
  // End the game
  const endGame = () => {
    setGameActive(false);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    
    // Calculate final accuracy
    setGameStats(prev => ({
      ...prev,
      accuracy: prev.targetsSpawned > 0 ? (prev.targetsClicked / prev.targetsSpawned) * 100 : 0
    }));
  };
  
  // Create a new target at random position
  const spawnTarget = () => {
    if (!gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    
    // Target size decreases as level increases
    const minSize = Math.max(30 - (level * 2), 15);
    const maxSize = Math.max(60 - (level * 3), 30);
    const size = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
    
    // Target lifetime decreases as level increases
    const maxTime = Math.max(3 - (level * 0.2), 1);
    const minTime = Math.max(1.5 - (level * 0.1), 0.8);
    const timeLeft = Math.random() * (maxTime - minTime) + minTime;
    
    // Target points - smaller and shorter-lived targets are worth more
    const sizePoints = Math.floor((60 - size) / 5);
    const timePoints = Math.floor((3 - timeLeft) * 10);
    const points = Math.max(5, sizePoints + timePoints);
    
    // Target colors by points value
    let color;
    if (points < 10) color = 'bg-blue-500';
    else if (points < 15) color = 'bg-green-500';
    else if (points < 20) color = 'bg-yellow-500';
    else color = 'bg-red-500';
    
    // Padding to ensure target is fully visible
    const padding = size;
    
    // Random position within game area
    const x = Math.random() * (gameArea.width - padding * 2) + padding;
    const y = Math.random() * (gameArea.height - padding * 2) + padding;
    
    const newTarget = {
      id: Date.now(),
      x,
      y,
      size,
      points,
      color,
      timeLeft,
      clicked: false
    };
    
    setTargets(prev => [...prev, newTarget]);
    setGameStats(prev => ({
      ...prev,
      targetsSpawned: prev.targetsSpawned + 1
    }));
  };
  
  // Handle clicking on a target
  const handleTargetClick = (targetId: number) => {
    setTargets(prevTargets =>
      prevTargets.map(target => {
        if (target.id === targetId && !target.clicked) {
          // Update score
          const comboBonus = Math.floor(combo / 3) * 5;
          const totalPoints = target.points + comboBonus;
          
          setScore(prev => prev + totalPoints);
          incrementScore(totalPoints);
          
          // Update combo
          setCombo(prev => {
            const newCombo = prev + 1;
            setMaxCombo(current => Math.max(current, newCombo));
            return newCombo;
          });
          
          // Update stats
          setGameStats(prev => ({
            ...prev,
            targetsClicked: prev.targetsClicked + 1
          }));
          
          // Level up after every 10 clicked targets
          if ((gameStats.targetsClicked + 1) % 10 === 0) {
            setLevel(prev => prev + 1);
          }
          
          return { ...target, clicked: true };
        }
        return target;
      })
    );
  };
  
  // Format time to mm:ss format
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="game-card bg-gradient-to-br from-white to-indigo-50 flex flex-col">
      <div className="text-center p-4">
        <h2 className="text-2xl font-bold text-game-blue">Speed Click</h2>
        <p className="text-sm text-gray-500">Click targets as fast as you can!</p>
      </div>
      
      <div className="flex justify-between px-4 mb-2">
        <div className="px-4 py-1 bg-white rounded-full shadow flex items-center gap-2">
          <Timer size={16} />
          <span className={`text-sm font-semibold ${timeLeft < 5 && gameActive ? 'text-red-600' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        
        <div className="px-4 py-1 bg-white rounded-full shadow">
          <span className="text-sm font-semibold">Level {level}</span>
        </div>
        
        <div className="px-4 py-1 bg-white rounded-full shadow">
          <span className="text-sm font-semibold">Score: {score}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-center px-4 mb-2">
        <div className="px-4 py-1 bg-white rounded-full shadow flex items-center gap-1">
          <span className="text-xs text-gray-500">Combo:</span>
          <div className="flex">
            {[...Array(Math.min(combo, 5))].map((_, i) => (
              <Star key={i} size={14} className="text-yellow-500 fill-yellow-500" />
            ))}
            {combo > 5 && <span className="text-xs font-bold">+{combo - 5}</span>}
          </div>
        </div>
      </div>

      {!gameActive && !score && (
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={startGame}
            className="bg-game-blue hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-bold"
          >
            Start Game
          </button>
        </div>
      )}
      
      {gameActive && (
        <div 
          ref={gameAreaRef} 
          className="flex-1 relative bg-indigo-50 rounded-b-2xl overflow-hidden cursor-crosshair"
        >
          {targets.map(target => (
            !target.clicked && target.timeLeft > 0 && (
              <div
                key={target.id}
                className={`absolute rounded-full ${target.color} shadow-lg transform hover:scale-105 transition-transform cursor-pointer`}
                style={{
                  left: `${target.x - target.size/2}px`,
                  top: `${target.y - target.size/2}px`,
                  width: `${target.size}px`,
                  height: `${target.size}px`,
                  opacity: target.timeLeft > 0.5 ? 1 : target.timeLeft * 2,
                  transform: `scale(${Math.min(1, target.timeLeft * 1.5)})`,
                }}
                onClick={() => handleTargetClick(target.id)}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
                  {target.points}
                </div>
              </div>
            )
          ))}
        </div>
      )}
      
      {!gameActive && score > 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h3 className="text-xl font-bold mb-4">Game Over!</h3>
          
          <div className="w-full max-w-xs bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Final Score:</div>
              <div className="font-bold text-right">{score}</div>
              
              <div className="text-gray-600">Targets Hit:</div>
              <div className="font-bold text-right">{gameStats.targetsClicked}</div>
              
              <div className="text-gray-600">Accuracy:</div>
              <div className="font-bold text-right">{gameStats.accuracy.toFixed(1)}%</div>
              
              <div className="text-gray-600">Max Combo:</div>
              <div className="font-bold text-right">{maxCombo}</div>
              
              <div className="text-gray-600">Level Reached:</div>
              <div className="font-bold text-right">{level}</div>
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="bg-game-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SpeedClick;
