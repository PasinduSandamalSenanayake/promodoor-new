'use client';

import { useState, useEffect, useRef } from 'react';
import SettingsModal from '../components/SettingsModal';
import ProfileModal from '../components/ProfileModal';
import { auth, db } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 

type Phase = 'focus' | 'revision' | 'break' | 'longRevision' | 'longBreak';

const DEFAULT_TIMES: Record<Phase, number> = {
  focus: 21 * 60,
  revision: 4 * 60,
  break: 5 * 60,
  longRevision: 21 * 60,
  longBreak: 30 * 60,
};

export default function DashboardTimer() {
  const [times, setTimes] = useState<Record<Phase, number>>(DEFAULT_TIMES);
  const [phase, setPhase] = useState<Phase>('focus'); 
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_TIMES.focus);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [loopCount, setLoopCount] = useState<number>(1); 

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // NEW: Multiple Audio Refs for different sounds
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const focusRef = useRef<HTMLAudioElement | null>(null);
  const revisionRef = useRef<HTMLAudioElement | null>(null);
  const breakRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().settings) {
            const savedTimes = docSnap.data().settings;
            setTimes(savedTimes);
            setTimeLeft(savedTimes['focus']); 
          } else {
            await setDoc(docRef, { settings: DEFAULT_TIMES }, { merge: true });
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      handlePhaseTransition();
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft]);

  const handlePhaseTransition = () => {
    let nextPhase: Phase = 'focus';

    // 1. Calculate the upcoming phase
    if (phase === 'focus') {
      nextPhase = loopCount === 4 ? 'longRevision' : 'revision';
    } else if (phase === 'revision') {
      nextPhase = 'break';
    } else if (phase === 'longRevision') {
      nextPhase = 'longBreak';
    } else if (phase === 'break' || phase === 'longBreak') {
      nextPhase = 'focus';
    }

    // 2. Update all UI states
    setPhase(nextPhase);
    setTimeLeft(times[nextPhase]);
    
    // If returning to focus after a break, pause the timer and update the cycle count
    if (nextPhase === 'focus' && (phase === 'break' || phase === 'longBreak')) {
      setLoopCount((prev) => (prev === 4 ? 1 : prev + 1));
      setIsActive(false); 
    }

    // 3. Audio Chaining Logic
    if (nextPhase === 'focus') {
      // Just play Focus audio
      if (focusRef.current) {
        focusRef.current.volume = 0.5;
        focusRef.current.play().catch(e => console.log("Audio block:", e));
      }
    } else {
      // Play Chime first, then chain the next audio when it finishes
      if (chimeRef.current) {
        chimeRef.current.volume = 0.5;
        
        chimeRef.current.onended = () => {
          if (nextPhase === 'revision' || nextPhase === 'longRevision') {
            if (revisionRef.current) {
              revisionRef.current.volume = 0.5;
              revisionRef.current.play().catch(e => console.log(e));
            }
          } else if (nextPhase === 'break' || nextPhase === 'longBreak') {
            if (breakRef.current) {
              breakRef.current.volume = 0.5;
              breakRef.current.play().catch(e => console.log(e));
            }
          }
        };

        chimeRef.current.play().catch(e => console.log("Audio block:", e));
      }
    }
  };

  const skipToNext = () => {
    setIsActive(false);
    if (phase === 'focus') {
      if (loopCount === 4) {
        setPhase('longRevision'); setTimeLeft(times.longRevision);
      } else {
        setPhase('revision'); setTimeLeft(times.revision);
      }
    } else if (phase === 'revision') {
      setPhase('break'); setTimeLeft(times.break);
    } else if (phase === 'longRevision') {
      setPhase('longBreak'); setTimeLeft(times.longBreak);
    } else if (phase === 'break' || phase === 'longBreak') {
      setPhase('focus'); setTimeLeft(times.focus);
      setLoopCount((prev) => (prev === 4 ? 1 : prev + 1));
    }
  };

  const skipToPrevious = () => {
    setIsActive(false);
    if (phase === 'focus') {
      if (loopCount === 1) {
        setPhase('longBreak'); setTimeLeft(times.longBreak); setLoopCount(4);
      } else {
        setPhase('break'); setTimeLeft(times.break); setLoopCount((prev) => prev - 1);
      }
    } else if (phase === 'revision') {
      setPhase('focus'); setTimeLeft(times.focus);
    } else if (phase === 'break') {
      setPhase('revision'); setTimeLeft(times.revision);
    } else if (phase === 'longRevision') {
      setPhase('focus'); setTimeLeft(times.focus);
    } else if (phase === 'longBreak') {
      setPhase('longRevision'); setTimeLeft(times.longRevision);
    }
  };

  const startTimer = () => {
    setIsActive(true);
    
    // NEW: Function to unlock all audio elements at once
    const unlock = (audio: HTMLAudioElement | null) => {
      if (audio && audio.paused) {
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
        }).catch(() => console.log("Audio unlock failed"));
      }
    };

    unlock(chimeRef.current);
    unlock(focusRef.current);
    unlock(revisionRef.current);
    unlock(breakRef.current);
  };

  const stopTimer = () => setIsActive(false);
  const resetTimer = () => { setIsActive(false); setTimeLeft(times[phase]); };

  const handleSaveSettings = async (newTimes: Record<Phase, number>) => {
    setTimes(newTimes);
    if (!isActive) {
      setTimeLeft(newTimes[phase]);
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { settings: newTimes }, { merge: true });
        console.log("Successfully saved settings to Firebase!");
      } catch (error) {
        console.error("Error saving settings to Firebase:", error);
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPhaseConfig = () => {
    switch (phase) {
      case 'focus': return { color: 'bg-[#6366F1]', label: 'Focus Time' };
      case 'revision': return { color: 'bg-[#F59E0B]', label: 'Revision Time' };
      case 'break': return { color: 'bg-[#10B981]', label: 'Break Time' };
      case 'longRevision': return { color: 'bg-[#F59E0B]', label: 'Long Revision' };
      case 'longBreak': return { color: 'bg-[#10B981]', label: 'Long Break' };
      default: return { color: 'bg-[#6366F1]', label: 'Focus Time' };
    }
  };

  const config = getPhaseConfig();
  const hasHours = timeLeft >= 3600;
  
  const progress = timeLeft / times[phase];
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col font-sans">
      
      {/* NEW: 4 distinct audio tags for all sounds */}
      <audio ref={chimeRef} src="/sounds/chime.mp3" preload="auto" />
      <audio ref={focusRef} src="/sounds/focus.mp3" preload="auto" />
      <audio ref={revisionRef} src="/sounds/revision.mp3" preload="auto" />
      <audio ref={breakRef} src="/sounds/break.mp3" preload="auto" />

      <header className="relative z-50 flex justify-between items-center px-8 py-4 bg-[#0A0F1B]">
        <h1 className="text-2xl font-medium tracking-wide">Promodoor</h1>
        <div className="flex space-x-4">
          <button onClick={() => setShowSettingsModal(true)} className="px-6 py-1.5 border border-white rounded-full text-sm active:bg-white/20 transition hover:bg-white/5">
            Settings
          </button>
          <button onClick={() => setShowProfileModal(true)} className="px-6 py-1.5 border border-white rounded-full text-sm active:bg-white/20 transition hover:bg-white/5">
            Profile
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center -mt-10">
        <div className="text-2xl mb-8 tracking-wider">{loopCount} of 4</div>

        <div className={`relative mb-8 flex items-center justify-center rounded-full shadow-2xl transition-all duration-500 ease-in-out ${hasHours ? 'w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px]' : 'w-80 h-80 sm:w-96 sm:h-96'}`}>
          <div className={`absolute inset-0 rounded-full transition-colors duration-500 ${config.color}`}></div>
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 -scale-y-100 pointer-events-none drop-shadow-md" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
            <circle cx="50" cy="50" r={radius} fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-linear" />
          </svg>
          <span className={`relative z-10 font-medium tracking-tight tabular-nums transition-all duration-500 ${hasHours ? 'text-6xl sm:text-7xl md:text-8xl' : 'text-7xl sm:text-8xl'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
          <button onClick={skipToPrevious} className="p-2 sm:p-1.5 border border-white rounded-md text-white active:bg-white/20 sm:hover:bg-white/10 transition-all flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
          </button>
          <button onClick={startTimer} className="px-6 py-2 sm:py-1 border border-white rounded-md text-lg active:bg-white/20 sm:hover:bg-white/10 transition-all">start</button>
          <button onClick={stopTimer} className="px-6 py-2 sm:py-1 border border-white rounded-md text-lg active:bg-white/20 sm:hover:bg-white/10 transition-all">stop</button>
          <button onClick={resetTimer} className="px-6 py-2 sm:py-1 border border-white rounded-md text-lg active:bg-white/20 sm:hover:bg-white/10 transition-all">reset</button>
          <button onClick={skipToNext} className="p-2 sm:p-1.5 border border-white rounded-md text-white active:bg-white/20 sm:hover:bg-white/10 transition-all flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
        </div>
        <div className="text-4xl font-medium tracking-wide mt-2">{config.label}</div>
      </main>

      <div className={showSettingsModal ? "block" : "hidden"}>
        <SettingsModal onClose={() => setShowSettingsModal(false)} currentTimes={times} onSave={handleSaveSettings} />
      </div>

      <div className={showProfileModal ? "block" : "hidden"}>
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      </div>
    </div>
  );
}