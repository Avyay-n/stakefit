import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Post } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  MapPin,
  ShieldAlert,
  ThumbsUp,
  Maximize2,
  X,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { playPop } from '../utils/audio';

interface PostCardProps {
  post: Post;
  onOpenDispute: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenDispute }) => {
  const { activeUserId, users, vouchPost } = useApp();
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const usersMap = new Map(users.map((u) => [u.id, u]));
  const hasVouched = post.vouches.includes(activeUserId);
  const isAuthor = post.userId === activeUserId;
  const isVerified = post.status === 'verified' || post.vouches.length >= 2;
  const isDisputed = post.status === 'disputed' || (post.disputes && post.disputes.length > 0);

  // Quick Emoji Reactions State
  const [reactions, setReactions] = useState<{ beast: number; fire: number; cap: number }>(() => {
    const saved = localStorage.getItem(`stakefit_reactions_${post.id}`);
    return saved ? JSON.parse(saved) : { beast: 3, fire: 5, cap: 0 };
  });
  const [userReaction, setUserReaction] = useState<string | null>(() => {
    return localStorage.getItem(`stakefit_user_react_${post.id}`);
  });

  const handleReact = (type: 'beast' | 'fire' | 'cap') => {
    playPop();
    const isCurrent = userReaction === type;
    const next = { ...reactions };
    if (isCurrent) {
      next[type] = Math.max(0, next[type] - 1);
      setUserReaction(null);
      localStorage.removeItem(`stakefit_user_react_${post.id}`);
    } else {
      if (userReaction) {
        next[userReaction as 'beast' | 'fire' | 'cap'] = Math.max(0, next[userReaction as 'beast' | 'fire' | 'cap'] - 1);
      }
      next[type] = next[type] + 1;
      setUserReaction(type);
      localStorage.setItem(`stakefit_user_react_${post.id}`, type);
    }
    setReactions(next);
    localStorage.setItem(`stakefit_reactions_${post.id}`, JSON.stringify(next));
  };

  const handleShareWhatsApp = () => {
    playPop();
    const text = `🔥 ${post.userName} just logged a ${post.workoutType} workout on StakeFit! (${post.metrics.durationMinutes}m • ${post.metrics.calories} kcal) Proof: https://stakefit.app`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <article className="w-full bg-[#121214] text-white border border-[#27272a] rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-red-500/40">
        {/* Post Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-[#27272a] bg-[#121214]">
          <div className="flex items-center gap-3">
            <img
              src={post.userAvatar}
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white hover:text-red-400 transition-colors cursor-pointer">
                  {post.userName}
                </h4>
                <span className="text-xs text-zinc-400 font-semibold">{post.userHandle}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 font-medium">
                <span>{post.timestamp}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <MapPin className="w-3 h-3 text-red-500" />
                  <span>{post.exifData.locationTag}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1 shadow-md glow-red">
              <Dumbbell className="w-3 h-3" />
              <span>{post.workoutType}</span>
            </span>
          </div>
        </div>

        {/* Verification EXIF Badge */}
        <div className="px-4 py-2 bg-[#18181b] border-b border-[#27272a] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-emerald-400">EXIF Verified:</span>
            <span>Captured {post.exifData.capturedAt}</span>
            <span className="hidden sm:inline text-zinc-500">•</span>
            <span className="hidden sm:inline text-zinc-400">{post.exifData.device}</span>
          </div>

          <div className="flex items-center gap-1.5 text-zinc-300">
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold shadow-xs">
              {post.exifData.matchScore}% Confidence
            </span>
          </div>
        </div>

        {/* Photo Proof */}
        <div className="relative group bg-zinc-950 max-h-[460px] overflow-hidden flex items-center justify-center">
          <img
            src={post.imageUrl}
            alt="Workout proof"
            className="w-full object-cover max-h-[460px] group-hover:scale-[1.01] transition-transform duration-300"
          />

          <button
            onClick={() => setPhotoModalOpen(true)}
            className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
            title="Expand photo proof"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Quick status pill overlay */}
          <div className="absolute bottom-3 left-3">
            {isVerified ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/90 border border-emerald-500 text-emerald-300 backdrop-blur-md flex items-center gap-1.5 shadow-lg glow-green">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified ({post.vouches.length} vouches)</span>
              </span>
            ) : isDisputed ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-950/90 border border-red-500 text-red-300 backdrop-blur-md flex items-center gap-1.5 shadow-lg glow-red">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Disputed / Under Review</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/80 border border-amber-500 text-amber-300 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending ({post.vouches.length}/2 vouches)</span>
              </span>
            )}
          </div>
        </div>

        {/* Caption & Metrics */}
        <div className="p-4 sm:p-5 space-y-4 bg-[#121214] text-white">
          <p className="text-sm text-zinc-200 leading-relaxed font-semibold">{post.caption}</p>

          {/* Metrics Pills Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-center">
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                Duration
              </div>
              <div className="text-sm font-black font-mono text-white mt-0.5">
                {post.metrics.durationMinutes} min
              </div>
            </div>

            {post.metrics.distanceKm ? (
              <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-center">
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                  Distance
                </div>
                <div className="text-sm font-black font-mono text-white mt-0.5">
                  {post.metrics.distanceKm} km
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-center">
                <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                  Heart Rate
                </div>
                <div className="text-sm font-black font-mono text-red-400 mt-0.5 flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                  <span>{post.metrics.heartRateBpm || 148} bpm</span>
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-center">
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                Calories
              </div>
              <div className="text-sm font-black font-mono text-red-400 mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 fill-red-500 text-red-500" />
                <span>{post.metrics.calories} kcal</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-center">
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                Daily Quota
              </div>
              <div className="text-xs font-black font-mono mt-0.5">
                {isVerified ? (
                  <span className="text-emerald-400">+1 Counted</span>
                ) : isDisputed ? (
                  <span className="text-red-400">On Hold</span>
                ) : (
                  <span className="text-amber-400">Pending</span>
                )}
              </div>
            </div>
          </div>

          {/* Dispute alert banner if disputed */}
          {post.disputes && post.disputes.length > 0 && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 space-y-1.5 text-red-200">
              <div className="flex items-center gap-1.5 text-xs font-black text-red-400 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                <span>Dispute Raised by Peer</span>
              </div>
              {post.disputes.map((disp, idx) => (
                <div key={idx} className="text-xs text-zinc-300 pl-5">
                  <span className="font-bold text-white">{disp.userName}: </span>
                  <span className="text-zinc-300">"{disp.reason}"</span>
                </div>
              ))}
            </div>
          )}

          {/* Vouches Avatars row */}
          {post.vouches.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex -space-x-2 overflow-hidden">
                {post.vouches.map((vid) => {
                  const voucher = usersMap.get(vid);
                  if (!voucher) return null;
                  return (
                    <img
                      key={vid}
                      src={voucher.avatar}
                      alt={voucher.name}
                      title={`Vouched by ${voucher.name}`}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-[#121214] object-cover shadow-sm"
                    />
                  );
                })}
              </div>
              <span className="text-xs text-zinc-400 font-bold">
                Vouched by{' '}
                {post.vouches
                  .map((vid) => usersMap.get(vid)?.name.split(' ')[0] || 'Member')
                  .join(', ')}
              </span>
            </div>
          )}

          {/* Quick Emoji Reaction Strip */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#27272a]">
            <button
              onClick={() => handleReact('beast')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                userReaction === 'beast'
                  ? 'bg-red-600 text-white shadow-md glow-red scale-105'
                  : 'bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a]'
              }`}
            >
              <span>💪</span>
              <span className="text-[11px] font-mono font-black">Beast</span>
              <span className="text-[10px] font-bold">{reactions.beast}</span>
            </button>

            <button
              onClick={() => handleReact('fire')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                userReaction === 'fire'
                  ? 'bg-red-600 text-white shadow-md glow-red scale-105'
                  : 'bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a]'
              }`}
            >
              <span>🔥</span>
              <span className="text-[11px] font-mono font-black">Fire</span>
              <span className="text-[10px] font-bold">{reactions.fire}</span>
            </button>

            <button
              onClick={() => handleReact('cap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                userReaction === 'cap'
                  ? 'bg-red-600 text-white shadow-md scale-105'
                  : 'bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a]'
              }`}
            >
              <span>🧢</span>
              <span className="text-[11px] font-mono font-black">Cap</span>
              {reactions.cap > 0 && <span className="text-[10px] font-bold">{reactions.cap}</span>}
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-3 sm:px-5 sm:py-3.5 bg-[#16161a] border-t border-[#27272a] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Vouch Button */}
            <button
              onClick={() => {
                playPop();
                vouchPost(post.id);
              }}
              disabled={isAuthor || hasVouched}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                hasVouched
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/70 cursor-default shadow-xs'
                  : isAuthor
                  ? 'bg-[#18181b] text-zinc-500 border border-zinc-800 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/30 glow-green active:scale-95'
              }`}
              title={
                isAuthor
                  ? 'You cannot vouch for your own check-in'
                  : hasVouched
                  ? 'You have already vouched'
                  : 'Vouch for this workout proof'
              }
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasVouched ? 'fill-emerald-400 text-emerald-400' : ''}`} />
              <span>{hasVouched ? 'Vouched ✓' : isAuthor ? 'Your Proof' : 'Vouch (Approve)'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px] font-mono">
                {post.vouches.length}
              </span>
            </button>

            {/* Dispute / Call Out Button */}
            {!isAuthor && (
              <button
                onClick={() => onOpenDispute(post.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-red-400 hover:text-white bg-red-950/30 hover:bg-red-900/50 border border-red-800/50 transition-all"
                title="Call out or dispute suspicious check-in"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Call Out</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* WhatsApp Share Button */}
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#18181b] hover:bg-emerald-600 text-zinc-300 hover:text-white border border-zinc-700 hover:border-emerald-500 text-xs font-black transition-all shadow-xs"
              title="Share workout proof to WhatsApp Squad"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Copy Link Button */}
            <button
              onClick={() => {
                playPop();
                navigator.clipboard?.writeText(window.location.href);
              }}
              className="p-2 rounded-xl bg-[#18181b] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-700 transition-colors shadow-xs"
              title="Copy post link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>

      {/* Expanded Photo Modal */}
      {photoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPhotoModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#121214] border border-[#27272a] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
              <div>
                <h3 className="text-sm font-bold text-white">{post.userName}'s Proof</h3>
                <p className="text-xs text-zinc-400">{post.workoutType} • {post.exifData.locationTag}</p>
              </div>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={post.imageUrl}
                alt="Full proof"
                className="max-h-[70vh] object-contain rounded"
              />
            </div>
            <div className="p-4 bg-[#18181b] border-t border-[#27272a] text-xs font-mono text-zinc-400 flex flex-wrap gap-4 justify-between">
              <div>Exif: {post.exifData.device} • {post.exifData.capturedAt}</div>
              <div className="text-emerald-400 font-bold">{post.exifData.matchScore}% Match Score Verified</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

