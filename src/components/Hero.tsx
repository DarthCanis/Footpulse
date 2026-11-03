import React from 'react';
import { Play, TrendingUp, Calendar, Trophy, ArrowRight } from 'lucide-react';
import { Match } from '../types';
import TeamLogo from './TeamLogo';

interface HeroProps {
  onExploreMatches: () => void;
  onExploreNews: () => void;
  liveMatches: Match[];
}

export default function Hero({ onExploreMatches, onExploreNews, liveMatches }: HeroProps) {
  // Take first 2 live or finished matches for quick scoreboard highlight in the hero
  const highlightedMatch = liveMatches.find((m) => m.status === 'LIVE') || liveMatches[0];

  return (
    <div className="relative overflow-hidden bg-brand-bg text-brand-text-primary py-12 md:py-20 lg:py-24 border-b border-brand-border">
      {/* Decorative gradients */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Text Info */}
          <div className="col-span-1 lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-brand-surface border border-brand-border text-brand-accent text-xs font-semibold tracking-wider uppercase font-mono rounded-none">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Matchday Live Ticker Active</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-brand-text-primary leading-[1.1] uppercase">
              Feel the Pulse of <br />
              <span className="text-brand-accent">
                Football
              </span>
            </h1>

            <p className="text-brand-text-secondary text-base sm:text-lg max-w-xl leading-relaxed">
              Welcome to FootPulse, the modern hub for football fans. Track real-time scores, tactical breakdowns, in-depth player statistics, and live standings across top European leagues.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onExploreMatches}
                className="flex items-center space-x-2 px-6 py-3.5 bg-brand-accent hover:bg-brand-accent-hover font-bold text-sm text-white shadow-lg shadow-brand-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer rounded-none uppercase tracking-wider"
              >
                <Calendar className="w-4 h-4" />
                <span>View Match Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onExploreNews}
                className="flex items-center space-x-2 px-6 py-3.5 bg-brand-surface hover:bg-brand-elevated border border-brand-border font-bold text-sm text-brand-text-primary hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer rounded-none uppercase tracking-wider"
              >
                <span>Read Latest News</span>
              </button>
            </div>

            {/* Quick stats / Features row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-border max-w-lg">
              <div>
                <span className="block font-display font-bold text-2xl text-brand-text-primary">6+</span>
                <span className="text-xs text-brand-text-secondary">Major Leagues</span>
              </div>
              <div>
                <span className="block font-display font-bold text-2xl text-brand-text-primary">100%</span>
                <span className="text-xs text-brand-text-secondary">Detailed Stats</span>
              </div>
              <div>
                <span className="block font-display font-bold text-2xl text-brand-accent">Live</span>
                <span className="text-xs text-brand-text-secondary">Match Updates</span>
              </div>
            </div>
          </div>

          {/* Hero Feature Card (Interactive Quick Scoreboard) */}
          <div className="col-span-1 lg:col-span-5">
            {highlightedMatch ? (
              <div className="bg-brand-surface/90 backdrop-blur-md rounded-none p-6 border border-brand-border shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent"></div>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-1.5 text-xs text-brand-text-secondary font-mono">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>{highlightedMatch.competition}</span>
                  </div>
                  {highlightedMatch.status === 'LIVE' ? (
                    <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-brand-accent/10 border border-brand-accent/30 text-brand-accent text-xs font-bold font-mono uppercase animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                      <span>{highlightedMatch.minute}' LIVE</span>
                    </div>
                  ) : highlightedMatch.status === 'UPCOMING' ? (
                    <div className="text-xs text-brand-accent font-semibold font-mono bg-brand-accent/10 px-2 py-0.5">
                      Upcoming • {highlightedMatch.time}
                    </div>
                  ) : (
                    <div className="text-xs text-brand-text-secondary font-bold font-mono bg-brand-elevated px-2 py-0.5">
                      FT
                    </div>
                  )}
                </div>

                {/* Scoreboard block */}
                <div className="space-y-6">
                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <TeamLogo shortName={highlightedMatch.homeTeam.shortName} size="md" />
                      <span className="font-display font-semibold text-base text-brand-text-primary group-hover:text-brand-accent transition-colors">
                        {highlightedMatch.homeTeam.name}
                      </span>
                    </div>
                    {highlightedMatch.status !== 'UPCOMING' ? (
                      <span className="font-display font-extrabold text-2xl text-brand-text-primary">
                        {highlightedMatch.homeTeam.score}
                      </span>
                    ) : (
                      <span className="text-brand-text-secondary text-sm font-mono">-</span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <TeamLogo shortName={highlightedMatch.awayTeam.shortName} size="md" />
                      <span className="font-display font-semibold text-base text-brand-text-primary group-hover:text-brand-accent transition-colors">
                        {highlightedMatch.awayTeam.name}
                      </span>
                    </div>
                    {highlightedMatch.status !== 'UPCOMING' ? (
                      <span className="font-display font-extrabold text-2xl text-brand-text-primary">
                        {highlightedMatch.awayTeam.score}
                      </span>
                    ) : (
                      <span className="text-brand-text-secondary text-sm font-mono">-</span>
                    )}
                  </div>
                </div>

                {/* Match Details Footer */}
                <div className="mt-6 pt-4 border-t border-brand-border flex justify-between items-center text-xs text-brand-text-secondary font-mono">
                  <span>🏟️ {highlightedMatch.venue}</span>
                  {highlightedMatch.referee && <span>🏁 {highlightedMatch.referee}</span>}
                </div>

                {/* Quick Link Overlay */}
                <div className="mt-4">
                  <button
                    onClick={onExploreMatches}
                    className="w-full py-2.5 bg-brand-elevated hover:bg-brand-border hover:text-white text-brand-text-primary text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer uppercase font-mono tracking-wider"
                  >
                    <span>Analyze Match Statistics</span>
                    <Play className="w-3 h-3 text-brand-accent fill-brand-accent" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-brand-surface/90 backdrop-blur-md rounded-none p-6 border border-brand-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent"></div>
                <div className="text-center py-10 space-y-3">
                  <div className="w-10 h-10 rounded-none bg-brand-elevated flex items-center justify-center mx-auto text-brand-text-secondary border border-brand-border">
                    <Trophy className="w-5 h-5 text-brand-text-secondary" />
                  </div>
                  <p className="text-xs font-semibold text-brand-text-primary">Live football data is currently unavailable.</p>
                  <p className="text-[11px] text-brand-text-secondary">No verified football updates available.</p>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
