import React from 'react';
import { Cow } from '../types';
import { CowCard } from './CowCard';
import { DashboardAnalytics } from './DashboardAnalytics';
import { PlusCircle } from 'lucide-react';

interface Props {
  cows: Cow[];
  onCowClick: (cow: Cow) => void;
  onNavigateToMarket: () => void;
  isDemoMode?: boolean;
}

export const Dashboard: React.FC<Props> = ({ cows, onCowClick, onNavigateToMarket, isDemoMode = false }) => {
  return (
    <div className="space-y-6 pb-20">
      {isDemoMode && cows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>Demo Mode:</strong> These are demo cattle. Connect your wallet and visit the Admin Console to mint cattle and assign them to your wallet address.
          </p>
        </div>
      )}

      {/* Analytics Dashboard */}
      <DashboardAnalytics cows={cows} />
      
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Farm</h2>
          <p className="text-slate-500">Managing {cows.length} active heads of cattle</p>
        </div>
      </div>

      {cows.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="inline-block p-4 rounded-full bg-slate-50 mb-4">
             <PlusCircle size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Your ranch is empty</h3>
          <p className="text-slate-500 mb-6 max-w-xs mx-auto">Start your investment journey by purchasing your first cattle from the marketplace.</p>
          <button 
            onClick={onNavigateToMarket}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Go to Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cows.map(cow => (
            <CowCard key={cow.id} cow={cow} onClick={onCowClick} />
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {cows.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-blue-600 text-sm font-medium">Total Investment</p>
            <p className="text-2xl font-bold text-slate-800">
              {cows.reduce((acc, cow) => acc + cow.purchasePrice, 0).toLocaleString()} ALGO
            </p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
            <p className="text-emerald-600 text-sm font-medium">Proj. Value</p>
            <p className="text-2xl font-bold text-slate-800">
              {(cows.reduce((acc, cow) => acc + (cow.purchasePrice * (1 + cow.expectedReturn/100)), 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} ALGO
            </p>
          </div>
        </div>
      )}
    </div>
  );
};