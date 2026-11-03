import React, { useState } from 'react';
import { Match, Club } from '../types';
import { X, Trophy, MapPin, Users, Flame, Percent, MessageSquare, Send, Swords, BarChart3 } from 'lucide-react';
import TeamLogo from './TeamLogo';
import { useMatchComments } from '../hooks/useMatchComments';
import { useAuth } from '../hooks/useAuth';
import HeadToHeadChart from './HeadToHeadChart';

interface MatchDetailsModalProps {
  match: Match;
  onClose: () => void;
}

export default function MatchDetailsModal({ match, onClose }: MatchDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'h2h' | 'lineups' | 'timeline' | 'chat'>('stats');
  const { user, login, isAuthenticated } = useAuth();
  const { comments, addComment, loading: loadingComments } = useMatchComments(match.id);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await addComment(newCommentText);
    if (success) {
      setNewCommentText('');
    }
    setIsSubmitting(false);
  };

  // Generate match telemetry statistics based on match score
  const homeScore = match.homeTeam.score ?? 0;
  const awayScore = match.awayTeam.score ?? 0;

  const totalShotsHome = homeScore * 3 + Math.floor(Math.random() * 5) + 4;
  const totalShotsAway = awayScore * 3 + Math.floor(Math.random() * 5) + 3;
  
  const possessionHome = match.status === 'UPCOMING' ? 50 : Math.floor(Math.random() * 16) + 42; // e.g. 42% - 58%
  const possessionAway = 100 - possessionHome;

  const statsList = [
    { name: 'Possession', home: `${possessionHome}%`, away: `${possessionAway}%`, homeVal: possessionHome, awayVal: possessionAway },
    { name: 'Total Shots', home: totalShotsHome, away: totalShotsAway, homeVal: totalShotsHome, awayVal: totalShotsAway },
    { name: 'Shots on Target', home: Math.floor(totalShotsHome * 0.4) + homeScore, away: Math.floor(totalShotsAway * 0.45) + awayScore, homeVal: Math.floor(totalShotsHome * 0.4) + homeScore, awayVal: Math.floor(totalShotsAway * 0.45) + awayScore },
    { name: 'Corner Kicks', home: Math.floor(Math.random() * 5) + 3, away: Math.floor(Math.random() * 5) + 2, homeVal: 1, awayVal: 1 },
    { name: 'Fouls Committed', home: Math.floor(Math.random() * 6) + 7, away: Math.floor(Math.random() * 6) + 8, homeVal: 1, awayVal: 1 },
    { name: 'Yellow Cards', home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 3) + 1, homeVal: 1, awayVal: 1 },
  ];

  // Match timeline events based on live status
  const events = [
    { minute: 12, team: 'home', text: `⚽ Goal! ${match.homeTeam.name} strikes to make it 1-0!`, icon: '⚽' },
    { minute: 31, team: 'away', text: `🟨 Yellow Card issued for ${match.awayTeam.name}`, icon: '🟨' },
    { minute: 45, team: 'home', text: '⏱️ Half Time score is locked.', icon: '⏱️' },
    homeScore > 1 ? { minute: 58, team: 'home', text: `⚽ Goal! ${match.homeTeam.name} fires into the bottom corner.`, icon: '⚽' } : null,
    awayScore > 0 ? { minute: 68, team: 'away', text: `⚽ Goal! ${match.awayTeam.name} converts a brilliant crossing assist.`, icon: '⚽' } : null,
  ].filter(Boolean) as { minute: number; team: string; text: string; icon: string }[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0B0E]/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-brand-surface border border-brand-border text-brand-text-primary rounded-none max-w-xl md:max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-brand-border bg-brand-bg">
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-brand-accent" />
            <span className="text-[10px] font-black font-mono text-brand-text-secondary uppercase tracking-widest">
              {match.competition} TELEMETRY SHEET
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-brand-border hover:border-brand-accent bg-brand-surface text-brand-text-secondary hover:text-brand-text-primary transition-colors rounded-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Score Display Block */}
        <div className="bg-brand-bg py-8 px-6 text-center border-b border-brand-border relative">
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            {match.status === 'LIVE' ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-none bg-[#FF2B2B]/10 border border-[#FF2B2B]/20 text-brand-live text-[9px] font-black font-mono uppercase animate-pulse">
                <span>{match.minute}' LIVE FEED</span>
              </span>
            ) : match.status === 'FINISHED' ? (
              <span className="text-[9px] font-black bg-[#161920] border border-brand-border text-brand-text-secondary px-3 py-1 rounded-none uppercase tracking-widest font-mono">
                FT - FINISHED
              </span>
            ) : (
              <span className="text-[9px] font-black bg-brand-accent/10 text-brand-accent px-3 py-1 rounded-none uppercase tracking-widest border border-brand-accent/20 font-mono">
                UPCOMING ({match.time})
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            {/* Home Team logo & name */}
            <div className="flex-1 flex flex-col items-center">
              <TeamLogo shortName={match.homeTeam.shortName} size="lg" className="mb-2.5" />
              <span className="font-display font-black text-xs uppercase tracking-tight text-brand-text-primary max-w-[120px] truncate">
                {match.homeTeam.name}
              </span>
            </div>

            {/* Live Score/Divider */}
            <div className="px-4 flex items-center space-x-4">
              {match.status !== 'UPCOMING' ? (
                <>
                  <span className="font-display font-black text-3xl text-brand-text-primary">
                    {match.homeTeam.score}
                  </span>
                  <span className="text-brand-border font-extrabold text-xl">:</span>
                  <span className="font-display font-black text-3xl text-brand-text-primary">
                    {match.awayTeam.score}
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-xl font-black font-mono text-brand-accent">{match.time}</span>
                  <span className="text-[9px] text-brand-text-secondary font-mono uppercase tracking-widest mt-0.5">{match.date}</span>
                </div>
              )}
            </div>

            {/* Away Team logo & name */}
            <div className="flex-1 flex flex-col items-center">
              <TeamLogo shortName={match.awayTeam.shortName} size="lg" className="mb-2.5" />
              <span className="font-display font-black text-xs uppercase tracking-tight text-brand-text-primary max-w-[120px] truncate">
                {match.awayTeam.name}
              </span>
            </div>
          </div>

          <div className="mt-5 text-[10px] text-brand-text-secondary font-mono uppercase tracking-widest flex items-center justify-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-brand-accent" />
            <span>{match.venue}</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-brand-bg border-b border-brand-border overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 min-w-[70px] py-3 text-[10px] font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer rounded-none ${
              activeTab === 'stats'
                ? 'border-brand-accent text-brand-accent bg-brand-surface'
                : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
            }`}
          >
            Metrics
          </button>
          <button
            onClick={() => setActiveTab('h2h')}
            className={`flex-1 min-w-[75px] py-3 text-[10px] font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer rounded-none flex items-center justify-center space-x-1 ${
              activeTab === 'h2h'
                ? 'border-brand-accent text-brand-accent bg-brand-surface'
                : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
            }`}
          >
            <Swords className="w-3 h-3" />
            <span>H2H</span>
          </button>
          <button
            onClick={() => setActiveTab('lineups')}
            className={`flex-1 min-w-[70px] py-3 text-[10px] font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer rounded-none ${
              activeTab === 'lineups'
                ? 'border-brand-accent text-brand-accent bg-brand-surface'
                : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
            }`}
          >
            Lineups
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 min-w-[70px] py-3 text-[10px] font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer rounded-none ${
              activeTab === 'timeline'
                ? 'border-brand-accent text-brand-accent bg-brand-surface'
                : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 min-w-[80px] py-3 text-[10px] font-black uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer rounded-none flex items-center justify-center space-x-1 ${
              activeTab === 'chat'
                ? 'border-brand-accent text-brand-accent bg-brand-surface'
                : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Fan Chat</span>
          </button>
        </div>

        {/* Modal Content body */}
        <div className="flex-1 overflow-y-auto p-6 bg-brand-surface">
          
          {/* STATS TAB */}
          {activeTab === 'stats' && (
            match.status === 'UPCOMING' ? (
              <div className="text-center py-8 text-brand-text-secondary space-y-3">
                <Users className="w-10 h-10 mx-auto opacity-30 text-brand-accent" />
                <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary font-bold">LIVE TELEMETRY BOOTS AT KICKOFF</p>
                <p className="text-[10px] text-brand-text-secondary/70 max-w-xs mx-auto">Ball possession, corner counters, and shot telemetry activate live when players hit the pitch.</p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('h2h')}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-bg border border-brand-border hover:border-brand-accent text-brand-text-primary text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Swords className="w-3 h-3 text-brand-accent" />
                    <span>View Historical Head-to-Head Chart →</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {statsList.map((stat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black font-mono text-brand-text-primary">
                      <span>{stat.home}</span>
                      <span className="text-brand-text-secondary text-[9px] uppercase tracking-widest font-sans font-black">{stat.name}</span>
                      <span>{stat.away}</span>
                    </div>
                    {/* Visual Bar Graph */}
                    <div className="h-1 w-full rounded-none bg-brand-bg flex overflow-hidden">
                      <div 
                        className="bg-brand-accent h-full rounded-none" 
                        style={{ width: `${(Number(stat.homeVal) / (Number(stat.homeVal) + Number(stat.awayVal))) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-brand-live h-full rounded-none" 
                        style={{ width: `${(Number(stat.awayVal) / (Number(stat.homeVal) + Number(stat.awayVal))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}

                {/* Quick H2H Switcher in Stats tab */}
                <div className="pt-3 border-t border-brand-border">
                  <button
                    onClick={() => setActiveTab('h2h')}
                    className="w-full py-2.5 px-3 bg-brand-bg hover:bg-brand-elevated border border-brand-border hover:border-brand-accent/50 text-brand-text-primary text-[10px] font-mono font-bold uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center space-x-2">
                      <Swords className="w-3.5 h-3.5 text-brand-accent" />
                      <span>Compare Head-to-Head Win/Loss Charts</span>
                    </span>
                    <span className="text-brand-accent font-black">Open H2H Visuals →</span>
                  </button>
                </div>
              </div>
            )
          )}

          {/* HEAD-TO-HEAD TAB */}
          {activeTab === 'h2h' && (
            <HeadToHeadChart match={match} />
          )}

          {/* LINEUPS TAB */}
          {activeTab === 'lineups' && (
            <div className="space-y-6">
              {/* Home Team Lineup */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black tracking-widest text-brand-accent font-mono uppercase pb-1.5 border-b border-brand-border flex items-center justify-between">
                  <span>{match.homeTeam.name} Squad</span>
                  <span className="text-brand-text-secondary text-[8px] tracking-widest font-sans uppercase">Starting XI</span>
                </h4>
                <div className="p-4 bg-brand-bg border border-brand-border text-center">
                  <p className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-widest">
                    Squad roster and starting lineups will be submitted 1 hour prior to kick-off.
                  </p>
                </div>
              </div>

              {/* Away Team Lineup */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black tracking-widest text-brand-live font-mono uppercase pb-1.5 border-b border-brand-border flex items-center justify-between">
                  <span>{match.awayTeam.name} Squad</span>
                  <span className="text-brand-text-secondary text-[8px] tracking-widest font-sans uppercase">Starting XI</span>
                </h4>
                <div className="p-4 bg-brand-bg border border-brand-border text-center">
                  <p className="text-[10px] text-brand-text-secondary font-mono uppercase tracking-widest">
                    Squad roster and starting lineups will be submitted 1 hour prior to kick-off.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TIMELINE TAB */}
          {activeTab === 'timeline' && (
            match.status === 'UPCOMING' ? (
              <div className="text-center py-10 text-brand-text-secondary space-y-2">
                <Flame className="w-10 h-10 mx-auto opacity-30 text-brand-accent" />
                <p className="text-xs font-mono uppercase tracking-widest text-brand-text-secondary font-sans font-black">MATCH HAS NOT BEGUN</p>
                <p className="text-[10px] text-brand-text-secondary/70 max-w-xs mx-auto">Live updates, goal scorers, and commentary logs will populate dynamically in this feed when the whistle blows.</p>
              </div>
            ) : (
              <div className="relative border-l border-brand-border ml-4 pl-6 space-y-6">
                {/* Simulated Kick-off marker */}
                <div className="absolute -left-[4px] top-1.5 w-1.5 h-1.5 rounded-none bg-brand-text-secondary"></div>
                
                {events.map((evt, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle marker on line */}
                    <div className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-none border border-brand-bg flex items-center justify-center text-[8px] ${
                      evt.team === 'home' ? 'bg-brand-accent' : 'bg-brand-live'
                    }`}></div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-black font-mono text-brand-accent bg-brand-bg border border-brand-border px-1.5 py-0.5 rounded-none">
                          {evt.minute}'
                        </span>
                        <span className="text-xs font-black text-brand-text-primary uppercase tracking-tight">{evt.icon} Action Event</span>
                      </div>
                      <p className="text-xs text-brand-text-secondary pl-1">
                        {evt.text}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Final Whistle */}
                {match.status === 'FINISHED' && (
                  <div className="relative pt-2">
                    <div className="absolute -left-[31px] top-3 w-2.5 h-2.5 rounded-none bg-brand-text-secondary border border-brand-bg"></div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black font-mono text-brand-text-secondary bg-brand-bg border border-brand-border px-1.5 py-0.5 rounded-none">FT</span>
                      <p className="text-xs text-brand-text-secondary font-bold uppercase tracking-tight">Referee blows the final whistle. Full-time result is locked.</p>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* FAN CHAT / LIVE COMMENTS TAB */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[320px] justify-between">
              {/* Message Feed list */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 mb-3 scrollbar-none">
                {loadingComments ? (
                  <div className="flex flex-col items-center justify-center h-full text-brand-text-secondary space-y-1.5 font-mono text-xs">
                    <span className="w-4 h-4 rounded-none border-2 border-brand-accent border-t-transparent animate-spin"></span>
                    <span className="uppercase tracking-widest text-[9px] font-black">SYNCING TRANSMISSIONS...</span>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-brand-text-secondary space-y-2 py-6">
                    <MessageSquare className="w-8 h-8 text-brand-border" />
                    <p className="text-xs font-black font-mono uppercase tracking-widest text-brand-text-primary">NO LIVE COMMS YET</p>
                    <p className="text-[10px] text-brand-text-secondary/70 max-w-xs font-sans leading-relaxed">Be the first to post a match reaction or start a conversation about this match!</p>
                  </div>
                ) : (
                  comments.map((cmt) => (
                    <div key={cmt.id} className="flex items-start space-x-2.5">
                      {cmt.userAvatar ? (
                        <img src={cmt.userAvatar} alt={cmt.userName} className="w-6 h-6 rounded-none border border-brand-border mt-0.5" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-6 h-6 rounded-none bg-brand-bg text-brand-accent text-[9px] font-black flex items-center justify-center mt-0.5 border border-brand-border">
                          {cmt.userName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 bg-brand-bg border border-brand-border p-2.5 rounded-none">
                        <div className="flex items-center justify-between pb-1 mb-1 border-b border-brand-border/60 text-[9px] text-brand-text-secondary font-mono uppercase tracking-widest font-bold">
                          <span className="font-black text-brand-accent font-sans">{cmt.userName}</span>
                          <span>{new Date(cmt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs text-brand-text-primary font-bold leading-relaxed font-sans">{cmt.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input Box */}
              {isAuthenticated ? (
                <form onSubmit={handleSendComment} className="flex items-center space-x-2 pt-2 border-t border-brand-border">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Type match reaction (e.g. WHAT A GOAL!)..."
                    className="flex-1 bg-brand-bg border border-brand-border rounded-none px-3.5 py-2 text-xs font-black uppercase tracking-tight focus:outline-none focus:border-brand-accent transition-all text-brand-text-primary placeholder-brand-text-secondary/50"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !newCommentText.trim()}
                    className="p-2 bg-brand-accent hover:bg-red-600 disabled:opacity-40 text-white rounded-none transition-all cursor-pointer flex items-center justify-center border border-transparent"
                  >
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </form>
              ) : (
                <div className="bg-brand-bg/80 border border-brand-border p-3.5 rounded-none text-center space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-brand-text-secondary leading-relaxed font-bold">
                    👋 Sign in with Google to join the live chat room and post live reactions!
                  </p>
                  <button
                    onClick={() => login()}
                    type="button"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand-accent hover:bg-red-600 text-white rounded-none text-[9px] font-sans font-black uppercase tracking-widest cursor-pointer"
                  >
                    <span>Google Sign In</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-brand-bg border-t border-brand-border text-center text-[10px] text-brand-text-secondary font-mono uppercase tracking-widest">
          <span>MATCH ID: {match.id.toUpperCase()} • POWERED BY FOOTPULSE STREAM</span>
        </div>
      </div>
    </div>
  );
}
