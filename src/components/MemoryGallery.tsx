import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ImagePlus,
  RotateCcw,
  Heart,
  Maximize2,
} from 'lucide-react';
import type { MemoryItem } from '../types';
import { audioSystem } from '../utils/audioSystem';

interface MemoryGalleryProps {
  initialMemories: MemoryItem[];
}

export const MemoryGallery: React.FC<MemoryGalleryProps> = ({ initialMemories }) => {
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    // If the saved memories still contain old unsplash URLs, refresh to initialMemories
    const saved = localStorage.getItem('bloom_memories_custom_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && parsed[0].imageUrl.includes('/images/memories/')) {
          return parsed;
        }
      } catch {
        return initialMemories;
      }
    }
    return initialMemories;
  });

  const revealedCount = 6; // Display all 6 original photographs
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingCardIndex, setEditingCardIndex] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Floating ambient sparkles & petals canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const elements: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      type: 'heart' | 'sparkle' | 'petal';
      color: string;
      alpha: number;
      rot: number;
    }> = [];

    const colors = ['#f472b6', '#fda4af', '#fbbf24', '#fbcfe8'];

    for (let i = 0; i < 40; i++) {
      elements.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 8 + 6,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.6,
        type: i % 3 === 0 ? 'heart' : i % 3 === 1 ? 'sparkle' : 'petal',
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.25,
        rot: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      time += 0.02;
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);

      ctx.clearRect(0, 0, width, height);

      elements.forEach((el) => {
        el.y -= el.speedY;
        el.x += el.speedX + Math.sin(time + el.y * 0.02) * 0.4;
        el.rot += 0.01;

        if (el.y < -20) {
          el.y = height + 20;
          el.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rot);
        ctx.globalAlpha = el.alpha;
        ctx.fillStyle = el.color;

        if (el.type === 'heart') {
          // Draw tiny heart
          ctx.beginPath();
          const s = el.size * 0.5;
          ctx.moveTo(0, s * 0.3);
          ctx.bezierCurveTo(s, -s * 0.8, s * 1.5, s * 0.3, 0, s * 1.5);
          ctx.bezierCurveTo(-s * 1.5, s * 0.3, -s, -s * 0.8, 0, s * 0.3);
          ctx.fill();
        } else if (el.type === 'sparkle') {
          // Draw 4-point sparkle star
          ctx.beginPath();
          const s = el.size;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.fill();
        } else {
          // Rose petal
          ctx.beginPath();
          ctx.ellipse(0, 0, el.size * 0.8, el.size * 0.45, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const openLightbox = (index: number) => {
    setActiveLightboxIndex(index);
    audioSystem.playSparkle();
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const nextPhoto = () => {
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((prev) =>
        prev !== null ? (prev + 1) % memories.length : null
      );
      audioSystem.playSparkle();
    }
  };

  const prevPhoto = () => {
    if (activeLightboxIndex !== null) {
      setActiveLightboxIndex((prev) =>
        prev !== null ? (prev - 1 + memories.length) % memories.length : null
      );
      audioSystem.playSparkle();
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev + 1) % memories.length : null
        );
        audioSystem.playSparkle();
      } else if (e.key === 'ArrowLeft') {
        setActiveLightboxIndex((prev) =>
          prev !== null ? (prev - 1 + memories.length) % memories.length : null
        );
        audioSystem.playSparkle();
      } else if (e.key === 'Escape') {
        setActiveLightboxIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, memories.length]);

  // Card update handler
  const handleUpdateCurrentCard = (updates: Partial<MemoryItem>) => {
    const updated = [...memories];
    updated[editingCardIndex] = { ...updated[editingCardIndex], ...updates };
    setMemories(updated);
    localStorage.setItem('bloom_memories_custom_v2', JSON.stringify(updated));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleUpdateCurrentCard({ imageUrl: event.target.result as string });
          audioSystem.playSparkle();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetMemories = () => {
    if (window.confirm("Reset Bhoomika's photo gallery to default photographs?")) {
      setMemories(initialMemories);
      localStorage.removeItem('bloom_memories_custom_v2');
      localStorage.removeItem('bloom_memories_custom');
    }
  };

  const currentLightbox = activeLightboxIndex !== null ? memories[activeLightboxIndex] : null;

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-[#0a030c] via-[#120516] to-[#08020b] py-24 px-4 sm:px-6 overflow-hidden">
      {/* Floating Canvas with hearts, sparkles & petals */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Atmospheric ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-rose-950/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-pink-900/15 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-20">
        {/* SECTION HEADER */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-rose-400/20 text-rose-300 text-xs tracking-[0.35em] uppercase font-cinzel mb-4 shadow-lg">
            <Camera className="w-3.5 h-3.5 text-pink-400" />
            <span>Digital Scrapbook</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>

          {/* Requested Main Title: "A Few Moments, A Thousand Memories..." */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury text-white mb-3 tracking-wide glow-white-text">
            A Few Moments, A Thousand Memories...
          </h2>

          {/* Requested Opening Caption */}
          <p className="text-lg md:text-xl font-serif-luxury text-rose-200/90 italic max-w-xl mx-auto mb-2">
            "Every picture holds a little piece of happiness."
          </p>

          <p className="text-xs text-rose-300/60 font-mono-code tracking-wider uppercase">
            Captured moments celebrating Bhoomika's radiant journey
          </p>

          {/* Interactive controls */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-panel-gold text-amber-200 hover:text-white text-xs font-mono-code tracking-wider uppercase border border-amber-400/30 hover:border-amber-400/60 transition-all cursor-pointer hover:scale-105"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Photo Captions</span>
            </button>

            <button
              onClick={handleResetMemories}
              className="p-2 rounded-full glass-panel text-zinc-400 hover:text-rose-200 text-xs border border-white/10 hover:border-rose-400/30 transition-all cursor-pointer"
              title="Reset photos to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* POLAROID SCRAPBOOK GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 px-2 sm:px-4">
          {memories.slice(0, revealedCount).map((item, idx) => (
            <PolaroidCard
              key={item.id}
              item={item}
              index={idx}
              onOpen={() => openLightbox(idx)}
            />
          ))}
        </div>

        {/* Requested Closing Caption Banner */}
        <div className="mt-20 max-w-2xl mx-auto text-center">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-400/25 shadow-xl backdrop-blur-xl relative overflow-hidden">
            <Heart className="w-6 h-6 text-pink-400 fill-pink-400/40 mx-auto mb-3 animate-pulse" />
            <blockquote className="font-serif-luxury text-xl sm:text-2xl text-rose-100 italic leading-relaxed font-light">
              "Some moments become memories. Some memories become treasures."
            </blockquote>
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-rose-300/50 to-transparent mx-auto my-4" />
            <span className="text-xs font-cinzel uppercase tracking-[0.25em] text-rose-300/70">
              Forever Blooming • Bhoomika 20
            </span>
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL WITH ZOOM & NAVIGATION */}
      {currentLightbox && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-6 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[92vh] bg-[#0e0612] rounded-3xl border border-rose-400/30 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_50px_rgba(244,114,182,0.2)] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 text-white hover:text-rose-300 hover:bg-black/90 transition-all cursor-pointer border border-white/20"
              title="Close gallery (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Previous Arrow */}
            <button
              onClick={prevPhoto}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 text-white hover:text-rose-300 hover:bg-black/80 transition-all cursor-pointer border border-white/20"
              title="Previous photo (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next Arrow */}
            <button
              onClick={nextPhoto}
              className="absolute right-3 md:right-[380px] top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 text-white hover:text-rose-300 hover:bg-black/80 transition-all cursor-pointer border border-white/20"
              title="Next photo (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Photo Container - PRESERVES ORIGINAL ASPECT RATIO WITHOUT DISTORTION */}
            <div className="md:w-3/5 bg-black flex items-center justify-center p-4 min-h-[350px] md:min-h-[550px] relative overflow-hidden">
              <img
                src={currentLightbox.imageUrl}
                alt={currentLightbox.title}
                className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-500 hover:scale-105"
              />
            </div>

            {/* Story & Caption Sidebar */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-rose-500/20 bg-gradient-to-b from-[#140618] to-[#0a030c]">
              <div>
                <div className="flex items-center gap-2 text-rose-300 text-xs font-cinzel uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    Memory {(activeLightboxIndex ?? 0) + 1} of {memories.length}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif-luxury text-white mb-2 leading-tight">
                  {currentLightbox.title}
                </h3>

                <p className="text-xl sm:text-2xl font-script text-pink-300 mb-6 leading-relaxed">
                  "{currentLightbox.caption}"
                </p>

                <div className="space-y-2 text-xs text-rose-200/80 font-mono-code pt-4 border-t border-rose-500/15">
                  <p>
                    <span className="text-zinc-400">Date/Time:</span> {currentLightbox.date}
                  </p>
                  {currentLightbox.location && (
                    <p>
                      <span className="text-zinc-400">Moment:</span> {currentLightbox.location}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-5">
                  {currentLightbox.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-[11px] bg-rose-950/60 text-rose-200 border border-rose-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Lightbox Controls */}
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-zinc-500 text-[11px]">Use ← / → keys to navigate</span>
                <button
                  onClick={() => {
                    setEditingCardIndex(activeLightboxIndex ?? 0);
                    closeLightbox();
                    setIsEditModalOpen(true);
                  }}
                  className="text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Caption</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div
          onClick={() => setIsEditModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-lg w-full bg-[#120617] rounded-3xl border border-rose-400/40 p-6 md:p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-rose-300" />
                <h3 className="text-xl font-serif-luxury text-white">
                  Customize Photo Captions & Details
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-rose-200/70 mb-4">
              Select which memory card to edit. All edits are saved instantly for Bhoomika!
            </p>

            {/* Select card tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {memories.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setEditingCardIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono-code whitespace-nowrap transition-all ${
                    editingCardIndex === idx
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'glass-panel text-zinc-300 hover:text-white'
                  }`}
                >
                  Photo {idx + 1}
                </button>
              ))}
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono-code text-zinc-400 uppercase mb-1">
                  Photo Source (Upload file or URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={memories[editingCardIndex].imageUrl}
                    onChange={(e) => handleUpdateCurrentCard({ imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-rose-500/30 text-white text-xs focus:outline-none focus:border-rose-400 font-mono-code"
                  />
                  <label className="px-3.5 py-2 rounded-lg bg-rose-700/60 hover:bg-rose-600 text-white text-xs font-medium cursor-pointer flex items-center gap-1.5 transition-colors">
                    <ImagePlus className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-code text-zinc-400 uppercase mb-1">
                  Card Title
                </label>
                <input
                  type="text"
                  value={memories[editingCardIndex].title}
                  onChange={(e) => handleUpdateCurrentCard({ title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-rose-500/30 text-white text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-code text-zinc-400 uppercase mb-1">
                  Handwritten Caption
                </label>
                <input
                  type="text"
                  value={memories[editingCardIndex].caption}
                  onChange={(e) => handleUpdateCurrentCard({ caption: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-rose-500/30 text-white text-xs focus:outline-none focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-code text-zinc-400 uppercase mb-1">
                  Date / Occasion
                </label>
                <input
                  type="text"
                  value={memories[editingCardIndex].date}
                  onChange={(e) => handleUpdateCurrentCard({ date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-rose-500/30 text-white text-xs focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-medium uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// 3D Tilt Polaroid Card Component
interface PolaroidCardProps {
  item: MemoryItem;
  index: number;
  onOpen: () => void;
}

const PolaroidCard: React.FC<PolaroidCardProps> = ({ item, index, onOpen }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={onOpen}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.04, 1.04, 1.04)`
          : `rotate(${item.rotation}deg)`,
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
      }}
      className="group relative cursor-pointer select-none"
    >
      {/* Rose Gold Washi Tape Top Accent */}
      <div
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-rose-300/45 backdrop-blur-xs z-20 shadow-xs border-t border-b border-rose-100/50"
        style={{
          transform: `rotate(${index % 2 === 0 ? '-3.5deg' : '4deg'})`,
          clipPath: 'polygon(0% 0%, 100% 0%, 96% 100%, 4% 100%)',
        }}
      />

      {/* Polaroid Frame */}
      <div className="bg-[#fefbfa] p-4 pb-6 rounded-sm shadow-[0_18px_40px_rgba(0,0,0,0.7),0_4px_16px_rgba(244,114,182,0.18)] border border-[#ebdce3] transition-shadow duration-300 group-hover:shadow-[0_24px_55px_rgba(244,114,182,0.35),0_0_30px_rgba(251,191,36,0.2)]">
        {/* Photo Container - Clean Object Positioning to avoid awkward cropping */}
        <div className="relative aspect-[4/5] overflow-hidden bg-rose-950/20 rounded-xs mb-4 flex items-center justify-center">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
            loading="lazy"
          />

          {/* Hover Overlay with View icon */}
          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 text-white">
            <span className="p-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 transform scale-75 group-hover:scale-100 transition-transform">
              <Maximize2 className="w-5 h-5 text-rose-200" />
            </span>
          </div>

          {/* Corner Floral Sparkle Accent */}
          <div className="absolute bottom-2 right-2 text-rose-300/80 group-hover:scale-125 transition-transform pointer-events-none">
            <Sparkles className="w-4 h-4 drop-shadow" />
          </div>
        </div>

        {/* Handwritten Polaroid Caption */}
        <div className="text-center px-1">
          <h4 className="font-serif-luxury font-semibold text-zinc-900 text-lg leading-snug tracking-wide">
            {item.title}
          </h4>
          <p className="font-script text-2xl text-rose-700 mt-1 leading-tight">
            {item.caption}
          </p>
          <div className="mt-2 text-[10px] uppercase font-mono-code text-zinc-400 tracking-widest flex items-center justify-center gap-1.5">
            <span>{item.date}</span>
            {item.location && <span>• {item.location}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
