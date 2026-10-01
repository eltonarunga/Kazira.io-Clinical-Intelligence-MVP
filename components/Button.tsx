import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'recover' | 'leak';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className, 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-[6px] font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-[3px] focus-visible:outline-[var(--focus)] focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none";
  
  const variants = {
    primary: "bg-[var(--btn-bg)] text-[var(--btn-fg)] hover:opacity-90 border border-transparent",
    secondary: "bg-transparent text-[var(--ink)] hover:bg-[var(--surface)] border border-[var(--ink2)]",
    ghost: "bg-transparent text-[var(--ink2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] border border-transparent",
    recover: "bg-[var(--recover)] text-[#0E0E0E] font-bold hover:brightness-105 border border-transparent",
    leak: "bg-[var(--leak)] text-white hover:brightness-105 border border-transparent"
  };
  
  const sizes = {
    sm: "min-h-[36px] px-3 py-1.5 text-xs",
    md: "min-h-[44px] px-[18px] py-[11px] text-[16px]",
    lg: "min-h-[50px] px-6 py-3 text-[18px]"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
