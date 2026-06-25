/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  name: string;
  stars: number;
  points: number;
  streak: number;
  badges: string[];
  lastActive: string; // Date string
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Planet {
  id: string;
  name: string;
  uzName: string;
  color: string;
  size: number; // visual size
  distance: string;
  facts: string[];
  quizQuestion: string;
  quizOptions: string[];
  quizAnswer: string;
  x: number; // percentage coordinate on 2D space canvas
  y: number;
}

export interface WordPuzzle {
  id: string;
  uzName: string;
  enName: string;
  emoji: string;
  letters: string[];
}

export interface MathQuestion {
  num1: number;
  num2: number;
  operator: '+' | '-' | '×';
  options: number[];
  answer: number;
}

export interface MemoryCard {
  id: number;
  uniqueId: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface Riddle {
  id: string;
  question: string;
  answer: string;
  hint: string;
  options: string[];
}
