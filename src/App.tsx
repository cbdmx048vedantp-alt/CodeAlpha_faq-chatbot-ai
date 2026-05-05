import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, RefreshCw, Search, ArrowRight, Sparkles, Shield, Info } from 'lucide-react';
import { getFaqMatch, MatchResult } from './lib/nlp';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
  matchData?: MatchResult;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      text: "Hello. I'm your AI assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const match = await getFaqMatch(text);
      
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          text: match.answer || "I apologize, but I couldn't find a specific answer to that. Could you please rephrase?",
          timestamp: new Date(),
          matchData: match
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 600);
    } catch (error) {
      console.error(error);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#0a0a0a] font-sans text-slate-300 overflow-hidden relative selection:bg-indigo-500/30 selection:text-white">
      {/* Subtle Grid & ambient lights */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 sm:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-b from-indigo-500/20 to-transparent border border-indigo-500/30 text-indigo-400">
            <Bot size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-semibold text-white tracking-tight text-sm sm:text-base">Support Assistant</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">System Online</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          title="Reset Chat"
        >
          <RefreshCw size={16} />
        </button>
      </header>

      {/* Chat Space */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 py-8 sm:px-10 w-full flex flex-col items-center hide-scrollbar">
        <div className="max-w-3xl w-full flex flex-col gap-8 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex flex-col w-full", msg.type === 'user' ? "items-end" : "items-start")}>
                <div className={cn(
                  "flex gap-4 max-w-[92%] sm:max-w-[85%]",
                  msg.type === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  {/* Avatar */}
                  <div className={cn(
                    "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 border",
                    msg.type === 'user' 
                      ? "bg-white/5 border-white/10 text-slate-300" 
                      : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                  )}>
                    {msg.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>

                  {/* Message Flow */}
                  <div className={cn("flex flex-col gap-2 min-w-0 w-full", msg.type === 'user' ? "items-end" : "items-start")}>
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "rounded-2xl px-5 py-4 text-[14px] sm:text-[15px] leading-relaxed break-words",
                        msg.type === 'user' ? 
                          "bg-indigo-600 text-white rounded-tr-sm" : 
                          "bg-white/5 border border-white/5 text-slate-200 rounded-tl-sm flex-1 shrink-0"
                      )}
                    >
                      {msg.text}
                    </motion.div>
                    
                    <div className="flex items-center justify-end gap-3 px-1 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.matchData && msg.matchData.confidence_score > 0 && (
                        <span className="flex items-center gap-1 text-indigo-400">
                          <Sparkles size={10} />
                          Match: {(msg.matchData.confidence_score * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Intelligent Suggestions */}
                {msg.matchData && msg.matchData.suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-4 ml-12 sm:ml-13 flex flex-col gap-2.5 max-w-[85%]"
                  >
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">Related Queries</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {msg.matchData.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(suggestion)}
                          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl transition-all border border-white/5 text-xs font-medium flex items-center justify-between sm:justify-start gap-4 group text-left"
                        >
                          <span className="line-clamp-2 sm:line-clamp-1 flex-1 leading-snug">{suggestion}</span>
                          <ArrowRight size={14} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <div className="flex items-start gap-4 w-full">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                <Bot size={16} />
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-duration:800ms]" />
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-duration:800ms] [animation-delay:200ms]" />
                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-duration:800ms] [animation-delay:400ms]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Console */}
      <footer className="relative z-20 bg-[#0a0a0a]/90 backdrop-blur-2xl border-t border-white/5 p-4 sm:p-6 pb-6 sm:pb-8 w-full">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="relative flex items-end gap-3 sm:gap-4 w-full">
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all text-sm sm:text-[15px] font-medium placeholder:text-slate-500 text-white shadow-inner"
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className={cn(
                "h-[54px] w-[54px] rounded-2xl flex items-center justify-center transition-all shrink-0 border",
                input.trim() 
                  ? "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.3)]" 
                  : "bg-white/5 border-white/10 text-slate-500 cursor-not-allowed"
              )}
            >
              <Send size={18} strokeWidth={2} />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-6 opacity-40">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              <Shield size={10} />
              End-to-End Encryption
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-600" />
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              <Info size={10} />
              AI Studio Output
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent; 
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}

