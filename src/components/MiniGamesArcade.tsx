/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Sparkles, Check, X, RefreshCw, Volume2, Trophy, Music, Award, ShieldAlert, Heart } from 'lucide-react';
import { UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface MiniGamesArcadeProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
  initialGameId?: string;
}

interface MicroGame {
  id: string;
  nameUz: string;
  emoji: string;
  description: string;
  colorClass: string;
}

const MICRO_GAMES_LIST: MicroGame[] = [
  { id: 'sounds', nameUz: 'Tovushlar Olami', emoji: '🐱', description: 'Tovush qaysi hayvonga tegishli ekanligini toping!', colorClass: 'from-pink-500 to-rose-500' },
  { id: 'colors', nameUz: 'Ranglar Sehrgari', emoji: '🎨', description: 'Ranglarni bir-biriga aralashtirib yangi rang hosil qiling!', colorClass: 'from-purple-500 to-indigo-500' },
  { id: 'balloons', nameUz: 'Pufakchalar Shousi', emoji: '🎈', description: 'Faqat to\'g\'ri rangli sharlarni portlatib ball yig\'ing!', colorClass: 'from-sky-400 to-blue-500' },
  { id: 'planets', nameUz: 'Fazoviy Sayohat', emoji: '🪐', description: 'Sayyoralarni Quyoshga yaqinligi bo\'yicha joylashtiring!', colorClass: 'from-amber-500 to-orange-500' },
  { id: 'fruits', nameUz: 'Meva Terish', emoji: '🍎', description: 'Shirin mevalarni bosing, toshlarni chetlab o\'ting!', colorClass: 'from-emerald-500 to-teal-500' },
  { id: 'xylophone', nameUz: 'Sehrli Ksilofon', emoji: '🎹', description: 'Turli rangli tugmalarni bosib, chiroyli kuylar chaling!', colorClass: 'from-fuchsia-500 to-purple-600' },
  { id: 'balance', nameUz: 'Tarozi O\'yini', emoji: '⚖️', description: 'Qaysi biri og\'irroq ekanini tarozida solishtirib ko\'ring!', colorClass: 'from-cyan-500 to-blue-600' },
  { id: 'clock', nameUz: 'Vaqtni O\'rganamiz', emoji: '⏰', description: 'Soat millarini to\'g\'ri vaqtga o\'rnating!', colorClass: 'from-yellow-500 to-amber-600' },
  { id: 'fishing', nameUz: 'Baliqchi Hisobchi', emoji: '🎣', description: 'To\'g\'ri javobli suzayotgan baliqchalarni tuting!', colorClass: 'from-teal-400 to-emerald-500' },
  { id: 'rebus', nameUz: 'Emoji Jumboqlari', emoji: '🧩', description: 'Rasmlarni qo\'shib, qanday so\'z yashiringanini toping!', colorClass: 'from-red-500 to-orange-500' },
];

