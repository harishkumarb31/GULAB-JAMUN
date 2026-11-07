import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Clock, Sun, Moon, Calendar } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

interface MilestoneCounterProps {
  recipientName: string;
}

export const MilestoneCounter: React.FC<MilestoneCounterProps> = ({ recipientName }) => {
  // 20 years calculation
  const [liveSeconds, setLiveSeconds] = useState<number>(0);

  useEffect(() => {
    // Reference date: Nov 22, 2006
    const birthDate = new Date('2006-11-22T00:00:00');
    
    const updateTime = () => {
      const now = new Date();
      const diffMs = now.getTime() - birthDate.getTime();
      setLiveSeconds(Math.floor(diffMs / 1000));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Years of Radiance', value: '20', icon: Sun, color: 'text-amber-300', bg: 'from-amber-500/20 to-amber-900/10' },
    { label: 'Months of Grace', value: '240', icon: Calendar, color: 'text-rose-300', bg: 'from-rose-500/20 to-rose-900/10' },
    { label: 'Days of Kindness', value: '7,305+', icon: Moon, color: 'text-pink-300', bg: 'from-pink-500/20 to-pink-900/10' },
    { label: 'Hours of Laughter', value: '175,320+', icon: Clock, color: 'text-purple-300', bg: 'from-purple-500/20 to-purple-900/10' },
  ];

  return (
    <section className="relative w-full py-20 px-6 bg-gradient-to-b from-[#140618] via-[#100416] to-[#0a030c] overflow-hidden text-center">
      {/* Delicate background illumination */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-600/10 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-rose-400/20 text-rose-300 text-xs tracking-[0.3em] uppercase font-cinzel mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Chapter 20 In Numbers</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-serif-luxury text-white mb-4 tracking-wide glow-white-text">
          Twenty Beautiful Years of {recipientName}
        </h2>
        <p className="text-sm md:text-base font-serif-luxury text-rose-200/70 italic max-w-xl mx-auto mb-12">
          "Every second of the past twenty years has woven into the wonderful person you are today."
        </p>

        {/* Milestone Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                onMouseEnter={() => audioSystem.playSparkle()}
                className="group relative glass-panel p-6 rounded-2xl border border-rose-400/20 hover:border-rose-400/50 transition-all duration-300 hover:scale-105 shadow-lg overflow-hidden cursor-default"
              >
                <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-br ${stat.bg} blur-xl group-hover:scale-150 transition-transform`} />
                <Icon className={`w-6 h-6 ${stat.color} mb-3 mx-auto`} />
                <h3 className="text-3xl sm:text-4xl font-cinzel font-bold text-white mb-1 tracking-wider glow-white-text">
                  {stat.value}
                </h3>
                <p className="text-xs font-mono-code text-rose-200/70 tracking-wider uppercase">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Live Second Counter Card */}
        <div className="glass-panel p-6 rounded-3xl border border-amber-300/30 max-w-md mx-auto shadow-2xl backdrop-blur-xl">
          <span className="text-[10px] font-cinzel uppercase tracking-[0.35em] text-amber-300 block mb-2">
            Live Precision Milestone
          </span>
          <div className="font-mono-code text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-pink-200 tracking-wider">
            {liveSeconds > 0 ? liveSeconds.toLocaleString() : '631,152,000'}{' '}
            <span className="text-sm text-rose-300 font-normal">Seconds</span>
          </div>
          <p className="text-xs font-serif-luxury text-rose-200/70 italic mt-2 flex items-center justify-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
            <span>...and counting of making this world a gentler, brighter place.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

