import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, LogOut, Sun, Moon } from 'lucide-react';
import { ThemeContext, AuthContext } from '../App';

export default function Navbar() {
  const location = useLocation();
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl font-space font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-150 btn-tactile ${
      isActive(path)
        ? 'bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] rotate-[-1.5deg] scale-105'
        : 'text-black dark:text-white hover:bg-[#00f0ff] hover:text-black hover:border-2 hover:border-black hover:shadow-[2px_2px_0px_#000] hover:rotate-[1deg]'
    }`;

  return (
    <header className="sticky top-0 z-40 pt-2 sm:pt-3 px-2 sm:px-6 w-full max-w-6xl mx-auto">
      <nav className="bg-white dark:bg-[#121212] border-2 sm:border-3 border-black dark:border-white shadow-brutal-sm sm:shadow-brutal-lg rounded-2xl px-2.5 sm:px-6 py-2 sm:py-2.5 transition-colors duration-200">
        <div className="flex justify-between items-center gap-1.5 sm:gap-2">
          
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#ff007f] border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] flex items-center justify-center transition-transform duration-150 group-hover:rotate-6">
                <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#00ff66] border border-black"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="font-syne font-black text-lg sm:text-2xl tracking-tighter text-black dark:text-white uppercase leading-none">
                    SENTINEL
                  </span>
                  <span className="bg-[#00ff66] text-black text-[10px] sm:text-xs font-bungee px-1 sm:px-1.5 py-0.5 rounded border border-black shadow-[1.5px_1.5px_0px_#000] rotate-[2deg]">
                    TEXT
                  </span>
                </div>
                <span className="hidden md:inline font-mono-code text-[10px] text-black/70 dark:text-white/70 font-bold uppercase tracking-tight">
                  // ANTI-PHISH AI v3.0
                </span>
              </div>
            </Link>
          </div>
          
          {/* Center: Navigation Links (if logged in) */}
          <div className="flex-1 flex justify-center items-center overflow-x-auto no-scrollbar mx-1 sm:mx-2">
            {isLoggedIn && (
              <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
                <Link to="/" className={navLinkClass('/')}>
                  <span className="sm:hidden">🔍</span>
                  <span className="hidden sm:inline">🔍 Analyzer</span>
                </Link>
                <Link to="/history" className={navLinkClass('/history')}>
                  <span className="sm:hidden">📜</span>
                  <span className="hidden sm:inline">📜 Vault</span>
                </Link>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <span className="sm:hidden">📊</span>
                  <span className="hidden sm:inline">📊 Radar</span>
                </Link>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center shrink-0 gap-1.5 sm:gap-2.5">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 sm:p-2.5 rounded-xl bg-[#ffe600] text-black border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] btn-tactile hover:bg-[#00f0ff] transition-colors"
              aria-label="Toggle theme"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />}
            </button>

            {isLoggedIn ? (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  setIsLoggedIn(false);
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-space font-bold text-xs sm:text-sm text-white bg-[#ff007f] hover:bg-[#d6006b] border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] btn-tactile"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="hidden sm:inline uppercase">Exit</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-2.5 sm:px-4 py-1.5 rounded-xl font-space font-bold text-xs sm:text-sm text-black dark:text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] hover:bg-[#00f0ff] hover:text-black btn-tactile uppercase whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  to="/login"
                  state={{ isSignup: true }}
                  className="px-2.5 sm:px-4 py-1.5 rounded-xl font-space font-black text-xs sm:text-sm text-black bg-[#00ff66] hover:bg-[#00dd55] border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] btn-tactile uppercase whitespace-nowrap"
                >
                  Get In ✨
                </Link>
              </div>
            )}
          </div>
          
        </div>
      </nav>
    </header>
  );
}
