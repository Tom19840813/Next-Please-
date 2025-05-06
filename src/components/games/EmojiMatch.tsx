
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Different emoji set from the memory game
const emojis = ['😀', '🤣', '😍', '😎', '🤔', '😴', '🥳', '😱', '🤯', '🥺'];

const EmojiMatch: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60); // 60 second time limit
  const [gameActive, setGameActive] = useState<boolean>(true);

  // Initialize game on first render
  useEffect(() => {
    initializeGame();
  }, []);

  // Timer
  useEffect(() => {
    if (!gameActive) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive]);

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match found
        setCards(currentCards => 
          currentCards.map(card => 
            card.id === firstId || card.id === secondId 
              ? { ...card, isMatched: true } 
              : card
          )
        );
        setMatchedPairs(prev => prev + 1);
        
        // More points for faster matches
        const timeBonus = Math.floor(timeLeft / 10) + 1;
        incrementScore(25 * timeBonus); 
        setFlippedCards([]);
      } else {
        // No match, flip the cards back after a delay
        setTimeout(() => {
          setCards(currentCards => 
            currentCards.map(card => 
              card.id === firstId || card.id === secondId 
                ? { ...card, isFlipped: false } 
                : card
            )
          );
          setFlippedCards([]);
        }, 800);
      }

      setMoves(prev => prev + 1);
    }
  }, [flippedCards]);

  // Check if game is complete
  useEffect(() => {
    if (matchedPairs === emojis.length) {
      setGameComplete(true);
      setGameActive(false);
      
      // Bonus points based on remaining time and efficiency
      const timeBonus = timeLeft * 5;
      const efficiencyBonus = Math.max(200 - (moves - emojis.length) * 10, 0);
      incrementScore(timeBonus + efficiencyBonus);
    }
  }, [matchedPairs]);

  const initializeGame = () => {
    // Create pairs of cards with emojis
    const cardPairs = [...emojis, ...emojis].map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false
    }));
    
    // Shuffle the cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameComplete(false);
    setTimeLeft(60);
    setGameActive(true);
  };

  const handleCardClick = (id: number) => {
    // Ignore clicks if game is over or already two cards flipped
    if (!gameActive || flippedCards.length === 2) return;
    
    // If the card is already matched or flipped, ignore click
    const clickedCard = cards.find(card => card.id === id);
    if (clickedCard?.isMatched || clickedCard?.isFlipped) return;
    
    // Flip the card
    setCards(currentCards => 
      currentCards.map(card => 
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );
    
    // Add the card to flippedCards
    setFlippedCards(prev => [...prev, id]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="game-card bg-gradient-to-br from-white to-pink-50 p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-game-pink">Emoji Match</h2>
        <p className="text-sm text-gray-500">Match all the emoji pairs before time runs out!</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex justify-between mb-4">
          <div className="px-4 py-1 bg-white rounded-full shadow">
            <span className="text-sm font-semibold">
              Pairs: {matchedPairs}/{emojis.length}
            </span>
          </div>
          <div className="px-4 py-1 bg-white rounded-full shadow">
            <span className="text-sm font-semibold">
              Moves: {moves}
            </span>
          </div>
          <div className={`px-4 py-1 rounded-full shadow ${timeLeft < 10 && gameActive ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-white'}`}>
            <span className="text-sm font-semibold">
              Time: {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {cards.map(card => (
            <div
              key={card.id}
              className={`aspect-square flex items-center justify-center text-2xl rounded-lg cursor-pointer transition-transform duration-300 ${
                card.isFlipped || card.isMatched 
                  ? 'bg-white shadow-md rotate-y-180' 
                  : 'bg-game-pink text-transparent rotate-y-0'
              } ${card.isFlipped && !card.isMatched ? 'animate-pulse-light' : ''}`}
              onClick={() => handleCardClick(card.id)}
              style={{ perspective: '1000px' }}
            >
              {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
            </div>
          ))}
        </div>

        {gameComplete && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-center">
            <p className="font-bold">Congratulations!</p>
            <p>You've matched all pairs in {moves} moves with {formatTime(timeLeft)} remaining.</p>
            <button
              className="mt-2 bg-game-pink text-white px-4 py-2 rounded-lg hover:bg-pink-600"
              onClick={initializeGame}
            >
              Play Again
            </button>
          </div>
        )}

        {!gameActive && !gameComplete && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg text-center">
            <p className="font-bold">Time's Up!</p>
            <p>You matched {matchedPairs} out of {emojis.length} pairs.</p>
            <button
              className="mt-2 bg-game-pink text-white px-4 py-2 rounded-lg hover:bg-pink-600"
              onClick={initializeGame}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiMatch;
