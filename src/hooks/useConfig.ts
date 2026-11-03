import useSWR from 'swr';
import { FootballAPI } from '../services/football-api';

export function useConfig() {
  const { data, error, isLoading } = useSWR(
    'api-config',
    async () => {
      return FootballAPI.getConfig();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    config: data,
    demoMode: data?.demoMode ?? true,
    error,
    isLoading,
  };
}
