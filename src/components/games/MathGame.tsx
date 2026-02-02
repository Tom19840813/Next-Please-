import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import { Check, X } from 'lucide-react';
import DifficultySelector from '../DifficultySelector';
import { DIFFICULTY_CONFIGS } from '@/types/difficulty';

interface MathProblem {
  num1: number;
  num2: number;
  operation: string;
  answer: number;
  options: number[];
}

const operations = ['+', '-', '×', '÷'];

const MathGame: React.FC = () => {
  const { incrementScore, saveScore, difficulty, setDifficulty } = useGameContext();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameActive, setGameActive] = useState(true);
  const [streak, setStreak] = useState(0);
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);

  // Generate a random problem based on the current level and difficulty
  const generateProblem = () => {
    let num1: number, num2: number, answer: number, operation: string;
    
    const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
    // Increase difficulty based on level and selected difficulty
    const baseMax = 10 + level * 2;
    const max = Math.min(baseMax * difficultyConfig.complexity, 100);
    
    // Determine which operations to include based on level and difficulty
    let availableOps;
    if (difficultyConfig.complexity === 1) {
      availableOps = ['+', '-'];
    } else if (difficultyConfig.complexity === 2) {
      availableOps = level <= 2 ? ['+', '-'] : ['+', '-', '×'];
    } else {
      availableOps = level <= 1 ? ['+', '-'] : operations;
    }
    operation = availableOps[Math.floor(Math.random() * availableOps.length)];
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * max) + 1;
        num2 = Math.floor(Math.random() * max) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * max) + 1;
        num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive answer
        answer = num1 - num2;
        break;
      case '×':
        const multiplyMax = Math.min(12, 3 + level + difficultyConfig.complexity);
        num1 = Math.floor(Math.random() * multiplyMax) + 1;
        num2 = Math.floor(Math.random() * multiplyMax) + 1;
        answer = num1 * num2;
        break;
      case '÷':
        const divideMax = Math.min(10, 2 + level + difficultyConfig.complexity);
        num2 = Math.floor(Math.random() * divideMax) + 1;
        answer = Math.floor(Math.random() * divideMax) + 1;
        num1 = num2 * answer; // Ensure clean division
        break;
      default:
        num1 = 1;
        num2 = 1;
        answer = 2;
        operation = '+';
    }
    
    // Generate options (including the correct answer)
    const options = [answer];
    
    // Add 3 wrong answers
    while (options.length < 4) {
      let wrongAnswer: number;
      
      // Generate a wrong answer that's relatively close to the correct one
      if (operation === '+' || operation === '-') {
        wrongAnswer = answer + Math.floor(Math.random() * 10) - 5;
      } else if (operation === '×') {
        wrongAnswer = answer + Math.floor(Math.random() * (answer / 2)) - (answer / 4);
      } else { // division
        wrongAnswer = answer + Math.floor(Math.random() * 5) - 2;
      }
      
      // Ensure the wrong answer is positive and not already in options
      if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // Shuffle options
    const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
    
    return {
      num1,
      num2,
      operation,
      answer,
      options: shuffledOptions
    };
  };

  // Initialize or reset the game
  const startGame = () => {
    setLevel(1);
    setScore(0);
    setStreak(0);
    const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
    setTimeLeft(Math.round(10 * difficultyConfig.timeMultiplier));
    setProblem(generateProblem());
    setGameActive(true);
    setFeedback(null);
    setShowDifficultySelector(false);
  };

  // Check user's answer
  const checkAnswer = (selectedAnswer: number) => {
    if (!problem || !gameActive) return;
    
    const isCorrect = selectedAnswer === problem.answer;
    
    if (isCorrect) {
      // Calculate points based on time left, level, and difficulty
      const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
      const basePoints = Math.ceil(timeLeft * (level * 0.5)) + 10;
      const points = Math.round(basePoints * difficultyConfig.scoreMultiplier);
      setScore(prevScore => prevScore + points);
      incrementScore(points);
      setStreak(prevStreak => prevStreak + 1);
      setFeedback('correct');
      
      // Level up every 5 correct answers
      if ((streak + 1) % 5 === 0) {
        setLevel(prevLevel => {
          const newLevel = prevLevel + 1;
          if (newLevel % 3 === 0) {
            // Save score when reaching milestone levels
            saveScore();
          }
          return newLevel;
        });
      }
    } else {
      setFeedback('wrong');
      setStreak(0);
    }
    
    // Show feedback for a moment before moving to next problem
    setTimeout(() => {
      setFeedback(null);
      setProblem(generateProblem());
      const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
      const baseTime = Math.max(10 - Math.floor(level / 3), 5);
      setTimeLeft(Math.round(baseTime * difficultyConfig.timeMultiplier));
    }, 1000);
  };

  // Timer effect
  useEffect(() => {
    if (!gameActive || !problem) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setFeedback('wrong');
          setStreak(0);
          
          // Move to next problem after timeout
          setTimeout(() => {
            setFeedback(null);
            setProblem(generateProblem());
            const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
            const baseTime = Math.max(10 - Math.floor(level / 3), 5);
            setTimeLeft(Math.round(baseTime * difficultyConfig.timeMultiplier));
          }, 1000);
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [problem, gameActive, level]);

  // Reset to difficulty selector when difficulty changes
  useEffect(() => {
    setShowDifficultySelector(true);
  }, [difficulty]);

  if (showDifficultySelector) {
    return (
      <div className="game-card bg-card p-4">
        <DifficultySelector
          currentDifficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onStartGame={startGame}
          gameName="Math Challenge"
        />
      </div>
    );
  }

  return (
    <div className="game-card bg-card p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-foreground">Math Challenge - {DIFFICULTY_CONFIGS[difficulty].label}</h2>
        <p className="text-sm text-muted-foreground">Solve math problems quickly!</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex justify-between mb-4">
          <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
            <span className="text-sm font-semibold text-foreground">Level: {level}</span>
          </div>
          <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
            <span className="text-sm font-semibold text-foreground">Score: {score}</span>
          </div>
          <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
            <span className="text-sm font-semibold text-foreground">Time: {timeLeft}s</span>
          </div>
        </div>

        {problem && (
          <div className={`bg-card rounded-xl p-6 shadow-md border border-border ${feedback === 'correct' ? 'bg-secondary/10 border-secondary/30' : feedback === 'wrong' ? 'bg-destructive/10 border-destructive/30' : ''} transition-colors duration-300`}>
            <div className="text-4xl font-bold text-center mb-6 text-foreground">
              {problem.num1} {problem.operation} {problem.num2} = ?
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {problem.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => checkAnswer(option)}
                  className={`py-3 text-2xl font-bold rounded-lg ${
                    feedback === null
                      ? 'bg-card hover:bg-muted border border-border text-foreground'
                      : option === problem.answer
                      ? 'bg-secondary/20 border border-secondary/50 text-foreground'
                      : 'bg-card border border-border text-foreground'
                  } transition-colors`}
                  disabled={feedback !== null}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {feedback && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                feedback === 'correct' ? 'bg-muted text-foreground' : 'bg-destructive/20 text-destructive'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {feedback === 'correct' ? (
                    <>
                      <Check size={20} />
                      <span>Correct!</span>
                    </>
                  ) : (
                    <>
                      <X size={20} />
                      <span>Wrong! The answer is {problem.answer}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {!gameActive && (
          <div className="mt-4 text-center space-y-2">
            <button
              onClick={startGame}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full hover:bg-primary/90 mr-2"
            >
              Play Again
            </button>
            <button
              onClick={() => setShowDifficultySelector(true)}
              className="bg-muted text-foreground px-6 py-2 rounded-full hover:bg-accent border border-border"
            >
              Change Difficulty
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathGame;
