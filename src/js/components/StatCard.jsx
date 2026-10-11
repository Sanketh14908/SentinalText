export default function StatCard({ title, value, subtitle, icon: Icon, valueClassName }) {
  let theme = {
    bg: "bg-white dark:bg-[#121212]",
    badgeBg: "bg-[#00f0ff] text-black",
    iconBg: "bg-[#00f0ff] text-black",
    shadow: "shadow-brutal-cyan",
    sticker: "⚡ DATA",
  };
  
  const lowerTitle = (title || '').toLowerCase();

  if (lowerTitle.includes('flagged') || lowerTitle.includes('risk')) {
    theme = {
      bg: "bg-white dark:bg-[#121212]",
      badgeBg: "bg-[#ff007f] text-white",
      iconBg: "bg-[#ff007f] text-white",
      shadow: "shadow-brutal-pink",
      sticker: "🚨 ALERT",
    };
  } else if (lowerTitle.includes('common') || lowerTitle.includes('red flag')) {
    theme = {
      bg: "bg-white dark:bg-[#121212]",
      badgeBg: "bg-[#ffe600] text-black",
      iconBg: "bg-[#ffe600] text-black",
      shadow: "shadow-brutal-yellow",
      sticker: "⚠️ TOP THREAT",
    };
  } else if (lowerTitle.includes('total') || lowerTitle.includes('scans')) {
    theme = {
      bg: "bg-white dark:bg-[#121212]",
      badgeBg: "bg-[#00ff66] text-black",
      iconBg: "bg-[#00ff66] text-black",
      shadow: "shadow-brutal-lime",
      sticker: "📊 TOTAL",
    };
  }

  const isLong = typeof value === 'string' && value.length > 12;
  const computedValueClass = valueClassName || (
    isLong
      ? "text-base sm:text-lg font-space font-black text-black dark:text-white leading-snug break-words"
      : "text-3xl sm:text-5xl font-syne font-black text-black dark:text-white tracking-tight"
  );

  return (
    <div className={`${theme.bg} border-3 border-black dark:border-white rounded-3xl p-6 ${theme.shadow} hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden group`}>
      
      {/* Top sticker & title */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-md font-mono-code text-[11px] font-black uppercase border border-black shadow-[1.5px_1.5px_0px_#000] mb-2 ${theme.badgeBg}`}>
            {theme.sticker}
          </span>
          <p className="font-space font-bold text-xs sm:text-sm uppercase tracking-wider text-black/70 dark:text-gray-300">
            {title}
          </p>
        </div>

        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_#000] ${theme.iconBg} group-hover:rotate-6 transition-transform`}>
          <Icon className="w-6 h-6 stroke-[2.5]" />
        </div>
      </div>

      {/* Main value display */}
      <div className="my-2">
        <h3 className={computedValueClass} title={typeof value === 'string' ? value : undefined}>
          {value || '0'}
        </h3>
      </div>

      {/* Subtitle tag */}
      {subtitle && (
        <div className="mt-3 pt-3 border-t-2 border-black/10 dark:border-white/10">
          <span className="font-mono-code text-xs text-black/80 dark:text-gray-400 font-bold bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-md border border-black/10 dark:border-white/10 inline-block">
            {subtitle}
          </span>
        </div>
      )}

    </div>
  );
}
