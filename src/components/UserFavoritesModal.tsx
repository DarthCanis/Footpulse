import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import { useClubs } from '../hooks/useClubs';
import { useMatches } from '../context/MatchContext';
import TeamLogo from './TeamLogo';
import { 
  X, 
  Star, 
  Shield, 
  Trophy, 
  LogIn, 
  LogOut, 
  Cloud, 
  CheckCircle2, 
  User, 
  ArrowRight, 
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface UserFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export default function UserFavoritesModal({ isOpen, onClose, onNavigate }: UserFavoritesModalProps) {
  const { user, login, loginAsGuest, logout, isAuthenticated, isGuest } = useAuth();
  const { 
    preferences, 
    toggleFavoriteClub, 
    toggleFavoriteLeague, 
    favoriteClubsCount, 
    favoriteLeaguesCount 
  } = useUserData();
  
  const { clubs } = useClubs();
  const { leagues } = useMatches();
  
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setAuthError(null);
      await login();
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err?.code === 'auth/popup-blocked') {
        setAuthError('Browser popup was blocked. Try clicking Continue as Demo Fan or allow popups.');
      } else {
        setAuthError(err?.message || 'Authentication encountered an issue. You can continue as a Demo Fan.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setIsAuthenticating(true);
      setAuthError(null);
      await loginAsGuest();
    } catch (err: any) {
      console.error('Guest sign in error:', err);
      setAuthError(err?.message || 'Unable to start guest session.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Find club objects for favorited shortNames
  const favoritedClubsList = preferences.favoriteClubs.map((clubCode) => {
    const found = clubs.find(
      (c) => c.shortName.toUpperCase() === clubCode.toUpperCase() || c.name.toUpperCase().includes(clubCode.toUpperCase())
    );
    return found || {
      id: clubCode,
      name: clubCode,
      shortName: clubCode,
      country: 'Football Club',
      stadium: 'Home Ground',
      capacity: '—',
      manager: 'Manager',
      stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, position: 1 },
      squad: []
    };
  });

  // Find league objects for favorited IDs
  const favoritedLeaguesList = preferences.favoriteLeagues.map((leagueId) => {
    const found = leagues.find((l) => l.id.toLowerCase() === leagueId.toLowerCase());
    return found || {
      id: leagueId,
      name: leagueId.toUpperCase(),
      country: 'International',
      logo: '🏆',
      standings: []
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0B0E]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-brand-surface text-brand-text-primary rounded-none max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-brand-border">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-brand-bg border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 bg-brand-accent flex items-center justify-center text-white">
              <Star className="w-4 h-4 fill-white stroke-none" />
            </div>
            <div>
              <h2 className="font-display font-black text-base sm:text-lg tracking-tight uppercase text-brand-text-primary">
                Fan Profile & Favorites
              </h2>
              <p className="text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">
                PERSONALIZED TELEMETRY & CLOUD SYNC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-brand-border hover:border-brand-accent/40 bg-brand-surface text-brand-text-secondary hover:text-brand-text-primary transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Account & Sync Status Banner */}
          <div className="bg-brand-bg p-4 border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3.5">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 border border-brand-accent object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-10 h-10 bg-brand-elevated border border-brand-border flex items-center justify-center text-brand-text-secondary shrink-0">
                    <User className="w-5 h-5 text-brand-accent" />
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-sans font-bold text-sm text-brand-text-primary">
                      {user?.displayName || (isGuest ? 'Verified Demo Fan' : 'FootPulse Supporter')}
                    </h3>
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold uppercase">
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span>{isGuest ? 'GUEST CLOUD' : 'FIRESTORE SYNCED'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-secondary font-mono">
                    {user?.email || `UID: ${user?.uid.substring(0, 10)}...`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-brand-elevated border border-brand-border text-brand-accent shrink-0">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-sm text-brand-text-primary">
                    Guest Session (Offline / Local)
                  </h3>
                  <p className="text-xs text-brand-text-secondary">
                    Sign in to sync your favorite clubs and leagues permanently to your Firebase Firestore cloud profile.
                  </p>
                </div>
              </div>
            )}

            {/* Auth Action Buttons */}
            <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
              {isAuthenticated ? (
                <button
                  onClick={() => logout()}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 border border-brand-border hover:border-red-500/50 hover:bg-red-500/10 text-brand-text-secondary hover:text-red-400 text-xs font-mono font-bold uppercase transition-all cursor-pointer w-full sm:w-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>SIGN OUT</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticating}
                    className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-brand-accent hover:bg-red-600 text-white text-xs font-sans font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isAuthenticating ? 'SIGNING IN...' : 'GOOGLE SIGN IN'}</span>
                  </button>
                  <button
                    onClick={handleGuestSignIn}
                    disabled={isAuthenticating}
                    className="flex items-center justify-center space-x-1 px-3 py-2 bg-brand-elevated hover:bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-brand-text-primary text-[10px] font-mono font-bold uppercase transition-all cursor-pointer"
                  >
                    <span>DEMO FAN</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Auth Notice / Error Message */}
          {authError && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* SECTION 1: FAVORITE CLUBS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-brand-accent" />
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-text-primary">
                  Favorite Clubs
                </h3>
                <span className="px-2 py-0.5 bg-brand-accent text-white font-mono text-[10px] font-black">
                  {favoriteClubsCount}
                </span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('home');
                  }}
                  className="text-[10px] font-mono font-bold text-brand-accent hover:underline flex items-center space-x-1 uppercase"
                >
                  <span>Explore Clubs</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {favoritedClubsList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoritedClubsList.map((club) => (
                  <div
                    key={club.shortName}
                    className="p-3 bg-brand-bg border border-brand-border flex items-center justify-between group hover:border-brand-accent/50 transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <TeamLogo shortName={club.shortName} size="sm" />
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-xs uppercase text-brand-text-primary truncate group-hover:text-brand-accent transition-colors">
                          {club.name}
                        </h4>
                        <p className="text-[9px] font-mono text-brand-text-secondary uppercase truncate">
                          {club.country} • {club.shortName}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavoriteClub(club.shortName)}
                      className="p-1.5 text-brand-accent hover:text-red-400 hover:bg-brand-surface border border-transparent hover:border-brand-border transition-all cursor-pointer shrink-0 ml-2"
                      title="Remove from favorites"
                    >
                      <Star className="w-4 h-4 fill-brand-accent stroke-brand-accent" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-brand-bg border border-dashed border-brand-border text-center space-y-2">
                <Star className="w-6 h-6 text-brand-text-secondary mx-auto opacity-40" />
                <p className="text-xs font-mono uppercase tracking-wider text-brand-text-secondary">
                  NO FAVORITE CLUBS SAVED YET
                </p>
                <p className="text-[11px] text-brand-text-secondary max-w-sm mx-auto">
                  Click the star icon on any club card in the Popular Clubs section or search view to pin your team.
                </p>
              </div>
            )}
          </div>

          {/* SECTION 2: FAVORITE LEAGUES */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-brand-accent" />
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-brand-text-primary">
                  Favorite Competitions & Leagues
                </h3>
                <span className="px-2 py-0.5 bg-brand-accent text-white font-mono text-[10px] font-black">
                  {favoriteLeaguesCount}
                </span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('competitions');
                  }}
                  className="text-[10px] font-mono font-bold text-brand-accent hover:underline flex items-center space-x-1 uppercase"
                >
                  <span>View Standings</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {favoritedLeaguesList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {favoritedLeaguesList.map((league) => (
                  <div
                    key={league.id}
                    className="p-3 bg-brand-bg border border-brand-border flex items-center justify-between group hover:border-brand-accent/50 transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="text-xl shrink-0">{league.logo || '🏆'}</span>
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-xs uppercase text-brand-text-primary truncate group-hover:text-brand-accent transition-colors">
                          {league.name}
                        </h4>
                        <p className="text-[9px] font-mono text-brand-text-secondary uppercase truncate">
                          {league.country}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavoriteLeague(league.id)}
                      className="p-1.5 text-brand-accent hover:text-red-400 hover:bg-brand-surface border border-transparent hover:border-brand-border transition-all cursor-pointer shrink-0 ml-2"
                      title="Remove from favorites"
                    >
                      <Star className="w-4 h-4 fill-brand-accent stroke-brand-accent" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-brand-bg border border-dashed border-brand-border text-center space-y-2">
                <Trophy className="w-6 h-6 text-brand-text-secondary mx-auto opacity-40" />
                <p className="text-xs font-mono uppercase tracking-wider text-brand-text-secondary">
                  NO FAVORITE LEAGUES PINNED YET
                </p>
                <p className="text-[11px] text-brand-text-secondary max-w-sm mx-auto">
                  Click the star icon next to Premier League, La Liga, UEFA Champions League, or Serie A to follow entire campaigns.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-brand-bg border-t border-brand-border flex items-center justify-between text-[10px] font-mono text-brand-text-secondary">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-Time State Persistence Active</span>
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-brand-elevated hover:bg-brand-surface border border-brand-border text-brand-text-primary font-bold uppercase cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
