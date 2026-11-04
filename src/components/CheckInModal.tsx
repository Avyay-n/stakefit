import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { WorkoutType } from '../types';
import {
  X,
  Camera,
  Upload,
  Timer,
  Check,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { playGong, playPop } from '../utils/audio';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WORKOUT_TYPES: { type: WorkoutType; label: string; icon: string }[] = [
  { type: 'Gym', label: 'Gym / Weights', icon: '🏋️' },
  { type: 'Running', label: 'Running / Jog', icon: '🏃' },
  { type: 'Calisthenics', label: 'Calisthenics', icon: '🤸' },
  { type: 'Swimming', label: 'Swimming', icon: '🏊' },
  { type: 'HIIT', label: 'HIIT / Cardio', icon: '⚡' },
  { type: 'Cycling', label: 'Cycling', icon: '🚴' },
  { type: 'Sports', label: 'Sports', icon: '⚽' },
];

const PRESET_PROOFS = [
  {
    label: 'Barbell Deadlift',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    type: 'Gym' as WorkoutType,
  },
  {
    label: 'Treadmill Run Display',
    url: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&auto=format&fit=crop&q=80',
    type: 'Running' as WorkoutType,
  },
  {
    label: 'Outdoor Trail Run',
    url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80',
    type: 'Running' as WorkoutType,
  },
  {
    label: 'Calisthenics Pull-up Bar',
    url: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=80',
    type: 'Calisthenics' as WorkoutType,
  },
  {
    label: 'Olympic Pool Swim',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop&q=80',
    type: 'Swimming' as WorkoutType,
  },
  {
    label: 'Dumbbell Sweat Session',
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
    type: 'Gym' as WorkoutType,
  },
];

export const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose }) => {
  const { createPost, activeUser } = useApp();

  const [workoutType, setWorkoutType] = useState<WorkoutType>('Gym');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_PROOFS[0].url);
  const [duration, setDuration] = useState(55);
  const [distance, setDistance] = useState<number | undefined>(undefined);
  const [workoutFocus, setWorkoutFocus] = useState('Heavy Squats & Legs');
  const [intensity, setIntensity] = useState('High Intensity 🔥');
  const [locationTag, setLocationTag] = useState("Gold's Gym - Sector 29");

  // Live Workout Stopwatch State
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchActive, setStopwatchActive] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (stopwatchActive) {
      interval = setInterval(() => {
        setStopwatchSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stopwatchActive]);

  const handleToggleStopwatch = () => {
    setStopwatchActive(!stopwatchActive);
    playPop();
  };

  const handleResetStopwatch = () => {
    setStopwatchActive(false);
    setStopwatchSeconds(0);
    playPop();
  };

  const handleApplyStopwatch = () => {
    const mins = Math.max(1, Math.round(stopwatchSeconds / 60));
    setDuration(mins);
    playPop();
  };

  const formatStopwatch = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setImageUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    playGong();

    createPost({
      workoutType,
      caption: caption || `Crushed my ${workoutType} workout today! Staying accountable to the pact.`,
      imageUrl,
      durationMinutes: Number(duration) || 45,
      distanceKm: distance ? Number(distance) : undefined,
      workoutFocus: workoutFocus || (workoutType === 'Running' ? 'Outdoor Run' : `${workoutType} Session`),
      intensity,
      calories: 350,
      heartRateBpm: 145,
      locationTag,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#121214] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daily Workout Check-In</h3>
              <p className="text-xs text-zinc-400">
                Submitting proof as <span className="text-red-400 font-semibold">{activeUser.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
          {/* Activity Tag Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Select Activity Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WORKOUT_TYPES.map((item) => {
                const isSelected = workoutType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setWorkoutType(item.type);
                      if (item.type === 'Running' && !distance) setDistance(5.0);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-red-500/15 border-red-500 text-white shadow-md shadow-red-950/50 glow-red'
                        : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:bg-[#27272a]'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Proof Submission: Live Upload or Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Workout Photo Proof
              </label>
              <span className="text-[11px] text-zinc-400">Live Camera or Instant Sample</span>
            </div>

            {/* Preview Banner */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-[#27272a] h-52 flex items-center justify-center group">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Proof preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 text-zinc-500">
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No image selected</p>
                </div>
              )}

              {/* Upload file overlay */}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-semibold gap-2 backdrop-blur-xs">
                <Upload className="w-6 h-6" />
                <span>Upload Custom Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 1-Click Quick Preset Selection */}
            <div className="mt-2.5">
              <div className="text-[11px] text-zinc-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-red-400" />
                <span>Or pick from realistic proof presets for quick testing:</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {PRESET_PROOFS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      setWorkoutType(preset.type);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shrink-0 transition-all ${
                      imageUrl === preset.url
                        ? 'bg-red-500/20 border-red-500 text-white'
                        : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {imageUrl === preset.url && <Check className="w-3 h-3 text-red-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Exif / Live Geofence Mock Inspector */}
          <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>EXIF & Geofence Verification Simulation</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">99% Match Verified</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400 font-mono">
              <div>
                <span className="text-zinc-500">Capture Time: </span>
                <span className="text-zinc-200 font-semibold">Today, 07:15 AM (Live Match)</span>
              </div>
              <div>
                <span className="text-zinc-500">Device: </span>
                <span className="text-zinc-200 font-semibold">iPhone 16 Pro Camera API</span>
              </div>
            </div>
            <div className="pt-1">
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Gym / Facility Location Tag:
              </label>
              <input
                type="text"
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                placeholder="e.g. Gold's Gym - Sector 29"
                className="w-full px-3 py-1.5 bg-[#121214] border border-[#27272a] rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Live Workout Stopwatch Widget */}
          <div className="p-4 rounded-2xl bg-[#18181b] text-white border border-[#27272a] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" />
                <span>Live Workout Stopwatch</span>
              </div>
              <div className="text-2xl font-black font-mono text-white mt-0.5">
                {formatStopwatch(stopwatchSeconds)}
              </div>
              <p className="text-[10px] text-zinc-400 font-bold">
                {stopwatchActive ? '⚡ Workout in progress...' : 'Tap start to track exact duration'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleToggleStopwatch}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                  stopwatchActive
                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                    : 'bg-red-600 hover:bg-red-500 text-white glow-red'
                }`}
              >
                {stopwatchActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Timer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetStopwatch}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {stopwatchSeconds >= 10 && (
                <button
                  type="button"
                  onClick={handleApplyStopwatch}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase tracking-wider transition-all shadow-md"
                >
                  ✓ Use as Duration
                </button>
              )}
            </div>
          </div>

          {/* Metrics Inputs */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
              Workout Focus & Intensity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Duration (mins)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min="1"
                    max="300"
                    className="w-full pl-7 pr-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500"
                  />
                  <Timer className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-2" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  {workoutType === 'Running' || workoutType === 'Cycling' ? 'Distance (km)' : 'Muscle Target / Focus'}
                </label>
                {workoutType === 'Running' || workoutType === 'Cycling' ? (
                  <input
                    type="number"
                    step="0.1"
                    value={distance || ''}
                    onChange={(e) => setDistance(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 5.0"
                    className="w-full px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-red-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={workoutFocus}
                    onChange={(e) => setWorkoutFocus(e.target.value)}
                    placeholder="e.g. Chest & Triceps"
                    className="w-full px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Workout Intensity</label>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-xs text-white focus:outline-none focus:border-red-500 font-medium"
                >
                  <option value="High Intensity 🔥">High Intensity 🔥</option>
                  <option value="Heavy PR 💥">Heavy PR 💥</option>
                  <option value="Moderate Effort ⚡">Moderate Effort ⚡</option>
                  <option value="Cardio Burn 🏃">Cardio Burn 🏃</option>
                  <option value="Active Recovery 🧘">Active Recovery 🧘</option>
                </select>
              </div>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
              Caption / Workout Notes
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. 5x5 back squats @ 140kg, strict form. Legs on fire!"
              rows={3}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-900/50 glow-red"
            >
              Publish Proof to Pact Feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
