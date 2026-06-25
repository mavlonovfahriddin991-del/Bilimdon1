/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Compass, AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react';
import { Planet, UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface SpaceTravelProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

const PLANETS_DATA: Planet[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    uzName: 'Merkuriy',
    color: 'from-gray-400 to-gray-600',
    size: 24,
    distance: 'Quyoshga eng yaqin',
    facts: [
      "Merkuriy Quyoshga eng yaqin sayyora hisoblanadi va u juda tez aylanadi.",
      "U yerda havo (atmosfera) yo'q, shuning uchun kunduzi juda issiq, kechasi esa juda sovuq bo'ladi!",
      "Merkuriy sayyorasida umuman yo'ldoshlar (oylar) mavjud emas."
    ],
    quizQuestion: "Merkuriy Quyoshga yaqinligi bo'yicha nechanchi o'rinda turadi?",
    quizOptions: ["1-o'rinda", "2-o'rinda", "3-o'rinda"],
    quizAnswer: "1-o'rinda",
    x: 15,
    y: 50
  },
  {
    id: 'venus',
    name: 'Venus',
    uzName: 'Venera',
    color: 'from-amber-300 to-orange-500',
    size: 32,
    distance: 'Eng issiq sayyora',
    facts: [
      "Venera Quyosh tizimidagi eng issiq sayyoradir, u yerdagi harorat 460°C gacha yetadi!",
      "U osmonda juda yorqin porlaydi va uni ba'zan 'Tong yulduzi' deb ham atashadi.",
      "Venera boshqa barcha sayyoralarga teskari yo'nalishda (soat mili bo'yicha) aylanadi."
    ],
    quizQuestion: "Nima uchun Venera eng issiq sayyora hisoblanadi?",
    quizOptions: ["U eng katta bo'lgani uchun", "Uning quyuq bulutlari issiqlikni ushlab qoladi", "U Quyoshga eng yaqin bo'lgani uchun"],
    quizAnswer: "Uning quyuq bulutlari issiqlikni ushlab qoladi",
    x: 27,
    y: 35
  },
  {
    id: 'earth',
    name: 'Earth',
    uzName: 'Yer',
    color: 'from-blue-400 via-emerald-400 to-indigo-600',
    size: 36,
    distance: 'Bizning uyimiz',
    facts: [
      "Yer - Quyosh tizimidagi hayot mavjud bo'lgan yagona ma'lum sayyoradir.",
      "Yer yuzining 70% qismi suv bilan qoplangan, shuning uchun u koinotdan ko'k rangda ko'rinadi.",
      "Yerning faqat bitta tabiiy yo'ldoshi bor, u ham bo'lsa OY!"
    ],
    quizQuestion: "Yer yuzasining necha foiz qismi suv bilan qoplangan?",
    quizOptions: ["50%", "70%", "90%"],
    quizAnswer: "70%",
    x: 40,
    y: 50
  },
  {
    id: 'mars',
    name: 'Mars',
    uzName: 'Mars',
    color: 'from-red-500 to-orange-800',
    size: 28,
    distance: 'Qizil sayyora',
    facts: [
      "Mars o'zining tuprog'idagi temir moddasi tufayli qizg'ish rangda ko'rinadi va 'Qizil sayyora' deyiladi.",
      "Marsda Quyosh tizimidagi eng baland vulqon tog'i - 'Olimp' bor. U Everestdan 3 marta baland!",
      "Marsda kelajakda insonlar yashashi mumkinligini o'rganish uchun u yerga robotlar yuborilgan."
    ],
    quizQuestion: "Mars sayyorasini yana qanday nomlashadi?",
    quizOptions: ["Ko'k sayyora", "Qizil sayyora", "Muz sayyorasi"],
    quizAnswer: "Qizil sayyora",
    x: 52,
    y: 40
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    uzName: 'Yupiter',
    color: 'from-orange-300 via-amber-600 to-yellow-800',
    size: 50,
    distance: 'Eng katta gigant',
    facts: [
      "Yupiter - Quyosh tizimidagi eng ulkan sayyora. U boshqa barcha sayyoralar yig'indisidan ham kattaroq!",
      "U ulkan gaz to'pidan iborat, ya'ni uning qattiq yer yuzasi yo'q.",
      "Yupiterda o'nlab oylar bor va undagi mashhur 'Katta Qizil Dog'' aslida yuzlab yillardan beri davom etayotgan ulkan bo'rondir."
    ],
    quizQuestion: "Yupiter sayyorasining qanday qattiq yer yuzasi bormi?",
    quizOptions: ["Ha, u toshloq", "Yo'q, u ulkan gaz to'pidan iborat", "U faqat muzdan iborat"],
    quizAnswer: "Yo'q, u ulkan gaz to'pidan iborat",
    x: 65,
    y: 55
  },
  {
    id: 'saturn',
    name: 'Saturn',
    uzName: 'Saturn',
    color: 'from-yellow-200 via-amber-400 to-orange-300',
    size: 44,
    distance: "Xalqali go'zal",
    facts: [
      "Saturn o'zining ajoyib va chiroyli halqalari bilan mashhur. Bu halqalar muz va tosh bo'laklaridan iborat.",
      "Saturn shunchalik yengilki, agar uni ulkan suv havzasiga solsangiz, u suv betida qalqib yurishi mumkin!",
      "Saturnda kuchli shamollar esadi, ularning tezligi soatiga 1800 kilometrgacha yetadi!"
    ],
    quizQuestion: "Saturnning chiroyli halqalari nimadan tashkil topgan?",
    quizOptions: ["Oltin va kumushdan", "Muz va tosh bo'laklaridan", "Faqatgina havodan"],
    quizAnswer: "Muz va tosh bo'laklaridan",
    x: 78,
    y: 35
  },
  {
    id: 'uran',
    name: 'Uran',
    uzName: 'Uran',
    color: 'from-teal-300 to-cyan-500',
    size: 34,
    distance: 'Yonga yotgan sayyora',
    facts: [
      "Uran muzli gigant bo'lib, juda sovuq. Undagi harorat -224°C gacha tushadi.",
      "U boshqa sayyoralardan farqli o'laroq, yonboshlab (dumalab) aylanadi.",
      "Uran chiroyli och ko'k rangga ega, chunki uning atmosferasida metan gazi bor."
    ],
    quizQuestion: "Uran sayyorasining o'ziga xos aylanish uslubi qanday?",
    quizOptions: ["Juda tez aylanadi", "Yonboshlab (dumalab) aylanadi", "Hech qachon aylanmaydi"],
    quizAnswer: "Yonboshlab (dumalab) aylanadi",
    x: 88,
    y: 48
  },
  {
    id: 'neptune',
    name: 'Neptune',
    uzName: 'Neptun',
    color: 'from-blue-600 to-indigo-900',
    size: 34,
    distance: "Eng uzoq va bo'ronli",
    facts: [
      "Neptun Quyoshdan eng uzoqda joylashgan va kashf etilgan oxirgi sayyoradir.",
      "U yerda koinotdagi eng dahshatli va kuchli shamollar esadi.",
      "U o'zining to'q ko'k rangi bilan ajralib turadi va u ham muzli gigant hisoblanadi."
    ],
    quizQuestion: "Quyosh tizimidagi eng uzoq sayyora qaysi?",
    quizOptions: ["Uran", "Saturn", "Neptun"],
    quizAnswer: "Neptun",
    x: 95,
    y: 38
  }
];

