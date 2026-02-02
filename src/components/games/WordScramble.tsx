
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
    setUserGuess(newInputLetters.join(''));  // Fixed: Added closing quote and parenthesis
    
    // Add back to letter pool
    setLetterPool([...letterPool, letter]);
  };

  // Render the category badge
  const renderCategoryBadge = () => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border`}>
        {gameState.category.charAt(0).toUpperCase() + gameState.category.slice(1)}
      </span>
    );
  };

  return (
    <div className="game-card bg-card p-4 flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-foreground">Word Scramble</h2>
        <p className="text-sm text-muted-foreground mb-2">Unscramble the word to score points!</p>
        {renderCategoryBadge()}
      </div>

      <div className="flex-grow flex flex-col max-w-md mx-auto w-full">
        <div className="flex justify-between mb-4">
          <div className="px-4 py-1 bg-card rounded-full shadow border border-border flex items-center gap-1">
            <Timer size={16} className="text-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {gameState.timeLeft}s
            </span>
          </div>
          <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
            <span className="text-sm font-semibold text-foreground">
              Round: {round}
            </span>
          </div>
          <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
            <span className="text-sm font-semibold text-foreground">
              Score: {gameState.score}
            </span>
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-md mb-4 border border-border">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-muted-foreground">Scrambled Word:</p>
            <button
              onClick={useHint}
              disabled={gameState.hintsAvailable <= 0 || !gameState.gameActive}
              className={`text-xs px-3 py-1 rounded-full ${
                gameState.hintsAvailable > 0 && gameState.gameActive
                  ? 'bg-primary/20 text-primary hover:bg-primary/30'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              Hint ({gameState.hintsAvailable})
            </button>
          </div>
          
          <div className="text-2xl font-bold text-center mb-6 tracking-wider text-foreground">
            {gameState.scrambledWord}
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Your Answer:</p>
            <div className="flex justify-center gap-2 min-h-[50px]">
              {inputLetters.map((letter, index) => (
                <div 
                  key={index}
                  className="w-8 h-10 border-2 border-primary/50 rounded flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-destructive/10 text-foreground bg-card"
                  onClick={() => gameState.gameActive && deselectLetter(index)}
                >
                  {letter}
                </div>
              ))}
              {Array.from({ length: Math.max(0, gameState.originalWord.length - inputLetters.length) }).map((_, i) => (
                <div 
                  key={`empty-${i}`}
                  className="w-8 h-10 border-2 border-dashed border-border rounded"
                ></div>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Available Letters:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {letterPool.map((letter, index) => (
                <div
                  key={index}
                  className="w-8 h-10 border-2 border-foreground bg-muted rounded flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-accent text-foreground"
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
            className={`py-2 px-6 rounded-lg font-bold ${
              userGuess.length === gameState.originalWord.length
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Check Answer
          </button>
        )}

        {gameState.successMessage && (
          <div className="bg-muted text-foreground p-3 rounded-lg flex items-center gap-2 mt-4 border border-border">
            <CheckCircle size={20} />
            <p>{gameState.successMessage}</p>
          </div>
        )}

        {gameState.errorMessage && (
          <div className="bg-destructive/20 text-destructive p-3 rounded-lg flex items-center gap-2 mt-4">
            <X size={20} />
            <p>{gameState.errorMessage}</p>
          </div>
        )}

        {!gameState.gameActive && !gameState.successMessage && (
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold mb-2 text-foreground">Game Over!</p>
            <p className="mb-3 text-muted-foreground">The word was: <span className="font-bold text-foreground">{gameState.originalWord}</span></p>
            <button
              onClick={restartGame}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
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
