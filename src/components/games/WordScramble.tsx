
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
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    scrambledWord: '',
    originalWord: '',
    category: '',
    timeLeft: 60,
    score: 0,
    hintsUsed: 0,
    successMessage: null,
    errorMessage: null,
    gameActive: false,
    hintsAvailable: 3
  });
  const [userGuess, setUserGuess] = useState<string>('');
  const [inputLetters, setInputLetters] = useState<string[]>([]);
  const [letterPool, setLetterPool] = useState<string[]>([]);
  const [round, setRound] = useState<number>(1);

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

  const scrambleWord = (word: string): string => {
    const array = word.split('');
    let m = array.length;
    while (m) {
      const i = Math.floor(Math.random() * m--);
      [array[m], array[i]] = [array[i], array[m]];
    }
    const scrambled = array.join('');
    return scrambled === word ? scrambleWord(word) : scrambled;
  };

  const startNewRound = () => {
    const { word, category } = generateRandomWord();
    const scrambled = scrambleWord(word);
    
    setGameState(prev => ({
      ...prev,
      scrambledWord: scrambled,
      originalWord: word,
      category,
      timeLeft: Math.max(60 - (round - 1) * 5, 30),
      successMessage: null,
      errorMessage: null,
      gameActive: true,
      hintsAvailable: 3 - prev.hintsUsed
    }));
    
    setUserGuess('');
    setLetterPool(scrambled.split(''));
    setInputLetters([]);
  };

  const startGame = () => {
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
    setGameStarted(true);
    // Need to call startNewRound after state is set
    setTimeout(() => {
      const { word, category } = generateRandomWord();
      const scrambled = scrambleWord(word);
      setGameState(prev => ({
        ...prev,
        scrambledWord: scrambled,
        originalWord: word,
        category,
        timeLeft: 60,
        gameActive: true,
      }));
      setLetterPool(scrambled.split(''));
      setInputLetters([]);
    }, 0);
  };

  const restartGame = () => {
    startGame();
  };

  const checkAnswer = () => {
    if (userGuess.toLowerCase() === gameState.originalWord.toLowerCase()) {
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
      
      setTimeout(() => {
        setRound(prev => prev + 1);
        startNewRound();
      }, 2000);
    } else {
      setGameState(prev => ({
        ...prev,
        errorMessage: "That's not correct. Try again!"
      }));
      setTimeout(() => {
        setGameState(prev => ({ ...prev, errorMessage: null }));
      }, 2000);
    }
  };

  const useHint = () => {
    if (gameState.hintsUsed >= 3) return;
    
    const unrevealedPositions = [];
    for (let i = 0; i < gameState.originalWord.length; i++) {
      if (i >= inputLetters.length || inputLetters[i] !== gameState.originalWord[i]) {
        unrevealedPositions.push(i);
      }
    }
    
    if (!unrevealedPositions.length) return;
    
    const revealPos = unrevealedPositions[Math.floor(Math.random() * unrevealedPositions.length)];
    const correctLetter = gameState.originalWord[revealPos];
    
    let newInputLetters = [...inputLetters];
    if (revealPos >= inputLetters.length) {
      while (newInputLetters.length < revealPos) {
        newInputLetters.push('');
      }
      newInputLetters.push(correctLetter);
    } else {
      newInputLetters[revealPos] = correctLetter;
    }
    
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
      score: Math.max(prev.score - 10, 0)
    }));
  };

  const selectLetter = (letter: string, index: number) => {
    const newInputLetters = [...inputLetters, letter];
    setInputLetters(newInputLetters);
    setUserGuess(newInputLetters.join(''));
    const newPool = [...letterPool];
    newPool.splice(index, 1);
    setLetterPool(newPool);
  };

  const deselectLetter = (index: number) => {
    const letter = inputLetters[index];
    const newInputLetters = [...inputLetters];
    newInputLetters.splice(index, 1);
    setInputLetters(newInputLetters);
    setUserGuess(newInputLetters.join(''));
    setLetterPool([...letterPool, letter]);
  };

  const renderCategoryBadge = () => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground border border-border`}>
        {gameState.category.charAt(0).toUpperCase() + gameState.category.slice(1)}
      </span>
    );
  };

  if (!gameStarted) {
    return (
      <div className="game-card bg-card p-4 flex flex-col items-center">
        <h2 className="text-2xl font-bold text-foreground mb-1">Word Scramble</h2>
        <p className="text-sm text-muted-foreground mb-4">Unscramble the word to score points!</p>
        <div className="flex-1 flex items-center justify-center">
          <button onClick={startGame} className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/80">
            Start Game
          </button>
        </div>
      </div>
    );
  }

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
            <span className="text-sm font-semibold text-foreground">{gameState.timeLeft}s</span>
          </div>
          <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
            <span className="text-sm font-semibold text-foreground">Round: {round}</span>
          </div>
          <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
            <span className="text-sm font-semibold text-foreground">Score: {gameState.score}</span>
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

        {!gameState.gameActive && !gameState.successMessage && gameStarted && (
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
