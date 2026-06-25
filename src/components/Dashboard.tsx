/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Star,
  Award,
  Volume2,
  VolumeX,
  Edit2,
  Check,
  Flame,
  Rocket,
  Compass,
  Smile,
  BookOpen,
  Palette,
  Brain,
  Gamepad2,
  Clock,
  Scale,
  Smartphone,
  MoreVertical,
  Share2,
  X,
  Plus,
  Info,
} from 'lucide-react';
import { UserProfile, Badge } from '../types';
import { getMutedState, setMutedState, playSound } from '../utils/audio';

interface DashboardProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onSelectGame: (
    game:
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
  ) => void;
}

const BADGES_LIST: Badge[] = [
  {
    id: 'math_king',
    name: 'Matematika Qiroli 👑',
    icon: '🧮',
    description: 'Kosmik matematikada 9 ta yoki undan ko\'p to\'g\'ri javob topildi',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'space_explorer',
    name: 'Koinot Sayyohi 🪐',
    icon: '🚀',
    description: 'Solar tizimidagi barcha sayyoralar muvaffaqiyatli o\'rganildi',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'word_master',
    name: 'So\'z Ustasi ✍️',
    icon: '🗣️',
    description: 'Barcha ingliz va o\'zbekcha so\'z jumboqlari to\'g\'ri yig\'ildi',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  {
    id: 'memory_champion',
    name: 'Xotira Chempioni 🧠',
    icon: '🏆',
    description: 'Xotira o\'yinidagi barcha hayvon juftliklari topildi',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'letter_expert',
    name: 'Harf Ustasi 🗣️',
    icon: '🅰️',
    description: 'Sehrli harflar o\'yinida barcha topshiriqlarni yakunladi',
    color: 'bg-pink-500/20 text-pink-200 border-pink-500/30',
  },
  {
    id: 'math_genius',
    name: 'Sanoq Chempioni 🔢',
    icon: '🔢',
    description: 'Sehrli sonlar o\'yinida to\'g\'ri sanashni o\'rgandi',
    color: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  },
  {
    id: 'young_artist',
    name: 'Mohir Rassom 🎨',
    icon: '🎨',
    description: 'Rasm bo\'yash va erkin chizish o\'yinida ajoyib ijod qildi',
    color: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
  },
];

export default function Dashboard({ profile, updateProfile, onSelectGame }: DashboardProps) {
  const [isMuted, setIsMuted] = useState<boolean>(getMutedState());
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(profile.name);

  // PWA states and hooks
  const [showPwaModal, setShowPwaModal] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('android');

  useEffect(() => {
    // Detect iOS device
    const iosDetect = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIos(iosDetect);
    if (iosDetect) {
      setActiveTab('ios');
    }

    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
    };
  }, []);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setMutedState(nextMuted);
    setIsMuted(nextMuted);
    if (!nextMuted) {
      setTimeout(() => playSound('click'), 50);
    }
  };

  const saveName = () => {
    if (tempName.trim()) {
      updateProfile({ name: tempName.trim() });
      setIsEditingName(false);
      playSound('correct');
    }
  };

  const level = Math.floor(profile.points / 100) + 1;
  const pointsInCurrentLevel = profile.points % 100;

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6" id="dashboard-container">
      {/* Top Controls & Audio */}
      <div className="flex items-center justify-between mb-8">
        <div className="glass-panel flex items-center gap-3 py-2.5 px-4 rounded-2xl">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-display font-bold text-lg shadow-lg">
            {level}
          </div>
          <div>
            <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Sizning Darajangiz</div>
            <div className="text-sm font-black text-white">{level}-Darajali Zukko</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Install PWA Button */}
          <button
            onClick={() => {
              playSound('click');
              if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult: any) => {
                  if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the PWA install prompt');
                  }
                  setDeferredPrompt(null);
                });
              } else {
                setShowPwaModal(true);
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full font-bold border border-pink-400/30 shadow-lg hover:shadow-xl transition-all duration-300 kid-button text-xs md:text-sm animate-pulse hover:animate-none"
            style={{ animationDuration: '3s' }}
          >
            <Smartphone size={16} />
            <span className="hidden sm:inline">Bosh ekranga qo'shish</span>
            <span className="sm:hidden">O'rnatish 📱</span>
          </button>

          <button
            onClick={toggleSound}
            className={`p-3.5 rounded-full border transition kid-button ${
              isMuted
                ? 'glass-panel text-white/40 border-white/10'
                : 'glass-panel text-yellow-300 border-white/30 bg-white/10'
            }`}
            title={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {/* Profile Welcome Hero Banner - Frosted Heavy */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-heavy rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden mb-8"
      >
        {/* Playful abstract vector elements in background */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/10 rounded-full filter blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-10 w-36 h-36 bg-white/10 rounded-full filter blur-2xl -ml-10 -mb-10" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl md:text-6xl p-4 bg-white/20 backdrop-blur-md rounded-2xl animate-pulse">
              🧒
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={15}
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="bg-white/20 border border-white/40 rounded-xl px-3 py-1 text-white font-display font-bold text-2xl focus:outline-none focus:border-white w-40 md:w-56"
                    />
                    <button
                      onClick={saveName}
                      className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                      <Check size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide text-white">
                      Salom, {profile.name}!
                    </h1>
                    <button
                      onClick={() => {
                        playSound('click');
                        setIsEditingName(true);
                      }}
                      className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition"
                    >
                      <Edit2 size={16} />
                    </button>
                  </>
                )}
              </div>
              <p className="text-indigo-100 font-medium text-sm md:text-base mt-1.5 flex items-center gap-1.5">
                <Sparkles size={16} className="text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
                Bugungi bilimlar kashfiyotiga tayyormisiz? Qiziqarli o'yinlarni tanlang!
              </p>
            </div>
          </div>

          {/* Quick stats board */}
          <div className="flex gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 self-start md:self-auto shadow-inner">
            <div className="text-center px-2">
              <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Ballar</div>
              <div className="text-2xl font-black font-display">{profile.points}</div>
            </div>
            <div className="w-px bg-white/20 self-stretch" />
            <div className="text-center px-2">
              <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider flex items-center justify-center gap-0.5">
                <Star className="fill-yellow-300 text-yellow-300" size={12} />
                <span>Yulduzlar</span>
              </div>
              <div className="text-2xl font-black font-display text-yellow-300">{profile.stars}</div>
            </div>
            <div className="w-px bg-white/20 self-stretch" />
            <div className="text-center px-2">
              <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider flex items-center justify-center gap-0.5">
                <Flame className="fill-red-400 text-red-400" size={12} />
                <span>Kunlar</span>
              </div>
              <div className="text-2xl font-black font-display text-orange-300">{profile.streak}</div>
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
          <div className="flex justify-between text-xs font-bold text-indigo-100 mb-1.5">
            <span>Keyingi darajagacha ballar</span>
            <span>{pointsInCurrentLevel} / 100 ball</span>
          </div>
          <div className="w-full bg-black/30 h-4 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pointsInCurrentLevel}%` }}
              transition={{ duration: 1 }}
              className="bg-gradient-to-r from-yellow-300 to-amber-400 h-full rounded-full shadow-[0_0_8px_rgba(253,224,71,0.5)]"
            />
          </div>
        </div>
      </motion.div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Unlocked Badges Panel - Frosted Glass Heavy */}
        <div className="lg:col-span-1 glass-panel-heavy rounded-3xl p-5 shadow-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-pink-400" size={22} />
            <h3 className="font-display font-bold text-white text-lg">Mening Nishonlarim</h3>
          </div>

          <div className="space-y-3 flex-1">
            {BADGES_LIST.map((badge) => {
              const isUnlocked = profile.badges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'bg-white/15 border-white/20 text-white'
                      : 'bg-white/5 border-white/5 text-white/40'
                  }`}
                >
                  <div className={`text-3xl p-1.5 bg-white/10 rounded-xl border border-white/10 shadow-sm`}>
                    {isUnlocked ? badge.icon : '🔒'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs leading-none text-white">
                      {isUnlocked ? badge.name : 'Yopiq nishon'}
                    </h4>
                    <p className="text-[10px] mt-1 text-indigo-200/80 font-medium leading-relaxed">
                      {badge.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Game bento-grid selection - Glass Panels with dynamic glow */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-sky-400" size={22} />
            <h3 className="font-display font-bold text-white text-lg">Qiziqarli Bilim O'yinlari</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Space Math */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('math');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 bg-sky-500/20 border border-sky-400/30 rounded-2xl flex items-center justify-center text-sky-400 mb-4 group-hover:animate-bounce">
                  <Rocket size={24} />
                </div>
                <h4 className="font-display font-bold text-white text-xl mb-1.5 flex items-center gap-1.5">
                  Kosmik Matematika
                  <span className="text-xs font-sans bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">O'yin</span>
                </h4>
                <p className="text-indigo-100/80 text-sm leading-relaxed font-sans font-medium mb-4">
                  Koinot kemangizni asteroidlardan asrang! Misollarni tez va to'g'ri yechib dushmanlarni yakson qiling va ballar yig'ing.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-sky-300">
                <span>Matematika (Oson/Qiyin)</span>
                <span className="bg-sky-500/20 border border-sky-400/30 text-white px-3 py-1 rounded-full group-hover:bg-sky-500 group-hover:border-sky-400 transition">O'ynash 🚀</span>
              </div>
            </motion.div>

            {/* 2. Space Exploration */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('space');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl flex items-center justify-center text-indigo-300 mb-4 group-hover:animate-bounce">
                  <Compass size={24} />
                </div>
                <h4 className="font-display font-bold text-white text-xl mb-1.5 flex items-center gap-1.5">
                  Koinot Sayohati
                  <span className="text-xs font-sans bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/20">Kashfiyot</span>
                </h4>
                <p className="text-indigo-100/80 text-sm leading-relaxed font-sans font-medium mb-4">
                  Solar tizimidagi sayyoralar sirlarini o'rganing! Har bir planeta ma'lumotlarini o'qib, koinot savollariga to'g'ri javob bering.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                <span>Faktlar va Koinot Quiz</span>
                <span className="bg-indigo-500/20 border border-indigo-400/30 text-white px-3 py-1 rounded-full group-hover:bg-indigo-500 group-hover:border-indigo-400 transition">Kashf qilish 🪐</span>
              </div>
            </motion.div>

            {/* 3. Word Explorer */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('words');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 bg-pink-500/20 border border-pink-400/30 rounded-2xl flex items-center justify-center text-pink-300 mb-4 group-hover:animate-bounce">
                  <Smile size={24} />
                </div>
                <h4 className="font-display font-bold text-white text-xl mb-1.5 flex items-center gap-1.5">
                  So'z Boyligi (Speller)
                  <span className="text-xs font-sans bg-pink-500/20 text-pink-300 font-bold px-2.5 py-0.5 rounded-full border border-pink-500/20">Tillar</span>
                </h4>
                <p className="text-indigo-100/80 text-sm leading-relaxed font-sans font-medium mb-4">
                  Harflarni tartiblab o'zbekcha so'zlarni yig'ing va ularning inglizcha tarjimalarini eslab qoling. So'z boyligingizni oshiring!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-pink-300">
                <span>{"O'zbekcha <-> Inglizcha so'zlar"}</span>
                <span className="bg-pink-500/20 border border-pink-400/30 text-white px-3 py-1 rounded-full group-hover:bg-pink-500 group-hover:border-pink-400 transition">Yasash ✍️</span>
              </div>
            </motion.div>

            {/* 4. Memory Match */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('memory');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center text-amber-300 mb-4 group-hover:animate-bounce">
                  <Award size={24} />
                </div>
                <h4 className="font-display font-bold text-white text-xl mb-1.5 flex items-center gap-1.5">
                  Xotira Mashqi (Memory)
                  <span className="text-xs font-sans bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">Mantiq</span>
                </h4>
                <p className="text-indigo-100/80 text-sm leading-relaxed font-sans font-medium mb-4">
                  Yashirilgan hayvonlar juftligini birma-bir ochib, xotira va diqqatni jamlash qobiliyatingizni ajoyib o'yin orqali charxlang.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                <span>Diqqat va Xotira rivojlanishi</span>
                <span className="bg-amber-500/20 border border-amber-400/30 text-white px-3 py-1 rounded-full group-hover:bg-amber-500 group-hover:border-amber-400 transition">Topish 🧠</span>
              </div>
            </motion.div>

            {/* 5. Sehrli Harflar (Letter Finder & Spoken Letter) */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('letters');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 bg-pink-500/20 border border-pink-400/30 rounded-2xl flex items-center justify-center text-pink-300 mb-4 group-hover:animate-bounce">
                  <Volume2 size={24} />
                </div>
                <h4 className="font-display font-bold text-white text-xl mb-1.5 flex items-center gap-1.5">
                  Sehrli Harflar
                  <span className="text-xs font-sans bg-pink-500/20 text-pink-300 font-bold px-2.5 py-0.5 rounded-full border border-pink-500/20">Tovushlar</span>
                </h4>
                <p className="text-indigo-100/80 text-sm leading-relaxed font-sans font-medium mb-4">
                  Aytilgan harf pufagini toping! To'g'ri topsangiz, harf talaffuzi va rasmli sehrli so'zlarni eshitasiz.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-pink-300">
                <span>Tovushlar va Alifbo Dunyosi</span>
                <span className="bg-pink-500/20 border border-pink-400/30 text-white px-3 py-1 rounded-full group-hover:bg-pink-500 group-hover:border-pink-400 transition">O'rganish 🗣️</span>
              </div>
            </motion.div>

            {/* 6. Sehrli Sonlar & Sanoq (Counting & Math) */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('numbers');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-300 mb-4 group-hover:animate-bounce">
                  <Star className="fill-emerald-400 text-emerald-400" size={24} />
                </div>
                <h4 className="font-display font-bold text-white text-xl mb-1.5 flex items-center gap-1.5">
                  Sehrli Sanoq
                  <span className="text-xs font-sans bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">Sanash</span>
                </h4>
                <p className="text-indigo-100/80 text-sm leading-relaxed font-sans font-medium mb-4">
                  Ekranda nechta jonivor yoki pufak borligini birma-bir bosib, sanashni mashq qiling va to'g'ri sonni toping.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                <span>Birma-bir sanash qobiliyati</span>
                <span className="bg-emerald-500/20 border border-emerald-400/30 text-white px-3 py-1 rounded-full group-hover:bg-emerald-50 group-hover:border-emerald-400 transition">Sanash 🔢</span>
              </div>
            </motion.div>

            {/* 7. Mo'jizaviy Ranglar / Rasm Bo'yash (Coloring & Painting Canvas) */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('coloring');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl flex items-center justify-center text-indigo-300 mb-4 group-hover:animate-bounce">
                  <Palette size={24} />
                </div>
                <h4 className="font-display font-bold text-white text-xl mb-1.5 flex items-center gap-1.5">
                  Mo'jizaviy Ranglar
                  <span className="text-xs font-sans bg-indigo-500/20 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/20">Ijodkorlik</span>
                </h4>
                <p className="text-indigo-100/80 text-sm leading-relaxed font-sans font-medium mb-4">
                  Andozalarni yorqin ranglar bilan to'ldiring yoki erkin chizish maydonida o'z xayolot olamingizni tasvirlang!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                <span>Rasm bo'yash va Erkin chizish</span>
                <span className="bg-indigo-500/20 border border-indigo-400/30 text-white px-3 py-1 rounded-full group-hover:bg-indigo-50 group-hover:border-indigo-400 transition">Chizish 🎨</span>
              </div>
            </motion.div>

            {/* 8. Sehrli Soya (Shadow Matcher game) */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('shadow_matcher');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center text-amber-300 mb-4 group-hover:animate-bounce">
                  <Brain size={24} />
                </div>
                <h4 className="font-display font-bold text-white text-xl mb-1.5 flex items-center gap-1.5">
                  Sehrli Soya
                  <span className="text-xs font-sans bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/20">Mantiqiy Fikr</span>
                </h4>
                <p className="text-indigo-100/80 text-sm leading-relaxed font-sans font-medium mb-4">
                  Rang-barang hayvonlar, mevalar va mashinalarni ularning sirli qora soyalari bilan moslashtiring!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                <span>Diqqat va mantiqiy o'yin</span>
                <span className="bg-amber-500/20 border border-amber-400/30 text-white px-3 py-1 rounded-full group-hover:bg-amber-50 group-hover:border-amber-400 transition">Soyani Top 👤</span>
              </div>
            </motion.div>
          </div>

          {/* New Category: 10 Mini Games Displayed Standalone */}
          <div className="flex items-center gap-2 mt-12 mb-5 border-t border-white/10 pt-8" id="mini-games-section-title">
            <Gamepad2 className="text-pink-400 animate-pulse" size={22} />
            <h3 className="font-display font-bold text-white text-lg">Mitti Zukkolar Mini-O'yinlari</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="mini-games-grid">
            {/* 1. Tovushlar Olami */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('mini_games_sounds');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group border border-pink-400/20"
            >
              <div>
                <div className="w-11 h-11 bg-pink-500/20 border border-pink-400/30 rounded-2xl flex items-center justify-center text-pink-300 mb-4 group-hover:animate-bounce">
                  <Volume2 size={22} />
                </div>
                <h4 className="font-display font-bold text-white text-lg mb-1.5 flex items-center gap-1.5">
                  Tovushlar Olami
                  <span className="text-[10px] font-sans bg-pink-500/20 text-pink-300 font-bold px-2 py-0.5 rounded-full border border-pink-500/10">Hayvonlar</span>
                </h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed font-sans font-medium mb-4">
                  Tovush qaysi hayvonga tegishli ekanligini tinglab toping! Eshiting va o'rganing.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-pink-300">
                <span>Eshiting va Toping</span>
                <span className="bg-pink-500/20 border border-pink-400/30 text-white px-2.5 py-1 rounded-full group-hover:bg-pink-500 group-hover:border-pink-400 transition">Tinglash 🐱</span>
              </div>
            </motion.div>

            {/* 2. Ranglar Sehrgari */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('mini_games_colors');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group border border-purple-400/20"
            >
              <div>
                <div className="w-11 h-11 bg-purple-500/20 border border-purple-400/30 rounded-2xl flex items-center justify-center text-purple-300 mb-4 group-hover:animate-bounce">
                  <Palette size={22} />
                </div>
                <h4 className="font-display font-bold text-white text-lg mb-1.5 flex items-center gap-1.5">
                  Ranglar Sehrgari
                  <span className="text-[10px] font-sans bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/10">Ijod</span>
                </h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed font-sans font-medium mb-4">
                  Ranglarni bir-biriga aralashtirib, yangi chiroyli ranglar sehrini kashf qiling!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
                <span>Ranglar Laboratoriyasi</span>
                <span className="bg-purple-500/20 border border-purple-400/30 text-white px-2.5 py-1 rounded-full group-hover:bg-purple-500 group-hover:border-purple-400 transition">Aralash 🎨</span>
              </div>
            </motion.div>

            {/* 3. Pufakchalar Shousi */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('mini_games_balloons');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group border border-sky-400/20"
            >
              <div>
                <div className="w-11 h-11 bg-sky-500/20 border border-sky-400/30 rounded-2xl flex items-center justify-center text-sky-300 mb-4 group-hover:animate-bounce">
                  <Sparkles size={22} />
                </div>
                <h4 className="font-display font-bold text-white text-lg mb-1.5 flex items-center gap-1.5">
                  Pufaklar Shousi
                  <span className="text-[10px] font-sans bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/10">Tezkorlik</span>
                </h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed font-sans font-medium mb-4">
                  Faqat to'g'ri rangli havo sharini tezlik bilan portlatib ballar to'plang!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-sky-300">
                <span>Chaqqonlik Mashqi</span>
                <span className="bg-sky-500/20 border border-sky-400/30 text-white px-2.5 py-1 rounded-full group-hover:bg-sky-500 group-hover:border-sky-400 transition">Portlatish 🎈</span>
              </div>
            </motion.div>

            {/* 4. Sayyoralarni Tartiblash */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('mini_games_planets');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group border border-amber-400/20"
            >
              <div>
                <div className="w-11 h-11 bg-amber-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center text-amber-300 mb-4 group-hover:animate-bounce">
                  <Compass size={22} />
                </div>
                <h4 className="font-display font-bold text-white text-lg mb-1.5 flex items-center gap-1.5">
                  Fazoviy Tartib
                  <span className="text-[10px] font-sans bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/10">Koinot</span>
                </h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed font-sans font-medium mb-4">
                  Sayyoralarni Quyoshga yaqinligi bo'yicha to'g'ri tartibda joylashtiring!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                <span>Astronomiya darsi</span>
                <span className="bg-amber-500/20 border border-amber-400/30 text-white px-2.5 py-1 rounded-full group-hover:bg-amber-500 group-hover:border-amber-400 transition">Tartiblash 🪐</span>
              </div>
            </motion.div>

            {/* 5. Meva Terish */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('mini_games_fruits');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group border border-emerald-400/20"
            >
              <div>
                <div className="w-11 h-11 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center text-emerald-300 mb-4 group-hover:animate-bounce">
                  <Smile size={22} />
                </div>
                <h4 className="font-display font-bold text-white text-lg mb-1.5 flex items-center gap-1.5">
                  Meva Terish
                  <span className="text-[10px] font-sans bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/10">Diqqat</span>
                </h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed font-sans font-medium mb-4">
                  Yiqilayotgan shirin va foydali mevalarni savatga tushiring, toshlardan qoching!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-300">
                <span>Reaksiya va tezlik</span>
                <span className="bg-emerald-500/20 border border-emerald-400/30 text-white px-2.5 py-1 rounded-full group-hover:bg-emerald-500 group-hover:border-emerald-400 transition">Meva Terish 🍎</span>
              </div>
            </motion.div>

            {/* 6. Sehrli Ksilofon */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('mini_games_xylophone');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group border border-fuchsia-400/20"
            >
              <div>
                <div className="w-11 h-11 bg-fuchsia-500/20 border border-fuchsia-400/30 rounded-2xl flex items-center justify-center text-fuchsia-300 mb-4 group-hover:animate-bounce">
                  <Gamepad2 size={22} />
                </div>
                <h4 className="font-display font-bold text-white text-lg mb-1.5 flex items-center gap-1.5">
                  Sehrli Ksilofon
                  <span className="text-[10px] font-sans bg-fuchsia-500/20 text-fuchsia-300 font-bold px-2.5 py-0.5 rounded-full border border-fuchsia-500/10">Musiqa</span>
                </h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed font-sans font-medium mb-4">
                  Rang-barang notalarni chalib, o'z kuylaringizni yarating va tinglang!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-fuchsia-300">
                <span>Ijodiy musiqa darsi</span>
                <span className="bg-fuchsia-500/20 border border-fuchsia-400/30 text-white px-2.5 py-1 rounded-full group-hover:bg-fuchsia-500 group-hover:border-fuchsia-400 transition">Chaling 🎹</span>
              </div>
            </motion.div>

            {/* 7. Sehrli Tarozi */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('mini_games_balance');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group border border-cyan-400/20"
            >
              <div>
                <div className="w-11 h-11 bg-cyan-500/20 border border-cyan-400/30 rounded-2xl flex items-center justify-center text-cyan-300 mb-4 group-hover:animate-bounce">
                  <Scale size={22} />
                </div>
                <h4 className="font-display font-bold text-white text-lg mb-1.5 flex items-center gap-1.5">
                  Sehrli Tarozi
                  <span className="text-[10px] font-sans bg-cyan-500/20 text-cyan-300 font-bold px-2.5 py-0.5 rounded-full border border-cyan-500/10">Solishtirish</span>
                </h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed font-sans font-medium mb-4">
                  Turli buyumlar va hayvonlarni tarozida tortib, qaysi biri og'irligini aniqlang!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                <span>Fizika va Solishtirish</span>
                <span className="bg-cyan-500/20 border border-cyan-400/30 text-white px-2.5 py-1 rounded-full group-hover:bg-cyan-500 group-hover:border-cyan-400 transition">O'lchash ⚖️</span>
              </div>
            </motion.div>

            {/* 8. Vaqtni O'rganamiz */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('mini_games_clock');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group border border-yellow-400/20"
            >
              <div>
                <div className="w-11 h-11 bg-yellow-500/20 border border-yellow-400/30 rounded-2xl flex items-center justify-center text-yellow-300 mb-4 group-hover:animate-bounce">
                  <Clock size={22} />
                </div>
                <h4 className="font-display font-bold text-white text-lg mb-1.5 flex items-center gap-1.5">
                  Soat va Vaqt
                  <span className="text-[10px] font-sans bg-yellow-500/20 text-yellow-300 font-bold px-2.5 py-0.5 rounded-full border border-yellow-500/10">Bilim</span>
                </h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed font-sans font-medium mb-4">
                  Soat millarini so'ralgan vaqtga to'g'ri o'rnating va kun tartibini o'rganing!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-yellow-300">
                <span>Vaqtni aniqlash</span>
                <span className="bg-yellow-500/20 border border-yellow-400/30 text-white px-2.5 py-1 rounded-full group-hover:bg-yellow-500 group-hover:border-yellow-400 transition">Soatni Sozlash ⏰</span>
              </div>
            </motion.div>

            {/* 9. Baliqchi Hisobchi */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('mini_games_fishing');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group border border-teal-400/20"
            >
              <div>
                <div className="w-11 h-11 bg-teal-500/20 border border-teal-400/30 rounded-2xl flex items-center justify-center text-teal-300 mb-4 group-hover:animate-bounce">
                  <Compass size={22} />
                </div>
                <h4 className="font-display font-bold text-white text-lg mb-1.5 flex items-center gap-1.5">
                  Baliqchi Hisobchi
                  <span className="text-[10px] font-sans bg-teal-500/20 text-teal-300 font-bold px-2.5 py-0.5 rounded-full border border-teal-500/10">Hisob</span>
                </h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed font-sans font-medium mb-4">
                  Misolning to'g'ri javobiga ega bo'lgan suzayotgan baliqchalarni tuting!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-teal-300">
                <span>Raqamlar va Hisob</span>
                <span className="bg-teal-500/20 border border-teal-400/30 text-white px-2.5 py-1 rounded-full group-hover:bg-teal-500 group-hover:border-teal-400 transition">Tutish 🎣</span>
              </div>
            </motion.div>

            {/* 10. Emoji Jumboqlari */}
            <motion.div
              whileHover={{ y: -5 }}
              onClick={() => {
                playSound('click');
                onSelectGame('mini_games_rebus');
              }}
              className="glass-panel glass-card-hover rounded-3xl p-5 cursor-pointer shadow-xl transition-all flex flex-col justify-between group border border-red-400/20"
            >
              <div>
                <div className="w-11 h-11 bg-red-500/20 border border-red-400/30 rounded-2xl flex items-center justify-center text-red-300 mb-4 group-hover:animate-bounce">
                  <Brain size={22} />
                </div>
                <h4 className="font-display font-bold text-white text-lg mb-1.5 flex items-center gap-1.5">
                  Emoji Jumboqlari
                  <span className="text-[10px] font-sans bg-red-500/20 text-red-300 font-bold px-2.5 py-0.5 rounded-full border border-red-500/10">Mantiq</span>
                </h4>
                <p className="text-indigo-100/80 text-xs leading-relaxed font-sans font-medium mb-4">
                  Bir nechta qiziqarli emojilarni bir-biriga qo'shib, yashirilgan so'zni toping!
                </p>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-red-300">
                <span>So'z o'yinlari va jumboqlar</span>
                <span className="bg-red-500/20 border border-red-400/30 text-white px-2.5 py-1 rounded-full group-hover:bg-red-500 group-hover:border-red-400 transition">Topish 🧩</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* PWA Installation Guide Modal */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" id="pwa-modal">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel-heavy max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 text-white flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-pink-500/20 to-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-500/30 rounded-xl text-pink-300">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="font-display font-black text-xl leading-none">Bosh ekranga qo'shish</h3>
                  <p className="text-[11px] text-indigo-200 mt-1 font-semibold font-sans">Mitti Zukkolar platformasini telefoningizga o'rnating!</p>
                </div>
              </div>
              <button
                onClick={() => { playSound('click'); setShowPwaModal(false); }}
                className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Tabs */}
            <div className="p-6 flex-1 overflow-y-auto max-h-[70vh]">
              <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 mb-6">
                <button
                  onClick={() => { playSound('click'); setActiveTab('android'); }}
                  className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'android' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md' : 'text-indigo-200 hover:text-white'
                  }`}
                >
                  <span>🤖 Android (Chrome)</span>
                </button>
                <button
                  onClick={() => { playSound('click'); setActiveTab('ios'); }}
                  className={`flex-1 py-2.5 rounded-lg text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 ${
                    activeTab === 'ios' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md' : 'text-indigo-200 hover:text-white'
                  }`}
                >
                  <span>🍏 iPhone (Safari)</span>
                </button>
              </div>

              {activeTab === 'android' ? (
                <div className="space-y-4 font-sans font-medium text-sm text-indigo-100">
                  <p className="text-center text-xs text-indigo-200 mb-4">
                    Android telefoningizda brauzer orqali o'yinni istalgan vaqtda tezda boshlash uchun bosh ekranga osongina joylashtiring:
                  </p>
                  
                  <div className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 bg-pink-500/20 text-pink-300 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div>
                      <p className="text-white font-bold mb-1">Brauzer menyusini oching</p>
                      <p className="text-xs text-indigo-200">Chrome brauzerining yuqori o'ng burchagidagi <strong className="text-white inline-flex items-center gap-1">uchta nuqta (<MoreVertical size={14} className="inline" />)</strong> tugmasini bosing.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 bg-pink-500/20 text-pink-300 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div>
                      <p className="text-white font-bold mb-1">O'rnatish bandini tanlang</p>
                      <p className="text-xs text-indigo-200">Menyudan <strong className="text-white">"Ilovani o'rnatish" (Install App)</strong> yoki <strong className="text-white">"Bosh ekranga qo'shish" (Add to Home Screen)</strong> variantini tanlang.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 bg-pink-500/20 text-pink-300 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                    <div>
                      <p className="text-white font-bold mb-1">Tasdiqlang</p>
                      <p className="text-xs text-indigo-200">Ekranda chiqadigan oynada <strong className="text-white">"Qo'shish" (Install / Add)</strong> tugmasini bosing.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 font-sans font-medium text-sm text-indigo-100">
                  <p className="text-center text-xs text-indigo-200 mb-4">
                    iPhone yoki iPad smartfoningizda Safari brauzeri orqali ilovani bosh ekranga chiroyli belgi bilan qo'shing:
                  </p>

                  <div className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 bg-pink-500/20 text-pink-300 rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                    <div>
                      <p className="text-white font-bold mb-1">Ulashish tugmasini bosing</p>
                      <p className="text-xs text-indigo-200">Safari brauzerining quyi qismidagi o'rtada joylashgan <strong className="text-white inline-flex items-center gap-1">"Ulashish" (<Share2 size={14} className="inline text-sky-400" />)</strong> tugmasini bosing.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 bg-pink-500/20 text-pink-300 rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                    <div>
                      <p className="text-white font-bold mb-1">Bosh ekranga qo'shing</p>
                      <p className="text-xs text-indigo-200">Ochilgan menyudan pastroqqa tushib, <strong className="text-white inline-flex items-center gap-1">"Bosh ekranga qo'shish" (<Plus size={14} className="inline bg-white/10 p-0.5 rounded" /> Add to Home Screen)</strong> yozuvini bosing.</p>
                    </div>
                  </div>

                  <div className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-8 h-8 bg-pink-500/20 text-pink-300 rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                    <div>
                      <p className="text-white font-bold mb-1">Nom bering va yakunlang</p>
                      <p className="text-xs text-indigo-200">O'ng burchakdagi <strong className="text-white">"Qo'shish" (Add)</strong> tugmasini bosing. Endi platforma ilova kabi telefoningizda paydo bo'ladi!</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/30 border-t border-white/10 text-center">
              <p className="text-[11px] text-indigo-200 flex items-center justify-center gap-1.5 font-bold">
                <Info size={12} className="text-yellow-400 animate-bounce" />
                O'rnatilgandan keyin o'yinni istalgan joydan bevosita bosh ekrandan kira olasiz!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
