/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Star, 
  Volume2, 
  Sparkles, 
  Award, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Play
} from 'lucide-react';
import { UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface LetterExplorerProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

// Letter structure
interface LetterItem {
  char: string;
  pronunciation: string; // Phonetic pronunciation text for Uzbek
  exampleWord: string;   // Simple word kids know starting with this letter
  exampleEmoji: string;  // Emoji representing the example word
}

const ALPHABET: LetterItem[] = [
  { char: 'A', pronunciation: 'Aaa', exampleWord: 'Olma', exampleEmoji: '🍎' },
  { char: 'B', pronunciation: 'Be', exampleWord: 'Baliq', exampleEmoji: '🐟' },
  { char: 'D', pronunciation: 'De', exampleWord: 'Daraxt', exampleEmoji: '🌳' },
  { char: 'E', pronunciation: 'Eee', exampleWord: 'Eshik', exampleEmoji: '🚪' },
  { char: 'F', pronunciation: 'Ef', exampleWord: 'Fil', exampleEmoji: '🐘' },
  { char: 'G', pronunciation: 'Ge', exampleWord: 'Gul', exampleEmoji: '🌸' },
  { char: 'H', pronunciation: 'Ha', exampleWord: 'Havo', exampleEmoji: '☁️' },
  { char: 'I', pronunciation: 'Iii', exampleWord: 'Ip', exampleEmoji: '🧵' },
  { char: 'J', pronunciation: 'Je', exampleWord: 'Jirafa', exampleEmoji: '🦒' },
  { char: 'K', pronunciation: 'Ka', exampleWord: 'Kitob', exampleEmoji: '📚' },
  { char: 'L', pronunciation: 'El', exampleWord: 'Limon', exampleEmoji: '🍋' },
  { char: 'M', pronunciation: 'Em', exampleWord: 'Mushuk', exampleEmoji: '🐱' },
  { char: 'N', pronunciation: 'En', exampleWord: 'Non', exampleEmoji: '🍞' },
  { char: 'O', pronunciation: 'Ooo', exampleWord: 'Olov', exampleEmoji: '🔥' },
  { char: 'P', pronunciation: 'Pe', exampleWord: 'Kuchukcha (Pappy)', exampleEmoji: '🐶' },
  { char: 'Q', pronunciation: 'Qa', exampleWord: 'Quyosh', exampleEmoji: '☀️' },
  { char: 'R', pronunciation: 'Er', exampleWord: 'Raketa', exampleEmoji: '🚀' },
  { char: 'S', pronunciation: 'Es', exampleWord: 'Sariq', exampleEmoji: '💛' },
  { char: 'T', pronunciation: 'Te', exampleWord: 'Tuxum', exampleEmoji: '🥚' },
  { char: 'U', pronunciation: 'Uuu', exampleWord: 'Uzum', exampleEmoji: '🍇' },
  { char: 'V', pronunciation: 'Ve', exampleWord: 'Velosiped', exampleEmoji: '🚲' },
  { char: 'X', pronunciation: 'Xa', exampleWord: 'Xat', exampleEmoji: '✉️' },
  { char: 'Y', pronunciation: 'Ya', exampleWord: 'Yulduz', exampleEmoji: '⭐' },
  { char: 'Z', pronunciation: 'Ze', exampleWord: 'Zebra', exampleEmoji: '🦓' },
];

export default function LetterExplorer({ profile, updateProfile, onBack }: LetterExplorerProps) {
  const [targetLetter, setTargetLetter] = useState<LetterItem>(ALPHABET[0]);
  const [options, setOptions] = useState<string[]>([]);
  const [round, setRound] = useState<number>(1);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [hasUnlockedBadge, setHasUnlockedBadge] = useState<boolean>(false);

  // Initialize a new round
  const startNewRound = (currentRound: number) => {
    setSelectedAnswer(null);
    setFeedback(null);

    // Pick random target letter
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    const selected = ALPHABET[randomIndex];
    setTargetLetter(selected);

    // Generate option letters (including the target)
    const candidates = [selected.char];
    while (candidates.length < 6) {
      const randChar = ALPHABET[Math.floor(Math.random() * ALPHABET.length)].char;
      if (!candidates.includes(randChar)) {
        candidates.push(randChar);
      }
    }

    // Shuffle options
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    
    // Automatically speak the target letter at the beginning of the round
    setTimeout(() => {
      speakLetter(selected);
    }, 400);
  };

  useEffect(() => {
    startNewRound(1);
  }, []);

  // Web Speech Synthesis for pronouncing the letter and words
  const speakLetter = (letterItem: LetterItem) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop current speech
      setIsPlayingSound(true);

      // Create custom message in Uzbek or simple spelling sounds
      // We will spell the letter itself, then the word
      const textToSpeak = `${letterItem.char}. ${letterItem.exampleWord}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Try to find Uzbek/Turkish or Russian voice or fallback to default
      const voices = window.speechSynthesis.getVoices();
      const uzVoice = voices.find(v => v.lang.startsWith('uz') || v.lang.startsWith('tr') || v.lang.startsWith('ru'));
      if (uzVoice) {
        utterance.voice = uzVoice;
      }
      utterance.rate = 0.8; // Speak slightly slower for kids
      utterance.pitch = 1.3; // Cute high pitch

      utterance.onend = () => {
        setIsPlayingSound(false);
      };
      utterance.onerror = () => {
        setIsPlayingSound(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback retro synthesizer sounds if Web Speech API is not supported
      playFallbackLetterSound(letterItem.char);
    }
  };

  // Fun sound synthesizer that plays distinct melodic patterns for each letter
  const playFallbackLetterSound = (char: string) => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      const charCode = char.charCodeAt(0);
      
      // Map char code to beautiful frequencies (e.g., A = 440Hz, etc.)
      const freq1 = 220 + (charCode - 65) * 20; 
      const freq2 = freq1 * 1.5;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq1, now);
      osc.frequency.exponentialRampToValueAtTime(freq2, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectLetter = (selected: string) => {
    if (selectedAnswer !== null) return; // Prevent double clicking

    setSelectedAnswer(selected);
    const isCorrect = selected === targetLetter.char;

    if (isCorrect) {
      setFeedback('correct');
      playSound('correct');
      setCorrectCount(prev => prev + 1);
      speakLetter(targetLetter); // Pronounce letter again to reinforce
    } else {
      setFeedback('incorrect');
      playSound('incorrect');
    }

    // Proceed to next round after animation
    setTimeout(() => {
      if (round < 10) {
        setRound(prev => prev + 1);
        startNewRound(round + 1);
      } else {
        // Game finished
        setGameFinished(true);
        playSound('success');

        // Award stars and points
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const gainedPoints = finalCorrect * 15;
        const gainedStars = finalCorrect >= 8 ? 5 : finalCorrect >= 5 ? 3 : 1;
        
        let newBadges = [...profile.badges];
        let unlocked = false;
        if (finalCorrect >= 8 && !profile.badges.includes('letter_expert')) {
          newBadges.push('letter_expert');
          unlocked = true;
          setHasUnlockedBadge(true);
        }

        updateProfile({
          points: profile.points + gainedPoints,
          stars: profile.stars + gainedStars,
          badges: newBadges,
        });
      }
    }, 2200);
  };

  const handleRestart = () => {
    setRound(1);
    setCorrectCount(0);
    setGameFinished(false);
    setHasUnlockedBadge(false);
    startNewRound(1);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6" id="letter-game-container">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-full font-bold transition kid-button"
        >
          <ArrowLeft size={18} /> Orqaga
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 px-4 py-1.5 rounded-full font-bold text-sm shadow-md">
            Savol: {round} / 10
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full font-bold shadow-md">
            <Star className="fill-amber-400 text-amber-400" size={18} />
            <span>{profile.stars}</span>
          </div>
        </div>
      </div>

      {!gameFinished ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Target letter display & pronunciation cue */}
          <div className="lg:col-span-1 glass-panel-heavy rounded-3xl p-6 flex flex-col justify-between border-white/25 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Ambient glows inside */}
            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center py-4 flex-1 justify-center">
              <div className="text-[11px] text-pink-300 uppercase font-black tracking-[0.2em] mb-2">
                Sehrli Harflar
              </div>
              
              <h3 className="text-xl font-display font-black text-white max-w-[200px] leading-snug mb-6">
                Shu harfni toping:
              </h3>

              {/* Glowing Target Letter Bubble */}
              <motion.div
                key={targetLetter.char}
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: [1, 1.05, 1], rotate: 0 }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-44 h-44 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-sky-500/20 border-2 border-white/30 rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.15)] relative group cursor-pointer"
                onClick={() => speakLetter(targetLetter)}
              >
                <span className="text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-tr from-pink-300 to-sky-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                  {targetLetter.char}
                </span>
                
                {/* Micro Speaker Indicator */}
                <span className="absolute bottom-4 bg-white/10 p-2 rounded-full border border-white/20 text-yellow-300 animate-pulse group-hover:scale-110 transition">
                  <Volume2 size={16} />
                </span>
              </motion.div>

              <button
                onClick={() => speakLetter(targetLetter)}
                disabled={isPlayingSound}
                className={`mt-6 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs border transition-all ${
                  isPlayingSound 
                    ? 'bg-pink-500/25 border-pink-400 text-pink-200' 
                    : 'bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-md active:translate-y-0.5'
                }`}
              >
                <Volume2 size={16} className={isPlayingSound ? 'animate-bounce' : ''} />
                {isPlayingSound ? "Eshityapsiz..." : "Harf Ovozini Eshitish"}
              </button>
            </div>

            {/* Bottom Tip */}
            <div className="relative z-10 p-4 bg-white/5 border border-white/10 rounded-2xl mt-4">
              <p className="text-[10px] text-indigo-200 uppercase font-black tracking-widest mb-1">
                Kashfiyot yordami
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl">{targetLetter.exampleEmoji}</span>
                <span className="text-sm font-bold text-white">
                  {targetLetter.char} - {targetLetter.exampleWord} uchun!
                </span>
              </div>
            </div>
          </div>

          {/* Right panel: Alphabet bubble grid */}
          <div className="lg:col-span-2 glass-panel-heavy rounded-3xl p-6 border-white/25 flex flex-col justify-between shadow-2xl relative">
            <div className="mb-4">
              <h4 className="font-display font-bold text-white text-lg">
                Pufaklarni bosing va to'g'ri harfni qidiring!
              </h4>
              <p className="text-xs text-indigo-200/80">
                To'g'ri topsangiz, sehrli so'zni eshitishingiz mumkin bo'ladi.
              </p>
            </div>

            {/* Letters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 py-4 flex-1 items-center">
              {options.map((charOption, index) => {
                const isSelected = selectedAnswer === charOption;
                const isTarget = charOption === targetLetter.char;
                
                let btnStyle = "bg-white/5 hover:bg-white/15 border-white/15 text-white/90";
                let scaleVal = 1;

                if (selectedAnswer !== null) {
                  if (isTarget) {
                    btnStyle = "bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.3)]";
                    scaleVal = 1.05;
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500/25 border-rose-400 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.3)]";
                    scaleVal = 0.95;
                  } else {
                    btnStyle = "bg-white/2 opacity-25 border-white/5 text-white/20";
                  }
                }

                return (
                  <motion.button
                    key={`${charOption}-${index}`}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleSelectLetter(charOption)}
                    whileHover={selectedAnswer === null ? { scale: 1.08, y: -4 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.95 } : {}}
                    style={{ scale: scaleVal }}
                    className={`h-24 sm:h-28 rounded-3xl border-2 font-display font-black text-4xl sm:text-5xl flex items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden shadow-lg ${btnStyle}`}
                  >
                    {charOption}

                    {/* Little decorative background sparkles */}
                    {selectedAnswer === null && (
                      <span className="absolute top-1 right-2 text-xs text-white/5 group-hover:text-white/20">✦</span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback Messages */}
            <div className="h-16 flex items-center justify-center mt-4">
              <AnimatePresence mode="wait">
                {feedback === 'correct' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg"
                  >
                    <CheckCircle className="text-emerald-400" size={18} />
                    <span>Ofarin! Juda to'g'ri javob berdingiz! 🌟</span>
                  </motion.div>
                )}
                {feedback === 'incorrect' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="flex items-center gap-2 bg-rose-500/20 border border-rose-400/40 text-rose-300 px-6 py-2.5 rounded-2xl font-bold text-sm shadow-lg"
                  >
                    <AlertCircle className="text-rose-400" size={18} />
                    <span>Ushbu pufakda boshqa harf ekan, qayta urinib ko'ring! 🧐</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : (
        /* Results screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-center text-white max-w-2xl mx-auto border-white/25"
        >
          <div className="text-7xl mb-4 animate-bounce">🥇</div>
          
          <h2 className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-sky-300 mb-2">
            Sehrli Harflar Yakunlandi!
          </h2>
          
          <p className="text-indigo-100/90 mb-6 max-w-md mx-auto text-sm">
            Siz harflarni topish va ularning tovushlarini eshitish sayohatingizni munosib tamomladingiz!
          </p>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 max-w-sm mx-auto mb-6 grid grid-cols-2 gap-4 shadow-inner">
            <div>
              <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Topilgan Harflar</div>
              <div className="text-3xl font-black text-white mt-1">{correctCount} / 10</div>
            </div>
            <div>
              <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Yulduzlar</div>
              <div className="text-3xl font-black text-yellow-300 flex items-center justify-center gap-1 mt-1">
                <Star className="fill-yellow-400 text-yellow-400" size={24} />
                <span>+{correctCount >= 8 ? 5 : correctCount >= 5 ? 3 : 1}</span>
              </div>
            </div>
          </div>

          {/* Badge Unlocked Notification */}
          {hasUnlockedBadge && (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-pink-500/20 border border-pink-400/30 rounded-2xl p-4 max-w-md mx-auto mb-6 flex items-center gap-3 text-left"
            >
              <div className="text-3xl p-2 bg-pink-500/30 rounded-full">🗣️</div>
              <div>
                <h4 className="font-bold text-pink-300">Yangi Nishon Unlocked!</h4>
                <p className="text-xs text-pink-200/80">Harf Ustasi nishoniga sazovor bo'ldingiz!</p>
              </div>
            </motion.div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={handleRestart}
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