export default function SpaceTravel({ profile, updateProfile, onBack }: SpaceTravelProps) {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [exploredPlanets, setExploredPlanets] = useState<string[]>(() => {
    // Attempt to read from local storage or profile if exists
    return JSON.parse(localStorage.getItem('exploredPlanets') || '[]');
  });
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const handlePlanetClick = (planet: Planet) => {
    playSound('click');
    setSelectedPlanet(planet);
    setQuizAnswer(null);
    setQuizFeedback(null);
  };

  const handleAnswerQuiz = (option: string) => {
    if (!selectedPlanet || quizAnswer !== null) return;

    setQuizAnswer(option);
    const isCorrect = option === selectedPlanet.quizAnswer;

    if (isCorrect) {
      playSound('correct');
      setQuizFeedback('correct');

      // Add to explored list if not already there
      if (!exploredPlanets.includes(selectedPlanet.id)) {
        const newList = [...exploredPlanets, selectedPlanet.id];
        setExploredPlanets(newList);
        localStorage.setItem('exploredPlanets', JSON.stringify(newList));

        // Reward points and stars
        const ptsReward = 20;
        const starReward = 2;

        const updatedBadges = [...profile.badges];
        // Check if all planets explored
        if (newList.length === PLANETS_DATA.length && !updatedBadges.includes('space_explorer')) {
          updatedBadges.push('space_explorer');
          playSound('success');
        }

        updateProfile({
          points: profile.points + ptsReward,
          stars: profile.stars + starReward,
          badges: updatedBadges
        });
      }
    } else {
      playSound('incorrect');
      setQuizFeedback('incorrect');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6" id="space-travel-module">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-full font-bold transition kid-button"
        >
          <ArrowLeft size={18} /> Orqaga
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 px-4 py-1.5 rounded-full font-bold text-sm shadow-md flex items-center gap-1.5">
            <Compass className="animate-spin text-sky-400" size={16} style={{ animationDuration: '6s' }} />
            <span>O'rganildi: {exploredPlanets.length} / {PLANETS_DATA.length}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full font-bold shadow-md">
            <Star className="fill-amber-400 text-amber-400" size={18} />
            <span>{profile.stars}</span>
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          Koinot Sayohati 🪐
        </h2>
        <p className="text-indigo-100/90 max-w-lg mx-auto text-sm">
          Har bir sayyorani bosing, ular haqida qiziqarli ma'lumotlarni bilib oling va koinot savoliga javob berib yulduzlarni qo'lga kiriting!
        </p>
      </div>

      {/* Space Interactive Map Container */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-x-auto overflow-y-hidden border-white/20 shadow-2xl h-[400px] mb-8 select-none">
        {/* Deep space ambience */}
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        {/* Nebula gradients */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-purple-950/40 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-blue-950/40 rounded-full filter blur-3xl"></div>

        {/* Orbit Paths */}
        <div className="absolute inset-y-0 left-0 w-full flex items-center pointer-events-none">
          <div className="relative w-full h-full">
            {PLANETS_DATA.map((planet, index) => {
              // Draw orbital paths relative to a mock sun at coordinate (0, 50%)
              const radius = index * 11 + 10; // offset radius
              return (
                <div
                  key={`orbit-${planet.id}`}
                  className="absolute border border-white/10 rounded-full"
                  style={{
                    width: `${radius * 2}%`,
                    height: `${radius * 2}%`,
                    left: `-${radius}%`,
                    top: `${50 - radius}%`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* The SUN */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 shadow-[0_0_50px_rgba(234,179,8,0.5)] flex items-center justify-end pr-4 z-10">
          <span className="text-white font-display font-bold text-xs uppercase tracking-widest rotate-90 transform translate-x-3">
            Quyosh
          </span>
        </div>

        {/* Planets items container with proper positioning */}
        <div className="absolute inset-0 min-w-[900px] h-full flex items-center">
          {PLANETS_DATA.map((planet) => {
            const isExplored = exploredPlanets.includes(planet.id);
            
            return (
              <div
                key={planet.id}
                className="absolute cursor-pointer group flex flex-col items-center"
                style={{ left: `${planet.x}%`, top: `${planet.y}%` }}
                onClick={() => handlePlanetClick(planet)}
              >
                {/* Planet Sphere */}
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  className={`relative rounded-full bg-gradient-to-br ${planet.color} shadow-lg group-hover:shadow-indigo-500/30 transition-all`}
                  style={{ width: planet.size * 1.5, height: planet.size * 1.5 }}
                >
                  {/* Planet specific special features (like Saturn's Ring) */}
                  {planet.id === 'saturn' && (
                    <div className="absolute w-[180%] h-[30%] bg-amber-200/50 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-12 border border-amber-300 pointer-events-none" />
                  )}

                  {/* Exploration indicator badge */}
                  {isExplored && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow border border-white">
                      <CheckCircle size={10} className="fill-emerald-500 text-white" />
                    </div>
                  )}
                </motion.div>

                {/* Planet Name Label */}
                <span className="text-white/95 text-xs font-display font-medium mt-2 bg-indigo-950/80 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-md">
                  {planet.uzName}
                </span>
                <span className="text-[10px] text-indigo-200/80 italic mt-0.5 font-bold uppercase tracking-wider text-[8px]">
                  {planet.distance}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Planet Info Dialog / Quiz Section */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 glass-panel-heavy rounded-3xl p-6 md:p-8 shadow-2xl border-white/30 relative"
          >
            {/* Left Col: Planet Facts */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedPlanet.color} flex-shrink-0 shadow-lg`} />
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">
                    {selectedPlanet.uzName} sayyorasi
                  </h3>
                  <p className="text-xs text-sky-300 font-bold uppercase tracking-wider">
                    Koinot Sirlari
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedPlanet.facts.map((fact, index) => (
                  <div key={index} className="flex gap-2.5 items-start p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="p-1.5 bg-indigo-500/20 rounded-full text-indigo-300 mt-0.5 border border-indigo-400/20">
                      <Info size={14} />
                    </div>
                    <p className="text-sm text-indigo-100 leading-relaxed font-sans font-medium">
                      {fact}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Planet Quiz */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sky-300 font-bold mb-3 text-sm">
                  <HelpCircle size={18} />
                  <span>Koinot Savoli</span>
                </div>
                <h4 className="text-base font-bold text-white mb-4 leading-relaxed font-sans">
                  {selectedPlanet.quizQuestion}
                </h4>

                <div className="space-y-2.5">
                  {selectedPlanet.quizOptions.map((option, idx) => {
                    const isSelected = quizAnswer === option;
                    const isCorrectAnswer = option === selectedPlanet.quizAnswer;

                    let optStyle = "bg-white/5 hover:bg-white/10 border-white/10 text-white";
                    if (quizAnswer !== null) {
                      if (isCorrectAnswer) {
                        optStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                      } else if (isSelected) {
                        optStyle = "bg-rose-500/20 text-rose-300 border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
                      } else {
                        optStyle = "bg-white/2 opacity-30 text-white/30 border-white/5";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizAnswer !== null}
                        onClick={() => handleAnswerQuiz(option)}
                        className={`w-full text-left p-3.5 rounded-xl border font-sans font-semibold text-sm transition-all duration-200 ${optStyle} ${
                          quizAnswer === null ? 'hover:-translate-y-0.5 active:translate-y-0 shadow-sm' : ''
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quiz Feedback */}
              <div className="h-14 flex items-center justify-center mt-4">
                {quizFeedback === 'correct' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-emerald-300 font-bold flex items-center gap-1.5 text-sm"
                  >
                    <CheckCircle className="text-emerald-400" size={18} />
                    Super! To'g'ri topdingiz! (+20 ball, +2 ⭐️)
                  </motion.div>
                )}
                {quizFeedback === 'incorrect' && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-rose-300 font-bold flex items-center gap-1.5 text-sm"
                  >
                    <AlertCircle className="text-rose-400" size={18} />
                    Xato, sayyorani diqqat bilan o'qib chiqing va yana urining! 🪐
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
