import useSWR from 'swr';
import { FootballAPI } from '../services/football-api';
import { Player } from '../types';

export function usePlayers(teamId?: string, query?: string) {
  const key = `players-${teamId || 'all'}-${query || ''}`;
  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await FootballAPI.getPlayers(teamId, query);
      return response;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    players: (data?.players || []) as Player[],
    total: data?.total || 0,
    isLoading,
    error,
    mutatePlayers: mutate,
  };
}
