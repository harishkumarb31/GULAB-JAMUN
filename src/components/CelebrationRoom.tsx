import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Heart, Download, Share2, Check, PartyPopper } from 'lucide-react';
import type { BirthdayData } from '../types';
import { audioSystem } from '../utils/audioSystem';
import { MilestoneCounter } from './MilestoneCounter';

interface CelebrationRoomProps {
  data: BirthdayData;
}

export const CelebrationRoom: React.FC<CelebrationRoomProps> = ({ data }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Trigger grand confetti blast
  const fireConfetti = () => {
    audioSystem.playSparkle();
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#f472b6', '#fbbf24', '#fbcfe8', '#e11d48', '#ffffff'],
    });
  };

  // Trigger floating hearts shower
  const fireHearts = () => {
    audioSystem.playSparkle();
    const scalar = 2;
    const heart = confetti.shapeFromPath({
      path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
    });

    confetti({
      shapes: [heart],
      scalar,
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fda4af', '#f472b6'],
    });
  };

  // Download Keepsake Birthday Card using HTML5 Canvas
  const handleDownloadCard = () => {
    setIsDownloading(true);
    audioSystem.playSparkle();

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1500;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    // High resolution card drawing
    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 1500);
    bgGrad.addColorStop(0, '#100414');
    bgGrad.addColorStop(0.5, '#220822');
    bgGrad.addColorStop(1, '#0c0310');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 1500);

    // Decorative golden borders
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 1100, 1400);

    ctx.strokeStyle = 'rgba(244, 114, 182, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(70, 70, 1060, 1360);

    // Corner rosettes
    const drawCorner = (x: number, y: number) => {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCorner(70, 70);
    drawCorner(1130, 70);
    drawCorner(70, 1430);
    drawCorner(1130, 1430);

    // Text Header
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(244, 114, 182, 0.85)';
    ctx.font = '24px "Cinzel", Georgia, serif';
    ctx.fillText('A SPECIAL 20TH BIRTHDAY KEEPSAKE', 600, 240);

    // Recipient Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 96px "Cinzel", Georgia, serif';
    ctx.fillText(data.recipient.name.toUpperCase(), 600, 380);

    // Milestone
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'italic 52px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('Happy 20th Birthday ♡', 600, 480);

    // Date
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '28px "JetBrains Mono", monospace';
    ctx.fillText(`22 NOVEMBER • CHAPTER TWENTY`, 600, 560);

    // Divider Line
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 620);
    ctx.lineTo(850, 620);
    ctx.stroke();

    // Central Main Headline
    ctx.fillStyle = '#ffb3cb';
    ctx.font = 'bold 44px "Cinzel", Georgia, serif';
    ctx.fillText('TWENTY LOOKS BEAUTIFUL ON YOU', 600, 730);

    // Body Quotes
    ctx.fillStyle = '#f3e8ee';
    ctx.font = 'italic 36px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(`"${data.celebration.secondary}"`, 600, 840);

    ctx.fillStyle = '#fce7f3';
    ctx.font = '32px "Cormorant Garamond", Georgia, serif';
    ctx.fillText('May your days be filled with colours, happiness,', 600, 970);
    ctx.fillText('beautiful surprises, and endless dreams.', 600, 1025);

    // Closing Tagline
    ctx.fillStyle = '#f472b6';
    ctx.font = 'italic 34px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(`"Keep blooming, ${data.recipient.name}."`, 600, 1170);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('BLOOM — Created with love for Bhoomika', 600, 1340);

    // Download trigger
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `BLOOM-Bhoomika-20th-Birthday-Card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsDownloading(false);
    }, 400);
  };

  // Share Birthday Link
  const handleShare = async () => {
    const shareData = {
      title: 'BLOOM — A Birthday Story for Bhoomika ♡',
      text: "Happy 20th Birthday, Bhoomika! Keep blooming. The world is more beautiful with you in it.",
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(
        `Happy 20th Birthday, Bhoomika! ♡ Check out your birthday surprise: ${window.location.href}`
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-[#08020a] via-[#160617] to-[#0d0312] py-24 px-6 flex flex-col items-center justify-center overflow-hidden">
      {/* Floating Pastel Balloons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { color: '#f472b6', left: '8%', delay: '0s', dur: '8s' },
          { color: '#fbbf24', left: '18%', delay: '2s', dur: '10s' },
          { color: '#fda4af', left: '82%', delay: '1s', dur: '9s' },
          { color: '#c084fc', left: '90%', delay: '3s', dur: '11s' },
        ].map((b, i) => (
          <div
            key={i}
            className="absolute -bottom-24 w-14 h-20 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] shadow-lg opacity-40 animate-float"
            style={{
              backgroundColor: b.color,
              left: b.left,
              animationDelay: b.delay,
              animationDuration: b.dur,
            }}
          >
            {/* Balloon string */}
            <div className="absolute -bottom-10 left-1/2 w-0.5 h-10 bg-white/30 transform -translate-x-1/2" />
          </div>
        ))}
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-rose-600/10 blur-[150px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel border border-rose-400/30 text-rose-200 text-xs tracking-[0.35em] uppercase font-cinzel mb-6 shadow-lg">
          <PartyPopper className="w-4 h-4 text-amber-300" />
          <span>The Grand Celebration</span>
          <PartyPopper className="w-4 h-4 text-amber-300" />
        </div>

        {/* Main Celebration Headline */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-cinzel font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-pink-200 to-amber-200 drop-shadow-[0_0_35px_rgba(244,114,182,0.5)] mb-6">
          {data.celebration.main}
        </h2>

        {/* Secondary Celebration Message */}
        <p className="text-lg sm:text-xl md:text-2xl font-serif-luxury text-rose-100/90 italic leading-relaxed max-w-2xl mb-10 font-light">
          "{data.celebration.secondary}"
        </p>

        {/* Interactive Confetti Cannon Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={fireConfetti}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium text-xs tracking-wider uppercase transition-all duration-300 shadow-lg shadow-pink-900/40 hover:scale-105 active:scale-95 border border-pink-300/30 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Launch Confetti Fireworks</span>
          </button>

          <button
            onClick={fireHearts}
            className="px-6 py-3 rounded-full glass-panel text-rose-200 hover:text-white font-medium text-xs tracking-wider uppercase transition-all duration-300 border border-rose-400/30 hover:border-rose-400/60 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            <span>Shower of Floating Hearts</span>
          </button>
        </div>

        {/* KEEPSAKE BIRTHDAY CARD (Interactive Preview & Downloadable) */}
        <div className="w-full max-w-xl mx-auto">
          <div
            ref={cardRef}
            className="relative bg-gradient-to-br from-[#1b081e] via-[#2a0e28] to-[#140516] p-8 md:p-12 rounded-3xl border-2 border-amber-300/30 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_40px_rgba(251,191,36,0.15)] text-center overflow-hidden"
          >
            {/* Corner flourishes */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-amber-300/60" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-amber-300/60" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-amber-300/60" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-amber-300/60" />

            <span className="text-[10px] font-cinzel uppercase tracking-[0.4em] text-amber-300/80 block mb-2">
              Official Keepsake Edition
            </span>

            <h3 className="text-3xl md:text-4xl font-cinzel font-bold text-white mb-2 tracking-wider">
              {data.recipient.name}
            </h3>

            <p className="text-lg md:text-xl font-serif-luxury text-amber-200 italic mb-4">
              Happy 20th Birthday ♡
            </p>

            <div className="w-20 h-[1px] bg-amber-400/40 mx-auto my-4" />

            <p className="text-sm md:text-base font-serif-luxury text-rose-100/80 italic leading-relaxed mb-6 font-light">
              "A new chapter, a thousand dreams, and endless reasons to smile."
            </p>

            <span className="text-xs text-rose-300/70 font-mono-code">
              22 November • Chapter 20
            </span>
          </div>

          {/* Action Buttons for Card */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleDownloadCard}
              disabled={isDownloading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-zinc-950 font-semibold text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-zinc-950" />
              <span>{isDownloading ? 'Generating Card...' : 'Download Birthday Card (PNG)'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-6 py-2.5 rounded-full glass-panel text-rose-200 hover:text-white text-xs font-mono-code uppercase tracking-wider border border-white/20 hover:border-white/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{isCopied ? 'Link Copied!' : 'Share Birthday Link'}</span>
            </button>
          </div>
        </div>

        {/* 20 Years Life Milestone Counter */}
        <div className="w-full mt-14">
          <MilestoneCounter recipientName={data.recipient.name} />
        </div>
      </div>
    </section>
  );
};
