import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Loader2, Zap, AlertOctagon, Terminal, Trash2 } from 'lucide-react';
import AnalysisResultCard from '../components/AnalysisResultCard';

const SAMPLE_PRESETS = [
  {
    label: "🚨 Bank Lockout Scam",
    text: "URGENT: Chase Bank alert! Your account #4920 has been temporarily frozen due to suspicious login attempts from Russia. Click http://chase-security-verify.xyz/login within 15 mins to restore access."
  },
  {
    label: "📦 USPS Parcel Trap",
    text: "USPS Notification: We cannot deliver parcel #US98234-9 due to incorrect street number. Please update your details and pay $1.85 redelivery fee at http://post-delivery-update.cc/track"
  },
  {
    label: "💸 Crypto Airdrop Giveaway",
    text: "Congratulations! Your wallet was selected for the official Ethereum Foundation 2.5 ETH rewards drop! Connect your seed phrase to claim: http://eth-reward-drop.online"
  },
  {
    label: "✅ Normal Work Email",
    text: "Hey Sarah, hope you're having a good week! Could you please send over the Q3 design review deck before our 2 PM sync today? Thanks!"
  }
];

export default function Analyzer() {
  const location = useLocation();
  const [text, setText] = useState(
    location.state?.selectedAnalysis?.message ||
    location.state?.selectedAnalysis?.message_content ||
    ''
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(location.state?.selectedAnalysis || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.selectedAnalysis) {
      const item = location.state.selectedAnalysis;
      setText(item.message || item.message_content || '');
      setResult(item);
      setError(null);
    }
  }, [location.state]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      const rawText = await response.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(
          response.ok
            ? 'AI service returned an unexpected response. Please try again.'
            : `Server error (${response.status}). Please try again.`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || `Analysis failed (${response.status}). Please try again.`);
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
      
      {/* Gen-Z Chaos Hero Banner */}
      <div className="mb-10 text-center relative">
        
        {/* Floating Playful Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
          <span className="bg-[#ff007f] text-white px-3 py-1 font-bungee text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] rotate-[-2deg] sticker-pop">
            🔥 100% UNHINGED
          </span>
          <span className="bg-[#ffe600] text-black px-3 py-1 font-space font-black text-xs uppercase rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] rotate-[1.5deg] sticker-pop">
            👁️ VIBE CHECK ENGINE
          </span>
          <span className="bg-[#00ff66] text-black px-3 py-1 font-mono-code font-black text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#000] rotate-[-1deg] sticker-pop">
            ⚡ SCAMMER BOUNCER
          </span>
        </div>

        <h1 className="font-syne font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-tighter text-black dark:text-white leading-none mb-3">
          DON'T GET <span className="bg-[#ff007f] text-white px-2 py-0.5 rounded-lg border-3 border-black inline-block rotate-[1deg] shadow-[4px_4px_0px_#000]">COOKED</span> BESTIE
        </h1>

        <p className="font-space font-bold text-sm sm:text-base text-black/80 dark:text-gray-300 max-w-2xl mx-auto">
          Feed any sketchy SMS, fake bank alert, phishing DM, or sus email link to our sentinel neural net. We check red flags in real-time. No cap.
        </p>
      </div>

      {/* Main Analyzer Terminal Box */}
      <div className="bg-white dark:bg-[#121212] border-3 border-black dark:border-white rounded-3xl shadow-brutal-xl overflow-hidden mb-8 transition-colors duration-200">
        
        {/* Terminal Window Header Bar */}
        <div className="bg-black text-white px-5 py-3 border-b-3 border-black dark:border-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ff007f] border border-black inline-block"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#ffe600] border border-black inline-block"></span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#00ff66] border border-black inline-block"></span>
            </div>
            <span className="font-mono-code text-xs font-bold text-[#00f0ff] uppercase tracking-wide">
              SENTINEL_INPUT_TERMINAL // REALTIME_SCAN.IO
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono-code text-[11px] bg-[#00ff66] text-black px-2 py-0.5 rounded font-black">
              ● READY
            </span>
          </div>
        </div>

        {/* Quick Sample Presets Bar */}
        <div className="bg-[#fff9e6] dark:bg-[#181818] p-3 border-b-2 border-black dark:border-white/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="font-space font-black text-xs uppercase tracking-wider text-black dark:text-white shrink-0 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#ff007f]" />
            QUICK SAMPLES:
          </span>
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setText(preset.text)}
              className="shrink-0 bg-white dark:bg-black text-black dark:text-white px-2.5 py-1 rounded-lg border-2 border-black text-xs font-space font-bold hover:bg-[#ffe600] dark:hover:bg-[#ffe600] dark:hover:text-black transition-colors btn-tactile shadow-[2px_2px_0px_#000]"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Text Input Area */}
        <div className="p-5 sm:p-6">
          <div className="relative">
            <textarea
              rows={6}
              className="w-full p-4 sm:p-5 bg-[#fafafa] dark:bg-[#070707] border-2 border-black dark:border-white rounded-2xl font-mono-code text-sm sm:text-base text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-4 focus:ring-[#00f0ff] transition-all resize-none shadow-inner"
              placeholder='Paste a suspicious message here (e.g. "Urgent: Your account is locked! Click here...")...'
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {text && (
              <button
                onClick={() => setText('')}
                className="absolute top-4 right-4 p-1.5 bg-black text-white hover:bg-[#ff007f] rounded-lg transition-colors border border-black shadow-[2px_2px_0px_#000]"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono-code font-bold text-black/70 dark:text-gray-400">
              <span className="bg-black/5 dark:bg-white/10 px-2 py-1 rounded border border-black/20 dark:border-white/20">
                CHARACTERS: {text.length}
              </span>
              <span className="hidden sm:inline">
                TIP: <kbd className="px-1.5 py-0.5 bg-black/10 dark:bg-white/15 rounded text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-black/10 dark:bg-white/15 rounded text-[10px]">Enter</kbd> to analyze
              </span>
            </div>

            {/* Analyze Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={!text.trim() || isAnalyzing}
              className="group flex items-center gap-2.5 px-6 sm:px-8 py-3.5 bg-[#00ff66] hover:bg-[#00e65c] text-black font-bungee text-sm sm:text-base rounded-2xl border-3 border-black shadow-brutal-lime btn-tactile disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin stroke-[3]" />
              ) : (
                <Search className="w-5 h-5 stroke-[3] group-hover:rotate-12 transition-transform" />
              )}
              <span>{isAnalyzing ? 'DECODING VIBES...' : '⚡ SCAN THIS TEXT ⚡'}</span>
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-[#ff007f] text-white border-2 border-black rounded-xl font-space font-black text-sm shadow-brutal-sm flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

      </div>

      {/* Result Display or Empty State */}
      {result ? (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-300">
          <AnalysisResultCard result={result} />
        </div>
      ) : !isAnalyzing && (
        <div className="bg-white dark:bg-[#121212] border-3 border-dashed border-black dark:border-white/50 rounded-3xl p-8 sm:p-12 text-center shadow-brutal-sm relative overflow-hidden">
          
          <div className="mx-auto w-16 h-16 bg-[#ffe600] rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mb-5 rotate-[-3deg] sticker-pop">
            <Terminal className="w-8 h-8 text-black stroke-[2.5]" />
          </div>

          <h3 className="font-syne font-black text-2xl text-black dark:text-white uppercase tracking-tight mb-2">
            WAITING FOR TARGET TEXT
          </h3>

          <p className="font-space font-medium text-sm sm:text-base text-black/70 dark:text-gray-400 max-w-md mx-auto mb-6">
            Paste any suspicious message above or tap one of the quick samples to run a forensic scam breakdown.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-lg mx-auto font-mono-code text-xs font-bold">
            <span className="bg-[#00f0ff]/20 text-black dark:text-[#00f0ff] px-3 py-1.5 rounded-lg border border-black dark:border-[#00f0ff]">
              ✓ Deep Phishing NLP
            </span>
            <span className="bg-[#ff007f]/20 text-black dark:text-[#ff007f] px-3 py-1.5 rounded-lg border border-black dark:border-[#ff007f]">
              ✓ Fake Urgency Detector
            </span>
            <span className="bg-[#00ff66]/20 text-black dark:text-[#00ff66] px-3 py-1.5 rounded-lg border border-black dark:border-[#00ff66]">
              ✓ Spoofed Domain Trap Check
            </span>
          </div>

        </div>
      )}

    </div>
  );
}
