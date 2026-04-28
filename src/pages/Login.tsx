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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-200">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to manage your business invoices</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="admin@example.com" 
                required 
                defaultValue="admin@example.com"
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                required 
                defaultValue="password123"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                Remember me
              </label>
              <a href="#" className="text-indigo-600 font-medium hover:underline">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full h-11" isLoading={loading}>
              Sign In <ChevronRight size={18} className="ml-2" />
            </Button>
          </form>
        </Card>

        <p className="text-center text-slate-500 text-sm mt-8">
          Don't have an account? <a href="#" className="text-indigo-600 font-semibold hover:underline">Get started for free</a>
        </p>
      </motion.div>
    </div>
  );
};
