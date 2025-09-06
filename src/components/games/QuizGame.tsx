import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import { fetchRandomTrivia } from '../../utils/randomContent';
import { Loader2 } from 'lucide-react';
import DifficultySelector from '../DifficultySelector';
import { DIFFICULTY_CONFIGS } from '@/types/difficulty';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const QuizGame: React.FC = () => {
  const { incrementScore, saveScore, difficulty, setDifficulty } = useGameContext();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);

  // Initialize quiz with fresh random questions
  useEffect(() => {
    startQuiz();
  }, []);

  // Timer for each question
  useEffect(() => {
    if (isAnswered || quizComplete || loading) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered, quizComplete, currentQuestionIndex, loading]);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    setShowDifficultySelector(false);
    
    try {
      // Fetch more questions for higher difficulties
      const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
      const questionCount = Math.round(5 * difficultyConfig.complexity);
      const questions = await fetchRandomTrivia(questionCount);
      
      if (questions.length === 0) {
        setError("Couldn't load questions. Using backup questions.");
        // Use backup questions in case API fails
        useBackupQuestions();
      } else {
        setAvailableQuestions(questions);
      }
    } catch (err) {
      setError("Couldn't load questions. Using backup questions.");
      useBackupQuestions();
    } finally {
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setQuizComplete(false);
      setCorrectAnswers(0);
      const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
      setTimeLeft(Math.round(15 * difficultyConfig.timeMultiplier));
      setLoading(false);
    }
  };

  const useBackupQuestions = () => {
    // Backup questions in case API fails
    const backupQuestions: Question[] = [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswer: 2
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1
      },
      {
        question: "What is the largest mammal?",
        options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        correctAnswer: 1
      },
      {
        question: "How many elements are in the periodic table?",
        options: ["92", "108", "118", "120"],
        correctAnswer: 2
      },
      {
        question: "Which of these is NOT a programming language?",
        options: ["Java", "Python", "Cobra", "Selenium"],
        correctAnswer: 3
      }
    ];
    
    // Shuffle the backup questions
    const shuffled = [...backupQuestions].sort(() => 0.5 - Math.random());
    setAvailableQuestions(shuffled);
  };

  const handleTimeout = () => {
    setIsAnswered(true);
    
    setTimeout(() => {
      moveToNextQuestion();
    }, 1500);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    
    // Check if correct
    const currentQuestion = availableQuestions[currentQuestionIndex];
    if (answerIndex === currentQuestion.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
      const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
      const points = Math.round(10 * difficultyConfig.scoreMultiplier);
      incrementScore(points); // Add points for correct answer
    }
    
    // Wait before moving to next question
    setTimeout(() => {
      moveToNextQuestion();
    }, 1500);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < availableQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
      setTimeLeft(Math.round(15 * difficultyConfig.timeMultiplier));
    } else {
      // Quiz complete
      setQuizComplete(true);
      const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
      const bonusPoints = Math.round(correctAnswers * 20 * difficultyConfig.scoreMultiplier);
      incrementScore(bonusPoints); // Bonus points for completing the quiz
      saveScore(); // Save the score to the database when quiz is completed
    }
  };

  // Render current question or results screen
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <Loader2 className="animate-spin h-8 w-8 text-game-pink mb-2" />
          <p>Loading questions...</p>
        </div>
      );
    }

    if (quizComplete) {
      return (
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Quiz Complete!</h3>
          <p className="text-lg mb-4">
            You got {correctAnswers} out of {availableQuestions.length} questions correct!
          </p>
          <div className="space-y-2">
            <button
              className="bg-game-pink text-white px-6 py-2 rounded-lg hover:bg-pink-600 mr-2"
              onClick={startQuiz}
            >
              Play Again
            </button>
            <button
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              onClick={() => setShowDifficultySelector(true)}
            >
              Change Difficulty
            </button>
          </div>
        </div>
      );
    }

    if (availableQuestions.length === 0) {
      return (
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Failed to load questions."}</p>
          <button
            className="bg-game-pink text-white px-6 py-2 rounded-lg hover:bg-pink-600"
            onClick={startQuiz}
          >
            Try Again
          </button>
        </div>
      );
    }

    const currentQuestion = availableQuestions[currentQuestionIndex];

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm">Question {currentQuestionIndex + 1}/{availableQuestions.length}</span>
          <span className={`px-3 py-1 rounded-full text-white font-bold ${timeLeft < 5 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}>
            {timeLeft}s
          </span>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mb-4">
          <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
          
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`w-full text-left p-3 rounded-lg border transition-colors
                  ${selectedAnswer === index 
                    ? index === currentQuestion.correctAnswer 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-red-100 border-red-500' 
                    : isAnswered && index === currentQuestion.correctAnswer 
                      ? 'bg-green-100 border-green-500' 
                      : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {isAnswered && (
          <div className={`p-3 rounded-lg text-center ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {selectedAnswer === currentQuestion.correctAnswer 
              ? 'Correct! Well done!' 
              : `Wrong. The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswer]}`}
          </div>
        )}
      </div>
    );
  };

  if (showDifficultySelector) {
    return (
      <div className="game-card bg-gradient-to-br from-white to-pink-50 p-4">
        <DifficultySelector
          currentDifficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onStartGame={startQuiz}
          gameName="Quick Quiz"
        />
      </div>
    );
  }

  return (
    <div className="game-card bg-gradient-to-br from-white to-pink-50 p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-game-pink">Quick Quiz - {DIFFICULTY_CONFIGS[difficulty].label}</h2>
        <p className="text-sm text-gray-500">Test your knowledge!</p>
      </div>
      
      <div className="max-w-md mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default QuizGame;
