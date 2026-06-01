'use client';

import React, { useState } from 'react';


import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation'; 

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Tells Firebase to check the database for this user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Successfully logged in:', userCredential.user.email);
      
      // Close the modal upon success
      onClose();
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Login error:", error.message);
      alert("Invalid email or password. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Successfully signed in with Google:', result.user.email);
      onClose(); // Close the modal upon success
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Google Sign-In error:", error.message);
      alert("Failed to sign in with Google. Please try again.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans text-white"
      onClick={onClose}
    >
      {/* FIXED: Changed md:h-[600px] to md:min-h-[600px] md:h-auto to allow it to grow if needed */}
      <div 
        className="flex w-full max-w-[800px] h-auto md:min-h-[600px] md:h-auto bg-[#1E293B] rounded-2xl shadow-2xl overflow-hidden border border-white/5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 text-white/50 hover:text-white transition z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Left Side: Branding */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-[#0B1121] p-8 relative">
          <div className="w-56 h-56 bg-[#6366F1] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] mb-8">
            <h1 className="text-4xl tracking-wide font-medium">
              <span className="text-[#0B1121]">Pro</span>
              <span className="text-white">modoor</span>
            </h1>
          </div>
          <p className="text-lg text-white/80 tracking-wide mt-4">
            <span className="text-[#6366F1] font-medium">Pro</span> version of the pomodoro
          </p>
        </div>

        {/* FIXED: Added overflow-y-auto max-h-[90vh] to allow scrolling on small laptop screens */}
        <div className="flex flex-col w-full md:w-1/2 p-8 md:p-12 relative overflow-y-auto max-h-[90vh]">
          
          {/* Desktop Close Button */}
          <button 
            onClick={onClose}
            className="hidden md:block absolute top-6 right-6 text-white/50 hover:text-white transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="mb-8 mt-4 md:mt-0">
            <h2 className="text-2xl font-medium mb-1">
              <span className="text-[#6366F1]">Pro</span>modoor
            </h2>
            <p className="text-xs text-[#6366F1] mb-6">Pro version of the pomodoro</p>
            
            <h3 className="text-2xl font-semibold mb-2">Login to Your Account</h3>
            <p className="text-sm text-white/60">Welcome back ! Please enter your details</p>
          </div>

          <form onSubmit={handleLogin} className="flex-1 flex flex-col">
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#334155] text-white border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#6366F1] transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1.5">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#334155] text-white border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#6366F1] transition"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#6366F1] hover:bg-[#5254D8] text-white font-medium text-base py-3 rounded-lg transition active:scale-[0.98]"
            >
              Sign in
            </button>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="px-3 text-sm text-white/40">or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-[#0F172A] hover:bg-black/40 text-white border border-white/10 font-medium text-sm py-3 rounded-lg transition flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* FIXED: Added pb-4 so the text doesn't touch the bottom scroll edge */}
            <p className="text-center text-sm text-white/60 mt-8 pb-4">
              Don't have an account? <button type="button" className="text-[#6366F1] hover:underline">Sign up</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}