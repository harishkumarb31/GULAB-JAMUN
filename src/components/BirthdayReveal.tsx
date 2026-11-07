import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import type { BirthdayData } from '../types';
import { audioSystem } from '../utils/audioSystem';

interface BirthdayRevealProps {
  data: BirthdayData;
  onEnterWorld: () => void;
}

export const BirthdayReveal: React.FC<BirthdayRevealProps> = ({ data, onEnterWorld }) => {
  const [phase, setPhase] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Phase 0: "Guess who's turning 20?"
  // Phase 1: Dramatic Anticipation Glow
  // Phase 2: Grand Reveal "BHOOMIKA" + "Happy 20th Birthday!" + Falling Petals & Fireworks
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase(1);
    }, 1800);

    const timer2 = setTimeout(() => {
      setPhase(2);
      audioSystem.playSparkle();
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Falling Petals Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const petals: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      rotation: number;
      rotSpeed: number;
      opacity: number;
      color: string;
      flip: number;
      flipSpeed: number;
    }> = [];

    const colors = ['#fbcfe8', '#fda4af', '#f472b6', '#fb7185', '#ffe4e6'];

    for (let i = 0; i < 45; i++) {
      petals.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight - window.innerHeight,
        size: Math.random() * 12 + 10,
        speedY: Math.random() * 1.5 + 1.2,
        speedX: (Math.random() - 0.5) * 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03,
        opacity: Math.random() * 0.5 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.04 + 0.02,
      });
    }

    const drawPetal = (x: number, y: number, size: number, rot: number, flip: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(Math.cos(flip), 1);
      ctx.globalAlpha = alpha;

      // Draw curved rose petal path
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(size * 0.8, -size * 0.5, size * 0.8, size * 0.8, 0, size);
      ctx.bezierCurveTo(-size * 0.8, size * 0.8, -size * 0.8, -size * 0.5, 0, 0);
      ctx.fillStyle = color;
      ctx.fill();

      // Delicate petal vein highlight
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(0, size * 0.8);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);

      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.01) * 0.8;
        p.rotation += p.rotSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        drawPetal(p.x, p.y, p.size, p.rotation, p.flip, p.color, p.opacity);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-[#07030a] via-[#150616] to-[#08020a] flex items-center justify-center px-6 py-12">
      {/* Falling Petals Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Atmospheric Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-rose-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-pink-700/10 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-20 max-w-3xl mx-auto flex flex-col items-center text-center">
        {/* Animated Glowing Flower Emblem */}
        <div className="relative mb-8">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border border-rose-400/30 flex items-center justify-center bg-rose-950/30 glow-pink-box animate-pulse-glow">
            {/* SVG Glowing Petal Blossom Emblem */}
            <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20 animate-spin" style={{ animationDuration: '24s' }}>
              <defs>
                <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f472b6" />
                  <stop offset="50%" stopColor="#fb7185" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <path
                  key={i}
                  d="M50 50 C40 25, 60 25, 50 10 C40 25, 60 25, 50 50"
                  fill="url(#roseGrad)"
                  opacity="0.85"
                  transform={`rotate(${angle} 50 50)`}
                />
              ))}
              <circle cx="50" cy="50" r="8" fill="#fde047" opacity="0.9" filter="drop-shadow(0 0 6px #f59e0b)" />
            </svg>
          </div>
          <div className="absolute -inset-2 rounded-full border border-pink-500/20 animate-ping opacity-25" style={{ animationDuration: '3s' }} />
        </div>

        {/* Question: "Guess who's turning 20?" */}
        <div className="mb-6">
          <span className="inline-block text-xs md:text-sm font-cinzel tracking-[0.4em] uppercase text-rose-300/80 mb-2">
            A Momentous Milestone
          </span>
          <h2
            className={`text-2xl md:text-3xl font-serif-luxury text-rose-200/90 italic transition-all duration-1000 ${
              phase >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            "Guess who's turning 20?"
          </h2>
        </div>

        {/* Grand Birthday Girl Reveal */}
        {phase >= 2 && (
          <div className="animate-fade-in flex flex-col items-center">
            {/* Monumental Name */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-cinzel font-bold tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-rose-100 via-pink-200 to-rose-300 drop-shadow-[0_0_35px_rgba(244,114,182,0.6)] my-2">
              {data.recipient.name.toUpperCase()}
            </h1>

            {/* Main Greeting */}
            <div className="my-4 flex items-center justify-center gap-3">
              <span className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-rose-400/60" />
              <p className="text-2xl sm:text-3xl md:text-4xl font-serif-luxury text-rose-100 glow-white-text">
                Happy 20th Birthday! ♡
              </p>
              <span className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent to-rose-400/60" />
            </div>

            {/* Secondary Headline */}
            <p className="text-base sm:text-lg md:text-xl font-light text-rose-200/80 max-w-xl font-serif-luxury italic leading-relaxed mb-8">
              "{data.headlines.secondary}"
            </p>

            {/* Call to action button: "Enter Your Birthday World ♡" */}
            <button
              onClick={() => {
                audioSystem.playSparkle();
                onEnterWorld();
              }}
              className="group relative px-10 py-4 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-base tracking-widest uppercase transition-all duration-500 shadow-[0_0_40px_rgba(225,29,72,0.45)] hover:shadow-[0_0_55px_rgba(244,114,182,0.6)] hover:scale-105 active:scale-95 border border-pink-300/40 flex items-center gap-3 cursor-pointer"
            >
              <span>Enter Your Birthday World</span>
              <Heart className="w-5 h-5 text-rose-200 fill-rose-200 group-hover:scale-125 transition-transform" />
            </button>

            <div className="mt-8 flex items-center gap-2 text-xs text-rose-300/60 font-mono-code">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>A story written under the stars of 22 November</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
