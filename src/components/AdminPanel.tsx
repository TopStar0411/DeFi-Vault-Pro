import React, { useState } from 'react';
import { Settings, Users, DollarSign, Shield, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

export function AdminPanel() {
  const [performanceFee, setPerformanceFee] = useState(2);
  const [managementFee, setManagementFee] = useState(0.5);
  const [emergencyPause, setEmergencyPause] = useState(false);

  const vaultMetrics = {
    totalTVL: '$2,456,789',
    totalFees: '$12,456',
    activeUsers: 1247,
    pendingWithdrawals: '$45,678'
  };

  const emergencyControls = [
    { name: 'Emergency Pause', active: emergencyPause, critical: true },
    { name: 'Strategy Whitelist', active: true, critical: false },
    { name: 'Withdrawal Limits', active: false, critical: false },
    { name: 'Rebalancing Lock', active: false, critical: false }
  ];

  return (
    <div className="space-y-8">
      {/* Admin Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 text-green-400" />
            <span className="text-sm text-green-400 font-medium">+5.2%</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{vaultMetrics.totalTVL}</h3>
          <p className="text-gray-400 text-sm">Total TVL</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">+12.1%</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{vaultMetrics.totalFees}</h3>
          <p className="text-gray-400 text-sm">Fees Collected</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">+156</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{vaultMetrics.activeUsers}</h3>
          <p className="text-gray-400 text-sm">Active Users</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">-2.3%</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{vaultMetrics.pendingWithdrawals}</h3>
          <p className="text-gray-400 text-sm">Pending Withdrawals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fee Management */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="h-6 w-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Fee Management</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Performance Fee: {performanceFee}%
              </label>
              <input
                type="range"
                min="0"
                max="20"
                step="0.1"
                value={performanceFee}
                onChange={(e) => setPerformanceFee(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>20%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Management Fee: {managementFee}%
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={managementFee}
                onChange={(e) => setManagementFee(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>5%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Estimated Annual Fees:</span>
                <span className="text-white">${((2456789 * performanceFee / 100 * 0.18) + (2456789 * managementFee / 100)).toLocaleString()}</span>
              </div>
            </div>

            <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg transition-colors">
              Update Fee Structure
            </button>
          </div>
        </div>

        {/* Emergency Controls */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Emergency Controls</h2>
          </div>
          
          <div className="space-y-4">
            {emergencyControls.map((control, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                control.critical ? 'bg-red-900/20 border border-red-500/30' : 'bg-gray-700'
              }`}>
                <div>
                  <h3 className="font-medium text-white">{control.name}</h3>
                  {control.critical && (
                    <p className="text-sm text-red-400">Critical Security Control</p>
                  )}
                </div>
                <button
                  onClick={() => control.name === 'Emergency Pause' && setEmergencyPause(!emergencyPause)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    control.active
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
                >
                  {control.active ? 'ACTIVE' : 'INACTIVE'}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span className="font-medium text-yellow-400">Safety Notice</span>
            </div>
            <p className="text-sm text-yellow-200">
              Emergency controls should only be used in critical situations. All actions are logged and auditable.
            </p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">User Management</h2>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              Export Data
            </button>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">
              Add Whitelist
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">User</th>
                <th className="text-left py-3 px-4 text-gray-400">Balance</th>
                <th className="text-left py-3 px-4 text-gray-400">Shares</th>
                <th className="text-left py-3 px-4 text-gray-400">Last Activity</th>
                <th className="text-left py-3 px-4 text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { address: '0x1234...5678', balance: '$12,456', shares: '10,523', activity: '2h ago', status: 'Active' },
                { address: '0x9876...5432', balance: '$8,901', shares: '7,516', activity: '5h ago', status: 'Active' },
                { address: '0x5555...1111', balance: '$25,678', shares: '21,675', activity: '1d ago', status: 'Active' },
                { address: '0x7777...9999', balance: '$3,245', shares: '2,740', activity: '3d ago', status: 'Inactive' }
              ].map((user, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4 text-white font-mono">{user.address}</td>
                  <td className="py-3 px-4 text-white">{user.balance}</td>
                  <td className="py-3 px-4 text-white">{user.shares}</td>
                  <td className="py-3 px-4 text-gray-400">{user.activity}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-cyan-400 hover:text-cyan-300 text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}