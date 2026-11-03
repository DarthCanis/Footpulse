import useSWR from 'swr';
import { FootballAPI } from '../services/football-api';
import { Club } from '../types';

export function useClubs() {
  const { data, error, isLoading, mutate } = useSWR(
    'clubs-feed',
    async () => {
      const response = await FootballAPI.getClubs();
      return response;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    clubs: (data?.clubs || []) as Club[],
    isLoading,
    error,
    mutateClubs: mutate,
  };
}
