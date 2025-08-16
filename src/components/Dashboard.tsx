import React from 'react';
import { TrendingUp, Shield, DollarSign, Users, Activity, AlertTriangle } from 'lucide-react';
import { useVault } from '../hooks/useVault';

interface DashboardProps {
  vault: ReturnType<typeof useVault>;
  onOpenSwap: () => void;
}

export function Dashboard({ vault, onOpenSwap }: DashboardProps) {
  const { vaultStats } = vault;

  const stats = [
    { label: 'Total Value Locked', value: `$${vaultStats.totalAssets}`, change: '+12.5%', icon: DollarSign, positive: true },
    { label: 'Active Strategies', value: '8', change: '+2', icon: Shield, positive: true },
    { label: 'Average APY', value: `${vaultStats.apy}%`, change: '+2.1%', icon: TrendingUp, positive: true },
    { label: 'Total Users', value: '1,247', change: '+156', icon: Users, positive: true },
  ];

  const strategies = [
    { name: 'Compound USDC', allocation: 35, apy: 16.2, tvl: '$859,476', risk: 'Low' },
    { name: 'Uniswap ETH-USDC LP', allocation: 25, apy: 24.8, tvl: '$614,197', risk: 'Medium' },
    { name: 'Aave USDT', allocation: 20, apy: 12.4, tvl: '$491,358', risk: 'Low' },
    { name: 'Curve 3Pool', allocation: 15, apy: 8.9, tvl: '$368,543', risk: 'Low' },
    { name: 'Balancer BAL-WETH', allocation: 5, apy: 31.2, tvl: '$123,215', risk: 'High' },
  ];

  const recentActivity = [
    { action: 'Deposit', user: '0x1234...5678', amount: '$5,000', timestamp: '2 minutes ago', type: 'deposit' },
    { action: 'Rebalance', user: 'AI Strategy', amount: '15% → Compound', timestamp: '5 minutes ago', type: 'rebalance' },
    { action: 'Harvest', user: 'Keeper', amount: '$124 fees', timestamp: '12 minutes ago', type: 'harvest' },
    { action: 'Withdrawal', user: '0x9876...5432', amount: '$2,500', timestamp: '18 minutes ago', type: 'withdrawal' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-8 w-8 text-cyan-400" />
                <span className={`text-sm font-medium ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strategy Allocations */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Strategy Allocations</h2>
            <Activity className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="space-y-4">
            {strategies.map((strategy, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{strategy.name}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-400">{strategy.allocation}%</span>
                    <span className="text-sm font-medium text-green-400">{strategy.apy}% APY</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full"
                      style={{ width: `${strategy.allocation}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 min-w-fit">{strategy.tvl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <AlertTriangle className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const typeColors = {
                deposit: 'text-green-400',
                withdrawal: 'text-red-400',
                rebalance: 'text-purple-400',
                harvest: 'text-yellow-400'
              };
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${typeColors[activity.type as keyof typeof typeColors]}`}>
                        {activity.action}
                      </span>
                      <span className="text-gray-400">by {activity.user}</span>
                    </div>
                    <p className="text-sm text-gray-500">{activity.timestamp}</p>
                  </div>
                  <span className="font-medium text-white">{activity.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Strategy Insights */}
      <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          <h2 className="text-xl font-semibold text-white">AI Strategy Insights</h2>
          <button
            onClick={onOpenSwap}
            className="ml-auto px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            Quick Swap
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-medium text-purple-400 mb-2">Recommendation</h3>
            <p className="text-sm text-gray-300">Increase Uniswap LP allocation by 5% to capture higher yields while maintaining risk balance.</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-medium text-cyan-400 mb-2">Risk Assessment</h3>
            <p className="text-sm text-gray-300">Current portfolio risk score: 6.2/10. Optimal diversification maintained across strategies.</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-medium text-green-400 mb-2">Performance</h3>
            <p className="text-sm text-gray-300">AI-driven rebalancing increased yields by 3.2% over the past 30 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}