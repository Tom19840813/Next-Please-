
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import { Check, X } from 'lucide-react';

interface MathProblem {
  num1: number;
  num2: number;
  operation: string;
  answer: number;
  options: number[];
}

const operations = ['+', '-', '×', '÷'];

const MathGame: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameActive, setGameActive] = useState(true);
  const [streak, setStreak] = useState(0);

  // Generate a random problem based on the current level
  const generateProblem = () => {
    let num1: number, num2: number, answer: number, operation: string;
    
    // Increase difficulty based on level
    const max = Math.min(10 + level * 2, 50);
    
    // Determine which operations to include based on level
    const availableOps = level <= 2 ? ['+', '-'] : operations;
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
        num1 = Math.floor(Math.random() * Math.min(12, 5 + level)) + 1;
        num2 = Math.floor(Math.random() * Math.min(12, 5 + level)) + 1;
        answer = num1 * num2;
        break;
      case '÷':
        num2 = Math.floor(Math.random() * Math.min(10, 3 + level)) + 1;
        answer = Math.floor(Math.random() * Math.min(10, 3 + level)) + 1;
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
    setTimeLeft(10);
    setProblem(generateProblem());
    setGameActive(true);
    setFeedback(null);
  };

  // Check user's answer
  const checkAnswer = (selectedAnswer: number) => {
    if (!problem || !gameActive) return;
    
    const isCorrect = selectedAnswer === problem.answer;
    
    if (isCorrect) {
      // Calculate points based on time left and level
      const points = Math.ceil(timeLeft * (level * 0.5)) + 10;
      setScore(prevScore => prevScore + points);
      incrementScore(points);
      setStreak(prevStreak => prevStreak + 1);
      setFeedback('correct');
      
      // Level up every 5 correct answers
      if ((streak + 1) % 5 === 0) {
        setLevel(prevLevel => prevLevel + 1);
      }
    } else {
      setFeedback('wrong');
      setStreak(0);
    }
    
    // Show feedback for a moment before moving to next problem
    setTimeout(() => {
      setFeedback(null);
      setProblem(generateProblem());
      setTimeLeft(Math.max(10 - Math.floor(level / 3), 5)); // Reduce time as levels progress
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
            return Math.max(10 - Math.floor(level / 3), 5);
          }, 1000);
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [problem, gameActive, level]);

  // Start the game on first render
  useEffect(() => {
    startGame();
  }, []);

  return (
    <div className="game-card bg-gradient-to-br from-white to-blue-50 p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-game-blue">Impress your Math</h2>
        <p className="text-sm text-gray-500">Solve math problems quickly!</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex justify-between mb-4">
          <div className="px-4 py-1 bg-white rounded-full shadow">
            <span className="text-sm font-semibold">Level: {level}</span>
          </div>
          <div className="px-4 py-1 bg-white rounded-full shadow">
            <span className="text-sm font-semibold">Score: {score}</span>
          </div>
          <div className="px-4 py-1 bg-white rounded-full shadow">
            <span className="text-sm font-semibold">Time: {timeLeft}s</span>
          </div>
        </div>

        {problem && (
          <div className={`bg-white rounded-xl p-6 shadow-md ${feedback === 'correct' ? 'bg-green-50' : feedback === 'wrong' ? 'bg-red-50' : ''} transition-colors duration-300`}>
            <div className="text-4xl font-bold text-center mb-6">
              {problem.num1} {problem.operation} {problem.num2} = ?
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {problem.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => checkAnswer(option)}
                  className={`py-3 text-2xl font-bold rounded-lg ${
                    feedback === null
                      ? 'bg-white hover:bg-blue-50 border border-blue-200'
                      : option === problem.answer
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-white border border-gray-200'
                  } transition-colors`}
                  disabled={feedback !== null}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {feedback && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                feedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
          <div className="mt-4 text-center">
            <button
              onClick={startGame}
              className="bg-game-blue text-white px-6 py-2 rounded-full hover:bg-blue-600"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathGame;
