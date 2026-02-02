
import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../context/GameContext';
import { generateEmojiSets } from '../../utils/randomContent';
import DifficultySelector from '../DifficultySelector';
import { DIFFICULTY_CONFIGS } from '@/types/difficulty';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGame: React.FC = () => {
  const { incrementScore, saveScore, difficulty, setDifficulty } = useGameContext();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [currentEmojiSet, setCurrentEmojiSet] = useState<string[]>([]);
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);

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
        const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
        const points = Math.round(20 * difficultyConfig.scoreMultiplier);
        incrementScore(points); // Points for finding a match
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
    if (matchedPairs === currentEmojiSet.length) {
      setGameComplete(true);
      // Bonus points based on efficiency (fewer moves = more points)
      const efficiency = Math.max(100 - (moves - currentEmojiSet.length) * 5, 10);
      const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
      const bonusPoints = Math.round(efficiency * difficultyConfig.scoreMultiplier);
      incrementScore(bonusPoints);
      saveScore(); // Save the score to the database when game is completed
    }
  }, [matchedPairs, currentEmojiSet.length]);

  const initializeGame = () => {
    // Get a random set of emojis based on difficulty
    const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
    const pairCount = Math.min(4 + difficultyConfig.complexity, 8); // 5-8 pairs based on difficulty
    const randomEmojis = generateEmojiSets().slice(0, pairCount);
    setCurrentEmojiSet(randomEmojis);
    setShowDifficultySelector(false);
    
    // Create pairs of cards with emojis
    const cardPairs = [...randomEmojis, ...randomEmojis].map((emoji, index) => ({
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
    const gridCols = currentEmojiSet.length <= 4 ? 'grid-cols-3' : 'grid-cols-4';
    return (
      <div className={`grid ${gridCols} gap-2`}>
        {cards.map(card => (
          <div
            key={card.id}
            className={`aspect-square flex items-center justify-center text-2xl rounded-lg cursor-pointer transition-transform ${
              card.isFlipped || card.isMatched ? 'bg-card shadow-md border border-border' : 'bg-muted text-transparent border border-border'
            } ${card.isFlipped && !card.isMatched ? 'animate-pulse-light' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            {(card.isFlipped || card.isMatched) ? card.emoji : '?'}
          </div>
        ))}
      </div>
    );
  };

  if (showDifficultySelector) {
    return (
      <div className="game-card bg-card p-4">
        <DifficultySelector
          currentDifficulty={difficulty}
          onDifficultyChange={setDifficulty}
          onStartGame={initializeGame}
          gameName="Memory Match"
        />
      </div>
    );
  }

  return (
    <div className="game-card bg-card p-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-foreground">Memory Match - {DIFFICULTY_CONFIGS[difficulty].label}</h2>
        <p className="text-sm text-muted-foreground">Find all the matching pairs</p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex justify-between mb-4">
          <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
            <span className="text-sm font-semibold text-foreground">
              Pairs: {matchedPairs}/{currentEmojiSet.length}
            </span>
          </div>
          <div className="px-4 py-1 bg-card rounded-full shadow border border-border">
            <span className="text-sm font-semibold text-foreground">
              Moves: {moves}
            </span>
          </div>
        </div>

        {renderCards()}

        {gameComplete && (
          <div className="mt-4 p-4 bg-muted text-foreground rounded-lg text-center border border-border">
            <p className="font-bold">Congratulations!</p>
            <p>You've matched all pairs in {moves} moves.</p>
            <div className="mt-2 space-y-2">
              <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 mr-2"
                onClick={initializeGame}
              >
                Play Again
              </button>
              <button
                className="bg-muted text-foreground px-4 py-2 rounded hover:bg-accent border border-border"
                onClick={() => setShowDifficultySelector(true)}
              >
                Change Difficulty
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryGame;
