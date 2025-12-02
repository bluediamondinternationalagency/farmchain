import React, { useState } from 'react';
import { Cow, PaymentSplitConfig, SlaughterInfo } from '../types';
import { AlertTriangle, DollarSign, FileText, TrendingUp, X } from 'lucide-react';

interface Props {
  cow: Cow;
  paymentConfigs: PaymentSplitConfig[];
  onSlaughter: (slaughterInfo: SlaughterInfo) => Promise<void>;
  onClose: () => void;
}

export const SlaughterModal: React.FC<Props> = ({ cow, paymentConfigs, onSlaughter, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    facility: '',
    finalWeight: cow.weight,
    grossPrice: cow.purchasePrice * (1 + cow.expectedReturn / 100),
    expenses: 0,
  });

  // Calculate net price and splits
  const netPrice = formData.grossPrice - formData.expenses;
  
  // Get payment split config for this cattle
  const splitConfig = paymentConfigs.find(
    c => c.cattleType === cow.cattleType && c.isActive
  ) || paymentConfigs.find(c => c.cattleType === 'standard' && c.isActive);

  const farmerPercentage = splitConfig?.farmerPercentage || 70;
  const platformPercentage = splitConfig?.platformPercentage || 30;

  const farmerAmount = netPrice * (farmerPercentage / 100);
  const platformAmount = netPrice * (platformPercentage / 100);

  const weightGain = formData.finalWeight - (cow.history[0]?.weight || cow.weight);
  const daysOnRanch = Math.floor((Date.now() - cow.purchaseDate) / (1000 * 60 * 60 * 24));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.facility) {
      alert('Please enter slaughter facility name');
      return;
    }

    if (formData.finalWeight < cow.weight * 0.8) {
      if (!confirm('Final weight seems unusually low. Continue?')) return;
    }

    if (formData.expenses > formData.grossPrice * 0.5) {
      if (!confirm('Expenses are more than 50% of gross price. Continue?')) return;
    }

    setIsProcessing(true);

    try {
      const slaughterInfo: SlaughterInfo = {
        date: Date.now(),
        facility: formData.facility,
        finalWeight: formData.finalWeight,
        grossPrice: formData.grossPrice,
        expenses: formData.expenses,
        netPrice: netPrice,
      };

      await onSlaughter(slaughterInfo);
      
    } catch (error: any) {
      alert(`Slaughter process failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <h2 className="text-2xl font-bold">Record Slaughter & Distribute Payment</h2>
              <p className="text-red-100 text-sm">
                This action will finalize the cattle lifecycle and trigger payment distribution
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          
          {/* Cattle Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-slate-800 mb-3">Cattle Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Name</span>
                <p className="font-bold">{cow.name}</p>
              </div>
              <div>
                <span className="text-slate-500">Breed</span>
                <p className="font-bold">{cow.breed}</p>
              </div>
              <div>
                <span className="text-slate-500">Current Weight</span>
                <p className="font-bold">{cow.weight} kg</p>
              </div>
              <div>
                <span className="text-slate-500">Days on Ranch</span>
                <p className="font-bold">{daysOnRanch} days</p>
              </div>
            </div>
          </div>

          {/* Slaughter Details */}
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileText size={18} />
              Slaughter Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slaughter Facility *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Northern Meat Processing"
                value={formData.facility}
                onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Final Weight (kg) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={formData.finalWeight}
                onChange={(e) => setFormData({ ...formData, finalWeight: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <p className="text-xs text-slate-500 mt-1">
                Weight gain: <span className={weightGain >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {weightGain > 0 ? '+' : ''}{weightGain.toFixed(1)} kg
                </span>
              </p>
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <DollarSign size={18} />
              Financial Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gross Sale Price (ALGO) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.grossPrice}
                onChange={(e) => setFormData({ ...formData, grossPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <p className="text-xs text-slate-500 mt-1">
                Expected: {(cow.purchasePrice * (1 + cow.expectedReturn / 100)).toFixed(2)} ALGO
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expenses (ALGO)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Feed, veterinary, processing fees, etc."
                value={formData.expenses}
                onChange={(e) => setFormData({ ...formData, expenses: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isProcessing}
              />
              <p className="text-xs text-slate-500 mt-1">
                Feed, veterinary care, slaughter fees, transport, etc.
              </p>
            </div>
          </div>

          {/* Payment Split Preview */}
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} />
              Payment Distribution Preview
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Gross Sale Price</span>
                <span className="font-bold">{formData.grossPrice.toFixed(2)} ALGO</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Expenses</span>
                <span className="font-bold text-red-600">-{formData.expenses.toFixed(2)} ALGO</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-bold text-slate-800">Net Amount</span>
                <span className="font-bold text-lg">{netPrice.toFixed(2)} ALGO</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border border-emerald-300">
                <p className="text-xs text-slate-500 mb-1">Farmer Share ({farmerPercentage}%)</p>
                <p className="text-2xl font-bold text-emerald-600">{farmerAmount.toFixed(2)} ALGO</p>
                <p className="text-xs text-slate-500 mt-1">
                  To: {cow.ownerAddress?.substring(0, 8)}...
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-300">
                <p className="text-xs text-slate-500 mb-1">Platform Share ({platformPercentage}%)</p>
                <p className="text-2xl font-bold text-blue-600">{platformAmount.toFixed(2)} ALGO</p>
                <p className="text-xs text-slate-500 mt-1">FarmChain Platform</p>
              </div>
            </div>

            {splitConfig && (
              <p className="text-xs text-slate-500 mt-3 text-center">
                Using split config: <span className="font-medium">{splitConfig.cattleType}</span>
              </p>
            )}
          </div>

          {/* Warning */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
            <div className="text-sm text-amber-800">
              <p className="font-bold mb-1">Important:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>This action is irreversible and will be recorded on the blockchain</li>
                <li>Payment will be distributed immediately via atomic transaction</li>
                <li>Cattle status will be updated to "Slaughtered"</li>
                <li>Complete supply chain history will be permanently accessible</li>
              </ul>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t p-6 bg-slate-50 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !formData.facility || netPrice <= 0}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <FileText size={18} />
                Record Slaughter & Distribute Payment
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
