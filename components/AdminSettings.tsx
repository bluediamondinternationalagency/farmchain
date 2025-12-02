import React, { useState, useEffect } from 'react';
import { PaymentSplitConfig } from '../types';
import { Settings, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Props {
  onSave: (configs: PaymentSplitConfig[]) => void;
  onClose: () => void;
}

const DEFAULT_CONFIGS: PaymentSplitConfig[] = [
  {
    id: '1',
    cattleType: 'Standard',
    farmerPercentage: 70,
    platformPercentage: 30,
    description: 'Default split for standard cattle',
    isActive: true
  },
  {
    id: '2',
    cattleType: 'Premium',
    farmerPercentage: 75,
    platformPercentage: 25,
    description: 'Premium cattle with higher farmer share',
    isActive: true
  },
  {
    id: '3',
    cattleType: 'Organic',
    farmerPercentage: 80,
    platformPercentage: 20,
    description: 'Organic certified cattle',
    isActive: true
  }
];

export const AdminSettings: React.FC<Props> = ({ onSave, onClose }) => {
  const [configs, setConfigs] = useState<PaymentSplitConfig[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New config form state
  const [newConfig, setNewConfig] = useState<Partial<PaymentSplitConfig>>({
    cattleType: '',
    farmerPercentage: 70,
    platformPercentage: 30,
    description: '',
    isActive: true
  });

  // Load configs from localStorage or use defaults
  useEffect(() => {
    const stored = localStorage.getItem('fc_payment_splits');
    if (stored) {
      setConfigs(JSON.parse(stored));
    } else {
      setConfigs(DEFAULT_CONFIGS);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('fc_payment_splits', JSON.stringify(configs));
    onSave(configs);
    onClose();
  };

  const handleAddNew = () => {
    if (!newConfig.cattleType) {
      alert('Please enter a cattle type');
      return;
    }

    if ((newConfig.farmerPercentage || 0) + (newConfig.platformPercentage || 0) !== 100) {
      alert('Percentages must total 100%');
      return;
    }

    const config: PaymentSplitConfig = {
      id: Date.now().toString(),
      cattleType: newConfig.cattleType,
      farmerPercentage: newConfig.farmerPercentage || 70,
      platformPercentage: newConfig.platformPercentage || 30,
      description: newConfig.description || '',
      isActive: true
    };

    setConfigs([...configs, config]);
    setIsAddingNew(false);
    setNewConfig({
      cattleType: '',
      farmerPercentage: 70,
      platformPercentage: 30,
      description: '',
      isActive: true
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this configuration?')) {
      setConfigs(configs.filter(c => c.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setConfigs(configs.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const handleEdit = (config: PaymentSplitConfig) => {
    setEditingId(config.id);
  };

  const handleUpdate = (id: string, field: keyof PaymentSplitConfig, value: any) => {
    setConfigs(configs.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6" />
            <div>
              <h2 className="text-2xl font-bold">Payment Split Settings</h2>
              <p className="text-slate-300 text-sm">Configure farmer/platform revenue sharing by cattle type</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Current Configurations */}
          <div className="space-y-4 mb-6">
            {configs.map(config => (
              <div 
                key={config.id}
                className={`border rounded-xl p-5 transition-all ${
                  config.isActive 
                    ? 'border-emerald-200 bg-emerald-50/50' 
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                {editingId === config.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Cattle Type
                        </label>
                        <input
                          type="text"
                          value={config.cattleType}
                          onChange={(e) => handleUpdate(config.id, 'cattleType', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={config.description}
                          onChange={(e) => handleUpdate(config.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Farmer %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.farmerPercentage}
                          onChange={(e) => {
                            const farmer = parseInt(e.target.value) || 0;
                            handleUpdate(config.id, 'farmerPercentage', farmer);
                            handleUpdate(config.id, 'platformPercentage', 100 - farmer);
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Platform %
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={config.platformPercentage}
                          onChange={(e) => {
                            const platform = parseInt(e.target.value) || 0;
                            handleUpdate(config.id, 'platformPercentage', platform);
                            handleUpdate(config.id, 'farmerPercentage', 100 - platform);
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <Save size={14} />
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-slate-800">{config.cattleType}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          config.isActive 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      {config.description && (
                        <p className="text-sm text-slate-500 mb-3">{config.description}</p>
                      )}

                      <div className="flex gap-6">
                        <div>
                          <span className="text-xs text-slate-500">Farmer Share</span>
                          <p className="text-2xl font-bold text-emerald-600">{config.farmerPercentage}%</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500">Platform Share</span>
                          <p className="text-2xl font-bold text-blue-600">{config.platformPercentage}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(config.id)}
                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                          config.isActive 
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {config.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(config)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Configuration */}
          {isAddingNew ? (
            <div className="border-2 border-dashed border-emerald-300 rounded-xl p-5 bg-emerald-50/30">
              <h3 className="font-bold text-slate-800 mb-4">Add New Configuration</h3>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Cattle Type *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Grass-Fed, Partnership A"
                      value={newConfig.cattleType}
                      onChange={(e) => setNewConfig({ ...newConfig, cattleType: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Brief description"
                      value={newConfig.description}
                      onChange={(e) => setNewConfig({ ...newConfig, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Farmer Percentage *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newConfig.farmerPercentage}
                      onChange={(e) => {
                        const farmer = parseInt(e.target.value) || 0;
                        setNewConfig({ 
                          ...newConfig, 
                          farmerPercentage: farmer,
                          platformPercentage: 100 - farmer
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Platform Percentage *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newConfig.platformPercentage}
                      onChange={(e) => {
                        const platform = parseInt(e.target.value) || 0;
                        setNewConfig({ 
                          ...newConfig, 
                          platformPercentage: platform,
                          farmerPercentage: 100 - platform
                        });
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewConfig({
                        cattleType: '',
                        farmerPercentage: 70,
                        platformPercentage: 30,
                        description: '',
                        isActive: true
                      });
                    }}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNew}
                    className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Configuration
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full border-2 border-dashed border-slate-300 rounded-xl p-5 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              <span className="font-medium">Add New Payment Split Configuration</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-slate-50 flex justify-between items-center">
          <p className="text-sm text-slate-500">
            {configs.filter(c => c.isActive).length} active configuration(s)
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              Save All Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
