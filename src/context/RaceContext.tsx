import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type RacePhase = 'idle' | 'lobby' | 'countdown' | 'racing' | 'finished';

export interface RacePlayer {
  id: string;
  name: string;
  score: number;
  finished: boolean;
  isHost: boolean;
}

export const RACE_DURATION = 30; // seconds

interface RaceContextType {
  phase: RacePhase;
  code: string | null;
  isHost: boolean;
  players: RacePlayer[];
  countdown: number; // seconds until GO during countdown phase
  timeLeft: number; // seconds left during racing phase
  error: string | null;
  createRace: (name: string) => Promise<void>;
  joinRace: (code: string, name: string) => Promise<void>;
  startRace: () => void;
  reportScore: (score: number) => void;
  leaveRace: () => void;
}

const RaceContext = createContext<RaceContextType | undefined>(undefined);

const genCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const RaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [phase, setPhase] = useState<RacePhase>('idle');
  const [code, setCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<RacePlayer[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(RACE_DURATION);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<any>(null);
  const playerIdRef = useRef<string>(user?.id || `guest-${Math.random().toString(36).slice(2, 10)}`);
  const nameRef = useRef<string>('Player');
  const scoreRef = useRef<number>(0);
  const finishedRef = useRef<boolean>(false);
  const isHostRef = useRef<boolean>(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (user?.id) playerIdRef.current = user.id;
  }, [user]);

  const track = useCallback(() => {
    channelRef.current?.track({
      id: playerIdRef.current,
      name: nameRef.current,
      score: scoreRef.current,
      finished: finishedRef.current,
      isHost: isHostRef.current,
    });
  }, []);

  const syncPlayers = useCallback((channel: any) => {
    const state = channel.presenceState();
    const list: RacePlayer[] = [];
    Object.keys(state).forEach((key) => {
      const presences = state[key] as any[];
      if (presences && presences.length > 0) {
        const p = presences[0];
        if (p && p.id) {
          list.push({
            id: p.id,
            name: p.name || 'Player',
            score: p.score || 0,
            finished: !!p.finished,
            isHost: !!p.isHost,
          });
        }
      }
    });
    list.sort((a, b) => b.score - a.score);
    setPlayers(list);
  }, []);

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const beginRace = useCallback((startAt: number) => {
    clearTick();
    scoreRef.current = 0;
    finishedRef.current = false;
    track();
    tickRef.current = setInterval(() => {
      const now = Date.now();
      if (now < startAt) {
        setPhase('countdown');
        setCountdown(Math.ceil((startAt - now) / 1000));
      } else {
        const elapsed = (now - startAt) / 1000;
        const left = Math.max(0, Math.ceil(RACE_DURATION - elapsed));
        setPhase('racing');
        setTimeLeft(left);
        if (left <= 0) {
          clearTick();
          finishedRef.current = true;
          track();
          setPhase('finished');
        }
      }
    }, 200);
  }, [track]);

  const connect = useCallback(async (raceCode: string, name: string, host: boolean) => {
    nameRef.current = name || 'Player';
    isHostRef.current = host;
    scoreRef.current = 0;
    finishedRef.current = false;
    setError(null);

    const channel = supabase.channel(`race:${raceCode}`, {
      config: { presence: { key: playerIdRef.current } },
    });

    channel
      .on('presence', { event: 'sync' }, () => syncPlayers(channel))
      .on('broadcast', { event: 'start' }, ({ payload }) => {
        beginRace(payload.startAt);
      });

    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await track();
        syncPlayers(channel);
      }
    });

    channelRef.current = channel;
    setCode(raceCode);
    setIsHost(host);
    setPhase('lobby');
  }, [beginRace, syncPlayers, track]);

  const createRace = useCallback(async (name: string) => {
    await connect(genCode(), name, true);
  }, [connect]);

  const joinRace = useCallback(async (raceCode: string, name: string) => {
    const clean = raceCode.trim().toUpperCase();
    if (clean.length < 3) {
      setError('Enter a valid race code');
      return;
    }
    await connect(clean, name, false);
  }, [connect]);

  const startRace = useCallback(() => {
    if (!channelRef.current || !isHostRef.current) return;
    const startAt = Date.now() + 3500;
    channelRef.current.send({ type: 'broadcast', event: 'start', payload: { startAt } });
    beginRace(startAt);
  }, [beginRace]);

  const reportScore = useCallback((score: number) => {
    scoreRef.current = score;
    if (phase === 'racing' || phase === 'countdown') track();
  }, [phase, track]);

  const leaveRace = useCallback(() => {
    clearTick();
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setPhase('idle');
    setCode(null);
    setIsHost(false);
    setPlayers([]);
    setCountdown(0);
    setTimeLeft(RACE_DURATION);
    setError(null);
  }, []);

  useEffect(() => () => {
    clearTick();
    if (channelRef.current) supabase.removeChannel(channelRef.current);
  }, []);

  return (
    <RaceContext.Provider
      value={{
        phase, code, isHost, players, countdown, timeLeft, error,
        createRace, joinRace, startRace, reportScore, leaveRace,
      }}
    >
      {children}
    </RaceContext.Provider>
  );
};

export const useRace = () => {
  const ctx = useContext(RaceContext);
  if (!ctx) throw new Error('useRace must be used within a RaceProvider');
  return ctx;
};
