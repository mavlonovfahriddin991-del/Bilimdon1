/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Star, 
  Sparkles, 
  Award, 
  CheckCircle, 
  Trash2, 
  Download, 
  Paintbrush, 
  Eraser, 
  FolderHeart,
  Palette,
  Check
} from 'lucide-react';
import { UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface ColoringBookProps {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  onBack: () => void;
}

// Predefined 12 kid-friendly colors
interface ColorOption {
  hex: string;
  nameUz: string;
}

const COLOR_PALETTE: ColorOption[] = [
  { hex: '#ef4444', nameUz: 'Qizil' },
  { hex: '#f97316', nameUz: 'Olovrang' },
  { hex: '#facc15', nameUz: 'Sariq' },
  { hex: '#22c55e', nameUz: 'Yashil' },
  { hex: '#06b6d4', nameUz: 'Havorang' },
  { hex: '#3b82f6', nameUz: 'Ko\'k' },
  { hex: '#8b5cf6', nameUz: 'Binafsha' },
  { hex: '#ec4899', nameUz: 'Pushti' },
  { hex: '#a1a1aa', nameUz: 'Kulrang' },
  { hex: '#78350f', nameUz: 'Jigarrang' },
  { hex: '#ffffff', nameUz: 'Oq' },
  { hex: '#090d16', nameUz: 'Qora' },
];

// SVG Template Interface
interface ColoringTemplate {
  id: string;
  nameUz: string;
  emoji: string;
  parts: { [key: string]: string }; // default colors mapped by region ID
}

const TEMPLATES: ColoringTemplate[] = [
  {
    id: 'rocket',
    nameUz: 'Kosmik Kema 🚀',
    emoji: '🚀',
    parts: {
      bg: '#ffffff',
      star1: '#ffffff',
      star2: '#ffffff',
      star3: '#ffffff',
      rocketBody: '#ffffff',
      rocketNose: '#ffffff',
      rocketFinLeft: '#ffffff',
      rocketFinRight: '#ffffff',
      windowOuter: '#ffffff',
      windowInner: '#ffffff',
      fire: '#ffffff'
    }
  },
  {
    id: 'happy_sun',
    nameUz: 'Quyoshvoy ☀️',
    emoji: '☀️',
    parts: {
      bg: '#ffffff',
      cloudLeft: '#ffffff',
      cloudRight: '#ffffff',
      sunBody: '#ffffff',
      sunRay1: '#ffffff',
      sunRay2: '#ffffff',
      sunRay3: '#ffffff',
      sunRay4: '#ffffff',
      sunRay5: '#ffffff',
      sunRay6: '#ffffff',
      sunCheeks: '#ffffff',
      eyes: '#ffffff'
    }
  },
  {
    id: 'house',
    nameUz: 'Sehrli Uy 🏡',
    emoji: '🏡',
    parts: {
      bg: '#ffffff',
      ground: '#ffffff',
      wall: '#ffffff',
      roof: '#ffffff',
      door: '#ffffff',
      window: '#ffffff',
      chimney: '#ffffff',
      smoke: '#ffffff',
      treeTrunk: '#ffffff',
      treeLeaves: '#ffffff'
    }
  }
];

export default function ColoringBook({ profile, updateProfile, onBack }: ColoringBookProps) {
  const [activeTab, setActiveTab] = useState<'template' | 'freehand'>('template');
  const [selectedColor, setSelectedColor] = useState<string>('#ef4444'); // Default red
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [templateColors, setTemplateColors] = useState<{ [key: string]: string }>(TEMPLATES[0].parts);
  const [brushSize, setBrushSize] = useState<number>(8);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [showSavedSuccess, setShowSavedSuccess] = useState<boolean>(false);
  
  // Freehand drawing canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Sync template colors when selection changes
  useEffect(() => {
    setTemplateColors(TEMPLATES[selectedTemplateIndex].parts);
  }, [selectedTemplateIndex]);

  // Setup freehand canvas
  useEffect(() => {
    if (activeTab === 'freehand' && canvasRef.current) {
      const canvas = canvasRef.current;
      // Get exact bounding size for high-DPI scaling
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = selectedColor;
        context.lineWidth = brushSize;
        // White canvas background initially
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, rect.width, rect.height);
        contextRef.current = context;
      }
    }
  }, [activeTab]);

  // Update brush settings in real-time
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = selectedColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [selectedColor, brushSize]);

  const handleFillTemplatePart = (partKey: string) => {
    playSound('click');
    setTemplateColors(prev => ({
      ...prev,
      [partKey]: selectedColor
    }));
  };

  // Drawing mouse handlers for Freehand Drawing
  const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!contextRef.current || !canvasRef.current) return;
    
    let offsetX, offsetY;
    if ('touches' in nativeEvent) {
      // Touch events
      const rect = canvasRef.current.getBoundingClientRect();
      offsetX = nativeEvent.touches[0].clientX - rect.left;
      offsetY = nativeEvent.touches[0].clientY - rect.top;
    } else {
      // Mouse events
      offsetX = nativeEvent.offsetX;
      offsetY = nativeEvent.offsetY;
    }

    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    let offsetX, offsetY;
    if ('touches' in nativeEvent) {
      // Prevent scrolling while drawing on mobile
      if (nativeEvent.touches.length > 0) {
        nativeEvent.preventDefault();
      }
      const rect = canvasRef.current.getBoundingClientRect();
      offsetX = nativeEvent.touches[0].clientX - rect.left;
      offsetY = nativeEvent.touches[0].clientY - rect.top;
    } else {
      offsetX = nativeEvent.offsetX;
      offsetY = nativeEvent.offsetY;
    }

    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    playSound('incorrect');
    if (contextRef.current && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      contextRef.current.fillStyle = '#ffffff';
      contextRef.current.fillRect(0, 0, rect.width, rect.height);
    }
  };

  const handleSaveMasterpiece = () => {
    playSound('success');
    setShowSavedSuccess(true);

    // Award points and badges
    const pointsGained = 40;
    const starsGained = 3;

    let newBadges = [...profile.badges];
    if (!profile.badges.includes('young_artist')) {
      newBadges.push('young_artist');
    }

    updateProfile({
      points: profile.points + pointsGained,
      stars: profile.stars + starsGained,
      badges: newBadges
    });

    setTimeout(() => {
      setShowSavedSuccess(false);
    }, 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6" id="coloring-game-container">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-full font-bold transition kid-button"
        >
          <ArrowLeft size={18} /> Orqaga
        </button>

        <div className="flex items-center gap-3">
          {/* Game Tab selection */}
          <div className="bg-white/5 border border-white/15 p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => {
                playSound('click');
                setActiveTab('template');
              }}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'template'
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              Rasm Bo'yash
            </button>
            <button
              onClick={() => {
                playSound('click');
                setActiveTab('freehand');
              }}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'freehand'
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              Erkin Chizish
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full font-bold shadow-md">
            <Star className="fill-amber-400 text-amber-400" size={18} />
            <span>{profile.stars}</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Control Panel / Tool Belt */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Templates list (Only active during template coloring mode) */}
          {activeTab === 'template' ? (
            <div className="glass-panel-heavy rounded-3xl p-5 border-white/25 shadow-2xl text-white">
              <div className="flex items-center gap-2 mb-3">
                <FolderHeart className="text-pink-400" size={18} />
                <h4 className="font-display font-bold text-sm uppercase tracking-wider">
                  Andozalar
                </h4>
              </div>
              <div className="space-y-2.5">
                {TEMPLATES.map((tpl, idx) => (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      playSound('click');
                      setSelectedTemplateIndex(idx);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                      selectedTemplateIndex === idx
                        ? 'bg-pink-500/20 border-pink-400 text-white shadow-lg'
                        : 'bg-white/5 border-white/5 text-indigo-100 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{tpl.emoji}</span>
                    <span className="font-bold text-sm">{tpl.nameUz}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Drawing brush size controls for Free Drawing Mode */
            <div className="glass-panel-heavy rounded-3xl p-5 border-white/25 shadow-2xl text-white">
              <div className="flex items-center gap-2 mb-3">
                <Paintbrush className="text-pink-400" size={18} />
                <h4 className="font-display font-bold text-sm uppercase tracking-wider">
                  Mo'yqalam o'lchami
                </h4>
              </div>
              
              <div className="space-y-4">
                {/* Visual Sizes */}
                <div className="flex justify-between items-center gap-2">
                  {[4, 8, 14, 22].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => {
                        playSound('click');
                        setBrushSize(sz);
                      }}
                      className={`h-11 flex-1 rounded-xl border flex items-center justify-center transition-all ${
                        brushSize === sz
                          ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                          : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70'
                      }`}
                    >
                      <span 
                        className="bg-current rounded-full" 
                        style={{ width: `${sz}px`, height: `${sz}px` }} 
                      />
                    </button>
                  ))}
                </div>

                {/* Eraser Toggle */}
                <button
                  onClick={() => {
                    playSound('click');
                    setSelectedColor('#ffffff'); // Erase = White paint
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border transition-all ${
                    selectedColor === '#ffffff'
                      ? 'bg-indigo-500/25 border-indigo-400 text-indigo-300 shadow-md'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <Eraser size={18} />
                  <span className="font-bold text-xs">O'chirg'ich</span>
                </button>

                {/* Clear Sandbox Button */}
                <button
                  onClick={clearCanvas}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/10 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-all"
                >
                  <Trash2 size={18} />
                  <span className="font-bold text-xs">Butunlay o'chirish</span>
                </button>
              </div>
            </div>
          )}

          {/* Color Palette Panel */}
          <div className="glass-panel-heavy rounded-3xl p-5 border-white/25 shadow-2xl text-white flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Palette className="text-yellow-400" size={18} />
                <h4 className="font-display font-bold text-sm uppercase tracking-wider">
                  Bo'yoq ranglari
                </h4>
              </div>

              {/* Grid of colors */}
              <div className="grid grid-cols-4 gap-2.5">
                {COLOR_PALETTE.map((color) => (
                  <motion.button
                    key={color.hex}
                    onClick={() => {
                      playSound('click');
                      setSelectedColor(color.hex);
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-full h-9 rounded-xl shadow-md border-2 relative overflow-hidden flex items-center justify-center"
                    style={{ 
                      backgroundColor: color.hex,
                      borderColor: selectedColor === color.hex ? '#ffffff' : 'rgba(255,255,255,0.15)'
                    }}
                    title={color.nameUz}
                  >
                    {selectedColor === color.hex && (
                      <Check 
                        size={16} 
                        className={color.hex === '#ffffff' ? 'text-slate-900' : 'text-white drop-shadow-md'} 
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Save Masterpiece Trigger */}
            <button
              onClick={handleSaveMasterpiece}
              className="mt-6 w-full py-4 bg-gradient-to-r from-pink-500 to-indigo-500 hover:brightness-110 text-white font-display font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition border border-white/20 flex items-center justify-center gap-2 active:translate-y-0.5"
            >
              <FolderHeart size={16} />
              Galereyaga Saqlash
            </button>
          </div>
        </div>

        {/* Right Panel: Painting Stage / Canvas */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="glass-panel-heavy rounded-3xl p-5 border-white/25 flex-1 flex flex-col shadow-2xl relative min-h-[420px] justify-center items-center overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

            {/* Mode headers */}
            <div className="w-full flex items-center justify-between mb-4 relative z-10 bg-indigo-950/40 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
              <span className="text-indigo-200 text-xs font-bold flex items-center gap-2">
                <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                {activeTab === 'template' 
                  ? 'Andozaning o\'sha bo\'limini bo\'yash uchun ustiga bosing!'
                  : 'Sichqoncha yoki barmog\'ingiz orqali rasm chizing!'
                }
              </span>
              <span className="text-xs font-black text-white px-3 py-1 bg-white/10 rounded-full border border-white/10">
                Rang: {COLOR_PALETTE.find(c => c.hex === selectedColor)?.nameUz || "Maxsus"}
              </span>
            </div>

            {/* TEMPLATE RENDERING MODE */}
            {activeTab === 'template' && (
              <div className="w-full max-w-[420px] aspect-square flex items-center justify-center relative z-10 py-4">
                
                {/* ROCKET TEMPLATE SVG */}
                {TEMPLATES[selectedTemplateIndex].id === 'rocket' && (
                  <svg 
                    viewBox="0 0 400 400" 
                    className="w-full h-full drop-shadow-2xl transition duration-300 select-none cursor-pointer"
                  >
                    {/* Background Fill */}
                    <rect 
                      width="400" 
                      height="400" 
                      rx="30" 
                      fill={templateColors.bg} 
                      stroke="#000000"
                      strokeWidth="5"
                      onClick={() => handleFillTemplatePart('bg')}
                    />

                    {/* Stars */}
                    <path 
                      d="M 120 80 L 125 90 L 135 92 L 127 100 L 129 110 L 120 105 L 111 110 L 113 100 L 105 92 L 115 90 Z" 
                      fill={templateColors.star1} 
                      stroke="#000000"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('star1')}
                    />
                    <path 
                      d="M 310 130 L 314 138 L 322 140 L 316 146 L 318 154 L 310 150 L 302 154 L 304 146 L 298 140 L 306 138 Z" 
                      fill={templateColors.star2} 
                      stroke="#000000"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('star2')}
                    />
                    <path 
                      d="M 90 280 L 93 286 L 100 287 L 95 292 L 96 298 L 90 295 L 84 298 L 85 292 L 80 287 L 87 286 Z" 
                      fill={templateColors.star3} 
                      stroke="#000000"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('star3')}
                    />

                    {/* Rocket Exhaust Fire */}
                    <path 
                      d="M 170 300 Q 200 380 230 300 Z" 
                      fill={templateColors.fire} 
                      stroke="#000000"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('fire')}
                    />

                    {/* Rocket Body */}
                    <path 
                      d="M 200 80 C 230 140 240 240 230 300 L 170 300 C 160 240 170 140 200 80 Z" 
                      fill={templateColors.rocketBody} 
                      stroke="#000000"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('rocketBody')}
                    />

                    {/* Rocket Fins */}
                    <path 
                      d="M 170 240 L 130 290 L 170 290 Z" 
                      fill={templateColors.rocketFinLeft} 
                      stroke="#000000"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('rocketFinLeft')}
                    />
                    <path 
                      d="M 230 240 L 270 290 L 230 290 Z" 
                      fill={templateColors.rocketFinRight} 
                      stroke="#000000"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('rocketFinRight')}
                    />

                    {/* Nose Cone */}
                    <path 
                      d="M 200 80 C 215 110 221 135 224 150 L 176 150 C 179 135 185 110 200 80 Z" 
                      fill={templateColors.rocketNose} 
                      stroke="#000000"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('rocketNose')}
                    />

                    {/* Window outer */}
                    <circle 
                      cx="200" 
                      cy="195" 
                      r="28" 
                      fill={templateColors.windowOuter} 
                      stroke="#000000"
                      strokeWidth="4"
                      onClick={() => handleFillTemplatePart('windowOuter')}
                    />

                    {/* Window inner */}
                    <circle 
                      cx="200" 
                      cy="195" 
                      r="20" 
                      fill={templateColors.windowInner} 
                      stroke="#000000"
                      strokeWidth="4"
                      onClick={() => handleFillTemplatePart('windowInner')}
                    />
                  </svg>
                )}

                {/* HAPPY SUN TEMPLATE SVG */}
                {TEMPLATES[selectedTemplateIndex].id === 'happy_sun' && (
                  <svg 
                    viewBox="0 0 400 400" 
                    className="w-full h-full drop-shadow-2xl transition duration-300 select-none cursor-pointer"
                  >
                    {/* Background */}
                    <rect 
                      width="400" 
                      height="400" 
                      rx="30" 
                      fill={templateColors.bg} 
                      stroke="#000000"
                      strokeWidth="5"
                      onClick={() => handleFillTemplatePart('bg')}
                    />

                    {/* Rays */}
                    <polygon points="200,40 220,100 180,100" fill={templateColors.sunRay1} stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" onClick={() => handleFillTemplatePart('sunRay1')} />
                    <polygon points="200,360 220,300 180,300" fill={templateColors.sunRay2} stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" onClick={() => handleFillTemplatePart('sunRay2')} />
                    <polygon points="40,200 100,220 100,180" fill={templateColors.sunRay3} stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" onClick={() => handleFillTemplatePart('sunRay3')} />
                    <polygon points="360,200 300,220 300,180" fill={templateColors.sunRay4} stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" onClick={() => handleFillTemplatePart('sunRay4')} />
                    
                    <polygon points="87,87 140,120 120,140" fill={templateColors.sunRay5} stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" onClick={() => handleFillTemplatePart('sunRay5')} />
                    <polygon points="313,313 260,280 280,260" fill={templateColors.sunRay6} stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" onClick={() => handleFillTemplatePart('sunRay6')} />

                    {/* Sun central body */}
                    <circle cx="200" cy="200" r="85" fill={templateColors.sunBody} stroke="#000000" strokeWidth="5" onClick={() => handleFillTemplatePart('sunBody')} />

                    {/* Cheeks */}
                    <circle cx="150" cy="220" r="14" fill={templateColors.sunCheeks} stroke="#000000" strokeWidth="3" onClick={() => handleFillTemplatePart('sunCheeks')} />
                    <circle cx="250" cy="220" r="14" fill={templateColors.sunCheeks} stroke="#000000" strokeWidth="3" onClick={() => handleFillTemplatePart('sunCheeks')} />

                    {/* Eyes */}
                    <circle cx="160" cy="180" r="8" fill={templateColors.eyes} stroke="#000000" strokeWidth="3" onClick={() => handleFillTemplatePart('eyes')} />
                    <circle cx="240" cy="180" r="8" fill={templateColors.eyes} stroke="#000000" strokeWidth="3" onClick={() => handleFillTemplatePart('eyes')} />
                    
                    {/* Smile line */}
                    <path d="M 175 225 Q 200 255 225 225" stroke="#000000" strokeWidth="6" fill="none" strokeLinecap="round" onClick={() => handleFillTemplatePart('eyes')} />

                    {/* Clouds left and right */}
                    <path 
                      d="M 50 310 C 50 280, 80 270, 100 290 C 110 275, 140 280, 140 310 Z" 
                      fill={templateColors.cloudLeft} 
                      stroke="#000000"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('cloudLeft')}
                    />
                    <path 
                      d="M 260 320 C 260 295, 290 285, 310 305 C 320 290, 350 295, 350 320 Z" 
                      fill={templateColors.cloudRight} 
                      stroke="#000000"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('cloudRight')}
                    />
                  </svg>
                )}

                {/* CASTLE / HOUSE TEMPLATE SVG */}
                {TEMPLATES[selectedTemplateIndex].id === 'house' && (
                  <svg 
                    viewBox="0 0 400 400" 
                    className="w-full h-full drop-shadow-2xl transition duration-300 select-none cursor-pointer"
                  >
                    {/* Sky Background */}
                    <rect 
                      width="400" 
                      height="400" 
                      rx="30" 
                      fill={templateColors.bg} 
                      stroke="#000000"
                      strokeWidth="5"
                      onClick={() => handleFillTemplatePart('bg')}
                    />

                    {/* Ground */}
                    <path 
                      d="M 0 320 Q 200 290 400 320 L 400 400 L 0 400 Z" 
                      fill={templateColors.ground} 
                      stroke="#000000"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('ground')} 
                    />

                    {/* Chimney */}
                    <rect 
                      x="250" 
                      y="110" 
                      width="30" 
                      height="70" 
                      fill={templateColors.chimney} 
                      stroke="#000000"
                      strokeWidth="4"
                      onClick={() => handleFillTemplatePart('chimney')} 
                    />
                    
                    {/* Chimney Smoke */}
                    <circle cx="265" cy="80" r="14" fill={templateColors.smoke} stroke="#000000" strokeWidth="3" onClick={() => handleFillTemplatePart('smoke')} />
                    <circle cx="275" cy="55" r="18" fill={templateColors.smoke} stroke="#000000" strokeWidth="3" onClick={() => handleFillTemplatePart('smoke')} />

                    {/* Wall */}
                    <rect 
                      x="110" 
                      y="180" 
                      width="180" 
                      height="130" 
                      fill={templateColors.wall} 
                      stroke="#000000"
                      strokeWidth="5"
                      onClick={() => handleFillTemplatePart('wall')} 
                    />

                    {/* Roof */}
                    <polygon 
                      points="90,180 200,90 310,180" 
                      fill={templateColors.roof} 
                      stroke="#000000"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      onClick={() => handleFillTemplatePart('roof')} 
                    />

                    {/* Door */}
                    <rect 
                      x="180" 
                      y="230" 
                      width="40" 
                      height="80" 
                      rx="4" 
                      fill={templateColors.door} 
                      stroke="#000000"
                      strokeWidth="4.5"
                      onClick={() => handleFillTemplatePart('door')} 
                    />

                    {/* Window */}
                    <circle cx="200" cy="140" r="18" fill={templateColors.window} stroke="#000000" strokeWidth="4.5" onClick={() => handleFillTemplatePart('window')} />
                    <rect 
                      x="130" 
                      y="210" 
                      width="35" 
                      height="35" 
                      fill={templateColors.window} 
                      stroke="#000000"
                      strokeWidth="4"
                      onClick={() => handleFillTemplatePart('window')} 
                    />

                    {/* Tree trunk */}
                    <rect 
                      x="330" 
                      y="220" 
                      width="18" 
                      height="100" 
                      fill={templateColors.treeTrunk} 
                      stroke="#000000"
                      strokeWidth="4"
                      onClick={() => handleFillTemplatePart('treeTrunk')} 
                    />

                    {/* Tree leaves */}
                    <circle cx="340" cy="200" r="35" fill={templateColors.treeLeaves} stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" onClick={() => handleFillTemplatePart('treeLeaves')} />
                    <circle cx="320" cy="175" r="30" fill={templateColors.treeLeaves} stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" onClick={() => handleFillTemplatePart('treeLeaves')} />
                    <circle cx="360" cy="180" r="30" fill={templateColors.treeLeaves} stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" onClick={() => handleFillTemplatePart('treeLeaves')} />
                  </svg>
                )}
              </div>
            )}

            {/* FREEHAND DRAWING CANVAS MODE */}
            {activeTab === 'freehand' && (
              <div className="w-full h-full min-h-[350px] relative border-4 border-dashed border-white/20 rounded-2xl overflow-hidden bg-white z-10 shadow-inner">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-full cursor-crosshair block"
                />
              </div>
            )}

            {/* Save Masterpiece Popup */}
            <AnimatePresence>
              {showSavedSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="absolute z-20 bg-indigo-950/95 border-2 border-emerald-400 p-6 rounded-3xl text-center shadow-2xl max-w-sm backdrop-blur-md"
                >
                  <div className="text-5xl mb-2">🎨</div>
                  <h4 className="font-display font-black text-emerald-300 text-lg mb-1">
                    San\'atingiz Saqlandi!
                  </h4>
                  <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                    Ijodiy ishingiz ko'rgazmaga qo'shildi! Sizga 40 ball va 3 ta ⭐️ yulduz munosib taqdim etildi.
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/20">
                    <CheckCircle size={16} /> Keyingi ijodga tayyor!
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
