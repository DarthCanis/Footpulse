import React from 'react';
import { Match } from '../types';
import { Calendar, ShieldAlert, Award, Star } from 'lucide-react';
import TeamLogo from './TeamLogo';
import { useUserData } from '../hooks/useUserData';

interface MatchCardProps {
  key?: string;
  match: Match;
  onClick?: () => void;
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
  const { isClubFavorite, isLeagueFavorite } = useUserData();
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const isUpcoming = match.status === 'UPCOMING';

  const isHomeFav = isClubFavorite(match.homeTeam.shortName);
  const isAwayFav = isClubFavorite(match.awayTeam.shortName);
  const isLeagueFav = match.competitionId 
    ? isLeagueFavorite(match.competitionId) 
    : (match.competition ? isLeagueFavorite(match.competition) : false);
  const hasFavorite = isHomeFav || isAwayFav || isLeagueFav;

  return (
    <div
      onClick={onClick}
      className={`bg-brand-surface rounded-none border ${
        hasFavorite ? 'border-brand-accent/40' : 'border-brand-border'
      } p-5 shadow-sm hover:border-brand-accent/70 hover:scale-[1.01] transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group`}
    >
      {/* Visual Live indicator left bar */}
      {isLive && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand-accent"></span>
      )}

      {/* Card Header: League name & Status */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-brand-border">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center justify-center w-5 h-5 bg-brand-elevated text-brand-text-primary text-xs font-semibold rounded-none">
            ⚽
          </span>
          <span className="text-xs font-semibold text-brand-text-secondary font-mono tracking-wider uppercase flex items-center gap-1.5">
            <span>{match.competition}</span>
            {hasFavorite && (
              <span className="inline-flex items-center px-1.5 py-0.2 bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-[9px] font-mono font-black uppercase" title="Includes saved favorite">
                <Star className="w-2.5 h-2.5 fill-brand-accent stroke-none mr-0.5" />
                FAV
              </span>
            )}
          </span>
        </div>


        {isLive ? (
          <div className="flex items-center space-x-1 px-2.5 py-0.5 bg-brand-accent/10 text-brand-accent border border-brand-accent/30 font-mono text-[11px] font-bold uppercase animate-pulse rounded-none">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
            <span>{match.minute}' LIVE</span>
          </div>
        ) : isFinished ? (
          <span className="px-2.5 py-0.5 bg-brand-elevated text-brand-text-secondary font-mono text-[11px] font-bold uppercase rounded-none border border-brand-border">
            FINISHED
          </span>
        ) : (
          <span className="px-2.5 py-0.5 bg-brand-accent/10 text-brand-accent border border-brand-accent/20 font-mono text-[11px] font-bold uppercase rounded-none">
            {match.time}
          </span>
        )}
      </div>

      {/* Card Body: Teams and Scores */}
      <div className="space-y-4">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TeamLogo shortName={match.homeTeam.shortName} size="md" />
            <span className={`font-display text-sm font-semibold transition-colors group-hover:text-brand-accent ${
              isFinished && match.homeTeam.score !== undefined && match.awayTeam.score !== undefined && match.homeTeam.score < match.awayTeam.score 
                ? 'text-brand-text-secondary' 
                : 'text-brand-text-primary'
            }`}>
              {match.homeTeam.name}
            </span>
          </div>
          {!isUpcoming && match.homeTeam.score !== undefined ? (
            <span className={`font-display font-extrabold text-lg text-brand-text-primary`}>
              {match.homeTeam.score}
            </span>
          ) : (
            <span className="text-brand-text-secondary font-mono text-sm">-</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TeamLogo shortName={match.awayTeam.shortName} size="md" />
            <span className={`font-display text-sm font-semibold transition-colors group-hover:text-brand-accent ${
              isFinished && match.homeTeam.score !== undefined && match.awayTeam.score !== undefined && match.awayTeam.score < match.homeTeam.score 
                ? 'text-brand-text-secondary' 
                : 'text-brand-text-primary'
            }`}>
              {match.awayTeam.name}
            </span>
          </div>
          {!isUpcoming && match.awayTeam.score !== undefined ? (
            <span className={`font-display font-extrabold text-lg text-brand-text-primary`}>
              {match.awayTeam.score}
            </span>
          ) : (
            <span className="text-brand-text-secondary font-mono text-sm">-</span>
          )}
        </div>
      </div>

      {/* Card Footer: Stadium venue info */}
      <div className="mt-5 pt-3 border-t border-brand-border flex items-center justify-between text-[11px] text-brand-text-secondary font-mono">
        <span className="truncate max-w-[180px]">🏟️ {match.venue}</span>
        {isLive && (
          <span className="text-brand-accent font-semibold animate-pulse uppercase">● Live</span>
        )}
      </div>
    </div>
  );
}

