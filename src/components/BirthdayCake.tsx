import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Cake, Sparkles, Mic, MicOff, RotateCcw } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

interface BirthdayCakeProps {
  recipientName: string;
}

export const BirthdayCake: React.FC<BirthdayCakeProps> = ({ recipientName }) => {
  const [candlesBlown, setCandlesBlown] = useState<boolean>(false);
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micIntervalRef = useRef<number | null>(null);

  // Trigger candle blowout
  const handleBlowOut = () => {
    if (candlesBlown) return;

    setCandlesBlown(true);
    audioSystem.playBlowCandles();

    // Fire celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#f472b6', '#fb7185', '#fbbf24', '#fbcfe8', '#ffffff'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fda4af', '#f472b6', '#fef08a'],
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fda4af', '#f472b6', '#fef08a'],
        });
      }, 300);
    } catch {
      // Fallback if confetti fails
    }

    // Stop mic if listening
    stopMicListening();
  };

  const handleRelight = () => {
    setCandlesBlown(false);
    audioSystem.playSparkle();
  };

  // Optional Microphone blow detection
  const startMicListening = async () => {
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicListening(true);

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      micIntervalRef.current = window.setInterval(() => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(buffer);

        // Calculate average volume in low-mid frequencies (blowing noise)
        let sum = 0;
        for (let i = 0; i < 60; i++) {
          sum += buffer[i];
        }
        const avg = sum / 60;

        // If high breath energy detected, blow out candles!
        if (avg > 65) {
          handleBlowOut();
        }
      }, 100);
    } catch {
      setMicError('Microphone access unavailable or denied. Tap candles instead!');
      setIsMicListening(false);
    }
  };

  const stopMicListening = () => {
    if (micIntervalRef.current !== null) {
      clearInterval(micIntervalRef.current);
      micIntervalRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsMicListening(false);
  };

  useEffect(() => {
    return () => {
      stopMicListening();
    };
  }, []);

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-b from-[#0a030c] via-[#160617] to-[#08020a] py-24 px-6 flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-pink-900/15 blur-[140px] pointer-events-none" />

      {/* Section Header */}
      <div className="text-center mb-10 relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-rose-400/20 text-rose-300 text-xs tracking-[0.3em] uppercase font-cinzel mb-4">
          <Cake className="w-3.5 h-3.5" />
          <span>The Birthday Ritual</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif-luxury text-white mb-3 tracking-wide glow-white-text">
          {candlesBlown ? 'A Wish Cast To The Stars' : `Make a wish, ${recipientName}!`}
        </h2>

        <p className="text-base md:text-xl font-serif-luxury text-rose-200/90 italic">
          {candlesBlown ? (
            <span className="text-pink-300 glow-pink-text font-normal">
              "May this wish become a beautiful reality." ✨
            </span>
          ) : (
            `Close your eyes, hold your deepest dream in your heart, and blow out the candles.`
          )}
        </p>
      </div>

      {/* INTERACTIVE CAKE PRESENTATION */}
      <div className="relative z-20 w-full max-w-md flex flex-col items-center">
        {/* CAKE STRUCTURE */}
        <div
          onClick={handleBlowOut}
          className="relative w-72 sm:w-80 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          {/* CANDLES ROW (Numbered 2 and 0 with flames) */}
          <div className="relative z-30 flex items-end justify-center gap-6 mb-1">
            {/* Candle 2 */}
            <div className="flex flex-col items-center">
              {/* Flame */}
              {!candlesBlown ? (
                <div className="relative flex flex-col items-center mb-1 animate-flame">
                  {/* Outer flame */}
                  <div className="w-4 h-7 rounded-[50%_50%_40%_40%/60%_60%_40%_40%] bg-gradient-to-t from-rose-500 via-amber-400 to-yellow-200 shadow-[0_0_20px_#f59e0b,0_0_35px_#f43f5e]" />
                  {/* Inner blue-white core */}
                  <div className="absolute bottom-0 w-2 h-3.5 rounded-full bg-white/90 shadow-[0_0_8px_#38bdf8]" />
                </div>
              ) : (
                /* Smoke particle effect */
                <div className="h-7 flex flex-col items-center justify-end">
                  <div className="w-1.5 h-6 bg-gradient-to-t from-zinc-400 to-transparent rounded-full animate-pulse opacity-60 transform -rotate-6" />
                </div>
              )}
              {/* Candle Wick */}
              <div className="w-0.5 h-2 bg-zinc-800" />
              {/* Candle Pillar Number "2" */}
              <div className="w-9 h-14 rounded-t-lg bg-gradient-to-b from-amber-200 via-pink-200 to-rose-300 shadow-md border-t border-amber-100 flex items-center justify-center font-serif-luxury font-bold text-2xl text-rose-900">
                2
              </div>
            </div>

            {/* Candle 0 */}
            <div className="flex flex-col items-center">
              {/* Flame */}
              {!candlesBlown ? (
                <div className="relative flex flex-col items-center mb-1 animate-flame" style={{ animationDelay: '0.2s' }}>
                  {/* Outer flame */}
                  <div className="w-4 h-7 rounded-[50%_50%_40%_40%/60%_60%_40%_40%] bg-gradient-to-t from-rose-500 via-amber-400 to-yellow-200 shadow-[0_0_20px_#f59e0b,0_0_35px_#f43f5e]" />
                  {/* Inner blue-white core */}
                  <div className="absolute bottom-0 w-2 h-3.5 rounded-full bg-white/90 shadow-[0_0_8px_#38bdf8]" />
                </div>
              ) : (
                /* Smoke particle effect */
                <div className="h-7 flex flex-col items-center justify-end">
                  <div className="w-1.5 h-6 bg-gradient-to-t from-zinc-400 to-transparent rounded-full animate-pulse opacity-60 transform rotate-6" />
                </div>
              )}
              {/* Candle Wick */}
              <div className="w-0.5 h-2 bg-zinc-800" />
              {/* Candle Pillar Number "0" */}
              <div className="w-9 h-14 rounded-t-lg bg-gradient-to-b from-amber-200 via-pink-200 to-rose-300 shadow-md border-t border-amber-100 flex items-center justify-center font-serif-luxury font-bold text-2xl text-rose-900">
                0
              </div>
            </div>
          </div>

          {/* TOP TIER */}
          <div className="relative z-20 w-48 h-18 rounded-t-2xl bg-gradient-to-r from-[#ffdbe6] via-[#fff0f5] to-[#ffd0de] shadow-[inset_0_4px_8px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.3)] border-t border-[#ffeef4] flex items-center justify-around px-3">
            {/* White piped cream swirls along top edge */}
            <div className="absolute -top-2 inset-x-2 flex justify-between">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full bg-white shadow-xs border border-pink-100"
                />
              ))}
            </div>

            {/* Decorative strawberry roses & pearls */}
            <span className="text-sm">🌸</span>
            <span className="text-xs">✨</span>
            <span className="text-sm font-script text-rose-700 font-bold">Twenty</span>
            <span className="text-xs">✨</span>
            <span className="text-sm">🌸</span>

            {/* Drips of strawberry glaze */}
            <div className="absolute -bottom-1.5 inset-x-4 flex justify-around">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 rounded-b-full bg-[#f43f5e] opacity-80"
                  style={{ height: `${(i % 3) * 5 + 6}px` }}
                />
              ))}
            </div>
          </div>

          {/* BOTTOM TIER */}
          <div className="relative z-10 w-68 h-24 rounded-t-2xl bg-gradient-to-r from-[#fcb9cc] via-[#ffd6e3] to-[#faaec4] shadow-[inset_0_4px_8px_rgba(255,255,255,0.8),0_12px_30px_rgba(0,0,0,0.5)] border-t border-[#ffeef4] flex flex-col justify-between p-3 overflow-hidden">
            {/* Piped cream along rim */}
            <div className="absolute -top-2 inset-x-2 flex justify-between">
              {[...Array(13)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full bg-white shadow-xs border border-pink-100"
                />
              ))}
            </div>

            {/* Golden Ribbon Band */}
            <div className="w-full h-3 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 rounded-full shadow-inner mt-4 border-t border-b border-amber-100/50 flex items-center justify-center">
              <span className="text-[8px] font-cinzel text-amber-900 tracking-widest uppercase">
                Happy 20th Bhoomika
              </span>
            </div>

            {/* Bottom sugar pearl beads */}
            <div className="flex justify-between px-2">
              {[...Array(11)].map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-100 to-amber-400 shadow-xs"
                />
              ))}
            </div>
          </div>

          {/* LUXURY GOLDEN CAKE STAND */}
          <div className="relative w-80 h-4 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.7)] border-t border-amber-200 flex items-center justify-center" />
          <div className="w-32 h-6 bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 shadow-lg" />
          <div className="w-48 h-3 bg-gradient-to-r from-amber-600 via-amber-300 to-amber-600 rounded-full shadow-xl" />
        </div>

        {/* INTERACTIVE CONTROLS */}
        <div className="mt-8 flex flex-col items-center gap-3">
          {!candlesBlown ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleBlowOut}
                className="group px-7 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs tracking-wider uppercase transition-all duration-300 shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95 border border-pink-300/30 flex items-center gap-2 cursor-pointer"
              >
                <span>Blow Out Candles</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              </button>

              <button
                onClick={isMicListening ? stopMicListening : startMicListening}
                className={`p-3 rounded-full glass-panel border transition-all cursor-pointer ${
                  isMicListening
                    ? 'border-emerald-400 text-emerald-300 animate-pulse bg-emerald-950/40'
                    : 'border-white/10 text-zinc-300 hover:text-white'
                }`}
                title={isMicListening ? 'Listening for your blow... blow into mic!' : 'Use microphone to blow'}
              >
                {isMicListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <button
              onClick={handleRelight}
              className="px-6 py-2.5 rounded-full glass-panel-gold text-amber-200 hover:text-white text-xs font-mono-code uppercase tracking-wider border border-amber-400/30 hover:border-amber-400/60 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Relight Candles & Wish Again</span>
            </button>
          )}

          {isMicListening && !candlesBlown && (
            <p className="text-xs text-emerald-300 font-mono-code animate-pulse">
              🎤 Mic listening... gently blow into your microphone now!
            </p>
          )}

          {micError && (
            <p className="text-xs text-rose-300/80 font-mono-code">{micError}</p>
          )}

          <span className="text-[11px] text-zinc-500 font-mono-code mt-1">
            Tap the cake anytime to extinguish the candles
          </span>
        </div>
      </div>
    </section>
  );
};

