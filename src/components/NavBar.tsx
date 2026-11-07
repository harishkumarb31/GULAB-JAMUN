import React, { useState } from 'react';
import { Menu, X, Compass, Film, RotateCcw } from 'lucide-react';

interface NavBarProps {
  currentSection: number;
  totalSections: number;
  sectionNames: string[];
  onSelectSection: (index: number) => void;
  isExploreMode: boolean;
  onToggleExploreMode: () => void;
  onRestart: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({
  currentSection,
  sectionNames,
  onSelectSection,
  isExploreMode,
  onToggleExploreMode,
  onRestart,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="glass-panel px-4 sm:px-6 py-2.5 rounded-full border border-rose-400/20 shadow-2xl flex items-center justify-between backdrop-blur-xl">
          {/* Brand Logo & Name */}
          <div
            onClick={onRestart}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-xs">
              <span className="text-white text-xs font-serif-luxury font-bold">B</span>
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-xs tracking-[0.25em] font-semibold text-white group-hover:text-rose-300 transition-colors">
                BLOOM
              </span>
              <span className="text-[9px] font-mono-code text-rose-300/70 -mt-0.5">
                Bhoomika • 20th
              </span>
            </div>
          </div>

          {/* Desktop Chapter Dots / Breadcrumbs */}
          <nav className="hidden md:flex items-center gap-1.5">
            {sectionNames.map((name, idx) => (
              <button
                key={name}
                onClick={() => onSelectSection(idx)}
                className={`group relative px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                  currentSection === idx
                    ? 'bg-rose-500/25 text-rose-200 border border-rose-400/40 font-medium'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="relative z-10">{name}</span>
                {currentSection === idx && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-rose-400 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Right Mode Switchers & Mobile Menu Button */}
          <div className="flex items-center gap-2">
            {/* Story Mode vs Explore Mode Toggle */}
            <button
              onClick={onToggleExploreMode}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel-gold text-amber-200 hover:text-white text-[11px] font-mono-code uppercase tracking-wider border border-amber-400/30 transition-all cursor-pointer"
              title={isExploreMode ? 'Switch to Guided Story Mode' : 'Switch to Explore Continuous World'}
            >
              {isExploreMode ? (
                <>
                  <Film className="w-3.5 h-3.5 text-rose-300" />
                  <span>Story Mode</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  <span>Explore All</span>
                </>
              )}
            </button>

            {/* Replay */}
            <button
              onClick={onRestart}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-rose-200 transition-all"
              title="Restart story from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mx-4 mt-2 p-4 rounded-2xl glass-panel border border-rose-400/30 shadow-2xl backdrop-blur-2xl animate-fade-in flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-xs font-cinzel text-rose-300 uppercase tracking-widest">
              Chapters of Bloom
            </span>
            <button
              onClick={onToggleExploreMode}
              className="text-[11px] text-amber-300 font-mono-code flex items-center gap-1"
            >
              <Compass className="w-3 h-3" />
              <span>{isExploreMode ? 'Story Mode' : 'Explore All'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {sectionNames.map((name, idx) => (
              <button
                key={name}
                onClick={() => {
                  onSelectSection(idx);
                  setIsMobileMenuOpen(false);
                }}
                className={`p-2 rounded-xl text-left text-xs transition-all ${
                  currentSection === idx
                    ? 'bg-rose-600/30 text-rose-200 border border-rose-500/40 font-medium'
                    : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                {idx + 1}. {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
