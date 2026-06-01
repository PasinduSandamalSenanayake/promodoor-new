'use client';

import React, { useState, useEffect } from 'react';

type Phase = 'focus' | 'revision' | 'break' | 'longRevision' | 'longBreak';

interface SettingsModalProps {
  onClose: () => void;
  currentTimes: Record<Phase, number>;
  onSave: (newTimes: Record<Phase, number>) => void;
}

export default function SettingsModal({ onClose, currentTimes, onSave }: SettingsModalProps) {
  const [focus, setFocus] = useState(currentTimes.focus / 60);
  const [revision, setRevision] = useState(currentTimes.revision / 60);
  const [breakTime, setBreakTime] = useState(currentTimes.break / 60);
  const [longRevision, setLongRevision] = useState(currentTimes.longRevision / 60);
  const [longBreak, setLongBreak] = useState(currentTimes.longBreak / 60);
  const [autoAdjust, setAutoAdjust] = useState(true); 

  useEffect(() => {
    setFocus(currentTimes.focus / 60);
    setRevision(currentTimes.revision / 60);
    setBreakTime(currentTimes.break / 60);
    setLongRevision(currentTimes.longRevision / 60);
    setLongBreak(currentTimes.longBreak / 60);
  }, [currentTimes]);

  const handleSave = () => {
    onSave({
      focus: focus * 60,
      revision: revision * 60,
      break: breakTime * 60,
      longRevision: longRevision * 60,
      longBreak: longBreak * 60,
    });
    onClose();
  };

  const handleDefault = () => {
    setFocus(21);
    setRevision(4);
    setBreakTime(5);
    setLongRevision(20);
    setLongBreak(30);
    setAutoAdjust(true);
  };

  const handleTimeChange = (type: string, value: number) => {
    if (!autoAdjust) {
      if (type === 'focus') setFocus(value);
      if (type === 'revision') setRevision(value);
      if (type === 'break') setBreakTime(value);
      if (type === 'longRevision') setLongRevision(value);
      if (type === 'longBreak') setLongBreak(value);
      return;
    }

    const ratios: Record<string, number> = {
      focus: 21,
      revision: 4,
      break: 5,
      longRevision: 20,
      longBreak: 30
    };

    const MAX_UNIT = 120 / 21; 
    let unit = value / ratios[type];

    if (unit > MAX_UNIT) {
      unit = MAX_UNIT;
    }

    setFocus(Math.max(1, Math.round(ratios.focus * unit)));
    setRevision(Math.max(1, Math.round(ratios.revision * unit)));
    setBreakTime(Math.max(1, Math.round(ratios.break * unit)));
    setLongRevision(Math.max(1, Math.round(ratios.longRevision * unit)));
    setLongBreak(Math.max(1, Math.round(ratios.longBreak * unit)));
  };

  const formatBadgeTime = (totalMinutes: number) => {
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const Slider = ({ label, value, min, max, leftLabel, rightLabel, onChange }: any) => (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <label className="text-lg text-white/90">{label}</label>
        <div className="border border-white/40 rounded-full px-3 text-sm tracking-wide bg-white/5">
          {formatBadgeTime(value)}
        </div>
      </div>
      <input 
        type="range" 
        min={min} 
        max={Math.max(max, value)} 
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
      />
      <div className="flex justify-between text-xs text-white/50 mt-2 tracking-wide">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans text-white"
      onClick={onClose}
    >
      <div 
        className="bg-[#1E293B] border border-white/20 rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-medium text-center mb-8 tracking-wide">Settings</h2>

        <div className="space-y-2">
          <Slider label="Focus Time" value={focus} min={5} max={120} leftLabel="5 min" rightLabel="2 H" onChange={(val: number) => handleTimeChange('focus', val)} />
          <Slider label="Revision Time" value={revision} min={1} max={30} leftLabel="1 min" rightLabel="30 min" onChange={(val: number) => handleTimeChange('revision', val)} />
          <Slider label="Break Time" value={breakTime} min={1} max={30} leftLabel="1 min" rightLabel="30 min" onChange={(val: number) => handleTimeChange('break', val)} />
          <Slider label="Long Revision Time" value={longRevision} min={5} max={120} leftLabel="5 min" rightLabel="2 H" onChange={(val: number) => handleTimeChange('longRevision', val)} />
          <Slider label="Long Break Time" value={longBreak} min={5} max={180} leftLabel="5 min" rightLabel="3 H" onChange={(val: number) => handleTimeChange('longBreak', val)} />
        </div>

        {/* FIXED LAYOUT: Two distinct rows for the bottom controls */}
        <div className="mt-8">
          
          {/* Row 1: Auto Adjust and Default Button */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center space-x-3">
              <input 
                type="checkbox" 
                checked={autoAdjust}
                onChange={(e) => setAutoAdjust(e.target.checked)}
                className="w-4 h-4 rounded-sm border-white/40 bg-transparent accent-white cursor-pointer"
              />
              <span className="text-sm text-white/80">Auto adjustment</span>
            </div>
            
            <button 
              onClick={handleDefault}
              className="px-6 py-1.5 border border-white/60 text-white/90 rounded-full text-sm hover:bg-white/10 hover:text-white transition"
            >
              Default
            </button>
          </div>

          {/* Row 2: Save and Cancel Buttons */}
          <div className="flex justify-end space-x-3">
            <button 
              onClick={handleSave}
              className="px-8 py-1.5 border border-white rounded-full text-sm hover:bg-white hover:text-[#1E293B] transition font-medium"
            >
              Save
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-1.5 border border-white rounded-full text-sm hover:bg-white/10 transition"
            >
              Cancel
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}