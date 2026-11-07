import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Play, Pause, Sparkles } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

export const AudioPlayerWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => audioSystem.getIsPlaying());
  const [isMuted, setIsMuted] = useState<boolean>(() => audioSystem.getIsMuted());
  const [volume, setVolume] = useState<number>(() => audioSystem.getVolume());
  const [soundscape, setSoundscape] = useState<'bloom' | 'celesta' | 'golden'>(() => audioSystem.getSoundscape());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying(audioSystem.getIsPlaying());
      setIsMuted(audioSystem.getIsMuted());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleTogglePlay = () => {
    if (isPlaying) {
      audioSystem.stopMusic();
      setIsPlaying(false);
    } else {
      audioSystem.startMusic();
      setIsPlaying(true);
    }
  };

  const handleToggleMute = () => {
    const muted = audioSystem.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioSystem.setVolume(val);
  };

  const handleSelectSoundscape = (mode: 'bloom' | 'celesta' | 'golden') => {
    setSoundscape(mode);
    audioSystem.setSoundscape(mode);
    audioSystem.playSparkle();
  };

  const soundscapeLabels: Record<'bloom' | 'celesta' | 'golden', string> = {
    bloom: "Bloom Theme",
    celesta: "Celestial Stars",
    golden: "Golden Lullaby",
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 select-none">
      <div className="glass-panel p-2 rounded-full border border-rose-400/25 shadow-2xl flex items-center gap-2 backdrop-blur-xl">
        {/* Play/Pause Button */}
        <button
          onClick={handleTogglePlay}
          className="p-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-500 hover:to-pink-500 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
          title={isPlaying ? 'Pause Ambient Soundtrack' : 'Play Ambient Soundtrack'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* Animated Waveform Visualizer */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-2 cursor-pointer"
          title="Click to adjust sound settings"
        >
          {[0.6, 1.0, 0.4, 0.8, 0.5].map((height, i) => (
            <div
              key={i}
              className={`w-0.5 rounded-full bg-rose-400 transition-all ${
                isPlaying && !isMuted ? 'animate-pulse' : 'h-1.5 opacity-40'
              }`}
              style={{
                height: isPlaying && !isMuted ? `${height * 14}px` : '6px',
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.8s',
              }}
            />
          ))}
        </div>

        {/* Track Title (Collapsed / Expanded) */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden sm:flex flex-col cursor-pointer pr-2"
        >
          <span className="text-[11px] font-medium text-rose-100 leading-tight flex items-center gap-1">
            <Music className="w-3 h-3 text-pink-400" />
            <span>{soundscapeLabels[soundscape]}</span>
          </span>
          <span className="text-[9px] text-zinc-400 font-mono-code">
            {isPlaying && !isMuted ? 'Ambient Synth Active' : 'Sound Paused'}
          </span>
        </div>

        {/* Mute Button */}
        <button
          onClick={handleToggleMute}
          className="p-2 rounded-full hover:bg-white/10 text-rose-300 hover:text-white transition-all cursor-pointer"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Expanded Drawer: Volume & Soundscape Presets */}
        {isExpanded && (
          <div className="flex items-center gap-3 pl-2 pr-3 border-l border-white/10 animate-fade-in">
            {/* Volume slider */}
            <div className="flex items-center gap-1.5">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-14 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <span className="text-[10px] font-mono-code text-zinc-400">
                {Math.round(volume * 100)}%
              </span>
            </div>

            {/* Soundscape preset pills */}
            <div className="flex items-center gap-1 pl-2 border-l border-white/10">
              <button
                onClick={() => handleSelectSoundscape('bloom')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono-code transition-all cursor-pointer ${
                  soundscape === 'bloom'
                    ? 'bg-rose-500 text-white font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Warm Rhodes Chords"
              >
                Bloom
              </button>
              <button
                onClick={() => handleSelectSoundscape('celesta')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono-code transition-all cursor-pointer ${
                  soundscape === 'celesta'
                    ? 'bg-amber-500 text-white font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Celestial Music Box"
              >
                Stars
              </button>
              <button
                onClick={() => handleSelectSoundscape('golden')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono-code transition-all cursor-pointer ${
                  soundscape === 'golden'
                    ? 'bg-pink-600 text-white font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Golden Lullaby"
              >
                Lullaby
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
