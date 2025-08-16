import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Lock, Eye, Clock } from 'lucide-react';

export function SecurityMonitor() {
  const [activeAlerts, setActiveAlerts] = useState(2);

  const securityMetrics = [
    { label: 'Security Score', value: '94/100', status: 'good', icon: Shield },
    { label: 'Active Alerts', value: activeAlerts.toString(), status: 'warning', icon: AlertTriangle },
    { label: 'Failed Attempts', value: '0', status: 'good', icon: XCircle },
    { label: 'Uptime', value: '99.9%', status: 'good', icon: Activity }
  ];

  const securityEvents = [
    {
      id: 1,
      type: 'warning',
      title: 'High Gas Price Alert',
      description: 'Transaction costs above normal threshold',
      timestamp: '5 minutes ago',
      severity: 'Medium',
      status: 'Active'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Strategy Performance Drop',
      description: 'Balancer BAL-WETH showing -2.3% performance',
      timestamp: '12 minutes ago',
      severity: 'Medium',
      status: 'Active'
    },
    {
      id: 3,
      type: 'info',
      title: 'Successful Rebalancing',
      description: 'AI-driven rebalancing completed successfully',
      timestamp: '1 hour ago',
      severity: 'Low',
      status: 'Resolved'
    },
    {
      id: 4,
      type: 'success',
      title: 'Security Audit Passed',
      description: 'Weekly automated security scan completed',
      timestamp: '2 hours ago',
      severity: 'Low',
      status: 'Resolved'
    }
  ];

  const accessControls = [
    { role: 'Admin', count: 2, permissions: ['All Access'], lastActivity: '5m ago' },
    { role: 'Strategist', count: 3, permissions: ['Strategy Management'], lastActivity: '15m ago' },
    { role: 'Keeper', count: 5, permissions: ['Rebalancing', 'Harvesting'], lastActivity: '2m ago' },
    { role: 'User', count: 1247, permissions: ['Deposit', 'Withdraw'], lastActivity: 'Now' }
  ];

  const contractHealth = [
    { name: 'Main Vault', address: '0x1234...5678', status: 'Healthy', lastCheck: '30s ago', gasUsed: 'Normal' },
    { name: 'Strategy Router', address: '0x2345...6789', status: 'Healthy', lastCheck: '45s ago', gasUsed: 'Normal' },
    { name: 'Compound Strategy', address: '0x3456...7890', status: 'Healthy', lastCheck: '1m ago', gasUsed: 'Low' },
    { name: 'Uniswap Strategy', address: '0x4567...8901', status: 'Warning', lastCheck: '2m ago', gasUsed: 'High' },
    { name: 'Fee Collector', address: '0x5678...9012', status: 'Healthy', lastCheck: '15s ago', gasUsed: 'Normal' }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good': 
        return 'text-green-400';
      case 'warning': 
        return 'text-yellow-400';
      case 'error':
      case 'critical': 
        return 'text-red-400';
      default: 
        return 'text-gray-400';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-blue-400" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {securityMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <Icon className={`h-8 w-8 ${getStatusColor(metric.status)}`} />
                <span className={`text-sm font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status === 'good' ? '✓' : '!'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-gray-400 text-sm">{metric.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Security Events */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Security Events</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
                Clear All
              </button>
              <button className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors">
                Export
              </button>
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {securityEvents.map((event) => (
              <div key={event.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getEventIcon(event.type)}
                    <h3 className="font-medium text-white">{event.title}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getSeverityColor(event.severity)}`}>
                      {event.severity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      event.status === 'Active' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-2">{event.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{event.timestamp}</span>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Access Control */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Access Control</h2>
            <Lock className="h-5 w-5 text-cyan-400" />
          </div>
          
          <div className="space-y-4">
            {accessControls.map((control, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-white">{control.role}</span>
                    <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded-full">
                      {control.count}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">{control.lastActivity}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {control.permissions.map((permission, permIndex) => (
                    <span key={permIndex} className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contract Health Monitor */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Contract Health Monitor</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Live Monitoring</span>
            </div>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors">
              Refresh All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Contract</th>
                <th className="text-left py-3 px-4 text-gray-400">Address</th>
                <th className="text-left py-3 px-4 text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-gray-400">Last Check</th>
                <th className="text-left py-3 px-4 text-gray-400">Gas Usage</th>
                <th className="text-left py-3 px-4 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contractHealth.map((contract, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4 font-medium text-white">{contract.name}</td>
                  <td className="py-3 px-4 text-gray-400 font-mono">{contract.address}</td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{contract.lastCheck}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm ${
                      contract.gasUsed === 'High' ? 'text-red-400' : 
                      contract.gasUsed === 'Normal' ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      {contract.gasUsed}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="text-cyan-400 hover:text-cyan-300 text-sm">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300 text-sm">
                        <Clock className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Response */}
      <div className="bg-red-900/20 rounded-xl p-6 border border-red-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <h2 className="text-xl font-semibold text-white">Emergency Response</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
            Emergency Pause All
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
            Pause Deposits
          </button>
          <button className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
            Force Rebalance
          </button>
        </div>
        
        <p className="text-sm text-red-200 mt-4">
          ⚠️ Emergency controls should only be used in critical situations. All actions are logged and require multi-signature confirmation.
        </p>
      </div>
    </div>
  );
}