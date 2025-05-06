
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojis = ['🚀', '🌟', '🎮', '🎯', '🏆', '🎨', '🎭', '🎪'];

const MemoryGame: React.FC = () => {
  const { incrementScore } = useGameContext();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);

  // Initialize game on first render
  useEffect(() => {
    initializeGame();
  }, []);

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
        incrementScore(20); // Points for finding a match
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
        }, 1000);
      }

      setMoves(prev => prev + 1);
    }
  }, [flippedCards]);

  // Check if game is complete
  useEffect(() => {
    if (matchedPairs === emojis.length) {
      setGameComplete(true);
      // Bonus points based on efficiency (fewer moves = more points)
      const efficiency = Math.max(100 - (moves - emojis.length) * 5, 10);
      incrementScore(efficiency);
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
  };

  const handleCardClick = (id: number) => {
    // Ignore click if already two cards flipped, card is already flipped, or game is complete
    if (flippedCards.length === 2 || cards.find(card => card.id === id)?.isFlipped || gameComplete) return;
    
    // If the card is already matched, ignore click
    if (cards.find(card => card.id === id)?.isMatched) return;
    
    // Flip the card
    setCards(currentCards => 
      currentCards.map(card => 
        card.id === id ? { ...card, isFlipped: true } : card
      )
    );
    
    // Add the card to flippedCards
    setFlippedCards(prev => [...prev, id]);
  };

  const renderCards = () => {
    return (
      <div className="grid grid-cols-4 gap-2">
        {cards.map(card => (
          <div
            key={card.id}
            className={`aspect-square flex items-center justify-center text-2xl rounded-lg cursor-pointer transition-transform ${
              card.isFlipped || card.isMatched ? 'bg-white shadow-md' : 'bg-game-orange text-transparent'
            } ${card.isFlipped && !card.isMatched ? 'animate-pulse-light' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="game-card bg-gradient-to-br from-white to-orange-50 p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-game-orange">Memory Match</h2>
        <p className="text-sm text-gray-500">Find all the matching pairs</p>
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
        </div>

        {renderCards()}

        {gameComplete && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg text-center">
            <p className="font-bold">Congratulations!</p>
            <p>You've matched all pairs in {moves} moves.</p>
            <button
              className="mt-2 bg-game-orange text-white px-4 py-2 rounded hover:bg-orange-600"
              onClick={initializeGame}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
