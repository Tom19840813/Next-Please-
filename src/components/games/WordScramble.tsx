import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import { CheckCircle, X, Timer } from 'lucide-react';
import { generateRandomWord } from '../../utils/randomContent';

type Category = string;

interface GameState {
  scrambledWord: string;
  originalWord: string;
  category: Category;
  timeLeft: number;
  score: number;
  hintsUsed: number;
  successMessage: string | null;
  errorMessage: string | null;
  gameActive: boolean;
  hintsAvailable: number;
}

const WordScramble: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [gameState, setGameState] = useState<GameState>({
    scrambledWord: '',
    originalWord: '',
    category: '',
    timeLeft: 60,
    score: 0,
    hintsUsed: 0,
    successMessage: null,
    errorMessage: null,
    gameActive: true,
    hintsAvailable: 3
  });
  const [userGuess, setUserGuess] = useState<string>('');
  const [inputLetters, setInputLetters] = useState<string[]>([]);
  const [letterPool, setLetterPool] = useState<string[]>([]);
  const [round, setRound] = useState<number>(1);

  // Initialize game on mount
  useEffect(() => {
    startNewRound();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gameState.gameActive) return;
    
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          return {
            ...prev,
            timeLeft: 0,
            gameActive: false,
            errorMessage: "Time's up!"
          };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState.gameActive]);

  // Scramble a word
  const scrambleWord = (word: string): string => {
    // Convert to array and shuffle
    const array = word.split('');
    let m = array.length;
    
    // Fisher-Yates shuffle
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [array[m], array[i]] = [array[i], array[m]];
    }
    
    const scrambled = array.join('');
    
    // If by chance we get the same word, scramble again
    return scrambled === word ? scrambleWord(word) : scrambled;
  };

  // Start a new round with a new word
  const startNewRound = () => {
    // Get a random word and its category
    const { word, category } = generateRandomWord();
    const scrambled = scrambleWord(word);
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      scrambledWord: scrambled,
      originalWord: word,
      category,
      timeLeft: Math.max(60 - (round - 1) * 5, 30), // Reduce time as rounds progress
      successMessage: null,
      errorMessage: null,
      gameActive: true,
      hintsAvailable: 3 - prev.hintsUsed
    }));
    
    // Reset user input
    setUserGuess('');
    
    // Create letter pool from scrambled word
    setLetterPool(scrambled.split(''));
    setInputLetters([]);
  };

  // Restart the game
  const restartGame = () => {
    setRound(1);
    setGameState({
      scrambledWord: '',
      originalWord: '',
      category: '',
      timeLeft: 60,
      score: 0,
      hintsUsed: 0,
      successMessage: null,
      errorMessage: null,
      gameActive: true,
      hintsAvailable: 3
    });
    setUserGuess('');
    startNewRound();
  };

  // Check user's guess
  const checkAnswer = () => {
    if (userGuess.toLowerCase() === gameState.originalWord.toLowerCase()) {
      // Calculate points: base + time bonus + round bonus
      const basePoints = 50;
      const timeBonus = Math.floor(gameState.timeLeft / 3);
      const roundBonus = round * 10;
      const totalPoints = basePoints + timeBonus + roundBonus;
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + totalPoints,
        successMessage: `Correct! +${totalPoints} points`,
        gameActive: false
      }));
      
      incrementScore(totalPoints);
      
      // Move to next round after delay
      setTimeout(() => {
        setRound(prev => prev + 1);
        startNewRound();
      }, 2000);
    } else {
      setGameState(prev => ({
        ...prev,
        errorMessage: "That's not correct. Try again!"
      }));
      
      // Clear error after a brief delay
      setTimeout(() => {
        setGameState(prev => ({ ...prev, errorMessage: null }));
      }, 2000);
    }
  };

  // Use a hint
  const useHint = () => {
    if (gameState.hintsUsed >= 3) return;
    
    const unrevealedPositions = [];
    for (let i = 0; i < gameState.originalWord.length; i++) {
      if (i >= inputLetters.length || inputLetters[i] !== gameState.originalWord[i]) {
        unrevealedPositions.push(i);
      }
    }
    
    if (!unrevealedPositions.length) return; // Nothing to reveal
    
    // Choose a random position to reveal
    const revealPos = unrevealedPositions[Math.floor(Math.random() * unrevealedPositions.length)];
    const correctLetter = gameState.originalWord[revealPos];
    
    // Add the letter to the user's input
    let newInputLetters = [...inputLetters];
    if (revealPos >= inputLetters.length) {
      // Fill in any gaps
      while (newInputLetters.length < revealPos) {
        newInputLetters.push('');
      }
      newInputLetters.push(correctLetter);
    } else {
      newInputLetters[revealPos] = correctLetter;
    }
    
    // Remove the letter from the pool if it's there
    const letterIndex = letterPool.indexOf(correctLetter);
    if (letterIndex !== -1) {
      const newPool = [...letterPool];
      newPool.splice(letterIndex, 1);
      setLetterPool(newPool);
    }
    
    setInputLetters(newInputLetters);
    setUserGuess(newInputLetters.join(''));
    
    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
      hintsAvailable: prev.hintsAvailable - 1,
      score: Math.max(prev.score - 10, 0) // Penalty for using hint
    }));
  };

  // Handle letter selection from pool
  const selectLetter = (letter: string, index: number) => {
    // Add letter to input
    const newInputLetters = [...inputLetters, letter];
    setInputLetters(newInputLetters);
    setUserGuess(newInputLetters.join(''));
    
    // Remove letter from pool
    const newPool = [...letterPool];
    newPool.splice(index, 1);
    setLetterPool(newPool);
  };

  // Handle letter deselection (return to pool)
  const deselectLetter = (index: number) => {
    // Get the letter being removed
    const letter = inputLetters[index];
    
    // Remove from input
    const newInputLetters = [...inputLetters];
    newInputLetters.splice(index, 1);
    setInputLetters(newInputLetters);
    setUserGuess(newInputLetters.join('));
    
    // Add back to letter pool
    setLetterPool([...letterPool, letter]);
  };

  // Render the category badge
  const renderCategoryBadge = () => {
    const categoryColors: {[key: string]: string} = {
      animals: 'bg-green-100 text-green-800',
      food: 'bg-orange-100 text-orange-800',
      tech: 'bg-blue-100 text-blue-800',
      countries: 'bg-purple-100 text-purple-800' // Added for new category
    };
    
    const colorClass = categoryColors[gameState.category] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {gameState.category.charAt(0).toUpperCase() + gameState.category.slice(1)}
      </span>
    );
  };

  return (
    <div className="game-card bg-gradient-to-br from-white to-green-50 p-4 flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-game-darkpurple">Word Scramble</h2>
        <p className="text-sm text-gray-500 mb-2">Unscramble the word to score points!</p>
        {renderCategoryBadge()}
      </div>

      <div className="flex-grow flex flex-col max-w-md mx-auto w-full">
        <div className="flex justify-between mb-4">
          <div className="px-4 py-1 bg-white rounded-full shadow flex items-center gap-1">
            <Timer size={16} />
            <span className="text-sm font-semibold">
              {gameState.timeLeft}s
            </span>
          </div>
          <div className="px-4 py-1 bg-white rounded-full shadow">
            <span className="text-sm font-semibold">
              Round: {round}
            </span>
          </div>
          <div className="px-4 py-1 bg-white rounded-full shadow">
            <span className="text-sm font-semibold">
              Score: {gameState.score}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-gray-500">Scrambled Word:</p>
            <button
              onClick={useHint}
              disabled={gameState.hintsAvailable <= 0 || !gameState.gameActive}
              className={`text-xs px-3 py-1 rounded-full ${
                gameState.hintsAvailable > 0 && gameState.gameActive
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Hint ({gameState.hintsAvailable})
            </button>
          </div>
          
          <div className="text-2xl font-bold text-center mb-6 tracking-wider">
            {gameState.scrambledWord}
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Your Answer:</p>
            <div className="flex justify-center gap-2 min-h-[50px]">
              {inputLetters.map((letter, index) => (
                <div 
                  key={index}
                  className="w-8 h-10 border-2 border-purple-300 rounded flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-red-50"
                  onClick={() => gameState.gameActive && deselectLetter(index)}
                >
                  {letter}
                </div>
              ))}
              {Array.from({ length: Math.max(0, gameState.originalWord.length - inputLetters.length) }).map((_, i) => (
                <div 
                  key={`empty-${i}`}
                  className="w-8 h-10 border-2 border-dashed border-gray-300 rounded"
                ></div>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Available Letters:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {letterPool.map((letter, index) => (
                <div
                  key={index}
                  className="w-8 h-10 border-2 border-game-darkpurple bg-purple-50 rounded flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-purple-100"
                  onClick={() => gameState.gameActive && selectLetter(letter, index)}
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>
        </div>

        {gameState.gameActive && (
          <button
            onClick={checkAnswer}
            disabled={userGuess.length !== gameState.originalWord.length}
            className={`py-2 px-6 rounded-lg font-bold text-white ${
              userGuess.length === gameState.originalWord.length
                ? 'bg-game-darkpurple hover:bg-purple-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Check Answer
          </button>
        )}

        {gameState.successMessage && (
          <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center gap-2 mt-4">
            <CheckCircle size={20} />
            <p>{gameState.successMessage}</p>
          </div>
        )}

        {gameState.errorMessage && (
          <div className="bg-red-100 text-red-800 p-3 rounded-lg flex items-center gap-2 mt-4">
            <X size={20} />
            <p>{gameState.errorMessage}</p>
          </div>
        )}

        {!gameState.gameActive && !gameState.successMessage && (
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold mb-2">Game Over!</p>
            <p className="mb-3">The word was: <span className="font-bold">{gameState.originalWord}</span></p>
            <button
              onClick={restartGame}
              className="bg-game-darkpurple text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordScramble;
