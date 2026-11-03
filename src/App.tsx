import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MatchCard from './components/MatchCard';
import MatchCenter from './components/MatchCenter';
import MatchDetailsModal from './components/MatchDetailsModal';
import NewsSection from './components/NewsSection';
import PopularClubs from './components/PopularClubs';
import LeagueStandings from './components/LeagueStandings';
import SearchSection from './components/SearchSection';
import WorldCupSection from './components/WorldCupSection';

import { Match, NewsArticle } from './types';
import { Trophy, Calendar, Newspaper, ArrowRight, Heart, Sparkles, MessageSquare, Star, Clock, Volume2, Bell } from 'lucide-react';
import { useMatches } from './context/MatchContext';
import { useNews } from './hooks/useNews';
import { useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedHomeMatch, setSelectedHomeMatch] = useState<Match | null>(null);
  const [activeNewsArticle, setActiveNewsArticle] = useState<NewsArticle | null>(null);

  const { matches, lastGoalEvent, clearLastGoalEvent } = useMatches();
  const { news } = useNews();

  // Automatically clear goal toasts after 4.5 seconds
  useEffect(() => {
    if (lastGoalEvent) {
      const timer = setTimeout(() => {
        clearLastGoalEvent();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [lastGoalEvent]);

  // Take the 3 most relevant matches to show on the Home view (Live first, then finished or upcoming)
  const homeMatchesPreview = [...matches]
    .sort((a, b) => {
      if (a.status === 'LIVE' && b.status !== 'LIVE') return -1;
      if (a.status !== 'LIVE' && b.status === 'LIVE') return 1;
      return 0;
    })
    .slice(0, 3);

  // Sync selected modal match with real-time updates
  const activeSelectedMatch = selectedHomeMatch
    ? matches.find((m) => m.id === selectedHomeMatch.id) || selectedHomeMatch
    : null;

  // Take the first 3 news articles for preview
  const homeNewsPreview = news.slice(0, 3);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-between text-brand-text-primary relative overflow-x-hidden">
      
      {/* Real-Time Goal Alert Toast Overlay (OneFootball style) */}
      {lastGoalEvent && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce shadow-2xl max-w-sm w-full bg-brand-surface border border-brand-accent rounded-none p-4.5 flex items-start space-x-3 backdrop-blur-md">
          <div className="p-2.5 bg-brand-accent text-white animate-pulse shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-extrabold text-brand-accent flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping"></span>
                ⚽ LIVE GOAL!
              </span>
              <span className="text-[10px] text-brand-text-secondary font-mono">{lastGoalEvent.minute}'</span>
            </div>
            <h4 className="text-sm font-black text-brand-text-primary mt-1 leading-tight uppercase">
              {lastGoalEvent.teamName} scores!
            </h4>
            <p className="text-xs text-brand-text-secondary mt-0.5 font-sans">
              Match: {lastGoalEvent.matchTitle}
            </p>
          </div>
          <button
            onClick={clearLastGoalEvent}
            className="text-brand-text-secondary hover:text-brand-text-primary font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      {/* Dynamic Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Primary Tab Router */}
      <main className="flex-grow">
        
        {/* HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-12 pb-16 animate-fade-in">
            {/* Athletic Hero Spotlight */}
            <Hero
              liveMatches={matches}
              onExploreMatches={() => setActiveTab('matches')}
              onExploreNews={() => setActiveTab('news')}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              
              {/* Today's Matches Grid preview */}
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="font-display font-black text-xl sm:text-2xl text-brand-text-primary tracking-tight flex items-center uppercase">
                      <span className="inline-block w-2 h-5 bg-brand-accent mr-2.5"></span>
                      <span>Today's Fixtures Preview</span>
                    </h2>
                    <p className="text-xs text-brand-text-secondary font-medium">Check the current slate of live matches and upcoming kick-offs.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className="flex items-center space-x-1 text-xs font-bold text-brand-accent hover:text-brand-accent-hover transition-colors cursor-pointer group"
                  >
                    <span>Match Center</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {homeMatchesPreview.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onClick={() => setSelectedHomeMatch(match)}
                    />
                  ))}
                </div>
              </div>

              {/* Latest News Spotlight preview */}
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="font-display font-black text-xl sm:text-2xl text-brand-text-primary tracking-tight flex items-center uppercase">
                      <span className="inline-block w-2 h-5 bg-brand-accent mr-2.5"></span>
                      <span>Breaking Football Stories</span>
                    </h2>
                    <p className="text-xs text-brand-text-secondary font-medium font-sans">Tactical breakdowns, injury updates, and exclusive transfer feeds.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('news')}
                    className="flex items-center space-x-1 text-xs font-bold text-brand-accent hover:text-brand-accent-hover transition-colors cursor-pointer group"
                  >
                    <span>All Articles</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* News preview grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {homeNewsPreview.map((article) => (
                    <div
                      key={article.id}
                      onClick={() => {
                        setActiveNewsArticle(article);
                        setActiveTab('news');
                      }}
                      className="bg-brand-surface rounded-none border border-brand-border overflow-hidden shadow-sm hover:border-brand-accent/50 transition-all duration-350 cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* News card thumbnail */}
                        <div className="h-44 relative overflow-hidden">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-103 transition-all duration-300"
                          />
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-brand-accent text-white text-[9px] font-black font-mono uppercase tracking-wider rounded-none">
                            {article.category}
                          </span>
                        </div>
                        
                        {/* News card text content */}
                        <div className="p-4.5 space-y-2">
                          <div className="flex items-center space-x-1.5 text-[9px] text-brand-text-secondary font-mono uppercase">
                            <span>{article.date}</span>
                            <span>•</span>
                            <span>{article.readTime}</span>
                          </div>
                          <h3 className="font-display font-black text-sm text-brand-text-primary line-clamp-2 leading-snug group-hover:text-brand-accent transition-colors uppercase">
                            {article.title}
                          </h3>
                        </div>
                      </div>

                      {/* Card Author Footer */}
                      <div className="px-4.5 py-3.5 border-t border-brand-border flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-none bg-brand-elevated flex items-center justify-center font-bold text-[9px] text-brand-text-secondary border border-brand-border">
                            {article.author.avatar}
                          </div>
                          <span className="text-[10px] font-semibold text-brand-text-secondary truncate max-w-[100px]">
                            {article.author.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-brand-accent font-bold group-hover:underline flex items-center space-x-0.5 uppercase tracking-wider">
                          <span>Read</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Clubs Spotlight section preview */}
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="font-display font-black text-xl sm:text-2xl text-brand-text-primary tracking-tight flex items-center uppercase">
                      <span className="inline-block w-2 h-5 bg-brand-accent mr-2.5"></span>
                      <span>Featured Popular Clubs</span>
                    </h2>
                    <p className="text-xs text-brand-text-secondary font-medium">Click on a club to view their active roster, key metrics, and managers.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('competitions')}
                    className="flex items-center space-x-1 text-xs font-bold text-brand-accent hover:text-brand-accent-hover transition-colors cursor-pointer group"
                  >
                    <span>League Standings</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Popular clubs cards list */}
                <PopularClubs limit={3} />
              </div>

            </div>

            {/* Direct match scorecard modal */}
            {activeSelectedMatch && (
              <MatchDetailsModal
                match={activeSelectedMatch}
                onClose={() => setSelectedHomeMatch(null)}
              />
            )}
          </div>
        )}

        {/* MATCH CENTER FULL VIEW */}
        {activeTab === 'matches' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-text-primary tracking-tight uppercase">Match Center</h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary">Live scoreboard telemetry, finished match analysis, and upcoming football schedules.</p>
            </div>
            <MatchCenter />
          </div>
        )}

        {/* NEWS LIST FULL VIEW */}
        {activeTab === 'news' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-text-primary tracking-tight uppercase">FootPulse Newsroom</h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary font-sans">Premium articles, tactical charts, transfer columns, and medical analyst logs.</p>
            </div>
            <NewsSection />
          </div>
        )}

        {/* COMPETITIONS / STANDINGS FULL VIEW */}
        {activeTab === 'competitions' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-brand-text-primary tracking-tight uppercase">League Standings</h1>
              <p className="text-xs sm:text-sm text-brand-text-secondary">Track current season table standings, points, team form, and qualification statuses.</p>
            </div>
            <LeagueStandings />
          </div>
        )}

        {/* WORLD CUP FULL VIEW */}
        {activeTab === 'world-cup' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
            <WorldCupSection />
          </div>
        )}

        {/* SEARCH FULL VIEW */}
        {activeTab === 'search' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
            <SearchSection />
          </div>
        )}

      </main>

      {/* FOOTPULSE SPORTS BRAND FOOTER */}
      <footer className="bg-brand-surface border-t border-brand-border text-brand-text-secondary text-sm py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-brand-accent text-white font-bold rounded-none">
                  ⚽
                </div>
                <span className="font-display font-extrabold text-lg text-brand-text-primary tracking-tight uppercase">
                  Foot<span className="text-brand-accent">Pulse</span>
                </span>
              </div>
              <p className="text-xs text-brand-text-secondary leading-relaxed font-sans">
                The modern, athletic football hub built for football fans. Explore real-time stats, tactical news feeds, match standings, and roster profiles.
              </p>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-brand-bg border border-brand-border w-fit rounded-none">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
                <span className="text-[10px] font-mono font-medium text-brand-text-secondary">Client Sandbox Ready</span>
              </div>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="text-brand-text-primary text-xs font-bold font-mono tracking-wider uppercase mb-4">Navigations</h4>
              <ul className="space-y-2 text-xs">
                {['Home', 'Matches', 'News', 'Competitions', 'Search'].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => {
                        setActiveTab(item.toLowerCase());
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-brand-accent transition-colors cursor-pointer text-left font-semibold text-brand-text-secondary"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technical Stack Section */}
            <div>
              <h4 className="text-brand-text-primary text-xs font-bold font-mono tracking-wider uppercase mb-4">Technical Stack</h4>
              <ul className="space-y-2 text-xs text-brand-text-secondary">
                <li className="flex justify-between border-b border-brand-border pb-1">
                  <span>Runtime:</span>
                  <span className="font-mono text-[10px] text-brand-text-primary">Vite + React 19</span>
                </li>
                <li className="flex justify-between border-b border-brand-border pb-1">
                  <span>Language:</span>
                  <span className="font-mono text-[10px] text-brand-text-primary">TypeScript</span>
                </li>
                <li className="flex justify-between border-b border-brand-border pb-1">
                  <span>Styling:</span>
                  <span className="font-mono text-[10px] text-brand-text-primary">Tailwind CSS v4</span>
                </li>
                <li className="flex justify-between pb-1">
                  <span>Engine:</span>
                  <span className="font-mono text-[10px] text-brand-text-primary">Self-Contained</span>
                </li>
              </ul>
            </div>

            {/* Student Project details */}
            <div className="space-y-3.5 text-xs text-brand-text-secondary">
              <h4 className="text-brand-text-primary text-xs font-bold font-mono tracking-wider uppercase">Project Info</h4>
              <p className="leading-relaxed text-xs">
                FootPulse is developed as an interactive React SPA application. It implements a stateful modular design, custom client-side search indexing, and deep-nested components.
              </p>
              <div className="text-[10px] font-mono text-brand-text-secondary">
                © {new Date().getFullYear()} FootPulse. All rights reserved.
              </div>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
