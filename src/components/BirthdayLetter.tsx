import React, { useState } from 'react';
import { Mail, Sparkles, Heart, Edit3, X, RotateCcw } from 'lucide-react';
import type { BirthdayData } from '../types';
import { audioSystem } from '../utils/audioSystem';

interface BirthdayLetterProps {
  initialData: BirthdayData['letter'];
  recipientName: string;
}

export const BirthdayLetter: React.FC<BirthdayLetterProps> = ({ initialData, recipientName }) => {
  const [letterData, setLetterData] = useState<BirthdayData['letter']>(() => {
    const saved = localStorage.getItem('bloom_letter_custom');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialData;
      }
    }
    return initialData;
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [visibleParagraphs, setVisibleParagraphs] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleOpenEnvelope = () => {
    if (isOpen) return;
    setIsOpen(true);
    audioSystem.playEnvelopeOpen();

    // Gradually reveal letter paragraphs
    letterData.body.forEach((_, idx) => {
      setTimeout(() => {
        setVisibleParagraphs(idx + 1);
      }, 600 + (idx + 1) * 350);
    });
  };

  const handleCloseEnvelope = () => {
    setIsOpen(false);
    setVisibleParagraphs(0);
  };

  const handleSaveEdit = (newBodyText: string) => {
    const paragraphs = newBodyText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const updated = {
      ...letterData,
      body: paragraphs,
    };
    setLetterData(updated);
    localStorage.setItem('bloom_letter_custom', JSON.stringify(updated));
    setIsEditing(false);
  };

  const handleResetLetter = () => {
    if (window.confirm('Reset letter back to original wording?')) {
      setLetterData(initialData);
      localStorage.removeItem('bloom_letter_custom');
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-[#08020b] via-[#150616] to-[#0a030c] py-24 px-6 flex flex-col items-center justify-center overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-rose-900/10 blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-12 relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-rose-400/20 text-rose-300 text-xs tracking-[0.3em] uppercase font-cinzel mb-4">
          <Mail className="w-3.5 h-3.5" />
          <span>Handwritten Words</span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif-luxury text-white mb-3 tracking-wide glow-white-text">
          {letterData.title}
        </h2>
        <p className="text-sm md:text-base font-serif-luxury text-rose-200/70 italic">
          "A quiet keepsake penned with care, wishing you the world and more."
        </p>

        {/* Edit controls */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass-panel-gold text-amber-200 hover:text-white text-xs font-mono-code uppercase tracking-wider border border-amber-400/30 hover:border-amber-400/60 transition-all cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Letter</span>
          </button>
          <button
            onClick={handleResetLetter}
            className="p-1.5 rounded-full glass-panel text-zinc-400 hover:text-rose-200 text-xs border border-white/10"
            title="Reset letter"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* ENVELOPE & LETTER CONTAINER */}
      <div className="relative z-20 w-full max-w-2xl flex flex-col items-center">
        {!isOpen ? (
          /* CLOSED ENVELOPE */
          <div
            onClick={handleOpenEnvelope}
            className="group relative w-full max-w-md aspect-[1.45/1] cursor-pointer transition-all duration-500 hover:scale-105 active:scale-95"
          >
            {/* Envelope Body */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a0e20] to-[#170514] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(244,114,182,0.2)] border border-rose-500/30 overflow-hidden flex items-center justify-center">
              {/* Envelope Flap geometry lines */}
              <div
                className="absolute inset-0 bg-gradient-to-b from-rose-950/40 to-transparent pointer-events-none"
                style={{
                  clipPath: 'polygon(0% 0%, 50% 55%, 100% 0%)',
                }}
              />
              <div
                className="absolute inset-0 border-t-2 border-rose-400/20"
                style={{
                  clipPath: 'polygon(0% 0%, 50% 55%, 100% 0%)',
                }}
              />

              {/* Silk ribbon horizontal */}
              <div className="absolute w-full h-8 bg-gradient-to-r from-amber-600/30 via-rose-500/40 to-amber-600/30 backdrop-blur-xs border-t border-b border-rose-300/30 flex items-center justify-center" />

              {/* Wax Seal with "B" Monogram */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-[#c81d4e] via-[#880d32] to-[#4c041b] shadow-[0_8px_25px_rgba(190,24,93,0.6)] border-2 border-[#ff70a6]/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="font-serif-luxury text-3xl font-bold text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  {recipientName.charAt(0)}
                </span>
                {/* Wax seal ridges */}
                <div className="absolute -inset-1 rounded-full border border-dashed border-rose-300/30 animate-spin" style={{ animationDuration: '20s' }} />
              </div>

              {/* Bottom Envelope label */}
              <div className="absolute bottom-4 text-center">
                <span className="text-[11px] font-cinzel uppercase tracking-[0.3em] text-rose-200/80">
                  To Dearest {recipientName}
                </span>
              </div>
            </div>

            {/* Click hint pill */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-950/70 border border-rose-400/30 px-4 py-1.5 rounded-full text-xs text-rose-200 flex items-center gap-1.5 shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>Click to Break Seal & Open Letter</span>
            </div>
          </div>
        ) : (
          /* OPEN LETTER DISPLAY */
          <div className="relative w-full animate-fade-in">
            {/* Parchment Letter Paper */}
            <div className="relative bg-[#fffdf9] text-zinc-800 rounded-3xl p-8 sm:p-12 md:p-16 shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_45px_rgba(251,191,36,0.2)] border border-[#edd7c2] overflow-hidden">
              {/* Delicate paper texture & corner floral watermark */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-rose-200/30 to-transparent pointer-events-none rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-tr from-amber-200/25 to-transparent pointer-events-none rounded-tr-full" />

              {/* Top seal emblem */}
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-rose-900/10">
                <div className="flex items-center gap-2 text-rose-800 font-cinzel text-xs tracking-widest uppercase">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>November 22 • 20th Birthday Edition</span>
                </div>
                <button
                  onClick={handleCloseEnvelope}
                  className="p-1.5 rounded-full hover:bg-rose-100 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                  title="Close envelope"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Salutation */}
              <h3 className="font-serif-luxury text-3xl md:text-4xl font-semibold text-rose-950 mb-6 italic">
                {letterData.salutation}
              </h3>

              {/* Body Paragraphs */}
              <div className="space-y-4 font-serif-luxury text-lg md:text-xl text-zinc-800 leading-relaxed font-light">
                {letterData.body.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={`transition-all duration-700 ${
                      visibleParagraphs > idx
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-3'
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Sign-off */}
              <div className="mt-12 pt-8 border-t border-rose-900/10 flex flex-col items-end">
                <p className="font-serif-luxury italic text-rose-900 text-lg">
                  {letterData.closing}
                </p>
                <p className="font-script text-3xl md:text-4xl text-rose-800 mt-2">
                  {letterData.sender}
                </p>
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 mt-2" />
              </div>
            </div>

            {/* Fold envelope back button */}
            <div className="text-center mt-6">
              <button
                onClick={handleCloseEnvelope}
                className="px-6 py-2 rounded-full glass-panel text-rose-200 hover:text-white text-xs font-mono-code uppercase tracking-wider border border-rose-500/20 hover:border-rose-500/50 transition-all cursor-pointer"
              >
                Fold Back Into Envelope
              </button>
            </div>
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
            className="relative max-w-lg w-full bg-[#120617] rounded-3xl border border-rose-400/40 p-6 md:p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif-luxury text-white">
                Customize Birthday Letter Text
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-rose-200/70 mb-4">
              Edit the letter below. Separate each paragraph with a new line. Changes save instantly to your browser!
            </p>

            <textarea
              defaultValue={letterData.body.join('\n\n')}
              id="letter-edit-textarea"
              rows={10}
              className="w-full p-4 rounded-xl bg-black/50 border border-rose-500/30 text-white text-sm font-serif-luxury leading-relaxed focus:outline-none focus:border-rose-400"
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
                    document.getElementById('letter-edit-textarea') as HTMLTextAreaElement
                  )?.value;
                  if (val) handleSaveEdit(val);
                }}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-semibold uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Save Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
