/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Dumbbell, 
  Plus, 
  Check, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Loader2, 
  Flame, 
  BookOpen, 
  UserCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, WorkoutRoutine, WorkoutLogEntry } from '../types';

interface WorkoutPlannerProps {
  profile: UserProfile;
  routines: WorkoutRoutine[];
  setRoutines: (routines: WorkoutRoutine[]) => void;
  workoutLogs: WorkoutLogEntry[];
  onLogWorkout: (entry: Omit<WorkoutLogEntry, 'id' | 'date' | 'completedAt'>) => void;
  onDeleteLog: (id: string) => void;
}

export default function WorkoutPlanner({
  profile,
  routines,
  setRoutines,
  workoutLogs,
  onLogWorkout,
  onDeleteLog
}: WorkoutPlannerProps) {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Custom manual logger form states
  const [manualName, setManualName] = useState('');
  const [manualSets, setManualSets] = useState('3');
  const [manualReps, setManualReps] = useState('12');
  const [manualWeight, setManualWeight] = useState('');
  
  // Active day index mapping to view generated plans
  const [activeDayIdx, setActiveDayIdx] = useState<number | null>(0);
  
  // Generate Routine via backend API
  const handleGeneratePlan = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || "Tizimda xatolik yuz berdi");
      }
      
      // Save generating routine with temporary unique IDs
      if (data.routines) {
        const formatted: WorkoutRoutine[] = data.routines.map((r: any, rIdx: number) => ({
          id: `routine-${Date.now()}-${rIdx}`,
          dayName: r.dayName,
          exercises: r.exercises.map((ex: any, exIdx: number) => ({
            id: `ex-${Date.now()}-${rIdx}-${exIdx}`,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            notes: ex.notes || ''
          }))
        }));
        setRoutines(formatted);
        setActiveDayIdx(0);
      }
    } catch (err: any) {
      setApiError(err.message || "API xizmati bilan bog'lanib bo'lmadi. Keyinroq qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  // Log exercise from plan directly
  const handleLogFromPlan = (name: string, sets: number, reps: string, notes?: string) => {
    onLogWorkout({
      exerciseName: name,
      sets: sets,
      reps: reps,
      weight: undefined
    });
    
    // Quick notification / visual feedback can be triggered
  };

  // Handle manual submits
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    
    onLogWorkout({
      exerciseName: manualName.trim(),
      sets: parseInt(manualSets) || 3,
      reps: manualReps || '12',
      weight: manualWeight ? parseFloat(manualWeight) : undefined
    });
    
    setManualName('');
    setManualWeight('');
  };

  // Get today's logged workouts
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = workoutLogs.filter(log => log.date === todayStr);

  return (
    <div className="space-y-6" id="workout-tab">
      
      {/* Upper Action Panel */}
      <div className="bg-[#111111] border-l-4 border-neon border-y border-r border-[#222222] p-6 rounded-r-xl" id="generate-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <h2 className="text-[#666666] uppercase tracking-widest text-[9px] font-bold font-mono">INTELLEKTUAL STRATEGIYA</h2>
            <h3 className="text-2xl font-black italic text-zinc-100 flex items-center gap-2 tracking-tight uppercase">
              <Sparkles className="text-neon animate-pulse" size={18} /> HAFTALIK MASHQLAR <span className="text-neon">GENERATORI (AI)</span>
            </h3>
            <p className="text-xs text-[#888888] uppercase leading-relaxed font-semibold max-w-2xl">
              Gemini AI models tana tahlilingiz asosida (Yosh: {profile.age || 'X'} • Vazn: {profile.weight || 'X'} kg • Maqsad: {profile.goal}) haftalik progressiv mashg'ulot strukturasini tuzadi.
            </p>
          </div>
          
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="px-6 py-3.5 bg-neon hover:bg-white disabled:bg-[#222222] disabled:text-[#444444] text-black font-black uppercase text-xs tracking-wider rounded-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_12px_rgba(204,255,0,0.15)] active:scale-95 duration-150 cursor-pointer"
            id="btn-generate-plan"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={14} /> TUZILMOQDA...
              </>
            ) : (
              <>
                <Sparkles size={14} /> MASHQ REJASI TUZISH
              </>
            )}
          </button>
        </div>

        {apiError && (
          <div className="mt-4 p-3.5 bg-red-950/20 text-red-400 border border-red-900/40 rounded-lg text-xs uppercase font-mono font-bold">
            {apiError}
          </div>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="workout-grid">
        
        {/* Generated AI Workout Plans (Left columns) */}
        <div className="lg:col-span-7 bg-[#111111] border border-[#222222] p-6 rounded-2xl space-y-5" id="ai-plan-viewer">
          <div className="flex items-center justify-between pb-3 border-b border-[#222222]">
            <h4 className="font-mono text-[10px] font-black uppercase text-[#888888] tracking-widest flex items-center gap-2">
              <BookOpen className="text-neon" size={14} /> HAFTALIK REJA BILAN ISHLASH
            </h4>
            <span className="text-[10px] bg-[#181818] border border-[#222222] text-[#888888] font-mono px-2 py-0.5 rounded uppercase">AKTIV</span>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-neon/20 border-t-neon animate-spin" />
              <div>
                <p className="text-xs font-mono font-black uppercase tracking-widest text-[#888888]">ALGORITM TAQSIMOTI</p>
                <p className="text-[#F5F5F5] font-black italic text-lg mt-1">SHAXSIY MASHQLAR TUZILMOQDA</p>
                <p className="text-[11px] text-[#666666] mt-2 max-w-xs uppercase leading-relaxed font-bold">Temur yondashuv va intensivlik koeffitsiyentlarini sinxronizatsiya qilmoqda.</p>
              </div>
            </div>
          ) : routines.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-[#0A0A0A] border border-[#222222] rounded-2xl flex items-center justify-center mx-auto text-[#444444] rotate-6">
                <Dumbbell size={28} />
              </div>
              <div className="space-y-1">
                <p className="font-black italic text-[#F5F5F5] text-lg uppercase tracking-tight">REJA TUZILMAGAN</p>
                <p className="text-[11px] text-[#666666] uppercase max-w-sm mx-auto font-bold leading-relaxed">
                  Dasturingizni yaratish uchun tepadan "AI orqali reja tuzish" tugmasini tanlang professional yuklamalarga ega bo'lish uchun.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Day selection tabs */}
              <div className="flex flex-wrap gap-2" id="routine-tabs">
                {routines.map((day, idx) => (
                  <button
                    key={day.id}
                    onClick={() => setActiveDayIdx(idx)}
                    className={`px-4 py-2 text-xs font-bold font-sans uppercase tracking-wider transition-all duration-150 active:scale-95 rounded-sm ${
                      activeDayIdx === idx 
                        ? 'bg-neon text-black font-black shadow-[0_4px_12px_rgba(204,255,0,0.15)]' 
                        : 'bg-[#181818] border border-[#222222] text-[#888888] hover:text-[#FFFFFF]'
                    }`}
                  >
                    KUN {idx + 1}
                  </button>
                ))}
              </div>

              {/* Exercises in active day */}
              {activeDayIdx !== null && routines[activeDayIdx] && (
                <div className="space-y-4 pt-1">
                  <h5 className="text-sm font-black italic bg-[#0A0A0A] border border-[#222222] px-4 py-3 rounded-xl flex items-center justify-between uppercase">
                    <span className="text-[#F5F5F5]">{routines[activeDayIdx].dayName}</span>
                    <span className="text-[10px] font-mono font-bold text-neon bg-neon/10 px-2 py-0.5 rounded">
                      {routines[activeDayIdx].exercises.length} TA MASHQ
                    </span>
                  </h5>

                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {routines[activeDayIdx].exercises.map((item, itemIdx) => (
                      <div 
                        key={item.id} 
                        className="p-4 bg-[#181818] hover:bg-[#1C1C1C] border border-[#222222] hover:border-[#333333] transition-all rounded-xl flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-black text-[#F5F5F5] uppercase tracking-wide">{item.name}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#888888] font-mono font-bold">
                            <span className="text-neon">{item.sets} SETS</span>
                            <span>•</span>
                            <span className="text-[#CCCCCC]">{item.reps} REPS</span>
                            {item.notes && (
                              <>
                                <span>•</span>
                                <span className="italic text-[#666666] font-normal font-sans text-[11px]">{item.notes}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleLogFromPlan(item.name, item.sets, item.reps, item.notes)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] hover:bg-neon text-[#888888] hover:text-black border border-[#222222] hover:border-transparent text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer"
                          title="Bajarildi deb belgilash"
                        >
                          <Plus size={11} className="stroke-[2.5]" /> BAJARILDI
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Workout Logger & History (Right columns) */}
        <div className="lg:col-span-5 space-y-6" id="manual-logger-side">
          
          {/* Manual Workout Form */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl space-y-4">
            <h4 className="font-mono text-[10px] font-black uppercase text-[#888888] tracking-widest flex items-center gap-2">
              <Dumbbell className="text-neon" size={14} /> MASHQ QO'SHISH (QO'LDA)
            </h4>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Mashq nomi (masalan: Turnik)..."
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-3.5 py-2.5 text-[#F5F5F5] focus:outline-none transition-all placeholder-zinc-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[9px] font-mono font-bold text-[#666666] uppercase tracking-wider mb-1">Set soni</label>
                  <input
                    type="number"
                    min="1"
                    value={manualSets}
                    onChange={(e) => setManualSets(e.target.value)}
                    className="w-full font-mono text-center text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-2 py-2 text-zinc-100 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-[#666666] uppercase tracking-wider mb-1">Takrorlar</label>
                  <input
                    type="text"
                    value={manualReps}
                    onChange={(e) => setManualReps(e.target.value)}
                    className="w-full font-mono text-center text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-2 py-2 text-zinc-100 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono font-bold text-[#666666] uppercase tracking-wider mb-1">Vazn (kg)</label>
                  <input
                    type="number"
                    placeholder="—"
                    value={manualWeight}
                    onChange={(e) => setManualWeight(e.target.value)}
                    className="w-full font-mono text-center text-sm bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-lg px-2 py-2 text-zinc-100 focus:outline-none transition-all placeholder-zinc-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-neon hover:bg-white text-black transition-all text-xs font-black uppercase tracking-wider rounded-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-add-manual-workout"
              >
                <Plus size={13} className="stroke-[2.5]" /> LOG QILISH
              </button>
            </form>
          </div>

          {/* Today's Workout logs list */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl" id="today-workouts-list">
            <h4 className="font-mono text-[10px] font-black uppercase text-[#888888] tracking-widest flex items-center justify-between pb-3 border-b border-[#222222]">
              <span className="flex items-center gap-2">
                <UserCheck className="text-neon" size={14} /> BUGUNGI NATIJALAR
              </span>
              <span className="font-mono text-[10px] text-neon font-bold tracking-tight bg-neon/10 px-2 py-0.5 rounded">
                {todayLogs.length} LOG
              </span>
            </h4>

            <div className="mt-4 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {todayLogs.length === 0 ? (
                <p className="text-[11px] font-semibold text-[#555555] uppercase text-center py-8">
                  Bugun mashg'ulot belgilamadi.
                </p>
              ) : (
                todayLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-3 bg-[#181818] border border-[#222222] rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-black text-[#F5F5F5] uppercase tracking-wide">{log.exerciseName}</p>
                      <div className="flex items-center gap-2 font-mono font-bold text-[10px]">
                        <span className="text-neon">{log.sets} SETS</span>
                        <span className="text-[#666666]">x</span>
                        <span className="text-[#CCCCCC]">{log.reps} REPS</span>
                        {log.weight && (
                          <>
                            <span className="text-[#666666]">•</span>
                            <span className="text-neon">{log.weight} KG</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="p-2 border border-[#222222] hover:border-red-900 bg-[#111111] text-[#888888] hover:text-red-500 rounded-lg transition-all cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
