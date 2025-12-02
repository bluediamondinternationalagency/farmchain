import React from 'react';
import { Cow } from '../types';
import { Rocket, RefreshCw, DollarSign, BarChart3 } from 'lucide-react';

interface Props {
  onBuy: (cow: Cow) => void;
  userBalance: number;
}

export const Marketplace: React.FC<Props> = () => {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 text-center space-y-8 pb-24">
      <div className="bg-emerald-50 p-6 rounded-full mb-2">
        <Rocket size={48} className="text-emerald-600" />
      </div>
      
      <div className="space-y-3 max-w-sm mx-auto">
        <h2 className="text-3xl font-bold text-slate-800">Marketplace Coming Soon</h2>
        <p className="text-slate-500">
          We are building a robust secondary market to give you full control over your livestock assets on the Algorand blockchain.
        </p>
      </div>

      <div className="grid gap-4 w-full text-left">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex gap-4 items-start transform transition-all hover:scale-[1.02]">
          <div className="bg-blue-50 p-3 rounded-xl shrink-0">
             <RefreshCw size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Easy Liquidation</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Don't want to wait 90 days? Sell your cattle NFT instantly on the secondary market before the fattening contract expires to free up capital.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex gap-4 items-start transform transition-all hover:scale-[1.02]">
          <div className="bg-amber-50 p-3 rounded-xl shrink-0">
             <DollarSign size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Trade Opportunities</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Buy into partially matured assets closer to their sale date for quicker returns or arbitrage based on growth data.
            </p>
          </div>
        </div>

         <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex gap-4 items-start transform transition-all hover:scale-[1.02]">
          <div className="bg-purple-50 p-3 rounded-xl shrink-0">
             <BarChart3 size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Dynamic Valuation</h3>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Asset prices are automatically suggested based on real-time weight gain and health data provided by our Oracle system.
            </p>
          </div>
        </div>
      </div>
      
      <div className="w-full bg-slate-100 rounded-lg p-4 mt-8">
        <p className="text-xs text-slate-400 font-mono">
          STATUS: DEVELOPMENT_PHASE_2<br/>
          DEPLOYMENT: TESTNET_PENDING
        </p>
      </div>
    </div>
  );
};