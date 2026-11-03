import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  Scale,
  Calendar,
  Lock,
  Eye,
  Plus,
  Flame,
  TrendingDown,
  X,
  Upload,
} from 'lucide-react';

export const BodyTransformationView: React.FC = () => {
  const { activeUser, logWeighIn } = useApp();

  // Before/After Split Slider State
  const [sliderPosition, setSliderPosition] = useState(50); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Weigh-in modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputWeight, setInputWeight] = useState(activeUser.currentWeightKg.toString());
  const [inputBodyFat, setInputBodyFat] = useState(activeUser.bodyFatPctCurrent.toString());
  const [inputWaist, setInputWaist] = useState('80');
  const [inputNotes, setInputNotes] = useState('');
  const [inputPhotoUrl, setInputPhotoUrl] = useState(activeUser.currentPhotoUrl);
  const [isPrivate, setIsPrivate] = useState(false);

  // Drag handlers for before/after split slider
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logWeighIn({
      date: new Date().toISOString().split('T')[0],
      weightKg: Number(inputWeight),
      bodyFatPct: inputBodyFat ? Number(inputBodyFat) : undefined,
      waistCm: inputWaist ? Number(inputWaist) : undefined,
      notes: inputNotes || 'Weekly progress weigh-in',
      photoUrl: inputPhotoUrl,
      isPrivate,
    });
    setIsModalOpen(false);
  };

  // Metrics deltas
  const weightDelta = (activeUser.currentWeightKg - activeUser.baselineWeightKg).toFixed(1);
  const bodyFatDelta = (activeUser.bodyFatPctCurrent - activeUser.bodyFatPctBaseline).toFixed(1);

  // SVG Weight Graph Calculations
  const history = activeUser.weightHistory || [];
  const minWeight = Math.min(...history.map((h) => h.weightKg), activeUser.targetWeightKg) - 2;
  const maxWeight = Math.max(...history.map((h) => h.weightKg), activeUser.baselineWeightKg) + 2;
  const weightRange = maxWeight - minWeight || 1;

  const graphWidth = 500;
  const graphHeight = 160;

  const points = history.map((item, index) => {
    const x = (index / Math.max(1, history.length - 1)) * (graphWidth - 40) + 20;
    const y = graphHeight - 20 - ((item.weightKg - minWeight) / weightRange) * (graphHeight - 40);
    return { x, y, ...item };
  });

  const polylinePath = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Consistency calendar days (last 70 days simulation)
  const calendarDays = Array.from({ length: 70 }).map((_, idx) => {
    // Verified workouts scattered realistically
    const isCompleted = (idx % 7 !== 2 && idx % 7 !== 5) && idx > 8;
    return {
      day: idx,
      isCompleted,
    };
  });

  return (
    <div className="space-y-6">
      {/* Transformation Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-lg">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Total Weight Delta
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <span>{weightDelta} kg</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {activeUser.baselineWeightKg}kg → {activeUser.currentWeightKg}kg
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-lg">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Body Fat %
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-red-400 mt-1">
            {activeUser.bodyFatPctCurrent}%
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {bodyFatDelta}% since kickoff
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-lg">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Target Goal
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
            {activeUser.targetWeightKg} kg
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {(activeUser.currentWeightKg - activeUser.targetWeightKg).toFixed(1)}kg to reach goal
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-lg">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Pact Adherence
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-amber-500" />
            <span>94.2%</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            28-day active streak
          </div>
        </div>
      </div>

      {/* Before / After Interactive Photo Split Slider */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <span>Interactive Physique Before vs. After Slider</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Drag slider left or right to compare baseline Day 1 against latest physique check
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 bg-[#18181b] px-3 py-1 rounded-lg border border-[#27272a]">
              {activeUser.baselineDate} vs {activeUser.currentDate}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md glow-red"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Weigh-In</span>
            </button>
          </div>
        </div>

        {/* Interactive Comparison Container */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className="relative w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-[#27272a] bg-black shadow-inner"
        >
          {/* AFTER Image (Background full width) */}
          <div className="absolute inset-0">
            <img
              src={activeUser.currentPhotoUrl}
              alt="Current Physique (After)"
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/75 border border-emerald-500/50 backdrop-blur-md text-emerald-400 text-xs font-bold font-mono shadow-lg">
              CURRENT ({activeUser.currentWeightKg} kg • {activeUser.bodyFatPctCurrent}% BF)
            </div>
          </div>

          {/* BEFORE Image (Clipped by slider position) */}
          <div
            className="absolute inset-y-0 left-0 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <div
              className="relative h-full pointer-events-none"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              }}
            >
              <img
                src={activeUser.baselinePhotoUrl}
                alt="Baseline Physique (Before)"
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/75 border border-zinc-700 backdrop-blur-md text-zinc-300 text-xs font-bold font-mono shadow-lg">
                DAY 1 BASELINE ({activeUser.baselineWeightKg} kg • {activeUser.bodyFatPctBaseline}% BF)
              </div>
            </div>
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute inset-y-0 w-0.5 bg-red-500 shadow-2xl z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center glow-red text-white">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] font-mono text-zinc-400">
          💡 Click and drag the red divider horizontally to inspect muscle definition and posture changes
        </div>
      </div>

      {/* Scale Weight Progress Chart & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Trend Chart */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Weekly Scale Weight Trendline</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Weekly weigh-ins with goal trajectory line
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2.5 py-1 rounded-lg">
              {weightDelta} kg Overall
            </span>
          </div>

          {/* SVG Chart */}
          <div className="pt-2">
            <svg
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              className="w-full h-44 overflow-visible"
            >
              {/* Grid lines */}
              <line x1="20" y1="20" x2={graphWidth - 20} y2="20" stroke="#27272a" strokeDasharray="3 3" />
              <line x1="20" y1="80" x2={graphWidth - 20} y2="80" stroke="#27272a" strokeDasharray="3 3" />
              <line x1="20" y1={graphHeight - 20} x2={graphWidth - 20} y2={graphHeight - 20} stroke="#27272a" />

              {/* Target Goal Line */}
              {(() => {
                const goalY =
                  graphHeight - 20 - ((activeUser.targetWeightKg - minWeight) / weightRange) * (graphHeight - 40);
                return (
                  <line
                    x1="20"
                    y1={goalY}
                    x2={graphWidth - 20}
                    y2={goalY}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                );
              })()}

              {/* Trend Polyline */}
              <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePath}
              />

              {/* Data points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    className="fill-emerald-400 stroke-[#121214] stroke-2 hover:r-7 transition-all cursor-pointer"
                  />
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className="fill-zinc-300 text-[10px] font-mono font-bold"
                  >
                    {p.weightKg}k
                  </text>
                </g>
              ))}
            </svg>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-[#27272a]">
              <span>Kickoff: {history[0]?.date || 'Sep 29'}</span>
              <span className="flex items-center gap-1 text-red-400">
                <span className="w-2 h-0.5 bg-red-500 inline-block" />
                Target Goal ({activeUser.targetWeightKg} kg)
              </span>
              <span>Latest: {history[history.length - 1]?.date || 'Nov 03'}</span>
            </div>
          </div>
        </div>

        {/* Consistency Calendar Heatmap */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>Pact Consistency Heatmap (10 Weeks)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Peer-verified activity check-in days
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
              <span className="w-2.5 h-2.5 rounded bg-[#18181b] border border-zinc-700" />
              <span>Rest</span>
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Verified</span>
            </div>
          </div>

          <div className="grid grid-flow-col grid-rows-7 gap-1.5 pt-2 overflow-x-auto">
            {calendarDays.map((d) => (
              <div
                key={d.day}
                title={d.isCompleted ? `Day ${d.day + 1}: Verified Workout ✓` : `Day ${d.day + 1}: Rest Day`}
                className={`w-3.5 h-3.5 rounded-xs transition-colors cursor-pointer ${
                  d.isCompleted
                    ? 'bg-emerald-500 hover:bg-emerald-400 shadow-xs'
                    : 'bg-[#18181b] border border-zinc-800 hover:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pt-3 border-t border-[#27272a]">
            <span>Active Streak: <strong className="text-amber-400">{activeUser.streakDays} Days</strong></span>
            <span>Completed Sessions: <strong className="text-emerald-400">46 Verified</strong></span>
          </div>
        </div>
      </div>

      {/* Log Weigh-In Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#121214] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Log Weekly Weigh-In</h3>
                  <p className="text-xs text-zinc-400">Track weight & update comparison photos</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Scale Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                    Body Fat % (Est.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={inputBodyFat}
                    onChange={(e) => setInputBodyFat(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Waist Measurement (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={inputWaist}
                  onChange={(e) => setInputWaist(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={inputNotes}
                  onChange={(e) => setInputNotes(e.target.value)}
                  placeholder="e.g. Weigh-in fasted before morning coffee"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Physique Photo Upload in Modal */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                  Physique Check Photo
                </label>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#18181b] border border-[#27272a]">
                  <img
                    src={inputPhotoUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-medium cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setInputPhotoUrl(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Privacy Toggle */}
              <div className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isPrivate ? (
                    <Lock className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-emerald-400" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white">
                      {isPrivate ? 'Private to Me Only' : 'Visible to Group Members'}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {isPrivate
                        ? 'Photos and numbers hidden from feed'
                        : 'Inspire your group mates with progress'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    isPrivate
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {isPrivate ? 'Private' : 'Group'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md glow-red"
                >
                  Save Weigh-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
