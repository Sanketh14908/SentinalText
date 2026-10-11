export default function RiskBadge({ category, score }) {
  const lowerCategory = category?.toLowerCase();

  let config = {
    label: category || 'UNKNOWN',
    sublabel: 'VIBE CHECK',
    bg: 'bg-slate-200 dark:bg-slate-800 text-black dark:text-white border-black dark:border-white',
    badgeBg: 'bg-black text-white dark:bg-white dark:text-black',
    strokeColor: '#888888',
    shadowClass: 'shadow-brutal-sm',
    emoji: '👾',
    verdict: 'UNCERTAIN',
  };

  if (lowerCategory === 'legitimate') {
    config = {
      label: 'CERTIFIED BASED',
      sublabel: 'SAFE & CLEAN',
      bg: 'bg-[#00ff66] text-black border-black',
      badgeBg: 'bg-black text-[#00ff66]',
      strokeColor: '#00ff66',
      shadowClass: 'shadow-brutal-lime',
      emoji: '✨',
      verdict: 'ZERO CAP',
    };
  } else if (lowerCategory === 'spam') {
    config = {
      label: 'ANNOYING SPAM',
      sublabel: 'TRASH DETECTED',
      bg: 'bg-[#ffe600] text-black border-black',
      badgeBg: 'bg-black text-[#ffe600]',
      strokeColor: '#ffe600',
      shadowClass: 'shadow-brutal-yellow',
      emoji: '📢',
      verdict: 'JUNK VIBES',
    };
  } else if (lowerCategory === 'spoofing') {
    config = {
      label: 'IMPOSTER ALERT',
      sublabel: 'SPOOF DETECTED',
      bg: 'bg-[#ff5500] text-white border-black',
      badgeBg: 'bg-black text-[#00f0ff]',
      strokeColor: '#ff5500',
      shadowClass: 'shadow-brutal-cyan',
      emoji: '🎭',
      verdict: 'SUS IDENTITY',
    };
  } else if (lowerCategory === 'phishing') {
    config = {
      label: 'HIGH-KEY COOKED',
      sublabel: 'PHISHING SCAM',
      bg: 'bg-[#ff007f] text-white border-black',
      badgeBg: 'bg-black text-[#ff007f]',
      strokeColor: '#ff007f',
      shadowClass: 'shadow-brutal-pink',
      emoji: '💀',
      verdict: 'SCAMMER ALERT',
    };
  }

  // Large variant with circular / brutalist gauge when score is provided
  if (score !== undefined) {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

    return (
      <div className={`w-full sm:w-auto inline-flex items-center gap-3 sm:gap-4 px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl ${config.bg} border-2 sm:border-3 border-black shadow-brutal transition-transform duration-200 hover:rotate-1`}>
        {/* Gauge circle */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0 bg-black rounded-xl border-2 border-black p-1 shadow-inner">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 52 52">
            <circle
              cx="26"
              cy="26"
              r={radius}
              className="stroke-gray-800"
              strokeWidth="5"
              fill="none"
            />
            <circle
              cx="26"
              cy="26"
              r={radius}
              stroke={config.strokeColor}
              strokeWidth="5"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="square"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="font-syne font-black text-xs sm:text-sm leading-none">{score}%</span>
          </div>
        </div>

        {/* Text information */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg">{config.emoji}</span>
            <span className="font-bungee text-xs sm:text-base tracking-wide leading-tight truncate">
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
            <span className="font-mono-code text-[10px] sm:text-[11px] font-black uppercase bg-black text-white px-1.5 sm:px-2 py-0.5 rounded border border-black tracking-wider">
              {config.verdict}
            </span>
            <span className="font-space text-[11px] sm:text-xs font-black uppercase opacity-90">
              RISK: {score}/100
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Small pill variant (used in history list)
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bg} border-2 border-black font-space font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#000] rotate-[-1deg]`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </div>
  );
}
