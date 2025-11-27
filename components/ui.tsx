import React from 'react';
import { Loader2 } from 'lucide-react';

// --- Card Components ---
export const Card = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-300 active:scale-[0.98]' : ''} ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-slate-500 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>
);

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'default', loading = false, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200/80',
      outline: 'border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900',
      ghost: 'hover:bg-slate-100 hover:text-slate-900',
      destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
    };
    
    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// --- Badge Component ---
export const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline', className?: string }) => {
  const variants = {
    default: 'border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80',
    success: 'border-transparent bg-green-500 text-white',
    warning: 'border-transparent bg-yellow-500 text-white',
    destructive: 'border-transparent bg-red-500 text-white',
    outline: 'text-slate-950 border-slate-200'
  };

  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
