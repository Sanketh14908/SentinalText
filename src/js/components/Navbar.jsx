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
    `relative px-3.5 sm:px-4 py-1.5 rounded-xl font-space font-extrabold text-sm uppercase tracking-wider transition-all duration-150 btn-tactile ${
      isActive(path)
        ? 'bg-[#ffe600] text-black border-2 border-black shadow-[3px_3px_0px_#000] rotate-[-1.5deg] scale-105'
        : 'text-black dark:text-white hover:bg-[#00f0ff] hover:text-black hover:border-2 hover:border-black hover:shadow-[3px_3px_0px_#000] hover:rotate-[1deg]'
    }`;

  return (
    <header className="sticky top-0 z-40 pt-3 px-3 sm:px-6 w-full max-w-6xl mx-auto">
      <nav className="bg-white dark:bg-[#121212] border-3 border-black dark:border-white shadow-brutal-lg rounded-2xl px-4 sm:px-6 py-2.5 transition-colors duration-200">
        <div className="flex justify-between items-center gap-2">
          
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 rounded-xl bg-[#ff007f] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center transition-transform duration-150 group-hover:rotate-6 group-hover:scale-105">
                <ShieldAlert className="w-6 h-6 text-white stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ff66] border border-black"></span>
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-syne font-black text-xl sm:text-2xl tracking-tighter text-black dark:text-white uppercase leading-none">
                    SENTINEL
                  </span>
                  <span className="bg-[#00ff66] text-black text-xs font-bungee px-1.5 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000] rotate-[2deg]">
                    TEXT
                  </span>
                </div>
                <span className="hidden sm:inline font-mono-code text-[10px] text-black/70 dark:text-white/70 font-bold uppercase tracking-tight">
                  // ANTI-PHISH AI v3.0
                </span>
              </div>
            </Link>
          </div>
          
          {/* Center: Navigation Links (if logged in) */}
          <div className="flex-1 flex justify-center items-center overflow-x-auto no-scrollbar mx-2">
            {isLoggedIn && (
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <Link to="/" className={navLinkClass('/')}>
                  🔍 Analyzer
                </Link>
                <Link to="/history" className={navLinkClass('/history')}>
                  📜 Vault
                </Link>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  📊 Radar
                </Link>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center shrink-0 gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 sm:p-2.5 rounded-xl bg-[#ffe600] text-black border-2 border-black shadow-[3px_3px_0px_#000] btn-tactile hover:bg-[#00f0ff] transition-colors"
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
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl font-space font-bold text-xs sm:text-sm text-white bg-[#ff007f] hover:bg-[#d6006b] border-2 border-black shadow-[3px_3px_0px_#000] btn-tactile"
              >
                <LogOut className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline uppercase">Exit</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-1.5 rounded-xl font-space font-bold text-xs sm:text-sm text-black dark:text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] hover:bg-[#00f0ff] hover:text-black btn-tactile uppercase"
                >
                  Log In
                </Link>
                <Link
                  to="/login"
                  state={{ isSignup: true }}
                  className="px-3 sm:px-4 py-1.5 rounded-xl font-space font-black text-xs sm:text-sm text-black bg-[#00ff66] hover:bg-[#00dd55] border-2 border-black shadow-[3px_3px_0px_#000] btn-tactile uppercase"
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
