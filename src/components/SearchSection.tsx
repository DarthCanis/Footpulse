import React, { useState } from 'react';
import { Club, Player } from '../types';
import { Search, Sparkles, User, Shield, Info, ArrowRight, Star, Loader2, Save, History, Globe, Trash2 } from 'lucide-react';
import TeamLogo from './TeamLogo';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { useMatches } from '../context/MatchContext';
import { useClubs } from '../hooks/useClubs';

// Custom, lightweight, zero-dependency Markdown Formatter for AI results
const formatAnswer = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('###')) {
      return <h4 key={index} className="text-sm font-bold text-brand-text-primary mt-4 mb-2">{trimmed.replace(/^###\s*/, '')}</h4>;
    }
    if (trimmed.startsWith('##')) {
      return <h3 key={index} className="text-base font-extrabold text-brand-text-primary mt-5 mb-2">{trimmed.replace(/^##\s*/, '')}</h3>;
    }
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      return <p key={index} className="text-xs font-bold text-brand-accent mt-3">{trimmed.replace(/\*\*/g, '')}</p>;
    }
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      return (
        <li key={index} className="text-xs text-brand-text-secondary ml-4 list-disc list-outside py-1 leading-relaxed">
          {trimmed.substring(1).trim().split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-brand-text-primary font-bold">{part}</strong> : part)}
        </li>
      );
    }
    if (!trimmed) return <div key={index} className="h-2" />;
    return (
      <p key={index} className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed py-1">
        {trimmed.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-brand-text-primary font-bold">{part}</strong> : part)}
      </p>
    );
  });
};

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClubForModal, setSelectedClubForModal] = useState<Club | null>(null);

  const { preferences, saveAIQuery, deleteAIQuery } = useUserData();
  const { isAuthenticated } = useAuth();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    answer: string;
    sources: { title: string; uri: string }[];
    query: string;
    fallback?: boolean;
    isQuotaExceeded?: boolean;
  } | null>(null);
  const [aiError, setAiError] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleAISearch = async (overrideQuery?: string) => {
    const q = overrideQuery || searchQuery;
    if (!q.trim()) return;

    setAiLoading(true);
    setAiError('');
    setAiResult(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/ai/football-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });
      const data = await response.json();
      if (data.success) {
        setAiResult({
          answer: data.answer,
          sources: data.sources,
          query: data.query,
          fallback: data.fallback,
          isQuotaExceeded: data.isQuotaExceeded
        });
      } else {
        setAiError(data.error || 'Failed to get AI search results');
      }
    } catch (err: any) {
      setAiError('Failed to connect to the server');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveQuery = async () => {
    if (!aiResult) return;
    const success = await saveAIQuery(aiResult.query, aiResult.answer);
    if (success) {
      setIsSaved(true);
    }
  };

  const { leagues, matches } = useMatches();
  const { clubs } = useClubs();

  // Flatten all players with reference to their club
  const allPlayersWithClub = clubs.flatMap((club) =>
    club.squad.map((player) => ({
      ...player,
      clubName: club.name,
      clubLogo: club.logo,
      clubShort: club.shortName,
      clubObj: club,
    }))
  );

  // Filter Clubs
  const matchedClubs = searchQuery
    ? clubs.filter(
        (club) =>
          club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          club.stadium.toLowerCase().includes(searchQuery.toLowerCase()) ||
          club.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
          club.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Filter Players
  const matchedPlayers = searchQuery
    ? allPlayersWithClub.filter(
        (player) =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          player.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
          player.position.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleClubClick = (club: Club) => {
    setSelectedClubForModal(club);
  };

  const hasResults = matchedClubs.length > 0 || matchedPlayers.length > 0;

  return (
    <div className="space-y-8 py-2">
      {/* Search Header Banner */}
      <div className="bg-brand-surface border border-brand-border text-brand-text-primary p-6 sm:p-8 rounded-none relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-brand-accent/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="max-w-xl space-y-4 relative z-10">
          <div className="flex items-center space-x-2 text-brand-accent text-xs font-bold font-mono uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Instant Football Registry</span>
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl tracking-tight leading-tight uppercase">
            Search Players & Clubs
          </h2>
          <p className="text-brand-text-secondary text-xs sm:text-sm leading-relaxed font-sans">
            Query the FootPulse database for squads, stadium capacities, goal counts, or overall match performance in real-time.
          </p>

          {/* Search Box */}
          <div className="relative pt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-brand-text-secondary">
                <Search className="w-5 h-5 mt-2.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type player, club, or ask AI (e.g. Real Madrid, Chelsea injury updates)..."
                className="w-full pl-10 pr-4 py-3 bg-brand-bg border border-brand-border rounded-none text-sm font-semibold focus:outline-none focus:border-brand-accent transition-all text-brand-text-primary placeholder:text-brand-text-secondary"
                autoFocus
              />
            </div>
            
            <button
              onClick={() => handleAISearch()}
              disabled={aiLoading || !searchQuery.trim()}
              className="px-5 py-3 bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-50 disabled:hover:bg-brand-accent text-white rounded-none text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-brand-accent/20 cursor-pointer uppercase tracking-wider"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-white fill-white" />
              )}
              <span>Ask FootPulse AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* GEMINI GOOGLE SEARCH GROUNDING REPORT PANEL */}
      {(aiLoading || aiResult || aiError) && (
        <div className="bg-brand-surface border border-brand-border rounded-none p-6 shadow-lg space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-none bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                <Sparkles className="w-4.5 h-4.5 text-brand-accent fill-brand-accent animate-pulse" />
              </div>
              <div>
                <h3 className="font-display font-black text-xs sm:text-sm text-brand-text-primary uppercase tracking-wider font-mono">
                  FootPulse AI Real-Time Report
                </h3>
                <p className="text-[10px] text-brand-text-secondary font-mono">Google Search Grounded Insights</p>
              </div>
            </div>
            {aiResult && (
              <div className="flex items-center space-x-2">
                {isAuthenticated ? (
                  <button
                    onClick={handleSaveQuery}
                    disabled={isSaved}
                    className={`px-3 py-1.5 rounded-none text-xs font-bold flex items-center space-x-1 transition-all border ${
                      isSaved
                        ? 'bg-brand-elevated text-brand-accent border-brand-accent/30'
                        : 'bg-brand-bg text-brand-text-primary border-brand-border hover:border-brand-accent hover:text-brand-accent cursor-pointer'
                    }`}
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'Saved to Profile' : 'Save Insights'}</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-brand-text-secondary font-sans italic hidden sm:inline">
                    Sign in to save reports
                  </span>
                )}
                <button
                  onClick={() => { setAiResult(null); setAiError(''); }}
                  className="px-3 py-1.5 bg-brand-bg border border-brand-border text-brand-text-secondary hover:text-brand-text-primary rounded-none text-xs font-bold transition-all cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Loading state */}
          {aiLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3.5">
              <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-brand-text-primary font-mono">Querying live global football feeds...</p>
                <p className="text-[10px] text-brand-text-secondary max-w-xs leading-relaxed font-sans">
                  Using Gemini with Google Search to fetch verified matches, transfer announcements, and standings instantly.
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {aiError && (
            <div className="p-4 bg-brand-accent/5 border border-brand-accent/20 rounded-none text-center space-y-2">
              <p className="text-xs text-brand-accent font-bold">{aiError}</p>
              <button
                onClick={() => handleAISearch()}
                className="px-3 py-1.5 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-none text-xs font-bold transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Result content */}
          {aiResult && (
            <div className="space-y-4 animate-fade-in">
              {aiResult.fallback && (
                <div className="bg-amber-500/5 border border-amber-500/25 text-amber-300 rounded-none p-3.5 text-xs flex items-start space-x-2.5">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold font-sans text-amber-300">FootPulse Backup Feed Active</p>
                    <p className="text-[11px] text-brand-text-secondary leading-relaxed font-sans">
                      Due to high global demand, the live Gemini API is experiencing rate limiting or quota limits (429). FootPulse AI has instantly fetched this comprehensive, verified report from our premium pre-indexed football database to keep your workspace online.
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-brand-bg border border-brand-border p-4.5 rounded-none space-y-3">
                <div className="text-[10px] text-brand-text-secondary font-mono border-b border-brand-border pb-2 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Topic: <strong className="text-brand-text-primary">"{aiResult.query}"</strong></span>
                </div>
                
                <div className="space-y-1 overflow-x-auto text-left">
                  {formatAnswer(aiResult.answer)}
                </div>
              </div>

              {/* Web Sources */}
              {aiResult.sources && aiResult.sources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-wider font-mono">
                    🔗 Verified Reference Sources
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.sources.map((src, index) => (
                      <a
                        key={index}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-brand-bg hover:bg-brand-elevated border border-brand-border rounded-none text-[10px] font-semibold text-brand-text-secondary hover:text-brand-accent flex items-center space-x-1 transition-all"
                      >
                        <Globe className="w-3 h-3 text-brand-text-secondary" />
                        <span className="truncate max-w-[150px]">{src.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SAVED QUERY PROFILE HISTORY FEED */}
      {isAuthenticated && preferences?.savedQueries && preferences.savedQueries.length > 0 && !aiLoading && !aiResult && !aiError && (
        <div className="bg-brand-surface border border-brand-border rounded-none p-5 shadow-sm space-y-4">
          <h3 className="font-display font-black text-xs text-brand-text-secondary uppercase tracking-wider font-mono flex items-center space-x-2">
            <History className="w-4 h-4 text-brand-accent" />
            <span>Your Saved Insights ({preferences.savedQueries.length})</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {preferences.savedQueries.map((item) => (
              <div
                key={item.id}
                className="bg-brand-bg border border-brand-border rounded-none p-3.5 flex items-start justify-between group hover:border-brand-accent transition-all cursor-pointer"
                onClick={() => {
                  setSearchQuery(item.query);
                  setAiResult({
                    query: item.query,
                    answer: item.answer,
                    sources: []
                  });
                }}
              >
                <div className="space-y-1 pr-2 truncate">
                  <h4 className="text-xs font-bold text-brand-text-primary group-hover:text-brand-accent transition-colors truncate">
                    "{item.query}"
                  </h4>
                  <p className="text-[9px] text-brand-text-secondary font-mono">
                    Saved on {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAIQuery(item.id);
                  }}
                  className="p-1 text-brand-text-secondary hover:text-brand-accent hover:bg-brand-accent/5 rounded-none transition-all cursor-pointer"
                  title="Delete Insights"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Suggestions or Results display */}
      {!searchQuery ? (
        <div className="bg-brand-surface p-6 rounded-none border border-brand-border shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider font-mono">
            💡 Popular Search Queries
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Haaland', 'Real Madrid', 'Saka', 'Pep Guardiola', 'Midfielder', 'Anfield', 'Barcelona'].map((term) => (
              <button
                key={term}
                onClick={() => setSearchQuery(term)}
                className="px-3.5 py-1.5 bg-brand-bg border border-brand-border rounded-none text-xs font-bold text-brand-text-primary hover:text-brand-accent hover:border-brand-accent transition-all cursor-pointer font-mono"
              >
                "{term}"
              </button>
            ))}
          </div>
        </div>
      ) : hasResults ? (
        <div className="space-y-8 animate-fade-in">
          
          {/* CLUBS RESULTS */}
          {matchedClubs.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-base text-brand-text-primary flex items-center space-x-2 uppercase">
                <Shield className="w-5 h-5 text-brand-accent" />
                <span>Matching Clubs ({matchedClubs.length})</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedClubs.map((club) => (
                  <div
                    key={club.id}
                    onClick={() => handleClubClick(club)}
                    className="bg-brand-surface rounded-none border border-brand-border p-5 shadow-sm hover:border-brand-accent/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="flex items-center space-x-3 pb-3 border-b border-brand-border">
                      <TeamLogo shortName={club.shortName} size="md" />
                      <div>
                        <h4 className="font-display font-bold text-sm text-brand-text-primary group-hover:text-brand-accent transition-colors">
                          {club.name}
                        </h4>
                        <p className="text-xs text-brand-text-secondary font-medium">{club.country} • Mgr: {club.manager}</p>
                      </div>
                    </div>
                    
                    <div className="pt-3.5 flex items-center justify-between text-xs text-brand-text-secondary font-mono">
                      <span>Stadium: {club.stadium}</span>
                      <ArrowRight className="w-4 h-4 text-brand-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PLAYERS RESULTS */}
          {matchedPlayers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display font-extrabold text-base text-brand-text-primary flex items-center space-x-2 uppercase">
                <User className="w-5 h-5 text-brand-accent" />
                <span>Matching Players ({matchedPlayers.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedPlayers.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => handleClubClick(player.clubObj)}
                    className="bg-brand-surface rounded-none border border-brand-border p-5 shadow-sm hover:border-brand-accent/50 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Player Badge Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-none bg-brand-bg border border-brand-border text-brand-accent font-mono font-bold text-xs flex items-center justify-center">
                            {player.number}
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-sm text-brand-text-primary group-hover:text-brand-accent transition-colors">
                              {player.name}
                            </h4>
                            <p className="text-[11px] text-brand-text-secondary font-medium">
                              {player.position} • {player.nationality}
                            </p>
                          </div>
                        </div>

                        <TeamLogo shortName={player.clubShort} size="xs" />
                      </div>

                      {/* Mini Stats row */}
                      <div className="grid grid-cols-3 gap-2 text-center py-2 bg-brand-bg rounded-none text-xs font-mono font-bold text-brand-text-primary border border-brand-border">
                        <div>
                          <span className="block text-[9px] font-sans text-brand-text-secondary font-medium">Played</span>
                          <span>{player.stats.appearances}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-sans text-brand-text-secondary font-medium">
                            {player.position === 'Goalkeeper' ? 'CS' : 'Goals'}
                          </span>
                          <span className="text-brand-accent">
                            {player.position === 'Goalkeeper' ? player.stats.cleanSheets : player.stats.goals}
                          </span>
                        </div>
                        <div className="border-l border-brand-border pl-1">
                          <span className="block text-[9px] font-sans text-brand-text-secondary font-medium flex items-center justify-center gap-0.5">
                            <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                            <span>Rating</span>
                          </span>
                          <span className="text-amber-500">{player.stats.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3.5 border-t border-brand-border flex items-center justify-between text-[11px] text-brand-text-secondary font-mono">
                      <span>Age: {player.age}</span>
                      <span className="text-[10px] text-brand-accent group-hover:underline font-sans font-bold flex items-center">
                        <span>Squad sheet</span>
                        <ArrowRight className="w-3 h-3 ml-0.5" />
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="text-center py-14 bg-brand-surface rounded-none border border-brand-border shadow-sm space-y-3">
          <p className="text-sm font-semibold text-brand-text-secondary">No players or clubs match "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-brand-accent font-bold border border-brand-accent/20 bg-brand-accent/5 px-4 py-2 hover:bg-brand-accent/10 transition-all cursor-pointer rounded-none uppercase font-mono"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Embedded Squad Detail Modal Overlay */}
      {selectedClubForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-brand-surface text-brand-text-primary rounded-none max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-brand-border animate-slide-up">
            <div className="bg-brand-bg text-brand-text-primary p-6 relative border-b border-brand-border">
              <button
                onClick={() => setSelectedClubForModal(null)}
                className="absolute top-4 right-4 p-1.5 bg-brand-elevated text-brand-text-secondary hover:text-brand-text-primary transition-colors cursor-pointer rounded-none"
              >
                <span className="font-sans font-bold">✕</span>
              </button>

              <div className="flex items-center space-x-4">
                <TeamLogo shortName={selectedClubForModal.shortName} size="lg" />
                <div>
                  <h2 className="font-display font-black text-xl text-brand-text-primary leading-none uppercase">
                    {selectedClubForModal.name} Registry
                  </h2>
                  <p className="text-xs text-brand-text-secondary mt-1">🏟️ {selectedClubForModal.stadium} • Mgr: {selectedClubForModal.manager}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 gap-2.5">
                {selectedClubForModal.squad.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-3 border border-brand-border bg-brand-bg shadow-xs rounded-none">
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 bg-brand-surface text-brand-accent border border-brand-border font-mono font-bold text-xs flex items-center justify-center rounded-none">
                        {player.number}
                      </span>
                      <div>
                        <h4 className="text-sm font-extrabold text-brand-text-primary">{player.name}</h4>
                        <p className="text-xs text-brand-text-secondary font-semibold">{player.position} • {player.nationality}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 font-mono text-xs">
                      <div>
                        <span className="block text-[9px] font-sans text-brand-text-secondary">Goals</span>
                        <span className="text-brand-text-primary font-bold">{player.stats.goals}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-sans text-brand-text-secondary">Rating</span>
                        <span className="text-amber-500 font-black">{player.stats.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-brand-bg/50 border-t border-brand-border text-center text-xs text-brand-text-secondary font-mono">
              <button
                onClick={() => setSelectedClubForModal(null)}
                className="px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-none cursor-pointer transition-colors uppercase font-mono tracking-wider"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
