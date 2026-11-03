import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { Search, Calendar, User, Clock, ArrowRight, ArrowLeft, Heart, RefreshCw, ExternalLink } from 'lucide-react';
import { useNews } from '../hooks/useNews';

interface NewsSectionProps {
  onBackToHome?: () => void;
  standalone?: boolean;
}

export default function NewsSection({ onBackToHome, standalone = false }: NewsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});

  const { news, isLoading, error, lastUpdated, demoMode, revalidateNews } = useNews();

  const categories = ['All', 'Transfer', 'Match Analysis', 'Injury', 'Club News', 'FIFA World Cup'];

  // Format publication timestamp for display
  const formatPublicationDate = (article: NewsArticle) => {
    if (article.publishedAt) {
      const d = new Date(article.publishedAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
    return article.date || 'Recent';
  };

  // Sort articles strictly by publication timestamp descending
  const sortedNews = [...news].sort((a, b) => {
    const rawA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const rawB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    const timeA = !isNaN(rawA) ? rawA : 0;
    const timeB = !isNaN(rawB) ? rawB : 0;
    return timeB - timeA;
  });

  // Filter News
  const filteredNews = sortedNews.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedArticles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const featuredArticle = news.find((a) => a.featured) || news[0];
  const regularArticles = filteredNews.filter((a) => a.id !== (standalone ? '' : featuredArticle?.id));

  return (
    <div className="space-y-6 py-2">
      {/* Telemetry Status / Last Updated Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-surface border border-brand-border p-3.5 rounded-none text-xs">
        <div className="flex items-center space-x-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-brand-accent animate-pulse' : 'bg-brand-live'}`} />
          <span className="font-mono text-brand-text-secondary uppercase font-bold tracking-wider">
            {demoMode ? (
              <span className="text-brand-accent font-black">SIM FEED ACTIVE • RSS BACKUP SYNC</span>
            ) : (
              <span className="text-[#00FF66] font-black">LIVE PRODUCTION BROADCAST FEED</span>
            )}
          </span>
          <span className="text-brand-border">•</span>
          <span className="text-brand-text-secondary font-mono uppercase tracking-wider text-[10px]">
            SYNCED: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        <button
          onClick={() => revalidateNews()}
          disabled={isLoading}
          className="flex items-center space-x-1 px-3 py-1 bg-brand-bg hover:bg-brand-elevated border border-brand-border hover:border-brand-accent/40 text-brand-text-primary font-mono text-[9px] font-black uppercase tracking-widest cursor-pointer disabled:opacity-50 transition-all rounded-none"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>RE-SYNC</span>
        </button>
      </div>

      {isLoading && news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-brand-accent animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">CONNECTING NEWS FEEDS...</p>
        </div>
      ) : error && news.length === 0 ? (
        <div className="text-center py-16 bg-brand-surface border border-brand-border p-6 space-y-4 rounded-none">
          <p className="text-xs text-brand-live font-mono uppercase tracking-widest">ERROR CONNECTING STREAM: {error.message || 'DISCONNECTED'}</p>
          <button
            onClick={() => revalidateNews()}
            className="px-4 py-2 bg-brand-accent hover:bg-red-600 text-white font-sans font-black text-xs uppercase tracking-widest cursor-pointer rounded-none"
          >
            RETRY STREAM CONNECTION
          </button>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-20 bg-brand-surface border border-brand-border p-6 space-y-3 animate-fade-in rounded-none">
          <div className="w-12 h-12 rounded-none bg-brand-bg flex items-center justify-center mx-auto text-brand-text-secondary border border-brand-border">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">NO VERIFIED TELEMETRY FEEDS</p>
        </div>
      ) : (
        <>
          {/* Article Detail View */}
          {selectedArticle ? (
            <div className="bg-brand-surface border border-brand-border overflow-hidden shadow-2xl animate-fade-in max-w-4xl mx-auto rounded-none">
              {/* Article Header controls */}
              <div className="p-4 border-b border-brand-border flex justify-between items-center bg-brand-bg">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 border border-brand-border hover:border-brand-accent/40 bg-brand-surface hover:bg-brand-elevated text-[10px] font-black uppercase tracking-widest text-brand-text-primary transition-all cursor-pointer rounded-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>NEWS HUB</span>
                </button>
                <div className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-wider">
                  PUBLISHED • {formatPublicationDate(selectedArticle)}
                </div>
              </div>

              {/* Article Image Cover */}
              <div className="relative h-64 sm:h-96 w-full">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="inline-block px-2.5 py-0.5 bg-brand-accent text-white text-[9px] font-black uppercase tracking-widest mb-3 rounded-none">
                    {selectedArticle.category}
                  </span>
                  <h1 className="font-display font-black text-xl sm:text-2xl md:text-3xl text-brand-text-primary tracking-tight leading-tight uppercase">
                    {selectedArticle.title}
                  </h1>
                </div>
              </div>

              {/* Article Meta */}
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between border-b border-brand-border pb-5 gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-none bg-brand-elevated border border-brand-border flex items-center justify-center font-bold text-brand-text-primary text-xs uppercase font-mono">
                      {selectedArticle.author?.avatar || 'FP'}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-brand-text-primary uppercase tracking-wider">{selectedArticle.author?.name || 'FootPulse Correspondent'}</h4>
                      <p className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-widest">{selectedArticle.author?.role || 'Sports Journalist'}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-5 text-[10px] font-mono text-brand-text-secondary uppercase tracking-wider">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-brand-accent" />
                      <span>{selectedArticle.readTime}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-brand-text-secondary" />
                      <span>{selectedArticle.date}</span>
                    </span>
                    <button 
                      onClick={(e) => toggleLike(selectedArticle.id, e)}
                      className="flex items-center space-x-1.5 hover:text-brand-live transition-colors cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${likedArticles[selectedArticle.id] ? 'text-brand-live fill-brand-live animate-pulse' : 'text-brand-text-secondary'}`} />
                      <span>{likedArticles[selectedArticle.id] ? 143 : 142}</span>
                    </button>
                  </div>
                </div>

                {/* Article Content Paragraphs */}
                <div className="prose max-w-none text-brand-text-secondary leading-relaxed space-y-4 text-xs sm:text-sm font-sans font-medium">
                  <p className="font-bold text-brand-text-primary text-sm sm:text-base leading-relaxed uppercase tracking-tight">
                    {selectedArticle.summary}
                  </p>
                  <p>{selectedArticle.content}</p>
                  <p>
                    In an era dominated by rapid vertical play, tactical setups have become highly dynamic. Real-time pitch tracking data from Europe's top clubs indicates an unprecedented emphasis on fluid build-ups and high counter-pressing channels.
                  </p>
                  <blockquote className="border-l-2 border-brand-accent pl-4 py-2 italic text-brand-text-primary font-semibold bg-brand-bg p-4 rounded-none uppercase text-xs tracking-wide">
                    "Football moves at the speed of thought. Control the transitions, and you control the scoreline."
                  </blockquote>

                  {selectedArticle.link && (
                    <div className="pt-4">
                      <a
                        href={selectedArticle.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-accent hover:bg-red-600 text-white font-sans font-black text-xs uppercase tracking-widest shadow-md transition-all rounded-none"
                      >
                        <span>VIEW ORIGINAL ARTICLE</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Tags footer */}
                <div className="pt-6 border-t border-brand-border flex flex-wrap gap-2">
                  <span className="text-[9px] font-bold text-brand-text-secondary px-2.5 py-1 rounded-none bg-brand-bg border border-brand-border font-mono uppercase tracking-wider">#Tactics</span>
                  <span className="text-[9px] font-bold text-brand-text-secondary px-2.5 py-1 rounded-none bg-brand-bg border border-brand-border font-mono uppercase tracking-wider">#FootPulse</span>
                  <span className="text-[9px] font-bold text-brand-text-secondary px-2.5 py-1 rounded-none bg-brand-bg border border-brand-border font-mono uppercase tracking-wider">#LiveFeed</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-brand-surface p-4 border border-brand-border rounded-none shadow-md">
                {/* Category selection */}
                <div className="flex flex-wrap gap-1 self-start sm:self-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer rounded-none border ${
                        selectedCategory === cat
                          ? 'bg-brand-accent text-white border-transparent'
                          : 'bg-brand-bg hover:bg-brand-elevated text-brand-text-secondary border-brand-border'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Input block */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-text-secondary">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH SCOUT FEEDS..."
                    className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-border rounded-none text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-brand-accent transition-all text-brand-text-primary placeholder:text-brand-text-secondary/40"
                  />
                </div>
              </div>

              {/* Featured Post (Not shown if filtering returns nothing related) */}
              {!standalone && selectedCategory === 'All' && !searchQuery && featuredArticle && (
                <div
                  onClick={() => setSelectedArticle(featuredArticle)}
                  className="bg-brand-surface border border-brand-border overflow-hidden hover:border-brand-accent/40 transition-all duration-300 cursor-pointer group grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-none shadow-2xl"
                >
                  <div className="lg:col-span-7 h-64 sm:h-80 lg:h-auto overflow-hidden relative">
                    <img
                      src={featuredArticle.imageUrl}
                      alt={featuredArticle.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-2.5 py-0.5 bg-brand-accent text-white text-[9px] font-black uppercase tracking-widest rounded-none shadow-md">
                        {featuredArticle.category === 'FIFA World Cup' ? '🏆 World Cup Special' : 'FEATURED INTEL'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-[9px] text-brand-text-secondary font-mono uppercase tracking-widest">
                        <span>{featuredArticle.source || 'FootPulse Staff'}</span>
                        <span>•</span>
                        <span className="text-brand-accent font-bold">{featuredArticle.readTime}</span>
                      </div>
                      <h2 className="font-display font-black text-xl sm:text-2xl text-brand-text-primary tracking-tight leading-snug group-hover:text-brand-accent transition-colors duration-300 uppercase">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-brand-text-secondary text-xs leading-relaxed line-clamp-3 font-sans font-medium">
                        {featuredArticle.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-none bg-brand-elevated flex items-center justify-center font-bold text-[10px] text-brand-text-primary border border-brand-border font-mono">
                          {featuredArticle.author?.avatar || 'FP'}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-brand-text-primary uppercase tracking-wider">{featuredArticle.author?.name || 'FootPulse Staff'}</h4>
                          <p className="text-[8px] font-mono text-brand-text-secondary uppercase tracking-widest">{featuredArticle.author?.role || 'Lead Analyst'}</p>
                        </div>
                      </div>
                      
                      <span className="text-brand-accent group-hover:translate-x-1 transition-transform flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest">
                        <span>READ INTEL</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Layout of regular articles */}
              {filteredNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(standalone ? filteredNews : regularArticles).map((article) => (
                    <article
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="bg-brand-surface border border-brand-border overflow-hidden hover:border-brand-accent/40 hover:scale-[1.01] transition-all duration-300 cursor-pointer flex flex-col justify-between group rounded-none"
                    >
                      <div>
                        {/* Header Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          />
                          <span className="absolute top-3 left-3 px-2 py-0.5 bg-brand-accent text-white text-[8px] font-black font-mono uppercase tracking-widest">
                            {article.category}
                          </span>
                        </div>

                        {/* Article description */}
                        <div className="p-5 space-y-2.5">
                          <div className="flex items-center space-x-2 text-[9px] text-brand-text-secondary font-mono uppercase tracking-widest">
                            <span>{article.source || 'Sky Sports'}</span>
                            <span>•</span>
                            <span>{article.date}</span>
                          </div>
                          <h3 className="font-display font-black text-sm text-brand-text-primary tracking-tight leading-snug group-hover:text-brand-accent transition-colors duration-300 line-clamp-2 uppercase">
                            {article.title}
                          </h3>
                          <p className="text-brand-text-secondary text-xs leading-relaxed line-clamp-2 font-sans font-medium">
                            {article.summary}
                          </p>
                        </div>
                      </div>

                      {/* Article footer */}
                      <div className="px-5 py-4 border-t border-brand-border flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6.5 h-6.5 rounded-none bg-brand-elevated border border-brand-border flex items-center justify-center font-bold text-[9px] text-brand-text-primary uppercase font-mono">
                            {article.author?.avatar || 'FP'}
                          </div>
                          <span className="text-[10px] font-black text-brand-text-primary uppercase tracking-wider truncate max-w-[100px]">
                            {article.author?.name || 'FootPulse Correspondent'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={(e) => toggleLike(article.id, e)}
                            className="p-1 text-brand-text-secondary hover:text-brand-live transition-colors cursor-pointer flex items-center space-x-1"
                          >
                            <Heart className={`w-3.5 h-3.5 ${likedArticles[article.id] ? 'text-brand-live fill-brand-live' : ''}`} />
                            <span className="text-[9px] font-mono font-black">{likedArticles[article.id] ? 51 : 50}</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-14 bg-brand-surface border border-brand-border rounded-none p-6 space-y-3">
                  <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary">NO ANALYSIS STREAM MATCHED</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="text-xs text-brand-accent font-black border border-brand-accent/20 bg-brand-accent/5 px-4 py-2 hover:bg-brand-accent/10 transition-all cursor-pointer rounded-none"
                  >
                    CLEAR FILTERS
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
