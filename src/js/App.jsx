import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Analyzer from './pages/Analyzer';
import History from './pages/History';
import Dashboard from './pages/Dashboard';

export const ThemeContext = createContext();
export const AuthContext = createContext();

function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const marqueeText = "🚨 DONT GET SCAMMED BESTIE ⚡ 100% NO CAP AI PHISHING SCANNER 👁️ SUSPECT TEXT DETECTOR 💀 COOKED OR BASED? 🛡️ STAY SAFE FR FR 💅 MAXIMALIST SECURITY ENGINE 🛸 ZERO TRUST ZONE 💥 REAL TIME VIBE CHECK ⚡ ";

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col font-space bg-[#fcf9f2] dark:bg-[#070707] text-black dark:text-white transition-colors duration-200 relative overflow-x-hidden bg-chaos-dots selection:bg-[#ff007f] selection:text-white">
            
            {/* Top Chaos Marquee Ticker */}
            <div className="w-full bg-[#ffe600] text-black py-1.5 border-b-2 border-black overflow-hidden select-none z-50 font-mono-code text-xs font-black tracking-wider uppercase">
              <div className="animate-marquee-track">
                <span className="whitespace-nowrap px-4">{marqueeText}</span>
                <span className="whitespace-nowrap px-4">{marqueeText}</span>
              </div>
            </div>

            {/* Decorative Corner Floating Stickers (Chaos Aesthetic) */}
            <div className="hidden lg:block pointer-events-none fixed top-16 left-3 z-30 animate-float-1">
              <div className="pointer-events-auto cursor-pointer bg-[#ff007f] text-white px-3 py-1 font-bungee text-xs rounded-md border-2 border-black shadow-brutal-sm hover:scale-110 active:scale-95 transition-transform rotate-[-6deg]">
                ⚡ 100% RAW
              </div>
            </div>

            <div className="hidden lg:block pointer-events-none fixed top-24 right-4 z-30 animate-float-2">
              <div className="pointer-events-auto cursor-pointer bg-[#00ff66] text-black px-3 py-1 font-bungee text-xs rounded-md border-2 border-black shadow-brutal-sm hover:scale-110 active:scale-95 transition-transform rotate-[5deg]">
                👾 ANTI-SCAM BOT
              </div>
            </div>

            <div className="hidden xl:block pointer-events-none fixed bottom-14 left-4 z-30 animate-float-3">
              <div className="pointer-events-auto cursor-pointer bg-[#00f0ff] text-black px-2.5 py-1 font-mono-code text-[11px] font-black rounded-md border-2 border-black shadow-brutal-sm hover:rotate-6 transition-transform rotate-[3deg]">
                👁️‍🗨️ VIBE_CHECK: ACTIVE
              </div>
            </div>

            <div className="hidden xl:block pointer-events-none fixed bottom-14 right-4 z-30 animate-float-1">
              <div className="pointer-events-auto cursor-pointer bg-[#ff5500] text-white px-3 py-1 font-bungee text-xs rounded-md border-2 border-black shadow-brutal-sm hover:-rotate-6 transition-transform rotate-[-4deg]">
                🔥 NO FRAUD ZONE
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative z-10 pb-12">
              <Routes>
                <Route
                  path="/login"
                  element={
                    isLoggedIn ? <Navigate to="/" replace /> : <><Navbar /><Login /></>
                  }
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                      <><Navbar /><Analyzer /></>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                      <><Navbar /><History /></>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                      <><Navbar /><Dashboard /></>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            {/* Bottom Reverse Marquee Ticker */}
            <div className="w-full bg-[#ff007f] dark:bg-[#ff007f] text-white py-1.5 border-t-2 border-black overflow-hidden select-none font-mono-code text-xs font-black tracking-widest uppercase">
              <div className="animate-marquee-track-reverse">
                <span className="whitespace-nowrap px-4">⚡ SENTINELTEXT 3000 // GEN-Z CHAOS MAXIMUM OVERDRIVE // AI POWERED PHISHING DETECTOR // PROTECT YOUR BAG // DONT GET COOKED // NO CAP FR FR // </span>
                <span className="whitespace-nowrap px-4">⚡ SENTINELTEXT 3000 // GEN-Z CHAOS MAXIMUM OVERDRIVE // AI POWERED PHISHING DETECTOR // PROTECT YOUR BAG // DONT GET COOKED // NO CAP FR FR // </span>
              </div>
            </div>

          </div>
        </BrowserRouter>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}
