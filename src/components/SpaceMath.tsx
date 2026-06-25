/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Star, Volume2, VolumeX, ShieldAlert, CheckCircle, ArrowLeft, RotateCcw, Flame } from 'lucide-react';
import { MathQuestion, UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface SpaceMathProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

export default function SpaceMath({ profile, updateProfile, onBack }: SpaceMathProps) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [laserFired, setLaserFired] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [localStreak, setLocalStreak] = useState<number>(0);

  // Generate a random math question based on difficulty
  const generateQuestion = (diff: 'easy' | 'medium' | 'hard'): MathQuestion => {
    let num1 = 0;
    let num2 = 0;
    let operator: '+' | '-' | '×' = '+';
    let answer = 0;

    if (diff === 'easy') {
      // Simple addition & subtraction up to 10
      operator = Math.random() > 0.5 ? '+' : '-';
      if (operator === '+') {
        num1 = Math.floor(Math.random() * 6) + 1; // 1 to 6
        num2 = Math.floor(Math.random() * 4) + 1; // 1 to 4
        answer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * 6) + 5; // 5 to 10
        num2 = Math.floor(Math.random() * num1);  // 0 to num1
        answer = num1 - num2;
      }
    } else if (diff === 'medium') {
      // Addition & subtraction up to 20
      operator = Math.random() > 0.5 ? '+' : '-';
      if (operator === '+') {
        num1 = Math.floor(Math.random() * 11) + 5; // 5 to 15
        num2 = Math.floor(Math.random() * 10) + 1; // 1 to 10
        answer = num1 + num2;
      } else {
        num1 = Math.floor(Math.random() * 11) + 10; // 10 to 20
        num2 = Math.floor(Math.random() * 9) + 1; // 1 to 9
        answer = num1 - num2;
      }
    } else {
      // Multiplication up to 10
      operator = '×';
      num1 = Math.floor(Math.random() * 9) + 2; // 2 to 10
      num2 = Math.floor(Math.random() * 8) + 2; // 2 to 9
      answer = num1 * num2;
    }

    // Generate options
    const optionsSet = new Set<number>();
    optionsSet.add(answer);

    while (optionsSet.size < 3) {
      const offset = Math.floor(Math.random() * 9) - 4; // -4 to 4
      const wrongAnswer = answer + offset;
      if (wrongAnswer >= 0 && wrongAnswer !== answer) {
        optionsSet.add(wrongAnswer);
      }
    }

    // Sort options randomly
    const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

    return { num1, num2, operator, options, answer };
  };

  const handleStart = (diff: 'easy' | 'medium' | 'hard') => {
    playSound('click');
    setDifficulty(diff);
    setCurrentQuestion(generateQuestion(diff));
    setQuestionCount(1);
    setCorrectCount(0);
    setSelectedAnswer(null);
    setLaserFired(false);
    setShowResult(false);
    setFeedback(null);
    setLocalStreak(0);
  };

  const handleAnswer = (option: number) => {
    if (selectedAnswer !== null) return; // Prevent double clicking

    setSelectedAnswer(option);
    const isCorrect = option === currentQuestion?.answer;

    if (isCorrect) {
      playSound('laser');
      setLaserFired(true);
      setFeedback('correct');
      setCorrectCount(prev => prev + 1);
      setLocalStreak(prev => prev + 1);

      // Reward points and stars
      const ptsReward = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20;
      const starReward = 1;
      
      setTimeout(() => {
        playSound('correct');
      }, 300);

      // Save to profile
      updateProfile({
        points: profile.points + ptsReward,
        stars: profile.stars + starReward,
        streak: Math.max(profile.streak, localStreak + 1),
      });

    } else {
      playSound('incorrect');
      setFeedback('incorrect');
      setLocalStreak(0);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (questionCount < 10) {
        setDifficulty(prev => {
          if (prev) {
            setCurrentQuestion(generateQuestion(prev));
          }
          return prev;
        });
        setQuestionCount(prev => prev + 1);
        setSelectedAnswer(null);
        setLaserFired(false);
        setFeedback(null);
      } else {
        setShowResult(true);
        playSound('success');
        
        // Unlock Matematika Qiroli badge if got 10/10 on Medium/Hard
        if (correctCount >= 9 && !profile.badges.includes('math_king')) {
          updateProfile({
            badges: [...profile.badges, 'math_king']
          });
        }
      }
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6" id="space-math-module">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-full font-bold transition kid-button"
        >
          <ArrowLeft size={18} /> Orqaga
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full font-bold shadow-md">
            <Star className="fill-amber-400 text-amber-400" size={18} />
            <span>{profile.stars}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-400/30 text-red-300 px-3.5 py-1.5 rounded-full font-bold shadow-md">
            <Flame className="fill-red-400 text-red-400 animate-pulse" size={18} />
            <span>{localStreak || profile.streak}</span>
          </div>
        </div>
      </div>

      {!difficulty && !showResult ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-center border-white/25"
        >
          <div className="inline-block p-4 bg-sky-500/20 border border-sky-400/30 rounded-full text-sky-300 mb-4 animate-bounce">
            <Rocket size={48} />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Kosmik Matematika
          </h2>
          <p className="text-indigo-100/90 mb-6 max-w-md mx-auto text-base">
            Koinot kemasini asteroidlardan himoya qiling! Misollarni to'g'ri yechib, dushman toshlarini yo'q qiling va ballar to'plang!
          </p>

          <h3 className="font-semibold text-indigo-200 mb-4 text-lg">
            Qiyinchilik darajasini tanlang:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <button
              onClick={() => handleStart('easy')}
              className="flex flex-col items-center p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-300 transition kid-button font-sans"
            >
              <span className="font-display font-bold text-xl mb-1 text-white">Oson 🌱</span>
              <span className="text-xs text-emerald-200/80 font-medium">10 gacha bo'lgan sonlar (+, -)</span>
            </button>
            <button
              onClick={() => handleStart('medium')}
              className="flex flex-col items-center p-4 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/40 rounded-2xl text-sky-300 transition kid-button font-sans"
            >
              <span className="font-display font-bold text-xl mb-1 text-white">O'rtacha 🚀</span>
              <span className="text-xs text-sky-200/80 font-medium">20 gacha bo'lgan sonlar (+, -)</span>
            </button>
            <button
              onClick={() => handleStart('hard')}
              className="flex flex-col items-center p-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/40 rounded-2xl text-purple-300 transition kid-button font-sans"
            >
              <span className="font-display font-bold text-xl mb-1 text-white">Qiyin ☄️</span>
              <span className="text-xs text-purple-200/80 font-medium">Ko'paytirish jadvali (2-9)</span>
            </button>
          </div>
        </motion.div>
      ) : showResult ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel-heavy rounded-3xl p-6 md:p-8 shadow-2xl text-center border-emerald-500/30"
        >
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Sayohat Yakunlandi!
          </h2>
          <p className="text-indigo-100/90 mb-6 max-w-md mx-auto">
            Koinot kemangiz barcha xavflarni aylanib o'tdi! Ajoyib natija!
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-sm mx-auto mb-6 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Yechilgan misollar</div>
              <div className="text-2xl font-black font-display text-white">{correctCount} / 10</div>
            </div>
            <div>
              <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Yulduzlar</div>
              <div className="text-2xl font-black font-display text-yellow-300 flex items-center justify-center gap-1">
                <Star className="fill-yellow-400 text-yellow-400" size={20} />
                <span>+{correctCount}</span>
              </div>
            </div>
          </div>

          {correctCount >= 9 && !profile.badges.includes('math_king') && (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-purple-500/20 border border-purple-400/30 rounded-2xl p-4 max-w-md mx-auto mb-6 flex items-center gap-3 text-left"
            >
              <div className="text-3xl p-2 bg-purple-500/30 rounded-full">👑</div>
              <div>
                <h4 className="font-bold text-purple-300">Yangi Nishon Unlocked!</h4>
                <p className="text-xs text-purple-200/80">Matematika Qiroli nishoniga sazovor bo'ldingiz!</p>
              </div>
            </motion.div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setDifficulty(null);
                setShowResult(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-sky-400 to-indigo-500 hover:brightness-110 text-white font-bold rounded-2xl shadow-lg transition kid-button border border-white/20"
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Space Combat Canvas */}
          <div className="md:col-span-2 bg-indigo-950/40 backdrop-blur-xl rounded-3xl p-4 h-96 relative overflow-hidden flex flex-col justify-between border border-white/20 shadow-2xl">
            {/* Background stars */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
            
            {/* Top Info Bar */}
            <div className="relative z-10 flex justify-between items-center text-white text-xs font-mono">
              <span className="bg-slate-900/80 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                Savol: {questionCount} / 10
              </span>
              <span className="bg-slate-900/80 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-1 text-emerald-400 font-bold">
                To'g'ri: {correctCount}
              </span>
            </div>

            {/* Middle: Equations & Flying Asteroids */}
            <div className="relative flex-1 flex flex-col items-center justify-center">
              {currentQuestion && (
                <div className="relative text-center z-10">
                  {/* The math problem board */}
                  <motion.div
                    key={questionCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-indigo-950/90 border-2 border-indigo-400/50 rounded-2xl px-8 py-4 text-white shadow-xl shadow-indigo-500/20 backdrop-blur-md"
                  >
                    <div className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest mb-1">
                      Misolni yeching
                    </div>
                    <div className="text-4xl md:text-5xl font-display font-bold tracking-wide">
                      {currentQuestion.num1} {currentQuestion.operator} {currentQuestion.num2} = ?
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Laser beam effect */}
              <AnimatePresence>
                {laserFired && (
                  <motion.div
                    initial={{ height: 0, opacity: 1, y: 100 }}
                    animate={{ height: 200, opacity: 1, y: -50 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute w-1.5 bg-cyan-400 rounded-full shadow-[0_0_15px_#22d3ee] z-20"
                  />
                )}
              </AnimatePresence>

              {/* Exploding feedback */}
              <AnimatePresence>
                {feedback === 'correct' && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1.5, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute z-30 text-4xl"
                  >
                    💥
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Rocket Ship representation */}
            <div className="relative z-10 flex justify-center pb-2">
              <motion.div
                animate={
                  feedback === 'incorrect'
                    ? { x: [-10, 10, -10, 10, 0] }
                    : feedback === 'correct'
                    ? { y: [0, -15, 0] }
                    : { y: [0, -3, 0] }
                }
                transition={
                  feedback === 'incorrect'
                    ? { duration: 0.4 }
                    : feedback === 'correct'
                    ? { duration: 0.4 }
                    : { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                }
                className={`p-3 rounded-full ${
                  feedback === 'correct'
                    ? 'bg-cyan-500/20 border-2 border-cyan-400'
                    : feedback === 'incorrect'
                    ? 'bg-red-500/20 border-2 border-red-400'
                    : 'bg-indigo-500/10 border border-indigo-400/50'
                } relative`}
              >
                <Rocket className="text-cyan-400 h-12 w-12 transform -rotate-45" />
                {/* Exhaust flames */}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-5 bg-orange-500 rounded-full animate-pulse opacity-80" />
              </motion.div>
            </div>
          </div>

          {/* Right sidebar / Answers Board */}
          <div className="flex flex-col gap-4">
            <div className="glass-panel rounded-3xl p-4 shadow-2xl flex-1 flex flex-col justify-between border-white/20">
              <div>
                <h4 className="font-display font-bold text-white text-lg mb-1">
                  Javobingizni Tanlang
                </h4>
                <p className="text-xs text-indigo-200/80 mb-4">
                  To'g'ri raqam ustiga bosib koinot toshini yakson qiling!
                </p>

                <div className="flex flex-col gap-3">
                  {currentQuestion?.options.map((option, idx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption = option === currentQuestion.answer;
                    
                    let btnStyle = "bg-white/5 hover:bg-white/10 text-white border-white/10";
                    if (selectedAnswer !== null) {
                      if (isCorrectOption) {
                        btnStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                      } else if (isSelected) {
                        btnStyle = "bg-rose-500/20 text-rose-300 border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
                      } else {
                        btnStyle = "bg-white/2 opacity-30 text-white/30 border-white/5";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedAnswer !== null}
                        onClick={() => handleAnswer(option)}
                        className={`w-full p-4 rounded-2xl border-b-4 font-display font-bold text-2xl flex items-center justify-between transition-all duration-200 ${btnStyle} ${
                          selectedAnswer === null ? 'active:translate-y-1 hover:-translate-y-0.5' : ''
                        }`}
                      >
                        <span className="bg-white/10 border border-white/10 h-8 w-8 text-xs font-mono flex items-center justify-center rounded-full mr-3 text-white">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 text-center pr-8">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Message */}
              <div className="h-16 flex items-center justify-center text-center mt-4">
                <AnimatePresence mode="wait">
                  {feedback === 'correct' && (
                    <motion.div
                      key="correct-text"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-emerald-300 font-bold flex items-center gap-1.5 text-base"
                    >
                      <CheckCircle className="text-emerald-400" size={20} />
                      Barakalla! To'g'ri topdingiz! 🎉
                    </motion.div>
                  )}
                  {feedback === 'incorrect' && (
                    <motion.div
                      key="incorrect-text"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-rose-300 font-bold flex items-center gap-1.5 text-base"
                    >
                      <ShieldAlert className="text-rose-400" size={20} />
                      Ouy, qayta urinib ko'ring! 🧐
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
