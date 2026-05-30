/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Apple, 
  Loader2, 
  ChevronRight, 
  Pizza, 
  HelpCircle,
  Coffee,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, FoodLogItem } from '../types';

interface MealTrackerProps {
  profile: UserProfile;
  foodLogs: FoodLogItem[];
  onAddFood: (item: Omit<FoodLogItem, 'id' | 'date' | 'timestamp'>) => void;
  onDeleteFood: (id: string) => void;
}

// Popular typical Uzbek food presets for quick convenience
const UZBEK_FOOD_PRESETS = [
  { name: 'Palov (Osh)', calories: 650, protein: 22, carbs: 75, fat: 28, mealType: 'lunch' as const },
  { name: 'Somsa (G\'shtli, 1ta)', calories: 290, protein: 10, carbs: 32, fat: 14, mealType: 'snack' as const },
  { name: 'Manti (1 dona kottaroq)', calories: 150, protein: 6, carbs: 18, fat: 6, mealType: 'dinner' as const },
  { name: 'Shorva (bitta kosa)', calories: 320, protein: 18, carbs: 14, fat: 20, mealType: 'lunch' as const },
  { name: 'Achchiq-chuchuk salati', calories: 60, protein: 1, carbs: 8, fat: 2, mealType: 'lunch' as const },
  { name: 'Qora yoki Oq Non (1 tili)', calories: 80, protein: 3, carbs: 16, fat: 1, mealType: 'breakfast' as const },
  { name: 'Tuxum (1ta qaynatilgan)', calories: 75, protein: 6, carbs: 1, fat: 5, mealType: 'breakfast' as const },
];

