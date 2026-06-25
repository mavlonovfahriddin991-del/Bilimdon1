/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Star, 
  Sparkles, 
  Award, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface NumberCountProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

interface CountItem {
  emoji: string;
  nameUz: string;
  colorClass: string;
}

const ITEMS_POOL: CountItem[] = [
  { emoji: '🐼', nameUz: 'Pandacha', colorClass: 'from-slate-200 to-slate-400' },
  { emoji: '🦖', nameUz: 'Dinozavr', colorClass: 'from-emerald-300 to-emerald-500' },
  { emoji: '🍓', nameUz: 'Qulupnay', colorClass: 'from-rose-400 to-red-600' },
  { emoji: '🎈', nameUz: 'Pufak', colorClass: 'from-pink-400 to-purple-600' },
  { emoji: '🚀', nameUz: 'Raketa', colorClass: 'from-sky-300 to-indigo-500' },
  { emoji: '🦁', nameUz: 'Sher', colorClass: 'from-amber-300 to-orange-500' },
  { emoji: '🚗', nameUz: 'Mashina', colorClass: 'from-red-400 to-red-600' },
  { emoji: '🐬', nameUz: 'Delfin', colorClass: 'from-cyan-300 to-sky-500' },
  { emoji: '🍌', nameUz: 'Banan', colorClass: 'from-yellow-200 to-yellow-400' },
];

