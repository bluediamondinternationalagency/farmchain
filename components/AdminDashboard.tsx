import React, { useState, useEffect } from 'react';
import { Cow, PaymentSplitConfig, SlaughterInfo } from '../types';
import { Plus, UserPlus, FileText, Database, ShieldCheck, ChevronRight, Search, Trash2, Loader2, Settings, Menu, X, ChevronLeft } from 'lucide-react';
import { Web3Service } from '../services/web3Service';
import { AdminSettings } from './AdminSettings';
import { SlaughterModal } from './SlaughterModal';
import { ImageUpload } from './ImageUpload';
import { LivestockManagementTab } from './LivestockManagementTab';
import { useToast } from './Toast';

interface Props {
  allCows: Cow[];
  onMintCow: (newCow: Cow) => Promise<boolean>;
  onAssignCow: (cowId: string, address: string) => Promise<void>;
  onDeleteCow: (cowId: string) => void;
  onSlaughterCattle: (cow: Cow, slaughterInfo: SlaughterInfo) => Promise<void>;
  onUpdateCow: (updatedCow: Cow) => void;
  walletAddress: string | null;
  walletBalance: number;
}

export const AdminDashboard: React.FC<Props> = ({ allCows, onMintCow, onAssignCow, onDeleteCow, onSlaughterCattle, onUpdateCow, walletAddress, walletBalance }) => {
  const [activeTab, setActiveTab] = useState<'mint' | 'inventory' | 'livestock' | 'wallet'>('livestock');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'assigned' | 'unassigned' | 'slaughtered'>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Toast hook
  const { toast } = useToast();
  
  // Settings & Slaughter Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [showSlaughterModal, setShowSlaughterModal] = useState(false);
  const [selectedCowForSlaughter, setSelectedCowForSlaughter] = useState<Cow | null>(null);
  const [paymentSplitConfigs, setPaymentSplitConfigs] = useState<PaymentSplitConfig[]>([]);

  useEffect(() => {
    if (walletAddress) {
      console.log('🛡️ Admin Pera Wallet:', walletAddress);
      console.log('💰 Balance:', walletBalance.toFixed(4), 'ALGO');
    }
  }, [walletAddress, walletBalance, activeTab]);

  // Load payment split configurations
  useEffect(() => {
    const loadPaymentConfigs = () => {
      const saved = localStorage.getItem('farmchain_payment_splits');
      if (saved) {
        try {
          setPaymentSplitConfigs(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load payment configs:', e);
        }
      }
    };
    loadPaymentConfigs();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    species: 'cattle',
    breed: '',
    customBreed: '',
    sex: 'female' as 'male' | 'female',
    weight: 400,
    price: 5, // Default 5 ALGO for TestNet (reasonable for demo)
    expectedReturn: 10,
    imageUrl: 'https://picsum.photos/seed/newcow/400/300',
    imageCID: '',
    metadataCID: '',
    cattleType: 'standard'
  });

  const [assignAddress, setAssignAddress] = useState('');
  const [selectedCowId, setSelectedCowId] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate breed selection
    if (!formData.breed) {
      toast.warning('Validation Error', 'Please select a breed');
      return;
    }
    
    if (formData.breed === 'custom' && !formData.customBreed.trim()) {
      toast.warning('Validation Error', 'Please enter a custom breed name');
      return;
    }
    
    // Check wallet connection and balance
    if (!walletAddress) {
      toast.error('Wallet Not Connected', 'Please connect your Pera Wallet to mint NFTs.');
      return;
    }
    
    if (walletBalance < 0.2) {
      console.error('❌ Insufficient wallet balance!');
      console.error('📍 Your address:', walletAddress);
      console.error('🔗 Fund at: https://bank.testnet.algorand.network/');
      toast.error(
        'Insufficient Balance', 
        `Your Pera Wallet needs at least 0.2 ALGO to mint! Current: ${walletBalance.toFixed(4)} ALGO.\n\nFund at: https://bank.testnet.algorand.network/`
      );
      return;
    }
    
    setIsMinting(true);
    
    const finalBreed = formData.breed === 'custom' ? formData.customBreed : formData.breed;
    
    const newCow: Cow = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      name: formData.name,
      breed: finalBreed,
      sex: formData.sex,
      weight: Number(formData.weight),
      purchasePrice: Number(formData.price),
      purchaseDate: Date.now(),
      expectedReturn: Number(formData.expectedReturn),
      imageUrl: formData.imageUrl,
      imageCID: formData.imageCID || undefined,
      metadataCID: formData.metadataCID || undefined,
      cattleType: formData.cattleType,
      status: 'fattening',
      healthScore: 100,
      ownerAddress: null, // Unassigned initially
      vaccination_records: [],
      supplyChain: [],
      history: [{
        date: Date.now(),
        weight: Number(formData.weight),
        note: "NFT Minted by Admin. Entered ranch facility."
      }]
    };
    
    const success = await onMintCow(newCow);
    setIsMinting(false);
    
    if (success) {
      toast.success('Minting Complete', 'Cattle NFT minted successfully! Check inventory.');
      setFormData({ ...formData, name: '', imageCID: '', metadataCID: '', cattleType: 'standard' });
      setActiveTab('inventory');
    }
  };

  const handleAssign = async () => {
    if(!selectedCowId || !assignAddress) {
      toast.warning('Missing Information', 'Please enter an address');
      return;
    }
    
    setIsAssigning(true);
    await onAssignCow(selectedCowId, assignAddress);
    setIsAssigning(false);
    
    setAssignAddress('');
    setSelectedCowId(null);
    toast.success('Assignment Complete', 'Cattle assigned successfully!');
  };

  const unassignedCows = allCows.filter(c => !c.ownerAddress);

  // Filter cows based on selected filter
  const getFilteredCows = () => {
    switch (inventoryFilter) {
      case 'assigned':
        return allCows.filter(c => c.ownerAddress && c.status !== 'slaughtered');
      case 'unassigned':
        return allCows.filter(c => !c.ownerAddress);
      case 'slaughtered':
        return allCows.filter(c => c.status === 'slaughtered');
      case 'all':
      default:
        return allCows;
    }
  };

  const filteredCows = getFilteredCows();

  return (
    <div className="pb-20 relative">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className="bg-slate-900 text-white p-4 md:p-8 rounded-2xl mb-8 shadow-xl flex flex-col md:flex-row justify-between items-end md:items-center">
        <div className="flex-1">
           <div className="flex items-center gap-3 mb-2">
             {/* Mobile Menu Toggle */}
             <button
               onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
               className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors mr-2"
               aria-label="Toggle menu"
             >
               {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
             <ShieldCheck className="text-emerald-400 h-6 md:h-8 w-6 md:w-8" />
             <h2 className="text-xl md:text-3xl font-bold tracking-tight">Admin Console</h2>
           </div>
           <p className="text-slate-400">Nerve Venture • Algorand Network Manager</p>
           <div className="mt-2 text-xs text-slate-500 flex flex-col gap-1">
             <div className="flex items-center gap-2">
               <span className="text-slate-600">🔒 Authorized Admin Access</span>
               <span className="text-emerald-400 font-semibold">Active</span>
             </div>
             <div className="text-slate-400">
               All minting transactions signed by your connected Pera Wallet
             </div>
             {walletAddress && (
               <div className="mt-1 font-mono text-[10px] text-slate-600 flex items-center gap-2">
                 <span>Your Wallet:</span>
                 <span className="text-emerald-300">{walletAddress.substring(0, 6)}...{walletAddress.substring(52)}</span>
                 <span className={`font-bold ${walletBalance < 0.2 ? 'text-red-400' : 'text-emerald-400'}`}>
                   ({walletBalance.toFixed(2)} ALGO)
                 </span>
               </div>
             )}
             {walletAddress && walletBalance < 0.2 && (
               <a 
                 href={`https://bank.testnet.algorand.network/?account=${walletAddress}`}
                 target="_blank"
                 rel="noreferrer"
                 className="text-amber-400 text-[10px] hover:text-amber-300 underline"
               >
                 ⚠️ Fund Your Pera Wallet (Need 0.2+ ALGO)
               </a>
             )}
           </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={() => setShowSettings(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
            title="Payment Split Settings"
          >
            <Settings size={16} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Network Status</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-sm text-emerald-400">Testnet Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:grid lg:gap-8 items-start" style={{ gridTemplateColumns: sidebarCollapsed ? '80px 1fr' : '280px 1fr' }}>
        {/* Sidebar Navigation */}
        <div className={`
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:sticky top-0 lg:top-24 left-0 h-screen lg:h-auto
          transition-all duration-300 ease-in-out
          z-50 lg:z-auto
          ${sidebarCollapsed ? 'lg:w-20' : 'w-72 lg:w-full'}
        `}>
          <div className="bg-white rounded-none lg:rounded-xl border-r lg:border border-slate-200 shadow-2xl lg:shadow-sm overflow-hidden h-full lg:h-auto">
             <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between">
               {!sidebarCollapsed && (
                 <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Navigation</h3>
               )}
               <button
                 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                 className="hidden lg:block p-1.5 hover:bg-slate-200 rounded-lg transition-colors ml-auto"
                 title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
               >
                 {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
               </button>
             </div>
             <nav className="p-2 space-y-1.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
               <button 
                 onClick={() => {
                   setActiveTab('livestock');
                   setMobileSidebarOpen(false);
                 }}
                 className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg text-left transition-all hover:scale-105 ${activeTab === 'livestock' ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                 title={sidebarCollapsed ? 'All Livestock' : ''}
               >
                 <div className="flex items-center gap-3">
                   <FileText size={18} className={activeTab === 'livestock' ? 'text-white' : ''} />
                   {!sidebarCollapsed && <span>All Livestock</span>}
                 </div>
                 {!sidebarCollapsed && (
                   <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'livestock' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>{allCows.length}</span>
                 )}
               </button>
               <button 
                 onClick={() => {
                   setActiveTab('inventory');
                   setMobileSidebarOpen(false);
                 }}
                 className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg text-left transition-all hover:scale-105 ${activeTab === 'inventory' ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                 title={sidebarCollapsed ? 'Inventory' : ''}
               >
                 <div className="flex items-center gap-3">
                   <Database size={18} className={activeTab === 'inventory' ? 'text-white' : ''} />
                   {!sidebarCollapsed && <span>Inventory</span>}
                 </div>
                 {!sidebarCollapsed && unassignedCows.length > 0 && (
                   <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}>{unassignedCows.length}</span>
                 )}
               </button>
               <button 
                 onClick={() => {
                   setActiveTab('mint');
                   setMobileSidebarOpen(false);
                 }}
                 className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg text-left transition-all hover:scale-105 ${activeTab === 'mint' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                 title={sidebarCollapsed ? 'Mint New Asset' : ''}
               >
                 <div className="flex items-center gap-3">
                   <Plus size={18} className={activeTab === 'mint' ? 'text-white' : ''} />
                   {!sidebarCollapsed && <span>Mint New Asset</span>}
                 </div>
                 {!sidebarCollapsed && (
                   <ChevronRight size={16} className="opacity-50" />
                 )}
               </button>
               <button 
                 onClick={() => {
                   setActiveTab('wallet');
                   setMobileSidebarOpen(false);
                 }}
                 className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg text-left transition-all hover:scale-105 ${activeTab === 'wallet' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}
                 title={sidebarCollapsed ? 'Wallet Settings' : ''}
               >
                 <div className="flex items-center gap-3">
                   <ShieldCheck size={18} className={activeTab === 'wallet' ? 'text-white' : ''} />
                   {!sidebarCollapsed && <span>Wallet Settings</span>}
                 </div>
                 {!sidebarCollapsed && (
                   <ChevronRight size={16} className="opacity-50" />
                 )}
               </button>
             </nav>
             {!sidebarCollapsed && (
               <div className="p-4 mt-4 border-t border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                 <div className="text-xs text-slate-500 font-medium mb-1">Total Assets Managed</div>
                 <div className="text-2xl font-bold text-slate-800">{allCows.length}</div>
                 <div className="mt-2 text-xs text-slate-400">Active on Testnet</div>
               </div>
             )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          
          {activeTab === 'mint' && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Mint Cattle NFT</h3>
                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-mono">ARC-69 Standard</span>
              </div>
              
              <form onSubmit={handleMint} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Bella"
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Livestock Species</label>
                    <select 
                      value={formData.species}
                      onChange={e => setFormData({...formData, species: e.target.value, breed: '', customBreed: ''})}
                      className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white"
                    >
                      <option value="cattle">Cattle</option>
                      <option value="goat">Goat</option>
                      <option value="ram">Ram/Sheep</option>
                      <option value="poultry">Poultry/Chicken</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Breed</label>
                    <select 
                      value={formData.breed}
                      onChange={e => setFormData({...formData, breed: e.target.value, customBreed: e.target.value === 'custom' ? formData.customBreed : ''})}
                      className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white"
                    >
                      <option value="">Select Breed</option>
                      {formData.species === 'cattle' && (
                        <>
                          <optgroup label="Nigerian Indigenous Breeds">
                            <option value="White Fulani">White Fulani</option>
                            <option value="Red Bororo">Red Bororo</option>
                            <option value="Sokoto Gudali">Sokoto Gudali</option>
                            <option value="Wadara">Wadara</option>
                            <option value="Azawak">Azawak</option>
                            <option value="Adamawa Gudali">Adamawa Gudali</option>
                            <option value="Muturu">Muturu</option>
                            <option value="N'Dama">N'Dama</option>
                            <option value="Keteku">Keteku</option>
                            <option value="Kuri">Kuri</option>
                            <option value="Bokolo">Bokolo</option>
                          </optgroup>
                          <optgroup label="International Breeds">
                            <option value="Holstein">Holstein</option>
                            <option value="Angus">Angus</option>
                            <option value="Hereford">Hereford</option>
                            <option value="Wagyu">Wagyu</option>
                            <option value="Brahman">Brahman</option>
                          </optgroup>
                        </>
                      )}
                      {formData.species === 'goat' && (
                        <>
                          <optgroup label="Nigerian Goat Breeds">
                            <option value="Red Sokoto">Red Sokoto</option>
                            <option value="West African Dwarf">West African Dwarf</option>
                            <option value="Sahel">Sahel</option>
                            <option value="Kano Brown">Kano Brown</option>
                          </optgroup>
                          <optgroup label="International Breeds">
                            <option value="Boer">Boer</option>
                            <option value="Saanen">Saanen</option>
                            <option value="Alpine">Alpine</option>
                          </optgroup>
                        </>
                      )}
                      {formData.species === 'ram' && (
                        <>
                          <optgroup label="Nigerian Sheep Breeds">
                            <option value="Yankasa">Yankasa</option>
                            <option value="Uda">Uda</option>
                            <option value="Balami">Balami</option>
                            <option value="West African Dwarf Sheep">West African Dwarf Sheep</option>
                          </optgroup>
                          <optgroup label="International Breeds">
                            <option value="Dorper">Dorper</option>
                            <option value="Merino">Merino</option>
                          </optgroup>
                        </>
                      )}
                      {formData.species === 'poultry' && (
                        <>
                          <optgroup label="Chicken Breeds">
                            <option value="Broiler">Broiler</option>
                            <option value="Layer">Layer</option>
                            <option value="Noiler">Noiler</option>
                            <option value="Local Chicken">Local Chicken</option>
                            <option value="Cockerel">Cockerel</option>
                          </optgroup>
                        </>
                      )}
                      <option value="custom">Custom Breed...</option>
                    </select>
                  </div>

                  {formData.breed === 'custom' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Custom Breed Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.customBreed}
                        onChange={e => setFormData({...formData, customBreed: e.target.value})}
                        placeholder="Enter custom breed name"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sex</label>
                    <select 
                      value={formData.sex}
                      onChange={e => setFormData({...formData, sex: e.target.value as 'male' | 'female'})}
                      className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cattle Type</label>
                    <select 
                      value={formData.cattleType}
                      onChange={e => setFormData({...formData, cattleType: e.target.value})}
                      className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white"
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="wagyu">Wagyu</option>
                      <option value="organic">Organic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Initial Weight (kg)</label>
                    <input 
                      type="number" 
                      value={formData.weight}
                      onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                      className="w-full p-3 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Listing Price (ALGO)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full p-3 border border-slate-300 rounded-lg outline-none pl-8"
                      />
                      <span className="absolute left-3 top-3.5 text-slate-400 text-sm">Ⱥ</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Projected ROI (%)</label>
                    <input 
                      type="number" 
                      value={formData.expectedReturn}
                      onChange={e => setFormData({...formData, expectedReturn: Number(e.target.value)})}
                      className="w-full p-3 border border-slate-300 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-200 pt-6">
                  <h4 className="font-semibold text-slate-700 text-sm">IPFS Metadata (Pinata)</h4>
                  <p className="text-xs text-slate-500">Upload your cow's image and metadata JSON to Pinata, then paste the CIDs below.</p>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Image CID (Pinata) <span className="text-slate-400 text-xs">- Optional</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.imageCID}
                      onChange={e => setFormData({...formData, imageCID: e.target.value})}
                      placeholder="QmXxXxXxXxXx... or leave blank to use URL"
                      className="w-full p-3 border border-slate-300 rounded-lg outline-none text-sm text-slate-600 font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Will be used as: ipfs://{formData.imageCID || 'YOUR_CID'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Metadata CID (Pinata) <span className="text-slate-400 text-xs">- Optional</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.metadataCID}
                      onChange={e => setFormData({...formData, metadataCID: e.target.value})}
                      placeholder="QmYyYyYyYyYy... for full metadata JSON"
                      className="w-full p-3 border border-slate-300 rounded-lg outline-none text-sm text-slate-600 font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      ARC-3 compliant: Upload JSON with all metadata to Pinata
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>💡 Tip:</strong> Upload to Pinata first, then paste CIDs here. Dynamic updates will be stored on-chain via ARC-69.
                    </p>
                  </div>
                </div>

                {/* Image Upload to IPFS */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Image to IPFS</label>
                  <ImageUpload 
                    onUploadComplete={(url, cid) => {
                      setFormData({...formData, imageUrl: url, imageCID: cid});
                      toast.success('Image Uploaded', `Uploaded to IPFS: ${cid}`);
                    }}
                    onUploadError={(error) => {
                      toast.error('Upload Failed', error);
                    }}
                  />
                  {formData.imageCID && (
                    <div className="mt-2 p-2 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-emerald-700 font-mono">CID: {formData.imageCID}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Asset Image URL (Fallback)</label>
                  <input 
                    type="text" 
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://... (used if no IPFS CID provided)"
                    className="w-full p-3 border border-slate-300 rounded-lg outline-none text-sm text-slate-600 font-mono"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isMinting}
                    className="bg-slate-900 text-white py-3 px-8 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-300/50 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isMinting ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                    {isMinting ? 'Minting to Blockchain...' : 'Mint to Blockchain'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'livestock' && (
            <LivestockManagementTab
              allCows={allCows}
              onUpdateCow={onUpdateCow}
              onSlaughterCattle={(cow) => {
                setSelectedCowForSlaughter(cow);
                setShowSlaughterModal(true);
              }}
              walletAddress={walletAddress}
              toast={toast}
            />
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold text-slate-800">Inventory Management</h3>
                   <div className="relative">
                     <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                     <input 
                      type="text" 
                      placeholder="Search assets..." 
                      className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                     />
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <button
                     onClick={() => setInventoryFilter('all')}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       inventoryFilter === 'all'
                         ? 'bg-indigo-600 text-white'
                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                     }`}
                   >
                     All ({allCows.length})
                   </button>
                   <button
                     onClick={() => setInventoryFilter('assigned')}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       inventoryFilter === 'assigned'
                         ? 'bg-green-600 text-white'
                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                     }`}
                   >
                     Assigned ({allCows.filter(c => c.ownerAddress && c.status !== 'slaughtered').length})
                   </button>
                   <button
                     onClick={() => setInventoryFilter('unassigned')}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       inventoryFilter === 'unassigned'
                         ? 'bg-slate-600 text-white'
                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                     }`}
                   >
                     Unassigned ({unassignedCows.length})
                   </button>
                   <button
                     onClick={() => setInventoryFilter('slaughtered')}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                       inventoryFilter === 'slaughtered'
                         ? 'bg-red-600 text-white'
                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                     }`}
                   >
                     Slaughtered ({allCows.filter(c => c.status === 'slaughtered').length})
                   </button>
                 </div>
               </div>
               
               {filteredCows.length === 0 ? (
                 <div className="p-12 text-center">
                   <div className="inline-block p-4 bg-slate-50 rounded-full mb-3">
                     <Database size={32} className="text-slate-300" />
                   </div>
                   <h3 className="text-slate-600 font-medium">
                     {inventoryFilter === 'all' ? 'No cattle in inventory' : `No ${inventoryFilter} cattle`}
                   </h3>
                   <p className="text-slate-400 text-sm mt-1">
                     {inventoryFilter === 'all' || inventoryFilter === 'unassigned'
                       ? 'Mint new NFTs to add to inventory.'
                       : `Switch to "All" to see complete inventory.`}
                   </p>
                   {inventoryFilter === 'all' && (
                     <button onClick={() => setActiveTab('mint')} className="mt-4 text-indigo-600 font-medium hover:underline">Go to Minting</button>
                   )}
                 </div>
               ) : (
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                         <th className="p-4 font-semibold border-b border-slate-100">Asset Details</th>
                         <th className="p-4 font-semibold border-b border-slate-100">Stats</th>
                         <th className="p-4 font-semibold border-b border-slate-100">Owner Status</th>
                         <th className="p-4 font-semibold border-b border-slate-100">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {filteredCows.map(cow => (
                         <tr key={cow.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="p-4">
                             <div className="flex items-center gap-3">
                               <img src={cow.imageUrl} alt={cow.name} className="w-12 h-12 rounded-lg object-cover bg-slate-200" />
                               <div>
                                 <div className="font-bold text-slate-800">{cow.name}</div>
                                 <div className="text-xs text-slate-500 font-mono">#{cow.id}</div>
                               </div>
                             </div>
                           </td>
                           <td className="p-4">
                             <div className="text-sm text-slate-600">
                               <span className="block">{cow.breed}</span>
                               <span className="text-slate-400 text-xs">{cow.weight} kg</span>
                             </div>
                           </td>
                           <td className="p-4">
                             <div className="text-xs">
                               {cow.ownerAddress ? (
                                 <>
                                   <div className="flex items-center gap-2">
                                     <span className="inline-block px-2 py-1 bg-green-50 text-green-700 rounded font-medium">Assigned</span>
                                     {cow.status === 'slaughtered' && (
                                       <span className="inline-block px-2 py-1 bg-red-50 text-red-700 rounded font-medium">Slaughtered</span>
                                     )}
                                   </div>
                                   <div className="text-slate-400 mt-1 font-mono">{cow.ownerAddress.substring(0,8)}...{cow.ownerAddress.substring(50)}</div>
                                 </>
                               ) : (
                                 <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 rounded font-medium">Unassigned</span>
                               )}
                               {cow.assetId && (
                                 <a href={`https://testnet.explorer.perawallet.app/asset/${cow.assetId}/`} target="_blank" rel="noreferrer" className="text-emerald-600 font-medium hover:underline flex items-center gap-1 mt-1">
                                    ID: {cow.assetId} <ExternalLinkIcon />
                                 </a>
                               )}
                             </div>
                           </td>
                           <td className="p-4">
                             <div className="flex items-center gap-2 flex-wrap">
                               {!cow.ownerAddress && (
                                 <>
                                   <input 
                                     type="text" 
                                     placeholder="Wallet Address" 
                                     className="text-xs p-2 border border-slate-200 rounded-md w-32 outline-none focus:border-indigo-500"
                                     value={selectedCowId === cow.id ? assignAddress : ''}
                                     onChange={(e) => {
                                       setSelectedCowId(cow.id);
                                       setAssignAddress(e.target.value);
                                     }}
                                   />
                                   <button 
                                     onClick={handleAssign}
                                     disabled={isAssigning || !cow.assetId}
                                     className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                                     title="Transfer Ownership"
                                   >
                                     {isAssigning && selectedCowId === cow.id ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                   </button>

                                   <div className="h-6 w-px bg-slate-200 mx-1"></div>
                                 </>
                               )}

                               <button
                                onClick={() => {
                                  if (window.confirm(`Delete ${cow.name}?`)) onDeleteCow(cow.id);
                                }}
                                className="bg-rose-50 text-rose-600 border border-rose-100 p-2 rounded-md hover:bg-rose-100 hover:border-rose-200 transition-colors"
                                title="Delete Asset"
                               >
                                 <Trash2 size={16} />
                               </button>

                               {cow.ownerAddress && cow.status !== 'slaughtered' && (
                                 <>
                                   <div className="h-6 w-px bg-slate-200 mx-1"></div>
                                   <button
                                     onClick={() => {
                                       setSelectedCowForSlaughter(cow);
                                       setShowSlaughterModal(true);
                                     }}
                                     className="bg-orange-50 text-orange-600 border border-orange-100 px-3 py-2 rounded-md hover:bg-orange-100 hover:border-orange-200 transition-colors text-xs font-medium"
                                     title="Process Slaughter"
                                   >
                                     Slaughter
                                   </button>
                                 </>
                               )}
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">Connected Wallet Info</h3>
                <ShieldCheck className="text-indigo-600" size={24} />
              </div>

              <div className="space-y-6">
                {/* Wallet Info */}
                <div className="bg-gradient-to-br from-indigo-50 to-emerald-50 p-6 rounded-lg border border-indigo-100">
                  <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <span>🔒</span>
                    <span>Your Pera Wallet (Admin)</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Address:</span>
                      <code className="text-xs bg-white px-3 py-2 rounded border border-indigo-200 font-mono text-indigo-700">
                        {walletAddress ? `${walletAddress.substring(0, 10)}...${walletAddress.substring(50)}` : 'Not connected'}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Balance:</span>
                      <span className={`font-bold text-lg ${walletBalance < 0.2 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {walletBalance.toFixed(4)} ALGO
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Status:</span>
                      <span className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm font-semibold text-emerald-600">Connected</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Minting Info */}
                <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span>ℹ️</span>
                    <span>How Minting Works</span>
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-2 ml-5 list-disc">
                    <li>All NFTs are minted using <strong>your connected Pera Wallet</strong></li>
                    <li>Each mint costs approximately <strong>0.2 ALGO</strong> in transaction fees</li>
                    <li>You'll approve each transaction in your Pera Wallet app</li>
                    <li>Your wallet must remain connected to mint NFTs</li>
                    <li>Funds are deducted from your Pera Wallet balance</li>
                  </ul>
                </div>

                {/* Fund Wallet */}
                {walletBalance < 0.5 && walletAddress && (
                  <div className="border border-amber-300 rounded-lg p-6 bg-amber-50">
                    <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Low Balance Warning</span>
                    </h4>
                    <p className="text-sm text-amber-800 mb-4">
                      Your wallet balance is low. You need at least 0.2 ALGO per NFT mint.
                    </p>
                    <a 
                      href={`https://bank.testnet.algorand.network/?account=${walletAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                    >
                      Fund Wallet (TestNet Dispenser)
                    </a>
                  </div>
                )}

                {/* Security Note */}
                <div className="border border-slate-200 rounded-lg p-6 bg-slate-50">
                  <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <span>🔐</span>
                    <span>Security & Authorization</span>
                  </h4>
                  <ul className="text-sm text-slate-600 space-y-2 ml-5 list-disc">
                    <li>Only whitelisted Pera Wallet addresses can access this admin panel</li>
                    <li>Your wallet keys are controlled by <strong>Pera Wallet</strong>, not this app</li>
                    <li>This is a non-custodial solution - you always control your funds</li>
                    <li>Whitelist is configured in <code className="bg-slate-200 px-1 py-0.5 rounded text-xs">.env.local</code></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Settings Modal */}
      {showSettings && (
        <AdminSettings
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Slaughter Modal */}
      {showSlaughterModal && selectedCowForSlaughter && (
        <SlaughterModal
          cow={selectedCowForSlaughter}
          paymentConfigs={paymentSplitConfigs}
          onClose={() => {
            setShowSlaughterModal(false);
            setSelectedCowForSlaughter(null);
          }}
          onSlaughter={async (slaughterInfo) => {
            await onSlaughterCattle(selectedCowForSlaughter, slaughterInfo);
            setShowSlaughterModal(false);
            setSelectedCowForSlaughter(null);
          }}
        />
      )}
    </div>
  );
};

const ExternalLinkIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);
