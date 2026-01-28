import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DifficultyLevel, DIFFICULTY_CONFIGS } from '@/types/difficulty';
import { X, Trophy, Clock, Zap, Flame } from 'lucide-react';

interface GameDifficultyModalProps {
  gameId: string;
  gameName: string;
  gameColor: string;
  isOpen: boolean;
  onClose: () => void;
}

const GameDifficultyModal: React.FC<GameDifficultyModalProps> = ({
  gameId,
  gameName,
  gameColor,
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();

  const getDifficultyIcon = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return <Trophy className="h-5 w-5" />;
      case 'medium': return <Clock className="h-5 w-5" />;
      case 'hard': return <Zap className="h-5 w-5" />;
      case 'expert': return <Flame className="h-5 w-5" />;
    }
  };

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    // Navigate to the game with difficulty parameter
    navigate(`/play/${gameId}?difficulty=${difficulty}`);
  };

  const getGameSpecificAnimation = () => {
    switch (gameId) {
      case 'sudoku': return 'animate-sudoku-slide';
      case 'tetris': return 'animate-tetris-drop';
      case 'quiz': return 'animate-quiz-flip';
      case 'memory': return 'animate-memory-reveal';
      case 'math': return 'animate-math-popup';
      case 'emoji': return 'animate-emoji-bounce';
      case 'wordscramble': return 'animate-word-scatter';
      case 'balloons': return 'animate-balloon-float';
      default: return 'animate-slide-up';
    }
  };

  const getGameBackgroundPattern = () => {
    switch (gameId) {
      case 'sudoku': return 'sudoku-pattern';
      case 'tetris': return 'tetris-pattern';
      case 'quiz': return 'quiz-pattern';
      case 'memory': return 'memory-pattern';
      case 'math': return 'math-pattern';
      case 'emoji': return 'emoji-pattern';
      case 'wordscramble': return 'word-pattern';
      case 'balloons': return 'balloon-pattern';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-2xl mx-4 mb-4 ${getGameSpecificAnimation()} ${getGameBackgroundPattern()}`}>
        <Card className="bg-card/95 backdrop-blur-md border border-border shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-between mb-2">
              <div></div>
              <h2 className="text-2xl font-bold text-foreground">{gameName}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-muted-foreground">Choose your difficulty level</p>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(DIFFICULTY_CONFIGS) as DifficultyLevel[]).map((difficulty) => {
                const config = DIFFICULTY_CONFIGS[difficulty];
                
                return (
                  <Card 
                    key={difficulty}
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-border hover:border-primary/50 bg-muted/50"
                    onClick={() => handleDifficultySelect(difficulty)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full text-primary-foreground flex items-center justify-center`} style={{ backgroundColor: gameColor }}>
                          {getDifficultyIcon(difficulty)}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-foreground">{config.label}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">{config.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className={config.timeMultiplier > 1 ? 'text-green-400' : config.timeMultiplier < 1 ? 'text-red-400' : 'text-yellow-400'}>
                            {config.timeMultiplier > 1 ? '+' : ''}{Math.round((config.timeMultiplier - 1) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Score Bonus:</span>
                          <span className="text-secondary">
                            +{Math.round((config.scoreMultiplier - 1) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Complexity:</span>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameDifficultyModal;