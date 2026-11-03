import React, { createContext, useContext, useState, useEffect } from 'react';
import { Match, League } from '../types';
import { useMatches as useSWRMatches } from '../hooks/useMatches';
import { useStandings as useSWRStandings } from '../hooks/useStandings';

interface MatchContextType {
  matches: Match[];
  liveMatches: Match[];
  upcomingMatches: Match[];
  recentResults: Match[];
  leagues: League[];
  isSimulating: boolean;
  setIsSimulating: (sim: boolean) => void;
  triggerSimulatedGoal: (matchId: string, teamShort?: string) => void;
  kickoffMatch: (matchId: string) => void;
  resetMatch: (matchId: string) => void;
  lastGoalEvent: { matchTitle: string; teamName: string; minute: number } | null;
  clearLastGoalEvent: () => void;
  
  // Real-time telemetry extras
  isLoadingMatches: boolean;
  isLoadingStandings: boolean;
  lastUpdated: string;
  demoMode: boolean;
  revalidateAll: () => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: React.ReactNode }) {
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [lastGoalEvent, setLastGoalEvent] = useState<{ matchTitle: string; teamName: string; minute: number } | null>(null);
  const [prevMatches, setPrevMatches] = useState<Match[]>([]);

  const clearLastGoalEvent = () => setLastGoalEvent(null);

  // Consume SWR hooks
  const {
    matches,
    liveMatches,
    upcomingMatches,
    recentResults,
    isLoading: isLoadingMatches,
    lastUpdated,
    demoMode,
    triggerSimulatedGoal: swrGoal,
    kickoffMatch: swrKickoff,
    resetMatch: swrReset,
    mutateMatches
  } = useSWRMatches();

  const {
    standings,
    isLoading: isLoadingStandings,
    revalidateStandings
  } = useSWRStandings();

  // Map backend standings to the frontend "leagues" structure
  const leagues: League[] = standings.map((item: any) => ({
    id: item.id,
    name: item.name,
    country: item.country,
    logo: item.logo,
    standings: item.standings
  }));

  // Detect goals reactively on SWR state refresh (real and simulated!)
  useEffect(() => {
    if (matches && matches.length > 0 && prevMatches.length > 0) {
      matches.forEach((match) => {
        const prevMatch = prevMatches.find((m) => m.id === match.id);
        if (prevMatch) {
          const prevHomeScore = prevMatch.homeTeam.score;
          const prevAwayScore = prevMatch.awayTeam.score;
          const newHomeScore = match.homeTeam.score;
          const newAwayScore = match.awayTeam.score;

          // Only trigger if both scores were defined and increased
          if (newHomeScore !== undefined && prevHomeScore !== undefined && newHomeScore > prevHomeScore) {
            setLastGoalEvent({
              matchTitle: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
              teamName: match.homeTeam.name,
              minute: match.minute || 90,
            });
          }
          if (newAwayScore !== undefined && prevAwayScore !== undefined && newAwayScore > prevAwayScore) {
            setLastGoalEvent({
              matchTitle: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
              teamName: match.awayTeam.name,
              minute: match.minute || 90,
            });
          }
        }
      });
    }
    if (matches && matches.length > 0) {
      setPrevMatches(matches);
    }
  }, [matches, prevMatches]);

  const triggerSimulatedGoal = (matchId: string, teamShort?: string) => {
    swrGoal(matchId, teamShort);
  };

  const kickoffMatch = (matchId: string) => {
    swrKickoff(matchId);
  };

  const resetMatch = (matchId: string) => {
    swrReset(matchId);
  };

  const revalidateAll = () => {
    mutateMatches();
    revalidateStandings();
  };

  return (
    <MatchContext.Provider
      value={{
        matches,
        liveMatches,
        upcomingMatches,
        recentResults,
        leagues,
        isSimulating,
        setIsSimulating,
        triggerSimulatedGoal,
        kickoffMatch,
        resetMatch,
        lastGoalEvent,
        clearLastGoalEvent,
        isLoadingMatches,
        isLoadingStandings,
        lastUpdated,
        demoMode,
        revalidateAll
      }}
    >
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatches must be used within a MatchProvider');
  }
  return context;
}
