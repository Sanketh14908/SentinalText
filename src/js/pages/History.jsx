import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, FolderArchive, ArrowUpRight } from 'lucide-react';
import MessageHistoryItem from '../components/MessageHistoryItem';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/analyses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        setHistory(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleSelectItem = (item) => {
    navigate('/', { state: { selectedAnalysis: item } });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
      
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#ff007f] text-white font-mono-code text-xs font-black px-2 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000] rotate-[-1deg]">
              📂 EVIDENCE VAULT
            </span>
            <span className="bg-[#ffe600] text-black font-space text-xs font-black px-2 py-0.5 rounded border border-black rotate-[2deg]">
              {history.length} LOGGED SCANS
            </span>
          </div>
          <h1 className="font-syne font-black text-3xl sm:text-5xl text-black dark:text-white uppercase tracking-tight">
            RECENT ANALYSES DOSSIER
          </h1>
        </div>

        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00ff66] text-black font-bungee text-xs rounded-xl border-2 border-black shadow-brutal-sm btn-tactile"
        >
          <span>SCAN NEW TEXT</span>
          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
        </Link>
      </div>
      
      {/* List / Content Area */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#ff007f] stroke-[3]" />
            <span className="font-bungee text-xs uppercase">UNPACKING ARCHIVES...</span>
          </div>
        ) : error ? (
          <div className="p-6 bg-[#ff007f] text-white border-3 border-black rounded-2xl font-space font-black text-center shadow-brutal">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white dark:bg-[#121212] border-3 border-dashed border-black dark:border-white/50 rounded-3xl p-12 text-center shadow-brutal-sm">
            <div className="w-16 h-16 bg-[#00f0ff] rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center mx-auto mb-4 rotate-[-3deg]">
              <FolderArchive className="w-8 h-8 text-black stroke-[2.5]" />
            </div>
            <h3 className="font-syne font-black text-2xl text-black dark:text-white uppercase mb-2">
              VAULT IS EMPTY
            </h3>
            <p className="font-space font-semibold text-sm text-black/70 dark:text-gray-400 max-w-sm mx-auto mb-6">
              You haven't scanned any suspicious messages yet. Test out our AI scanner to populate your evidence locker!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ffe600] text-black font-bungee text-xs rounded-2xl border-3 border-black shadow-brutal-yellow btn-tactile uppercase"
            >
              ⚡ SCAN YOUR FIRST MESSAGE ⚡
            </Link>
          </div>
        ) : (
          history.map((item) => (
            <MessageHistoryItem 
              key={item.id || item._id} 
              item={item} 
              onClick={() => handleSelectItem(item)} 
            />
          ))
        )}
      </div>

    </div>
  );
}
