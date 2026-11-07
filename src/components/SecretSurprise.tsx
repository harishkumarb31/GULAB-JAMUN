import React, { useState } from 'react';
import { Gift, Sparkles, Heart, Edit3, X, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioSystem } from '../utils/audioSystem';

interface SecretSurpriseProps {
  initialMessage: string;
}

export const SecretSurprise: React.FC<SecretSurpriseProps> = ({ initialMessage }) => {
  const [message, setMessage] = useState<string>(() => {
    return localStorage.getItem('bloom_secret_custom') || initialMessage;
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleOpenGift = () => {
    if (isOpen) return;

    setIsOpen(true);
    audioSystem.playGiftOpen();

    // Burst of golden particles and stars
    try {
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#fbcfe8', '#ffffff', '#ec4899'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleSaveMessage = (newMsg: string) => {
    setMessage(newMsg);
    localStorage.setItem('bloom_secret_custom', newMsg);
    setIsEditing(false);
  };

  const handleResetMessage = () => {
    if (window.confirm('Reset secret message back to default?')) {
      setMessage(initialMessage);
      localStorage.removeItem('bloom_secret_custom');
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-[#0d0312] via-[#170619] to-[#0b030e] py-24 px-6 flex flex-col items-center justify-center overflow-hidden">
      {/* Background magical aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-amber-500/10 blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-12 relative z-10 max-w-lg">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-amber-400/25 text-amber-300 text-xs tracking-[0.3em] uppercase font-cinzel mb-4">
          <Gift className="w-3.5 h-3.5" />
          <span>A Secret Just For You</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif-luxury text-white mb-3 tracking-wide glow-white-text">
          A Little Hidden Treasure
        </h2>

        <p className="text-sm md:text-base font-serif-luxury text-rose-200/70 italic">
          "Some words are meant only for a quiet moment. Tap the glowing gift to unwrap."
        </p>

        {/* Edit Secret Message */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass-panel-gold text-amber-200 hover:text-white text-xs font-mono-code uppercase tracking-wider border border-amber-400/30 hover:border-amber-400/60 transition-all cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Customize Secret Note</span>
          </button>
          <button
            onClick={handleResetMessage}
            className="p-1.5 rounded-full glass-panel text-zinc-400 hover:text-rose-200 text-xs border border-white/10"
            title="Reset message"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3D GIFT BOX PRESENTATION */}
      <div className="relative z-20 w-full max-w-md flex flex-col items-center">
        {!isOpen ? (
          /* CLOSED GIFT BOX */
          <div
            onClick={handleOpenGift}
            className="group relative cursor-pointer flex flex-col items-center transition-all duration-500 hover:scale-105 active:scale-95"
          >
            {/* Pulsing ambient glow beneath gift */}
            <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-amber-400/20 via-pink-500/20 to-rose-500/20 blur-xl group-hover:opacity-100 transition-opacity animate-pulse" />

            {/* Ribbon Bow on top */}
            <div className="relative z-30 flex items-center justify-center mb--2 group-hover:scale-110 transition-transform">
              <div className="w-10 h-8 rounded-full border-2 border-amber-300 bg-amber-400/80 shadow-md transform -rotate-25 -mr-2" />
              <div className="w-10 h-8 rounded-full border-2 border-amber-300 bg-amber-400/80 shadow-md transform rotate-25 -ml-2" />
              <div className="absolute w-5 h-5 rounded-full bg-amber-300 shadow-md z-10" />
            </div>

            {/* Gift Box Lid */}
            <div className="relative z-20 w-44 h-12 rounded-t-xl bg-gradient-to-r from-rose-700 via-pink-600 to-rose-700 shadow-lg border-t border-rose-300/40 flex items-center justify-center overflow-hidden">
              {/* Vertical Lid Ribbon */}
              <div className="w-8 h-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-xs" />
            </div>

            {/* Gift Box Body */}
            <div className="relative z-10 w-40 h-36 rounded-b-2xl bg-gradient-to-b from-rose-800 via-pink-700 to-rose-900 shadow-[0_20px_45px_rgba(0,0,0,0.8)] border border-rose-400/30 flex items-center justify-center overflow-hidden">
              {/* Vertical Body Ribbon */}
              <div className="w-8 h-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 shadow-xs" />
              {/* Horizontal Body Ribbon */}
              <div className="absolute w-full h-8 bg-gradient-to-b from-amber-400 via-yellow-200 to-amber-500 shadow-xs" />
            </div>

            {/* Tag hint */}
            <div className="mt-8 flex items-center gap-2 px-5 py-2 rounded-full glass-panel-gold border border-amber-300/40 text-amber-200 text-xs font-mono-code shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Click to open the gift</span>
            </div>
          </div>
        ) : (
          /* OPEN GIFT REVEAL */
          <div className="relative w-full max-w-lg animate-fade-in flex flex-col items-center">
            {/* Holographic Secret Message Card */}
            <div className="relative w-full bg-gradient-to-br from-[#1e0a24] via-[#2c1028] to-[#16061a] p-8 md:p-12 rounded-3xl border-2 border-pink-400/40 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_50px_rgba(244,114,182,0.25)] text-center overflow-hidden">
              {/* Light rays burst effect */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-b from-amber-400/20 via-pink-500/10 to-transparent blur-2xl pointer-events-none" />

              <div className="w-14 h-14 rounded-full bg-rose-950/60 border border-rose-400/40 flex items-center justify-center mx-auto mb-6 shadow-inner glow-pink-box">
                <Heart className="w-7 h-7 text-pink-400 fill-pink-400 animate-pulse" />
              </div>

              <span className="text-[11px] font-cinzel uppercase tracking-[0.35em] text-amber-300 block mb-3">
                From The Heart
              </span>

              {/* The Revealed Message */}
              <blockquote className="font-serif-luxury text-xl md:text-2xl text-rose-100 leading-relaxed font-light italic mb-8">
                "{message}"
              </blockquote>

              <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-rose-300/50 to-transparent mx-auto mb-6" />

              <span className="text-xs text-rose-300/70 font-mono-code tracking-wider">
                Forever cheering for you ♡
              </span>
            </div>

            {/* Re-wrap button */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-6 px-6 py-2 rounded-full glass-panel text-rose-200 hover:text-white text-xs font-mono-code uppercase tracking-wider border border-white/20 hover:border-white/50 transition-all cursor-pointer"
            >
              Re-wrap Gift Box
            </button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {isEditing && (
        <div
          onClick={() => setIsEditing(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#140618] rounded-3xl border border-amber-400/40 p-6 md:p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif-luxury text-white">
                Customize Secret Note
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-rose-200/70 mb-4">
              Type your personal secret message below. It will appear when Bhoomika opens the gift box!
            </p>

            <textarea
              defaultValue={message}
              id="secret-edit-textarea"
              rows={5}
              className="w-full p-4 rounded-xl bg-black/50 border border-amber-400/30 text-white text-sm font-serif-luxury leading-relaxed focus:outline-none focus:border-amber-400"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-full glass-panel text-zinc-300 text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = (
                    document.getElementById('secret-edit-textarea') as HTMLTextAreaElement
                  )?.value;
                  if (val) handleSaveMessage(val.trim());
                }}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-600 to-rose-600 text-white text-xs font-semibold uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Save Secret Note
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

