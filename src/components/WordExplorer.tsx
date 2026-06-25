/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Trash2, CheckCircle, Award, Sparkles } from 'lucide-react';
import { WordPuzzle, UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface WordExplorerProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

const WORD_PUZZLES_DATA: WordPuzzle[] = [
  { id: '1', uzName: 'OLMA', enName: 'APPLE', emoji: '🍎', letters: ['O', 'L', 'M', 'A'] },
  { id: '2', uzName: 'FIL', enName: 'ELEPHANT', emoji: '🐘', letters: ['F', 'I', 'L'] },
  { id: '3', uzName: 'ARSLON', enName: 'LION', emoji: '🦁', letters: ['A', 'R', 'S', 'L', 'O', 'N'] },
  { id: '4', uzName: 'MASHINA', enName: 'CAR', emoji: '🚗', letters: ['M', 'A', 'S', 'H', 'I', 'N', 'A'] },
  { id: '5', uzName: 'BALIQ', enName: 'FISH', emoji: '🐟', letters: ['B', 'A', 'L', 'I', 'Q'] },
  { id: '6', uzName: 'GUL', enName: 'FLOWER', emoji: '🌸', letters: ['G', 'U', 'L'] },
  { id: '7', uzName: 'KUCHUK', enName: 'DOG', emoji: '🐶', letters: ['K', 'U', 'C', 'H', 'U', 'K'] },
  { id: '8', uzName: 'BANAN', enName: 'BANANA', emoji: '🍌', letters: ['B', 'A', 'N', 'A', 'N'] },
];

export default function WordExplorer({ profile, updateProfile, onBack }: WordExplorerProps) {
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<WordPuzzle>(WORD_PUZZLES_DATA[0]);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: string; letter: string; used: boolean }[]>([]);
  const [spelledLetters, setSpelledLetters] = useState<{ id: string; letter: string; originalIndex: number }[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  // Initialize a puzzle level
  const initLevel = (levelIndex: number) => {
    const puzzle = WORD_PUZZLES_DATA[levelIndex];
    setCurrentPuzzle(puzzle);

    // Scramble the letters
    const scrambled = [...puzzle.letters]
      .sort(() => Math.random() - 0.5)
      .map((letter, idx) => ({
        id: `scrambled-${idx}-${Math.random()}`,
        letter,
        used: false,
      }));

    setScrambledLetters(scrambled);
    setSpelledLetters([]);
    setIsCompleted(false);
  };

  useEffect(() => {
    if (currentLevel < WORD_PUZZLES_DATA.length) {
      initLevel(currentLevel);
    } else {
      setGameFinished(true);
      playSound('success');
      // Unlock Word Master Badge
      if (!profile.badges.includes('word_master')) {
        updateProfile({
          badges: [...profile.badges, 'word_master'],
        });
      }
    }
  }, [currentLevel]);

  const handleSelectLetter = (id: string, letter: string, index: number) => {
    playSound('click');
    // Mark letter as used
    setScrambledLetters(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, used: true } : item))
    );
    // Add to spelled
    setSpelledLetters(prev => [...prev, { id, letter, originalIndex: index }]);
  };

  const handleRemoveLetter = (spelledIndex: number) => {
    playSound('flip');
    const letterToRemove = spelledLetters[spelledIndex];

    // Mark as unused in scrambled pool
    setScrambledLetters(prev =>
      prev.map((item, idx) =>
        idx === letterToRemove.originalIndex ? { ...item, used: false } : item
      )
    );

    // Remove from spelled list
    setSpelledLetters(prev => prev.filter((_, idx) => idx !== spelledIndex));
  };

  const handleClear = () => {
    playSound('flip');
    setScrambledLetters(prev => prev.map(item => ({ ...item, used: false })));
    setSpelledLetters([]);
  };

  // Check spelling
  useEffect(() => {
    if (spelledLetters.length === currentPuzzle.letters.length && spelledLetters.length > 0) {
      const spelledWord = spelledLetters.map(item => item.letter).join('');
      if (spelledWord === currentPuzzle.uzName) {
        setIsCompleted(true);
        playSound('correct');

        // Award points & star
        updateProfile({
          points: profile.points + 15,
          stars: profile.stars + 1,
        });
      } else {
        // Shaking / Incorrect feedback can be shown
        playSound('incorrect');
      }
    }
  }, [spelledLetters, currentPuzzle]);

  const handleNextLevel = () => {
    playSound('click');
    setCurrentLevel(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6" id="word-explorer-module">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-full font-bold transition kid-button"
        >
          <ArrowLeft size={18} /> Orqaga
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 px-4 py-1.5 rounded-full font-bold text-sm shadow-md">
            Bosqich: {currentLevel + 1} / {WORD_PUZZLES_DATA.length}
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full font-bold shadow-md">
            <Star className="fill-amber-400 text-amber-400" size={18} />
            <span>{profile.stars}</span>
          </div>
        </div>
      </div>

      {!gameFinished ? (
        <div className="glass-panel-heavy rounded-3xl p-6 md:p-8 shadow-2xl border-white/25 relative overflow-hidden text-white">
          {/* Confetti-like elements if completed */}
          <AnimatePresence>
            {isCompleted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-indigo-950/95 z-20 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-8xl mb-4 animate-bounce"
                >
                  {currentPuzzle.emoji}
                </motion.div>
                <h3 className="text-3xl font-display font-bold text-pink-300 mb-2">
                  To'g'ri topdingiz! 🎉
                </h3>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-md mx-auto mb-6 font-sans">
                  <div className="text-2xl font-black text-white mb-1">
                    {currentPuzzle.uzName}
                  </div>
                  <div className="text-indigo-200 text-sm font-semibold mb-2">
                    Ingliz tilida:
                  </div>
                  <div className="text-3xl font-display font-black text-pink-300 tracking-wider">
                    {currentPuzzle.enName} 🇬🇧
                  </div>
                </div>

                <button
                  onClick={handleNextLevel}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-indigo-500 hover:brightness-110 border border-white/20 text-white font-bold text-lg rounded-2xl shadow-lg transition kid-button"
                >
                  <Sparkles size={20} /> Keyingi so'z
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core game area */}
          <div className="flex flex-col items-center py-4">
            {/* Mascot & Emoji */}
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-white/10 border-2 border-white/20 rounded-full flex items-center justify-center text-7xl shadow-xl backdrop-blur-md">
                {currentPuzzle.emoji}
              </div>
            </div>

            <p className="text-indigo-100 font-bold mb-6 text-center text-base">
              Harflarni tartib bilan bosing va hayvon / jism nomini to'g'rilang!
            </p>

            {/* Spelled Word blanks */}
            <div className="flex gap-2 mb-8 justify-center flex-wrap h-14 items-center">
              {currentPuzzle.letters.map((_, index) => {
                const spelled = spelledLetters[index];
                return (
                  <motion.div
                    key={index}
                    onClick={() => {
                      if (spelled) handleRemoveLetter(index);
                    }}
                    whileHover={spelled ? { scale: 1.1 } : {}}
                    className={`w-12 h-12 rounded-2xl border-b-4 font-display font-bold text-xl flex items-center justify-center transition-all ${
                      spelled
                        ? 'bg-pink-500/20 border-pink-400 text-pink-200 cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                        : 'bg-white/5 border-white/10 text-transparent border-dashed'
                    }`}
                  >
                    {spelled ? spelled.letter : ''}
                  </motion.div>
                );
              })}
            </div>

            {/* Scrambled Pool of buttons */}
            <div className="flex gap-3 mb-8 justify-center flex-wrap max-w-lg">
              {scrambledLetters.map((item, idx) => (
                <button
                  key={item.id}
                  disabled={item.used}
                  onClick={() => handleSelectLetter(item.id, item.letter, idx)}
                  className={`w-14 h-14 rounded-2xl border-b-4 font-display font-bold text-2xl flex items-center justify-center shadow-md kid-button transition-all duration-200 ${
                    item.used
                      ? 'bg-white/2 text-white/10 border-white/5 pointer-events-none'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-400/50'
                  }`}
                >
                  {item.letter}
                </button>
              ))}
            </div>

            {/* Controls */}
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-white/70 hover:text-white font-bold text-sm px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition"
            >
              <Trash2 size={16} /> Qaytadan boshlash
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel-heavy rounded-3xl p-6 md:p-8 shadow-2xl border-white/25 text-center text-white"
        >
          <div className="text-6xl mb-4 animate-bounce">👑</div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Ajoyib So'z Ustasi!
          </h2>
          <p className="text-indigo-100/90 mb-6 max-w-md mx-auto">
            Siz barcha berilgan ingliz va o'zbekcha so'z jumboqlarini hal qildingiz va mukammal so'z boyligingiz borligini ko'rsatdingiz!
          </p>

          <div className="bg-pink-500/10 border border-pink-400/20 rounded-2xl p-5 max-w-xs mx-auto mb-6">
            <Award className="mx-auto text-pink-400 mb-2 h-12 w-12" />
            <h4 className="font-bold text-white">So'z Ustasi Nishoni</h4>
            <p className="text-xs text-indigo-200">Profil sahifangizga munosib qo'shildi!</p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setCurrentLevel(0);
                setGameFinished(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 hover:brightness-110 border border-white/20 text-white font-bold rounded-2xl shadow-lg transition kid-button"
            >
              Yana o'ynash
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl transition kid-button"
            >
              Bosh sahifa
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
