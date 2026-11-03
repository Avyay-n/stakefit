import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBar } from './StatusBar';
import { WeeklyProgressCard } from './WeeklyProgressCard';
import { PostCard } from './PostCard';
import { Filter, PlusCircle } from 'lucide-react';

interface FeedViewProps {
  onOpenCheckIn: () => void;
  onOpenDispute: (postId: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({ onOpenCheckIn, onOpenDispute }) => {
  const { posts, activeGroupId, activeUserId } = useApp();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Filter posts for active group
  const groupPosts = posts.filter((p) => p.groupId === activeGroupId);

  const filteredPosts = groupPosts.filter((post) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'needs_review') return post.status === 'pending' || post.vouches.length < 2;
    if (selectedFilter === 'mine') return post.userId === activeUserId;
    if (selectedFilter === 'verified') return post.status === 'verified';
    return post.workoutType.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Daily Status Bar & Shame Wall */}
      <StatusBar />

      {/* Weekly Progress & Habit Mechanics */}
      <WeeklyProgressCard />

      {/* Feed Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#121214] border border-[#27272a] rounded-2xl p-3 sm:px-4 sm:py-3 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-red-500" />
          <span>Feed Filter:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Proofs' },
            { id: 'needs_review', label: 'Needs Review ⚠️' },
            { id: 'mine', label: 'My Posts' },
            { id: 'verified', label: 'Verified ✓' },
            { id: 'gym', label: 'Gym' },
            { id: 'running', label: 'Running' },
            { id: 'calisthenics', label: 'Calisthenics' },
          ].map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md glow-red'
                    : 'bg-[#18181b] text-zinc-400 hover:text-zinc-200 hover:bg-[#27272a]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feed Posts List */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-[#121214] border border-dashed border-[#27272a] rounded-2xl text-zinc-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No check-ins found for this filter</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Be the first member to log today's workout proof and secure peer vouches before the midnight cutoff.
            </p>
            <button
              onClick={onOpenCheckIn}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-md glow-red"
            >
              Log Daily Workout Proof
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onOpenDispute={onOpenDispute} />
          ))
        )}
      </div>
    </div>
  );
};
