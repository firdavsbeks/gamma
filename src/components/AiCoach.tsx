/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  MessageCircle, 
  Loader2, 
  HelpCircle,
  TrendingUp,
  Flame,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';

interface AiCoachProps {
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onClearHistory: () => void;
}

const FITNESS_FAQ_SUGGESTIONS = [
  "Mushak massasini tezroq oshirish uchun nimalar yeyish kerak?",
  "Uy sharoitida qorin sohasidagi yo'g'ni qanday ketkazsa bo'ladi?",
  "Mashg'ulotlardan oldin va keyin qancha suv ichish kerak?",
  "Yangi boshlovchilar haftada necha kun mashq qilishi maqbul?"
];

export default function AiCoach({
  chatHistory,
  onSendMessage,
  isLoading,
  onClearHistory
}: AiCoachProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const messageToSend = inputText.trim();
    setInputText('');
    await onSendMessage(messageToSend);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return;
    await onSendMessage(suggestion);
  };

  return (
    <div className="bg-[#111111] border border-[#222222] p-6 rounded-2xl flex flex-col h-[520px]" id="ai-coach-tab">
      
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-[#222222] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#333333] flex items-center justify-center text-neon relative">
            <Bot size={20} className="stroke-[2.5]" />
            <div className="absolute right-0 bottom-0 w-2.5 h-2.5 rounded-full bg-neon border border-black animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-black italic text-[#F5F5F5] text-sm flex items-center gap-2 leading-none uppercase tracking-tight">
              MURABBIY TEMUR <span className="text-[9px] bg-neon/15 text-neon font-mono font-bold tracking-widest px-2 py-0.5 rounded uppercase">AI COACH</span>
            </h3>
            <p className="text-[10px] text-[#666666] font-mono font-semibold uppercase mt-1">SHAXSIY FITNES VA NUTRISIOLOGIYA ASSISTENTI</p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="text-[9px] font-mono font-black text-[#666666] hover:text-red-500 border border-[#222222] hover:border-red-950 px-3 py-1.5 rounded transition-all uppercase cursor-pointer"
        >
          TARIXNI TOZALASH
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1 text-xs" id="messages-container">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0A0A0A] border border-[#222222] text-neon flex items-center justify-center rotate-6">
              <MessageCircle size={24} className="stroke-[2.5] animate-pulse" />
            </div>
            <div>
              <p className="text-[#F5F5F5] font-black italic text-lg uppercase tracking-tight">ASSALOMU ALAYKUM! MEN SIZNING AI MURABBIYINGIZMAN.</p>
              <p className="text-[#888888] text-[11px] mt-2 max-w-md uppercase leading-relaxed font-bold">
                Jismoniy mashg'ulotlar, to'g'ri ovqatlanish me'yorlari, sog'lom ozish yoki tana rivojlanishi bo'yicha maslahatlar olish uchun tayyor so'rovlarimizni tanlang:
              </p>
            </div>
            
            {/* Quick Presets FAQs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full max-w-lg pt-3 text-left" id="faq-preset-grid">
              {FITNESS_FAQ_SUGGESTIONS.map((faq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(faq)}
                  className="p-3 bg-[#0A0A0A] border-l-3 border-neon border-y border-r border-[#222222] text-[#888888] hover:text-[#FFFFFF] text-[10.5px] font-sans font-bold leading-relaxed rounded-r uppercase transition-all text-left flex items-start gap-2 cursor-pointer"
                >
                  <HelpCircle size={12} className="text-neon shrink-0 mt-0.5" />
                  <span>{faq}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chatHistory.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot Icon on Left */}
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-[#222222] flex items-center justify-center text-neon shrink-0">
                    <Bot size={15} />
                  </div>
                )}

                {/* Message Bubble */}
                <div 
                  className={`max-w-[75%] p-3.5 rounded-xl leading-relaxed text-xs shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-neon text-black font-black rounded-tr-none'
                      : 'bg-[#0A0A0A] border border-[#222222] text-[#F5F5F5]'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <span className={`block text-[8.5px] mt-2 font-mono font-bold text-right leading-none ${
                    msg.sender === 'user' ? 'text-black/60' : 'text-[#555555]'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* User Icon on Right */}
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-neon flex items-center justify-center text-black font-black text-xs shrink-0 font-sans">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            
            {/* Thinking / Loader state */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-[#222222] flex items-center justify-center text-neon shrink-0">
                  <Bot size={15} />
                </div>
                <div className="max-w-[75%] bg-[#0A0A0A] border border-[#222222] p-4 rounded-xl rounded-tl-none flex items-center gap-2.5">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-neon rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-neon rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-neon rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-[10px] text-[#666666] font-mono font-bold uppercase tracking-wider">TEMUR YOZMOQDA...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input container */}
      <form onSubmit={handleSubmit} className="flex gap-2.5 border-t border-[#222222] pt-4" id="coach-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          placeholder="O'zbek tilida savol bering (masalan: 'Mashqdan keyin qanday cho'zilish qilinadi?')..."
          className="flex-1 bg-[#0A0A0A] border border-[#222222] focus:border-neon rounded-xl px-4.5 py-3 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none transition-all disabled:opacity-50 font-sans font-semibold"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-3 bg-neon hover:bg-white disabled:bg-[#222222] text-black disabled:text-[#444444] rounded-xl flex items-center justify-center transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Send size={15} className="stroke-[2.5]" />
        </button>
      </form>

    </div>
  );
}
