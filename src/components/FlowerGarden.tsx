import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Flower2, Heart } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

interface FlowerGardenProps {
  onNextSection?: () => void;
}

export const FlowerGarden: React.FC<FlowerGardenProps> = ({ onNextSection }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [plantedCount, setPlantedCount] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e && e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        mouseX = (e as MouseEvent).clientX;
        mouseY = (e as MouseEvent).clientY;
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);

    // Interactive planted flower bursts
    interface PlantedFlower {
      x: number;
      y: number;
      size: number;
      maxSize: number;
      growth: number;
      petals: number;
      color: string;
      rotation: number;
      life: number;
    }
    const plantedFlowers: PlantedFlower[] = [];

    // Cherry blossoms & floating roses
    interface GardenPetal {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      type: 'sakura' | 'rose';
      color: string;
      rot: number;
      rotSpeed: number;
      flip: number;
      flipSpeed: number;
    }
    const petals: GardenPetal[] = [];
    const colors = ['#fbcfe8', '#fda4af', '#f472b6', '#fce7f3', '#fecdd3'];

    for (let i = 0; i < 50; i++) {
      petals.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.2) * 1.4,
        vy: Math.random() * 1.2 + 0.8,
        size: Math.random() * 10 + 8,
        type: Math.random() > 0.3 ? 'sakura' : 'rose',
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.03 + 0.015,
      });
    }

    // Glowing fireflies / fairy lights
    interface Firefly {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      speed: number;
      angle: number;
      radius: number;
      pulseSpeed: number;
      color: string;
    }
    const fireflies: Firefly[] = [];
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      fireflies.push({
        x,
        y,
        baseX: x,
        baseY: y,
        speed: Math.random() * 0.02 + 0.01,
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 80 + 30,
        pulseSpeed: Math.random() * 0.05 + 0.02,
        color: Math.random() > 0.4 ? 'rgba(253, 224, 71, ' : 'rgba(244, 114, 182, ',
      });
    }

    // Animated Butterflies
    interface Butterfly {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      wingAngle: number;
      wingSpeed: number;
      color: string;
      targetX: number;
      targetY: number;
    }
    const butterflies: Butterfly[] = [
      {
        x: 100,
        y: 200,
        vx: 1,
        vy: 0.5,
        size: 16,
        wingAngle: 0,
        wingSpeed: 0.25,
        color: '#f472b6',
        targetX: 300,
        targetY: 250,
      },
      {
        x: window.innerWidth - 150,
        y: 350,
        vx: -1,
        vy: -0.3,
        size: 18,
        wingAngle: 0,
        wingSpeed: 0.3,
        color: '#fbbf24',
        targetX: window.innerWidth - 300,
        targetY: 300,
      },
      {
        x: window.innerWidth / 2,
        y: window.innerHeight - 150,
        vx: 0.8,
        vy: -0.8,
        size: 14,
        wingAngle: 0,
        wingSpeed: 0.28,
        color: '#c084fc',
        targetX: window.innerWidth / 2 + 100,
        targetY: window.innerHeight - 250,
      },
    ];

    // Click handler to plant blooming flowers
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      audioSystem.playSparkle();
      setPlantedCount((prev) => prev + 1);

      // Plant 1-3 flowers around click
      for (let i = 0; i < 2; i++) {
        plantedFlowers.push({
          x: x + (Math.random() - 0.5) * 35,
          y: y + (Math.random() - 0.5) * 35,
          size: 0,
          maxSize: Math.random() * 22 + 18,
          growth: 0,
          petals: Math.floor(Math.random() * 3) + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI,
          life: 1.0,
        });
      }
    };

    canvas.addEventListener('click', handleClick);

    const render = () => {
      time += 0.03;

      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Planted Blooming Flowers
      for (let i = plantedFlowers.length - 1; i >= 0; i--) {
        const f = plantedFlowers[i];
        if (f.growth < 1) {
          f.growth += 0.04;
          f.size = f.maxSize * Math.sin(f.growth * Math.PI * 0.5);
        }

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        ctx.globalAlpha = Math.min(1, f.life);

        // Petals
        for (let p = 0; p < f.petals; p++) {
          const angle = (p * 2 * Math.PI) / f.petals;
          ctx.save();
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(f.size * 0.6, 0, f.size * 0.5, f.size * 0.3, 0, 0, Math.PI * 2);
          ctx.fillStyle = f.color;
          ctx.fill();
          ctx.restore();
        }

        // Flower golden pistil
        ctx.beginPath();
        ctx.arc(0, 0, f.size * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = '#fde047';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      // 2. Draw Drifting Petals (Sakura & Rose)
      petals.forEach((p) => {
        // Pointer breeze influence
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          const force = (140 - dist) / 140;
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 3;
        }

        p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.8;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(Math.cos(p.flip), 1);
        ctx.globalAlpha = 0.75;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(p.size * 0.8, -p.size * 0.5, p.size * 0.8, p.size * 0.8, 0, p.size);
        ctx.bezierCurveTo(-p.size * 0.8, p.size * 0.8, -p.size * 0.8, -p.size * 0.5, 0, 0);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();

        ctx.restore();
      });

      // 3. Draw Fireflies
      fireflies.forEach((ff) => {
        ff.angle += ff.speed;
        ff.x = ff.baseX + Math.cos(ff.angle) * ff.radius;
        ff.y = ff.baseY + Math.sin(ff.angle * 1.5) * (ff.radius * 0.6);

        // Gentle pull towards pointer
        const pDist = Math.hypot(ff.x - mouseX, ff.y - mouseY);
        if (pDist < 250) {
          ff.x += (mouseX - ff.x) * 0.015;
          ff.y += (mouseY - ff.y) * 0.015;
        }

        const alpha = Math.sin(time * 3 + ff.angle) * 0.35 + 0.55;

        ctx.beginPath();
        ctx.arc(ff.x, ff.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = ff.color + alpha + ')';
        ctx.shadowColor = ff.color + '1)';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 4. Draw Animated Butterflies
      butterflies.forEach((bf) => {
        bf.wingAngle += bf.wingSpeed;
        const wingScale = Math.sin(bf.wingAngle);

        // Move towards target smoothly
        bf.x += (bf.targetX - bf.x) * 0.015 + bf.vx;
        bf.y += (bf.targetY - bf.y) * 0.015 + Math.sin(time * 4) * 1.5;

        // Change target periodically
        if (Math.hypot(bf.targetX - bf.x, bf.targetY - bf.y) < 50 || Math.random() < 0.005) {
          bf.targetX = Math.random() * (width - 100) + 50;
          bf.targetY = Math.random() * (height - 150) + 50;
        }

        ctx.save();
        ctx.translate(bf.x, bf.y);

        // Left wing
        ctx.save();
        ctx.scale(wingScale, 1);
        ctx.beginPath();
        ctx.ellipse(-bf.size * 0.5, -bf.size * 0.3, bf.size * 0.6, bf.size * 0.4, -0.4, 0, Math.PI * 2);
        ctx.ellipse(-bf.size * 0.4, bf.size * 0.3, bf.size * 0.45, bf.size * 0.3, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = bf.color;
        ctx.shadowColor = bf.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Right wing
        ctx.save();
        ctx.scale(-wingScale, 1);
        ctx.beginPath();
        ctx.ellipse(-bf.size * 0.5, -bf.size * 0.3, bf.size * 0.6, bf.size * 0.4, -0.4, 0, Math.PI * 2);
        ctx.ellipse(-bf.size * 0.4, bf.size * 0.3, bf.size * 0.45, bf.size * 0.3, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = bf.color;
        ctx.shadowColor = bf.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Butterfly slender body
        ctx.beginPath();
        ctx.ellipse(0, 0, 1.5, bf.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-gradient-to-b from-[#08020a] via-[#140618] to-[#0a030c] flex items-center justify-center px-6 py-20">
      {/* Interactive canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair z-10" />

      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-pink-900/10 blur-[130px] pointer-events-none" />

      {/* Centerpiece Content Card */}
      <div className="relative z-20 max-w-2xl mx-auto text-center pointer-events-none">
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-rose-400/25 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Subtle floral emblem header */}
          <div className="flex items-center justify-center gap-2 mb-4 text-rose-300">
            <Flower2 className="w-5 h-5 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.35em] font-cinzel text-rose-200">
              The Enchanted Sanctuary
            </span>
            <Flower2 className="w-5 h-5 animate-pulse" />
          </div>

          <h3 className="text-3xl md:text-5xl font-serif-luxury text-white mb-6 leading-tight tracking-wide glow-white-text">
            The Magical Flower Garden
          </h3>

          {/* Central Birthday Message from Prompt */}
          <blockquote className="text-xl md:text-2xl font-serif-luxury text-rose-100/90 italic leading-relaxed mb-6 font-light">
            "May your life always be filled with colours, happiness, beautiful surprises, and endless dreams."
          </blockquote>

          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-rose-300/60 to-transparent mx-auto mb-6" />

          {/* Interactive hint */}
          <div className="flex flex-col items-center gap-2 text-xs text-rose-200/80 font-mono-code">
            <div className="flex items-center gap-2 bg-rose-950/40 px-4 py-2 rounded-full border border-rose-500/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Click or tap anywhere in the garden to plant blooming flowers!</span>
            </div>
            {plantedCount > 0 && (
              <span className="text-pink-300 text-[11px] font-sans">
                You've blossomed {plantedCount} enchanted flower{plantedCount > 1 ? 's' : ''} for Bhoomika ♡
              </span>
            )}
          </div>

          {onNextSection && (
            <div className="mt-8 pointer-events-auto">
              <button
                onClick={onNextSection}
                className="px-6 py-2.5 rounded-full glass-panel-gold text-amber-100 hover:text-white text-xs font-cinzel tracking-wider uppercase border border-amber-400/30 hover:border-amber-400/60 transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <span>Continue To Memories</span>
                <Heart className="w-3.5 h-3.5 text-rose-300" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