export default function MealTracker({
  profile,
  foodLogs,
  onAddFood,
  onDeleteFood
}: MealTrackerProps) {
  const [activeMealSection, setActiveMealSection] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  
  // Manual adding states
  const [manualName, setManualName] = useState('');
  const [manualCal, setManualCal] = useState('');
  const [manualProt, setManualProt] = useState('');
  const [manualCarb, setManualCarb] = useState('');
  const [manualFat, setManualFat] = useState('');

  // AI Meal Analyzer states
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    items: { name: string; calories: number; protein: number; carbs: number; fat: number }[];
    summary: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Filter food for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayFoods = foodLogs.filter(log => log.date === todayStr);

  const totalCalories = todayFoods.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = todayFoods.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = todayFoods.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = todayFoods.reduce((sum, item) => sum + item.fat, 0);

  // Target macros
  const targetProt = Math.round(profile.targetCalories * 0.25 / 4); // 25% protein
  const targetCarbs = Math.round(profile.targetCalories * 0.50 / 4); // 50% carbs
  const targetFat = Math.round(profile.targetCalories * 0.25 / 9); // 25% fat

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    onAddFood({
      name: manualName.trim(),
      calories: parseInt(manualCal) || 0,
      protein: parseInt(manualProt) || 0,
      carbs: parseInt(manualCarb) || 0,
      fat: parseInt(manualFat) || 0,
      mealType: activeMealSection
    });

    // Reset forms
    setManualName('');
    setManualCal('');
    setManualProt('');
    setManualCarb('');
    setManualFat('');
  };

  // Analyze meal via Gemini API on the server
  const handleAiAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiText.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealText: aiText }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || "Tahlil qilishda xatolik");
      }

      setAiResult(data);
    } catch (err: any) {
      setAiError(err.message || "Ulanish xatoligi. Keyinroq qayta urinib ko'ring.");
    } finally {
      setAiLoading(false);
    }
  };

  // Add all AI analyzed items to our database
  const handleImportAiItems = () => {
    if (!aiResult) return;

    aiResult.items.forEach(item => {
      onAddFood({
        name: item.name,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        mealType: activeMealSection
      });
    });

    // Clear AI states
    setAiText('');
    setAiResult(null);
  };

  return (
    <div className="space-y-6" id="meals-tab">
      
      {/* Daily Macro Progress Summary */}
      <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl" id="macro-status-bars">
        <h3 className="font-mono text-[10px] font-black uppercase text-[#888888] tracking-widest mb-4">BUGUNGI OZIQ-OVQAT BALANSI</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Calories column */}
          <div className="bg-[#0A0A0A] p-5 border border-[#222222] rounded-xl relative overflow-hidden">
            <p className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">KALORIYALAR</p>
            <p className="text-3xl font-black italic text-zinc-100 tracking-tight mt-1.5 font-sans">
              {totalCalories} <span className="text-xs uppercase font-mono font-bold text-[#666666]">/ {profile.targetCalories} KKAL</span>
            </p>
            <div className="w-full h-2 bg-[#181818] rounded-none mt-4 overflow-hidden">
              <div 
                className="h-full bg-neon transition-all duration-500"
                style={{ width: `${Math.min(100, (totalCalories / profile.targetCalories) * 100)}%` }}
              />
            </div>
          </div>

          {/* Proteins column */}
          <div className="bg-[#0A0A0A] p-5 border border-[#222222] rounded-xl">
            <p className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">OQSIL (PRO)</p>
            <p className="text-2xl font-black italic text-zinc-100 tracking-tight mt-1.5 font-sans">
              {totalProtein}G <span className="text-xs uppercase font-mono font-bold text-[#666666]">/ {targetProt}G</span>
            </p>
            <div className="w-full h-2 bg-[#181818] rounded-none mt-4 overflow-hidden">
              <div 
                className="h-full bg-neon transition-all duration-500"
                style={{ width: `${Math.min(100, (totalProtein / targetProt) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs column */}
          <div className="bg-[#0A0A0A] p-5 border border-[#222222] rounded-xl">
            <p className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">UGLEVODLAR (CARB)</p>
            <p className="text-2xl font-black italic text-zinc-100 tracking-tight mt-1.5 font-sans">
              {totalCarbs}G <span className="text-xs uppercase font-mono font-bold text-[#666666]">/ {targetCarbs}G</span>
            </p>
            <div className="w-full h-2 bg-[#181818] rounded-none mt-4 overflow-hidden">
              <div 
                className="h-full bg-neon transition-all duration-500"
                style={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fats column */}
          <div className="bg-[#0A0A0A] p-5 border border-[#222222] rounded-xl">
            <p className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-wider">YOG'LAR (FAT)</p>
            <p className="text-2xl font-black italic text-zinc-100 tracking-tight mt-1.5 font-sans">
              {totalFat}G <span className="text-xs uppercase font-mono font-bold text-[#666666]">/ {targetFat}G</span>
            </p>
            <div className="w-full h-2 bg-[#181818] rounded-none mt-4 overflow-hidden">
              <div 
                className="h-full bg-neon transition-all duration-500"
                style={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="meals-parent-layout">
        
        {/* Left Side: Food logs by categories with Uzbekistan presets (7cols) */}
        <div className="lg:col-span-7 bg-[#111111] border border-[#222222] p-6 rounded-2xl space-y-5" id="meals-diary">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <h4 className="font-mono text-[10px] font-black uppercase text-[#888888] tracking-widest flex items-center gap-2">
              <Apple className="text-neon" size={14} /> OVQATLANISH KUNDALIGI
            </h4>
            <span className="font-mono text-xs text-neon font-black">BARCHASI: {totalCalories} KKAL</span>
          </div>

          {/* Preset Buttons Grid */}
          <div className="space-y-2">
            <p className="text-[9px] text-[#666666] font-mono font-bold tracking-wider uppercase">TEZKOR QO'SHISH (PRESETLAR)</p>
            <div className="flex flex-wrap gap-2" id="presets-container">
              {UZBEK_FOOD_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => onAddFood({
                    name: preset.name,
                    calories: preset.calories,
                    protein: preset.protein,
                    carbs: preset.carbs,
                    fat: preset.fat,
                    mealType: activeMealSection
                  })}
                  className="px-3 py-1.5 text-[11px] font-sans font-semibold bg-[#181818] border border-[#222222] hover:border-neon text-[#888888] hover:text-[#FFFFFF] rounded-sm transition-all duration-150 active:scale-95 cursor-pointer"
                >
                  + {preset.name} ({preset.calories} kkal)
                </button>
              ))}
            </div>
          </div>

          {/* Meal Section Filter tabs */}
          <div className="flex gap-1.5 bg-[#0A0A0A] p-1.5 border border-[#222222] rounded-xl" id="meal-type-tabs">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((meal) => (
              <button
                key={meal}
                onClick={() => setActiveMealSection(meal)}
                className={`flex-1 py-1.5 px-2 text-center text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-150 cursor-pointer ${
                  activeMealSection === meal 
                    ? 'bg-neon text-black shadow-md' 
                    : 'text-[#666666] hover:text-[#CCCCCC]'
                }`}
              >
                {meal === 'breakfast' && 'Nonushta'}
                {meal === 'lunch' && 'Tushlik'}
                {meal === 'dinner' && 'Kechki ovqat'}
                {meal === 'snack' && 'Yengil tamaddi'}
              </button>
            ))}
          </div>

          {/* Logged Item List for selected target categories */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1" id="meals-list">
            {todayFoods.filter(item => item.mealType === activeMealSection).length === 0 ? (
              <div className="py-14 border border-[#222222] bg-[#0A0A0A] rounded-xl text-center space-y-3">
                <Coffee className="mx-auto text-[#333333]" size={24} />
                <p className="text-xs font-bold uppercase tracking-wide text-[#666666]">BU BO'LIMGA HALI TAOM KIRITILMAGAN.</p>
                <p className="text-[10px] text-[#444444] uppercase font-semibold">Presetlar orqali yoki pastdagi AI tahlili orqali qo'sha olasiz.</p>
              </div>
            ) : (
              todayFoods
                .filter(item => item.mealType === activeMealSection)
                .map((food) => (
                  <div 
                    key={food.id} 
                    className="p-3 bg-[#181818] hover:bg-[#1C1C1C] border border-[#222222] hover:border-[#333333] transition-all rounded-xl flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-black text-[#F5F5F5] uppercase tracking-wide">{food.name}</p>
                      <div className="flex items-center gap-2 font-mono font-bold text-[10px]">
                        <span className="text-neon">{food.calories} KKAL</span>
                        <span className="text-[#333333]">|</span>
                        <span className="text-[#888888]">OQSIL: {food.protein}G</span>
                        <span className="text-[#333333]">•</span>
                        <span className="text-[#888888]">UGL: {food.carbs}G</span>
                        <span className="text-[#333333]">•</span>
                        <span className="text-[#888888]">YOG': {food.fat}G</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteFood(food.id)}
                      className="p-2 border border-[#222222] hover:border-red-900 bg-[#111111] text-[#888888] hover:text-red-500 rounded-lg transition-all cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
            )}
          </div>

          {/* Manual Input form inside the matching section */}
          <div className="bg-[#0A0A0A] border border-[#222222]/80 p-4 rounded-xl">
            <p className="text-[10px] font-mono font-black text-[#888888] tracking-widest mb-2.5 flex items-center gap-1.5 uppercase">
              <Plus size={11} className="text-neon" /> YANGI TAOM YOZISH ({
                activeMealSection === 'breakfast' ? 'NONUSHTA' :
                activeMealSection === 'lunch' ? 'TUSHLIK' :
                activeMealSection === 'dinner' ? 'KECHKI OVQAT' : 'YENGIL TAMADDI'
              })
            </p>

            <form onSubmit={handleManualAdd} className="grid grid-cols-1 md:grid-cols-12 gap-2 text-xs">
              <div className="md:col-span-4">
                <input
                  type="text"
                  required
                  placeholder="Ovqat masalan: Olma..."
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full text-xs font-sans font-semibold bg-[#111111] border border-[#222222] focus:border-neon rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none transition-all placeholder-zinc-700"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  required
                  placeholder="Kkal..."
                  value={manualCal}
                  onChange={(e) => setManualCal(e.target.value)}
                  className="w-full font-mono font-bold text-center bg-[#111111] border border-[#222222] focus:border-neon rounded-lg px-2 py-1.5 text-zinc-100 focus:outline-none transition-all placeholder-zinc-700"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  placeholder="Oqsilg..."
                  value={manualProt}
                  onChange={(e) => setManualProt(e.target.value)}
                  className="w-full font-mono text-center bg-[#111111] border border-[#222222]/80 focus:border-neon rounded-lg px-2 py-1.5 text-zinc-100 focus:outline-none transition-all placeholder-zinc-800"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  placeholder="Ugl(g)..."
                  value={manualCarb}
                  onChange={(e) => setManualCarb(e.target.value)}
                  className="w-full font-mono text-center bg-[#111111] border border-[#222222]/80 focus:border-neon rounded-lg px-2 py-1.5 text-zinc-100 focus:outline-none transition-all placeholder-zinc-800"
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-1.5">
                <input
                  type="number"
                  placeholder="Yog'g..."
                  value={manualFat}
                  onChange={(e) => setManualFat(e.target.value)}
                  className="w-full font-mono text-center bg-[#111111] border border-[#222222]/80 focus:border-neon rounded-lg px-2 py-1.5 text-zinc-100 focus:outline-none transition-all placeholder-zinc-800"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-neon hover:bg-white text-black font-black rounded-lg transition-all active:scale-90 cursor-pointer"
                  title="Qo'shish"
                >
                  <Plus size={16} className="stroke-[3]" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Side: Smart AI Meal Analyser Component (5cols) */}
        <div className="lg:col-span-5 space-y-4" id="ai-analyzer-logs">
          
          {/* AI natural input box */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl space-y-4">
            <h4 className="font-mono text-[10px] font-black uppercase text-[#888888] tracking-widest flex items-center gap-2">
              <Sparkles className="text-neon" size={14} /> SUN'IY INTELLEKT ORQALI TAOM TAHLILI
            </h4>
            <p className="text-xs font-semibold uppercase text-[#888888] leading-normal font-sans">
              Yegan ovqatingizni erkin o'zbek tilida yozing. Masalan: <i>"Bugun tushlikka bitta kosa osh, bitta somsa va bir kosa sabzavotli salat yedim"</i>
            </p>

            <form onSubmit={handleAiAnalysis} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="Yegan taomlaringizni erkin tilda yozing..."
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                className="w-full text-xs bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-xl p-4 text-zinc-300 focus:outline-none transition-all placeholder-zinc-750 leading-relaxed font-sans"
              />

              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-3 bg-neon text-black hover:bg-white disabled:bg-[#222222] disabled:text-[#444444] font-black uppercase tracking-wider rounded-lg text-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(204,255,0,0.1)]"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} /> AI hisoblamoqda...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> TAHLIL QILISH VA KALORIYANI ANIQLASH
                  </>
                )}
              </button>
            </form>

            {aiError && (
              <div className="p-3 bg-red-950/20 border border-red-900/40 text-red-400 text-xs font-mono font-bold uppercase rounded-lg">
                {aiError}
              </div>
            )}
          </div>

          {/* AI results container (AnimatePresence) */}
          <AnimatePresence>
            {aiResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#111111] border border-[#222222] p-6 rounded-2xl space-y-4"
                id="ai-results-pane"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-mono font-black text-neon tracking-widest uppercase">TAHLIL NATIJALARI (TAXMINIY)</h5>
                  <span className="text-[9px] text-[#666666] font-mono font-bold uppercase">BO'LIM: NONUSHTA / TUSHLIK</span>
                </div>

                <div className="bg-[#0A0A0A] p-4 border border-[#222222] rounded-xl text-xs text-[#888888] font-semibold italic leading-relaxed">
                  "{aiResult.summary}"
                </div>

                <div className="space-y-2">
                  {aiResult.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-[#0A0A0A] border border-[#222222] rounded-xl flex justify-between gap-4 text-xs font-mono font-bold">
                      <div>
                        <p className="text-zinc-200 font-sans font-black uppercase tracking-wide">{item.name}</p>
                        <p className="text-[9px] text-[#666666] uppercase mt-1">
                          Oqsil: {item.protein}g • Ugl: {item.carbs}g • Yog': {item.fat}g
                        </p>
                      </div>
                      <div className="text-right text-neon font-black self-center">
                        {item.calories} Kkal
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleImportAiItems}
                  className="w-full py-3 bg-[#181818] hover:bg-neon border border-[#222222] hover:border-transparent hover:text-black text-zinc-300 font-black text-xs uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  id="btn-import-ai-meals"
                >
                  <Check size={14} className="stroke-[3]" /> USHBU MAHSULOTLARNI KUNDALIKKA QO'SHISH
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
