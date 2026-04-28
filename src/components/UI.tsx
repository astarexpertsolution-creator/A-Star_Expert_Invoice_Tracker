import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => (
  <div className={`bg-white rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_1px_2px_0_rgba(0,0,0,0.06)] border border-border-base overflow-hidden ${className}`}>
    {(title || subtitle) && (
      <div className="px-8 py-6 border-b border-border-base bg-[#FAFAFA]">
        {title && <h3 className="text-lg font-bold text-text-main tracking-tight">{title}</h3>}
        {subtitle && <p className="text-[11px] text-text-muted mt-1 uppercase tracking-[0.15em] font-bold">{subtitle}</p>}
      </div>
    )}
    <div className="p-8">{children}</div>
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-accent-sage/20 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-accent-sage text-white hover:bg-accent-sage-hover shadow-[0_4px_12px_rgba(78,96,93,0.2)]',
    secondary: 'bg-sidebar-bg text-white hover:bg-stone-800',
    outline: 'border border-border-base bg-white text-text-muted hover:border-text-muted hover:text-text-main',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'text-text-muted hover:bg-bg-main hover:text-text-main',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs uppercase tracking-wider',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base',
    icon: 'p-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => (
  <div className="space-y-2 w-full">
    {label && (
      <label htmlFor={id} className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
        {label}
      </label>
    )}
    <input
      id={id}
      className={`w-full px-5 py-3 rounded-xl border border-border-base bg-[#FAFAFA] focus:bg-white focus:ring-2 focus:ring-accent-sage/10 focus:border-accent-sage transition-all outline-none text-sm placeholder:text-stone-300 ${
        error ? 'border-red-500' : ''
      } ${className}`}
      {...props}
    />
    {error && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">{error}</p>}
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }> = ({
  label,
  error,
  children,
  className = '',
  id,
  ...props
}) => (
  <div className="space-y-1.5 w-full">
    {label && (
      <label htmlFor={id} className="block text-xs font-bold text-text-muted uppercase tracking-wider">
        {label}
      </label>
    )}
    <select
      id={id}
      className={`w-full px-4 py-2 rounded-lg border border-border-base focus:ring-1 focus:ring-accent-sage focus:border-accent-sage transition-all outline-none bg-white appearance-none cursor-pointer text-sm ${
        error ? 'border-red-500' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = 'slate', className = '' }) => {
  const colors: Record<string, string> = {
    slate: 'bg-stone-100 text-stone-600',
    green: 'bg-status-paid-bg text-status-paid-text',
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-status-pending-bg text-status-pending-text',
    red: 'bg-status-overdue-bg text-status-overdue-text',
    indigo: 'bg-accent-sage/10 text-accent-sage',
  };

  return (
    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] rounded-full inline-flex items-center justify-center ${colors[color] || colors.slate} ${className}`}>
      {children}
    </span>
  );
};
