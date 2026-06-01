'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase';
// 1. ADDED: Import onAuthStateChanged from firebase/auth
import { signOut, onAuthStateChanged } from 'firebase/auth'; 

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>('Loading...');
  const [userInitial, setUserInitial] = useState<string>('');

  // 2. UPDATED: Use the listener to reliably fetch the user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setUserEmail(user.email);
        setUserInitial(user.email.charAt(0).toUpperCase());
      } else {
        setUserEmail('Guest User');
        setUserInitial('G');
      }
    });

    // Cleanup the listener when the modal closes
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
      router.push('/'); // Teleport the user back to the guest home page
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans text-white"
      onClick={onClose}
    >
      <div 
        className="bg-[#1E293B] border border-white/20 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-medium text-center mb-6 tracking-wide w-full">Profile</h2>

        {/* Avatar Placeholder */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6366F1] to-[#a855f7] flex items-center justify-center text-4xl font-semibold shadow-lg mb-4 border-4 border-[#0F172A]">
          {userInitial}
        </div>

        {/* User Info */}
        <div className="text-center mb-8 w-full">
          <p className="text-sm text-white/50 tracking-wide uppercase mb-1">Signed in as</p>
          <p className="text-lg font-medium text-white/90 truncate px-2">{userEmail}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex w-full space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 border border-white/40 text-white/90 rounded-full text-sm hover:bg-white/10 transition"
          >
            Close
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 py-2.5 border border-[#ef4444] bg-[#ef4444]/10 text-[#ef4444] rounded-full text-sm hover:bg-[#ef4444] hover:text-white transition font-medium"
          >
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
}