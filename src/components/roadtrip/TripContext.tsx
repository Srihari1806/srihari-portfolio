'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ChatId, DiscoveryKey } from '@/data/roadtrip';

type TripState = {
  discovered: DiscoveryKey[];
  discover: (key: DiscoveryKey) => void;
  /** The one conversation currently open on the page (others collapse). */
  activeChat: ChatId | null;
  played: ChatId[];
  playChat: (id: ChatId) => void;
  contactOpen: boolean;
  setContactOpen: (open: boolean) => void;
};

const TripContext = createContext<TripState | null>(null);

/** Session-only state: nothing is stored or sent anywhere. */
export function TripProvider({ children }: { children: ReactNode }) {
  const [discovered, setDiscovered] = useState<DiscoveryKey[]>([]);
  const [activeChat, setActiveChat] = useState<ChatId | null>(null);
  const [played, setPlayed] = useState<ChatId[]>([]);
  const [contactOpen, setContactOpen] = useState(false);

  const discover = useCallback((key: DiscoveryKey) => {
    setDiscovered((d) => (d.includes(key) ? d : [...d, key]));
  }, []);

  const playChat = useCallback((id: ChatId) => {
    setActiveChat(id);
    setPlayed((p) => (p.includes(id) ? p : [...p, id]));
  }, []);

  const value = useMemo(
    () => ({ discovered, discover, activeChat, played, playChat, contactOpen, setContactOpen }),
    [discovered, discover, activeChat, played, playChat, contactOpen],
  );
  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside TripProvider');
  return ctx;
}
