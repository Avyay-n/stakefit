import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface DisputeModalProps {
  postId: string | null;
  onClose: () => void;
}

const COMMON_REASONS = [
  'Old photo from a previous workout or week',
  'Blurry or unverified proof (no gym equipment / face / timestamp visible)',
  'EXIF timestamp mismatch or scrubbed metadata',
  'Incomplete workout / didn\'t fulfill agreed pact quota',
  'Other suspicious activity',
];

export const DisputeModal: React.FC<DisputeModalProps> = ({ postId, onClose }) => {
  const { posts, disputePost } = useApp();
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!postId) return null;
  const targetPost = posts.find((p) => p.id === postId);
  if (!targetPost) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim()
      ? `${selectedReason}: ${customReason}`
      : selectedReason;

    disputePost(postId, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121214] border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden glow-red">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] flex items-center justify-between bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Call Out / Dispute Check-In</h3>
              <p className="text-xs text-zinc-400">
                Challenging <span className="text-red-400 font-semibold">{targetPost.userName}'s</span> proof
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center gap-3">
            <img
              src={targetPost.imageUrl}
              alt="Proof"
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0 text-xs">
              <div className="font-semibold text-white truncate">{targetPost.caption}</div>
              <div className="text-zinc-400 font-mono">
                {targetPost.workoutType} • {targetPost.timestamp}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Select Dispute Reason
            </label>
            <div className="space-y-2">
              {COMMON_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'bg-red-500/15 border-red-500 text-white font-medium'
                      : 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:bg-[#27272a]'
                  }`}
                >
                  <input
                    type="radio"
                    name="disputeReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-0.5 accent-red-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Additional Details / Evidence (Optional)
            </label>
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="e.g. He wore this exact same gym shirt in last Tuesday's story with the same timestamp..."
              rows={2}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Disputing will hold this check-in in "Under Review" status and notify group members. False call-outs may be penalized by group admin.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg glow-red"
            >
              Submit Official Dispute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
