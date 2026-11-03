import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import type { ActiveTab } from './components/Navigation';
import { FeedView } from './components/FeedView';
import { LedgerView } from './components/LedgerView';
import { BodyTransformationView } from './components/BodyTransformationView';
import { GroupSettingsView } from './components/GroupSettingsView';
import { CheckInModal } from './components/CheckInModal';
import { DisputeModal } from './components/DisputeModal';
import { SettleModal } from './components/SettleModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { SimulationControls } from './components/SimulationControls';
import { Toast } from './components/Toast';
import type { DebtTransaction } from './types';
import { Flame } from 'lucide-react';

const MainApp: React.FC = () => {
  const { transactions, activeGroupId } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('feed');
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [disputePostId, setDisputePostId] = useState<string | null>(null);
  const [settleTransaction, setSettleTransaction] = useState<DebtTransaction | null>(null);

  // Count pending transactions in active group
  const pendingDebts = transactions.filter(
    (tx) => tx.groupId === activeGroupId && !tx.isSettled
  ).length;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans selection:bg-red-500/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenCheckIn={() => setCheckInModalOpen(true)}
        onOpenCreateGroup={() => setCreateGroupModalOpen(true)}
      />

      {/* Navigation Sub-header */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingDebtsCount={pendingDebts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'feed' && (
          <FeedView
            onOpenCheckIn={() => setCheckInModalOpen(true)}
            onOpenDispute={(id) => setDisputePostId(id)}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerView
            onSettleTransaction={(tx) => setSettleTransaction(tx)}
          />
        )}

        {activeTab === 'body' && <BodyTransformationView />}

        {activeTab === 'settings' && <GroupSettingsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#27272a] bg-[#0c0c0e] py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500 fill-red-500" />
            <span className="font-bold text-zinc-300 uppercase tracking-wider">StakeFit</span>
            <span>— Social Fitness Accountability & Financial Stakes</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Splitwise Settlement Engine</span>
            <span>•</span>
            <span>Peer Verification Feed</span>
            <span>•</span>
            <span>Body Transformation Tracker</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CheckInModal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
      />

      <CreateGroupModal
        isOpen={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
      />

      <DisputeModal
        postId={disputePostId}
        onClose={() => setDisputePostId(null)}
      />

      <SettleModal
        transaction={settleTransaction}
        onClose={() => setSettleTransaction(null)}
      />

      {/* Floating Simulation Controls */}
      <SimulationControls />

      {/* Toast Notification Container */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
