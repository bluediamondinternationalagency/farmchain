import React from 'react';
import { Sprout, TrendingUp, Shield, Zap, Users, Globe, ArrowRight, CheckCircle2, Sparkles, LineChart, Award } from 'lucide-react';

interface Props {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Pioneer Badge */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm md:text-base flex items-center justify-center gap-2">
            <Sparkles size={18} className="animate-pulse" />
            <span className="font-semibold">Pioneering Agricultural Innovation</span> — Africa's First Blockchain-Powered Livestock Platform
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 rounded-2xl shadow-xl relative">
                <Sprout size={48} className="text-white" />
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  BETA
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              The Future of Livestock<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Ownership is Here</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-4 max-w-3xl mx-auto">
              <strong>FarmChain</strong> pioneers blockchain-powered tokenized livestock ownership in Africa. 
              Own real cattle, goats, rams, and poultry with transparent on-chain proof, professional management, and market-driven returns.
            </p>
            <p className="text-base md:text-lg text-slate-500 mb-8 max-w-2xl mx-auto italic">
              Built on Algorand • Partnered with MeatHouse • Insured by NAIC & Leadway
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Start Exploring <ArrowRight size={20} />
              </button>
              <a 
                href="https://farmchaincoop.netlify.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="border-2 border-emerald-600 hover:border-emerald-700 hover:bg-emerald-50 text-emerald-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              >
                Join the Coop
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Algorand Blockchain</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>NAIC & Leadway Insured</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>MeatHouse Partnership</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-md text-center border border-emerald-100">
              <div className="text-3xl font-bold text-emerald-600">100%</div>
              <div className="text-sm text-slate-600 mt-1">Real Ownership</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-md text-center border border-blue-100">
              <div className="text-3xl font-bold text-blue-600">5 Days</div>
              <div className="text-sm text-slate-600 mt-1">Sourcing Time</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-md text-center border border-purple-100">
              <div className="text-3xl font-bold text-purple-600">90 Days</div>
              <div className="text-sm text-slate-600 mt-1">Fattening Cycle</div>
            </div>
            <div className="bg-white/80 backdrop-blur p-6 rounded-xl shadow-md text-center border border-orange-100">
              <div className="text-3xl font-bold text-orange-600">₦/kg</div>
              <div className="text-sm text-slate-600 mt-1">Market Pricing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section - NEW */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-emerald-500/20 backdrop-blur text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              THE AFRICAN OPPORTUNITY
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              A Breakthrough for<br />Africa's $150B Livestock Market
            </h2>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Africa's livestock sector feeds millions but suffers from opacity, fraud, and limited access. 
              FarmChain solves critical problems across the entire value chain.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Consumers */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-2xl">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-2xl font-bold mb-4 text-emerald-400">For Consumers</h3>
              <div className="space-y-4 text-slate-300">
                <div>
                  <div className="font-semibold text-red-400 mb-2">❌ The Problem</div>
                  <p className="text-sm">Counterfeit meat, unknown livestock origins, health risks, and zero traceability in markets</p>
                </div>
                <div>
                  <div className="font-semibold text-emerald-400 mb-2">✓ Our Solution</div>
                  <p className="text-sm">Scan QR codes for complete livestock history: birth, feeding, health records, and processing via MeatHouse</p>
                </div>
              </div>
            </div>

