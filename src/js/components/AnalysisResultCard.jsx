import { useState } from 'react';
import { Copy, Check, Terminal, Flame, Sparkles } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function AnalysisResultCard({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  // Normalize field names
  const score = result.risk_score ?? result.score ?? 0;
  const category = result.category ?? result.status ?? 'unknown';
  const redFlags = result.red_flags ?? result.redFlags ?? [];
  const explanation = result.explanation ?? '';

  const cat = (category || '').toLowerCase();
  const isHighRisk = cat === 'phishing' || cat === 'spoofing' || score >= 50;

  const handleCopyVerdict = () => {
    const textToCopy = `SentinelText Verdict:\nStatus: ${category.toUpperCase()} (Risk Score: ${score}/100)\nRed Flags: ${redFlags.join(', ') || 'None'}\nExplanation: ${explanation}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-white dark:bg-[#121212] border-3 border-black dark:border-white rounded-3xl shadow-brutal-xl overflow-hidden transition-all duration-200">
      
      {/* Retro Window Title Bar */}
      <div className="bg-black text-white px-5 py-3 border-b-3 border-black dark:border-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ff007f] border border-black inline-block"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#ffe600] border border-black inline-block"></span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#00ff66] border border-black inline-block"></span>
          </div>
          <span className="font-mono-code text-xs font-black tracking-wider uppercase text-[#00ff66]">
            [ VERDICT_REPORT_v3.exe ]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono-code text-[11px] bg-[#222] text-[#00f0ff] px-2 py-0.5 rounded border border-[#444] font-bold">
            CONFIDENCE: 99.4%
          </span>
        </div>
      </div>

      {/* Caution Pattern Ribbon if High Risk */}
      {isHighRisk && (
        <div className="bg-danger-stripes h-2.5 w-full border-b-2 border-black"></div>
      )}

      <div className="p-6 sm:p-8">
        
        {/* Header section with RiskBadge + Sticker */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono-code text-xs font-black uppercase tracking-widest text-[#ff007f] dark:text-[#00ff66] bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded">
                // SYSTEM ASSESSMENT
              </span>
              <span className="font-marker text-xs text-black dark:text-white rotate-[-3deg]">
                {isHighRisk ? '🚨 STAY ALERT!' : '✨ LOOKIN GOOD!'}
              </span>
            </div>
            <RiskBadge category={category} score={score} />
          </div>

          {/* Quick Copy Verdict Sticker Button */}
          <button
            onClick={handleCopyVerdict}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ffe600] text-black font-space font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-brutal-sm btn-tactile hover:bg-[#00f0ff]"
          >
            {copied ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[3]" />}
            {copied ? 'COPIED TO CLIPBOARD!' : 'COPY REPORT'}
          </button>
        </div>

        {/* Red Flags Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-syne font-black text-lg sm:text-xl text-black dark:text-white uppercase tracking-tight flex items-center gap-2.5">
              {redFlags.length > 0 ? (
                <span className="p-1.5 bg-[#ff007f] text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                  <Flame className="w-5 h-5 stroke-[2.5]" />
                </span>
              ) : (
                <span className="p-1.5 bg-[#00ff66] text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                  <Sparkles className="w-5 h-5 stroke-[2.5]" />
                </span>
              )}
              <span>RED FLAGS IDENTIFIED ({redFlags.length})</span>
            </h4>

            {redFlags.length > 0 && (
              <span className="bg-[#ff007f] text-white font-bungee text-[10px] px-2 py-0.5 rounded border border-black rotate-[2deg] shadow-[2px_2px_0px_#000]">
                SUSPECT DETECTED
              </span>
            )}
          </div>

          {redFlags.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {redFlags.map((flag, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 bg-[#fff8eb] dark:bg-[#1c1c1c] p-4 rounded-xl border-2 border-black dark:border-white/80 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#ff007f] transition-transform hover:-translate-y-0.5"
                >
                  <span className="font-bungee text-xs bg-[#ff007f] text-white px-1.5 py-0.5 rounded border border-black shrink-0">
                    #{index + 1}
                  </span>
                  <p className="font-space font-bold text-xs sm:text-sm text-black dark:text-white leading-snug">
                    {flag}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#00ff66]/20 border-2 border-black dark:border-[#00ff66] p-5 rounded-2xl flex items-center gap-4 shadow-brutal-sm">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-space font-extrabold text-sm text-black dark:text-[#00ff66] uppercase">
                  ZERO RED FLAGS DETECTED!
                </p>
                <p className="font-space font-medium text-xs text-black/80 dark:text-gray-300">
                  This text doesn't show standard phishing, spoofing, or deceptive urgency patterns. Still verify unknown senders!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* AI Breakdown / Explanation in Cyber Terminal Box */}
        <div className="bg-black text-[#00ff66] rounded-2xl p-5 border-3 border-black shadow-brutal-lime relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#00ff66]/30">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00ff66]" />
              <span className="font-mono-code text-xs font-black uppercase tracking-wider text-white">
                AI DECONSTRUCTION LOG // WHAT THIS MEANS
              </span>
            </div>
            <span className="font-mono-code text-[10px] bg-[#00ff66] text-black font-black px-1.5 py-0.2 rounded">
              VERIFIED
            </span>
          </div>

          <p className="font-mono-code text-xs sm:text-sm text-gray-200 leading-relaxed font-semibold">
            {explanation}
          </p>

          <div className="mt-4 pt-3 border-t border-[#00ff66]/20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-code text-[#ffe600]">
            <span>💡 GEN-Z RULE #1: NEVER TAP UNVERIFIED SHORTLINKS</span>
            <span className="text-white/60">SENTINEL_ENGINE_OK</span>
          </div>
        </div>

      </div>

    </div>
  );
}
