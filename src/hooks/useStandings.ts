import useSWR from 'swr';
import { FootballAPI } from '../services/football-api';

export function useStandings() {
  const { data, error, isLoading, mutate: revalidateStandings } = useSWR(
    'standings-feed',
    async () => {
      const response = await FootballAPI.getStandings();
      return response;
    },
    {
      // Refresh standings every 10 minutes (600000ms)
      refreshInterval: 600000,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    standings: data?.standings || [],
    demoMode: data?.demoMode ?? true,
    lastUpdated: data?.lastUpdated || new Date().toISOString(),
    error,
    isLoading,
    revalidateStandings,
  };
}
