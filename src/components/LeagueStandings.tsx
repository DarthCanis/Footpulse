import React, { useState } from 'react';
import { League } from '../types';
import { Trophy, Activity, RefreshCw, Star } from 'lucide-react';
import { useMatches } from '../context/MatchContext';
import { useUserData } from '../hooks/useUserData';
import TeamLogo from './TeamLogo';

export default function LeagueStandings() {
  const [activeLeagueId, setActiveLeagueId] = useState<string>('pl');

  const { leagues, isLoadingStandings } = useMatches();
  const { isLeagueFavorite, toggleFavoriteLeague } = useUserData();

  const activeLeague = leagues.find((l) => l.id === activeLeagueId) || leagues[0];
  const isCurrentLeagueFavorite = activeLeague ? isLeagueFavorite(activeLeague.id) : false;

  if (isLoadingStandings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">LOADING CHAMPIONSHIP STANDINGS...</p>
      </div>
    );
  }

  if (leagues.length === 0 || !activeLeague) {
    return (
      <div className="text-center py-20 bg-brand-surface border border-brand-border p-6 space-y-3 animate-fade-in rounded-none">
        <div className="w-12 h-12 rounded-none bg-brand-bg flex items-center justify-center mx-auto text-brand-text-secondary border border-brand-border">
          <Trophy className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">STANDINGS CURRENTLY UNAVAILABLE</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* League Selection Pills - Flowable wrap container for 5+ leagues */}
      <div className="flex flex-wrap gap-1 bg-brand-surface p-1.5 border border-brand-border rounded-none shadow-md w-full">
        {leagues.map((league) => {
          const isFav = isLeagueFavorite(league.id);
          const isActive = activeLeagueId === league.id;
          return (
            <div
              key={league.id}
              className={`flex-1 min-w-[120px] sm:min-w-0 flex items-center justify-between border transition-all ${
                isActive
                  ? 'bg-brand-accent text-white border-transparent'
                  : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-elevated bg-brand-bg/40 border-brand-border'
              }`}
            >
              <button
                onClick={() => setActiveLeagueId(league.id)}
                className="flex-1 flex items-center space-x-1.5 py-2 px-3 text-[10px] font-black uppercase tracking-wider cursor-pointer"
              >
                <span className="text-sm">{league.logo}</span>
                <span className="truncate">{league.name}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavoriteLeague(league.id);
                }}
                className={`p-2 transition-colors cursor-pointer border-l ${
                  isActive
                    ? 'border-white/20 text-white hover:text-amber-200'
                    : 'border-brand-border text-brand-text-secondary hover:text-brand-accent'
                }`}
                title={isFav ? 'Remove league from favorites' : 'Save league to favorites'}
              >
                <Star className={`w-3.5 h-3.5 ${isFav ? (isActive ? 'fill-white stroke-none' : 'fill-brand-accent stroke-brand-accent') : ''}`} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Main Standings Card */}
      <div className="bg-brand-surface border border-brand-border overflow-hidden rounded-none shadow-md">
        <div className="px-5 py-4 border-b border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-brand-bg">
          <div className="flex items-center space-x-2.5">
            <Trophy className="w-4.5 h-4.5 text-brand-accent" />
            <h3 className="font-display font-black text-xs sm:text-sm text-brand-text-primary uppercase tracking-wider">
              {activeLeague.name} TABLE • 2026 CAMPAIGN
            </h3>
            <span className="text-[10px] font-black text-brand-text-secondary font-mono uppercase tracking-widest hidden sm:inline">
              ({activeLeague.country})
            </span>
          </div>

          {/* Favorite league button in header */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleFavoriteLeague(activeLeague.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                isCurrentLeagueFavorite
                  ? 'bg-brand-accent text-white border-brand-accent shadow-sm'
                  : 'bg-brand-surface text-brand-text-secondary hover:text-brand-text-primary hover:border-brand-accent/50 border-brand-border'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isCurrentLeagueFavorite ? 'fill-white stroke-none' : ''}`} />
              <span>{isCurrentLeagueFavorite ? 'LEAGUE FAVORITED' : 'FAVORITE LEAGUE'}</span>
            </button>
          </div>
        </div>


        {/* Scrollable Table container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-brand-bg/60 border-b border-brand-border text-[9px] font-black text-brand-text-secondary uppercase tracking-widest font-mono">
                <th className="py-3 px-4 text-center w-12">POS</th>
                <th className="py-3 px-4">CLUB</th>
                <th className="py-3 px-3 text-center w-12">P</th>
                <th className="py-3 px-3 text-center w-12">W</th>
                <th className="py-3 px-3 text-center w-12">D</th>
                <th className="py-3 px-3 text-center w-12">L</th>
                <th className="py-3 px-3 text-center w-12">GD</th>
                <th className="py-3 px-4 text-center w-16">PTS</th>
                <th className="py-3 px-4 text-center w-36 hidden sm:table-cell">FORM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {activeLeague.standings.map((row) => {
                const isChampionsLeague = row.position <= 4;
                const isEuropaLeague = row.position === 5;
                const isRelegation = row.position >= Math.max(1, activeLeague.standings.length - 2);

                return (
                  <tr
                    key={row.position}
                    className="hover:bg-brand-elevated/40 transition-colors duration-250"
                  >
                    {/* Position col with side colored flag for leagues */}
                    <td className="py-3 px-4 text-center relative font-mono font-black text-brand-text-primary">
                      {isChampionsLeague && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-brand-accent" title="Champions League Qualification"></span>
                      )}
                      {isEuropaLeague && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#FF8800]" title="Europa League Qualification"></span>
                      )}
                      {isRelegation && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-brand-live" title="Relegation Zone"></span>
                      )}
                      {row.position}
                    </td>

                    {/* Team Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <TeamLogo shortName={row.teamLogo} size="sm" />
                        <span className="font-sans font-extrabold text-xs text-brand-text-primary uppercase tracking-tight">
                          {row.teamName}
                        </span>
                      </div>
                    </td>

                    {/* Match Stats */}
                    <td className="py-3 px-3 text-center font-mono text-brand-text-secondary font-bold">{row.played}</td>
                    <td className="py-3 px-3 text-center font-mono text-brand-text-secondary font-bold">{row.won}</td>
                    <td className="py-3 px-3 text-center font-mono text-brand-text-secondary font-bold">{row.drawn}</td>
                    <td className="py-3 px-3 text-center font-mono text-brand-text-secondary font-bold">{row.lost}</td>
                    <td className={`py-3 px-3 text-center font-mono font-black ${row.gd > 0 ? 'text-brand-accent' : row.gd < 0 ? 'text-brand-live' : 'text-brand-text-secondary'}`}>
                      {row.gd > 0 ? `+${row.gd}` : row.gd}
                    </td>

                    {/* Points */}
                    <td className="py-3 px-4 text-center">
                      <span className="font-display font-black text-brand-text-primary text-xs">{row.points}</span>
                    </td>

                    {/* Form block */}
                    <td className="py-3 px-4 text-center hidden sm:table-cell">
                      <div className="flex items-center justify-center space-x-1">
                        {row.form.map((result, index) => (
                          <span
                            key={index}
                            className={`w-5 h-5 rounded-none flex items-center justify-center font-mono text-[9px] font-black border ${
                              result === 'W'
                                ? 'bg-brand-accent/10 border-brand-accent text-brand-accent'
                                : result === 'D'
                                ? 'bg-brand-elevated border-brand-border text-brand-text-secondary'
                                : 'bg-brand-live/10 border-brand-live text-brand-live'
                            }`}
                            title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend Footer */}
        <div className="px-5 py-3 border-t border-brand-border bg-brand-bg/50 flex flex-wrap gap-4 text-[9px] text-brand-text-secondary font-black uppercase tracking-widest font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-none bg-brand-accent"></span>
            <span>Champions League</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-none bg-[#FF8800]"></span>
            <span>Europa League</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-none bg-brand-live"></span>
            <span>Relegation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
