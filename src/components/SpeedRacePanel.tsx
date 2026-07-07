import React, { useEffect, useState } from 'react';
import { useRace, RACE_DURATION } from '../context/RaceContext';
import { useGameContext } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { Users, Zap, Copy, Check, Crown, Timer, X, Flag } from 'lucide-react';

const SpeedRacePanel: React.FC = () => {
  const { phase, code, isHost, players, countdown, timeLeft, error, createRace, joinRace, startRace, reportScore, leaveRace } = useRace();
  const { score } = useGameContext();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('race_name');
    if (stored) setName(stored);
    else if (user?.email) setName(user.email.split('@')[0]);
  }, [user]);

  // Push live score into the race while racing
  useEffect(() => {
    if (phase === 'racing') reportScore(score);
  }, [score, phase, reportScore]);

  const saveName = (v: string) => {
    setName(v);
    localStorage.setItem('race_name', v);
  };

  const handleCreate = () => createRace(name.trim() || 'Player');
  const handleJoin = () => joinRace(joinCode, name.trim() || 'Player');

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const activeInRace = phase !== 'idle';

  return (
    <>
      {/* Trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 z-40 glass neon-glow-magenta flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-foreground"
          aria-label="Open speed race"
        >
          <Zap size={16} className="text-primary" />
          {activeInRace ? 'Race Active' : 'Race a Friend'}
          {activeInRace && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
        </button>
      )}

      {/* Countdown / racing HUD (always visible while active) */}
      {phase === 'countdown' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm pointer-events-none">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Get ready to race!</p>
            <div className="text-8xl font-black text-primary neon-glow-cyan animate-pulse">
              {countdown > 0 ? countdown : 'GO!'}
            </div>
            <p className="text-sm text-muted-foreground mt-4">Hit “Start Game” when it says GO!</p>
          </div>
        </div>
      )}

      {phase === 'racing' && !open && (
        <div className="fixed top-20 right-4 z-40 glass rounded-xl p-3 w-52 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1 text-xs font-bold text-primary"><Flag size={12} /> LIVE RACE</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-foreground"><Timer size={12} />{timeLeft}s</span>
          </div>
          <div className="space-y-1">
            {players.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="truncate text-foreground">{i + 1}. {p.name}</span>
                <span className="font-bold text-foreground">{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/60 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="glass w-full max-w-sm rounded-2xl p-5 border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Zap size={18} className="text-primary" /> Speed Race
              </h3>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            {error && <p className="text-destructive text-sm mb-3">{error}</p>}

            {/* IDLE: create or join */}
            {phase === 'idle' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Race the same game live against friends. Highest score in {RACE_DURATION}s wins.</p>
                <div>
                  <label className="text-xs text-muted-foreground">Your name</label>
                  <input
                    value={name}
                    onChange={(e) => saveName(e.target.value)}
                    placeholder="Player"
                    className="w-full mt-1 bg-card border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <button onClick={handleCreate} className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90">
                  Create Race
                </button>
                <div className="flex items-center gap-2">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="CODE"
                    maxLength={6}
                    className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-foreground uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <button onClick={handleJoin} className="bg-secondary text-secondary-foreground font-bold px-4 py-2 rounded-lg hover:opacity-90">
                    Join
                  </button>
                </div>
              </div>
            )}

            {/* LOBBY */}
            {phase === 'lobby' && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Share this code with friends</p>
                  <button onClick={copyCode} className="mt-1 inline-flex items-center gap-2 text-3xl font-black tracking-widest text-primary neon-glow-cyan">
                    {code} {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><Users size={12} /> Players ({players.length})</p>
                  <div className="space-y-1">
                    {players.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 text-sm text-foreground bg-card rounded-lg px-3 py-2 border border-border">
                        {p.isHost && <Crown size={14} className="text-primary" />}
                        {p.name}
                      </div>
                    ))}
                  </div>
                </div>
                {isHost ? (
                  <button
                    onClick={() => { startRace(); setOpen(false); }}
                    disabled={players.length < 2}
                    className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {players.length < 2 ? 'Waiting for players…' : 'Start Race'}
                  </button>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">Waiting for host to start…</p>
                )}
                <button onClick={leaveRace} className="w-full text-sm text-muted-foreground hover:text-foreground">Leave race</button>
              </div>
            )}

            {(phase === 'countdown' || phase === 'racing') && (
              <div className="space-y-3">
                <p className="text-center text-sm text-muted-foreground">Race in progress — {timeLeft}s left</p>
                <div className="space-y-1">
                  {players.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between text-sm bg-card rounded-lg px-3 py-2 border border-border">
                      <span className="text-foreground">{i + 1}. {p.name}</span>
                      <span className="font-bold text-foreground">{p.score}</span>
                    </div>
                  ))}
                </div>
                <button onClick={leaveRace} className="w-full text-sm text-muted-foreground hover:text-foreground">Leave race</button>
              </div>
            )}

            {/* FINISHED */}
            {phase === 'finished' && (
              <div className="space-y-4">
                <h4 className="text-center text-xl font-black text-foreground">🏁 Results</h4>
                <div className="space-y-1">
                  {players.map((p, i) => (
                    <div key={p.id} className={`flex items-center justify-between rounded-lg px-3 py-2 border ${i === 0 ? 'border-primary neon-glow-cyan' : 'border-border'} bg-card`}>
                      <span className="flex items-center gap-2 text-foreground font-medium">
                        {i === 0 && <Crown size={16} className="text-primary" />} {i + 1}. {p.name}
                      </span>
                      <span className="font-bold text-foreground">{p.score}</span>
                    </div>
                  ))}
                </div>
                <button onClick={leaveRace} className="w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90">
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SpeedRacePanel;
