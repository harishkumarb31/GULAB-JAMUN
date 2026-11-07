import React, { useEffect, useRef } from 'react';
import { Heart, RotateCcw, Sparkles } from 'lucide-react';
import type { BirthdayData } from '../types';
import { audioSystem } from '../utils/audioSystem';

interface CinematicEndingProps {
  data: BirthdayData;
  onReplay: () => void;
}

export const CinematicEnding: React.FC<CinematicEndingProps> = ({ data, onReplay }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Minimal 3D ASCII rose loop for the final scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const width = (canvas.width = canvas.clientWidth);
      const height = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, width, height);

      // Deep dark rose backdrop
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        width * 0.5
      );
      grad.addColorStop(0, 'rgba(120, 20, 50, 0.25)');
      grad.addColorStop(1, 'rgba(8, 2, 10, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Small ASCII rose rotating gently
      const fontSize = 11;
      const fontWidth = fontSize * 0.6;
      const fontHeight = fontSize;
      const cols = Math.floor(width / fontWidth);
      const rows = Math.floor(height / fontHeight);

      const zBuffer = new Float32Array(cols * rows).fill(999);
      const charBuffer = new Array<string>(cols * rows).fill(' ');
      const colorBuffer = new Array<string>(cols * rows).fill('');

      const ASCII = " .':;!~=+*#%@";
      const rotY = time * 0.4;
      const rotX = 0.25 + Math.sin(time * 0.5) * 0.05;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // 400 sample points for petal whorl
      for (let i = 0; i < 400; i++) {
        const u = i / 400;
        const theta = u * Math.PI * 14;
        const r = Math.pow(u, 0.7) * 1.1;
        const x = r * Math.cos(theta);
        const y = (1 - u) * 0.7 - Math.pow(u, 2) * 0.4;
        const z = r * Math.sin(theta);

        // 3D rotation
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y1 = y;

        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;

        const pz = z2 + 3.2;
        if (pz <= 0.1) continue;

        const scale = Math.min(width, height) * 0.75;
        const px = (x2 / pz) * scale;
        const py = (-y2 / pz) * scale;

        const col = Math.floor((width / 2 + px) / fontWidth);
        const row = Math.floor((height / 2 + py) / fontHeight);

        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          const idx = row * cols + col;
          if (pz < zBuffer[idx]) {
            zBuffer[idx] = pz;
            const charIdx = Math.floor(((1 - u) * 0.8 + 0.2) * (ASCII.length - 1));
            charBuffer[idx] = ASCII[charIdx];
            colorBuffer[idx] = u > 0.4 ? '#ff7597' : '#f43f5e';
          }
        }
      }

      ctx.font = `bold ${fontSize}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          const ch = charBuffer[idx];
          if (ch && ch !== ' ') {
            ctx.fillStyle = colorBuffer[idx];
            ctx.fillText(ch, c * fontWidth, r * fontHeight);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-[#0a020b] via-[#1a0518] to-[#050106] py-24 px-6 flex flex-col items-center justify-center overflow-hidden text-center">
      {/* 3D ASCII Rose Canvas Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <canvas ref={canvasRef} className="w-full max-w-lg h-96" />
      </div>

      {/* Atmospheric lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-rose-900/15 blur-[150px] pointer-events-none" />

      {/* Main Narrative Card */}
      <div className="relative z-20 max-w-2xl mx-auto flex flex-col items-center">
        {/* Glowing Heart */}
        <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-400/40 flex items-center justify-center mb-8 glow-pink-box animate-pulse-glow">
          <Heart className="w-8 h-8 text-rose-300 fill-rose-300" />
        </div>

        {/* Poetic Line 1 */}
        <p className="text-xl md:text-2xl lg:text-3xl font-serif-luxury text-rose-100/90 italic leading-relaxed mb-4 font-light">
          "Some flowers bloom once.
          <br />
          Some make the world bloom around them."
        </p>

        {/* Closing Line */}
        <h2 className="text-3xl md:text-5xl font-cinzel font-bold text-white tracking-wider my-4 glow-white-text">
          Keep blooming, {data.recipient.name}.
        </h2>

        {/* Closing Headline */}
        <p className="text-lg md:text-xl font-serif-luxury text-rose-300/90 italic mb-8">
          "{data.headlines.closing}"
        </p>

        {/* Date Milestone Tag */}
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-panel border border-rose-400/30 text-rose-200 text-xs tracking-[0.3em] uppercase font-cinzel mb-12 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Happy Birthday — 22 November ♡</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </div>

        {/* Replay The Story Button */}
        <button
          onClick={() => {
            audioSystem.playSparkle();
            onReplay();
          }}
          className="group px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs tracking-widest uppercase transition-all duration-300 shadow-xl shadow-rose-950/50 hover:scale-105 active:scale-95 border border-pink-300/40 flex items-center gap-2.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-rose-200 group-hover:-rotate-90 transition-transform duration-500" />
          <span>Replay The Birthday Story</span>
        </button>

        <p className="mt-8 text-[11px] text-zinc-500 font-mono-code">
          BLOOM • Created for Bhoomika's 20th Birthday Celebration
        </p>
      </div>
    </section>
  );
};
