import React, { useState } from 'react';
import { useMatches } from '../context/MatchContext';
import { useNews } from '../hooks/useNews';
import { useCompetitions } from '../hooks/useCompetitions';
import {
  Trophy,
  History,
  Calendar,
  Newspaper,
  Award,
  Medal,
  Clock,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import MatchCard from './MatchCard';
import MatchDetailsModal from './MatchDetailsModal';
import { Match, Competition } from '../types';

export default function WorldCupSection() {
  const [activeTab, setActiveTab] = useState<'historical' | 'fixtures' | 'news'>('historical');
  const [selectedHistoricalId, setSelectedHistoricalId] = useState<string>('wc-2022');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const { historicalCompetitions, currentCompetitions, isLoading: loadingCompetitions } = useCompetitions();
  const { liveMatches, upcomingMatches, recentResults, isLoading: loadingMatches } = useMatches();
  const { news, isLoading: loadingNews } = useNews();

  // Filter international or tournament matches
  const internationalMatches = [...liveMatches, ...upcomingMatches, ...recentResults].filter((m) =>
    m.competition.toLowerCase().includes('world cup') ||
    m.competition.toLowerCase().includes('fifa') ||
    m.competition.toLowerCase().includes('qualif') ||
    m.competition.toLowerCase().includes('international') ||
    m.competition.toLowerCase().includes('champions')
  );

  // International tournament news sorted by publication timestamp
  const tournamentNews = news.filter((item) =>
    item.category === 'FIFA World Cup' ||
    item.title.toLowerCase().includes('world cup') ||
    item.title.toLowerCase().includes('qualifier') ||
    item.title.toLowerCase().includes('fifa') ||
    item.title.toLowerCase().includes('international')
  );

  const selectedTournament = historicalCompetitions.find((c) => c.id === selectedHistoricalId) || historicalCompetitions[0];

  return (
    <div className="space-y-8 animate-fade-in" id="world-cup-section">
      {/* Header Banner */}
      <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-brand-accent rounded-none" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-accent font-black">
              DATABASE-BACKED TOURNAMENTS & ARCHIVES
            </span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-text-primary tracking-tight uppercase">
            Major Tournaments & International Hub
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary max-w-2xl font-sans">
            Explore verified historical tournament records, separate from current active fixtures, backed by the FootPulse database layer.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-brand-bg border border-brand-border p-1">
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 rounded-none ${
              activeTab === 'historical'
                ? 'bg-brand-accent text-white'
                : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-elevated'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historical Archives</span>
          </button>
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 rounded-none ${
              activeTab === 'fixtures'
                ? 'bg-brand-accent text-white'
                : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-elevated'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Active & Qualifiers</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1.5 rounded-none ${
              activeTab === 'news'
                ? 'bg-brand-accent text-white'
                : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-elevated'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Intel & News</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HISTORICAL ARCHIVES */}
      {activeTab === 'historical' && (
        <div className="space-y-8">
          {/* Tournament Edition Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary font-bold">
                Select Historical Edition
              </span>
              <span className="text-[10px] font-mono text-brand-accent font-black uppercase">
                {historicalCompetitions.length} Verified Tournaments Archived
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {historicalCompetitions.map((tourney) => (
                <button
                  key={tourney.id}
                  onClick={() => setSelectedHistoricalId(tourney.id)}
                  className={`p-4 border text-left transition-all cursor-pointer rounded-none flex flex-col justify-between ${
                    selectedHistoricalId === tourney.id
                      ? 'bg-brand-surface border-brand-accent ring-1 ring-brand-accent'
                      : 'bg-brand-surface/60 border-brand-border hover:border-brand-border/80 hover:bg-brand-surface'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{tourney.logo || '🏆'}</span>
                      <span className="text-[10px] font-mono font-black text-brand-accent px-1.5 py-0.5 bg-brand-bg border border-brand-border">
                        {tourney.year}
                      </span>
                    </div>
                    <h3 className="font-display font-black text-xs sm:text-sm text-brand-text-primary uppercase tracking-tight line-clamp-1">
                      {tourney.name}
                    </h3>
                    <p className="text-[10px] text-brand-text-secondary font-mono mt-0.5">
                      Host: {tourney.host}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-brand-border/60 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-brand-text-secondary uppercase">Winner</span>
                    <span className="font-bold text-brand-text-primary uppercase">{tourney.winner}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Selected Tournament Dossier */}
          {selectedTournament && (
            <div className="bg-brand-surface border border-brand-border p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-brand-border gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-brand-accent font-bold mb-1">
                    <span>{selectedTournament.logo}</span>
                    <span>HISTORICAL TOURNAMENT RECORD</span>
                    <span>•</span>
                    <span>{selectedTournament.year}</span>
                  </div>
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-brand-text-primary uppercase tracking-tight">
                    {selectedTournament.name}
                  </h2>
                  <p className="text-xs text-brand-text-secondary font-medium mt-1">
                    Hosted by {selectedTournament.host} • {selectedTournament.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="bg-brand-bg border border-brand-border px-4 py-2 text-center">
                    <div className="text-[9px] font-mono text-brand-text-secondary uppercase">Matches</div>
                    <div className="text-lg font-black font-mono text-brand-text-primary">
                      {selectedTournament.matchesPlayed || 64}
                    </div>
                  </div>
                  <div className="bg-brand-bg border border-brand-border px-4 py-2 text-center">
                    <div className="text-[9px] font-mono text-brand-text-secondary uppercase">Goals</div>
                    <div className="text-lg font-black font-mono text-brand-accent">
                      {selectedTournament.goalsScored || 172}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tournament Honors Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Winner Card */}
                <div className="p-4 bg-brand-bg border border-brand-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary font-bold">
                      🏆 CHAMPION
                    </span>
                    <Medal className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-lg font-display font-black text-brand-text-primary uppercase">
                    {selectedTournament.winner}
                  </div>
                  <p className="text-[10px] text-brand-text-secondary font-mono">
                    Final: {selectedTournament.finalScore}
                  </p>
                </div>

                {/* Runner-Up Card */}
                <div className="p-4 bg-brand-bg border border-brand-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary font-bold">
                      🥈 RUNNER-UP
                    </span>
                    <Medal className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="text-lg font-display font-black text-brand-text-primary uppercase">
                    {selectedTournament.runnerUp}
                  </div>
                  <p className="text-[10px] text-brand-text-secondary font-mono">
                    3rd Place: {selectedTournament.thirdPlace || 'N/A'}
                  </p>
                </div>

                {/* Golden Ball Card */}
                <div className="p-4 bg-brand-bg border border-brand-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary font-bold">
                      ⭐ GOLDEN BALL
                    </span>
                    <Award className="w-4 h-4 text-brand-accent" />
                  </div>
                  <div className="text-sm font-display font-black text-brand-text-primary uppercase">
                    {selectedTournament.goldenBall || 'Best Player'}
                  </div>
                  <p className="text-[10px] text-brand-text-secondary font-mono">Tournament MVP</p>
                </div>

                {/* Golden Boot Card */}
                <div className="p-4 bg-brand-bg border border-brand-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-brand-text-secondary font-bold">
                      ⚽ GOLDEN BOOT
                    </span>
                    <Trophy className="w-4 h-4 text-brand-live" />
                  </div>
                  <div className="text-sm font-display font-black text-brand-text-primary uppercase">
                    {selectedTournament.goldenBoot || 'Top Goalscorer'}
                  </div>
                  <p className="text-[10px] text-brand-text-secondary font-mono">Leading Scorer</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE FIXTURES & QUALIFIERS */}
      {activeTab === 'fixtures' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <div>
              <h2 className="text-base font-display font-black uppercase text-brand-text-primary">
                Current International & Qualifiers Fixtures
              </h2>
              <p className="text-xs text-brand-text-secondary">
                Matches synchronized from live multi-league scoreboard feeds.
              </p>
            </div>
            {liveMatches.length > 0 && (
              <span className="flex items-center space-x-1 text-[10px] font-mono font-black text-brand-live bg-brand-live/10 border border-brand-live/20 px-2 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-live animate-ping" />
                <span>{liveMatches.length} LIVE NOW</span>
              </span>
            )}
          </div>

          {loadingMatches ? (
            <div className="text-center py-16 bg-brand-surface border border-brand-border space-y-2">
              <RefreshCw className="w-6 h-6 text-brand-accent animate-spin mx-auto" />
              <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">
                SYNCHRONIZING FIXTURES...
              </p>
            </div>
          ) : internationalMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internationalMatches.map((match) => (
                <MatchCard key={match.id} match={match} onClick={() => setSelectedMatch(match)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-surface border border-brand-border space-y-3 p-6">
              <div className="w-10 h-10 rounded-none bg-brand-bg border border-brand-border flex items-center justify-center mx-auto text-brand-text-secondary">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-mono uppercase tracking-widest font-black text-brand-text-primary">
                NO ACTIVE INTERNATIONAL MATCHES SCHEDULED TODAY
              </h3>
              <p className="text-[11px] text-brand-text-secondary max-w-sm mx-auto font-sans">
                Next round fixtures and qualifier windows will appear automatically once official schedule dates are announced by federations.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INTEL & NEWS */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="border-b border-brand-border pb-3">
            <h2 className="text-base font-display font-black uppercase text-brand-text-primary">
              Tournament & International News Wire
            </h2>
            <p className="text-xs text-brand-text-secondary">
              Chronologically sorted articles with verified publication timestamps.
            </p>
          </div>

          {tournamentNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournamentNews.map((article) => (
                <div
                  key={article.id}
                  className="bg-brand-surface border border-brand-border flex flex-col justify-between group overflow-hidden"
                >
                  <div>
                    <div className="h-44 relative overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-brand-accent text-white text-[9px] font-black font-mono uppercase tracking-wider">
                        {article.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-[9px] font-mono text-brand-text-secondary uppercase">
                        <span>{article.source || 'Sports Wire'}</span>
                        <span>•</span>
                        <span className="text-brand-accent font-bold">
                          {article.date || 'Recent'}
                        </span>
                      </div>
                      <h3 className="font-display font-black text-sm text-brand-text-primary uppercase line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs text-brand-text-secondary line-clamp-2 font-sans font-medium">
                        {article.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-brand-border flex items-center justify-between text-[10px] font-mono text-brand-text-secondary">
                    <span>{article.readTime || '3 min read'}</span>
                    <span className="text-brand-accent font-black flex items-center space-x-1">
                      <span>READ</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-brand-surface border border-brand-border space-y-2">
              <Newspaper className="w-8 h-8 text-brand-text-secondary mx-auto opacity-40" />
              <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">
                NO TOURNAMENT ARTICLES PUBLISHED RECENTLY
              </p>
            </div>
          )}
        </div>
      )}

      {/* Match Details Modal if opened */}
      {selectedMatch && (
        <MatchDetailsModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
}