export default function NumberCount({ profile, updateProfile, onBack }: NumberCountProps) {
  const [itemType, setItemType] = useState<CountItem>(ITEMS_POOL[0]);
  const [count, setCount] = useState<number>(3);
  const [itemsPositions, setItemsPositions] = useState<{ x: number; y: number; id: number; clicked: boolean; clickIndex?: number }[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  const [round, setRound] = useState<number>(1);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [clickedCount, setClickedCount] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [hasUnlockedBadge, setHasUnlockedBadge] = useState<boolean>(false);

  // Initialize counting round
  const startNewRound = (currentRound: number) => {
    setSelectedAnswer(null);
    setFeedback(null);
    setClickedCount(0);

    // Pick random item type
    const pickedItem = ITEMS_POOL[Math.floor(Math.random() * ITEMS_POOL.length)];
    setItemType(pickedItem);

    // Pick random count from 2 to 9 based on round difficulty
    const maxCount = currentRound <= 4 ? 5 : currentRound <= 7 ? 8 : 10;
    const minCount = currentRound <= 4 ? 2 : 4;
    const actualCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    setCount(actualCount);

    // Generate positions inside play area (percentages)
    const positions = [];
    for (let i = 0; i < actualCount; i++) {
      // Avoid overlapping too heavily by keeping random margins
      positions.push({
        id: i,
        x: 10 + Math.random() * 75, // 10% to 85%
        y: 12 + Math.random() * 65, // 12% to 77%
        clicked: false
      });
    }
    setItemsPositions(positions);

    // Generate numeric choices
    const choices = [actualCount];
    while (choices.length < 4) {
      const optionVal = Math.floor(Math.random() * 11); // 0 to 10
      if (optionVal >= 1 && !choices.includes(optionVal)) {
        choices.push(optionVal);
      }
    }
    // Shuffle choices
    setOptions([...choices].sort(() => Math.random() - 0.5));
  };

  useEffect(() => {
    startNewRound(1);
  }, []);

  const handleItemClick = (id: number) => {
    playSound('flip');
    setItemsPositions(prev => {
      const updated = prev.map(item => {
        if (item.id === id && !item.clicked) {
          const nextClickIndex = clickedCount + 1;
          setClickedCount(nextClickIndex);
          return { ...item, clicked: true, clickIndex: nextClickIndex };
        }
        return item;
      });
      return updated;
    });
  };

  const handleSelectAnswer = (choice: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(choice);
    const isCorrect = choice === count;

    if (isCorrect) {
      setFeedback('correct');
      playSound('correct');
      setCorrectCount(prev => prev + 1);
    } else {
      setFeedback('incorrect');
      playSound('incorrect');
    }

    // Move forward
    setTimeout(() => {
      if (round < 10) {
        setRound(prev => prev + 1);
        startNewRound(round + 1);
      } else {
        setGameFinished(true);
        playSound('success');

        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const gainedPoints = finalCorrect * 15;
        const gainedStars = finalCorrect >= 8 ? 5 : finalCorrect >= 5 ? 3 : 1;

        let newBadges = [...profile.badges];
        let unlocked = false;
        if (finalCorrect >= 8 && !profile.badges.includes('math_genius')) {
          newBadges.push('math_genius');
          unlocked = true;
          setHasUnlockedBadge(true);
        }

        updateProfile({
          points: profile.points + gainedPoints,
          stars: profile.stars + gainedStars,
          badges: newBadges,
        });
      }
    }, 2500);
  };

  const handleRestart = () => {
    setRound(1);
    setCorrectCount(0);
    setGameFinished(false);
    setHasUnlockedBadge(false);
    startNewRound(1);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6" id="numbers-game-container">
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
            Raund: {round} / 10
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full font-bold shadow-md">
            <Star className="fill-amber-400 text-amber-400" size={18} />
            <span>{profile.stars}</span>
          </div>
        </div>
      </div>

      {!gameFinished ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Area: Counting Sandbox */}
          <div className="lg:col-span-2 glass-panel-heavy rounded-3xl p-4 h-[380px] sm:h-[420px] border-white/25 relative overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:28px_28px] pointer-events-none" />
            
            {/* Question Display */}
            <div className="relative z-10 flex justify-between items-center bg-indigo-950/80 p-3 rounded-2xl border border-white/15 backdrop-blur-md">
              <span className="text-white text-sm sm:text-base font-bold flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-300 animate-pulse" />
                Sahnada nechta <span className="text-yellow-300 font-extrabold">{itemType.nameUz}</span> bor?
              </span>
              <span className="text-xs bg-pink-500/20 text-pink-300 border border-pink-500/20 px-3 py-1 rounded-full font-bold">
                Sanoq: {clickedCount} / {count}
              </span>
            </div>

            {/* Sandbox Canvas */}
            <div className="flex-1 relative w-full h-full select-none mt-2">
              <AnimatePresence>
                {itemsPositions.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0, y: 100, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 100, delay: item.id * 0.08 }}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    className="absolute cursor-pointer select-none group"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      animate={item.clicked ? { scale: [1, 1.25, 1], y: [0, -15, 0] } : {}}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg relative bg-gradient-to-br ${
                        item.clicked 
                          ? 'from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400' 
                          : 'from-white/10 to-white/5 border border-white/20 hover:border-white/40'
                      }`}
                    >
                      <span>{item.emoji}</span>

                      {/* Count number badge bubble */}
                      {item.clicked && (
                        <motion.div
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="absolute -top-3.5 -right-3.5 bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-900 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg border-2 border-white"
                        >
                          {item.clickIndex}
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Hint text at bottom */}
            <div className="relative z-10 text-center text-[11px] text-indigo-200/80 bg-indigo-950/40 p-2 rounded-xl border border-white/10 backdrop-blur-sm">
              💡 Har bir narsani bosib, birma-bir sanashni mashq qiling!
            </div>
          </div>

          {/* Right Area: Options & Feedback */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="glass-panel-heavy rounded-3xl p-5 border-white/25 flex-1 flex flex-col justify-between shadow-2xl text-white">
              <div>
                <h4 className="font-display font-black text-white text-lg mb-1">
                  Sonni Tanlang
                </h4>
                <p className="text-xs text-indigo-200/80 mb-4">
                  Sahnadagi narsalarni sanang va javob tugmasini bosing!
                </p>

                {/* Option Buttons Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {options.map((choice) => {
                    const isSelected = selectedAnswer === choice;
                    const isCorrectChoice = choice === count;

                    let btnStyle = "bg-white/5 hover:bg-white/10 border-white/10 text-white";
                    if (selectedAnswer !== null) {
                      if (isCorrectChoice) {
                        btnStyle = "bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-500/25 border-rose-400 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.3)]";
                      } else {
                        btnStyle = "bg-white/2 opacity-25 border-white/5 text-white/30";
                      }
                    }

                    return (
                      <motion.button
                        key={choice}
                        disabled={selectedAnswer !== null}
                        onClick={() => handleSelectAnswer(choice)}
                        whileHover={selectedAnswer === null ? { scale: 1.05 } : {}}
                        whileTap={selectedAnswer === null ? { scale: 0.95 } : {}}
                        className={`py-5 rounded-2xl border-2 font-display font-black text-3xl sm:text-4xl shadow-md transition-all flex items-center justify-center cursor-pointer ${btnStyle}`}
                      >
                        {choice}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Response Feedbacks */}
              <div className="h-20 flex items-center justify-center mt-6">
                <AnimatePresence mode="wait">
                  {feedback === 'correct' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="text-center"
                    >
                      <div className="text-emerald-400 font-bold flex items-center justify-center gap-1.5 text-base mb-1">
                        <CheckCircle size={20} />
                        Barakalla! To'g'ri! 🎉
                      </div>
                      <p className="text-xs text-indigo-100">Siz {count} ta {itemType.nameUz}ni to'g'ri sanadingiz.</p>
                    </motion.div>
                  )}
                  {feedback === 'incorrect' && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="text-center"
                    >
                      <div className="text-rose-400 font-bold flex items-center justify-center gap-1.5 text-base mb-1">
                        <AlertCircle size={20} />
                        Qayta sanab ko'ring! 🧐
                      </div>
                      <p className="text-xs text-indigo-200">Sahnada aniq {count} ta narsa bor.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Final score dashboard */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-center text-white max-w-2xl mx-auto border-white/25"
        >
          <div className="text-7xl mb-4 animate-bounce">🏆</div>
          
          <h2 className="text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-sky-300 mb-2">
            Sanoq Mashg'uloti Tugadi!
          </h2>
          
          <p className="text-indigo-100/90 mb-6 max-w-md mx-auto text-sm">
            Sahnadagi barcha qiziqarli jonzot va pufaklarni mukammal sanab chiqqaningiz bilan tabriklaymiz!
          </p>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 max-w-sm mx-auto mb-6 grid grid-cols-2 gap-4 shadow-inner">
            <div>
              <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider font-sans">Yechilgan Sanoqlar</div>
              <div className="text-3xl font-black text-white mt-1">{correctCount} / 10</div>
            </div>
            <div>
              <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider font-sans">Yulduzlar</div>
              <div className="text-3xl font-black text-yellow-300 flex items-center justify-center gap-1 mt-1">
                <Star className="fill-yellow-400 text-yellow-400" size={24} />
                <span>+{correctCount >= 8 ? 5 : correctCount >= 5 ? 3 : 1}</span>
              </div>
            </div>
          </div>

          {/* Badge Notification */}
          {hasUnlockedBadge && (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-4 max-w-md mx-auto mb-6 flex items-center gap-3 text-left"
            >
              <div className="text-3xl p-2 bg-emerald-500/30 rounded-full">🔢</div>
              <div>
                <h4 className="font-bold text-emerald-300">Yangi Nishon Unlocked!</h4>
                <p className="text-xs text-emerald-200/80">Sanoq Chempioni nishoniga sazovor bo'ldingiz!</p>
              </div>
            </motion.div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-indigo-500 hover:brightness-110 border border-white/20 text-white font-bold rounded-2xl shadow-lg transition kid-button"
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
