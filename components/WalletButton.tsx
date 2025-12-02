import React from 'react';
import { WalletState } from '../types';
import { User, LogIn, ExternalLink, Copy } from 'lucide-react';

interface Props {
  wallet: WalletState;
  onConnect: () => void;
  loading?: boolean;
}

export const WalletButton: React.FC<Props> = ({ wallet, onConnect, loading }) => {
  const needsFunding = wallet.isConnected && wallet.balance < 0.5;
  const isPeraWallet = wallet.walletType === 'pera';

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      alert('Address copied!');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {needsFunding && (
        <a 
          href={`https://bank.testnet.algorand.network/?account=${wallet.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-full border border-amber-200 hover:bg-amber-100"
        >
          Fund Wallet <ExternalLink size={12} />
        </a>
      )}
      
      <button
        onClick={onConnect}
        disabled={loading}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all shadow-sm
          ${wallet.isConnected 
            ? 'bg-slate-800 text-white border border-slate-700' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'}
          ${loading ? 'opacity-75 cursor-wait' : ''}
        `}
      >
        {wallet.isConnected ? (
          <>
            <User size={18} className="text-emerald-400" />
            <div className="flex flex-col items-start leading-none group relative">
              <span className="text-xs text-slate-400 font-normal flex items-center gap-1">
                {isPeraWallet && '🟣 '}
                {wallet.address?.substring(0, 4)}...{wallet.address?.substring(wallet.address.length - 4)}
                <Copy size={10} className="hover:text-white cursor-pointer" onClick={copyAddress}/>
              </span>
              <span className={`text-sm font-bold ${wallet.balance < 0.2 ? 'text-amber-400' : 'text-white'}`}>
                {wallet.balance.toFixed(2)} ALGO
              </span>
            </div>
          </>
        ) : (
          <>
            <LogIn size={18} />
            {loading ? 'Connecting...' : 'Connect Pera Wallet'}
          </>
        )}
      </button>
    </div>
  );
};
