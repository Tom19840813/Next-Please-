import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameType } from '@/context/GameContext';
import { DifficultyLevel, DIFFICULTY_CONFIGS } from '@/types/difficulty';
import { 
  Gamepad2, Brain, Calculator, Smile, Type, Circle, Grid3X3, Users,
  Zap, Trophy, Clock, Flame, Shuffle, Target, Timer, Star, Sparkles
} from 'lucide-react';

const GAME_TYPES: GameType[] = ['sudoku', 'tetris', 'quiz', 'memory', 'math', 'emoji', 'wordscramble', 'balloons'];
const DIFFICULTIES: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];

const CHALLENGE_MODIFIERS = [
  { name: 'Speed Round', icon: Timer, description: 'Race against the clock' },
  { name: 'No Mistakes', icon: Target, description: 'One wrong move and it\'s over' },
  { name: 'Double Points', icon: Star, description: 'Earn twice the score' },
  { name: 'Survival', icon: Flame, description: 'How long can you last?' },
  { name: 'Zen Mode', icon: Sparkles, description: 'No timer, just focus' },
  { name: 'Blitz', icon: Zap, description: 'Lightning fast rounds' },
  { name: 'Marathon', icon: Trophy, description: 'Endurance test' },
  { name: 'Random Rush', icon: Shuffle, description: 'Expect the unexpected' },
];

const GAME_INFO: Record<GameType, { title: string; icon: React.ElementType }> = {
  sudoku: { title: 'Sudoku', icon: Grid3X3 },
  tetris: { title: 'Tetris', icon: Gamepad2 },
  quiz: { title: 'Quiz', icon: Brain },
  memory: { title: 'Memory', icon: Users },
  math: { title: 'Math Game', icon: Calculator },
  emoji: { title: 'Emoji Match', icon: Smile },
  wordscramble: { title: 'Word Scramble', icon: Type },
  balloons: { title: 'Balloon Pop', icon: Circle },
};

interface GeneratedChallenge {
  id: string;
  game: GameType;
  difficulty: DifficultyLevel;
  modifier: typeof CHALLENGE_MODIFIERS[number];
  seed: number;
}

const generateChallenge = (index: number): GeneratedChallenge => {
  // Use index as part of seed for deterministic-ish but varied results
  const seed = Date.now() + index * 7919; // prime number for spread
  const game = GAME_TYPES[Math.floor((seed * 13) % GAME_TYPES.length)];
  const difficulty = DIFFICULTIES[Math.floor((seed * 17) % DIFFICULTIES.length)];
  const modifier = CHALLENGE_MODIFIERS[Math.floor((seed * 23) % CHALLENGE_MODIFIERS.length)];
  
  return {
    id: `challenge-${index}-${seed}`,
    game,
    difficulty,
    modifier,
    seed,
  };
};

const BATCH_SIZE = 6;

const InfiniteGameFeed: React.FC = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<GeneratedChallenge[]>(() =>
    Array.from({ length: BATCH_SIZE }, (_, i) => generateChallenge(i))
  );
  const [counter, setCounter] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(() => {
    setChallenges(prev => {
      const newChallenges = Array.from({ length: BATCH_SIZE }, (_, i) =>
        generateChallenge(counter + i)
      );
      return [...prev, ...newChallenges];
    });
    setCounter(c => c + BATCH_SIZE);
  }, [counter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  const handlePlay = (challenge: GeneratedChallenge) => {
    navigate(`/play/${challenge.game}?difficulty=${challenge.difficulty}`);
  };

  const getDifficultyIcon = (d: DifficultyLevel) => {
    switch (d) {
      case 'easy': return <Trophy className="h-3.5 w-3.5" />;
      case 'medium': return <Clock className="h-3.5 w-3.5" />;
      case 'hard': return <Zap className="h-3.5 w-3.5" />;
      case 'expert': return <Flame className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Shuffle className="h-5 w-5 text-foreground" />
        <h3 className="text-xl font-bold text-foreground">Random Challenges</h3>
        <span className="text-xs text-muted-foreground ml-auto">∞ scroll for more</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => {
          const gameInfo = GAME_INFO[challenge.game];
          const GameIcon = gameInfo.icon;
          const ModifierIcon = challenge.modifier.icon;
          const diffConfig = DIFFICULTY_CONFIGS[challenge.difficulty];

          return (
            <button
              key={challenge.id}
              onClick={() => handlePlay(challenge)}
              className="group text-left bg-card border border-border rounded-xl p-4 hover:border-foreground/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              {/* Top row: game icon + name + difficulty badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-foreground/10 transition-colors">
                    <GameIcon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm leading-tight">{gameInfo.title}</p>
                    <p className="text-xs text-muted-foreground">{diffConfig.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  {getDifficultyIcon(challenge.difficulty)}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < diffConfig.complexity ? 'bg-foreground' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Modifier / challenge type */}
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <ModifierIcon className="h-4 w-4 text-foreground/70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{challenge.modifier.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{challenge.modifier.description}</p>
                </div>
              </div>

              {/* Score multiplier hint */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Score ×{diffConfig.scoreMultiplier}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-foreground font-medium">
                  Play →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-8 flex items-center justify-center">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:150ms]" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
};

export default InfiniteGameFeed;
