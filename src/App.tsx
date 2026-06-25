/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import Dashboard from './components/Dashboard';
import SpaceMath from './components/SpaceMath';
import SpaceTravel from './components/SpaceTravel';
import WordExplorer from './components/WordExplorer';
import MemoryGame from './components/MemoryGame';
import LetterExplorer from './components/LetterExplorer';
import NumberCount from './components/NumberCount';
import ColoringBook from './components/ColoringBook';
import ShadowMatcher from './components/ShadowMatcher';
import MiniGamesArcade from './components/MiniGamesArcade';
import { Sparkles } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Zukko Bolajon',
  stars: 0,
  points: 0,
  streak: 1,
  badges: [],
  lastActive: new Date().toISOString().split('T')[0],
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [activeGame, setActiveGame] = useState<
    | 'math'
    | 'space'
    | 'words'
    | 'memory'
    | 'letters'
    | 'numbers'
    | 'coloring'
    | 'shadow_matcher'
    | 'mini_games_sounds'
    | 'mini_games_colors'
    | 'mini_games_balloons'
    | 'mini_games_planets'
    | 'mini_games_fruits'
    | 'mini_games_xylophone'
    | 'mini_games_balance'
    | 'mini_games_clock'
    | 'mini_games_fishing'
    | 'mini_games_rebus'
    | null
  >(null);

  // Load profile on mount
  useEffect(() => {
    const saved = localStorage.getItem('zukko_kids_profile');
    if (saved) {
      try {
        const loadedProfile = JSON.parse(saved) as UserProfile;
        
        // Streak calculation
        const todayStr = new Date().toISOString().split('T')[0];
        const lastActive = loadedProfile.lastActive;
        
        if (lastActive && lastActive !== todayStr) {
          const lastActiveDate = new Date(lastActive);
          const todayDate = new Date(todayStr);
          const diffTime = Math.abs(todayDate.getTime() - lastActiveDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            loadedProfile.streak += 1;
          } else if (diffDays > 1) {
            loadedProfile.streak = 1;
          }
        }
        
        loadedProfile.lastActive = todayStr;
        setProfile(loadedProfile);
        localStorage.setItem('zukko_kids_profile', JSON.stringify(loadedProfile));
      } catch (e) {
        console.error('Failed to parse saved profile', e);
      }
    } else {
      localStorage.setItem('zukko_kids_profile', JSON.stringify(DEFAULT_PROFILE));
    }
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('zukko_kids_profile', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-indigo-950 text-white font-sans pb-16 antialiased selection:bg-pink-500 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Glowing Background Bubbles */}
      <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-30 pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-pink-600 rounded-full blur-[120px] opacity-30 pointer-events-none z-0" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500 rounded-full blur-[150px] opacity-20 pointer-events-none z-0" />

      {/* Playful Floating Frosted Glass Header */}
      <header className="mx-4 md:mx-6 my-4 md:my-6 backdrop-blur-2xl bg-white/10 rounded-3xl border border-white/20 py-4 px-6 md:px-8 sticky top-4 z-50 shadow-2xl flex items-center justify-between">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div 
            onClick={() => setActiveGame(null)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-3xl md:text-4xl group-hover:rotate-12 transition duration-300 transform select-none">
              🎓
            </div>
            <div>
              <h1 className="font-display font-black text-xl md:text-2xl text-white flex items-center gap-1.5 leading-none tracking-tight">
                BILIMDON
                <Sparkles className="text-yellow-400 animate-pulse fill-yellow-400" size={16} />
              </h1>
              <p className="text-[10px] text-indigo-200/70 font-bold tracking-[0.2em] uppercase leading-none mt-1">
                Bolalar akademiyasi
              </p>
            </div>
          </div>
          
          <div className="text-xs font-bold text-indigo-200/80 uppercase tracking-wider hidden sm:block">
            Motto: "O'yna va Bilim Ol!" 🚀
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 px-4 md:px-6">
        {activeGame === null && (
          <Dashboard
            profile={profile}
            updateProfile={updateProfile}
            onSelectGame={setActiveGame}
          />
        )}

        {activeGame === 'math' && (
          <SpaceMath
            profile={profile}
            updateProfile={updateProfile}
            onBack={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'space' && (
          <SpaceTravel
            profile={profile}
            updateProfile={updateProfile}
            onBack={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'words' && (
          <WordExplorer
            profile={profile}
            updateProfile={updateProfile}
            onBack={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'memory' && (
          <MemoryGame
            profile={profile}
            updateProfile={updateProfile}
            onBack={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'letters' && (
          <LetterExplorer
            profile={profile}
            updateProfile={updateProfile}
            onBack={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'numbers' && (
          <NumberCount
            profile={profile}
            updateProfile={updateProfile}
            onBack={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'coloring' && (
          <ColoringBook
            profile={profile}
            updateProfile={updateProfile}
            onBack={() => setActiveGame(null)}
          />
        )}

        {activeGame === 'shadow_matcher' && (
          <ShadowMatcher
            profile={profile}
            updateProfile={updateProfile}
            onBack={() => setActiveGame(null)}
          />
        )}

        {activeGame && activeGame.startsWith('mini_games_') && (
          <MiniGamesArcade
            profile={profile}
            updateProfile={updateProfile}
            initialGameId={activeGame.replace('mini_games_', '')}
            onBack={() => setActiveGame(null)}
          />
        )}
      </main>
    </div>
  );
}
