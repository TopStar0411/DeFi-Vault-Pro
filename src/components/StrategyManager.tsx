import React, { useState } from 'react';
import { Plus, TrendingUp, AlertTriangle, CheckCircle, XCircle, Zap, Brain } from 'lucide-react';

export function StrategyManager() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState(true);

  const strategies = [
    {
      id: '1',
      name: 'Compound USDC',
      protocol: 'Compound',
      status: 'Active',
      allocation: 35,
      apy: 16.2,
      tvl: '$859,476',
      risk: 'Low',
      lastRebalance: '2h ago',
      performance: '+5.2%',
      healthScore: 95
    },
    {
      id: '2',
      name: 'Uniswap ETH-USDC LP',
      protocol: 'Uniswap V3',
      status: 'Active',
      allocation: 25,
      apy: 24.8,
      tvl: '$614,197',
      risk: 'Medium',
      lastRebalance: '4h ago',
      performance: '+8.7%',
      healthScore: 88
    },
    {
      id: '3',
      name: 'Aave USDT',
      protocol: 'Aave',
      status: 'Active',
      allocation: 20,
      apy: 12.4,
      tvl: '$491,358',
      risk: 'Low',
      lastRebalance: '1h ago',
      performance: '+3.1%',
      healthScore: 92
    },
    {
      id: '4',
      name: 'Curve 3Pool',
      protocol: 'Curve',
      status: 'Active',
      allocation: 15,
      apy: 8.9,
      tvl: '$368,543',
      risk: 'Low',
      lastRebalance: '6h ago',
      performance: '+2.4%',
      healthScore: 96
    },
    {
      id: '5',
      name: 'Balancer BAL-WETH',
      protocol: 'Balancer',
      status: 'Warning',
      allocation: 5,
      apy: 31.2,
      tvl: '$123,215',
      risk: 'High',
      lastRebalance: '12h ago',
      performance: '+12.5%',
      healthScore: 74
    }
  ];

  const aiInsights = {
    recommendations: [
      'Reduce Balancer BAL-WETH allocation by 2% due to increased volatility',
      'Increase Compound USDC allocation by 3% to capture stable yields',
      'Monitor Uniswap LP position for potential impermanent loss'
    ],
    predictedRebalancing: 'Next AI rebalancing in 2h 15m',
    riskScore: 6.2,
    optimizationPotential: '+2.3% APY'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400';
      case 'Warning': return 'text-yellow-400';
      case 'Inactive': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4" />;
      case 'Warning': return <AlertTriangle className="h-4 w-4" />;
      case 'Inactive': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* AI Control Panel */}
      <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">AI Strategy Engine</h2>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">AI Mode</span>
            <button
              onClick={() => setAiMode(!aiMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                aiMode ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  aiMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Next Rebalance</span>
            </div>
            <p className="text-white font-medium">{aiInsights.predictedRebalancing}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">Optimization</span>
            </div>
            <p className="text-green-400 font-medium">{aiInsights.optimizationPotential}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-gray-400">Risk Score</span>
            </div>
            <p className="text-white font-medium">{aiInsights.riskScore}/10</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-gray-400">Active Strategies</span>
            </div>
            <p className="text-white font-medium">{strategies.filter(s => s.status === 'Active').length}/{strategies.length}</p>
          </div>
        </div>

        {aiMode && (
          <div className="mt-6 space-y-3">
            <h3 className="font-medium text-purple-400">AI Recommendations:</h3>
            {aiInsights.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-300">{rec}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strategy List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Active Strategies</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Strategy</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-6 text-gray-400">Strategy</th>
                <th className="text-left py-4 px-6 text-gray-400">Status</th>
                <th className="text-left py-4 px-6 text-gray-400">Allocation</th>
                <th className="text-left py-4 px-6 text-gray-400">APY</th>
                <th className="text-left py-4 px-6 text-gray-400">TVL</th>
                <th className="text-left py-4 px-6 text-gray-400">Risk</th>
                <th className="text-left py-4 px-6 text-gray-400">Performance</th>
                <th className="text-left py-4 px-6 text-gray-400">Health</th>
                <th className="text-left py-4 px-6 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((strategy) => (
                <tr 
                  key={strategy.id} 
                  className="border-b border-gray-700/50 hover:bg-gray-700/30 cursor-pointer"
                  onClick={() => setSelectedStrategy(selectedStrategy === strategy.id ? null : strategy.id)}
                >
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-white">{strategy.name}</div>
                      <div className="text-sm text-gray-400">{strategy.protocol}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center space-x-2 ${getStatusColor(strategy.status)}`}>
                      {getStatusIcon(strategy.status)}
                      <span className="text-sm">{strategy.status}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-400 h-2 rounded-full"
                          style={{ width: `${(strategy.allocation / 40) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{strategy.allocation}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-green-400 font-medium">{strategy.apy}%</td>
                  <td className="py-4 px-6 text-white">{strategy.tvl}</td>
                  <td className="py-4 px-6">
                    <span className={`text-sm ${getRiskColor(strategy.risk)}`}>{strategy.risk}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-green-400 text-sm">{strategy.performance}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            strategy.healthScore >= 90 ? 'bg-green-400' : 
                            strategy.healthScore >= 80 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${strategy.healthScore}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{strategy.healthScore}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button className="text-cyan-400 hover:text-cyan-300 text-sm">Edit</button>
                      <button className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategy Details */}
      {selectedStrategy && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          {(() => {
            const strategy = strategies.find(s => s.id === selectedStrategy);
            if (!strategy) return null;
            
            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">{strategy.name} Details</h3>
                  <button 
                    onClick={() => setSelectedStrategy(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-300 mb-2">Current Performance</h4>
                    <p className="text-2xl font-bold text-green-400">{strategy.performance}</p>
                    <p className="text-sm text-gray-400">Last 30 days</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-300 mb-2">Last Rebalance</h4>
                    <p className="text-2xl font-bold text-white">{strategy.lastRebalance}</p>
                    <p className="text-sm text-gray-400">Auto-triggered</p>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-300 mb-2">Health Score</h4>
                    <p className="text-2xl font-bold text-cyan-400">{strategy.healthScore}/100</p>
                    <p className="text-sm text-gray-400">Excellent</p>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-4">
                  <button className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
                    Rebalance Now
                  </button>
                  <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    View Analytics
                  </button>
                  <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Emergency Exit
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}