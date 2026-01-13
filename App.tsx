import React, { useState, useEffect } from 'react';
import algosdk from 'algosdk';
import { Cow, AppView, WalletState, SlaughterInfo } from './types';
import { WalletButton } from './components/WalletButton';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Marketplace } from './components/Marketplace';
import { CowDetails } from './components/CowDetails';
import { AdminDashboard } from './components/AdminDashboard';
import { VerifyPage } from './components/VerifyPage';
import { ToastContainer, useToast } from './components/Toast';
import { TransactionStatus, useTransactions } from './components/TransactionStatus';
import { Web3Service } from './services/web3Service';
import { EscrowService } from './services/escrowService';
import { IPFSService } from './services/ipfsService';
import { SupplyChainService } from './services/supplyChainService';
import { LayoutGrid, ShoppingBag, Sprout, ShieldCheck } from 'lucide-react';

// Demo user address for testing without wallet connection
const DEMO_USER_ADDRESS = 'DEMO1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFG';

const INITIAL_DB: Cow[] = [
  {
    id: '1',
    name: 'Bessie',
    breed: 'Holstein',
    weight: 450,
    purchasePrice: 5, // TestNet demo price
    purchaseDate: Date.now() - (45 * 24 * 60 * 60 * 1000), 
    expectedReturn: 10,
    imageUrl: 'https://picsum.photos/seed/cow1/400/300',
    cattleType: 'standard',
    status: 'fattening',
    healthScore: 92,
    ownerAddress: DEMO_USER_ADDRESS, // Assigned to demo user for testing
    supplyChain: [],
    history: [
      { date: Date.now() - (45 * 24 * 60 * 60 * 1000), weight: 400, note: "Initial check-in. Healthy." },
      { date: Date.now() - (30 * 24 * 60 * 60 * 1000), weight: 415, note: "Good appetite, steady gain." },
    ]
  },
  {
    id: '2',
    name: 'Ferdinand',
    breed: 'Angus',
    weight: 520,
    purchasePrice: 7, // TestNet demo price
    purchaseDate: Date.now() - (85 * 24 * 60 * 60 * 1000), 
    expectedReturn: 12,
    imageUrl: 'https://picsum.photos/seed/cow2/400/300',
    cattleType: 'premium',
    status: 'fattening',
    healthScore: 88,
    ownerAddress: DEMO_USER_ADDRESS, // Assigned to demo user for testing
    supplyChain: [],
    history: [
        { date: Date.now() - (85 * 24 * 60 * 60 * 1000), weight: 450, note: "Arrived at ranch." },
        { date: Date.now() - (40 * 24 * 60 * 60 * 1000), weight: 485, note: "Responding well to feed mix." },
    ]
  },
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    walletType: 'none'
  });
  const [authLoading, setAuthLoading] = useState(false);
  
  // Lifted state: Single source of truth for all cows on "chain"
  const [allCows, setAllCows] = useState<Cow[]>(INITIAL_DB);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);

  // Toast and Transaction hooks
  const { toasts, toast, removeToast } = useToast();
  const { transactions, addTransaction, updateTransaction, removeTransaction } = useTransactions();

  // Debug logging
  useEffect(() => {
    console.log('🐄 All cows:', allCows.length);
    console.log('👤 Wallet:', wallet.address || 'Not connected');
    console.log('📊 View:', view);
  }, [allCows, wallet.address, view]);

  // Filter cows for the User Dashboard
  const myCows = wallet.isConnected 
    ? allCows.filter(c => c.ownerAddress === wallet.address)
    : allCows.filter(c => c.ownerAddress === DEMO_USER_ADDRESS); // Demo mode: show demo user's cattle

  // Show demo cattle if user has no cattle (for better UX)
  const displayCows = wallet.isConnected && myCows.length === 0
    ? allCows.filter(c => c.ownerAddress === DEMO_USER_ADDRESS) // Show demo cattle if user has none
    : myCows;

  useEffect(() => {
    console.log('🏠 My cows:', myCows.length, myCows.map(c => c.name));
    console.log('📺 Display cows:', displayCows.length, displayCows.map(c => c.name));
  }, [myCows, displayCows]);

  // Initialize Admin Account if missing (for demo purposes)
  useEffect(() => {
    Web3Service.getAdminAccount();
  }, []);

  const refreshBalance = async (address: string) => {
    const bal = await Web3Service.getBalance(address);
    setWallet(prev => ({ ...prev, balance: bal }));
  };

  // Check for existing Pera Wallet session on load
  useEffect(() => {
    const reconnectWallet = async () => {
      try {
        const address = await Web3Service.reconnectPeraWallet();
        if (address) {
          const bal = await Web3Service.getBalance(address);
          setWallet({
            isConnected: true,
            address: address,
            balance: bal,
            walletType: 'pera'
          });
        }
      } catch (e) {
        console.error('Failed to reconnect Pera Wallet:', e);
      }
    };
    
    reconnectWallet();
  }, []);

  const handleConnectWallet = async () => {
    if (wallet.isConnected) {
      // Disconnect
      if (wallet.walletType === 'pera') {
        await Web3Service.disconnectPeraWallet();
      }
      setWallet({ isConnected: false, address: null, balance: 0, walletType: 'none' });
      setView(AppView.DASHBOARD);
    } else {
      // Connect Pera Wallet
      setAuthLoading(true);
      try {
        const accounts = await Web3Service.connectPeraWallet();
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          const bal = await Web3Service.getBalance(address);
          
          setWallet({
            isConnected: true,
            address: address,
            balance: bal,
            walletType: 'pera'
          });
        }
      } catch (e) {
        console.error('Pera Wallet connection failed:', e);
        toast.error('Connection Failed', 'Please make sure you have Pera Wallet installed.');
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const handleCowClick = (cow: Cow) => {
    setSelectedCow(cow);
    setView(AppView.DETAILS);
  };

  const handleUpdateCow = async (updatedCow: Cow) => {
    setAllCows(prev => prev.map(c => c.id === updatedCow.id ? updatedCow : c));
    setSelectedCow(updatedCow);
    
    // Update on-chain metadata if asset exists
    if (updatedCow.assetId) {
      try {
        const txId = await Web3Service.updateCowNFT(updatedCow);
        console.log('Metadata updated on-chain. TxID:', txId);
        
        // Mark the update time
        const cowWithTimestamp = { ...updatedCow, lastUpdated: Date.now() };
        setAllCows(prev => prev.map(c => c.id === updatedCow.id ? cowWithTimestamp : c));
        setSelectedCow(cowWithTimestamp);
      } catch (e: any) {
        console.error('Failed to update on-chain metadata:', e);
        // Still update locally even if blockchain update fails
      }
    }
  };

  const handleSellCow = (cowToSell: Cow) => {
    setAllCows(prev => prev.filter(c => c.id !== cowToSell.id));
    setView(AppView.DASHBOARD);
    toast.success('Cattle Sold', `${cowToSell.name} has been sold. Funds returning to wallet...`);
  };

  const handleMintCow = async (newCow: Cow) => {
    const txId = addTransaction(`Minting NFT for ${newCow.name}`);
    try {
      updateTransaction(txId, { state: 'confirming' });
      // Real Blockchain Interaction
      const assetId = await Web3Service.mintCowNFT(newCow);
      
      const mintedCow = { ...newCow, assetId };
      setAllCows(prev => [...prev, mintedCow]);
      updateTransaction(txId, { state: 'confirmed', txId: assetId?.toString() });
      toast.success('NFT Minted', `${newCow.name} has been minted successfully!`);
      return true;
    } catch (e: any) {
      console.error(e);
      updateTransaction(txId, { state: 'failed', error: e.message });
      toast.error('Minting Failed', e.message || 'Ensure Admin wallet is funded!');
      return false;
    }
  };

  const handleAssignCow = async (cowId: string, address: string) => {
    const cow = allCows.find(c => c.id === cowId);
    if (!cow || !cow.assetId) {
      toast.warning('Assignment Failed', 'Asset not minted on chain yet.');
      return;
    }
    
    const txId = addTransaction(`Assigning ${cow.name} to user`);
    try {
      updateTransaction(txId, { state: 'confirming' });
      // Real Blockchain Transfer (OptIn + Send)
      await Web3Service.assignAssetToUser(cow.assetId, address);
      
      setAllCows(prev => prev.map(c => c.id === cowId ? { ...c, ownerAddress: address } : c));
      updateTransaction(txId, { state: 'confirmed' });
      toast.success('Assignment Complete', `${cow.name} assigned successfully!`);
      
      // Refresh user balance if it was the current user
      if (wallet.address === address) {
        refreshBalance(address);
      }
    } catch (e: any) {
      console.error(e);
      updateTransaction(txId, { state: 'failed', error: e.message });
      toast.error('Assignment Failed', e.message || 'Ensure User wallet has funds for Opt-In!');
    }
  };

  const handleDeleteCow = (cowId: string) => {
    setAllCows(prev => prev.filter(c => c.id !== cowId));
  };

  const handleSlaughterCattle = async (cow: Cow, slaughterInfo: SlaughterInfo) => {
    if (!cow.ownerAddress) {
      toast.warning('Cannot Process', 'Cattle has no owner.');
      return;
    }

    if (!cow.assetId) {
      toast.warning('Cannot Process', 'Cattle not minted on blockchain.');
      return;
    }

    const txId = addTransaction(`Processing slaughter for ${cow.name}`);
    
    try {
      updateTransaction(txId, { state: 'confirming' });

      // Get admin account
      const adminAccountInfo = Web3Service.getAdminAccount();
      const adminAccount = algosdk.mnemonicToSecretKey(adminAccountInfo.mnemonic);
      
      // Get payment split configuration for this cattle type
      const savedConfigs = localStorage.getItem('farmchain_payment_splits');
      let splitConfig = { farmerPercentage: 70, platformPercentage: 30 }; // Default
      
      if (savedConfigs) {
        try {
          const configs = JSON.parse(savedConfigs);
          const matchingConfig = configs.find((c: any) => 
            c.cattleType === cow.cattleType && c.isActive
          );
          if (matchingConfig) {
            splitConfig = {
              farmerPercentage: matchingConfig.farmerPercentage,
              platformPercentage: matchingConfig.platformPercentage
            };
          }
        } catch (e) {
          console.error('Failed to load payment configs:', e);
        }
      }

      console.log('Processing slaughter with split:', splitConfig);

      // Create payment split object
      const paymentSplit = EscrowService.createPaymentSplit(
        cow.ownerAddress,
        splitConfig.farmerPercentage,
        splitConfig.platformPercentage,
        cow.cattleType
      );

      // Execute atomic payment split (convert ALGO to microALGOs)
      const paymentResult = await EscrowService.executeSlaughterPayment(
        paymentSplit,
        Math.floor(slaughterInfo.netPrice * 1000000), // Convert to microALGOs
        adminAccount
      );

      console.log('Payment split executed. TxID:', paymentResult.txId);

      // Create slaughter certificate and upload to IPFS
      const certificate = IPFSService.createSlaughterCertificate({
        cattleId: cow.id,
        cattleName: cow.name,
        assetId: cow.assetId!,
        date: slaughterInfo.date,
        facility: slaughterInfo.facility,
        finalWeight: slaughterInfo.finalWeight,
        grossPrice: slaughterInfo.grossPrice,
        expenses: slaughterInfo.expenses,
        netPrice: slaughterInfo.netPrice,
        farmerAddress: cow.ownerAddress,
        inspectorName: 'FarmChain Certified'
      });

      const certificateCID = await IPFSService.uploadJSON(certificate, `slaughter-${cow.id}`);
      console.log('Slaughter certificate uploaded to IPFS:', certificateCID);

      // Record slaughter event on blockchain
      const eventTxId = await SupplyChainService.recordSlaughter(
        cow.assetId!,
        {
          facility: slaughterInfo.facility,
          finalWeight: slaughterInfo.finalWeight,
          date: slaughterInfo.date,
          certificateCID
        },
        adminAccount
      );

      console.log('Slaughter recorded on-chain. TxID:', eventTxId);

      // Update cow state
      const updatedCow: Cow = {
        ...cow,
        status: 'slaughtered',
        slaughterInfo: {
          ...slaughterInfo,
          certificateCID,
          paymentTxId: paymentResult.txId
        },
        paymentSplit: {
          farmerAddress: cow.ownerAddress!,
          platformAddress: paymentSplit.platformAddress,
          farmerPercentage: splitConfig.farmerPercentage,
          platformPercentage: splitConfig.platformPercentage,
          cattleType: cow.cattleType
        },
        permanentRecordCID: certificateCID,
        supplyChain: [
          ...(cow.supplyChain || []),
          {
            id: `slaughter-${Date.now()}`,
            eventType: 'slaughter',
            timestamp: slaughterInfo.date,
            actor: slaughterInfo.facility,
            data: slaughterInfo,
            txId: eventTxId,
            ipfsCID: certificateCID
          }
        ]
      };

      setAllCows(prev => prev.map(c => c.id === cow.id ? updatedCow : c));

      updateTransaction(txId, { state: 'confirmed', txId: eventTxId });
      toast.success(
        'Slaughter Processed Successfully',
        `Payment Split: ${splitConfig.farmerPercentage}/${splitConfig.platformPercentage} | ` +
        `Farmer: ${(paymentResult.farmerAmount / 1000000).toFixed(2)} ALGO | ` +
        `Platform: ${(paymentResult.platformAmount / 1000000).toFixed(2)} ALGO`,
        10000
      );
    } catch (e: any) {
      console.error('Slaughter failed:', e);
      updateTransaction(txId, { state: 'failed', error: e.message });
      toast.error('Slaughter Failed', e.message || 'An error occurred during processing.');
    }
  };

  // Show landing page if not connected and on landing view
  if (view === AppView.LANDING) {
    return <LandingPage 
      onGetStarted={() => setView(AppView.DASHBOARD)} 
      onVerify={() => setView(AppView.VERIFY)}
    />;
  }

  // Show verify page
  if (view === AppView.VERIFY) {
    return <VerifyPage allCows={allCows} onBack={() => setView(AppView.LANDING)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <TransactionStatus transactions={transactions} onDismiss={removeTransaction} />
      <div className={`mx-auto bg-white min-h-screen transition-all duration-300 relative ${view === AppView.ADMIN ? 'max-w-7xl shadow-xl' : 'max-w-md md:max-w-2xl lg:max-w-4xl md:shadow-2xl'}`}>
        
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 lg:px-12 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setView(AppView.DASHBOARD)}
          >
            <div className="bg-emerald-600 p-1.5 md:p-2 rounded-lg">
              <Sprout size={20} className="text-white md:w-6 md:h-6" />
            </div>
            <h1 className="font-bold text-lg md:text-xl tracking-tight text-slate-800">Farm Chain</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <button 
                onClick={() => setView(AppView.DASHBOARD)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${view === AppView.DASHBOARD ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <LayoutGrid size={18} />
                <span className="text-sm font-medium">My Ranch</span>
              </button>
              <button 
                onClick={() => setView(AppView.MARKET)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${view === AppView.MARKET ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <ShoppingBag size={18} />
                <span className="text-sm font-medium">Market</span>
              </button>
            </div>

            {/* Admin Toggle */}
            <button 
              onClick={() => setView(view === AppView.ADMIN ? AppView.DASHBOARD : AppView.ADMIN)}
              className={`p-2 rounded-full transition-colors ${view === AppView.ADMIN ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-100'}`}
              title="Toggle Admin Console"
            >
              <ShieldCheck size={18} />
            </button>

            <WalletButton wallet={wallet} onConnect={handleConnectWallet} loading={authLoading} />
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-8 lg:p-12 pb-20 md:pb-8">
          {view === AppView.ADMIN ? (
             <AdminDashboard 
               allCows={allCows} 
               onMintCow={handleMintCow}
               onAssignCow={handleAssignCow}
               onDeleteCow={handleDeleteCow}
               onSlaughterCattle={handleSlaughterCattle}
             />
          ) : (
            <>
              {view === AppView.DASHBOARD && (
                <Dashboard 
                  cows={displayCows} 
                  onCowClick={handleCowClick}
                  onNavigateToMarket={() => setView(AppView.MARKET)}
                  isDemoMode={wallet.isConnected && myCows.length === 0}
                />
              )}

              {view === AppView.MARKET && (
                <Marketplace 
                  userBalance={wallet.balance} 
                  onBuy={() => {}} 
                />
              )}

              {view === AppView.DETAILS && selectedCow && (
                <CowDetails 
                  cow={selectedCow} 
                  onBack={() => setView(AppView.DASHBOARD)}
                  onUpdateCow={handleUpdateCow}
                  onSell={handleSellCow}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation - Mobile Only */}
        {view !== AppView.ADMIN && view !== AppView.DETAILS && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center max-w-md mx-auto z-20">
            <button 
              onClick={() => setView(AppView.DASHBOARD)}
              className={`flex flex-col items-center gap-1 ${view === AppView.DASHBOARD ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              <LayoutGrid size={24} />
              <span className="text-[10px] font-medium">My Ranch</span>
            </button>
            <button 
              onClick={() => setView(AppView.MARKET)}
              className={`flex flex-col items-center gap-1 ${view === AppView.MARKET ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              <ShoppingBag size={24} />
              <span className="text-[10px] font-medium">Market</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;
