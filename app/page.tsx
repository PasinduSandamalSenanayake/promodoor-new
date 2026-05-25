'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';


type Phase = 'focus' | 'revision' | 'break' | 'longRevision' | 'longBreak';

const TIMES: Record<Phase, number> = {
  focus: 21 * 60,
  revision: 4 * 60,
  break: 5 * 60,
  longRevision: 20 * 60,
  longBreak: 30 * 60,
};

export default function GuestTimer() {
  const [phase, setPhase] = useState<Phase>('focus'); 
  const [timeLeft, setTimeLeft] = useState<number>(TIMES.focus);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [loopCount, setLoopCount] = useState<number>(1); 

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignupModal, setShowSignupModal] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handlePhaseTransition();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handlePhaseTransition = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(e => console.log("Audio block:", e));
    }

    if (phase === 'focus') {
      if (loopCount === 4) {
        setPhase('longRevision');
        setTimeLeft(TIMES.longRevision);
      } else {
        setPhase('revision');
        setTimeLeft(TIMES.revision);
      }
    } else if (phase === 'revision') {
      setPhase('break');
      setTimeLeft(TIMES.break);
    } else if (phase === 'longRevision') {
      setPhase('longBreak');
      setTimeLeft(TIMES.longBreak);
    } else if (phase === 'break' || phase === 'longBreak') {
      setPhase('focus');
      setTimeLeft(TIMES.focus);
      setLoopCount((prev) => (prev === 4 ? 1 : prev + 1));
      
      setIsActive(false);
    }
  };

  const skipToNext = () => {
    setIsActive(false);
    if (phase === 'focus') {
      if (loopCount === 4) {
        setPhase('longRevision');
        setTimeLeft(TIMES.longRevision);
      } else {
        setPhase('revision');
        setTimeLeft(TIMES.revision);
      }
    } else if (phase === 'revision') {
      setPhase('break');
      setTimeLeft(TIMES.break);
    } else if (phase === 'longRevision') {
      setPhase('longBreak');
      setTimeLeft(TIMES.longBreak);
    } else if (phase === 'break' || phase === 'longBreak') {
      setPhase('focus');
      setTimeLeft(TIMES.focus);
      setLoopCount((prev) => (prev === 4 ? 1 : prev + 1));
    }
  };

  const skipToPrevious = () => {
    setIsActive(false);
    if (phase === 'focus') {
      if (loopCount === 1) {
        setPhase('longBreak');
        setTimeLeft(TIMES.longBreak);
        setLoopCount(4);
      } else {
        setPhase('break');
        setTimeLeft(TIMES.break);
        setLoopCount((prev) => prev - 1);
      }
    } else if (phase === 'revision') {
      setPhase('focus');
      setTimeLeft(TIMES.focus);
    } else if (phase === 'break') {
      setPhase('revision');
      setTimeLeft(TIMES.revision);
    } else if (phase === 'longRevision') {
      setPhase('focus');
      setTimeLeft(TIMES.focus);
    } else if (phase === 'longBreak') {
      setPhase('longRevision');
      setTimeLeft(TIMES.longRevision);
    }
  };

  const startTimer = () => {
    setIsActive(true);
    if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => {
            audioRef.current?.pause();
            if (audioRef.current) audioRef.current.currentTime = 0;
        }).catch(() => console.log("Audio unlock failed"));
    }
  };

  const stopTimer = () => setIsActive(false);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(TIMES[phase]);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseConfig = () => {
    switch (phase) {
      case 'focus':
        return { color: 'bg-[#6366F1]', label: 'Focus Time' };
      case 'revision':
        return { color: 'bg-[#F59E0B]', label: 'Revision Time' };
      case 'break':
        return { color: 'bg-[#10B981]', label: 'Break Time' };
      case 'longRevision':
        return { color: 'bg-[#F59E0B]', label: 'Long Revision' };
      case 'longBreak':
        return { color: 'bg-[#10B981]', label: 'Long Break' };
      default:
        return { color: 'bg-[#6366F1]', label: 'Focus Time' };
    }
  };

  const config = getPhaseConfig();

  const progress = timeLeft / TIMES[phase];
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
      
      <audio ref={audioRef} src="/sounds/chime.mp3" preload="auto" />

      <header className="relative z-50 flex justify-between items-center px-8 py-4 bg-[#0A0F1B]">
        <h1 className="text-2xl font-medium tracking-wide">Promodoor</h1>
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowLoginModal(true)} 
            className="px-6 py-1.5 border border-white rounded-full text-sm active:bg-white/20 transition hover:bg-white/5"
          >
            Sign In
          </button>
          <button 
  onClick={() => setShowSignupModal(true)} 
  className="px-6 py-1.5 border border-white rounded-full text-sm active:bg-white/20 transition hover:bg-white/5"
>
  Sign Up
</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center -mt-10">
        <div className="text-2xl mb-8 tracking-wider">
          {loopCount} of 4
        </div>

        <div className="relative w-80 h-80 sm:w-96 sm:h-96 mb-8 flex items-center justify-center rounded-full shadow-2xl">
          
          <div className={`absolute inset-0 rounded-full transition-colors duration-500 ${config.color}`}></div>
          
          <svg 
            className="absolute inset-0 w-full h-full transform -rotate-90 -scale-y-100 pointer-events-none drop-shadow-md" 
            viewBox="0 0 100 100"
          >
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="none" 
              stroke="rgba(255,255,255,0.2)" 
              strokeWidth="4" 
            />
            <circle 
              cx="50" 
              cy="50" 
              r={radius} 
              fill="none" 
              stroke="white" 
              strokeWidth="4" 
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          <span className="relative z-10 text-7xl sm:text-8xl font-medium tracking-tight tabular-nums">
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
          
          <button 
            onClick={skipToPrevious}
            className="p-2 sm:p-1.5 border border-white rounded-md text-white active:bg-white/20 sm:hover:bg-white/10 transition-all flex items-center justify-center"
            aria-label="Skip to previous phase"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="19 20 9 12 19 4 19 20"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>

          <button 
            onClick={startTimer}
            className="px-6 py-2 sm:py-1 border border-white rounded-md text-lg active:bg-white/20 sm:hover:bg-white/10 transition-all"
          >
            start
          </button>
          <button 
            onClick={stopTimer}
            className="px-6 py-2 sm:py-1 border border-white rounded-md text-lg active:bg-white/20 sm:hover:bg-white/10 transition-all"
          >
            stop
          </button>
          <button 
            onClick={resetTimer}
            className="px-6 py-2 sm:py-1 border border-white rounded-md text-lg active:bg-white/20 sm:hover:bg-white/10 transition-all"
          >
            reset
          </button>

          <button 
            onClick={skipToNext}
            className="p-2 sm:p-1.5 border border-white rounded-md text-white active:bg-white/20 sm:hover:bg-white/10 transition-all flex items-center justify-center"
            aria-label="Skip to next phase"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 4 15 12 5 20 5 4"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>

        </div>

        <div className="text-4xl font-medium tracking-wide mt-2">
          {config.label}
        </div>
      </main>
      
      {/* Safe Modal Container */}
      <div className={showLoginModal ? "block" : "hidden"}>
        <LoginModal onClose={() => setShowLoginModal(false)} />
      </div>

      <div className={showSignupModal ? "block" : "hidden"}>
  <SignupModal onClose={() => setShowSignupModal(false)} />
</div>
    </div>
  );
}