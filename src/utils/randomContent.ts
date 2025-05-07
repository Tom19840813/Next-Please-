
// Utility functions to generate random content for games

// API for random trivia questions
const fetchRandomTrivia = async (amount: number = 5): Promise<any[]> => {
  try {
    const response = await fetch(`https://opentdb.com/api.php?amount=${amount}&type=multiple`);
    const data = await response.json();
    
    if (data.response_code === 0) {
      return data.results.map((q: any) => {
        // Combine correct and incorrect answers and shuffle
        const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
        return {
          question: decodeHTMLEntities(q.question),
          options: options.map(option => decodeHTMLEntities(option)),
          correctAnswer: options.indexOf(q.correct_answer)
        };
      });
    }
    return [];
  } catch (error) {
    console.error("Error fetching trivia questions:", error);
    return [];
  }
};

// For decoding HTML entities in the API response
const decodeHTMLEntities = (text: string): string => {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

// Generate random word for WordScramble
const generateRandomWord = (): { word: string, category: string } => {
  // Expanded word lists
  const categories = [
    {
      name: 'animals',
      words: ['zebra', 'elephant', 'giraffe', 'dolphin', 'penguin', 'tiger', 'koala', 'kangaroo', 'hedgehog', 'leopard',
              'flamingo', 'crocodile', 'panda', 'rhinoceros', 'squirrel', 'cheetah', 'gorilla', 'jaguar', 'platypus', 'toucan']
    },
    {
      name: 'food',
      words: ['burger', 'pizza', 'sushi', 'pasta', 'chocolate', 'pancake', 'cookie', 'sandwich', 'taco', 'donut',
              'lasagna', 'burrito', 'waffle', 'hummus', 'croissant', 'muffin', 'cupcake', 'popcorn', 'pretzel', 'smoothie']
    },
    {
      name: 'tech',
      words: ['laptop', 'keyboard', 'smartphone', 'tablet', 'monitor', 'router', 'wireless', 'bluetooth', 'headphone', 'speaker',
              'server', 'algorithm', 'database', 'software', 'hardware', 'network', 'browser', 'website', 'interface', 'firewall']
    },
    {
      name: 'countries',
      words: ['canada', 'brazil', 'australia', 'japan', 'germany', 'mexico', 'thailand', 'sweden', 'iceland', 'morocco',
              'finland', 'portugal', 'singapore', 'argentina', 'tanzania', 'switzerland', 'philippines', 'netherlands', 'denmark', 'malaysia']
    }
  ];

  // Select random category and word
  const category = categories[Math.floor(Math.random() * categories.length)];
  const word = category.words[Math.floor(Math.random() * category.words.length)];

  return { word, category: category.name };
};

// Generate random emoji sets for memory game
const generateEmojiSets = (): string[] => {
  const emojiSets = [
    ['🚀', '🌟', '🎮', '🎯', '🏆', '🎨', '🎭', '🎪'],  // Original set
    ['🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🐼', '🐨'],  // Animals
    ['🍎', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥝'],  // Fruits
    ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱'],   // Sports
    ['🚗', '✈️', '🚀', '🚂', '🚢', '🚁', '🏍️', '🚲'],  // Transportation
    ['😀', '😎', '🤔', '😴', '😍', '😱', '🤣', '😇']   // Faces
  ];

  return emojiSets[Math.floor(Math.random() * emojiSets.length)];
};

// Generate random math problem based on difficulty level
const generateMathProblem = (level: number) => {
  // This is already implemented in the MathGame component, but we could extract it here
  // if we want to reuse it elsewhere
  
  // For now, this is a placeholder
  return { problem: "2 + 2", answer: 4 };
};

export {
  fetchRandomTrivia,
  generateRandomWord,
  generateEmojiSets,
  generateMathProblem,
  decodeHTMLEntities
};
