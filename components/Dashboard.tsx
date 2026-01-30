import React from 'react';
import { Cow } from '../types';
import { CowCard } from './CowCard';
import { DashboardAnalytics } from './DashboardAnalytics';
import { PlusCircle, RefreshCw } from 'lucide-react';

interface Props {
  cows: Cow[];
  onCowClick: (cow: Cow) => void;
  onNavigateToMarket: () => void;
  onRefresh?: () => void;
  isDemoMode?: boolean;
  isRefreshing?: boolean;
}

export const Dashboard: React.FC<Props> = ({ 
  cows, 
  onCowClick, 
  onNavigateToMarket, 
  onRefresh,
  isRefreshing = false,
  isDemoMode = false 
}) => {
  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      {isDemoMode && cows.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <p className="text-blue-800 text-sm flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span><strong>Demo Mode:</strong> These are demo cattle. Connect your wallet and visit the Admin Console to mint cattle and assign them to your wallet address.</span>
          </p>
        </div>
      )}

      {/* Analytics Dashboard */}
      <DashboardAnalytics cows={cows} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">My Ranch</h2>
          <p className="text-slate-500 text-sm md:text-base">Managing {cows.length} active head{cows.length !== 1 ? 's' : ''} of cattle</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-lg hover:from-emerald-100 hover:to-emerald-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-200 hover:shadow-md"
            title="Sync assets from blockchain"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="text-sm font-medium">{isRefreshing ? 'Syncing...' : 'Sync Assets'}</span>
          </button>
        )}
      </div>

      {cows.length === 0 ? (
        <div className="text-center py-16 md:py-20 bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-dashed border-slate-300 shadow-inner">
          <div className="inline-block p-5 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 mb-4 shadow-sm">
             <PlusCircle size={40} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Your ranch is empty</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto px-4">Start your investment journey by purchasing your first cattle from the marketplace.</p>
          <button 
            onClick={onNavigateToMarket}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-8 py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Explore Marketplace
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
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-blue-700 text-sm font-semibold mb-1">Total Investment</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-800">
              {cows.reduce((acc, cow) => acc + cow.purchasePrice, 0).toLocaleString()} ALGO
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-5 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-emerald-700 text-sm font-semibold mb-1">Projected Value</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-800">
              {(cows.reduce((acc, cow) => acc + (cow.purchasePrice * (1 + cow.expectedReturn/100)), 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })} ALGO
            </p>
          </div>
        </div>
      )}
    </div>
  );
};