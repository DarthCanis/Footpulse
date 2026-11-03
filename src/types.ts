export type MatchStatus = 'LIVE' | 'UPCOMING' | 'FINISHED';

export interface Team {
  name: string;
  shortName: string;
  logo: string; // Tailwind color or icon/emoji representation for custom design
  score?: number;
  logoUrl?: string;
}

export interface Match {
  id: string;
  competition: string;
  competitionId?: string;
  status: MatchStatus;
  minute?: number;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time: string;
  venue: string;
  referee?: string;
  season?: string;
  isHistorical?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Transfer' | 'Match Analysis' | 'Injury' | 'Club News' | 'Opinion' | 'FIFA World Cup';
  imageUrl: string;
  date: string;
  publishedAt?: string;
  readTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  featured: boolean;
  source?: string;
  link?: string;
}

export interface Player {
  id: string;
  name: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
  nationality: string;
  age: number;
  number: number;
  image: string;
  clubId?: string;
  clubName?: string;
  stats: {
    appearances: number;
    goals: number;
    assists: number;
    rating: number;
    cleanSheets?: number; // for GK/Defenders
  };
}

export interface Competition {
  id: string;
  name: string;
  country?: string;
  logo: string;
  type: 'league' | 'cup' | 'international' | 'historical_tournament';
  isHistorical?: boolean;
  season?: string;
  year?: number;
  host?: string;
  winner?: string;
  runnerUp?: string;
  thirdPlace?: string;
  goldenBall?: string;
  goldenBoot?: string;
  finalScore?: string;
  matchesPlayed?: number;
  goalsScored?: number;
  description?: string;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  logo: string; // Color code or icon identifier
  primaryColor: string;
  secondaryColor: string;
  country: string;
  stadium: string;
  capacity: string;
  established: number;
  manager: string;
  stats: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    position: number;
  };
  squad: Player[];
}

export interface StandingRow {
  position: number;
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gd: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  logoUrl?: string;
  teamShort?: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  logo: string;
  standings: StandingRow[];
}
