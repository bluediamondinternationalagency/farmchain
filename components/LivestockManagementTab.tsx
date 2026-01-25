import React, { useState } from 'react';
import { Cow, VaccinationRecord } from '../types';
import { Edit, CheckCircle, Plus, Trash2, Save, X, Skull, DollarSign } from 'lucide-react';
import { Web3Service } from '../services/web3Service';

interface Props {
  allCows: Cow[];
  onUpdateCow: (updatedCow: Cow) => void;
  onSlaughterCattle?: (cow: Cow) => void;
  walletAddress: string | null;
  toast: any;
}

export const LivestockManagementTab: React.FC<Props> = ({ allCows, onUpdateCow, onSlaughterCattle, walletAddress, toast }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Cow>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [newVaccination, setNewVaccination] = useState<Partial<VaccinationRecord>>({});
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedCowForSale, setSelectedCowForSale] = useState<Cow | null>(null);
  const [saleData, setSaleData] = useState({ price: 0, burnNFT: true, notes: '' });
  
  const startEdit = (cow: Cow) => {
    setEditingId(cow.id);
    setEditData({
      weight: cow.weight,
      healthScore: cow.healthScore,
      status: cow.status,
      vaccination_records: cow.vaccination_records || []
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setNewVaccination({});
  };

  const addVaccination = () => {
    if (!newVaccination.date || !newVaccination.vaccine) {
      toast.warning('Missing Information', 'Please provide date and vaccine name');
      return;
    }

    const vaccination: VaccinationRecord = {
      date: newVaccination.date!,
      vaccine: newVaccination.vaccine!,
      batch: newVaccination.batch,
      veterinarian: newVaccination.veterinarian,
      notes: newVaccination.notes
    };

    setEditData({
      ...editData,
      vaccination_records: [...(editData.vaccination_records || []), vaccination]
    });

    setNewVaccination({});
  };

  const removeVaccination = (index: number) => {
    const updated = [...(editData.vaccination_records || [])];
    updated.splice(index, 1);
    setEditData({ ...editData, vaccination_records: updated });
  };

  const saveUpdates = async (cow: Cow) => {
    if (!walletAddress) {
      toast.error('Wallet Not Connected', 'Please connect your Pera Wallet to update NFTs.');
      return;
    }

    if (!cow.assetId) {
      toast.error('No Asset ID', 'This livestock does not have an NFT minted yet.');
      return;
    }

    setIsUpdating(true);
    try {
      // Merge updates
      const updatedCow: Cow = {
        ...cow,
        weight: editData.weight || cow.weight,
        healthScore: editData.healthScore || cow.healthScore,
        status: editData.status || cow.status,
        vaccination_records: editData.vaccination_records || cow.vaccination_records,
        lastUpdated: Date.now(),
        history: [
          ...cow.history,
          {
            date: Date.now(),
            weight: editData.weight || cow.weight,
            note: `Updated by admin: Weight=${editData.weight}kg, Health=${editData.healthScore}, Status=${editData.status}`
          }
        ]
      };

      // Update NFT metadata on-chain
      await Web3Service.updateNFTMetadata(cow.assetId, updatedCow, walletAddress);

      // Update local state
      onUpdateCow(updatedCow);

      toast.success('Update Complete', 'Livestock data updated on blockchain!');
      setEditingId(null);
      setEditData({});
    } catch (error: any) {
      console.error('Failed to update livestock:', error);
      toast.error('Update Failed', error.message || 'Failed to update NFT metadata');
    } finally {
      setIsUpdating(false);
    }
  };

  const markReadyForSale = async (cow: Cow) => {
    if (!walletAddress) {
      toast.error('Wallet Not Connected', 'Please connect your Pera Wallet.');
      return;
    }

    if (!cow.assetId) {
      toast.error('No Asset ID', 'This livestock does not have an NFT minted yet.');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedCow: Cow = {
        ...cow,
        status: 'ready_for_sale',
        lastUpdated: Date.now(),
        history: [
          ...cow.history,
          {
            date: Date.now(),
            weight: cow.weight,
            note: 'Marked as ready for sale by admin'
          }
        ]
      };

      // Update NFT metadata on-chain
      await Web3Service.updateNFTMetadata(cow.assetId, updatedCow, walletAddress);

      // Update local state
      onUpdateCow(updatedCow);

      toast.success('Status Updated', 'Livestock marked as ready for sale!');
    } catch (error: any) {
      console.error('Failed to mark ready for sale:', error);
      toast.error('Update Failed', error.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsSold = async () => {
    if (!selectedCowForSale || !walletAddress) return;

    setIsUpdating(true);
    try {
      const updatedCow: Cow = {
        ...selectedCowForSale,
        status: 'sold',
        lastUpdated: Date.now(),
        history: [
          ...selectedCowForSale.history,
          {
            date: Date.now(),
            weight: selectedCowForSale.weight,
            note: `Sold off-chain for ${saleData.price} ALGO. ${saleData.notes}`
          }
        ]
      };

      // Update metadata on-chain
      if (selectedCowForSale.assetId) {
        await Web3Service.updateNFTMetadata(selectedCowForSale.assetId, updatedCow, walletAddress);
      }

      // Burn NFT if requested (consumer purchase)
      if (saleData.burnNFT && selectedCowForSale.assetId && selectedCowForSale.ownerAddress) {
        await Web3Service.burnNFT(selectedCowForSale.assetId, walletAddress);
        toast.success('NFT Burnt', 'Asset removed from wallet, history preserved on blockchain');
      }

      onUpdateCow(updatedCow);
      toast.success('Sale Complete', 'Livestock marked as sold!');
      setShowSaleModal(false);
      setSaleData({ price: 0, burnNFT: true, notes: '' });
      setSelectedCowForSale(null);
    } catch (error: any) {
      console.error('Failed to mark as sold:', error);
      toast.error('Sale Failed', error.message || 'Failed to complete sale');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fattening':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Fattening</span>;
      case 'ready_for_sale':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Ready for Sale</span>;
      case 'sold':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">Sold</span>;
      case 'slaughtered':
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">Slaughtered</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-800">All Livestock Management</h3>
        <p className="text-sm text-slate-500 mt-1">View and update all livestock details, vaccination records, and market readiness</p>
      </div>

      {allCows.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-500">No livestock minted yet. Go to the Mint tab to create your first NFT.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Livestock</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Breed</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Sex</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Weight</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Health</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Vaccinations</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Owner</th>
                <th className="text-right p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allCows.map(cow => (
                <tr key={cow.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={cow.imageUrl} alt={cow.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold text-slate-800">{cow.name}</div>
                        {cow.assetId && (
                          <div className="text-xs text-slate-500 font-mono">#{cow.assetId}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{cow.breed}</td>
                  <td className="p-4">
                    {editingId === cow.id ? (
                      <span className="text-sm text-slate-600 capitalize">{cow.sex || 'female'}</span>
                    ) : (
                      <span className="text-sm text-slate-600 capitalize">{cow.sex || 'female'}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === cow.id ? (
                      <input
                        type="number"
                        value={editData.weight}
                        onChange={e => setEditData({ ...editData, weight: Number(e.target.value) })}
                        className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    ) : (
                      <span className="text-sm text-slate-800 font-medium">{cow.weight} kg</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === cow.id ? (
                      <input
                        type="number"
                        value={editData.healthScore}
                        onChange={e => setEditData({ ...editData, healthScore: Number(e.target.value) })}
                        min={0}
                        max={100}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${cow.healthScore >= 80 ? 'bg-green-500' : cow.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${cow.healthScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{cow.healthScore}%</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === cow.id ? (
                      <select
                        value={editData.status}
                        onChange={e => setEditData({ ...editData, status: e.target.value as any })}
                        className="px-2 py-1 border border-slate-300 rounded text-sm"
                      >
                        <option value="fattening">Fattening</option>
                        <option value="ready_for_sale">Ready for Sale</option>
                        <option value="sold">Sold</option>
                        <option value="slaughtered">Slaughtered</option>
                      </select>
                    ) : (
                      getStatusBadge(cow.status)
                    )}
                  </td>
                  <td className="p-4">
                    {editingId === cow.id ? (
                      <div className="space-y-2">
                        <div className="text-xs text-slate-600">{(editData.vaccination_records || []).length} records</div>
                        <button
                          onClick={() => setNewVaccination({ date: new Date().toISOString().split('T')[0], vaccine: '' })}
                          className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <Plus size={12} /> Add
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-600">{(cow.vaccination_records || []).length} records</span>
                    )}
                  </td>
                  <td className="p-4">
                    {cow.ownerAddress ? (
                      <span className="text-xs text-slate-600 font-mono">{cow.ownerAddress.substring(0, 6)}...</span>
                    ) : (
                      <span className="text-xs text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === cow.id ? (
                        <>
                          <button
                            onClick={() => saveUpdates(cow)}
                            disabled={isUpdating}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            title="Save changes"
                          >
                            {isUpdating ? <span className="animate-spin">↻</span> : <Save size={14} />}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isUpdating}
                            className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            title="Cancel"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(cow)}
                            className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                            title="Edit details"
                          >
                            <Edit size={14} />
                          </button>
                          {cow.status === 'fattening' && (
                            <button
                              onClick={() => markReadyForSale(cow)}
                              disabled={isUpdating}
                              className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 text-xs disabled:opacity-50"
                              title="Mark ready for sale"
                            >
                              <CheckCircle size={14} />
                              <span>Ready</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Vaccination Modal (shown when editing and adding vaccination) */}
          {editingId && newVaccination.date && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h4 className="text-lg font-bold text-slate-800 mb-4">Add Vaccination Record</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newVaccination.date}
                      onChange={e => setNewVaccination({ ...newVaccination, date: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vaccine Name</label>
                    <input
                      type="text"
                      value={newVaccination.vaccine}
                      onChange={e => setNewVaccination({ ...newVaccination, vaccine: e.target.value })}
                      placeholder="e.g., FMD Vaccine"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Batch Number</label>
                    <input
                      type="text"
                      value={newVaccination.batch || ''}
                      onChange={e => setNewVaccination({ ...newVaccination, batch: e.target.value })}
                      placeholder="Optional"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Veterinarian</label>
                    <input
                      type="text"
                      value={newVaccination.veterinarian || ''}
                      onChange={e => setNewVaccination({ ...newVaccination, veterinarian: e.target.value })}
                      placeholder="Optional"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                    <textarea
                      value={newVaccination.notes || ''}
                      onChange={e => setNewVaccination({ ...newVaccination, notes: e.target.value })}
                      placeholder="Additional notes (optional)"
                      className="w-full p-2 border border-slate-300 rounded-lg"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={addVaccination}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Add Record
                  </button>
                  <button
                    onClick={() => setNewVaccination({})}
                    className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
