import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

interface GulabJamunSurpriseProps {
  recipientName: string;
  onReplay: () => void;
}

export const GulabJamunSurprise: React.FC<GulabJamunSurpriseProps> = ({
  recipientName,
  onReplay,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Story stages:
  // 0: Initial prompt: "Okay Bhoomika... one last sweet surprise! ♡"
  // 1: Pixels assembling into Gulab Jamun & "Life should always be as sweet as Gulab Jamun."
  // 2: "Stay sweet, keep smiling and keep blooming!"
  // 3: Grand Milestone Finale: "Happy 20th Birthday, Bhoomika! ♡"
  const [stage, setStage] = useState<number>(0);
  const [assemblyProgress, setAssemblyProgress] = useState<number>(0); // 0 (scattered) to 1 (fully formed)
  const [tappedCount, setTappedCount] = useState<number>(0);
  const [showToast, setShowToast] = useState<boolean>(false);

  const handleSceneClick = () => {
    if (stage < 1) return;
    setTappedCount((prev) => prev + 1);
    audioSystem.playSparkle();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Floating syrup sparkles
  const sparklesRef = useRef<
    Array<{ x: number; y: number; speedY: number; size: number; alpha: number; color: string }>
  >([]);

  useEffect(() => {
    // Generate floating syrup sparkles
    const p: typeof sparklesRef.current = [];
    const colors = ['#f59e0b', '#fbbf24', '#fde047', '#fbcfe8', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      p.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speedY: Math.random() * 0.8 + 0.3,
        size: Math.random() * 3 + 1.5,
        alpha: Math.random() * 0.6 + 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    sparklesRef.current = p;

    // Sequence stages
    const t1 = setTimeout(() => {
      setStage(1);
      audioSystem.playSparkle();
    }, 1800);

    const t2 = setTimeout(() => {
      setStage(2);
    }, 5500);

    const t3 = setTimeout(() => {
      setStage(3);
      audioSystem.playGiftOpen();
    }, 9000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Assembly animation loop
  useEffect(() => {
    if (stage < 1) return;

    const interval = setInterval(() => {
      setAssemblyProgress((prev) => {
        if (prev >= 1.0) {
          clearInterval(interval);
          return 1.0;
        }
        return Math.min(1.0, prev + 0.015);
      });
    }, 30);

    return () => clearInterval(interval);
  }, [stage]);

  // PIXEL / ASCII GULAB JAMUN RENDERER
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const ASCII_RAMP = " .':;!~=+*#%@$";

    // Mathematical definitions of the 3 Gulab Jamun spheres & the dessert bowl
    // Bowl: ellipse at (0, 35), radiusX = 145, radiusY = 70
    // Jamun 1 (left): center (-48, 12), radius = 42
    // Jamun 2 (right): center (48, 14), radius = 43
    // Jamun 3 (top center): center (0, -26), radius = 40
    const jamuns = [
      { cx: -46, cy: 12, r: 40, highlight: { x: -0.35, y: -0.35 } },
      { cx: 46, cy: 14, r: 41, highlight: { x: -0.35, y: -0.35 } },
      { cx: 0, cy: -24, r: 38, highlight: { x: -0.3, y: -0.4 } },
    ];

    // Pistachio & saffron garnishes (relative offsets on jamuns)
    const garnishes = [
      { jIdx: 2, ox: -8, oy: -12, type: 'pista' },
      { jIdx: 2, ox: 5, oy: -15, type: 'saffron' },
      { jIdx: 2, ox: -2, oy: -8, type: 'pista' },
      { jIdx: 0, ox: -10, oy: -8, type: 'pista' },
      { jIdx: 0, ox: 2, oy: -14, type: 'saffron' },
      { jIdx: 1, ox: 6, oy: -10, type: 'pista' },
      { jIdx: 1, ox: -6, oy: -12, type: 'saffron' },
    ];

    const render = () => {
      time += 0.025;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep chocolate / midnight obsidian background
      ctx.fillStyle = '#070204';
      ctx.fillRect(0, 0, width, height);

      // Warm radial honey-golden glow behind the dessert plate
      const centerGrad = ctx.createRadialGradient(
        width / 2,
        height / 2 - 25,
        15,
        width / 2,
        height / 2 - 25,
        Math.max(width, height) * 0.55
      );
      centerGrad.addColorStop(0, 'rgba(180, 83, 9, 0.28)'); // warm amber
      centerGrad.addColorStop(0.45, 'rgba(88, 28, 13, 0.18)'); // chocolate
      centerGrad.addColorStop(1, 'rgba(7, 2, 4, 0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw floating syrup sparkles
      sparklesRef.current.forEach((sp) => {
        sp.y -= sp.speedY;
        if (sp.y < -10) sp.y = height + 10;

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha * (Math.sin(time * 3 + sp.x) * 0.3 + 0.7);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Only render Gulab Jamun plate if stage >= 1
      if (stage >= 1) {
        const isMobile = width < 640;
        const pixelSize = isMobile ? 5 : 6;
        const fontWidth = pixelSize;
        const fontHeight = pixelSize * 1.35;

        const centerX = width / 2;
        const centerY = height / 2 - 35 + Math.sin(time * 1.5) * 4; // Gentle floating breath

        // Bounding box for dessert rendering
        const boundW = 340;
        const boundH = 260;
        const startX = Math.floor(centerX - boundW / 2);
        const startY = Math.floor(centerY - boundH / 2);

        ctx.font = `bold ${pixelSize * 1.2}px 'JetBrains Mono', Consolas, monospace`;
        ctx.textBaseline = 'top';

        // Render Pixel / ASCII Grid
        for (let y = startY; y < startY + boundH; y += fontHeight) {
          const dy = y - centerY;

          for (let x = startX; x < startX + boundW; x += fontWidth) {
            const dx = x - centerX;

            // Assembly displacement factor based on assemblyProgress
            const angleNoise = Math.atan2(dy, dx) + dx * 0.05;
            const scatterDist = (1 - assemblyProgress) * 160;
            const sampleX = dx + Math.cos(angleNoise) * scatterDist;
            const sampleY = dy + Math.sin(angleNoise) * scatterDist;

            let char = ' ';
            let color = '';
            let isHighlight = false;

            // 1. Check if inside any Gulab Jamun Sphere
            let inJamun = false;
            for (let i = 0; i < jamuns.length; i++) {
              const j = jamuns[i];
              const jdx = sampleX - j.cx;
              const jdy = sampleY - j.cy;
              const distSq = jdx * jdx + jdy * jdy;

              if (distSq <= j.r * j.r) {
                inJamun = true;
                const z = Math.sqrt(Math.max(0, j.r * j.r - distSq));

                // Normal vector on sphere
                const nx = jdx / j.r;
                const ny = jdy / j.r;
                const nz = z / j.r;

                // Light vector (top-left key light)
                const lx = -0.45;
                const ly = -0.65;
                const lz = 0.6;
                const lLen = Math.hypot(lx, ly, lz);
                const dot = (nx * lx + ny * ly + nz * lz) / lLen;
                const illuminance = Math.max(0, Math.min(1, dot * 0.75 + 0.35));

                // Specular highlight on glossy syrup
                const hdx = nx - j.highlight.x;
                const hdy = ny - j.highlight.y;
                const hDist = Math.hypot(hdx, hdy);

                const charIdx = Math.floor(illuminance * (ASCII_RAMP.length - 1));
                char = ASCII_RAMP[Math.max(1, charIdx)];

                // Rich golden-brown to deep caramelized mahogany color ramp
                if (hDist < 0.22 && illuminance > 0.6) {
                  // Glossy syrup reflection highlight
                  color = '#fffbeb';
                  char = '@';
                  isHighlight = true;
                } else if (illuminance > 0.7) {
                  color = '#f59e0b'; // Warm golden-amber crust
                } else if (illuminance > 0.5) {
                  color = '#d97706'; // Golden brown
                } else if (illuminance > 0.32) {
                  color = '#92400e'; // Deep fried crust
                } else {
                  color = '#451a03'; // Deep shadow caramelized mahogany
                }

                // Check for pistachio / saffron garnishes
                garnishes.forEach((g) => {
                  if (g.jIdx === i) {
                    const gx = sampleX - (j.cx + g.ox);
                    const gy = sampleY - (j.cy + g.oy);
                    if (Math.hypot(gx, gy) < 3.5) {
                      if (g.type === 'pista') {
                        color = '#86efac'; // Emerald pistachio sliver
                        char = '*';
                      } else {
                        color = '#fb923c'; // Saffron strand
                        char = '~';
                      }
                    }
                  }
                });

                break; // Render the topmost jamun
              }
            }

            // 2. If not inside Jamun, check if inside Dessert Bowl / Royal Plate
            if (!inJamun) {
              // Plate ellipse
              const bowlY = sampleY - 24;
              const bowlX = sampleX;
              const bDist = (bowlX * bowlX) / (135 * 135) + (bowlY * bowlY) / (65 * 65);

              // Plate Rim
              if (bDist <= 1.0 && bDist >= 0.82) {
                // Royal plate rim: Silver & gold filigree
                const rimIllum = Math.sin(Math.atan2(bowlY, bowlX) * 8) * 0.25 + 0.75;
                const charIdx = Math.floor(rimIllum * (ASCII_RAMP.length - 1));
                char = ASCII_RAMP[Math.max(2, charIdx)];
                color = rimIllum > 0.8 ? '#fef08a' : '#e2e8f0'; // Gold/silver shimmer
              } else if (bDist < 0.82) {
                // Translucent sweet sugar syrup pool (Chashni)
                const syrupGlow = Math.sin(time * 2 + sampleX * 0.05) * 0.2 + 0.8;
                char = '~';
                color = syrupGlow > 0.85 ? '#b45309' : '#78350f'; // Warm liquid amber syrup
              }
            }

            // Draw pixel character
            if (char !== ' ' && color) {
              ctx.fillStyle = color;
              if (isHighlight) {
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 8;
              } else {
                ctx.shadowBlur = 0;
              }
              ctx.fillText(char, x, y);
            }
          }
        }
        ctx.shadowBlur = 0;
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [stage, assemblyProgress]);

  return (
    <section
      onClick={handleSceneClick}
      className="relative w-full min-h-screen bg-gradient-to-b from-[#0a020b] via-[#100408] to-[#050104] py-20 px-6 flex flex-col items-center justify-center overflow-hidden text-center select-none cursor-pointer"
    >
      {/* Toast feedback on tap */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-950/85 border border-amber-300/50 px-5 py-2 rounded-full text-xs text-amber-200 font-mono-code shadow-2xl backdrop-blur-md animate-bounce flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Pure sweetness for Bhoomika! 🍯✨ ({tappedCount} sweet treats tasted)</span>
        </div>
      )}

      {/* 3D Pixel / ASCII Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Atmospheric lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-amber-600/10 blur-[150px] pointer-events-none" />

      {/* STORY TEXT NARRATIVE LAYERS */}
      <div className="relative z-20 max-w-2xl mx-auto flex flex-col items-center">
        {/* STAGE 0: Opening Surprise */}
        {stage === 0 && (
          <div className="animate-fade-in text-center px-4">
            <span className="text-xs uppercase tracking-[0.35em] text-amber-300/80 font-cinzel mb-2 block">
              A Special Sweet Finale
            </span>
            {/* Exact Requested Text */}
            <h2 className="text-3xl md:text-5xl font-serif-luxury text-white tracking-wide glow-white-text italic leading-relaxed">
              "Okay Bhoomika... one last sweet surprise! ♡"
            </h2>
          </div>
        )}

        {/* STAGE 1: Assembling Gulab Jamun Text */}
        {stage === 1 && (
          <div className="absolute top-12 left-0 right-0 z-20 px-4 animate-fade-in flex flex-col items-center pointer-events-none">
            <span className="text-[11px] font-cinzel uppercase tracking-[0.3em] text-amber-300/80 mb-1">
              Pure Golden Sweetness
            </span>
            {/* Exact Requested Text */}
            <h3 className="text-2xl md:text-4xl font-serif-luxury text-amber-100 glow-gold-text italic">
              "Life should always be as sweet as Gulab Jamun."
            </h3>
          </div>
        )}

        {/* STAGE 2: Warm Birthday Advice */}
        {stage === 2 && (
          <div className="absolute top-12 left-0 right-0 z-20 px-4 animate-fade-in flex flex-col items-center pointer-events-none">
            <span className="text-[11px] font-cinzel uppercase tracking-[0.3em] text-pink-300/80 mb-1">
              Words For Your 20th Year
            </span>
            {/* Exact Requested Text */}
            <h3 className="text-2xl md:text-4xl font-serif-luxury text-rose-100 glow-pink-text italic">
              "Stay sweet, keep smiling and keep blooming!"
            </h3>
          </div>
        )}

        {/* STAGE 3: Grand Birthday Finale */}
        {stage >= 3 && (
          <div className="absolute bottom-10 left-0 right-0 z-20 px-6 animate-fade-in flex flex-col items-center pointer-events-auto">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-400/30 max-w-xl shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(251,191,36,0.2)] backdrop-blur-xl mb-6">
              <div className="flex items-center justify-center gap-2 mb-3 text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs uppercase tracking-[0.35em] font-cinzel">
                  Happy 20th Birthday
                </span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>

              {/* Exact Requested Text */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-pink-200 tracking-wider mb-3">
                Happy 20th Birthday, {recipientName}! ♡
              </h2>

              <p className="text-base sm:text-lg font-serif-luxury text-rose-200/90 italic leading-relaxed font-light">
                "Life should always be as sweet as Gulab Jamun. Stay sweet, keep smiling and keep blooming!"
              </p>

              <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber-300/50 to-transparent mx-auto my-4" />

              <span className="text-xs text-amber-300/80 font-mono-code">
                22 November • Created with all our hearts for {recipientName}
              </span>
            </div>

            {/* Replay The Story Button */}
            <button
              onClick={() => {
                audioSystem.playSparkle();
                onReplay();
              }}
              className="group px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-pink-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-medium text-xs tracking-widest uppercase transition-all duration-300 shadow-xl shadow-rose-950/50 hover:scale-105 active:scale-95 border border-amber-300/40 flex items-center gap-2.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-200 group-hover:-rotate-90 transition-transform duration-500" />
              <span>Replay The Whole Birthday Story</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