            {/* Retailers */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-2xl">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-2xl font-bold mb-4 text-blue-400">For Retailers</h3>
              <div className="space-y-4 text-slate-300">
                <div>
                  <div className="font-semibold text-red-400 mb-2">❌ The Problem</div>
                  <p className="text-sm">Supply chain fraud, inconsistent quality, difficulty verifying suppliers, and inventory losses</p>
                </div>
                <div>
                  <div className="font-semibold text-blue-400 mb-2">✓ Our Solution</div>
                  <p className="text-sm">Blockchain-verified supply chain, certified quality standards, direct MeatHouse sourcing with guaranteed traceability</p>
                </div>
              </div>
            </div>

            {/* Export Markets */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-2xl">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold mb-4 text-purple-400">For Export</h3>
              <div className="space-y-4 text-slate-300">
                <div>
                  <div className="font-semibold text-red-400 mb-2">❌ The Problem</div>
                  <p className="text-sm">African livestock blocked from international markets due to lack of verifiable documentation and certification</p>
                </div>
                <div>
                  <div className="font-semibold text-purple-400 mb-2">✓ Our Solution</div>
                  <p className="text-sm">IPFS-stored certificates, immutable on-chain records meeting international standards (EU, US, UAE)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Livestock Ownership Market */}
          <div className="bg-gradient-to-br from-emerald-900/40 to-blue-900/40 backdrop-blur border border-emerald-500/30 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  MASSIVE MARKET OPPORTUNITY
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                  Meet the Demand:<br />
                  <span className="text-emerald-400">Africa's Protein Deficit</span>
                </h3>
                <p className="text-slate-300 mb-6 text-lg">
                  Africa imports <strong className="text-white">$5B+ in meat annually</strong> despite having 
                  <strong className="text-white"> 350M+ cattle</strong>. Local production can't meet growing demand from 
                  <strong className="text-white"> 1.4B consumers</strong>.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-white font-semibold">Population boom driving 300% demand increase by 2050</p>
                      <p className="text-slate-400 text-sm">Urban middle class wants quality, traceable protein</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-white font-semibold">Export opportunity worth $20B+ to Middle East & Asia</p>
                      <p className="text-slate-400 text-sm">IF African livestock meets international certification standards</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-white font-semibold">Retail chains seeking 100% traceable supply sources</p>
                      <p className="text-slate-400 text-sm">ShopRite, Spar, Carrefour demand verified origin documentation</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900/60 backdrop-blur p-6 rounded-2xl border border-slate-700">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="text-emerald-400" size={24} />
                    <span>Who Should Own Livestock?</span>
                  </h4>
                  <div className="space-y-3 text-slate-300">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Africans at Home</p>
                        <p className="text-sm text-slate-400">Build wealth with real assets, not speculation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">African Diaspora</p>
                        <p className="text-sm text-slate-400">Invest back home, support agriculture remotely</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Global Investors</p>
                        <p className="text-sm text-slate-400">New asset class: agricultural real assets</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">Cooperatives & Groups</p>
                        <p className="text-sm text-slate-400">Pool resources, own herds collectively</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="text-white" size={28} />
                    <h4 className="text-xl font-bold text-white">A New Asset Class</h4>
                  </div>
                  <p className="text-emerald-50 mb-4">
                    Unlike stocks or crypto, you own <strong>real productive assets</strong> that grow, reproduce, and generate tangible returns.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/20 backdrop-blur p-3 rounded-lg">
                      <div className="font-bold text-white">Tangible</div>
                      <div className="text-emerald-100">Physical animals</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur p-3 rounded-lg">
                      <div className="font-bold text-white">Insured</div>
                      <div className="text-emerald-100">Protected value</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur p-3 rounded-lg">
                      <div className="font-bold text-white">Growing</div>
                      <div className="text-emerald-100">Gains weight daily</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur p-3 rounded-lg">
                      <div className="font-bold text-white">Proven</div>
                      <div className="text-emerald-100">Centuries-old model</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        {/* Get Started Banner */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl p-8 md:p-10 text-center text-white shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-3">Ready to Become a Livestock Owner?</h3>
            <p className="text-emerald-50 mb-6 max-w-2xl mx-auto">
              Join FarmChain Cooperative to access tokenized livestock ownership. Check your membership eligibility and get started today.
            </p>
            <a 
              href="https://farmchaincoop.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Join FarmChain Coop <ArrowRight size={20} />
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              CORE TECHNOLOGY
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              Built Different
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              FarmChain combines Algorand blockchain with real-world livestock operations. 
              Every feature designed to bridge digital ownership with physical agricultural assets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real Livestock Ownership</h3>
              <p className="text-slate-600">
                Own actual physical livestock with tokenized proof on Algorand blockchain. Animals sourced within 5 days and professionally managed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Market-Based Pricing</h3>
              <p className="text-slate-600">
                Livestock weighed and paid at current market price per kilogram. Track growth during 90-day fattening program with clear cost deductions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Full-Service Management</h3>
              <p className="text-slate-600">
                We handle everything: sourcing, feeding, fattening, medical care, weight measurement, and sales. Operational costs transparently deducted from proceeds.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-orange-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Globe className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">MeatHouse Processing</h3>
              <p className="text-slate-600">
                Slaughtering and processing by MeatHouse (meathouse.com.ng). Vacuum-packed, traceable beef sold directly to consumers.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-pink-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-pink-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Owner Autonomy</h3>
              <p className="text-slate-600">
                Livestock owners maintain full control and autonomy. Monitor, manage, and decide when to sell your animals.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-teal-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Insurance Protected</h3>
              <p className="text-slate-600">
                Risks covered by NAIC and Leadway insurance. Health monitoring, weight tracking, and medical care throughout the livestock lifecycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              SIMPLE PROCESS
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
              From Order to Ownership
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Four transparent steps connect you with real livestock ownership on the blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Place Your Order</h3>
              <p className="text-slate-600 text-sm">
                Browse marketplace and order livestock. Payment via bank transfer (Pera Wallet coming soon)
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sourced & Tokenized</h3>
              <p className="text-slate-600 text-sm">
                Livestock sourced within 5 days and tokenized on Algorand blockchain as proof of ownership
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">90-Day Management</h3>
              <p className="text-slate-600 text-sm">
                Livestock enters fattening program with feeding, medical care, and daily monitoring at the ranch facility
              </p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Weigh & Get Paid</h3>
              <p className="text-slate-600 text-sm">
                After fattening, livestock is weighed and sold at market price/kg. Operational costs deducted, proceeds paid to you
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
            🚀 JOIN THE PIONEERS
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Be Among the First Livestock Owners
          </h2>
          <p className="text-lg text-emerald-50 mb-8">
            FarmChain is live in BETA. Early adopters shape the future of agricultural ownership in Africa. 
            Start with real cattle, goats, or poultry today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="https://farmchaincoop.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl transition-all inline-flex items-center gap-2"
            >
              Get Started <ArrowRight size={20} />
            </a>
            <button 
              onClick={onGetStarted}
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Explore Platform
            </button>
          </div>
          <p className="text-emerald-100 text-sm mt-6">
            ✓ No minimum investment • ✓ Insured livestock • ✓ Transparent pricing
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <Sprout size={20} className="text-white" />
                </div>
                <span className="font-bold text-white text-lg">Farm Chain</span>
              </div>
              <p className="text-sm">
                Pioneering blockchain-powered tokenized livestock ownership in Africa. Built on Algorand.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Marketplace</a></li>
                <li><a href="https://farmchaincoop.netlify.app" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">Join the Coop</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Smart Contracts</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">GitHub</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Network</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Algorand TestNet
                </li>
                <li>IPFS Storage</li>
                <li>Pera Wallet</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2025 FarmChain. Pioneering transparent livestock ownership on blockchain. Currently in Beta.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
