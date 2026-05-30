/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Flame, 
  Droplet, 
  Footprints, 
  TrendingUp, 
  Calendar, 
  RotateCcw, 
  Sparkles, 
  User, 
  Dumbbell, 
  CheckCircle,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, FoodLogItem, StepsLogEntry, WaterLogEntry } from '../types';

interface DashboardProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  foodLogs: FoodLogItem[];
  waterLogs: WaterLogEntry[];
  onAddWater: (amount: number) => void;
  onResetWater: () => void;
  stepsLogs: StepsLogEntry[];
  onUpdateSteps: (steps: number) => void;
  workoutLogCount: number;
}

export default function Dashboard({
  profile,
  setProfile,
  foodLogs,
  waterLogs,
  onAddWater,
  onResetWater,
  stepsLogs,
  onUpdateSteps,
  workoutLogCount
}: DashboardProps) {
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>({ ...profile });
  const [stepsInput, setStepsInput] = useState<string>('');

  // Calculate today's dates
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations for today
  const caloriesConsumed = foodLogs
    .filter(log => log.date === todayStr)
    .reduce((sum, item) => sum + item.calories, 0);

  const proteinConsumed = foodLogs
    .filter(log => log.date === todayStr)
    .reduce((sum, item) => sum + item.protein, 0);

  const carbsConsumed = foodLogs
    .filter(log => log.date === todayStr)
    .reduce((sum, item) => sum + item.carbs, 0);

  const fatConsumed = foodLogs
    .filter(log => log.date === todayStr)
    .reduce((sum, item) => sum + item.fat, 0);

  const todayWater = waterLogs
    .filter(log => log.date === todayStr)
    .reduce((sum, item) => sum + item.intakeMl, 0);

  const todaySteps = stepsLogs.find(log => log.date === todayStr)?.stepsCount || 0;

  // Percentage calculations
  const calPercent = Math.min(100, Math.round((caloriesConsumed / profile.targetCalories) * 100)) || 0;
  const waterPercent = Math.min(100, Math.round((todayWater / 2500) * 100)) || 0; // standard water target 2.5L
  const stepsPercent = Math.min(100, Math.round((todaySteps / 10000) * 100)) || 0; // standard step target 10k

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(tempProfile);
    setShowProfileEdit(false);
  };

  return (
    <div className="space-y-8" id="dashboard-tab">
      
      {/* Welcome & Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-[#181818] border border-[#222222] p-6 rounded-2xl relative overflow-hidden" id="profile-strip">
        <div className="absolute top-0 right-0 w-24 h-24 bg-neon/5 rounded-full filter blur-xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-neon text-[#0A0A0A] font-black font-display text-2xl flex items-center justify-center rounded-xl rotate-3 shadow-[0_0_20px_rgba(204,255,0,0.15)]">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tight text-[#F5F5F5] flex items-center gap-2">
              SALOM, {profile.name.toUpperCase()}! 
              <span className="text-xl animate-pulse">⚡</span>
            </h2>
            <p className="text-xs font-mono text-[#888888] uppercase tracking-wider">
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="px-3.5 py-1.5 bg-[#111111] border border-[#333333] rounded-sm text-[10px] font-mono font-bold text-neon uppercase tracking-wider">
            {profile.goal === 'lose_weight' && '🎯 OZISH / DEFICIT'}
            {profile.goal === 'build_muscle' && '💪 MUSHAK MASSASI / HYPERTROPHY'}
            {profile.goal === 'stay_fit' && '⚡ CHIDAMLILIK / ATHLETIC'}
            {profile.goal === 'general_health' && '🌱 SOG\'LOM HAYOT / FITNESS'}
          </div>
          
          <button 
            id="profile-edit-btn"
            onClick={() => {
              setTempProfile({ ...profile });
              setShowProfileEdit(true);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-neon hover:bg-white text-black font-black uppercase text-xs rounded-sm transition-all duration-150 tracking-wider shadow-[0_4px_12px_rgba(204,255,0,0.15)] active:scale-95 cursor-pointer"
          >
            <User size={13} className="stroke-[2.5]" /> SOZLAMALAR
          </button>
        </div>
      </div>

      {/* Profile Modification Modal (AnimatePresence) */}
      <AnimatePresence>
        {showProfileEdit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            id="profile-modal"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#111111] border-2 border-[#222222] rounded-2xl p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
            >
              <h3 className="text-2xl font-black italic tracking-tighter text-[#F5F5F5] mb-5 uppercase flex items-center gap-2">
                <Sparkles className="text-neon" size={20} /> PROFILE <span className="text-neon">SOZLAMALARI</span>
              </h3>
              
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-black uppercase text-[#666666] tracking-widest mb-1">Mijoz Ismi</label>
                  <input
                    type="text"
                    required
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                    className="w-full text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-3.5 py-2.5 text-[#F5F5F5] focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-[#666666] tracking-widest mb-1">Yosh</label>
                    <input
                      type="number"
                      value={tempProfile.age || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, age: parseInt(e.target.value) || undefined })}
                      className="w-full text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-3 py-2.5 text-[#F5F5F5] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-[#666666] tracking-widest mb-1">Vazn (kg)</label>
                    <input
                      type="number"
                      value={tempProfile.weight || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, weight: parseFloat(e.target.value) || undefined })}
                      className="w-full text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-3 py-2.5 text-[#F5F5F5] focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-black uppercase text-[#666666] tracking-widest mb-1">Bo'y (sm)</label>
                    <input
                      type="number"
                      value={tempProfile.height || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, height: parseInt(e.target.value) || undefined })}
                      className="w-full text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-3 py-2.5 text-[#F5F5F5] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black uppercase text-[#666666] tracking-widest mb-1">Kunlik Kaloriya Maqsadi (Kkal)</label>
                  <input
                    type="number"
                    required
                    value={tempProfile.targetCalories}
                    onChange={(e) => setTempProfile({ ...tempProfile, targetCalories: parseInt(e.target.value) || 2000 })}
                    className="w-full text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-3.5 py-2.5 text-[#F5F5F5] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black uppercase text-[#666666] tracking-widest mb-1">Asosiy Maqsad</label>
                  <select
                    value={tempProfile.goal}
                    onChange={(e) => setTempProfile({ ...tempProfile, goal: e.target.value as UserProfile['goal'] })}
                    className="w-full text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-3 py-2.5 text-[#F5F5F5] focus:outline-none transition-all"
                  >
                    <option value="lose_weight">Vazn yo'qotish (Ozish)</option>
                    <option value="build_muscle">Mushak massasini oshirish</option>
                    <option value="stay_fit">Sog'lom tonus va chidamlilik</option>
                    <option value="general_health">Sog'lom turmush tarzi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-black uppercase text-[#666666] tracking-widest mb-1">Tajriba darajasi</label>
                  <select
                    value={tempProfile.experience || 'beginner'}
                    onChange={(e) => setTempProfile({ ...tempProfile, experience: e.target.value as UserProfile['experience'] })}
                    className="w-full text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-3 py-2.5 text-[#F5F5F5] focus:outline-none transition-all"
                  >
                    <option value="beginner">Yangi boshlovchi (Beginner)</option>
                    <option value="intermediate">O'rtacha (Intermediate)</option>
                    <option value="advanced">Tajribali (Advanced)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProfileEdit(false)}
                    className="flex-1 py-2.5 border border-[#333333] rounded-lg text-zinc-400 hover:text-white hover:bg-[#181818] font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-neon hover:bg-white text-black font-black rounded-lg text-xs uppercase tracking-wider transition-all"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Rings / Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="bento-stats">
        
        {/* Calorie Ring Card */}
        <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden" id="card-calories">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-[10px] font-black uppercase text-[#888888] tracking-widest flex items-center gap-2">
              <Flame className="text-neon" size={14} /> Kaloriya balansi
            </h3>
            <span className="text-neon text-[10px] font-mono font-bold tracking-tight bg-neon/10 px-2 py-0.5 rounded-full">{calPercent}%</span>
          </div>
          
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none">{caloriesConsumed.toLocaleString()}</span>
                <span className="text-xs font-black text-neon uppercase italic font-display">KKAL</span>
              </div>
              <p className="text-[11px] font-mono text-[#888888] uppercase">
                MAQSAD: <strong className="text-[#F5F5F5]">{profile.targetCalories}</strong>
              </p>
              <p className="text-[11px] font-mono text-[#888888] uppercase">
                QOLDI: <strong className={profile.targetCalories - caloriesConsumed > 0 ? "text-neon" : "text-[#888888]"}>
                  {Math.max(0, profile.targetCalories - caloriesConsumed)}
                </strong>
              </p>
            </div>

            {/* Circular Neo progress */}
            <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  stroke="#222222"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  stroke="#CCFF00"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 36}
                  strokeDashoffset={2 * Math.PI * 36 * (1 - calPercent / 100)}
                  strokeLinecap="square"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute font-mono text-[11px] font-black text-[#F5F5F5]">
                {calPercent}%
              </div>
            </div>
          </div>

          <div className="border-t border-[#222222] pt-4 mt-5 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[9px] font-mono font-bold text-[#666666] uppercase tracking-wider">Oqsil</p>
              <p className="font-extrabold text-[#F5F5F5] font-mono text-sm tracking-tight">{proteinConsumed}g</p>
            </div>
            <div>
              <p className="text-[9px] font-mono font-bold text-[#666666] uppercase tracking-wider">Uglevod</p>
              <p className="font-extrabold text-[#F5F5F5] font-mono text-sm tracking-tight">{carbsConsumed}g</p>
            </div>
            <div>
              <p className="text-[9px] font-mono font-bold text-[#666666] uppercase tracking-wider">Yog'</p>
              <p className="font-extrabold text-[#F5F5F5] font-mono text-sm tracking-tight">{fatConsumed}g</p>
            </div>
          </div>
        </div>

        {/* Steps Card */}
        <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl flex flex-col justify-between" id="card-steps">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-[10px] font-black uppercase text-[#888888] tracking-widest flex items-center gap-2">
              <Footprints className="text-neon" size={14} /> QADAMLAR
            </h3>
            <span className="text-neon text-[10px] font-mono font-bold tracking-tight bg-neon/10 px-2 py-0.5 rounded-full">{stepsPercent}%</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none">{todaySteps.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-[#666666] uppercase">/ 10k</span>
              </div>
            </div>

            {/* Custom high contrast bar progress bar */}
            <div className="w-full h-3 bg-[#222222] overflow-hidden rounded-sm relative">
              <div 
                className="h-full bg-neon transition-all duration-700 ease-out"
                style={{ width: `${stepsPercent}%` }}
              />
            </div>

            {/* Quick steps log */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="number"
                placeholder="Qadam..."
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                className="flex-1 font-mono text-center text-xs bg-[#0A0A0A] border border-[#222222] rounded-md px-2 py-2 text-[#F5F5F5] focus:outline-none focus:border-neon transition-all"
              />
              <button
                onClick={() => {
                  const val = parseInt(stepsInput);
                  if (val > 0) {
                    onUpdateSteps(val);
                    setStepsInput('');
                  }
                }}
                className="px-4 py-2 bg-neon hover:bg-white text-black font-black uppercase text-xs rounded-sm transition-all duration-150 tracking-wider cursor-pointer"
              >
                Log
              </button>
            </div>
            
            <div className="flex gap-1.5 justify-between">
              <button onClick={() => onUpdateSteps(todaySteps + 2000)} className="flex-1 py-1.5 bg-[#181818] hover:bg-[#222222] border border-[#222222] rounded text-[10px] text-[#888888] hover:text-[#FFFFFF] transition-all font-mono font-bold uppercase">+2k qadam</button>
              <button onClick={() => onUpdateSteps(todaySteps + 5000)} className="flex-1 py-1.5 bg-[#181818] hover:bg-[#222222] border border-[#222222] rounded text-[10px] text-[#888888] hover:text-[#FFFFFF] transition-all font-mono font-bold uppercase">+5k qadam</button>
              <button onClick={() => onUpdateSteps(0)} className="py-1.5 px-3 bg-[#181818] hover:bg-red-950/20 rounded text-[10px] text-red-500 border border-[#222222] hover:border-red-900/40 transition-all font-mono font-bold uppercase">nolga</button>
            </div>
          </div>
        </div>

        {/* Water Intake Card with Block representation */}
        <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl flex flex-col justify-between" id="card-water">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-[10px] font-black uppercase text-[#888888] tracking-widest flex items-center gap-2">
              <Droplet className="text-neon" size={14} /> SUV BALANSI
            </h3>
            <span className="text-neon bg-neon/10 border border-neon/20 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase leading-none">MAQSAD: 2.5 L</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none">{todayWater}</span>
                <span className="text-xs font-bold text-[#666666] uppercase">ML</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#888888]">{waterPercent}%</span>
            </div>

            {/* Custom bold layout style: Solid Blocks representing water segments (like the secondary stats stack in user specs) */}
            <div className="flex gap-1">
              {Array.from({ length: 8 }).map((_, idx) => {
                const stepVal = (idx + 1) * 12.5;
                const isWaterFilled = waterPercent >= stepVal;
                return (
                  <div 
                    key={idx} 
                    className={`flex-1 h-6 transition-all duration-300 ${
                      isWaterFilled ? 'bg-neon' : 'bg-[#222222]'
                    }`}
                  />
                );
              })}
            </div>

            {/* Quick Hydrate buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAddWater(250)}
                className="flex-1 py-2 bg-[#181818] hover:bg-neon border border-[#333333] hover:border-transparent text-[#AAAAAA] hover:text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus size={11} className="stroke-[2.5]" /> 250ML
              </button>
              <button
                onClick={() => onAddWater(500)}
                className="flex-1 py-2 bg-[#181818] hover:bg-neon border border-[#333333] hover:border-transparent text-[#AAAAAA] hover:text-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Plus size={11} className="stroke-[2.5]" /> 500ML
              </button>
              <button
                onClick={onResetWater}
                className="p-2 border border-[#333333] hover:border-red-900 bg-[#181818] text-[#888888] hover:text-white rounded-lg transition-all cursor-pointer"
                title="Tozalash"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Summary logs row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-details">
        
        {/* Workout Progress snapshot (solid block with border accent) */}
        <div className="bg-[#111111] border-l-4 border-neon border-y border-r border-[#222222] p-6 rounded-r-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-neon/10 text-neon border border-neon/20 rounded-xl">
              <Dumbbell size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-black text-[#666666] uppercase tracking-widest">BUGUNGI MASHQLAR LOGI</h4>
              <p className="text-[11px] text-[#AAAAAA] mt-1 font-semibold uppercase">Ushbu kunda bajarilgan mashqlar soni</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-extrabold text-neon font-mono italic tracking-tighter">{workoutLogCount}</p>
            <span className="text-[9px] font-mono tracking-wider font-bold text-[#666666] uppercase">LOGLANGAN MASHQ</span>
          </div>
        </div>

        {/* Nutritional advice dynamically updated base on goal */}
        <div className="bg-[#111111] border-l-4 border-neon border-y border-r border-[#222222] p-6 rounded-r-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-neon/10 text-neon border border-neon/20 rounded-xl">
              <TrendingUp size={22} className="stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-mono font-black text-[#666666] uppercase tracking-widest">DIETOLOG MASLAHATI</h4>
              <p className="text-[11px] text-[#BBBBBB] leading-relaxed uppercase mt-1 font-medium italic">
                {profile.goal === 'lose_weight' && "Suv ichishni ko'paytiring va oqsilga boy, kaloriya jihatidan past bo'lgan sabzavotlar hamda oq go'shtni ratsioningizga kiriting."}
                {profile.goal === 'build_muscle' && "Uglevodlarni mashg'ulotdan 1.5 soat oldin tanovul qiling va kunlik oqsil me'yorini tana vazningizga moslashtiring."}
                {profile.goal === 'stay_fit' && "Vitaminlarga boy rang-barang sabzavotlar, mevalar, va to'liq donli mahsulotlarni tanlang. Turmush tarzingiz naqadar ajoyib!"}
                {profile.goal === 'general_health' && "Sog'lom turmush tarzi uchun har kuni kamida 30 daqiqa piyoda yuring va uyqu sifatiga e'tibor qaratishni unutmang."}
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
