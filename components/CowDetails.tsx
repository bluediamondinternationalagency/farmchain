import React, { useState, useEffect } from 'react';
import { Cow } from '../types';
import { generateCowStatusUpdate, getInvestmentAdvice } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, RefreshCw, Loader2, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react';

interface Props {
  cow: Cow;
  onBack: () => void;
  onUpdateCow: (updatedCow: Cow) => void;
  onSell: (cow: Cow) => void;
}

export const CowDetails: React.FC<Props> = ({ cow, onBack, onUpdateCow, onSell }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string>('');
  const [adviceLoading, setAdviceLoading] = useState(false);

  // Generate some dummy chart data if history is empty
  const chartData = cow.history.length > 0 
    ? cow.history.map(h => ({ date: new Date(h.date).toLocaleDateString(), weight: h.weight }))
    : [{ date: 'Initial', weight: cow.weight }];

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      const update = await generateCowStatusUpdate(cow);
      
      const updatedCow: Cow = {
        ...cow,
        weight: update.newWeight,
        healthScore: update.healthScore,
        history: [
          ...cow.history,
          {
            date: Date.now(),
            weight: update.newWeight,
            note: update.narrative
          }
        ]
      };
      
      onUpdateCow(updatedCow);
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAdvice = async () => {
      setAdviceLoading(true);
      const adv = await getInvestmentAdvice(cow);
      setAdvice(adv);
      setAdviceLoading(false);
    };
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const daysOwned = Math.floor((Date.now() - cow.purchaseDate) / (1000 * 60 * 60 * 24));
  const isReadyToSell = daysOwned >= 90;

  return (
    <div className="pb-24">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 font-medium">
        <ArrowLeft size={18} /> Back to Ranch
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="relative h-56">
          <img src={cow.imageUrl} alt={cow.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
            <div className="w-full">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{cow.name}</h1>
                  <div className="flex items-center gap-2 text-white/90">
                     <span className="bg-white/20 px-2 py-1 rounded backdrop-blur-md text-sm">#{cow.id}</span>
                     <span>{cow.breed}</span>
                  </div>
                </div>
                {cow.assetId && (
                  <a 
                    href={`https://testnet.explorer.perawallet.app/asset/${cow.assetId}/`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white flex items-center gap-1 text-xs bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm"
                  >
                    View on Chain <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Blockchain Verification Section */}
          {cow.assetId && (
            <div className="mb-6 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4">
              <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={18} />
                Blockchain Verified NFT
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Asset ID:</span>
                  <code className="bg-white px-2 py-1 rounded border border-slate-200 font-mono text-xs">
                    {cow.assetId}
                  </code>
                </div>
                {cow.imageCID && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Image IPFS:</span>
                    <a 
                      href={`https://gateway.pinata.cloud/ipfs/${cow.imageCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono text-xs"
                    >
                      {cow.imageCID.substring(0, 8)}... <ExternalLink size={10} />
                    </a>
                  </div>
                )}
                {cow.metadataCID && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Metadata IPFS:</span>
                    <a 
                      href={`https://gateway.pinata.cloud/ipfs/${cow.metadataCID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono text-xs"
                    >
                      {cow.metadataCID.substring(0, 8)}... <ExternalLink size={10} />
                    </a>
                  </div>
                )}
                {cow.lastUpdated && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Last Update:</span>
                    <span className="text-slate-800 text-xs">
                      {new Date(cow.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-emerald-200">
                  <a 
                    href={`https://testnet.algoexplorer.io/asset/${cow.assetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 font-medium flex items-center gap-1 text-xs"
                  >
                    View Full History on AlgoExplorer <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Weight</p>
              <p className="text-xl font-bold text-slate-800">{cow.weight} kg</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Health</p>
              <p className={`text-xl font-bold ${cow.healthScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {cow.healthScore}%
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Age</p>
              <p className="text-xl font-bold text-slate-800">{daysOwned} days</p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6 relative overflow-hidden">
             <div className="flex items-start gap-3 relative z-10">
               <Sparkles className="text-indigo-500 shrink-0 mt-1" size={20} />
               <div>
                 <h3 className="font-bold text-indigo-900 text-sm mb-1">Gemini AI Analysis</h3>
                 {adviceLoading ? (
                   <div className="flex items-center gap-2 text-indigo-400 text-sm">
                     <Loader2 className="animate-spin" size={14} /> Analyzing market & biology...
                   </div>
                 ) : (
                   <p className="text-indigo-800 text-sm leading-relaxed">{advice}</p>
                 )}
               </div>
             </div>
             {/* Decorative blob */}
             <div className="absolute -right-4 -bottom-8 w-24 h-24 bg-indigo-200 rounded-full blur-xl opacity-50"></div>
          </div>

          <div className="flex gap-3">
             <button 
               onClick={handleUpdateStatus}
               disabled={loading || isReadyToSell}
               className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                 ${loading || isReadyToSell ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-slate-800'}
               `}
             >
               {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
               {isReadyToSell ? 'Fattening Complete' : 'Update Status (Oracle)'}
             </button>

             {isReadyToSell && (
               <button 
                 onClick={() => onSell(cow)}
                 className="flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 animate-pulse"
               >
                 <CheckCircle2 size={18} />
                 Sell & Burn NFT
               </button>
             )}
          </div>
        </div>
      </div>

      {/* History Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Activity className="text-emerald-500" />
          Growth Trajectory
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={['auto', 'auto']} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Logs */}
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent Logs</h4>
          {cow.history.slice().reverse().map((log, i) => (
            <div key={i} className="flex gap-4 items-start border-l-2 border-slate-200 pl-4 py-1">
              <div className="flex-1">
                 <p className="text-sm text-slate-800">{log.note}</p>
                 <p className="text-xs text-slate-400 mt-1">{new Date(log.date).toLocaleDateString()} • {log.weight} kg</p>
              </div>
            </div>
          ))}
          {cow.history.length === 0 && <p className="text-sm text-slate-400 italic">No updates yet.</p>}
        </div>
      </div>
    </div>
  );
};

// Simple icon for internal use in this file
function Activity(props: any) {
  return (
    <svg 
      {...props} 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
