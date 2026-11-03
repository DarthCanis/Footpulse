import useSWR from 'swr';
import { FootballAPI } from '../services/football-api';
import { Competition } from '../types';

export function useCompetitions() {
  const { data, error, isLoading, mutate } = useSWR(
    'competitions-feed',
    async () => {
      const response = await FootballAPI.getCompetitions();
      return response;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    currentCompetitions: (data?.current || []) as Competition[],
    historicalCompetitions: (data?.historical || []) as Competition[],
    isLoading,
    error,
    lastUpdated: data?.lastUpdated,
    revalidateCompetitions: mutate,
  };
}
