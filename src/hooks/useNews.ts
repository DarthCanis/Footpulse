import useSWR from 'swr';
import { FootballAPI } from '../services/football-api';

export function useNews() {
  const { data, error, isLoading, mutate: revalidateNews } = useSWR(
    'news-feed',
    async () => {
      const response = await FootballAPI.getNews();
      return response;
    },
    {
      // Refresh news articles every 10 minutes (600000ms)
      refreshInterval: 600000,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    news: data?.news || [],
    demoMode: data?.demoMode ?? true,
    lastUpdated: data?.lastUpdated || new Date().toISOString(),
    error,
    isLoading,
    revalidateNews,
  };
}
