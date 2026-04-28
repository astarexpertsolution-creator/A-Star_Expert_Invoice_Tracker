import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (err) {
      console.error('Login error:', err);
      setError('A-Star authentication failed. Please check your credentials.');
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

        <Card className="!rounded-[2.5rem] p-8">
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <h1 className="text-2xl font-black text-text-main uppercase tracking-tighter">System Access</h1>
              <p className="text-sm text-text-muted">Initialize enterprise authentication protocol to access the Distributor Portal.</p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100">
                {error}
              </div>
            )}

            <Button 
              variant="primary" 
              onClick={handleGoogleLogin} 
              className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] !rounded-[1.25rem] shadow-xl gap-3" 
              isLoading={loading}
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 invert" alt="Google" />
              Sign in with Corporate Account <ChevronRight size={18} className="ml-2" />
            </Button>

            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Authorized Personnel Only
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
