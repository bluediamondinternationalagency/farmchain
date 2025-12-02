import React, { useState } from 'react';
import { Search, CheckCircle2, AlertCircle, MapPin, Calendar, Activity, Award, Package } from 'lucide-react';
import { Cow } from '../types';

interface Props {
  allCows: Cow[];
  onBack: () => void;
}

export const VerifyPage: React.FC<Props> = ({ allCows, onBack }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState<Cow | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setNotFound(false);
    setSearchResult(null);

    // Simulate search delay
    setTimeout(() => {
      const found = allCows.find(
        cow => 
          cow.id.toLowerCase() === searchInput.toLowerCase() ||
          cow.name.toLowerCase() === searchInput.toLowerCase() ||
          cow.assetId?.toString() === searchInput
      );

      if (found) {
        setSearchResult(found);
      } else {
        setNotFound(true);
      }
      setIsSearching(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <button 
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 mb-6 inline-flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Verify Your Livestock
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Scan the QR code on your MeatHouse package or enter the tracking ID to see complete livestock history, 
            from ranch to your table.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Enter Tracking ID or Livestock Name
              </label>
              <input 
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., COW-001, Bessie, or Asset ID"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
              />
            </div>
            <div className="sm:self-end">
              <button 
                onClick={handleSearch}
                disabled={!searchInput.trim() || isSearching}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Search size={20} />
                {isSearching ? 'Searching...' : 'Verify'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 text-sm text-slate-500">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p>
              Find your tracking ID on the QR code sticker attached to every MeatHouse vacuum-sealed package.
            </p>
          </div>
        </div>

        {/* Not Found Message */}
        {notFound && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="text-red-600" size={24} />
              <h3 className="text-lg font-bold text-red-900">Livestock Not Found</h3>
            </div>
            <p className="text-red-700">
              We couldn't find a livestock record matching "{searchInput}". Please check the tracking ID and try again.
            </p>
          </div>
        )}

        {/* Search Result */}
        {searchResult && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Verified Badge */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={32} />
                <div>
                  <h2 className="text-2xl font-bold">Verified Authentic</h2>
                  <p className="text-emerald-100">This livestock is registered on FarmChain blockchain</p>
                </div>
              </div>
            </div>

            {/* Livestock Details */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Image & Basic Info */}
                <div>
                  <img 
                    src={searchResult.imageUrl} 
                    alt={searchResult.name}
                    className="w-full h-64 object-cover rounded-xl mb-4"
                  />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{searchResult.name}</h3>
                  <p className="text-slate-600 mb-4">Breed: {searchResult.breed}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 mb-1">Current Weight</div>
                      <div className="text-2xl font-bold text-emerald-600">{searchResult.weight} kg</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-slate-600 mb-1">Health Score</div>
                      <div className="text-2xl font-bold text-blue-600">{searchResult.healthScore}%</div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-slate-700 mb-3">
                      <Calendar size={20} />
                      <span className="font-semibold">Timeline</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Purchase Date:</span>
                        <span className="font-medium">{new Date(searchResult.purchaseDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Days on Ranch:</span>
                        <span className="font-medium">{Math.floor((Date.now() - searchResult.purchaseDate) / (1000 * 60 * 60 * 24))} days</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-700 mb-3">
                      <MapPin size={20} />
                      <span className="font-semibold">Location</span>
                    </div>
                    <p className="text-sm text-slate-600">FarmChain Common Facility Center Ranch</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-700 mb-3">
                      <Award size={20} />
                      <span className="font-semibold">Certifications</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>NAIC Insured</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Health Verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Blockchain Registered</span>
                      </div>
                    </div>
                  </div>

                  {searchResult.assetId && (
                    <div>
                      <div className="flex items-center gap-2 text-slate-700 mb-3">
                        <Package size={20} />
                        <span className="font-semibold">Blockchain Info</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Algorand Asset ID</div>
                        <div className="font-mono text-sm text-slate-900">{searchResult.assetId}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Growth History */}
              {searchResult.history && searchResult.history.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700 mb-4">
                    <Activity size={20} />
                    <span className="font-semibold text-lg">Growth History</span>
                  </div>
                  <div className="space-y-3">
                    {searchResult.history.map((entry, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="bg-emerald-100 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-700 font-bold text-sm">{searchResult.history!.length - idx}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-slate-900">{entry.weight} kg</span>
                            <span className="text-sm text-slate-500">{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-600">{entry.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supply Chain Events */}
              {searchResult.supplyChain && searchResult.supplyChain.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-200">
                  <h4 className="font-semibold text-lg text-slate-700 mb-4">Supply Chain Events</h4>
                  <div className="space-y-3">
                    {searchResult.supplyChain.map((event, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-slate-900">{event.eventType}</span>
                          <span className="text-sm text-slate-500">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                        {event.location && <p className="text-sm text-slate-600">📍 {event.location}</p>}
                        {event.metadata?.handler && <p className="text-sm text-slate-600">👤 Handler: {event.metadata.handler}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Box */}
        {!searchResult && !notFound && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">How to Verify Your Livestock</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Locate the QR code on your MeatHouse vacuum-sealed package</li>
                  <li>Scan the QR code with your phone camera or enter the tracking ID above</li>
                  <li>View complete livestock history: ranch location, feeding records, health checks</li>
                  <li>Verify blockchain registration and authenticity</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
