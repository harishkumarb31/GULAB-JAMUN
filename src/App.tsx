import React, { useState } from 'react';
import { INITIAL_BIRTHDAY_DATA } from './config/birthdayData';
import type { BirthdayData } from './types';
import { AsciiRoseScene } from './components/AsciiRoseScene';
import { BirthdayReveal } from './components/BirthdayReveal';
import { FlowerGarden } from './components/FlowerGarden';
import { MemoryGallery } from './components/MemoryGallery';
import { BirthdayLetter } from './components/BirthdayLetter';
import { BirthdayCake } from './components/BirthdayCake';
import { CelebrationRoom } from './components/CelebrationRoom';
import { SecretSurprise } from './components/SecretSurprise';
import { GulabJamunSurprise } from './components/GulabJamunSurprise';
import { AudioPlayerWidget } from './components/AudioPlayerWidget';
import { NavBar } from './components/NavBar';

export const App: React.FC = () => {
  const [data] = useState<BirthdayData>(INITIAL_BIRTHDAY_DATA);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [isExploreMode, setIsExploreMode] = useState<boolean>(false);
  const [hasStartedStory, setHasStartedStory] = useState<boolean>(false);

  const sectionNames = [
    'The Universe',
    'The Reveal',
    'Flower Garden',
    'Memories',
    'The Letter',
    'Birthday Cake',
    'Celebration',
    'Secret Gift',
    'Sweet Finale 🍯',
  ];

  // Sync scroll in Explore Mode
  const scrollToSection = (index: number) => {
    setCurrentSection(index);
    if (isExploreMode) {
      const el = document.getElementById(`section-${index}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleRestart = () => {
    setCurrentSection(0);
    setIsExploreMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-[#050308] text-white overflow-x-hidden">
      {/* Global Navigation Bar */}
      {(hasStartedStory || currentSection > 0 || isExploreMode) && (
        <NavBar
          currentSection={currentSection}
          totalSections={sectionNames.length}
          sectionNames={sectionNames}
          onSelectSection={scrollToSection}
          isExploreMode={isExploreMode}
          onToggleExploreMode={() => {
            setIsExploreMode((prev) => !prev);
            setHasStartedStory(true);
          }}
          onRestart={handleRestart}
        />
      )}

      {/* Floating Audio Soundtrack Player */}
      <AudioPlayerWidget />

      {/* MAIN VIEWPORT DISPLAY */}
      {!isExploreMode ? (
        /* GUIDED CINEMATIC STORY MODE */
        <main className="w-full">
          {currentSection === 0 && (
            <AsciiRoseScene
              onComplete={() => {
                setHasStartedStory(true);
                setCurrentSection(1);
              }}
              onStartMusic={() => setHasStartedStory(true)}
            />
          )}

          {currentSection === 1 && (
            <BirthdayReveal
              data={data}
              onEnterWorld={() => {
                setCurrentSection(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {currentSection === 2 && (
            <div className="flex flex-col">
              <FlowerGarden onNextSection={() => setCurrentSection(3)} />
            </div>
          )}

          {currentSection === 3 && (
            <div className="flex flex-col">
              <MemoryGallery initialMemories={data.memories} />
              <div className="bg-[#08020b] pb-16 flex justify-center">
                <button
                  onClick={() => setCurrentSection(4)}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                  Proceed To Birthday Letter →
                </button>
              </div>
            </div>
          )}

          {currentSection === 4 && (
            <div className="flex flex-col">
              <BirthdayLetter
                initialData={data.letter}
                recipientName={data.recipient.name}
              />
              <div className="bg-[#0a030c] pb-16 flex justify-center">
                <button
                  onClick={() => setCurrentSection(5)}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                  Proceed To Birthday Cake →
                </button>
              </div>
            </div>
          )}

          {currentSection === 5 && (
            <div className="flex flex-col">
              <BirthdayCake recipientName={data.recipient.name} />
              <div className="bg-[#08020a] pb-16 flex justify-center">
                <button
                  onClick={() => setCurrentSection(6)}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-600 via-pink-600 to-rose-600 text-white font-medium text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                  Enter The Celebration Room →
                </button>
              </div>
            </div>
          )}

          {currentSection === 6 && (
            <div className="flex flex-col">
              <CelebrationRoom data={data} />
              <div className="bg-[#0d0312] pb-16 flex justify-center">
                <button
                  onClick={() => setCurrentSection(7)}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-white font-medium text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                  Unlock Secret Gift 🎁 →
                </button>
              </div>
            </div>
          )}

          {currentSection === 7 && (
            <div className="flex flex-col">
              <SecretSurprise initialMessage={data.secretMessage} />
              <div className="bg-[#0b030e] pb-16 flex justify-center">
                <button
                  onClick={() => setCurrentSection(8)}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-600 via-pink-600 to-rose-600 text-white font-medium text-xs tracking-widest uppercase hover:scale-105 transition-all shadow-lg cursor-pointer flex items-center gap-2"
                >
                  <span>One Last Sweet Surprise 🍯 →</span>
                </button>
              </div>
            </div>
          )}

          {currentSection === 8 && (
            <GulabJamunSurprise
              recipientName={data.recipient.name}
              onReplay={handleRestart}
            />
          )}
        </main>
      ) : (
        /* EXPLORE ALL CONTINUOUS WORLD MODE */
        <main className="w-full pt-16">
          <div id="section-0">
            <AsciiRoseScene
              onComplete={() => scrollToSection(1)}
              onStartMusic={() => setHasStartedStory(true)}
            />
          </div>
          <div id="section-1">
            <BirthdayReveal
              data={data}
              onEnterWorld={() => scrollToSection(2)}
            />
          </div>
          <div id="section-2">
            <FlowerGarden onNextSection={() => scrollToSection(3)} />
          </div>
          <div id="section-3">
            <MemoryGallery initialMemories={data.memories} />
          </div>
          <div id="section-4">
            <BirthdayLetter
              initialData={data.letter}
              recipientName={data.recipient.name}
            />
          </div>
          <div id="section-5">
            <BirthdayCake recipientName={data.recipient.name} />
          </div>
          <div id="section-6">
            <CelebrationRoom data={data} />
          </div>
          <div id="section-7">
            <SecretSurprise initialMessage={data.secretMessage} />
          </div>
          <div id="section-8">
            <GulabJamunSurprise
              recipientName={data.recipient.name}
              onReplay={handleRestart}
            />
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
