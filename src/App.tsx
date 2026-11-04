import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import type { PageId } from './components/Sidebar';
import { FeedView } from './components/FeedView';
import { ShameWallPage } from './components/ShameWallPage';
import { LedgerView } from './components/LedgerView';
import { BodyTransformationView } from './components/BodyTransformationView';
import { GroupSettingsView } from './components/GroupSettingsView';
import { CheckInModal } from './components/CheckInModal';
import { DisputeModal } from './components/DisputeModal';
import { SettleModal } from './components/SettleModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { SimulationControls } from './components/SimulationControls';
import { Toast } from './components/Toast';
import { MidnightCutoffTimer } from './components/MidnightCutoffTimer';
import { LandingPage } from './components/LandingPage';
import { SquadsHub } from './components/SquadsHub';
import { AuthModal } from './components/AuthModal';
import type { DebtTransaction } from './types';
import {
  Flame,
  Menu,
  Coins,
  ChevronLeft,
} from 'lucide-react';
import { playPop } from './utils/audio';

export type AppViewMode = 'landing' | 'squads-hub' | 'app';

const MainApp: React.FC = () => {
  const { transactions, activeGroupId, activeGroup, activeUser, switchActiveGroup } = useApp();

  const [viewMode, setViewMode] = useState<AppViewMode>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageId>('feed');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(() => {
    return localStorage.getItem('stakefit_sidebar_pinned') === 'true';
  });

  const handleTogglePin = () => {
    setIsSidebarPinned((prev) => {
      const next = !prev;
      localStorage.setItem('stakefit_sidebar_pinned', String(next));
      return next;
    });
  };
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [disputePostId, setDisputePostId] = useState<string | null>(null);
  const [settleTransaction, setSettleTransaction] = useState<DebtTransaction | null>(null);

  // Count pending transactions in active group
  const pendingDebts = transactions.filter(
    (tx) => tx.groupId === activeGroupId && !tx.isSettled
  ).length;

  const totalStakesAtRisk =
    activeGroup.memberIds.length *
    activeGroup.targetDaysPerWeek *
    activeGroup.penaltyPerMissedDay;

  const defaultedCount = Object.values(activeGroup.membersStats || {}).filter(
    (s) => s.status === 'defaulted'
  ).length;

  // View 1: Marketing / Product Intro Landing Page
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onEnterHub={() => {
            playPop();
            setViewMode('squads-hub');
          }}
          onOpenAuth={() => {
            playPop();
            setAuthModalOpen(true);
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setViewMode('squads-hub');
          }}
        />
        <Toast />
      </>
    );
  }

  // View 2: Supabase-Style Organizations & Fitness Squads Hub
  if (viewMode === 'squads-hub') {
    return (
      <>
        <SquadsHub
          onSelectSquad={(squadId) => {
            playPop();
            switchActiveGroup(squadId);
            setViewMode('app');
          }}
          onOpenCreateSquad={() => {
            playPop();
            setCreateGroupModalOpen(true);
          }}
          onOpenAuth={() => {
            playPop();
            setAuthModalOpen(true);
          }}
          onBackToHome={() => {
            playPop();
            setViewMode('landing');
          }}
        />
        <CreateGroupModal
          isOpen={createGroupModalOpen}
          onClose={() => setCreateGroupModalOpen(false)}
          onCreated={(newId) => {
            switchActiveGroup(newId);
            setViewMode('app');
          }}
        />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {}}
        />
        <Toast />
      </>
    );
  }

  // View 3: In-App Dashboard & Squad View
  return (
    <div className="min-h-screen bg-[#000000] text-[#f4f4f5] flex font-sans selection:bg-red-600 selection:text-white">
      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Left Sidebar (Supabase hover-expandable rail) */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        pendingDebtsCount={pendingDebts}
        onOpenCheckIn={() => setCheckInModalOpen(true)}
        onOpenCreateGroup={() => setCreateGroupModalOpen(true)}
        onOpenHub={() => setViewMode('squads-hub')}
        isMobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        isPinned={isSidebarPinned}
        onTogglePin={handleTogglePin}
      />

      {/* Main Content Layout (Offset for Left Sidebar on md+): 64px rail, 256px pinned */}
      <div
        className={`flex-1 flex flex-col min-w-0 pb-20 md:pb-8 transition-all duration-300 ${
          isSidebarPinned ? 'md:pl-64' : 'md:pl-16'
        }`}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 w-full bg-[#000000]/90 backdrop-blur-md border-b-2 border-[#27272a] h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Hub Back Link + Active Page title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-[#121214] border border-[#27272a] text-white hover:bg-red-600 hover:border-red-500 transition-colors"
              aria-label="Open Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Button to return to Supabase-style Squads Hub */}
            <button
              onClick={() => {
                playPop();
                setViewMode('squads-hub');
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141416] border border-zinc-800 hover:border-emerald-500/50 text-xs font-bold text-zinc-300 hover:text-white transition-all group shadow-sm"
              title="Return to Organizations & Squads Hub"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400" />
              <span className="text-emerald-400 font-black">⚡</span>
              <span className="hidden sm:inline">All Squads</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                  {currentPage === 'feed' && '🔥 Daily Proof Feed'}
                  {currentPage === 'shame-wall' && '💀 The Shame Wall'}
                  {currentPage === 'ledger' && '💸 Settlement Ledger'}
                  {currentPage === 'transformation' && '📸 Transformation Vault'}
                  {currentPage === 'squad' && '⚔️ Squad Pact Settings'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-600 text-white">
                  {activeGroup.name}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Midnight Cutoff Timer + Quick Indicators */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Midnight Cutoff Countdown Timer */}
            <MidnightCutoffTimer />

            {/* Active Stakes Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-mono font-black shadow-md glow-red">
              <Coins className="w-3.5 h-3.5" />
              <span>
                Pool: {activeGroup.currency}
                {totalStakesAtRisk.toLocaleString()}
              </span>
            </div>

            {/* User Streak Quick Badge */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white text-black text-xs font-black font-mono border-2 border-red-500 shadow-md">
              <Flame className="w-3.5 h-3.5 text-red-600 fill-red-600" />
              <span>{activeUser.streakDays}d Streak</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
          {currentPage === 'feed' && (
            <FeedView
              onOpenCheckIn={() => setCheckInModalOpen(true)}
              onOpenDispute={(id) => setDisputePostId(id)}
            />
          )}

          {currentPage === 'shame-wall' && <ShameWallPage />}

          {currentPage === 'ledger' && (
            <LedgerView
              onSettleTransaction={(tx) => setSettleTransaction(tx)}
            />
          )}

          {currentPage === 'transformation' && <BodyTransformationView />}

          {currentPage === 'squad' && <GroupSettingsView />}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t-2 border-[#27272a] bg-[#000000] py-6 text-center text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="font-black text-white uppercase tracking-wider">
                Stake<span className="text-red-500">Fit</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-zinc-400 font-bold">
              <span>🔥 Daily Proofs</span>
              <span>•</span>
              <span>💀 Shame Wall</span>
              <span>•</span>
              <span>💸 UPI Settlement</span>
              <span>•</span>
              <span>📸 Transformations</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#000000]/95 backdrop-blur-md border-t-2 border-[#27272a] px-2 py-2 flex items-center justify-around"
        aria-label="Mobile Navigation"
      >
        {[
          { id: 'feed' as PageId, icon: '🔥', label: 'Feed' },
          {
            id: 'shame-wall' as PageId,
            icon: '💀',
            label: 'Shame',
            badge: defaultedCount > 0 ? defaultedCount : null,
          },
          {
            id: 'ledger' as PageId,
            icon: '💸',
            label: 'Ledger',
            badge: pendingDebts > 0 ? pendingDebts : null,
          },
          { id: 'transformation' as PageId, icon: '📸', label: 'Vault' },
          { id: 'squad' as PageId, icon: '⚔️', label: 'Squad' },
        ].map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playPop();
                setCurrentPage(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-red-600 text-white font-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                {tab.label}
              </span>
              {tab.badge && (
                <span
                  className={`absolute -top-1 -right-1 px-1.5 py-0.2 text-[9px] font-black rounded-full font-mono ${
                    isActive ? 'bg-white text-red-600' : 'bg-red-600 text-white'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

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

      {/* Toast Notifications */}
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
