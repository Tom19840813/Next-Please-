import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DifficultyLevel, DIFFICULTY_CONFIGS } from '@/types/difficulty';
import { Trophy, Clock, Zap, Flame } from 'lucide-react';

interface DifficultySelectorProps {
  currentDifficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  onStartGame: () => void;
  gameName: string;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  currentDifficulty,
  onDifficultyChange,
  onStartGame,
  gameName
}) => {
  const getDifficultyIcon = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return <Trophy className="h-5 w-5" />;
      case 'medium': return <Clock className="h-5 w-5" />;
      case 'hard': return <Zap className="h-5 w-5" />;
      case 'expert': return <Flame className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">{gameName}</h2>
        <p className="text-muted-foreground">Choose your difficulty level</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {(Object.keys(DIFFICULTY_CONFIGS) as DifficultyLevel[]).map((difficulty) => {
          const config = DIFFICULTY_CONFIGS[difficulty];
          const isSelected = currentDifficulty === difficulty;
          
          return (
            <Card 
              key={difficulty}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-lg scale-105' 
                  : 'hover:shadow-md hover:scale-102'
              }`}
              onClick={() => onDifficultyChange(difficulty)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${config.color} text-white`}>
                    {getDifficultyIcon(difficulty)}
                  </div>
                  <CardTitle className="text-lg">{config.label}</CardTitle>
                </div>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className={config.timeMultiplier > 1 ? 'text-green-600' : config.timeMultiplier < 1 ? 'text-red-600' : 'text-yellow-600'}>
                      {config.timeMultiplier > 1 ? '+' : ''}{Math.round((config.timeMultiplier - 1) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Score Bonus:</span>
                    <span className="text-blue-600">
                      +{Math.round((config.scoreMultiplier - 1) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Complexity:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 4 }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < config.complexity ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Button 
          onClick={onStartGame}
          size="lg"
          className="px-8 py-3 text-lg font-semibold"
        >
          Start {DIFFICULTY_CONFIGS[currentDifficulty].label} Game
        </Button>
      </div>
    </div>
  );
};

export default DifficultySelector;