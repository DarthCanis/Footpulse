import { MatchesResponse, StandingsResponse, NewsResponse, ClubsResponse, APIConfig, CompetitionsResponse, PlayersResponse, SupabaseDataResponse, SupabaseDataOptions } from '../types/football';
import { Club, Match } from '../types';

/**
 * FootPulse Football API Service Layer
 * Interfaces directly with the secure backend Express proxy.
 * All requests flow through the server-side data layer with freshness validation.
 */
export const FootballAPI = {
  /**
   * Fetch current matches (Live, Upcoming, Finished) with server-side freshness validation
   */
  async getMatches(status?: 'LIVE' | 'UPCOMING' | 'FINISHED', date?: string): Promise<MatchesResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (date) params.append('date', date);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`/api/matches${queryString}`);
    if (!response.ok) {
      throw new Error(`Failed to load matches: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fast real-time live scoreboard telemetry
   */
  async getLiveMatches(): Promise<{ liveMatches: Match[]; count: number; lastUpdated: string }> {
    const response = await fetch('/api/matches/live');
    if (!response.ok) {
      throw new Error(`Failed to load live matches: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetch verified database-backed football clubs and rosters
   */
  async getClubs(): Promise<ClubsResponse> {
    const response = await fetch('/api/clubs');
    if (!response.ok) {
      throw new Error(`Failed to load clubs: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetch single database-backed club by ID or shortName
   */
  async getClubById(id: string): Promise<{ club: Club }> {
    const response = await fetch(`/api/clubs/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to load club: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetch database-backed player profiles across teams
   */
  async getPlayers(teamId?: string, query?: string): Promise<PlayersResponse> {
    const params = new URLSearchParams();
    if (teamId) params.append('teamId', teamId);
    if (query) params.append('q', query);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`/api/players${queryString}`);
    if (!response.ok) {
      throw new Error(`Failed to load players: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetch league and competition standings (database-backed)
   */
  async getStandings(leagueId?: string): Promise<StandingsResponse> {
    const queryString = leagueId ? `?league=${leagueId}` : '';
    const response = await fetch(`/api/standings${queryString}`);
    if (!response.ok) {
      throw new Error(`Failed to load standings: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetch competitions with clean separation between Current and Historical competitions
   */
  async getCompetitions(): Promise<CompetitionsResponse> {
    const response = await fetch('/api/competitions');
    if (!response.ok) {
      throw new Error(`Failed to load competitions: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetch real-time parsed football news with verified publication timestamps
   */
  async getNews(category?: string): Promise<NewsResponse> {
    const queryString = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    const response = await fetch(`/api/news${queryString}`);
    if (!response.ok) {
      throw new Error(`Failed to load news: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetch system configuration and data layer status
   */
  async getConfig(): Promise<APIConfig> {
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error(`Failed to load API configuration: ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Fetch Supabase-backed table data via server-side secure proxy.
   * Credentials (keys, tokens, URLs) remain strictly hidden on the server.
   */
  async getSupabaseData<T = any>(table: string, options?: SupabaseDataOptions): Promise<SupabaseDataResponse<T>> {
    const params = new URLSearchParams();
    if (options?.select) params.append('select', options.select);
    if (options?.filterCol) params.append('filterCol', options.filterCol);
    if (options?.filterVal !== undefined) params.append('filterVal', String(options.filterVal));
    if (options?.orderBy) params.append('orderBy', options.orderBy);
    if (options?.ascending !== undefined) params.append('ascending', String(options.ascending));
    if (options?.limit) params.append('limit', String(options.limit));

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`/api/supabase/${encodeURIComponent(table)}${queryString}`);
    if (!response.ok) {
      throw new Error(`Failed to query Supabase table "${table}": ${response.statusText}`);
    }
    return response.json();
  },

  /**
   * Force simulated goal on the backend state engine
   */
  async forceSimulatedGoal(matchId: string, teamShort?: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/matches/${matchId}/goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamShort }),
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Force match to kickoff live on the backend state engine
   */
  async kickoffMatch(matchId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/matches/${matchId}/kickoff`, {
        method: 'POST',
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Reset match status back to upcoming on the backend state engine
   */
  async resetMatch(matchId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/matches/${matchId}/reset`, {
        method: 'POST',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};
