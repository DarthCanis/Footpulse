import useSWR from 'swr';
import { FootballAPI } from '../services/football-api';
import { SupabaseDataOptions, SupabaseDataResponse } from '../types/football';

export interface UseSupabaseDataOptions extends SupabaseDataOptions {
  /**
   * If false, skips fetching (conditional query)
   */
  enabled?: boolean;
  /**
   * Automatically revalidate when window/tab regains focus
   */
  revalidateOnFocus?: boolean;
  /**
   * Polling refresh interval in milliseconds (0 to disable)
   */
  refreshInterval?: number;
  /**
   * SWR request deduping interval in milliseconds (default: 30000)
   */
  dedupingInterval?: number;
}

export type SupabaseQueryStatus = 'loading' | 'error' | 'empty' | 'success';

export interface UseSupabaseDataResult<T = any> {
  /**
   * Array of records retrieved from Supabase backend.
   * Guaranteed to be an array (defaults to [] if empty or loading).
   */
  data: T[];
  /**
   * Total count of records returned
   */
  count: number;
  /**
   * True during initial data fetch when no cache is available
   */
  isLoading: boolean;
  /**
   * True whenever a network revalidation request is actively running
   */
  isValidating: boolean;
  /**
   * True if an error occurred during fetching
   */
  isError: boolean;
  /**
   * Error object if the request failed
   */
  error: Error | null;
  /**
   * Human-readable error message if request failed
   */
  errorMessage: string | null;
  /**
   * True when data has resolved but contains zero records
   */
  isEmpty: boolean;
  /**
   * High-level query state discriminator for clean conditional rendering
   */
  status: SupabaseQueryStatus;
  /**
   * The underlying data source:
   * - 'supabase': Live Supabase PostgreSQL database
   * - 'server-store': Validated server-side repository
   * - 'supabase-fallback': Graceful fallback store
   */
  source: 'supabase' | 'server-store' | 'supabase-fallback' | 'error' | null;
  /**
   * The queried table or collection name
   */
  table: string;
  /**
   * ISO timestamp of the last data update
   */
  lastUpdated: string | null;
  /**
   * Full raw response envelope from the backend proxy
   */
  rawResponse: SupabaseDataResponse<T> | undefined;
  /**
   * Manually trigger revalidation of the cache
   */
  refetch: () => Promise<SupabaseDataResponse<T> | undefined>;
  /**
   * SWR mutate function for optimistic updates or local cache override
   */
  mutate: (data?: any, shouldRevalidate?: boolean) => Promise<any>;
}

/**
 * useSupabaseData Hook
 * 
 * Fetches and caches data from the Supabase backend with appropriate loading, error,
 * and empty states.
 * 
 * Architectural Security Guarantee:
 * - Credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, anon keys) are NEVER exposed to the browser.
 * - All queries flow securely through the server-side proxy `/api/supabase/:table`.
 * - In-memory SWR caching prevents redundant round-trips and provides instant cache hits.
 *
 * @param table Name of the database table (e.g. 'teams', 'players', 'matches', 'competitions', 'standings', 'news')
 * @param options Query, filtering, ordering, pagination, and caching configuration
 */
export function useSupabaseData<T = any>(
  table: string,
  options?: UseSupabaseDataOptions
): UseSupabaseDataResult<T> {
  const isEnabled = options?.enabled !== false && Boolean(table);

  // Generate deterministic SWR cache key based on query options
  const cacheKey = isEnabled
    ? [
        'supabase-data',
        table.toLowerCase(),
        options?.select || '*',
        options?.filterCol || '',
        options?.filterVal !== undefined ? String(options?.filterVal) : '',
        options?.orderBy || '',
        options?.ascending !== undefined ? String(options?.ascending) : '',
        options?.limit || 0,
      ]
    : null;

  const { data: response, error: swrError, isLoading, isValidating, mutate } = useSWR<SupabaseDataResponse<T>>(
    cacheKey,
    async () => {
      const result = await FootballAPI.getSupabaseData<T>(table, options);
      return result;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      refreshInterval: options?.refreshInterval ?? 0,
      dedupingInterval: options?.dedupingInterval ?? 30000,
      keepPreviousData: true,
    }
  );

  const dataList = (response?.data && Array.isArray(response.data) ? response.data : []) as T[];
  const isError = Boolean(swrError || (response && !response.success));
  const errorObj = swrError instanceof Error ? swrError : response?.error ? new Error(response.error) : null;
  const isEmpty = !isLoading && !isError && dataList.length === 0;

  let status: SupabaseQueryStatus = 'loading';
  if (isError) {
    status = 'error';
  } else if (isLoading) {
    status = 'loading';
  } else if (isEmpty) {
    status = 'empty';
  } else {
    status = 'success';
  }

  return {
    data: dataList,
    count: response?.count ?? dataList.length,
    isLoading,
    isValidating,
    isError,
    error: errorObj,
    errorMessage: errorObj?.message || (response?.error ?? null),
    isEmpty,
    status,
    source: response?.source ?? null,
    table,
    lastUpdated: response?.lastUpdated ?? null,
    rawResponse: response,
    refetch: () => mutate(),
    mutate,
  };
}
