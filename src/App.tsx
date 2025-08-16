import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { useTokens } from './hooks/useTokens';
import { useVault } from './hooks/useVault';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { VaultInterface } from './components/VaultInterface';
import { AdminPanel } from './components/AdminPanel';
import { StrategyManager } from './components/StrategyManager';
import { SecurityMonitor } from './components/SecurityMonitor';
import { WalletModal } from './components/WalletModal';
import { SwapModal } from './components/SwapModal';

export type UserRole = 'user' | 'admin' | 'strategist';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vault' | 'admin' | 'strategies' | 'security'>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  const { wallet, isConnecting, connectWallet, disconnectWallet, switchNetwork } = useWallet();
  const { tokens } = useTokens(wallet);
  const vault = useVault(wallet);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard vault={vault} onOpenSwap={() => setShowSwapModal(true)} />;
      case 'vault':
        return <VaultInterface wallet={wallet} tokens={tokens} vault={vault} />;
      case 'admin':
        return userRole === 'admin' ? <AdminPanel vault={vault} /> : <div className="text-center text-gray-400 mt-20">Access Denied: Admin privileges required</div>;
      case 'strategies':
        return userRole !== 'user' ? <StrategyManager vault={vault} /> : <div className="text-center text-gray-400 mt-20">Access Denied: Strategist privileges required</div>;
      case 'security':
        return userRole === 'admin' ? <SecurityMonitor /> : <div className="text-center text-gray-400 mt-20">Access Denied: Admin privileges required</div>;
      default:
        return <Dashboard vault={vault} onOpenSwap={() => setShowSwapModal(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        wallet={wallet}
        onOpenWallet={() => setShowWalletModal(true)}
        onOpenSwap={() => setShowSwapModal(true)}
      />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        wallet={wallet}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        onSwitchNetwork={switchNetwork}
        isConnecting={isConnecting}
      />
      
      <SwapModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        tokens={tokens}
        wallet={wallet}
      />
    </div>
  );
}

export default App;