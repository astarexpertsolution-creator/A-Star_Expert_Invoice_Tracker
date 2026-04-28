import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { Lock, Mail, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-accent-sage rounded-3xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg relative overflow-hidden">
            <span className="text-3xl font-black relative z-10">A*</span>
            <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6 -mt-6"></div>
          </div>
          <h1 className="text-3xl font-bold text-text-main tracking-tight">A-Star <span className="text-accent-sage">Expert Solutions</span></h1>
          <p className="text-text-muted mt-3 uppercase tracking-[0.2em] text-[10px] font-bold">Future of Science</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input 
                label="Corporate Email" 
                type="email" 
                placeholder="admin@astarsolutions.com" 
                required 
                defaultValue="admin@astarsolutions.com"
              />
              <Input 
                label="Secure Password" 
                type="password" 
                placeholder="••••••••" 
                required 
                defaultValue="password123"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-text-muted font-medium">
                <input type="checkbox" className="rounded border-border-base text-accent-sage focus:ring-accent-sage/20" />
                Keep me logged in
              </label>
              <a href="#" className="text-accent-sage font-bold hover:text-accent-sage-hover transition-colors">Recover Access</a>
            </div>

            <Button variant="primary" type="submit" className="w-full h-12 text-sm font-bold uppercase tracking-widest" isLoading={loading}>
              Sign In <ChevronRight size={18} className="ml-2" />
            </Button>
          </form>
        </Card>

        <p className="text-center text-text-muted text-xs mt-10">
          Authorized access only. By signing in you agree to our 
          <br /><a href="#" className="text-text-main font-bold hover:underline">Security Protocols</a>
        </p>
      </motion.div>
    </div>
  );
};
