/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Apple, 
  MessageSquare, 
  Sparkles,
  RefreshCw,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import local components
import Dashboard from './components/Dashboard';
import WorkoutPlanner from './components/WorkoutPlanner';
import MealTracker from './components/MealTracker';
import AiCoach from './components/AiCoach';

// Import Types
import { 
  UserProfile, 
  WorkoutRoutine, 
  FoodLogItem, 
  WaterLogEntry, 
  StepsLogEntry, 
  ChatMessage, 
  WorkoutLogEntry 
} from './types';

// Default mock values to deliver an instant elegant visual content on first load
const DEFAULT_PROFILE: UserProfile = {
  name: "Firdavsbek",
  age: 23,
  weight: 74,
  height: 178,
  targetCalories: 2100,
  goal: 'build_muscle',
  experience: 'intermediate'
};

const DEFAULT_FOODS = (): FoodLogItem[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'init-food-1',
      name: 'Tuxumli Omlet (2ta tuxum)',
      calories: 180,
      protein: 14,
      carbs: 2,
      fat: 12,
      mealType: 'breakfast',
      date: today,
      timestamp: new Date().toISOString()
    },
    {
      id: 'init-food-2',
      name: 'Olma (1 dona o\'rtacha)',
      calories: 80,
      protein: 1,
      carbs: 20,
      fat: 0,
      mealType: 'snack',
      date: today,
      timestamp: new Date().toISOString()
    }
  ];
};

const DEFAULT_WATERS = (): WaterLogEntry[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { id: 'init-water-1', date: today, intakeMl: 750 }
  ];
};

const DEFAULT_STEPS = (): StepsLogEntry[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    { id: 'init-steps-1', date: today, stepsCount: 4200 }
  ];
};

