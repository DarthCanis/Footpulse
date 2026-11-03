import React, { useState } from 'react';
import { Activity, Menu, X, Search, Calendar, Newspaper, Trophy, Home, LogIn, LogOut, User as UserIcon, Star, Cloud } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';
import UserFavoritesModal from './UserFavoritesModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { user, login, logout, isAuthenticated, isGuest } = useAuth();
  const { totalFavoritesCount } = useUserData();
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);

  const desktopNavItems = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'matches', name: 'Matches', icon: Calendar },
    { id: 'news', name: 'News', icon: Newspaper },
    { id: 'world-cup', name: 'World Cup', icon: Trophy },
    { id: 'competitions', name: 'Leagues', icon: Activity },
    { id: 'search', name: 'Search', icon: Search },
  ];

  const mobileBottomItems = [
    { id: 'home', name: 'Home', icon: Home },
    { id: 'matches', name: 'Matches', icon: Calendar },
    { id: 'news', name: 'News', icon: Newspaper },
    { id: 'competitions', name: 'Leagues', icon: Activity },
    { id: 'search', name: 'Search', icon: Search },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Header Navigation (Sticky for Desktop & Mobile) */}
      <nav className="sticky top-0 z-50 bg-brand-surface border-b border-brand-border text-brand-text-primary backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Column: Premium Editorial Brand Logo */}
            <div className="flex items-center">
              <button
                onClick={() => handleNavClick('home')}
                className="flex items-center space-x-2.5 group focus:outline-none cursor-pointer"
                id="brand-logo"
              >
                <div className="relative flex items-center justify-center w-7 h-7 rounded-none bg-transparent border border-brand-accent group-hover:scale-105 transition-transform duration-300">
                  <div className="w-2.5 h-2.5 bg-brand-accent"></div>
                  <div className="absolute top-0 right-0 w-1 h-1 bg-brand-live animate-pulse"></div>
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="font-display font-black text-lg tracking-tight uppercase text-brand-text-primary group-hover:text-brand-accent transition-colors">
                    Foot<span className="text-brand-accent">Pulse</span>
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-brand-text-secondary uppercase">
                    EST. 2026 • DIGITAL SPORTS
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Center: Premium Editorial Nav Items */}
            <div className="hidden md:flex items-center space-x-1">
              {desktopNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider font-sans transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'text-brand-accent'
                        : 'text-brand-text-secondary hover:text-brand-text-primary'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-accent' : 'text-brand-text-secondary'}`} />
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-brand-accent animate-fade-in" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Desktop/Mobile Right Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Favorites Quick Button & Counter Badge */}
              <button
                onClick={() => setIsFavoritesModalOpen(true)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 border transition-all cursor-pointer ${
                  totalFavoritesCount > 0
                    ? 'border-brand-accent/50 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20'
                    : 'border-brand-border bg-brand-bg hover:border-brand-accent/40 text-brand-text-secondary hover:text-brand-text-primary'
                }`}
                title="View Saved Favorites & Fan Profile"
              >
                <Star className={`w-3.5 h-3.5 ${totalFavoritesCount > 0 ? 'fill-brand-accent stroke-none' : ''}`} />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline">
                  Favorites
                </span>
                {totalFavoritesCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-brand-accent text-white text-[9px] font-mono font-black flex items-center justify-center">
                    {totalFavoritesCount}
                  </span>
                )}
              </button>

              {/* Telemetry Status Indicator */}
              <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-sm bg-[#161920] border border-brand-border">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-live animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-text-secondary">LIVE ENG</span>
              </div>

              {/* Authentication Controls */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 sm:space-x-3 border-l border-brand-border pl-2 sm:pl-3">
                  <button
                    onClick={() => setIsFavoritesModalOpen(true)}
                    className="flex items-center space-x-2 cursor-pointer group text-left"
                    title="Click to view personalized favorites profile"
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        className="w-6.5 h-6.5 rounded-none border border-brand-accent object-cover group-hover:ring-1 group-hover:ring-brand-accent"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-6.5 h-6.5 rounded-none bg-brand-elevated flex items-center justify-center text-brand-text-secondary border border-brand-border group-hover:border-brand-accent">
                        <UserIcon className="w-3.5 h-3.5 text-brand-accent" />
                      </div>
                    )}
                    <div className="hidden lg:block leading-none">
                      <p className="text-[10px] font-sans font-black text-brand-text-primary truncate max-w-[100px] uppercase tracking-wider group-hover:text-brand-accent">
                        {user?.displayName?.split(' ')[0] || (isGuest ? 'DEMO FAN' : 'SUPPORTER')}
                      </p>
                      <span className="text-[8px] font-mono text-emerald-400 block">
                        {isGuest ? 'GUEST SYNC' : 'CLOUD SYNC'}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 text-brand-text-secondary hover:text-brand-live hover:bg-[#FF2B2B]/5 transition-all duration-200 rounded-sm cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsFavoritesModalOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-accent hover:bg-red-600 text-white font-sans font-extrabold text-[11px] uppercase tracking-wider transition-all duration-300 shadow-md cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>SIGN IN</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* User Favorites & Profile Modal */}
      <UserFavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Mobile Sticky Bottom Tab Bar Navigation (Ergonomic UX) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-surface border-t border-brand-border shadow-2xl safe-bottom-nav">
        <div className="grid grid-cols-5 h-16">
          {mobileBottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center space-y-1 w-full h-full transition-all duration-300 cursor-pointer ${
                  isActive ? 'text-brand-accent' : 'text-brand-text-secondary'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-accent' : 'text-brand-text-secondary'}`} />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-brand-accent" />
                  )}
                </div>
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider leading-none">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
