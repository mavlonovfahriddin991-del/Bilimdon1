/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Sparkles, RefreshCw, Trophy, HelpCircle, Check, Volume2 } from 'lucide-react';
import { UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface ShadowMatcherProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

interface MatchItem {
  id: string;
  nameUz: string;
  emoji: string;
  funFact: string;
}

interface Stage {
  id: number;
  title: string;
  items: MatchItem[];
}

const STAGES: Stage[] = [
  {
    id: 1,
    title: "Hayvonot Bog'i 🦁",
    items: [
      { id: 'lion', nameUz: "Shervoy 🦁", emoji: "🦁", funFact: "Sherlar 'Hayvonlar qiroli' deb ataladi va juda baland ovozda baqiradi! 🦁" },
      { id: 'elephant', nameUz: "Filvoy 🐘", emoji: "🐘", funFact: "Fillar quruqlikdagi eng katta hayvondir va xartumi bilan suv ichadi! 🐘" },
      { id: 'giraffe', nameUz: "Jirafavoy 🦒", emoji: "🦒", funFact: "Jirafaning bo'yni juda uzun bo'lib, baland daraxt barglarini yeydi! 🦒" }
    ]
  },
  {
    id: 2,
    title: "Shirin Mevalar 🍎",
    items: [
      { id: 'apple', nameUz: "Olma 🍎", emoji: "🍎", funFact: "Olma juda foydali meva, u tishlarimizni mustahkam qiladi! 🍎" },
      { id: 'banana', nameUz: "Banan 🍌", emoji: "🍌", funFact: "Bananlar issiq o'lkalarda o'sadi va maymunlarning eng sevimli taomidir! 🍌" },
      { id: 'strawberry', nameUz: "Qulupnay 🍓", emoji: "🍓", funFact: "Qulupnay sirtida urug'lari bo'lgan yagona shirin mevadir! 🍓" }
    ]
  },
  {
    id: 3,
    title: "Tezkor Mashinalar 🚀",
    items: [
      { id: 'rocket', nameUz: "Koinot Kemasi 🚀", emoji: "🚀", funFact: "Raketalar koinotga yulduzlarni o'rganish uchun uchadi! 🚀" },
      { id: 'helicopter', nameUz: "Vertolyot 🚁", emoji: "🚁", funFact: "Vertolyotlar tepaga to'g'ri ko'tarilib, havoda muallaq tura oladi! 🚁" },
      { id: 'train', nameUz: "Poyezd 🚂", emoji: "🚂", funFact: "Poyezdlar relsda yuradi va juda ko'p vagonlarni tortadi! 🚂" }
    ]
  },
  {
    id: 4,
    title: "Dengiz Dunyosi 🐬",
    items: [
      { id: 'dolphin', nameUz: "Delfin 🐬", emoji: "🐬", funFact: "Delfinlar juda aqlli va odamlar bilan do'stlashishni yaxshi ko'radi! 🐬" },
      { id: 'octopus', nameUz: "Sakkizoyoq 🐙", emoji: "🐙", funFact: "Sakkizoyoqning rostdan ham 8 ta oyog'i va 3 ta yuragi bor! 🐙" },
      { id: 'turtle', nameUz: "Toshbaqa 🐢", emoji: "🐢", funFact: "Toshbaqalar juda sekin yuradi va uylari har doim orqasida bo'ladi! 🐢" }
    ]
  },
  {
    id: 5,
    title: "Sehrli Dunyo ✨",
    items: [
      { id: 'crown', nameUz: "Toj 👑", emoji: "👑", funFact: "Tojni ertaklardagi qirol va malikalar boshiga kiyishadi! 👑" },
      { id: 'gift', nameUz: "Sovg'a 🎁", emoji: "🎁", funFact: "Sovg'alar do'stlarimizni va oilamizni xursand qilish uchun beriladi! 🎁" },
      { id: 'ghost', nameUz: "Sehrgar Jincha 👻", emoji: "👻", funFact: "Jincha aslida juda quvnoq va u bolalar bilan berkinmachoq o'ynaydi! 👻" }
    ]
  }
];

export default function ShadowMatcher({ profile, updateProfile, onBack }: ShadowMatcherProps) {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // maps leftId -> rightId (which is also matchingId)
  const [shuffledShadows, setShuffledShadows] = useState<MatchItem[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showFact, setShowFact] = useState<string | null>(null);

  const currentStage = STAGES[currentStageIdx];

  // Shuffle shadows whenever stage changes
  useEffect(() => {
    if (currentStage) {
      const shuffled = [...currentStage.items].sort(() => Math.random() - 0.5);
      setShuffledShadows(shuffled);
      setMatches({});
      setSelectedLeft(null);
      setSelectedRight(null);
      setShowFact(null);
      
      // Auto narration for kids!
      speakInstruction(`Keling ${currentStage.title} bosqichini o'ynaymiz! Shakllarni ularning qora soyasi bilan birlashtiring!`);
    }
  }, [currentStageIdx]);

  const speakInstruction = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // clean emojis
      const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'uz-UZ';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleLeftClick = (id: string) => {
    playSound('click');
    if (matches[id]) return; // already matched
    setSelectedLeft(id);

    // If already selected right, check match
    if (selectedRight) {
      checkMatch(id, selectedRight);
    }
  };

  const handleRightClick = (id: string) => {
    playSound('click');
    // Find if already matched
    const isMatched = Object.values(matches).includes(id);
    if (isMatched) return;

    setSelectedRight(id);

    // If already selected left, check match
    if (selectedLeft) {
      checkMatch(selectedLeft, id);
    }
  };

  const checkMatch = (leftId: string, rightId: string) => {
    if (leftId === rightId) {
      // Correct Match!
      playSound('correct');
      const item = currentStage.items.find(i => i.id === leftId);
      if (item) {
        setShowFact(item.funFact);
        speakInstruction(item.funFact);
      }

      setMatches(prev => {
        const next = { ...prev, [leftId]: rightId };
        
        // Check if stage is finished
        if (Object.keys(next).length === currentStage.items.length) {
          // Add reward
          const pointReward = 30;
          const starReward = 2;
          updateProfile({
            points: profile.points + pointReward,
            stars: profile.stars + starReward
          });

          setTimeout(() => {
            if (currentStageIdx < STAGES.length - 1) {
              setCurrentStageIdx(prevIdx => prevIdx + 1);
            } else {
              setIsGameOver(true);
              playSound('success');
              speakInstruction("Tabriklayman aqlli bolajonim! Siz barcha soyalarni to'g'ri topdingiz va g'olib bo'ldingiz!");
            }
          }, 4500);
        }

        return next;
      });

      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Incorrect Match!
      playSound('incorrect');
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  };

  const resetGame = () => {
    playSound('click');
    setCurrentStageIdx(0);
    setIsGameOver(false);
    setMatches({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setShowFact(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6" id="shadow-matcher-container">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-full font-bold transition kid-button"
        >
          <ArrowLeft size={18} /> Chiqish
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-indigo-500/20 border border-indigo-400/30 text-white px-3 py-1.5 rounded-full font-bold text-xs">
            <span>Bosqich:</span>
            <span className="text-yellow-300 font-extrabold">{currentStageIdx + 1}/{STAGES.length}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full font-bold shadow-md">
            <Star className="fill-amber-400 text-amber-400" size={18} />
            <span>{profile.stars}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isGameOver ? (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stage Title Panel */}
            <div className="glass-panel-heavy rounded-3xl p-6 border-white/25 text-center text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
              <h2 className="font-display font-black text-2xl md:text-3xl text-yellow-300 mb-1">
                {currentStage.title}
              </h2>
              <p className="text-sm font-medium text-indigo-100">
                Rangli rasmni o'ng tomondagi qora soyasi bilan birlashtiring! 🤔🌟
              </p>
            </div>

            {/* Main matching field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Colored Items (Left) */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-black text-indigo-200 uppercase tracking-wider pl-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Rangli Shakllar
                </h3>
                
                {currentStage.items.map((item) => {
                  const isMatched = !!matches[item.id];
                  const isSelected = selectedLeft === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={!isMatched ? { scale: 1.02 } : {}}
                      onClick={() => handleLeftClick(item.id)}
                      className={`relative p-4 rounded-3xl cursor-pointer border transition duration-300 flex items-center justify-between ${
                        isMatched
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : isSelected
                          ? 'bg-pink-500/30 border-pink-400/50 text-white ring-2 ring-pink-500 shadow-lg'
                          : 'bg-indigo-950/40 border-white/10 text-white hover:bg-indigo-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-4xl select-none animate-wiggle inline-block">
                          {item.emoji}
                        </div>
                        <div>
                          <p className="font-display font-bold text-lg">{item.nameUz}</p>
                          <p className="text-[10px] text-indigo-200 font-semibold uppercase">
                            {isMatched ? "To'g'ri topildi! 🎉" : "Soya qidirilmoqda..."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isMatched ? (
                          <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center text-emerald-300 shadow-md">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-pink-400 animate-ping' : 'bg-white/10'}`} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Shadow Outlines (Right) */}
              <div className="space-y-3.5">
                <h3 className="text-xs font-black text-indigo-200 uppercase tracking-wider pl-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-500" /> Sirli Soyalar
                </h3>

                {shuffledShadows.map((item) => {
                  const isMatched = Object.values(matches).includes(item.id);
                  const isSelected = selectedRight === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      whileHover={!isMatched ? { scale: 1.02 } : {}}
                      onClick={() => handleRightClick(item.id)}
                      className={`relative p-4 rounded-3xl cursor-pointer border transition duration-300 flex items-center justify-between ${
                        isMatched
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : isSelected
                          ? 'bg-pink-500/30 border-pink-400/50 text-white ring-2 ring-pink-500 shadow-lg'
                          : 'bg-indigo-950/40 border-white/10 text-white hover:bg-indigo-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* CSS filters to turn Emoji into a pure pitch black silhouette! */}
                        <div 
                          className="text-4xl select-none inline-block transition duration-500"
                          style={{ 
                            filter: isMatched ? 'none' : 'brightness(0) contrast(100%)' 
                          }}
                        >
                          {item.emoji}
                        </div>
                        <div>
                          <p className="font-display font-extrabold text-lg tracking-wider text-indigo-300">
                            {isMatched ? item.nameUz : "??? Soyasi"}
                          </p>
                          <p className="text-[10px] text-indigo-200 font-semibold uppercase">
                            {isMatched ? "Mos keldi! ✨" : "Soya shakli"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isMatched ? (
                          <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-400/30 rounded-full flex items-center justify-center text-emerald-300 shadow-md">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-pink-400 animate-ping' : 'bg-white/10'}`} />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Voice Clue & Fun Fact Modal/Panel */}
            <AnimatePresence>
              {showFact && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-indigo-900/60 backdrop-blur-md border border-white/15 p-5 rounded-3xl text-white shadow-xl flex items-start gap-4 relative"
                >
                  <div className="text-3xl bg-pink-500/20 p-2.5 rounded-2xl">
                    💡
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display font-black text-sm text-pink-300 uppercase tracking-wider mb-1">
                      Robotvoyning qiziqarli fakti:
                    </h4>
                    <p className="text-sm font-medium leading-relaxed text-indigo-50">
                      {showFact}
                    </p>
                  </div>
                  <button
                    onClick={() => speakInstruction(showFact)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                    title="Qayta eshitish"
                  >
                    <Volume2 size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Game Over / Trophy Screen */
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel-heavy rounded-3xl p-10 border-white/25 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500" />
            <div className="text-8xl mb-6 animate-bounce inline-block">
              🏆
            </div>
            
            <h2 className="font-display font-black text-4xl text-yellow-300 mb-2">
              Siz - Soya Qirolisiz! 👑
            </h2>
            <p className="text-lg font-bold text-indigo-100 max-w-lg mx-auto mb-6">
              Ajoyib natija, mening aqlligim! Barcha sirli shakllarning qora soyasini to'g'ri topib, kashfiyotlar qildingiz!
            </p>

            <div className="flex justify-center gap-6 mb-8 max-w-sm mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1 text-center">
                <span className="block text-2xl mb-1">⭐</span>
                <span className="block text-[10px] text-indigo-200 uppercase font-bold">Yutib olingan</span>
                <span className="block text-xl font-black text-yellow-300">+10 Yulduz</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex-1 text-center">
                <span className="block text-2xl mb-1">🔥</span>
                <span className="block text-[10px] text-indigo-200 uppercase font-bold">Ball mukofoti</span>
                <span className="block text-xl font-black text-emerald-300">+150 Ball</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={resetGame}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 text-white rounded-full font-black text-lg shadow-lg hover:brightness-110 transition kid-button"
              >
                <RefreshCw size={20} /> Qaytadan O'ynash
              </button>
              <button
                onClick={onBack}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-black text-lg border border-white/10 hover:border-white/20 transition"
              >
                Darsxonaga Qaytish
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