const DEFAULT_CHAT = (): ChatMessage[] => {
  return [
    {
      id: 'init-chat-1',
      sender: 'bot',
      text: 'Salom Firdavsbek! Men sizning shaxsiy fitnes murabbiyi va dietologingiz Temurman. Jismoniy tayyorgarligi, ratsion yoki bugungi mashg\'ulotlar rejangiz bo\'yicha sizga qanday yordam bera olaman?',
      timestamp: new Date().toISOString()
    }
  ];
};

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workout' | 'meals' | 'coach'>('dashboard');

  // Core state declarations loaded from localStorage
  const [profile, setProfile] = useState<UserProfile>(() => {
    const cached = localStorage.getItem('fit_profile');
    return cached ? JSON.parse(cached) : DEFAULT_PROFILE;
  });

  const [routines, setRoutines] = useState<WorkoutRoutine[]>(() => {
    const cached = localStorage.getItem('fit_routines');
    return cached ? JSON.parse(cached) : [];
  });

  const [foodLogs, setFoodLogs] = useState<FoodLogItem[]>(() => {
    const cached = localStorage.getItem('fit_food_logs');
    return cached ? JSON.parse(cached) : DEFAULT_FOODS();
  });

  const [waterLogs, setWaterLogs] = useState<WaterLogEntry[]>(() => {
    const cached = localStorage.getItem('fit_water_logs');
    return cached ? JSON.parse(cached) : DEFAULT_WATERS();
  });

  const [stepsLogs, setStepsLogs] = useState<StepsLogEntry[]>(() => {
    const cached = localStorage.getItem('fit_steps_logs');
    return cached ? JSON.parse(cached) : DEFAULT_STEPS();
  });

  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogEntry[]>(() => {
    const cached = localStorage.getItem('fit_workout_logs');
    return cached ? JSON.parse(cached) : [];
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const cached = localStorage.getItem('fit_chat_history');
    return cached ? JSON.parse(cached) : DEFAULT_CHAT();
  });

  const [isCoachLoading, setIsCoachLoading] = useState(false);

  // Sync state to local storage on changes
  useEffect(() => {
    localStorage.setItem('fit_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('fit_routines', JSON.stringify(routines));
  }, [routines]);

  useEffect(() => {
    localStorage.setItem('fit_food_logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('fit_water_logs', JSON.stringify(waterLogs));
  }, [waterLogs]);

  useEffect(() => {
    localStorage.setItem('fit_steps_logs', JSON.stringify(stepsLogs));
  }, [stepsLogs]);

  useEffect(() => {
    localStorage.setItem('fit_workout_logs', JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem('fit_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper actions
  const handleAddWater = (amount: number) => {
    const updated = [...waterLogs];
    const todayIndex = updated.findIndex(w => w.date === todayStr);
    
    if (todayIndex >= 0) {
      updated[todayIndex].intakeMl += amount;
    } else {
      updated.push({
        id: `water-${Date.now()}`,
        date: todayStr,
        intakeMl: amount
      });
    }
    setWaterLogs(updated);
  };

  const handleResetWater = () => {
    const updated = waterLogs.filter(w => w.date !== todayStr);
    updated.push({
      id: `water-${Date.now()}`,
      date: todayStr,
      intakeMl: 0
    });
    setWaterLogs(updated);
  };

  const handleUpdateSteps = (steps: number) => {
    const updated = [...stepsLogs];
    const todayIndex = updated.findIndex(s => s.date === todayStr);

    if (todayIndex >= 0) {
      updated[todayIndex].stepsCount = steps;
    } else {
      updated.push({
        id: `steps-${Date.now()}`,
        date: todayStr,
        stepsCount: steps
      });
    }
    setStepsLogs(updated);
  };

  const handleLogWorkout = (entry: Omit<WorkoutLogEntry, 'id' | 'date' | 'completedAt'>) => {
    const newLogItem: WorkoutLogEntry = {
      id: `wl-${Date.now()}`,
      date: todayStr,
      completedAt: new Date().toISOString(),
      ...entry
    };
    setWorkoutLogs(prev => [newLogItem, ...prev]);
  };

  const handleDeleteWorkoutLog = (id: string) => {
    setWorkoutLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleAddFood = (item: Omit<FoodLogItem, 'id' | 'date' | 'timestamp'>) => {
    const newFood: FoodLogItem = {
      id: `fl-${Date.now()}`,
      date: todayStr,
      timestamp: new Date().toISOString(),
      ...item
    };
    setFoodLogs(prev => [newFood, ...prev]);
  };

  const handleDeleteFood = (id: string) => {
    setFoodLogs(prev => prev.filter(item => item.id !== id));
  };

  // AI Chat messaging logic
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `ch-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsCoachLoading(true);

    try {
      const response = await fetch('/api/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          userMessage: text
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.message || "Xizmatda muammo");
      }

      const botMsg: ChatMessage = {
        id: `ch-${Date.now()}-bot`,
        sender: 'bot',
        text: data.text,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (err: any) {
      const erroredBotMsg: ChatMessage = {
        id: `ch-${Date.now()}-err`,
        sender: 'bot',
        text: `Kechirasiz, Gemini API ulanishda xato bo'ldi. Iltimos, Sozlamalar -> Secrets panelida GEMINI_API_KEY borligini tasdiqlang.`,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, erroredBotMsg]);
    } finally {
      setIsCoachLoading(false);
    }
  };

  const handleClearChatHistory = () => {
    setChatHistory(DEFAULT_CHAT());
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-start p-3 md:p-6 select-none font-sans" id="app-viewport">
      
      {/* Decorative ambient elements - pure high-contrast clean typography mode */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-neon/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Screen Container resembling the extreme solid modular dashboard */}
      <div className="w-full max-w-5xl bg-[#111111] border border-[#222222] md:rounded-[24px] overflow-hidden flex flex-col shrink-0 z-10" id="main-frame-card">
        
        {/* Upper Header strip */}
        <header className="bg-[#0D0D0D] border-b border-[#222222] px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4" id="master-header">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-neon rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(204,255,0,0.2)] shrink-0">
              <Dumbbell size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-[#666666] uppercase tracking-widest text-[9px] font-bold font-mono">AQLLI MASHG'ULOTLAR ENGINE</h2>
              <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter leading-none">
                FITNES <span className="text-neon">KUNDALIGI</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#888888] font-mono select-all">
              {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
            </span>
            <div className="flex items-center gap-1.5 bg-[#181818] border border-[#2A2A2A] rounded-lg px-2.5 py-1 text-[9px] font-mono text-neon font-bold uppercase">
              <span className="w-1.5 h-1.5 bg-neon rounded-full animate-ping" />
              <span>AI Coach Online</span>
            </div>
          </div>
        </header>

        {/* Dynamic content rendering with modern fluid motion container */}
        <main className="p-4 md:p-6 min-h-[500px] overflow-x-hidden flex-1 bg-[#111111]" id="main-content-flow">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  profile={profile}
                  setProfile={setProfile}
                  foodLogs={foodLogs}
                  waterLogs={waterLogs}
                  onAddWater={handleAddWater}
                  onResetWater={handleResetWater}
                  stepsLogs={stepsLogs}
                  onUpdateSteps={handleUpdateSteps}
                  workoutLogCount={workoutLogs.filter(l => l.date === todayStr).length}
                />
              )}

              {activeTab === 'workout' && (
                <WorkoutPlanner
                  profile={profile}
                  routines={routines}
                  setRoutines={setRoutines}
                  workoutLogs={workoutLogs}
                  onLogWorkout={handleLogWorkout}
                  onDeleteLog={handleDeleteWorkoutLog}
                />
              )}

              {activeTab === 'meals' && (
                <MealTracker
                  profile={profile}
                  foodLogs={foodLogs}
                  onAddFood={handleAddFood}
                  onDeleteFood={handleDeleteFood}
                />
              )}

              {activeTab === 'coach' && (
                <AiCoach
                  chatHistory={chatHistory}
                  onSendMessage={handleSendMessage}
                  isLoading={isCoachLoading}
                  onClearHistory={handleClearChatHistory}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Core Tab Bar navigation representing elegant app bar */}
        <footer className="bg-[#0D0D0D] border-t border-[#222222] px-4 py-3.5 flex justify-around items-center" id="master-nav-tabs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-4 relative rounded-xl group transition-all text-xs font-bold uppercase tracking-wider ${
              activeTab === 'dashboard' ? 'text-neon' : 'text-[#666666] hover:text-[#AAAAAA]'
            }`}
            id="tab-btn-dashboard"
          >
            <LayoutDashboard size={18} className="transition-transform group-hover:scale-105" />
            <span className="text-[9px] font-mono font-bold tracking-tight">Bugun</span>
            {activeTab === 'dashboard' && (
              <motion.div layoutId="activeTabIndicator" className="absolute -bottom-3.5 left-1 right-1 h-[3px] bg-neon rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('workout')}
            className={`flex flex-col items-center gap-1 py-1 px-4 relative rounded-xl group transition-all text-xs font-bold uppercase tracking-wider ${
              activeTab === 'workout' ? 'text-neon' : 'text-[#666666] hover:text-[#AAAAAA]'
            }`}
            id="tab-btn-workout"
          >
            <Dumbbell size={18} className="transition-transform group-hover:scale-105" />
            <span className="text-[9px] font-mono font-bold tracking-tight">Mashq</span>
            {activeTab === 'workout' && (
              <motion.div layoutId="activeTabIndicator" className="absolute -bottom-3.5 left-1 right-1 h-[3px] bg-neon rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('meals')}
            className={`flex flex-col items-center gap-1 py-1 px-4 relative rounded-xl group transition-all text-xs font-bold uppercase tracking-wider ${
              activeTab === 'meals' ? 'text-neon' : 'text-[#666666] hover:text-[#AAAAAA]'
            }`}
            id="tab-btn-meals"
          >
            <Apple size={18} className="transition-transform group-hover:scale-105" />
            <span className="text-[9px] font-mono font-bold tracking-tight">Kaloriya</span>
            {activeTab === 'meals' && (
              <motion.div layoutId="activeTabIndicator" className="absolute -bottom-3.5 left-1 right-1 h-[3px] bg-neon rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('coach')}
            className={`flex flex-col items-center gap-1 py-1 px-4 relative rounded-xl group transition-all text-xs font-bold uppercase tracking-wider ${
              activeTab === 'coach' ? 'text-neon' : 'text-[#666666] hover:text-[#AAAAAA]'
            }`}
            id="tab-btn-coach"
          >
            <MessageSquare size={18} className="transition-transform group-hover:scale-105" />
            <span className="text-[9px] font-mono font-bold tracking-tight">AI Coach</span>
            {activeTab === 'coach' && (
              <motion.div layoutId="activeTabIndicator" className="absolute -bottom-3.5 left-1 right-1 h-[3px] bg-neon rounded-full" />
            )}
          </button>
        </footer>

      </div>
      
    </div>
  );
}
