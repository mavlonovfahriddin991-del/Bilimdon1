/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, RefreshCw, Award } from 'lucide-react';
import { MemoryCard, UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface MemoryGameProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

const EMOJIS_POOL = ['🐼', '🦊', '🐸', '🐵', '🦄', '🦖', '🐝', '🦁'];

export default function MemoryGame({ profile, updateProfile, onBack }: MemoryGameProps) {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [matchesCount, setMatchesCount] = useState<number>(0);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  // Initialize and shuffle cards
  const initGame = () => {
    playSound('click');
    const shuffledEmojis = [...EMOJIS_POOL, ...EMOJIS_POOL]
      .sort(() => Math.random() - 0.5);

    const initialCards: MemoryCard[] = shuffledEmojis.map((emoji, idx) => ({
      id: idx,
      uniqueId: Math.random(),
      emoji,
      isFlipped: false,
      isMatched: false,
    }));

    setCards(initialCards);
    setSelectedCards([]);
    setMovesCount(0);
    setMatchesCount(0);
    setGameFinished(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (clickedId: number) => {
    // If already flipped, matched, or 2 cards are already selected, ignore
    if (
      cards[clickedId].isFlipped ||
      cards[clickedId].isMatched ||
      selectedCards.length >= 2
    ) {
      return;
    }

    playSound('flip');

    // Flip selected card
    setCards(prev =>
      prev.map(card => (card.id === clickedId ? { ...card, isFlipped: true } : card))
    );

    const newSelected = [...selectedCards, clickedId];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setMovesCount(prev => prev + 1);
      const [firstId, secondId] = newSelected;
      const firstCard = cards[firstId];
      const secondCard = cards[secondId];

      if (firstCard.emoji === secondCard.emoji) {
        // MATCH FOUND
        setTimeout(() => {
          playSound('correct');
          setCards(prev =>
            prev.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatchesCount(prev => {
            const nextMatches = prev + 1;
            if (nextMatches === EMOJIS_POOL.length) {
              setGameFinished(true);
              playSound('success');

              // Update profile stats
              const updatedBadges = [...profile.badges];
              if (!updatedBadges.includes('memory_champion')) {
                updatedBadges.push('memory_champion');
              }

              updateProfile({
                stars: profile.stars + 5,
                points: profile.points + 50,
                badges: updatedBadges,
              });
            }
            return nextMatches;
          });
          setSelectedCards([]);
        }, 600);
      } else {
        // MISMATCH
        setTimeout(() => {
          playSound('incorrect');
          setCards(prev =>
            prev.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6" id="memory-game-module">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-full font-bold transition kid-button"
        >
          <ArrowLeft size={18} /> Orqaga
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 rounded-full font-bold text-sm shadow-md">
            <span>Urinishlar: {movesCount}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full font-bold shadow-md">
            <Star className="fill-amber-400 text-amber-400" size={18} />
            <span>{profile.stars}</span>
          </div>
        </div>
      </div>

      {/* Main Board */}
      {!gameFinished ? (
        <div className="glass-panel-heavy rounded-3xl p-6 md:p-8 shadow-2xl border-white/25 text-center text-white">
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Xotira O'yini 🧠
          </h2>
          <p className="text-indigo-100/90 mb-6 text-sm max-w-md mx-auto font-medium">
            Bir xil hayvonlar juftligini toping va xotirangizni sinab ko'ring! Qancha kam urinishda topsangiz, shuncha yaxshi.
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-md mx-auto mb-6">
            {cards.map(card => {
              const isRevealed = card.isFlipped || card.isMatched;

              return (
                <div
                  key={card.uniqueId}
                  onClick={() => handleCardClick(card.id)}
                  className="aspect-square w-full relative cursor-pointer group"
                  style={{ perspective: '1000px' }}
                >
                  <motion.div
                    animate={{ rotateY: isRevealed ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="w-full h-full absolute rounded-2xl select-none"
                  >
                    {/* Back Side (Unflipped) */}
                    <div
                      style={{ backfaceVisibility: 'hidden' }}
                      className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 border border-white/25 rounded-2xl flex items-center justify-center text-white text-3xl font-display font-black shadow-lg backdrop-blur-md"
                    >
                      ?
                    </div>

                    {/* Front Side (Flipped) */}
                    <div
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                      className={`absolute inset-0 border rounded-2xl flex items-center justify-center text-4xl shadow-2xl backdrop-blur-md ${
                        card.isMatched
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                          : 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                      }`}
                    >
                      {card.emoji}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          <button
            onClick={initGame}
            className="flex items-center gap-1.5 mx-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-2.5 rounded-full font-bold transition kid-button text-sm"
          >
            <RefreshCw size={16} /> Qaytadan boshlash
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel-heavy rounded-3xl p-6 md:p-8 shadow-2xl border-white/25 text-center text-white"
        >
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Ajoyib G'alaba!
          </h2>
          <p className="text-indigo-100/90 mb-6 max-w-md mx-auto font-medium">
            Siz barcha juftliklarni <b>{movesCount} ta</b> urinishda topdingiz! Xotirangiz nihoyatda o'tkir ekan!
          </p>

          <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-2xl p-5 max-w-xs mx-auto mb-6">
            <Award className="mx-auto text-emerald-400 mb-2 h-12 w-12 animate-pulse" />
            <h4 className="font-bold text-white">Xotira Chempioni</h4>
            <p className="text-xs text-indigo-200">Yangi nishon va 50 ball qo'shildi!</p>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={initGame}
              className="px-6 py-3 bg-gradient-to-r from-sky-400 to-indigo-500 hover:brightness-110 border border-white/20 text-white font-bold rounded-2xl shadow-lg transition kid-button"
            >
              Qaytadan o'ynash
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
