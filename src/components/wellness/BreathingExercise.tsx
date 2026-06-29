import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, Wind, StopCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
}

type BreathingMode = 'box' | 'deep' | 'relax' | 'stress' | 'sleep';

const modes = {
  box: { name: 'Box Breathing', inhale: 4, hold1: 4, exhale: 4, hold2: 4, color: 'from-blue-400 to-indigo-600', description: 'Balance & Focus' },
  deep: { name: 'Deep Breathing', inhale: 5, hold1: 0, exhale: 5, hold2: 0, color: 'from-emerald-400 to-teal-600', description: 'Oxygenate & Energize' },
  relax: { name: 'Relax Mode', inhale: 4, hold1: 0, exhale: 6, hold2: 0, color: 'from-violet-400 to-purple-600', description: 'Calm the mind' },
  stress: { name: 'Stress Relief', inhale: 4, hold1: 2, exhale: 8, hold2: 0, color: 'from-rose-400 to-orange-600', description: 'Lower heart rate' },
  sleep: { name: 'Sleep Mode', inhale: 4, hold1: 7, exhale: 8, hold2: 0, color: 'from-indigo-800 to-blue-900', description: 'Drift into sleep' },
};

type Phase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'idle';

export function BreathingExercise({ isOpen, onClose }: BreathingExerciseProps) {
  const [activeMode, setActiveMode] = useState<BreathingMode>('box');
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [totalTimeLeft, setTotalTimeLeft] = useState(300); // 5 mins
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Responsive particle count based on screen width
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = isMobile ? 5 : 15;

  const modeData = modes[activeMode];
  const totalSessionTime = 300;

  // Sound Engine (Web Audio API)
  const playPhaseSound = useCallback((currentPhase: Phase) => {
    if (isMuted || currentPhase === 'idle') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (currentPhase === 'inhale') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + modeData.inhale); // A4
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + modeData.inhale / 2);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + modeData.inhale);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + modeData.inhale);
      } else if (currentPhase === 'exhale') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + modeData.exhale);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + modeData.exhale / 2);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + modeData.exhale);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + modeData.exhale);
      }
    } catch (e) {
      console.warn("Audio context not supported or failed", e);
    }
  }, [isMuted, modeData]);

  useEffect(() => {
    let phaseTimer: NodeJS.Timeout;
    
    if (isActive && phase !== 'idle' && !isComplete) {
      phaseTimer = setInterval(() => {
        setPhaseTimeLeft((prev) => {
          if (prev <= 1) {
            // Transition to next phase
            let nextPhase: Phase = 'idle';
            let nextTime = 0;
            
            if (phase === 'inhale') {
              if (modeData.hold1 > 0) {
                nextPhase = 'hold1';
                nextTime = modeData.hold1;
              } else {
                nextPhase = 'exhale';
                nextTime = modeData.exhale;
              }
            } else if (phase === 'hold1') {
              nextPhase = 'exhale';
              nextTime = modeData.exhale;
            } else if (phase === 'exhale') {
              if (modeData.hold2 > 0) {
                nextPhase = 'hold2';
                nextTime = modeData.hold2;
              } else {
                setCyclesCompleted(c => c + 1);
                nextPhase = 'inhale';
                nextTime = modeData.inhale;
              }
            } else if (phase === 'hold2') {
              setCyclesCompleted(c => c + 1);
              nextPhase = 'inhale';
              nextTime = modeData.inhale;
            }
            
            setPhase(nextPhase);
            playPhaseSound(nextPhase);
            if ('vibrate' in navigator) {
              navigator.vibrate(50);
            }
            return nextTime;
          }
          return prev - 1;
        });
        
        setTotalTimeLeft((prev) => {
          if (prev <= 1) {
            setIsComplete(true);
            setIsActive(false);
            setPhase('idle');
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#34d399', '#60a5fa', '#a78bfa']
            });
            return 0;
          }
          return prev - 1;
        });
        
      }, 1000);
    }
    
    return () => clearInterval(phaseTimer);
  }, [isActive, phase, modeData, isComplete, playPhaseSound]);

  const toggleTimer = () => {
    if (!isActive && phase === 'idle') {
      setPhase('inhale');
      setPhaseTimeLeft(modeData.inhale);
      playPhaseSound('inhale');
      if ('vibrate' in navigator) navigator.vibrate(50);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setPhase('idle');
    setTotalTimeLeft(totalSessionTime);
    setPhaseTimeLeft(0);
    setCyclesCompleted(0);
    setIsComplete(false);
  };
  
  const endSession = () => {
    setIsActive(false);
    setPhase('idle');
    setIsComplete(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const circleVariants = {
    idle: { scale: 1, opacity: 0.4, transition: { duration: 1 } },
    inhale: { scale: 1.8, opacity: 1, transition: { duration: modeData.inhale, ease: 'easeInOut' } },
    hold1: { scale: 1.8, opacity: 0.8, transition: { duration: modeData.hold1 } },
    exhale: { scale: 1, opacity: 0.4, transition: { duration: modeData.exhale, ease: 'easeInOut' } },
    hold2: { scale: 1, opacity: 0.4, transition: { duration: modeData.hold2 } }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale': return 'INHALE';
      case 'hold1': return 'HOLD';
      case 'exhale': return 'EXHALE';
      case 'hold2': return 'HOLD';
      default: return 'READY';
    }
  };

  const progressPercentage = Math.round(((totalSessionTime - totalTimeLeft) / totalSessionTime) * 100);

  // Optimization: Memoize particles to avoid re-renders
  const particles = useMemo(() => {
    return [...Array(particleCount)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white rounded-full blur-[1px]"
        initial={{ 
          x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
          y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
          width: Math.random() * 8 + 2,
          height: Math.random() * 8 + 2,
          opacity: Math.random() * 0.3 + 0.1
        }}
        animate={{ 
          y: -100,
          x: `calc(${Math.random() * 100}vw)`
        }}
        transition={{
          duration: 15 + Math.random() * 20,
          repeat: Infinity,
          ease: 'linear',
          delay: Math.random() * 10
        }}
      />
    ));
  }, [particleCount]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-slate-950 text-white overflow-hidden pb-safe"
      >
        {/* Animated Background Gradients */}
        <motion.div 
          className={cn("absolute inset-0 opacity-40 bg-gradient-to-br transition-colors duration-1000", modeData.color)}
          animate={{
            scale: phase === 'inhale' || phase === 'hold1' ? 1.05 : 1,
            opacity: phase === 'inhale' || phase === 'hold1' ? 0.6 : 0.3
          }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles}
        </div>

        {/* Top Navigation */}
        <header className="relative z-10 flex flex-row items-center justify-between p-4 md:p-6 lg:px-8 w-full shrink-0">
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md shrink-0"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          
          <h1 className="text-lg lg:text-xl font-bold tracking-widest uppercase truncate px-2">
            Breathing
          </h1>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md shrink-0"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </header>

        <main className="flex-1 flex flex-col w-full relative z-10 overflow-y-auto overflow-x-hidden hide-scrollbar">
          
          {/* Scrollable Breathing Modes */}
          <div className="w-full shrink-0 px-4 py-2 flex overflow-x-auto hide-scrollbar snap-x snap-mandatory lg:justify-center">
            <div className="flex gap-2 pb-2">
              {(Object.entries(modes) as [BreathingMode, typeof modes['box']][]).map(([key, mode]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveMode(key);
                    resetTimer();
                  }}
                  className={cn(
                    "snap-start px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 min-h-[48px] border",
                    activeMode === key 
                      ? "bg-white text-slate-900 border-white shadow-lg" 
                      : "bg-black/20 text-white/80 border-white/10 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          {!isComplete ? (
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-start lg:justify-center w-full px-4 lg:px-12 py-6 gap-8 lg:gap-16 max-w-7xl mx-auto">
              
              {/* Left Column (Mobile: Top) - Circle & Phase Info */}
              <div className="flex flex-col items-center justify-center w-full lg:w-1/2 flex-1 min-h-[300px]">
                
                {/* Breathing Circle Container */}
                <div className="relative w-[180px] h-[180px] md:w-[240px] md:h-[240px] lg:w-[320px] lg:h-[320px] flex items-center justify-center mb-8">
                  {/* Outer Glow */}
                  <motion.div 
                    className={cn("absolute inset-0 rounded-full blur-[60px] opacity-30 bg-gradient-to-br", modeData.color)}
                    variants={circleVariants}
                    animate={phase}
                    initial="idle"
                  />
                  
                  {/* Animated Core Circle */}
                  <motion.div 
                    className="absolute w-[60%] h-[60%] rounded-full bg-white/10 backdrop-blur-2xl border-2 border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center z-10"
                    variants={circleVariants}
                    animate={phase}
                    initial="idle"
                  >
                    <Wind size={40} className="text-white/50" />
                  </motion.div>
                </div>

                {/* Phase Text & Timer */}
                <div className="flex flex-col items-center justify-center text-center">
                  <AnimatePresence mode="wait">
                    <motion.h2 
                      key={phase}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-3xl lg:text-4xl font-bold tracking-[0.2em] uppercase text-white drop-shadow-md mb-2 h-10 flex items-center justify-center"
                    >
                      {getPhaseText()}
                    </motion.h2>
                  </AnimatePresence>
                  
                  <div className="flex flex-col items-center mb-6">
                    <p className="text-5xl lg:text-6xl font-light font-mono tabular-nums text-white">
                      {formatTime(totalTimeLeft)}
                    </p>
                    <p className="text-sm text-white/50 tracking-widest uppercase mt-2 font-medium">Session Time</p>
                  </div>
                </div>

              </div>

              {/* Right Column (Mobile: Bottom) - Info, Controls & Stats */}
              <div className="flex flex-col w-full lg:w-1/2 max-w-md mx-auto gap-6 items-stretch lg:justify-center lg:py-12">
                
                {/* Progress Ring / Bar Equivalent */}
                <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Progress</p>
                      <p className="text-2xl font-bold">{progressPercentage}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Current Cycle</p>
                      <p className="text-2xl font-bold">{cyclesCompleted + 1}</p>
                    </div>
                  </div>
                  
                  {/* Smooth Progress Bar */}
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </div>

                  {/* Phase Indicators */}
                  <div className="flex gap-1 items-center mt-6 h-1.5">
                    <div className={cn("flex-1 h-full rounded-full transition-all duration-300", phase === 'inhale' ? "bg-white" : "bg-white/20")} />
                    <div className={cn("flex-1 h-full rounded-full transition-all duration-300", phase === 'hold1' ? "bg-white" : "bg-white/20", modeData.hold1 === 0 ? "hidden" : "")} />
                    <div className={cn("flex-1 h-full rounded-full transition-all duration-300", phase === 'exhale' ? "bg-white" : "bg-white/20")} />
                    <div className={cn("flex-1 h-full rounded-full transition-all duration-300", phase === 'hold2' ? "bg-white" : "bg-white/20", modeData.hold2 === 0 ? "hidden" : "")} />
                  </div>
                  <p className="text-center text-xs text-white/40 font-mono mt-3 uppercase tracking-widest h-4">
                    {phase !== 'idle' ? `${phaseTimeLeft}s remaining in phase` : 'Waiting to start'}
                  </p>
                </div>

                {/* Session Information / Details Grid */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-1">Pattern</p>
                    <p className="text-sm font-medium">{modeData.inhale}-{modeData.hold1}-{modeData.exhale}-{modeData.hold2}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-1">Goal</p>
                    <p className="text-sm font-medium">{modeData.description}</p>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex flex-wrap gap-3 mt-2">
                  <button 
                    onClick={toggleTimer}
                    className="flex-1 min-h-[56px] min-w-[120px] rounded-2xl bg-white text-slate-900 flex items-center justify-center gap-2 hover:bg-slate-100 transition-all font-bold text-lg active:scale-95 shadow-lg"
                  >
                    {isActive ? (
                      <><Pause size={20} className="fill-current" /> Pause</>
                    ) : (
                      <><Play size={20} className="fill-current" /> {totalTimeLeft < totalSessionTime ? 'Resume' : 'Start'}</>
                    )}
                  </button>

                  <button 
                    onClick={resetTimer}
                    className="min-h-[56px] min-w-[56px] rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all active:scale-95"
                    aria-label="Restart"
                  >
                    <RotateCcw size={22} />
                  </button>

                  <button 
                    onClick={endSession}
                    className="min-h-[56px] min-w-[56px] rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all active:scale-95"
                    aria-label="End Session"
                  >
                    <StopCircle size={22} />
                  </button>
                </div>
                
                {/* Tips Section */}
                <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex gap-3 items-start mt-2">
                  <Info size={18} className="text-blue-300 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-100/80 leading-relaxed">
                    Keep your shoulders relaxed and breathe deep into your belly. Close your eyes for deeper focus.
                  </p>
                </div>

              </div>
            </div>
          ) : (
            /* Completion Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 md:p-10 rounded-3xl w-full text-center shadow-2xl flex flex-col items-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
                >
                  <CheckCircle2 size={40} className="text-white" />
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Session Complete</h2>
                <p className="text-white/70 mb-8 text-base">You've successfully reset your nervous system.</p>
                
                <div className="grid grid-cols-2 gap-3 mb-8 w-full">
                  <div className="bg-black/20 border border-white/10 p-4 rounded-2xl">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-1">Duration</p>
                    <p className="text-2xl font-light font-mono tabular-nums">{formatTime(totalSessionTime - totalTimeLeft)}</p>
                  </div>
                  <div className="bg-black/20 border border-white/10 p-4 rounded-2xl">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-1">Cycles</p>
                    <p className="text-2xl font-light font-mono tabular-nums">{cyclesCompleted}</p>
                  </div>
                  <div className="bg-black/20 border border-white/10 p-4 rounded-2xl">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-1">Stress Red.</p>
                    <p className="text-2xl font-light text-emerald-400 tabular-nums">~24%</p>
                  </div>
                  <div className="bg-black/20 border border-white/10 p-4 rounded-2xl">
                    <p className="text-white/50 text-[10px] uppercase tracking-wider font-bold mb-1">XP Earned</p>
                    <p className="text-2xl font-light text-amber-400 tabular-nums">+{cyclesCompleted > 0 ? cyclesCompleted * 2 : 5}</p>
                  </div>
                </div>
                
                <button 
                  onClick={onClose}
                  className="w-full min-h-[56px] rounded-2xl bg-white text-slate-900 font-bold text-lg hover:bg-slate-100 transition-all active:scale-95 shadow-lg"
                >
                  Done
                </button>
              </motion.div>
            </div>
          )}
        </main>
      </motion.div>
    </AnimatePresence>
  );
}

