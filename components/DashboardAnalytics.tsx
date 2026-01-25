import React from 'react';
import { Cow } from '../types';
import { TrendingUp, DollarSign, PieChart, Activity, Target, Calendar } from 'lucide-react';

interface Props {
  cows: Cow[];
}

export const DashboardAnalytics: React.FC<Props> = ({ cows }) => {
  const stats = React.useMemo(() => {
    const totalInvestment = cows.reduce((sum, cow) => sum + (cow.purchasePrice || 0), 0);
    const totalExpectedReturn = cows.reduce((sum, cow) => sum + (cow.expectedReturn || 0), 0);
    const totalCurrentValue = cows.reduce((sum, cow) => {
      // Calculate current value based on weight gain
      const initialWeight = cow.history?.[0]?.weight || cow.weight - 50;
      const weightGain = cow.weight - initialWeight;
      const valueIncrease = (weightGain / initialWeight) * (cow.purchasePrice || 0);
      return sum + (cow.purchasePrice || 0) + valueIncrease;
    }, 0);
    
    const profitLoss = totalCurrentValue - totalInvestment;
    const roiPercentage = totalInvestment > 0 ? ((profitLoss / totalInvestment) * 100) : 0;
    
    const avgHealthScore = cows.length > 0 
      ? cows.reduce((sum, cow) => sum + (cow.healthScore || 0), 0) / cows.length 
      : 0;
    
    // Count livestock by actual status
    const statusBreakdown = {
      fattening: cows.filter(c => c.status === 'fattening').length,
      ready_for_sale: cows.filter(c => c.status === 'ready_for_sale').length,
      sold: cows.filter(c => c.status === 'sold').length,
      slaughtered: cows.filter(c => c.status === 'slaughtered').length,
    };

    return {
      totalInvestment,
      totalExpectedReturn,
      totalCurrentValue,
      profitLoss,
      roiPercentage,
      avgHealthScore,
      statusBreakdown
    };
  }, [cows]);

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    color?: string;
  }> = ({ icon, label, value, subtitle, trend, color = 'emerald' }) => (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`bg-${color}-50 p-3 rounded-lg`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-slate-600'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );

  if (cows.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          label="Total Investment"
          value={`${stats.totalInvestment.toFixed(2)} ALGO`}
          color="emerald"
        />
        
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
          label="Current Value"
          value={`${stats.totalCurrentValue.toFixed(2)} ALGO`}
          subtitle={`${stats.roiPercentage >= 0 ? '+' : ''}${stats.roiPercentage.toFixed(1)}% ROI`}
          trend={stats.roiPercentage >= 0 ? 'up' : 'down'}
          color="blue"
        />
        
        <StatCard
          icon={<Activity className="w-6 h-6 text-purple-600" />}
          label="Avg. Health Score"
          value={`${stats.avgHealthScore.toFixed(0)}%`}
          trend={stats.avgHealthScore >= 80 ? 'up' : stats.avgHealthScore >= 60 ? 'neutral' : 'down'}
          color="purple"
        />
        
        <StatCard
          icon={<Target className="w-6 h-6 text-amber-600" />}
          label="Expected Returns"
          value={`${stats.totalExpectedReturn.toFixed(2)} ALGO`}
          subtitle={`Potential: +${((stats.totalExpectedReturn - stats.totalInvestment) / stats.totalInvestment * 100).toFixed(1)}%`}
          color="amber"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-900">Fattening</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{stats.statusBreakdown.fattening}</p>
          <p className="text-xs text-blue-700 mt-1">Currently growing</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-sm font-medium text-green-900">Ready for Sale</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{stats.statusBreakdown.ready_for_sale}</p>
          <p className="text-xs text-green-700 mt-1">Market ready</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <span className="text-sm font-medium text-purple-900">Sold</span>
          </div>
          <p className="text-3xl font-bold text-purple-900">{stats.statusBreakdown.sold}</p>
          <p className="text-xs text-purple-700 mt-1">Completed sales</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
            <span className="text-sm font-medium text-slate-900">Processed</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.statusBreakdown.slaughtered}</p>
          <p className="text-xs text-slate-700 mt-1">Slaughtered</p>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-600" />
            Portfolio Performance
          </h3>
          <span className="text-xs text-slate-500">Last 90 days</span>
        </div>
        <div className="relative h-48 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-slate-300">
          <div className="text-center">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Portfolio Growth Chart</p>
            <p className="text-xs text-slate-500 mt-1">Coming soon with historical data</p>
          </div>
        </div>
      </div>
    </div>
  );
};
