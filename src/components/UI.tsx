import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-border-base overflow-hidden ${className}`}>
    {(title || subtitle) && (
      <div className="px-6 py-4 border-b border-border-base bg-[#F8F7F5]">
        {title && <h3 className="font-semibold text-text-main">{title}</h3>}
        {subtitle && <p className="text-xs text-text-muted mt-0.5 uppercase tracking-wider font-medium">{subtitle}</p>}
      </div>
    )}
    <div className="p-6">{children}</div>
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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-accent-sage/20 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-accent-sage text-white hover:bg-accent-sage-hover shadow-sm',
    secondary: 'bg-sidebar-bg text-white hover:opacity-90',
    outline: 'border border-border-base bg-white text-text-muted hover:bg-bg-main hover:text-text-main',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-text-muted hover:bg-bg-main hover:text-text-main',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
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
  <div className="space-y-1.5 w-full">
    {label && (
      <label htmlFor={id} className="block text-xs font-bold text-text-muted uppercase tracking-wider">
        {label}
      </label>
    )}
    <input
      id={id}
      className={`w-full px-4 py-2 rounded-lg border border-border-base bg-white focus:ring-1 focus:ring-accent-sage focus:border-accent-sage transition-all outline-none text-sm ${
        error ? 'border-red-500' : ''
      } ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
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

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'slate' }) => {
  const colors: Record<string, string> = {
    slate: 'bg-stone-100 text-stone-600',
    green: 'bg-status-paid-bg text-status-paid-text',
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-status-pending-bg text-status-pending-text',
    red: 'bg-status-overdue-bg text-status-overdue-text',
    indigo: 'bg-accent-sage/10 text-accent-sage',
  };

  return (
    <span className={`px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide rounded ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};