export default function MiniGamesArcade({ profile, updateProfile, onBack, initialGameId }: MiniGamesArcadeProps) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(initialGameId || null);
  const [gameState, setGameState] = useState<any>({});
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'uz-UZ';
      window.speechSynthesis.speak(utterance);
    }
  };

  const addRewards = (points: number, stars: number) => {
    updateProfile({
      points: profile.points + points,
      stars: profile.stars + stars,
    });
  };

  // --- GAME 1: ANIMAL SOUNDS MATCHING ---
  const initSoundsGame = () => {
    const SOUNDS_QUESTIONS = [
      { soundText: "Miyov, miyov! Men kimman? 🐈", correctId: 'cat', options: [{ id: 'dog', emoji: '🐶', label: 'Kuchukcha' }, { id: 'cat', emoji: '🐈', label: 'Mushukcha' }, { id: 'duck', emoji: '🦆', label: 'O\'rdakcha' }] },
      { soundText: "Vov-vov! Men uyni qo'riqlayman. Men kimman? 🐕", correctId: 'dog', options: [{ id: 'dog', emoji: '🐕', label: 'Kuchukcha' }, { id: 'lion', emoji: '🦁', label: 'Sher' }, { id: 'cow', emoji: '🐄', label: 'Sigirvoy' }] },
      { soundText: "Mo'o'o'! Men shirin sut beraman. Men kimman? 🐄", correctId: 'cow', options: [{ id: 'sheep', emoji: '🐑', label: 'Qo\'zichoq' }, { id: 'horse', emoji: '🐎', label: 'Toychoq' }, { id: 'cow', emoji: '🐄', label: 'Sigirvoy' }] },
      { soundText: "Qoq-qoq, qu-va-q! Men ko'lda suzaman. Men kimman? 🦆", correctId: 'duck', options: [{ id: 'duck', emoji: '🦆', label: 'O\'rdak' }, { id: 'rooster', emoji: '🐓', label: 'Xo\'roz' }, { id: 'frog', emoji: '🐸', label: 'Baqa' }] },
      { soundText: "I-ho-ho! Men tez chopaman. Men kimman? 🐎", correctId: 'horse', options: [{ id: 'cow', emoji: '🐄', label: 'Sigir' }, { id: 'horse', emoji: '🐎', label: 'Ot' }, { id: 'elephant', emoji: '🐘', label: 'Fil' }] }
    ];
    const question = SOUNDS_QUESTIONS[Math.floor(Math.random() * SOUNDS_QUESTIONS.length)];
    setGameState({ question });
    setFeedback(null);
    setTimeout(() => speakText(question.soundText), 200);
  };

  const handleSoundsAnswer = (id: string) => {
    if (feedback) return;
    const isCorrect = id === gameState.question.correctId;
    if (isCorrect) {
      playSound('correct');
      setFeedback({ isCorrect: true, text: "To'g'ri topdingiz! Ofarin, siz juda aqllisiz! 🌟 +10 ball" });
      addRewards(10, 0);
    } else {
      playSound('incorrect');
      setFeedback({ isCorrect: false, text: "O'xshash, lekin bu boshqa hayvoncha edi! Qaytadan urinib ko'ramiz! 🧸" });
    }
  };

  // --- GAME 2: COLOR MIXER ---
  const initColorsGame = () => {
    const MIXES = [
      { c1: 'Sariq 💛', c2: 'Ko\'k 💙', target: 'Yashil 💚', bgTarget: '#22c55e' },
      { c1: 'Qizil ❤️', c2: 'Sariq 💛', target: 'Olovrang 🧡', bgTarget: '#f97316' },
      { c1: 'Qizil ❤️', c2: 'Ko\'k 💙', target: 'Binafsha 💜', bgTarget: '#a855f7' },
      { c1: 'Oq 🤍', c2: 'Qizil ❤️', target: 'Pushti 🩷', bgTarget: '#ec4899' },
    ];
    const item = MIXES[Math.floor(Math.random() * MIXES.length)];
    setGameState({ item, selected1: null, selected2: null });
    setFeedback(null);
    speakText(`Keling rang aralashtiramiz! Qaysi ikki rangni qo'shsak ${item.target} hosil bo'ladi?`);
  };

  const selectMixColor = (color: string) => {
    playSound('click');
    if (!gameState.selected1) {
      setGameState((prev: any) => ({ ...prev, selected1: color }));
    } else if (!gameState.selected2 && gameState.selected1 !== color) {
      const s2 = color;
      const s1 = gameState.selected1;
      const target = gameState.item;
      
      const isCorrect = 
        (s1.includes('Sariq') && s2.includes('Ko\'k') && target.target.includes('Yashil')) ||
        (s1.includes('Ko\'k') && s2.includes('Sariq') && target.target.includes('Yashil')) ||
        (s1.includes('Qizil') && s2.includes('Sariq') && target.target.includes('Olovrang')) ||
        (s1.includes('Sariq') && s2.includes('Qizil') && target.target.includes('Olovrang')) ||
        (s1.includes('Qizil') && s2.includes('Ko\'k') && target.target.includes('Binafsha')) ||
        (s1.includes('Ko\'k') && s2.includes('Qizil') && target.target.includes('Binafsha')) ||
        (s1.includes('Oq') && s2.includes('Qizil') && target.target.includes('Pushti')) ||
        (s1.includes('Qizil') && s2.includes('Oq') && target.target.includes('Pushti'));

      if (isCorrect) {
        playSound('correct');
        setFeedback({ isCorrect: true, text: `Barakalla! To'g'ri, ${s1} va ${s2} qo'shilsa ${target.target} bo'ladi! 🎨 +15 ball` });
        addRewards(15, 0);
      } else {
        playSound('incorrect');
        setFeedback({ isCorrect: false, text: "Bu ranglar qo'shilsa boshqa rang chiqadi. Qaytadan urinib ko'ring! 🧸" });
      }
      setGameState((prev: any) => ({ ...prev, selected2: s2 }));
    }
  };

  // --- GAME 3: BALLOON POPPER ---
  const initBalloonsGame = () => {
    const COLORS = [
      { name: 'Qizil', color: 'bg-red-500', emoji: '🎈' },
      { name: 'Ko\'k', color: 'bg-blue-500', emoji: '🎈' },
      { name: 'Sariq', color: 'bg-yellow-400', emoji: '🎈' },
      { name: 'Yashil', color: 'bg-green-500', emoji: '🎈' }
    ];
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    // Generate 8 random balloons
    const list = Array.from({ length: 8 }).map((_, i) => {
      const colorObj = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        id: i,
        ...colorObj,
        popped: false,
        x: Math.random() * 80 + 10, // percentage left
        y: Math.random() * 60 + 20, // percentage top
      };
    });
    setGameState({ target, balloons: list, poppedCount: 0 });
    setFeedback(null);
    speakText(`Faqat ${target.name} rangli pufaklarni bosing va portlating!`);
  };

  const popBalloon = (id: number) => {
    const b = gameState.balloons.find((x: any) => x.id === id);
    if (b.popped) return;

    if (b.name === gameState.target.name) {
      playSound('correct');
      setGameState((prev: any) => {
        const updated = prev.balloons.map((x: any) => x.id === id ? { ...x, popped: true } : x);
        const correctPopped = updated.filter((x: any) => x.name === prev.target.name && x.popped).length;
        const totalCorrect = updated.filter((x: any) => x.name === prev.target.name).length;

        if (correctPopped === totalCorrect) {
          setTimeout(() => {
            setFeedback({ isCorrect: true, text: "Ajoyib! Barcha to'g'ri pufaklarni mukammal portlatdingiz! 🎈 +15 ball" });
            addRewards(15, 0);
          }, 300);
        }
        return { ...prev, balloons: updated };
      });
    } else {
      playSound('incorrect');
      // Decrement or show mild error feedback
      speakText("Voy, bu xato rang!");
    }
  };

  // --- GAME 4: PLANET SORTER ---
  const initPlanetsGame = () => {
    const PLANETS_POOL = [
      { name: 'Merkuriy 🪐', distance: 1 },
      { name: 'Venera 🪐', distance: 2 },
      { name: 'Yer 🌍', distance: 3 },
      { name: 'Mars 🔴', distance: 4 },
      { name: 'Yupiter 🪐', distance: 5 },
    ];
    // Shuffle pool and select 3
    const selected = [...PLANETS_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    setGameState({ selected, ordered: [] });
    setFeedback(null);
    speakText("Sayyoralarni Quyoshga eng yaqinidan boshlab tartib bilan bosing!");
  };

  const orderPlanet = (planet: any) => {
    playSound('click');
    if (gameState.ordered.some((p: any) => p.name === planet.name)) return;

    const nextOrdered = [...gameState.ordered, planet];
    setGameState((prev: any) => ({ ...prev, ordered: nextOrdered }));

    if (nextOrdered.length === gameState.selected.length) {
      // Check if perfectly sorted by distance
      const isSorted = nextOrdered.every((val, i) => i === 0 || val.distance >= nextOrdered[i - 1].distance);
      if (isSorted) {
        playSound('correct');
        setFeedback({ isCorrect: true, text: "Ura! Kosmik sayyoralarni to'g'ri joylashtirdingiz, yosh fazogir! 🚀 +20 ball, +1 yulduz" });
        addRewards(20, 1);
      } else {
        playSound('incorrect');
        setFeedback({ isCorrect: false, text: "Sayyoralarning joylashuvi biroz noto'g'ri bo'ldi. Qayta urinib ko'ring! 🔭" });
      }
    }
  };

  // --- GAME 5: FRUIT CATCHER ---
  const initFruitsGame = () => {
    const ITEMS = [
      { emoji: '🍎', isGood: true, label: 'Olma' },
      { emoji: '🍌', isGood: true, label: 'Banan' },
      { emoji: '🍓', isGood: true, label: 'Qulupnay' },
      { emoji: '🍇', isGood: true, label: 'Uzum' },
      { emoji: '🪨', isGood: false, label: 'Tosh' },
      { emoji: '🧱', isGood: false, label: 'G\'isht' },
    ];
    // Generate 9 grid items
    const grid = Array.from({ length: 9 }).map((_, i) => {
      const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      return { id: i, ...item, clicked: false };
    });
    setGameState({ grid, score: 0 });
    setFeedback(null);
    speakText("Shirin mevalarni bosing, ammo qattiq toshlarni bosmang!");
  };

  const clickFruitItem = (id: number) => {
    const cell = gameState.grid.find((x: any) => x.id === id);
    if (cell.clicked) return;

    if (cell.isGood) {
      playSound('correct');
      setGameState((prev: any) => {
        const nextGrid = prev.grid.map((x: any) => x.id === id ? { ...x, clicked: true } : x);
        const nextScore = prev.score + 10;
        const totalGood = nextGrid.filter((x: any) => x.isGood).length;
        const clickedGood = nextGrid.filter((x: any) => x.isGood && x.clicked).length;

        if (clickedGood === totalGood) {
          setTimeout(() => {
            setFeedback({ isCorrect: true, text: `Ajoyib! Barcha vitaminli shirin mevalarni terib oldingiz! 🍒 +20 ball` });
            addRewards(20, 0);
          }, 300);
        }
        return { ...prev, grid: nextGrid, score: nextScore };
      });
    } else {
      playSound('incorrect');
      speakText("Oh, bu tosh-ku! Buni yeb bo'lmaydi! 🧱");
    }
  };

  // --- GAME 6: PLAYABLE XYLOPHONE ---
  const initXylophoneGame = () => {
    setGameState({ lastKey: null, songPlayed: [] });
    setFeedback(null);
    speakText("Sehrli musiqa chalish darsxonasi! Xohlagan rangli notangizni bosib kuy chaling!");
  };

  const XYLO_KEYS = [
    { note: 'C', color: 'bg-red-500 text-white', label: 'DO 🔴', pitch: 261.63 },
    { note: 'D', color: 'bg-orange-500 text-white', label: 'RE 🟠', pitch: 293.66 },
    { note: 'E', color: 'bg-yellow-500 text-slate-800', label: 'MI 🟡', pitch: 329.63 },
    { note: 'F', color: 'bg-green-500 text-white', label: 'FA 🟢', pitch: 349.23 },
    { note: 'G', color: 'bg-teal-500 text-white', label: 'SOL 🔵', pitch: 392.00 },
    { note: 'A', color: 'bg-blue-500 text-white', label: 'LYA 🔵', pitch: 440.00 },
    { note: 'B', color: 'bg-purple-500 text-white', label: 'SI 🟣', pitch: 493.88 },
    { note: 'C2', color: 'bg-pink-500 text-white', label: 'DO+ 🩷', pitch: 523.25 },
  ];

  const playNote = (pitch: number, label: string) => {
    // Generate synthetic audio wave
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
      try {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(pitch, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1);
      } catch (err) {
        console.error('AudioContext synth error:', err);
      }
    }
    playSound('flip');
    setGameState((prev: any) => ({
      ...prev,
      lastKey: label,
      songPlayed: [...(prev.songPlayed || []), label].slice(-5),
    }));

    // Reward child after hitting keys
    if (Math.random() > 0.85) {
      addRewards(5, 0);
    }
  };

  // --- GAME 7: WEIGHT BALANCER ---
  const initBalanceGame = () => {
    const BALANCES = [
      { left: '🐘 Filvoy', right: '🦁 Sherchadan 10 tasi', isLeftHeavier: true, desc: "Fil sherlardan og'irroq!" },
      { left: '🐭 Sichqoncha', right: '🐈 Mushukvoy', isLeftHeavier: false, desc: "Mushukvoy sichqondan ancha og'ir!" },
      { left: '🍉 Katta tarvuz', right: '🍒 Bitta gilos', isLeftHeavier: true, desc: "Tarvuz gilosga qaraganda juda og'ir!" },
      { left: '🛶 Qayiq', right: '🚢 Ulkan kema', isLeftHeavier: false, desc: "Kema qayiqdan million marta og'ir!" },
    ];
    const item = BALANCES[Math.floor(Math.random() * BALANCES.length)];
    setGameState({ item });
    setFeedback(null);
    speakText(`Taroziga qarang! Qaysi biri og'irroq deb o'ylaysiz?`);
  };

  const chooseBalance = (leftSelected: boolean) => {
    const isCorrect = leftSelected === gameState.item.isLeftHeavier;
    if (isCorrect) {
      playSound('correct');
      setFeedback({ isCorrect: true, text: `To'g'ri topdingiz! Ofarin! ${gameState.item.desc} ⚖️ +15 ball` });
      addRewards(15, 0);
    } else {
      playSound('incorrect');
      setFeedback({ isCorrect: false, text: "O'ylab ko'ring, tarozi boshqa tomonga og'adi! Qaytadan urinib ko'ring! 🧸" });
    }
  };

  // --- GAME 8: CLOCK LEARNER ---
  const initClockGame = () => {
    const hour = Math.floor(Math.random() * 12) + 1;
    setGameState({ hour, currentHour: 12 });
    setFeedback(null);
    speakText(`Soat millarini o'zgartirib, soat roppa-rosa ${hour} ga o'rnating!`);
  };

  const changeClockHour = (amount: number) => {
    playSound('click');
    setGameState((prev: any) => {
      let next = prev.currentHour + amount;
      if (next > 12) next = 1;
      if (next < 1) next = 12;
      return { ...prev, currentHour: next };
    });
  };

  const checkClockAnswer = () => {
    const isCorrect = gameState.hour === gameState.currentHour;
    if (isCorrect) {
      playSound('correct');
      setFeedback({ isCorrect: true, text: "Barakalla! Soatni mukammal darajada to'g'ri o'rnatdingiz! ⏰ +20 ball" });
      addRewards(20, 0);
    } else {
      playSound('incorrect');
      setFeedback({ isCorrect: false, text: `Hozir soat ${gameState.currentHour} bo'ldi. Bizga esa ${gameState.hour} kerak edi. Yana bir bor urinib ko'ring! 🧸` });
    }
  };

  // --- GAME 9: MATH FISHING ---
  const initFishingGame = () => {
    const num1 = Math.floor(Math.random() * 5) + 1;
    const num2 = Math.floor(Math.random() * 4) + 1;
    const isAddition = Math.random() > 0.5;
    const answer = isAddition ? num1 + num2 : Math.max(num1, num2) - Math.min(num1, num2);
    const sign = isAddition ? '+' : '-';
    const sumText = `${isAddition ? num1 : Math.max(num1, num2)} ${sign} ${isAddition ? num2 : Math.min(num1, num2)} = ?`;

    // Generate 3 swimming fishes with different answers
    const answersSet = new Set<number>([answer]);
    while (answersSet.size < 3) {
      answersSet.add(Math.floor(Math.random() * 10));
    }
    const options = Array.from(answersSet).sort(() => Math.random() - 0.5);

    setGameState({ sumText, answer, options });
    setFeedback(null);
    speakText(`Baliqchi bolajon! ${sumText} misolining to'g'ri javobini topib, baliqchani tuting!`);
  };

  const catchFish = (opt: number) => {
    if (opt === gameState.answer) {
      playSound('correct');
      setFeedback({ isCorrect: true, text: "Ura! To'g'ri baliqni tutdingiz! Siz haqiqiy hisobchi baliqchisiz! 🐠 +15 ball" });
      addRewards(15, 0);
    } else {
      playSound('incorrect');
      setFeedback({ isCorrect: false, text: "Bu baliqchada boshqa javob bor ekan. Boshqa baliqni tutib ko'ramiz! 🧸" });
    }
  };

  // --- GAME 10: EMOJI REBUS ---
  const initRebusGame = () => {
    const REBUSES = [
      { formula: "❄️ + ⛄ = ?", answer: 'Qorbobo', options: ['Qorbobo', 'Quyosh', 'Muzqaymoq'] },
      { formula: "🍌 + 🐒 = ?", answer: 'Maymun', options: ['Kuchuk', 'Maymun', 'Ayiqcha'] },
      { formula: "🚗 + 🌧️ = ?", answer: 'Yomg\'irda qolgan mashina', options: ['Yomg\'irda qolgan mashina', 'Uchoq', 'Tezlik'] },
      { formula: "🥛 + 🐮 = ?", answer: 'Sut', options: ['Suv', 'Sut', 'Sharbat'] },
    ];
    const item = REBUSES[Math.floor(Math.random() * REBUSES.length)];
    setGameState({ item });
    setFeedback(null);
    speakText(`Sehrli rasmlarni bir-biriga qo'shganda nima hosil bo'ladi? Jumboqni yeching!`);
  };

  const chooseRebus = (opt: string) => {
    if (opt === gameState.item.answer) {
      playSound('correct');
      setFeedback({ isCorrect: true, text: "Barakalla! Jumboqni to'g'ri yechdingiz! Siz o'ta zukko bolajonsiz! 🧩 +20 ball" });
      addRewards(20, 0);
    } else {
      playSound('incorrect');
      setFeedback({ isCorrect: false, text: "Yo'q, bu boshqa narsa bo'lardi! Yana bir bor diqqat qilib ko'ring! 🧸" });
    }
  };

  // Auto initialize game once selected
  useEffect(() => {
    if (!selectedGameId) return;
    setFeedback(null);
    if (selectedGameId === 'sounds') initSoundsGame();
    if (selectedGameId === 'colors') initColorsGame();
    if (selectedGameId === 'balloons') initBalloonsGame();
    if (selectedGameId === 'planets') initPlanetsGame();
    if (selectedGameId === 'fruits') initFruitsGame();
    if (selectedGameId === 'xylophone') initXylophoneGame();
    if (selectedGameId === 'balance') initBalanceGame();
    if (selectedGameId === 'clock') initClockGame();
    if (selectedGameId === 'fishing') initFishingGame();
    if (selectedGameId === 'rebus') initRebusGame();
  }, [selectedGameId]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6" id="mini-games-arcade-page">
      {/* Top Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={initialGameId ? onBack : (selectedGameId ? () => setSelectedGameId(null) : onBack)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-full font-bold transition kid-button"
        >
          <ArrowLeft size={18} /> {initialGameId ? 'Orqaga' : (selectedGameId ? 'O\'yinlar Sandig\'iga' : 'Orqaga')}
        </button>

        <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full font-bold shadow-md">
          <Star className="fill-amber-400 text-amber-400" size={18} />
          <span>{profile.stars}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedGameId ? (
          /* GAMES MENU GRID */
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="glass-panel-heavy rounded-3xl p-6 border-white/25 text-center text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
              <h2 className="font-display font-black text-2xl md:text-3xl text-yellow-300 mb-1.5 flex items-center justify-center gap-2">
                🎮 Sehrli O'yinlar Sandig'i
              </h2>
              <p className="text-sm font-medium text-indigo-100 max-w-lg mx-auto">
                Yangi quvnoq va aqlli 10 xil qiziqarli mini o'yinlar bilan fikrlashni, hisoblashni va dunyoni o'rganing! 🌟
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MICRO_GAMES_LIST.map((game, idx) => (
                <motion.div
                  key={game.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => {
                    playSound('click');
                    setSelectedGameId(game.id);
                  }}
                  className={`bg-gradient-to-br ${game.colorClass} text-white p-5 rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition duration-300 flex flex-col justify-between border border-white/10 relative overflow-hidden group`}
                >
                  <div className="absolute -right-3 -bottom-3 text-7xl opacity-15 group-hover:scale-110 transition duration-300 select-none">
                    {game.emoji}
                  </div>

                  <div>
                    <span className="text-[10px] bg-white/20 border border-white/15 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mb-3.5 inline-block">
                      O'yin #{idx + 1}
                    </span>
                    <h3 className="font-display font-black text-xl mb-1.5 flex items-center gap-2">
                      <span>{game.emoji}</span>
                      <span>{game.nameUz}</span>
                    </h3>
                    <p className="text-white/80 text-xs font-medium leading-relaxed font-sans">
                      {game.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-bold">
                    <span>O'ynashga tayyormisiz?</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-white hover:bg-white text-indigo-950 hover:text-indigo-950 transition">Kiring 🌟</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ACTIVE GAME VIEW */
          <motion.div
            key="game-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-panel-heavy rounded-3xl p-6 md:p-8 border-white/25 text-white shadow-2xl relative overflow-hidden min-h-[450px] flex flex-col justify-between"
          >
            {/* Top Game Details */}
            <div className="border-b border-white/10 pb-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                  Faol dars daxli o'yini:
                </span>
                <h2 className="font-display font-black text-2xl text-white flex items-center gap-2">
                  {MICRO_GAMES_LIST.find(g => g.id === selectedGameId)?.emoji} {MICRO_GAMES_LIST.find(g => g.id === selectedGameId)?.nameUz}
                </h2>
              </div>
              <button
                onClick={() => {
                  playSound('click');
                  setSelectedGameId(selectedGameId); // triggers state rebuild
                }}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white hover:text-yellow-300 transition"
                title="Qayta yuklash"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {/* Game Content Rendering Box */}
            <div className="flex-1 flex flex-col justify-center items-center py-4">

              {/* GAME 1: ANIMAL SOUNDS MATCHING */}
              {selectedGameId === 'sounds' && gameState.question && (
                <div className="text-center space-y-6 w-full max-w-md">
                  <div className="bg-indigo-950/60 p-6 rounded-3xl border border-white/10 text-xl font-bold text-indigo-50 leading-relaxed shadow-inner">
                    {gameState.question.soundText}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {gameState.question.options.map((opt: any) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSoundsAnswer(opt.id)}
                        disabled={!!feedback}
                        className="p-4 bg-white/5 border border-white/10 hover:bg-white/15 hover:border-pink-500 rounded-3xl text-center transition flex flex-col items-center justify-center gap-1.5"
                      >
                        <span className="text-4xl">{opt.emoji}</span>
                        <span className="text-xs font-bold text-indigo-100">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* GAME 2: COLOR MIXER */}
              {selectedGameId === 'colors' && gameState.item && (
                <div className="text-center space-y-6 w-full max-w-lg">
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <div 
                      className="w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: gameState.item.bgTarget }}
                    >
                      <span className="bg-slate-900/80 text-white px-2 py-0.5 rounded-full">{gameState.item.target}</span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-indigo-100">
                    Quyidagi qaysi ikki rangni birlashtirish kerak?
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Qizil ❤️', 'Sariq 💛', 'Ko\'k 💙', 'Oq 🤍'].map((color) => {
                      const isSelected = gameState.selected1 === color || gameState.selected2 === color;
                      return (
                        <button
                          key={color}
                          onClick={() => selectMixColor(color)}
                          disabled={!!feedback}
                          className={`p-3 rounded-2xl font-bold text-xs border transition ${
                            isSelected 
                              ? 'bg-pink-500 border-pink-400 text-white scale-105' 
                              : 'bg-white/5 border-white/10 hover:bg-white/10 text-indigo-100'
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>

                  {gameState.selected1 && (
                    <div className="text-xs font-bold text-indigo-300">
                      Tanlangan: {gameState.selected1} {gameState.selected2 ? `+ ${gameState.selected2}` : '+ ?'}
                    </div>
                  )}
                </div>
              )}

              {/* GAME 3: BALLOON POPPER */}
              {selectedGameId === 'balloons' && gameState.target && (
                <div className="w-full text-center space-y-4">
                  <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-bold">
                    Rangini toping: <span className="text-yellow-300 underline font-black">{gameState.target.name}</span> pufaklar
                  </div>

                  <div className="h-64 bg-indigo-950/40 rounded-3xl border border-white/10 relative overflow-hidden shadow-inner">
                    {gameState.balloons.map((ball: any) => (
                      <motion.div
                        key={ball.id}
                        onClick={() => popBalloon(ball.id)}
                        className={`absolute cursor-pointer flex flex-col items-center justify-center select-none text-center ${ball.popped ? 'scale-0' : 'scale-100'}`}
                        style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
                        animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
                        transition={{ duration: 3 + (ball.id % 3), repeat: Infinity, ease: "easeInOut" }}
                      >
                        <div className={`w-12 h-14 rounded-full ${ball.color} flex items-center justify-center text-xl shadow-lg border border-white/20`}>
                          🎈
                        </div>
                        <div className="w-0.5 h-6 bg-white/30" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* GAME 4: PLANET SORTING */}
              {selectedGameId === 'planets' && gameState.selected && (
                <div className="text-center space-y-6 w-full max-w-md">
                  <p className="text-sm font-bold text-indigo-200">
                    Sizning tartibingiz:
                  </p>
                  
                  <div className="flex gap-2.5 justify-center min-h-[50px] bg-white/5 border border-white/10 rounded-2xl p-3 items-center">
                    {gameState.ordered.map((p: any, i: number) => (
                      <div key={i} className="bg-pink-500/30 border border-pink-400/30 px-3.5 py-1 rounded-full text-xs font-black">
                        {i + 1}. {p.name}
                      </div>
                    ))}
                    {gameState.ordered.length === 0 && (
                      <span className="text-xs text-indigo-300">Planetlarni tanlab bosing...</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {gameState.selected.map((planet: any) => {
                      const isChosen = gameState.ordered.some((p: any) => p.name === planet.name);
                      return (
                        <button
                          key={planet.name}
                          onClick={() => orderPlanet(planet)}
                          disabled={isChosen || !!feedback}
                          className={`p-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-center font-bold text-xs transition ${
                            isChosen ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className="block text-2xl mb-1 select-none">🪐</span>
                          <span>{planet.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* GAME 5: FRUIT CATCHER */}
              {selectedGameId === 'fruits' && gameState.grid && (
                <div className="text-center space-y-4 w-full max-w-sm">
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-200 px-1">
                    <span>Sog'lom poygachi</span>
                    <span>Ball: <span className="text-yellow-300 text-sm font-black">{gameState.score}</span></span>
                  </div>

                  <div className="grid grid-cols-3 gap-3.5">
                    {gameState.grid.map((cell: any) => (
                      <button
                        key={cell.id}
                        onClick={() => clickFruitItem(cell.id)}
                        disabled={cell.clicked || !!feedback}
                        className={`aspect-square rounded-2xl border transition duration-300 text-4xl flex items-center justify-center ${
                          cell.clicked
                            ? 'bg-emerald-500/20 border-emerald-500/30 opacity-30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 active:scale-95'
                        }`}
                      >
                        {!cell.clicked && cell.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* GAME 6: PLAYABLE XYLOPHONE */}
              {selectedGameId === 'xylophone' && (
                <div className="w-full text-center space-y-6">
                  <div className="h-10 bg-indigo-950/60 rounded-xl border border-white/10 px-4 flex items-center justify-between text-xs font-bold text-indigo-200">
                    <span>Notalar:</span>
                    <span>{gameState.lastKey ? `Oxirgi: ${gameState.lastKey} 🎵` : 'Chaling...'}</span>
                  </div>

                  <div className="flex items-stretch justify-center gap-1.5 h-56 max-w-md mx-auto">
                    {XYLO_KEYS.map((k) => (
                      <motion.button
                        key={k.note}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => playNote(k.pitch, k.label)}
                        className={`flex-1 rounded-b-2xl border-x border-b border-white/20 shadow-lg flex flex-col justify-end items-center pb-4 cursor-pointer font-bold transition hover:brightness-110 ${k.color}`}
                        style={{ height: k.note.startsWith('C2') ? '90%' : k.note.startsWith('B') ? '92%' : k.note.startsWith('A') ? '94%' : '100%' }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-white/40 mb-3" />
                        <span className="text-[10px] uppercase font-black tracking-wider select-none">{k.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* GAME 7: WEIGHT BALANCER */}
              {selectedGameId === 'balance' && gameState.item && (
                <div className="text-center space-y-6 w-full max-w-md">
                  <div className="flex justify-center items-center gap-8 py-4">
                    <button
                      onClick={() => chooseBalance(true)}
                      disabled={!!feedback}
                      className="p-5 bg-white/5 border border-white/10 hover:border-pink-500 rounded-3xl transition flex flex-col items-center flex-1"
                    >
                      <span className="text-4xl mb-2">👈</span>
                      <span className="text-sm font-black">{gameState.item.left}</span>
                    </button>

                    <div className="text-4xl text-amber-300">⚖️</div>

                    <button
                      onClick={() => chooseBalance(false)}
                      disabled={!!feedback}
                      className="p-5 bg-white/5 border border-white/10 hover:border-pink-500 rounded-3xl transition flex flex-col items-center flex-1"
                    >
                      <span className="text-4xl mb-2">👉</span>
                      <span className="text-sm font-black">{gameState.item.right}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* GAME 8: CLOCK LEARNER */}
              {selectedGameId === 'clock' && gameState.hour && (
                <div className="text-center space-y-6 w-full max-w-md">
                  <div className="bg-indigo-950/60 border border-white/10 p-4 rounded-2xl inline-block text-lg font-black text-yellow-300">
                    Soat: <span className="underline">{gameState.hour}:00</span> ni toping!
                  </div>

                  {/* Retro Clock Graphic */}
                  <div className="w-40 h-40 rounded-full border-4 border-indigo-400 bg-white/10 mx-auto relative flex items-center justify-center">
                    {/* Numbers around the clock */}
                    <span className="absolute top-2 font-bold text-xs text-white">12</span>
                    <span className="absolute right-3 font-bold text-xs text-white">3</span>
                    <span className="absolute bottom-2 font-bold text-xs text-white">6</span>
                    <span className="absolute left-3 font-bold text-xs text-white">9</span>

                    {/* Clock center point */}
                    <div className="w-3 h-3 rounded-full bg-pink-500 z-10" />

                    {/* Hour Hand */}
                    <div 
                      className="absolute w-1 h-12 bg-pink-500 origin-bottom rounded-full"
                      style={{ 
                        transform: `rotate(${gameState.currentHour * 30}deg)`,
                        bottom: '50%'
                      }}
                    />

                    {/* Minute Hand (fixed at 12) */}
                    <div className="absolute w-0.5 h-16 bg-white/60 origin-bottom" style={{ bottom: '50%' }} />
                  </div>

                  <div className="flex justify-center gap-3 items-center">
                    <button
                      onClick={() => changeClockHour(-1)}
                      disabled={!!feedback}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold"
                    >
                      ◀ O'rtoqqa
                    </button>
                    <span className="text-xl font-black">{gameState.currentHour}:00</span>
                    <button
                      onClick={() => changeClockHour(1)}
                      disabled={!!feedback}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold"
                    >
                      O'ngga ▶
                    </button>
                  </div>

                  {!feedback && (
                    <button
                      onClick={checkClockAnswer}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-black text-sm shadow-md"
                    >
                      Tekshirish ⏰
                    </button>
                  )}
                </div>
              )}

              {/* GAME 9: MATH FISHING */}
              {selectedGameId === 'fishing' && gameState.sumText && (
                <div className="text-center space-y-6 w-full max-w-md">
                  <div className="bg-sky-950/60 border border-white/10 p-5 rounded-3xl text-2xl font-black text-indigo-100 shadow-inner">
                    {gameState.sumText}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
                    {gameState.options.map((opt: number, idx: number) => (
                      <motion.button
                        key={idx}
                        onClick={() => catchFish(opt)}
                        disabled={!!feedback}
                        whileHover={{ y: -8 }}
                        className="px-6 py-4 bg-gradient-to-br from-sky-500 to-indigo-600 border border-white/10 hover:border-pink-500 text-white rounded-3xl flex items-center justify-center gap-2 font-black text-lg shadow-lg"
                      >
                        <span className="text-2xl select-none animate-bounce">🐠</span>
                        <span>Javob: {opt}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* GAME 10: EMOJI REBUS */}
              {selectedGameId === 'rebus' && gameState.item && (
                <div className="text-center space-y-6 w-full max-w-md">
                  <div className="bg-indigo-950/60 border border-white/10 p-6 rounded-3xl text-4xl select-none font-bold text-center">
                    {gameState.item.formula}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {gameState.item.options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => chooseRebus(opt)}
                        disabled={!!feedback}
                        className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500 rounded-2xl text-center font-bold text-sm transition"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Feedback Banner */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`mt-6 border p-4 rounded-2xl flex items-start gap-3 shadow-lg relative ${
                    feedback.isCorrect
                      ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-100'
                      : 'bg-red-500/20 border-red-500/35 text-red-100'
                  }`}
                >
                  <div className="text-2xl">
                    {feedback.isCorrect ? '🎉' : '🧸'}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider">
                      {feedback.isCorrect ? "Mukammal Natija!" : "Salkim To'g'ri..."}
                    </p>
                    <p className="text-xs font-semibold leading-relaxed mt-0.5">
                      {feedback.text}
                    </p>
                  </div>
                  {feedback.isCorrect && (
                    <button
                      onClick={() => speakText(feedback.text)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition self-center"
                      title="Eshitish"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                  {/* Next Question / Next Stage Button */}
                  <button
                    onClick={() => {
                      playSound('click');
                      setFeedback(null);
                      // Re-trigger game initialize
                      setSelectedGameId(selectedGameId);
                    }}
                    className="ml-auto px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-xs font-extrabold rounded-full transition"
                  >
                    {feedback.isCorrect ? 'Keyingisi ▶' : 'Qayta urinish 🔄'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
