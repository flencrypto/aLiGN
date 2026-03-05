'use client';

import { useTheme } from '@/components/ThemeProvider';

interface HeaderProps {
  title: string;
  action?: React.ReactNode;
}

export default function Header({ title, action }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header
      className="h-16 px-6 border-b border-border-subtle sticky top-0 z-20 flex items-center justify-between overflow-hidden"
      style={{
        backgroundImage: "url('/header-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />

      {/* Content sits above overlay */}
      <h1 className="relative z-10 text-xl font-semibold text-text-main tracking-tight">{title}</h1>
      <div className="relative z-10 flex items-center gap-3">
        {action && <div>{action}</div>}
        {/* Dark / Light toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-10 h-10 rounded-lg bg-surface/80 flex items-center justify-center border border-border-subtle hover:border-primary transition-all duration-200"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}

