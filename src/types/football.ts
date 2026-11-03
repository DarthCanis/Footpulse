import { Match, StandingRow, NewsArticle, Club } from '../types';

export interface APIConfig {
  demoMode: boolean;
  provider: string;
  lastUpdated: string;
  timestamp: number;
}

export interface MatchesResponse {
  matches: Match[];
  demoMode: boolean;
  lastUpdated: string;
}

export interface StandingsResponse {
  standings: {
    id: string;
    name: string;
    country: string;
    logo: string;
    standings: StandingRow[];
  }[];
  demoMode: boolean;
  lastUpdated: string;
}

export interface NewsResponse {
  news: NewsArticle[];
  demoMode: boolean;
  lastUpdated: string;
}

export interface ClubsResponse {
  clubs: Club[];
  demoMode: boolean;
  lastUpdated: string;
}

export interface CompetitionsResponse {
  current: import('../types').Competition[];
  historical: import('../types').Competition[];
  demoMode: boolean;
  lastUpdated: string;
}

export interface PlayersResponse {
  players: import('../types').Player[];
  total: number;
  lastUpdated: string;
}

export interface SupabaseDataOptions {
  select?: string;
  filterCol?: string;
  filterVal?: any;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
}

export interface SupabaseDataResponse<T = any> {
  success: boolean;
  data: T[];
  count: number;
  source: 'supabase' | 'server-store' | 'supabase-fallback' | 'error';
  table: string;
  isEmpty: boolean;
  lastUpdated: string;
  error?: string;
}

