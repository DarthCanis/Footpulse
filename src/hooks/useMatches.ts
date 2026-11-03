import useSWR, { useSWRConfig } from 'swr';
import { FootballAPI } from '../services/football-api';
import { Match } from '../types';

export function useMatches(initialStatus?: 'LIVE' | 'UPCOMING' | 'FINISHED') {
  const { mutate } = useSWRConfig();

  // Fetch match details with SWR
  const { data, error, isLoading, mutate: mutateMatches } = useSWR(
    initialStatus ? `matches-feed-${initialStatus}` : 'matches-feed',
    async () => {
      const response = await FootballAPI.getMatches(initialStatus);
      return response;
    },
    {
      // Calculate dynamic refreshInterval:
      // If there are live matches, refresh every 30 seconds.
      // If there are no live matches, refresh every 2 minutes.
      refreshInterval: (currentData) => {
        if (!currentData?.matches) return 30000;
        const hasLive = currentData.matches.some((m: Match) => m.status === 'LIVE');
        return hasLive ? 30000 : 120000;
      },
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const matches = data?.matches || [];
  const liveMatches = matches.filter((m: Match) => m.status === 'LIVE');
  const upcomingMatches = matches
    .filter((m: Match) => m.status === 'UPCOMING')
    .sort((a: Match, b: Match) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  const recentResults = matches
    .filter((m: Match) => m.status === 'FINISHED')
    .sort((a: Match, b: Match) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));

  const triggerSimulatedGoal = async (matchId: string, teamShort?: string) => {
    // Optimistic / manual goal trigger
    const success = await FootballAPI.forceSimulatedGoal(matchId, teamShort);
    if (success) {
      mutateMatches();
    }
    return success;
  };

  const kickoffMatch = async (matchId: string) => {
    const success = await FootballAPI.kickoffMatch(matchId);
    if (success) {
      mutateMatches();
    }
    return success;
  };

  const resetMatch = async (matchId: string) => {
    const success = await FootballAPI.resetMatch(matchId);
    if (success) {
      mutateMatches();
    }
    return success;
  };

  return {
    matches,
    liveMatches,
    upcomingMatches,
    recentResults,
    demoMode: data?.demoMode ?? true,
    lastUpdated: data?.lastUpdated || new Date().toISOString(),
    error,
    isLoading,
    mutateMatches,
    triggerSimulatedGoal,
    kickoffMatch,
    resetMatch,
  };
}
