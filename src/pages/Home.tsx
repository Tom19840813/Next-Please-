import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GameDifficultyModal from '@/components/GameDifficultyModal';
import OnlineUsers from '@/components/OnlineUsers';
import GameInvitations from '@/components/GameInvitations';
import ProBadge from '@/components/ProBadge';
import HallOfFamePreview from '@/components/HallOfFamePreview';
import InfiniteGameFeed from '@/components/InfiniteGameFeed';
import FeedbackSection from '@/components/FeedbackSection';
import HeroMiniGame from '@/components/HeroMiniGame';
import { useSubscription } from '@/hooks/useSubscription';
import { lightTap } from '@/utils/haptics';
import { 
  Gamepad2, Brain, Zap, Grid3X3, Users, Trophy,
  Calculator, Smile, Type, Circle, Crown, 
  ChevronDown, Shuffle, Keyboard, Palette, 
  MousePointer, Repeat, MessageCircle, Monitor,
} from 'lucide-react';

const NEON_ACCENTS = [
  'neon-cyan', 'neon-magenta', 'neon-yellow',
] as const;

const TYPEWRITER_PHRASES = [
  'Endless games.',
  'Random challenges.',
  'Every round is different.',
  'No two games alike.',
  'Infinite replayability.',
];

const Home: React.FC = () => {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const [selectedGame, setSelectedGame] = useState<{id: string; title: string; color: string} | null>(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(() => localStorage.getItem('crt') === 'true');
  const [heroOffset, setHeroOffset] = useState(0);
  const [typewriterText, setTypewriterText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax
  useEffect(() => {
    const handleScroll = () => {
      setHeroOffset(window.scrollY * 0.3);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Typewriter
  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIndex];
    let charIdx = 0;
    setTypewriterText('');
    const typeInterval = setInterval(() => {
      charIdx++;
      setTypewriterText(phrase.slice(0, charIdx));
      if (charIdx >= phrase.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          setPhraseIndex((prev) => (prev + 1) % TYPEWRITER_PHRASES.length);
        }, 2000);
      }
    }, 60);
    return () => clearInterval(typeInterval);
  }, [phraseIndex]);

  // CRT toggle persist
  useEffect(() => {
    localStorage.setItem('crt', crtEnabled ? 'true' : 'false');
  }, [crtEnabled]);

  const games = [
    { id: 'sudoku', title: 'Sudoku', description: 'Classic number puzzle game', icon: Grid3X3 },
    { id: 'tetris', title: 'Tetris', description: 'Stack falling blocks perfectly', icon: Gamepad2 },
    { id: 'quiz', title: 'Quiz', description: 'Test your knowledge', icon: Brain },
    { id: 'memory', title: 'Memory', description: 'Match pairs of cards', icon: Users },
    { id: 'math', title: 'Math Game', description: 'Quick arithmetic challenges', icon: Calculator },
    { id: 'emoji', title: 'Emoji Match', description: 'Find matching emoji pairs', icon: Smile },
    { id: 'wordscramble', title: 'Word Scramble', description: 'Unscramble the letters', icon: Type },
    { id: 'balloons', title: 'Balloon Pop', description: 'Pop balloons as fast as you can', icon: Circle },
    { id: 'snake', title: 'Snake', description: 'Classic snake game', icon: Zap },
    { id: 'typing', title: 'Typing Speed', description: 'Test your typing speed', icon: Keyboard },
    { id: 'colormatch', title: 'Color Match', description: 'Match the word to its color', icon: Palette },
    { id: 'whackamole', title: 'Whack-a-Mole', description: 'Whack moles before they hide', icon: MousePointer },
    { id: 'simon', title: 'Simon Says', description: 'Remember the pattern', icon: Repeat },
  ];

  const getNeonColor = (idx: number) => NEON_ACCENTS[idx % NEON_ACCENTS.length];

  return (
    <div className="min-h-screen bg-background arcade-grid">
      {/* CRT Overlay */}
      {crtEnabled && <div className="crt-scanlines" />}

      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center neon-glow-cyan">
              <Gamepad2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground neon-text">Next Please!</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-2">
                {isPro && <ProBadge size="sm" />}
                <Link to="/leaderboard">
                  <Button variant="ghost" size="sm" className="text-foreground hover:bg-muted">
                    <Trophy className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Leaderboard</span>
                  </Button>
                </Link>
                {!isPro && (
                  <Link to="/upgrade">
                    <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 neon-glow-magenta">
                      <Crown className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Go Pro</span>
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative container mx-auto px-4 py-20 text-center overflow-hidden">
        {/* Canvas Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <HeroMiniGame />
        </div>

        <div style={{ transform: `translateY(${heroOffset}px)` }} className="relative z-10">
          <h2 className="text-5xl sm:text-7xl font-black text-primary tracking-tight mb-4 neon-text-cyan">
            Next Please!
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-2 h-7">
            <span>{typewriterText}</span>
            <span className="animate-typewriter-blink ml-0.5 text-primary">|</span>
          </p>

          {/* Hero Navigation Menu */}
          <nav className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 mb-12">
            <a
              href="#hall-of-fame"
              onClick={lightTap}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:neon-glow-yellow transition-all text-sm font-medium text-foreground hover:text-accent"
            >
              <Trophy className="h-4 w-4" />
              Hall of Fame
            </a>
            <a
              href="#original-games"
              onClick={lightTap}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:neon-glow-cyan transition-all text-sm font-medium text-foreground hover:text-primary"
            >
              <Gamepad2 className="h-4 w-4" />
              Original Games
            </a>
            <a
              href="#random-games"
              onClick={lightTap}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:neon-glow-magenta transition-all text-sm font-medium text-foreground hover:text-secondary"
            >
              <Shuffle className="h-4 w-4" />
              Random Games
              <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full font-bold leading-none">∞</span>
            </a>
            <a
              href="#feedback"
              onClick={lightTap}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:neon-glow-cyan transition-all text-sm font-medium text-foreground hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              Feedback
            </a>
          </nav>

          {/* Scroll indicator */}
          <a href="#hall-of-fame" className="inline-flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
            <span className="text-xs tracking-widest uppercase">Scroll down to explore</span>
            <ChevronDown className="h-5 w-5 animate-bounce" />
          </a>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        {/* Hall of Fame Preview */}
        <section id="hall-of-fame" className="mb-16 max-w-md mx-auto scroll-mt-20">
          <HallOfFamePreview />
        </section>

        {/* Original Games Grid */}
        <section id="original-games" className="mb-16 scroll-mt-20">
          <div className="flex items-center gap-2 mb-6">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Original Games</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, idx) => {
              const IconComponent = game.icon;
              const neonClass = getNeonColor(idx);
              const colorVar = `var(--${neonClass.replace('neon-', 'neon-')})`;
              
              return (
                <Card 
                  key={game.id} 
                  className="group glass border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <CardHeader className="text-center">
                    <div 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110 bg-muted/50 group-hover:neon-glow-${neonClass.split('-')[1]}`}
                    >
                      <IconComponent className={`h-8 w-8 text-${neonClass}`} />
                    </div>
                    <CardTitle className="text-lg text-foreground">{game.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{game.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/80 text-primary-foreground transition-all neon-glow-cyan"
                      onClick={() => {
                        lightTap();
                        setSelectedGame({ id: game.id, title: game.title, color: `hsl(${colorVar})` });
                      }}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Play Now
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Infinite Random Challenges */}
        <section id="random-games" className="mb-12 scroll-mt-20">
          <InfiniteGameFeed />
        </section>

        {/* Community Feedback */}
        <section id="feedback" className="mb-12 scroll-mt-20 max-w-2xl mx-auto">
          <FeedbackSection />
        </section>
      </main>

      {/* Game Difficulty Modal */}
      {selectedGame && (
        <GameDifficultyModal
          gameId={selectedGame.id}
          gameName={selectedGame.title}
          gameColor={selectedGame.color}
          isOpen={!!selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}

      {/* Game Invitations */}
      <GameInvitations />

      {/* Online Users Panel */}
      {user && showOnlineUsers && (
        <div className="fixed top-20 right-4 z-50">
          <OnlineUsers onClose={() => setShowOnlineUsers(false)} />
        </div>
      )}

      {/* Online Users Toggle */}
      {user && (
        <Button
          onClick={() => { lightTap(); setShowOnlineUsers(!showOnlineUsers); }}
          className="fixed bottom-16 right-4 z-40 rounded-full w-12 h-12 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground neon-glow-cyan"
          size="icon"
        >
          <Users className="h-6 w-6" />
        </Button>
      )}

      {/* CRT Toggle */}
      <button
        onClick={() => { lightTap(); setCrtEnabled(!crtEnabled); }}
        className={`fixed bottom-4 left-4 z-40 p-2 rounded-full glass text-xs transition-all ${crtEnabled ? 'text-primary neon-glow-cyan' : 'text-muted-foreground'}`}
        title="Toggle CRT effect"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Home;
