export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface DifficultyConfig {
  label: string;
  description: string;
  color: string;
  timeMultiplier: number;
  scoreMultiplier: number;
  complexity: number;
}

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    label: 'Easy',
    description: 'Relaxed pace, more time',
    color: 'bg-green-500',
    timeMultiplier: 1.5,
    scoreMultiplier: 1,
    complexity: 1
  },
  medium: {
    label: 'Medium',
    description: 'Balanced challenge',
    color: 'bg-yellow-500',
    timeMultiplier: 1,
    scoreMultiplier: 1.2,
    complexity: 2
  },
  hard: {
    label: 'Hard',
    description: 'Fast pace, higher stakes',
    color: 'bg-orange-500',
    timeMultiplier: 0.75,
    scoreMultiplier: 1.5,
    complexity: 3
  },
  expert: {
    label: 'Expert',
    description: 'For masters only',
    color: 'bg-red-500',
    timeMultiplier: 0.5,
    scoreMultiplier: 2,
    complexity: 4
  }
};