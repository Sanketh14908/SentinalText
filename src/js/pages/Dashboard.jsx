import { useState, useEffect } from 'react';
import { FileText, AlertTriangle, Flag, Loader2, Activity, Zap } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/analyses/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#ff007f] stroke-[3]" />
        <span className="font-bungee text-sm tracking-wider uppercase">LOADING TELEMETRY...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 bg-[#ff007f] text-white border-3 border-black rounded-2xl shadow-brutal text-center font-space font-black">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 stroke-[2.5]" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const maxRisk = stats?.trend ? Math.max(...stats.trend.map(d => d.riskScore), 1) : 1;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 w-full">
      
      {/* Dashboard Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#00f0ff] text-black font-mono-code text-[11px] sm:text-xs font-black px-2 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000] rotate-[-1deg]">
              🛰️ THREAT RADAR v3.0
            </span>
            <span className="bg-[#00ff66] text-black font-space text-[11px] sm:text-xs font-extrabold px-2 py-0.5 rounded border border-black rotate-[2deg]">
              ● LIVE TELEMETRY
            </span>
          </div>
          <h1 className="font-syne font-black text-2xl sm:text-5xl text-black dark:text-white uppercase tracking-tight break-words">
            YOUR SECURITY DOSSIER
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#ffe600] text-black font-space font-black text-xs uppercase px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border-2 border-black shadow-brutal-sm flex items-center gap-2">
            <Zap className="w-4 h-4 fill-black" />
            <span>SHIELD: MAXIMUM</span>
          </div>
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
        <StatCard 
          title="Total Messages Analyzed" 
          value={stats?.total ?? 0} 
          icon={FileText}
          subtitle="All scans recorded"
        />
        <StatCard 
          title="Flagged As Risky" 
          value={`${stats?.flaggedPercent ?? 0}%`} 
          icon={AlertTriangle}
          subtitle="Threat ratio detected"
        />
        <StatCard 
          title="Top Red Flag Trend" 
          value={stats?.commonRedFlag || 'None detected'} 
          subtitle="Most recurrent scam tactic"
          icon={Flag}
          valueClassName="text-sm sm:text-base font-space font-black text-black dark:text-white leading-snug line-clamp-3"
        />
      </div>

      {/* 7-Day Trend Graph Window */}
      <div className="bg-white dark:bg-[#121212] border-2 sm:border-3 border-black dark:border-white rounded-2xl sm:rounded-3xl shadow-brutal-xl overflow-hidden transition-colors duration-200">
        
        {/* Terminal Header */}
        <div className="bg-black text-white px-3 sm:px-5 py-2.5 sm:py-3 border-b-2 sm:border-b-3 border-black dark:border-white flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="w-4 h-4 text-[#00ff66] shrink-0" />
            <span className="font-mono-code text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#00ff66] truncate">
              [ 7_DAY_RISK_SPECTRUM.DAT ]
            </span>
          </div>
          <span className="font-mono-code text-[10px] sm:text-[11px] text-[#ffe600] font-bold shrink-0">
            RECENT WEEK
          </span>
        </div>

        <div className="p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-syne font-black text-lg sm:text-xl text-black dark:text-white uppercase tracking-tight">
                RISK INCIDENCE OVER TIME
              </h3>
              <p className="font-space text-xs font-bold text-black/60 dark:text-gray-400 mt-1">
                Visualizing risky messages and phishing traps caught each day
              </p>
            </div>
            <span className="font-bungee text-[10px] sm:text-xs bg-[#ff007f] text-white px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border-2 border-black rotate-[-2deg] shadow-[2px_2px_0px_#000]">
              7 DAYS
            </span>
          </div>
          
          {/* Chart Bars */}
          <div className="h-56 sm:h-64 flex items-end justify-between gap-1 sm:gap-4 pt-6 pb-2 border-b-2 border-black dark:border-white/20">
            {stats?.trend && stats.trend.map((data, index) => {
              const heightPercent = maxRisk > 0 ? (data.riskScore / maxRisk) * 100 : 0;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 group h-full justify-end">
                  <div className="relative w-full flex justify-center h-[200px] items-end pb-1">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-black text-[#00ff66] border-2 border-black font-mono-code text-xs px-2.5 py-1 rounded-lg transition-opacity whitespace-nowrap z-20 shadow-[3px_3px_0px_#000] pointer-events-none">
                      ⚠️ {data.riskScore} RISKY MSGS
                    </div>
                    {/* Bar element with brutalist styling */}
                    <div 
                      className="w-full max-w-[3.5rem] bg-[#ffe600] group-hover:bg-[#ff007f] rounded-t-xl transition-all duration-200 relative border-2 border-black shadow-[3px_0px_0px_#000]"
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    >
                      <div className="w-full h-2 bg-black/20 rounded-t-lg"></div>
                    </div>
                  </div>
                  <span className="font-space font-extrabold text-xs sm:text-sm text-black dark:text-gray-300 mt-3 group-hover:text-[#ff007f] transition-colors uppercase">
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-code font-bold text-black/60 dark:text-gray-400">
            <span>METRIC: DAILY FLAGGED SUSPECT MESSAGES</span>
            <span className="text-[#00ff66]">✓ INTEL SYNCED</span>
          </div>

        </div>

      </div>

    </div>
  );
}
