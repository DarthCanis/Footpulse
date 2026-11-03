import React, { useState } from 'react';
import { Club } from '../types';
import { Trophy, Users, Star, ArrowRight, Shield, MapPin, X, Search } from 'lucide-react';
import TeamLogo from './TeamLogo';
import { useClubs } from '../hooks/useClubs';
import { useUserData } from '../hooks/useUserData';

interface PopularClubsProps {
  clubs?: Club[];
  onSelectClub?: (club: Club) => void;
  limit?: number;
}

export default function PopularClubs({ clubs: propClubs, onSelectClub, limit }: PopularClubsProps) {
  const { clubs: fetchedClubs, isLoading } = useClubs();
  const { isClubFavorite, toggleFavoriteClub } = useUserData();
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');

  const allClubs = propClubs && propClubs.length > 0 ? propClubs : fetchedClubs;
  const filterCategories = ['ALL', '★ FAVORITES', 'England', 'Spain', 'Germany', 'Italy', 'France'];

  const filteredClubs = allClubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.squad.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    let matchesCountry = true;
    if (selectedCountry === '★ FAVORITES') {
      matchesCountry = isClubFavorite(club.shortName);
    } else if (selectedCountry !== 'ALL') {
      matchesCountry = club.country.toLowerCase() === selectedCountry.toLowerCase();
    }

    return matchesSearch && matchesCountry;
  });

  const displayClubs = limit ? filteredClubs.slice(0, limit) : filteredClubs;

  if (isLoading && allClubs.length === 0) {
    return (
      <div className="text-center py-16 bg-brand-surface border border-brand-border p-6 space-y-3 animate-fade-in rounded-none">
        <div className="w-8 h-8 rounded-none border-2 border-brand-accent border-t-transparent animate-spin mx-auto"></div>
        <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">LOADING VERIFIED CLUB PROFILES & ROSTERS...</p>
      </div>
    );
  }

  if (displayClubs.length === 0 && !isLoading) {
    return (
      <div className="text-center py-16 bg-brand-surface border border-brand-border p-6 space-y-3 animate-fade-in rounded-none">
        <div className="w-12 h-12 rounded-none bg-brand-bg flex items-center justify-center mx-auto text-brand-text-secondary border border-brand-border">
          <Shield className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">
          {selectedCountry === '★ FAVORITES' ? 'NO FAVORITE CLUBS PINNED YET' : 'NO CLUBS FOUND MATCHING FILTER'}
        </p>
        {selectedCountry === '★ FAVORITES' && (
          <p className="text-xs text-brand-text-secondary">Click the star icon on any club card below to add it to your favorites.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Country Filter Controls (Shown on full view without limit) */}
      {!limit && (
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-brand-surface p-4 border border-brand-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <input
              type="text"
              placeholder="Search club, manager, or player name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border pl-9 pr-4 py-2 text-xs text-brand-text-primary focus:outline-none focus:border-brand-accent font-sans"
            />
          </div>
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            {filterCategories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCountry(c)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCountry === c
                    ? 'bg-brand-accent text-white border border-brand-accent'
                    : 'bg-brand-bg hover:bg-brand-elevated text-brand-text-secondary border border-brand-border'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Clubs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayClubs.map((club) => {
          const isFav = isClubFavorite(club.shortName);
          return (
            <div
              key={club.id}
              onClick={() => {
                if (onSelectClub) onSelectClub(club);
                setSelectedClub(club);
              }}
              className={`bg-brand-surface border ${
                isFav ? 'border-brand-accent/60' : 'border-brand-border'
              } p-5 shadow-sm hover:border-brand-accent transition-all duration-300 cursor-pointer flex flex-col justify-between group rounded-none relative`}
            >
              <div>
                {/* Club Header Badge & Quick Favorite Star */}
                <div className="flex items-center justify-between pb-4 border-b border-brand-border">
                  <div className="flex items-center space-x-3">
                    <TeamLogo shortName={club.shortName} size="md" />
                    <div>
                      <h3 className="font-display font-black text-base text-brand-text-primary group-hover:text-brand-accent transition-colors duration-300 uppercase">
                        {club.name}
                      </h3>
                      <p className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-wider">
                        {club.country} • {club.stadium}
                      </p>
                    </div>
                  </div>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteClub(club.shortName);
                    }}
                    className={`p-2 transition-all cursor-pointer rounded-none border ${
                      isFav
                        ? 'bg-brand-accent text-white border-brand-accent'
                        : 'bg-brand-bg text-brand-text-secondary hover:text-brand-accent hover:border-brand-accent/40 border-brand-border'
                    }`}
                    title={isFav ? 'Remove from favorite clubs' : 'Save to favorite clubs'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-white stroke-none' : 'stroke-[2.5]'}`} />
                  </button>
                </div>

                {/* Club mini statistics */}
                <div className="grid grid-cols-4 gap-2 text-center py-4 text-xs font-semibold font-mono border-b border-brand-border/60">
                  <div className="bg-brand-bg p-2 border border-brand-border rounded-none">
                    <span className="block text-[8px] text-brand-text-secondary font-sans font-black uppercase tracking-wider">POS</span>
                    <span className="text-brand-text-primary text-xs font-black">#{club.stats.position}</span>
                  </div>
                  <div className="bg-brand-bg p-2 border border-brand-border rounded-none">
                    <span className="block text-[8px] text-brand-text-secondary font-sans font-black uppercase tracking-wider">WON</span>
                    <span className="text-brand-text-primary text-xs font-black">{club.stats.won}</span>
                  </div>
                  <div className="bg-brand-bg p-2 border border-brand-border rounded-none">
                    <span className="block text-[8px] text-brand-text-secondary font-sans font-black uppercase tracking-wider">GD</span>
                    <span className="text-brand-text-primary text-xs font-black">
                      {club.stats.goalsFor - club.stats.goalsAgainst > 0 ? `+` : ''}
                      {club.stats.goalsFor - club.stats.goalsAgainst}
                    </span>
                  </div>
                  <div className="bg-brand-accent/10 text-brand-accent p-2 border border-brand-accent/20 rounded-none">
                    <span className="block text-[8px] text-brand-accent font-sans font-black uppercase tracking-wider">PTS</span>
                    <span className="text-brand-accent text-xs font-black">{club.stats.points}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Facts */}
              <div className="pt-4 flex items-center justify-between text-[10px] text-brand-text-secondary font-mono uppercase tracking-wider">
                <span>MGR: {club.manager}</span>
                <span className="text-brand-accent group-hover:translate-x-1 transition-transform flex items-center space-x-1 font-black font-sans tracking-widest text-[9px]">
                  <span>SQUAD INTEL</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Club Squad & Details Modal */}
      {selectedClub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0B0E]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface text-brand-text-primary rounded-none max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-brand-border">
            
            {/* Modal Cover Header */}
            <div className="bg-brand-bg p-6 relative border-b border-brand-border">
              <button
                onClick={() => setSelectedClub(null)}
                className="absolute top-4 right-4 p-1.5 border border-brand-border hover:border-brand-accent/40 bg-brand-surface text-brand-text-secondary hover:text-brand-text-primary transition-colors cursor-pointer rounded-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                <TeamLogo shortName={selectedClub.shortName} size="lg" />
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h2 className="font-display font-black text-xl sm:text-2xl tracking-tight text-brand-text-primary leading-none uppercase">
                      {selectedClub.name}
                    </h2>
                    <button
                      onClick={() => toggleFavoriteClub(selectedClub.shortName)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center space-x-1 transition-all cursor-pointer ${
                        isClubFavorite(selectedClub.shortName)
                          ? 'bg-brand-accent text-white'
                          : 'bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-brand-primary hover:border-brand-accent'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${isClubFavorite(selectedClub.shortName) ? 'fill-white stroke-none' : ''}`} />
                      <span>{isClubFavorite(selectedClub.shortName) ? 'FAVORITED' : 'FAVORITE'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-wider flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-brand-accent" />
                    <span>Stadium: {selectedClub.stadium} (Cap: {selectedClub.capacity})</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2 text-[9px] font-mono font-bold text-brand-text-secondary uppercase tracking-widest">
                    <span className="bg-brand-surface border border-brand-border px-2 py-0.5 rounded-none">Est. {selectedClub.established}</span>
                    <span className="bg-brand-surface border border-brand-border px-2 py-0.5 rounded-none">MGR: {selectedClub.manager}</span>
                    <span className="bg-brand-surface border border-brand-border px-2 py-0.5 rounded-none">{selectedClub.country}</span>
                  </div>
                </div>
              </div>
            </div>


            {/* Modal Stats Row */}
            <div className="bg-brand-bg/50 px-6 py-4 border-b border-brand-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <span className="block text-[8px] uppercase font-black text-brand-text-secondary font-mono tracking-widest">LEAGUE STATUS</span>
                <span className="text-xs sm:text-sm font-black text-brand-text-primary uppercase">#{selectedClub.stats.position} POSITION</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase font-black text-brand-text-secondary font-mono tracking-widest">RECORD (W-D-L)</span>
                <span className="text-xs sm:text-sm font-black text-brand-text-primary uppercase font-mono">{selectedClub.stats.won}-{selectedClub.stats.drawn}-{selectedClub.stats.lost}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase font-black text-brand-text-secondary font-mono tracking-widest">GOAL DIFF</span>
                <span className="text-xs sm:text-sm font-black text-brand-text-primary uppercase font-mono">+{selectedClub.stats.goalsFor - selectedClub.stats.goalsAgainst}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase font-black text-brand-accent font-mono tracking-widest">TOTAL POINTS</span>
                <span className="text-xs sm:text-sm font-black text-brand-accent uppercase font-mono">{selectedClub.stats.points} PTS</span>
              </div>
            </div>

            {/* Modal Body: Squad Roster List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <h3 className="font-display font-black text-xs text-brand-text-primary uppercase tracking-widest flex items-center space-x-1.5 pb-2 border-b border-brand-border">
                <Users className="w-4 h-4 text-brand-accent" />
                <span>SQUAD ROSTER & PERFORMANCE METRICS</span>
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {selectedClub.squad.map((player) => (
                  <div
                    key={player.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-brand-border bg-brand-bg hover:border-brand-accent/35 transition-all rounded-none"
                  >
                    {/* Player left block */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-none bg-brand-surface text-brand-accent border border-brand-border font-mono font-black text-xs flex items-center justify-center">
                        {player.number}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-brand-text-primary uppercase tracking-tight flex items-center gap-1.5">
                          <span>{player.name}</span>
                          <span className="text-[8px] font-mono px-1.5 py-0.5 border border-brand-border bg-brand-surface text-brand-text-secondary font-bold uppercase tracking-wider">
                            {player.nationality}
                          </span>
                        </h4>
                        <p className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-wider mt-0.5">{player.position} • AGE {player.age}</p>
                      </div>
                    </div>

                    {/* Player right block: stats */}
                    <div className="flex items-center space-x-4 mt-3 sm:mt-0 justify-between sm:justify-end font-mono text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">
                      <div className="text-center sm:text-right">
                        <span className="block text-[8px] text-brand-text-secondary/60">APPS</span>
                        <span className="text-brand-text-primary font-black">{player.stats.appearances}</span>
                      </div>
                      <div className="text-center sm:text-right">
                        <span className="block text-[8px] text-brand-text-secondary/60">
                          {player.position === 'Goalkeeper' ? 'CS' : 'GOALS'}
                        </span>
                        <span className="text-brand-accent font-black">
                          {player.position === 'Goalkeeper' ? player.stats.cleanSheets : player.stats.goals}
                        </span>
                      </div>
                      {player.position !== 'Goalkeeper' && (
                        <div className="text-center sm:text-right">
                          <span className="block text-[8px] text-brand-text-secondary/60">ASST</span>
                          <span className="text-brand-text-primary font-black">{player.stats.assists}</span>
                        </div>
                      )}
                      <div className="text-center sm:text-right pl-3 border-l border-brand-border">
                        <span className="block text-[8px] text-brand-text-secondary/60 flex items-center justify-center gap-0.5">
                          <Star className="w-2.5 h-2.5 text-brand-accent fill-brand-accent" />
                          <span>RATING</span>
                        </span>
                        <span className="text-brand-accent font-black">{player.stats.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-brand-bg/50 border-t border-brand-border text-center text-[9px] text-brand-text-secondary font-mono uppercase tracking-wider">
              <span>CLUB KEY: {selectedClub.id.toUpperCase()} • TELEMETRY SYNCED</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
