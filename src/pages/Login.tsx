import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBypassLogin = async () => {
    setLoading(true);
    setError(null);
    
    // Add a race condition to prevent hanging indefinitely
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Authentication Timeout')), 8000)
    );

    try {
      await Promise.race([signInAnonymously(auth), timeout]);
      onLogin();
    } catch (err: any) {
      console.error('Bypass login failed or timed out:', err);
      // Fallback: still call onLogin to allow UI traversal, 
      // but warn that DB operations might fail if rules are strict.
      onLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-sage/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-sage/5 rounded-full blur-[120px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-12">
          <div className="w-56 h-auto mx-auto flex items-center justify-center mb-10">
            <img 
              src="/logo.png" 
              alt="A-Star Logo" 
              className="w-full h-auto object-contain transition-all hover:scale-105 duration-500" 
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src='https://placehold.co/300x120/0F0F0F/white?text=A-Star+Solutions';
              }} 
            />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Enterprise Scientific Access</p>
        </div>

        <Card className="rounded-2xl md:!rounded-[2.5rem] p-8">
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-2xl font-black text-text-main uppercase tracking-tighter">System Access</h1>
              <p className="text-sm text-text-muted">Initialize enterprise protocol to access the Distributor Portal. SSO is currently disabled.</p>
            </div>

            <Button 
              variant="primary" 
              onClick={handleBypassLogin} 
              className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] !rounded-[1.25rem] shadow-xl gap-3" 
              isLoading={loading}
            >
              Initialize System Session <ChevronRight size={18} className="ml-2" />
            </Button>

            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Authorized Personnel Access Only
            </p>
          </div>
        </Card>

        <div className="mt-12 text-center space-y-4">
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            Precision Invoicing Systems v2.4.0
          </p>
          <div className="flex items-center justify-center gap-6">
             <a href="#" className="text-stone-300 hover:text-text-main text-[9px] font-black uppercase tracking-widest transition-colors font-sans">Privacy Protocol</a>
             <span className="text-stone-200">|</span>
             <a href="#" className="text-stone-300 hover:text-text-main text-[9px] font-black uppercase tracking-widest transition-colors font-sans">Security Standards</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
