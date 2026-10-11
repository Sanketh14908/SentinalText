import RiskBadge from './RiskBadge';
import { ArrowRight } from 'lucide-react';

export default function MessageHistoryItem({ item, onClick }) {
  const displayDate = item.created_at || item.date;

  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white dark:bg-[#121212] border-3 border-black dark:border-white rounded-2xl p-4 sm:p-5 cursor-pointer shadow-brutal-sm hover:shadow-brutal hover:-translate-y-0.5 hover:bg-[#fffbe6] dark:hover:bg-[#1a1a1a] transition-all duration-150 group relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Message snippet & metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono-code text-[11px] font-black bg-black text-white px-2 py-0.5 rounded uppercase">
              CASE #{String(item.id || item._id || '00').slice(-6)}
            </span>
            <span className="font-mono-code text-[11px] text-black/60 dark:text-gray-400 font-bold">
              {displayDate ? new Date(displayDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
            </span>
          </div>

          <p className="font-space font-extrabold text-sm sm:text-base text-black dark:text-white truncate group-hover:text-[#ff007f] transition-colors mb-3">
            "{item.message || item.message_content}"
          </p>

          <div className="flex items-center gap-3">
            <RiskBadge category={item.category} />
          </div>
        </div>

        {/* Right: Inspection CTA Button */}
        <div className="shrink-0 flex items-center justify-end">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00f0ff] text-black font-space font-black text-xs uppercase rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] group-hover:bg-[#ffe600] group-hover:translate-x-1 transition-all">
            <span>INSPECT</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

      </div>
    </div>
  );
}
