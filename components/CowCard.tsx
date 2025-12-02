import React from 'react';
import { Cow } from '../types';
import { TrendingUp, Activity, Calendar } from 'lucide-react';

interface Props {
  cow: Cow;
  onClick: (cow: Cow) => void;
}

export const CowCard: React.FC<Props> = ({ cow, onClick }) => {
  const daysOwned = Math.floor((Date.now() - cow.purchaseDate) / (1000 * 60 * 60 * 24));
  const progress = Math.min((daysOwned / 90) * 100, 100);

  return (
    <div 
      onClick={() => onClick(cow)}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={cow.imageUrl} 
          alt={cow.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-mono">
          #{cow.id}
        </div>
        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
          cow.status === 'fattening' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
        }`}>
          {cow.status.replace('_', ' ')}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{cow.name}</h3>
            <p className="text-slate-500 text-sm">{cow.breed}</p>
          </div>
          <div className="text-right">
            <span className="block text-emerald-600 font-bold">{cow.weight} kg</span>
            <span className="text-xs text-slate-400">Current Wt.</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
            <Activity size={16} className="text-blue-500" />
            <div>
              <p className="text-slate-400 text-xs">Health</p>
              <p className="font-semibold text-slate-700">{cow.healthScore}%</p>
            </div>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <div>
              <p className="text-slate-400 text-xs">ROI Est.</p>
              <p className="font-semibold text-slate-700">+{cow.expectedReturn}%</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1"><Calendar size={12}/> {daysOwned} days</span>
            <span>90 days goal</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
