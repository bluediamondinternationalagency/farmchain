import React from 'react';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export type TransactionState = 'pending' | 'confirming' | 'confirmed' | 'failed';

export interface Transaction {
  id: string;
  txId?: string;
  description: string;
  state: TransactionState;
  error?: string;
  timestamp: number;
}

interface Props {
  transactions: Transaction[];
  onDismiss?: (id: string) => void;
}

const TransactionItem: React.FC<{ tx: Transaction; onDismiss?: (id: string) => void }> = ({ tx, onDismiss }) => {
  const getIcon = () => {
    switch (tx.state) {
      case 'pending':
      case 'confirming':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStateText = () => {
    switch (tx.state) {
      case 'pending':
        return 'Preparing...';
      case 'confirming':
        return 'Confirming...';
      case 'confirmed':
        return 'Confirmed';
      case 'failed':
        return 'Failed';
    }
  };

  const getBgColor = () => {
    switch (tx.state) {
      case 'pending':
      case 'confirming':
        return 'bg-blue-50 border-blue-200';
      case 'confirmed':
        return 'bg-emerald-50 border-emerald-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`${getBgColor()} border rounded-lg p-4 mb-3`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm text-slate-800">{tx.description}</h4>
            <span className="text-xs text-slate-500">{getStateText()}</span>
          </div>
          {tx.txId && (
            <a
              href={
                tx.description.includes('Minting NFT') 
                  ? `https://testnet.algoexplorer.io/asset/${tx.txId}` 
                  : `https://testnet.algoexplorer.io/tx/${tx.txId}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
            >
              {tx.description.includes('Minting NFT') ? 'View Asset on AlgoExplorer' : 'View on AlgoExplorer'} <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {tx.error && (
            <p className="text-xs text-red-600 mt-2">{tx.error}</p>
          )}
        </div>
        {(tx.state === 'confirmed' || tx.state === 'failed') && onDismiss && (
          <button
            onClick={() => onDismiss(tx.id)}
            className="text-slate-400 hover:text-slate-600 text-xs"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export const TransactionStatus: React.FC<Props> = ({ transactions, onDismiss }) => {
  if (transactions.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-md w-full">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          Blockchain Transactions
        </h3>
        <div className="max-h-96 overflow-y-auto">
          {transactions.map(tx => (
            <TransactionItem key={tx.id} tx={tx} onDismiss={onDismiss} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Hook for managing transactions
export const useTransactions = () => {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);

  const addTransaction = (description: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const tx: Transaction = {
      id,
      description,
      state: 'pending',
      timestamp: Date.now()
    };
    setTransactions(prev => [...prev, tx]);
    return id;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  const clearCompleted = () => {
    setTransactions(prev =>
      prev.filter(tx => tx.state !== 'confirmed' && tx.state !== 'failed')
    );
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearCompleted
  };
};
