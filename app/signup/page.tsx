'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log('Signup attempt:', { name, email, password });
    alert('Signup functionality coming soon!');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-md bg-[#1E293B] rounded-2xl shadow-2xl p-8 border border-white/5">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium tracking-wide mb-2">
            <span className="text-[#6366F1]">Pro</span>modoor
          </h1>
          <h2 className="text-xl font-semibold mt-6">Create an Account</h2>
          <p className="text-sm text-white/60 mt-2">Start boosting your productivity today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1.5">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#334155] text-white border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#6366F1] transition"
              required
            />
          </div>
          
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

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1.5">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#334155] text-white border border-white/10 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#6366F1] transition"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#6366F1] hover:bg-[#5254D8] text-white font-medium text-base py-3 rounded-lg transition active:scale-[0.98] mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-white/60 mt-8">
          Already have an account?{' '}
          <Link href="/" className="text-[#6366F1] hover:underline">
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}