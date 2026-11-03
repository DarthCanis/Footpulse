import React, { useState } from 'react';
import { Match, MatchStatus } from '../types';
import MatchCard from './MatchCard';
import MatchDetailsModal from './MatchDetailsModal';
import { Calendar, Filter, Star, Info, ListFilter, Play, Activity, Settings2, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';
import { useMatches } from '../context/MatchContext';
import { useUserData } from '../hooks/useUserData';
import TeamLogo from './TeamLogo';

export default function MatchCenter() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showConsole, setShowConsole] = useState<boolean>(false);

  const { 
    matches, 
    isSimulating, 
    setIsSimulating, 
    triggerSimulatedGoal, 
    kickoffMatch, 
    resetMatch,
    isLoadingMatches,
    lastUpdated,
    demoMode,
    revalidateAll
  } = useMatches();

  const { isClubFavorite, isLeagueFavorite } = useUserData();

  // Triple the array to ensure a continuous seamless scrolling marquee loop
  const tickerMatches = matches.length > 0 ? [...matches, ...matches, ...matches] : [];

  const filterTabs = [
    { id: 'ALL', label: 'All Fixtures' },
    { id: 'LIVE', label: matches.some(m => m.status === 'LIVE') ? 'Live Matches 🔴' : 'Live Matches' },
    { id: 'FAVORITES', label: '★ My Favorites' },
    { id: 'UPCOMING', label: 'Upcoming Fixtures' },
    { id: 'FINISHED', label: 'Recent Results' },
  ];

  const filteredMatches = matches.filter((match) => {
    if (selectedStatus === 'ALL') return true;
    if (selectedStatus === 'FAVORITES') {
      const leagueFav = match.competitionId 
        ? isLeagueFavorite(match.competitionId) 
        : (match.competition ? isLeagueFavorite(match.competition) : false);
      return (
        isClubFavorite(match.homeTeam.shortName) ||
        isClubFavorite(match.awayTeam.shortName) ||
        leagueFav
      );
    }
    return match.status === selectedStatus;
  }).sort((a, b) => {
    if (selectedStatus === 'UPCOMING') {
      return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
    }
    if (selectedStatus === 'FINISHED') {
      return `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`);
    }
    return 0;
  });


  // Sync selected match details with live ticker scores
  const activeSelectedMatch = selectedMatch
    ? matches.find((m) => m.id === selectedMatch.id) || selectedMatch
    : null;

  return (
    <div className="space-y-6 py-2">
      
      {/* Real-time Scrolling Score Ticker (TV Broadcast Style) */}
      <div className="bg-brand-surface border border-brand-border rounded-none overflow-hidden shadow-2xl flex items-stretch h-12 relative">
        {/* Fixed TV-style Live Feeds header */}
        <div className="flex items-center space-x-2 px-4 bg-[#0A0B0E] border-r border-brand-border shrink-0 z-10 select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-live opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-live"></span>
          </span>
          <span className="font-display font-black text-[10px] tracking-widest uppercase text-brand-text-primary flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-brand-live" />
            <span>TICKER FEED</span>
          </span>
        </div>

        {/* Scrolling area */}
        <div className="flex-1 overflow-hidden relative flex items-center bg-[#111318]/60">
          <div className="flex whitespace-nowrap animate-marquee py-2 space-x-4 items-center">
            {tickerMatches.length > 0 ? (
              tickerMatches.map((match, idx) => (
                <div
                  key={`${match.id}-ticker-${idx}`}
                  onClick={() => setSelectedMatch(match)}
                  className="inline-flex items-center space-x-3 px-3.5 py-1.5 bg-[#161920]/40 hover:bg-[#161920] hover:border-brand-accent/30 border border-brand-border rounded-none transition-all cursor-pointer h-9 shrink-0 text-xs font-semibold group select-none"
                >
                  {/* Status Tag */}
                  <span className="font-mono text-[8px] font-black uppercase px-1.5 py-0.5 rounded-none bg-brand-bg text-brand-text-secondary flex items-center space-x-1 border border-brand-border">
                    {match.status === 'LIVE' ? (
                      <>
                        <span className="w-1 h-1 rounded-full bg-brand-live animate-pulse"></span>
                        <span className="text-brand-live font-black">{match.minute}'</span>
                      </>
                    ) : match.status === 'FINISHED' ? (
                      <span className="text-brand-text-secondary font-black">FT</span>
                    ) : (
                      <span className="text-brand-accent font-black">{match.time}</span>
                    )}
                  </span>

                  {/* Home Team */}
                  <div className="flex items-center space-x-1.5">
                    <TeamLogo shortName={match.homeTeam.shortName} size="xs" />
                    <span className="font-display font-black uppercase text-brand-text-primary group-hover:text-brand-accent transition-colors">
                      {match.homeTeam.shortName}
                    </span>
                  </div>

                  {/* Score or VS */}
                  <div className="flex items-center space-x-1 bg-brand-bg px-2 py-0.5 rounded-none font-mono text-[10px] font-black border border-brand-border">
                    {match.status === 'UPCOMING' ? (
                      <span className="text-brand-text-secondary text-[8px] tracking-widest font-sans uppercase">VS</span>
                    ) : (
                      <>
                        <span className={match.status === 'LIVE' ? 'text-brand-live font-black' : 'text-brand-text-primary'}>
                          {match.homeTeam.score}
                        </span>
                        <span className="text-brand-border">:</span>
                        <span className={match.status === 'LIVE' ? 'text-brand-live font-black' : 'text-brand-text-primary'}>
                          {match.awayTeam.score}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center space-x-1.5">
                    <span className="font-display font-black uppercase text-brand-text-primary group-hover:text-brand-accent transition-colors">
                      {match.awayTeam.shortName}
                    </span>
                    <TeamLogo shortName={match.awayTeam.shortName} size="xs" />
                  </div>
                </div>
              ))
            ) : (
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary px-4">
                NO LIVE TELEMETRY FEEDS ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Strip & Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-brand-surface p-4 border border-brand-border">
        
        {/* Date visual mockup & Sync Telemetry */}
        <div className="flex flex-wrap items-center gap-4 self-start lg:self-auto">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[8px] text-brand-text-secondary font-black uppercase tracking-widest font-mono">Today's Schedule</span>
              <span className="text-xs font-black text-brand-text-primary uppercase tracking-tight font-display">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="flex flex-col text-[10px] border-l border-brand-border pl-4 space-y-0.5">
            <div className="flex items-center space-x-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
              <span className="text-brand-accent font-bold">
                {demoMode ? 'SIMULATOR MODE' : 'LIVE TELEMETRY ACTIVE'}
              </span>
            </div>
            <div className="text-brand-text-secondary font-mono flex items-center space-x-2">
              <span>SYNCED {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <button
                onClick={() => revalidateAll()}
                disabled={isLoadingMatches}
                className="text-brand-accent hover:underline uppercase font-mono font-black tracking-widest text-[9px] cursor-pointer inline-flex items-center space-x-0.5"
                title="Sync Live Match Scores"
              >
                <span>[RE-SYNC]</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Simulator Control Dashboard (Visible only in demo mode) */}
        {demoMode && (
          <div className="flex items-center justify-between sm:justify-start flex-wrap gap-2.5 bg-brand-bg p-2 border border-brand-border w-full lg:w-auto">
            <div className="flex items-center space-x-1.5 px-2">
              <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-brand-accent animate-pulse' : 'bg-brand-live'}`}></span>
              <span className="text-[9px] uppercase font-mono font-black text-brand-text-secondary tracking-widest">
                {isSimulating ? 'SIM ENGINE LIVE' : 'SIM ENGINE IDLE'}
              </span>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest transition-colors cursor-pointer flex-1 sm:flex-none border ${
                  isSimulating
                    ? 'bg-brand-accent/10 hover:bg-brand-accent/25 text-brand-accent border-brand-accent/25'
                    : 'bg-brand-accent hover:bg-red-600 text-white border-transparent'
                }`}
              >
                {isSimulating ? 'PAUSE ENGINE' : 'START ENGINE'}
              </button>
              <button
                onClick={() => {
                  const liveGames = matches.filter((m) => m.status === 'LIVE');
                  if (liveGames.length > 0) {
                    const randomGame = liveGames[Math.floor(Math.random() * liveGames.length)];
                    triggerSimulatedGoal(randomGame.id);
                  } else {
                    const upcomingGames = matches.filter((m) => m.status === 'UPCOMING');
                    if (upcomingGames.length > 0) {
                      triggerSimulatedGoal(upcomingGames[0].id);
                    } else if (matches.length > 0) {
                      triggerSimulatedGoal(matches[0].id);
                    }
                  }
                }}
                className="px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest bg-brand-live hover:bg-[#FF2B2B]/90 text-brand-text-primary cursor-pointer flex-1 sm:flex-none"
                title="Scores a goal immediately for testing."
              >
                FORCE GOAL ⚽
              </button>
              <button
                onClick={() => setShowConsole(!showConsole)}
                className={`px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex-1 sm:flex-none border flex items-center justify-center gap-1 ${
                  showConsole
                    ? 'bg-brand-accent text-white border-transparent'
                    : 'bg-brand-surface text-brand-text-secondary border-brand-border hover:bg-brand-elevated'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>DECKS {showConsole ? 'OPEN' : 'EDIT'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Status filters */}
        <div className="flex flex-wrap gap-1 w-full lg:w-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-black transition-all cursor-pointer flex-1 lg:flex-none text-center rounded-none ${
                selectedStatus === tab.id
                  ? 'bg-brand-accent text-white border border-transparent'
                  : 'bg-brand-bg hover:bg-brand-elevated text-brand-text-secondary border border-brand-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Live Simulation Control Panel (Visible only in demo mode) */}
      {demoMode && showConsole && (
        <div className="bg-brand-surface border border-brand-border rounded-none p-5 space-y-4 animate-slide-down">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border pb-3 gap-2">
            <div>
              <h3 className="font-display font-black text-xs text-brand-text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-accent" />
                <span>Simulation Command Deck</span>
              </h3>
              <p className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider">Directly control scores, kickoffs, and state transitions of matches for testing.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  matches.forEach((m) => {
                    if (m.status === 'UPCOMING') kickoffMatch(m.id);
                  });
                }}
                className="px-2.5 py-1.5 bg-brand-accent/10 hover:bg-brand-accent/20 text-brand-accent text-[9px] font-black uppercase tracking-widest transition-all border border-brand-accent/20 cursor-pointer"
              >
                KICKOFF ALL ⏱️
              </button>
              <button
                onClick={() => {
                  matches.forEach((m) => resetMatch(m.id));
                }}
                className="px-2.5 py-1.5 bg-brand-bg hover:bg-brand-elevated text-brand-text-secondary text-[9px] font-black uppercase tracking-widest transition-all border border-brand-border cursor-pointer"
              >
                RESET ALL 🔄
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-1">
            {matches.map((match) => (
              <div key={`console-${match.id}`} className="bg-brand-bg p-3.5 border border-brand-border flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] uppercase font-bold text-brand-text-secondary">{match.competition}</span>
                  <span className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded-none border ${
                    match.status === 'LIVE' ? 'bg-[#FF2B2B]/10 text-brand-live border-[#FF2B2B]/20' :
                    match.status === 'FINISHED' ? 'bg-brand-surface text-brand-text-secondary border-brand-border' : 'bg-brand-accent/10 text-brand-accent border-brand-accent/20'
                  }`}>
                    {match.status === 'LIVE' ? `${match.minute}' LIVE` : match.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-black uppercase tracking-tight">
                  <div className="flex items-center space-x-2">
                    <TeamLogo shortName={match.homeTeam.shortName} size="xs" />
                    <span className="text-brand-text-primary">{match.homeTeam.name}</span>
                  </div>
                  <span className="font-mono font-black text-brand-text-secondary">
                    {match.status === 'UPCOMING' ? 'vs' : `${match.homeTeam.score} - ${match.awayTeam.score}`}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-brand-text-primary">{match.awayTeam.name}</span>
                    <TeamLogo shortName={match.awayTeam.shortName} size="xs" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-2 border-t border-brand-border">
                  {match.status === 'UPCOMING' ? (
                    <button
                      onClick={() => kickoffMatch(match.id)}
                      className="w-full py-1 bg-brand-accent hover:bg-red-600 text-white font-black rounded-none text-[9px] uppercase cursor-pointer transition-colors"
                    >
                      KICKOFF LIVE ⏱️
                    </button>
                  ) : match.status === 'LIVE' ? (
                    <>
                      <button
                        onClick={() => triggerSimulatedGoal(match.id, match.homeTeam.shortName)}
                        className="flex-1 py-1 bg-brand-surface hover:bg-brand-elevated text-brand-text-primary font-black border border-brand-border text-[9px] uppercase cursor-pointer transition-colors"
                      >
                        + HOME GOAL ⚽
                      </button>
                      <button
                        onClick={() => triggerSimulatedGoal(match.id, match.awayTeam.shortName)}
                        className="flex-1 py-1 bg-brand-surface hover:bg-brand-elevated text-brand-text-primary font-black border border-brand-border text-[9px] uppercase cursor-pointer transition-colors"
                      >
                        + AWAY GOAL ⚽
                      </button>
                      <button
                        onClick={() => resetMatch(match.id)}
                        className="p-1.5 bg-brand-surface hover:bg-brand-elevated text-brand-text-secondary hover:text-brand-accent border border-brand-border cursor-pointer transition-colors"
                        title="Reset Match"
                      >
                        🔄
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => resetMatch(match.id)}
                      className="w-full py-1 bg-brand-surface hover:bg-brand-elevated text-brand-text-secondary font-black border border-brand-border text-[9px] uppercase cursor-pointer transition-colors"
                    >
                      RESET MATCH 🔄
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Notice Banner */}
      {selectedStatus === 'LIVE' && filteredMatches.length > 0 && (
        <div className="bg-[#FF2B2B]/5 border border-[#FF2B2B]/20 text-brand-live p-4 rounded-none flex items-center space-x-3 text-xs font-semibold animate-pulse uppercase tracking-wider font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-live"></span>
          <span>LIVE FOOTPULSE telemetry links active. Goal tickers and in-play updates are syncing instantly.</span>
        </div>
      )}

      {/* API Configuration Guide Banner (No Mock Data fallback in production) */}
      {demoMode && (
        <div className="bg-brand-surface border border-brand-accent/30 p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-accent"></div>
          <div className="flex items-center space-x-2 text-brand-accent">
            <Settings2 className="w-4 h-4 animate-pulse" />
            <span className="font-display font-black text-xs uppercase tracking-wider">TELEMETRY ENGINE ONLINE • SECURE API KEY CONFIGURATION REQUIRED</span>
          </div>
          <p className="text-xs text-brand-text-secondary leading-relaxed">
            FootPulse is integrated with a premium, direct real-time football telemetry engine (<strong className="text-brand-text-primary">API-Football</strong>). To display verified live scores, elapsed match minutes, standings, match events, and player statistics:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-[#0D0E12] p-3.5 border border-brand-border/80 space-y-2">
              <span className="block text-[9px] font-mono text-brand-text-primary font-black uppercase tracking-widest">1. OBTAIN TELEMETRY TOKEN</span>
              <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                Register for a developer account at <a href="https://dashboard.api-football.com" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline inline-flex items-center gap-0.5">api-football.com</a> to retrieve your secure API key credentials.
              </p>
            </div>
            <div className="bg-[#0D0E12] p-3.5 border border-brand-border/80 space-y-2">
              <span className="block text-[9px] font-mono text-brand-text-primary font-black uppercase tracking-widest">2. SET ENVIRONMENT SECRET</span>
              <p className="text-[11px] text-brand-text-secondary leading-relaxed">
                Add <code className="text-brand-text-primary bg-brand-surface px-1.5 py-0.5 border border-brand-border text-[10px] font-mono font-bold">FOOTBALL_API_KEY</code> as a secure environment secret in your <code className="text-brand-text-primary font-mono bg-brand-surface px-1.5 py-0.5 border border-brand-border">.env.local</code> file or via your cloud deployment secrets panel.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Matches Grid */}
      {isLoadingMatches ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">CONNECTING TELEMETRY FEEDS...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 bg-brand-surface border border-brand-border p-6 space-y-3">
          <div className="w-12 h-12 rounded-none bg-brand-bg flex items-center justify-center mx-auto text-brand-text-secondary border border-brand-border">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">LIVE TELEMETRY OFFLINE</p>
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onClick={() => setSelectedMatch(match)}
            />
          ))}
        </div>
      ) : selectedStatus === 'FAVORITES' ? (
        <div className="text-center py-16 bg-brand-surface border border-brand-border p-8 space-y-4">
          <div className="w-12 h-12 rounded-none bg-brand-bg flex items-center justify-center mx-auto text-brand-accent border border-brand-border">
            <Star className="w-6 h-6 fill-brand-accent stroke-brand-accent" />
          </div>
          <div>
            <h3 className="text-sm font-black font-display uppercase tracking-widest text-brand-text-primary">
              NO MATCHES FOR YOUR SAVED FAVORITES
            </h3>
            <p className="text-xs font-mono uppercase tracking-wider text-brand-text-secondary mt-1.5 max-w-md mx-auto">
              You haven't favorited any clubs or leagues playing in this window. Click the star icon next to your favorite clubs or leagues to personalize this match feed.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => setSelectedStatus('ALL')}
              className="text-xs text-brand-accent font-black border border-brand-accent/30 bg-brand-accent/10 px-4 py-2 hover:bg-brand-accent hover:text-white transition-all cursor-pointer uppercase font-mono tracking-wider"
            >
              VIEW ALL MATCHES
            </button>
          </div>
        </div>
      ) : selectedStatus === 'LIVE' ? (
        <div className="text-center py-16 bg-brand-surface border border-brand-border p-8 space-y-4">
          <div className="w-12 h-12 rounded-none bg-brand-bg flex items-center justify-center mx-auto text-brand-live border border-brand-border">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black font-display uppercase tracking-widest text-brand-text-primary">
              NO LIVE MATCHES CURRENTLY IN PROGRESS
            </h3>
            <p className="text-xs font-mono uppercase tracking-wider text-brand-text-secondary mt-1.5 max-w-md mx-auto">
              There are currently no active matches underway. Telemetry feeds continuously monitor kickoff clocks. Check upcoming fixtures or view recent results below.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => setSelectedStatus('UPCOMING')}
              className="text-xs text-brand-accent font-black border border-brand-accent/30 bg-brand-accent/10 px-4 py-2 hover:bg-brand-accent hover:text-white transition-all cursor-pointer uppercase font-mono tracking-wider"
            >
              VIEW UPCOMING FIXTURES
            </button>
            <button
              onClick={() => setSelectedStatus('FINISHED')}
              className="text-xs text-brand-text-secondary font-black border border-brand-border bg-brand-bg px-4 py-2 hover:bg-brand-elevated hover:text-brand-text-primary transition-all cursor-pointer uppercase font-mono tracking-wider"
            >
              VIEW RECENT RESULTS
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-brand-surface border border-brand-border p-6 space-y-3">
          <div className="w-12 h-12 rounded-none bg-brand-bg flex items-center justify-center mx-auto text-brand-text-secondary border border-brand-border">
            <ListFilter className="w-6 h-6" />
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">NO FIXTURES FOR "{selectedStatus}"</p>
          <button
            onClick={() => setSelectedStatus('ALL')}
            className="text-xs text-brand-accent font-black border border-brand-accent/20 bg-brand-accent/5 px-4 py-2 hover:bg-brand-accent/10 transition-all cursor-pointer"
          >
            SHOW ALL FIXTURES
          </button>
        </div>
      )}

      {/* Full stats match modal */}
      {activeSelectedMatch && (
        <MatchDetailsModal
          match={activeSelectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}

    </div>
  );
}
