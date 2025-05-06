
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

const questions: Question[] = [
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
  },
  {
    question: "What year did the first iPhone release?",
    options: ["2005", "2006", "2007", "2008"],
    correctAnswer: 2
  },
  {
    question: "Which of these is NOT a primary color?",
    options: ["Red", "Blue", "Green", "Yellow"],
    correctAnswer: 3
  },
  {
    question: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2
  },
  {
    question: "What's the fastest land animal?",
    options: ["Lion", "Cheetah", "Gazelle", "Leopard"],
    correctAnswer: 1
  },
  {
    question: "Which ocean is the largest?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctAnswer: 3
  }
];

const QuizGame: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);

  // Initialize quiz with shuffled questions
  useEffect(() => {
    startQuiz();
  }, []);

  // Timer for each question
  useEffect(() => {
    if (isAnswered || quizComplete) return;

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
  }, [isAnswered, quizComplete, currentQuestionIndex]);

  const startQuiz = () => {
    // Shuffle the questions array
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    // Take the first 5 questions
    setAvailableQuestions(shuffled.slice(0, 5));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizComplete(false);
    setCorrectAnswers(0);
    setTimeLeft(15);
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
      incrementScore(10); // Add points for correct answer
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
      setTimeLeft(15);
    } else {
      // Quiz complete
      setQuizComplete(true);
      incrementScore(correctAnswers * 20); // Bonus points for completing the quiz
    }
  };

  // Render current question or results screen
  const renderContent = () => {
    if (quizComplete) {
      return (
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Quiz Complete!</h3>
          <p className="text-lg mb-4">
            You got {correctAnswers} out of {availableQuestions.length} questions correct!
          </p>
          <button
            className="bg-game-pink text-white px-6 py-2 rounded-lg hover:bg-pink-600"
            onClick={startQuiz}
          >
            Play Again
          </button>
        </div>
      );
    }

    if (availableQuestions.length === 0) {
      return <div>Loading questions...</div>;
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

  return (
    <div className="game-card bg-gradient-to-br from-white to-pink-50 p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-game-pink">Quick Quiz</h2>
        <p className="text-sm text-gray-500">Test your knowledge!</p>
      </div>
      
      <div className="max-w-md mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default QuizGame;
