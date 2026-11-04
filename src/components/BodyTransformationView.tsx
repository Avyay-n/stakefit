import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PactCalendar } from './PactCalendar';
import {
  Sliders,
  Scale,
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

  // SVG Weight Graph Calculations with clear Y-axis bounds
  const history = activeUser.weightHistory || [
    { id: 'w-1', date: '2026-09-29', weightKg: 82.5, isPrivate: false },
    { id: 'w-2', date: '2026-10-06', weightKg: 81.3, isPrivate: false },
    { id: 'w-3', date: '2026-10-13', weightKg: 80.2, isPrivate: false },
    { id: 'w-4', date: '2026-10-20', weightKg: 79.4, isPrivate: false },
    { id: 'w-5', date: '2026-10-27', weightKg: 78.7, isPrivate: false },
    { id: 'w-6', date: '2026-11-03', weightKg: 78.1, isPrivate: false },
  ];

  const yMin = 72; // Below target goal of 74
  const yMax = 86; // Above start of 82.5
  const yRange = yMax - yMin;

  const graphWidth = 560;
  const graphHeight = 220;
  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartInnerWidth = graphWidth - paddingLeft - paddingRight;
  const chartInnerHeight = graphHeight - paddingTop - paddingBottom;

  const points = history.map((item, index) => {
    const x = paddingLeft + (index / Math.max(1, history.length - 1)) * chartInnerWidth;
    const y = paddingTop + chartInnerHeight - ((item.weightKg - yMin) / yRange) * chartInnerHeight;
    const dateFormatted = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { x, y, dateFormatted, weekNum: index + 1, ...item };
  });

  const polylinePath = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Y-axis grid increments: 85, 82, 79, 76, 74 (target)
  const yAxisTicks = [85, 82, 79, 76, 74];

  return (
    <div className="space-y-6">
      {/* Transformation Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-xl">
          <div className="text-[11px] font-black text-red-500 uppercase tracking-wider">
            Total Weight Delta
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1 flex items-center gap-1">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <span>{weightDelta} kg</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-bold mt-1">
            {activeUser.baselineWeightKg}kg → {activeUser.currentWeightKg}kg
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-xl">
          <div className="text-[11px] font-black text-red-500 uppercase tracking-wider">
            Body Fat %
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
            {activeUser.bodyFatPctCurrent}%
          </div>
          <div className="text-[11px] text-zinc-400 font-bold mt-1">
            {bodyFatDelta}% since kickoff
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-xl">
          <div className="text-[11px] font-black text-red-500 uppercase tracking-wider">
            Target Goal
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">
            {activeUser.targetWeightKg} kg
          </div>
          <div className="text-[11px] text-zinc-400 font-bold mt-1">
            {(activeUser.currentWeightKg - activeUser.targetWeightKg).toFixed(1)}kg to reach goal
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121214] border border-[#27272a] shadow-xl">
          <div className="text-[11px] font-black text-red-500 uppercase tracking-wider">
            Pact Adherence
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-red-500 text-red-500" />
            <span>94.2%</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-bold mt-1">
            28-day active streak
          </div>
        </div>
      </div>

      {/* Before / After Interactive Photo Split Slider */}
      <div className="bg-[#121214] border border-[#27272a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-500" />
              <span>Physique Progress Before vs. After</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Drag slider left or right to compare baseline Day 1 against latest physique check
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-300 bg-[#18181b] px-3 py-1 rounded-lg border border-[#27272a]">
              {activeUser.baselineDate} vs {activeUser.currentDate}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
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
          className="relative w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden cursor-ew-resize select-none border border-[#27272a] bg-black shadow-inner"
        >
          {/* AFTER Image (Background full width) */}
          <div className="absolute inset-0">
            <img
              src={activeUser.currentPhotoUrl}
              alt="Current Physique (After)"
              className="w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/85 border border-emerald-500/50 backdrop-blur-md text-emerald-400 text-xs font-bold font-mono shadow-lg">
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
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/85 border border-zinc-700 backdrop-blur-md text-zinc-300 text-xs font-bold font-mono shadow-lg">
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
        {/* Weight Trend Chart with Complete Professional Labels */}
        <div className="bg-[#121214] border border-[#27272a] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#27272a] pb-3">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Body Weight Progression (kg)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Weekly weigh-in trajectory plotted toward 74.0 kg goal
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2.5 py-1 rounded-lg">
                {weightDelta} kg Lost (-5.3%)
              </span>
            </div>
          </div>

          {/* Clear Graph Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono font-bold bg-[#18181b] p-2.5 rounded-xl border border-[#27272a]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-1 bg-emerald-500 rounded-full" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span>Logged Weight (kg)</span>
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500" />
                <span>Goal Target (74 kg)</span>
              </span>
            </div>
            <span className="text-zinc-400">
              Pace: <strong className="text-white">-0.7 kg/week</strong>
            </span>
          </div>

          {/* SVG Chart with Full X and Y Axis Labels */}
          <div className="pt-2">
            <svg
              viewBox={`0 0 ${graphWidth} ${graphHeight}`}
              className="w-full h-52 overflow-visible select-none"
            >
              {/* Y-Axis Grid Lines & Kg Labels */}
              {yAxisTicks.map((tickVal) => {
                const tickY = paddingTop + chartInnerHeight - ((tickVal - yMin) / yRange) * chartInnerHeight;
                const isTarget = tickVal === 74;
                return (
                  <g key={tickVal}>
                    <line
                      x1={paddingLeft}
                      y1={tickY}
                      x2={graphWidth - paddingRight}
                      y2={tickY}
                      stroke={isTarget ? '#ef4444' : '#27272a'}
                      strokeWidth={isTarget ? '1.5' : '1'}
                      strokeDasharray={isTarget ? '5 4' : '3 3'}
                    />
                    <text
                      x={paddingLeft - 10}
                      y={tickY + 4}
                      textAnchor="end"
                      className={`text-[10px] font-mono font-bold ${
                        isTarget ? 'fill-red-400 font-black' : 'fill-zinc-500'
                      }`}
                    >
                      {tickVal} kg
                    </text>
                    {isTarget && (
                      <text
                        x={graphWidth - paddingRight}
                        y={tickY - 6}
                        textAnchor="end"
                        className="fill-red-400 text-[10px] font-mono font-black"
                      >
                        TARGET GOAL (74.0 kg)
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Y-Axis Label */}
              <text
                x={12}
                y={paddingTop + chartInnerHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90 12 ${paddingTop + chartInnerHeight / 2})`}
                className="fill-zinc-500 text-[10px] font-mono uppercase font-bold tracking-widest"
              >
                Weight (kg)
              </text>

              {/* Trend Polyline */}
              <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePath}
              />

              {/* Data points with Exact Kg Values and X-Axis Date/Week Labels */}
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  {/* Vertical drop line to X-axis */}
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={p.x}
                    y2={paddingTop + chartInnerHeight}
                    stroke="#27272a"
                    strokeDasharray="2 2"
                  />

                  {/* Weight Data Bubble / Point */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5.5"
                    className="fill-emerald-400 stroke-[#121214] stroke-2 hover:r-7 transition-all"
                  />

                  {/* Weight Label above point (Clear "kg" instead of confusing "k") */}
                  <rect
                    x={p.x - 22}
                    y={p.y - 24}
                    width={44}
                    height={16}
                    rx={4}
                    className="fill-[#18181b] stroke-emerald-500/40 stroke-1 shadow-md"
                  />
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    className="fill-white text-[10px] font-mono font-black"
                  >
                    {p.weightKg} kg
                  </text>

                  {/* X-Axis Week Label */}
                  <text
                    x={p.x}
                    y={paddingTop + chartInnerHeight + 16}
                    textAnchor="middle"
                    className="fill-zinc-300 text-[10px] font-mono font-bold"
                  >
                    Wk {p.weekNum}
                  </text>
                  {/* X-Axis Date Label */}
                  <text
                    x={p.x}
                    y={paddingTop + chartInnerHeight + 28}
                    textAnchor="middle"
                    className="fill-zinc-500 text-[9px] font-mono"
                  >
                    {p.dateFormatted}
                  </text>
                </g>
              ))}
            </svg>

            {/* Bottom summary bar */}
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-3 border-t border-[#27272a] mt-2">
              <span>Start: <strong className="text-white">82.5 kg</strong> (Sep 29)</span>
              <span>Latest: <strong className="text-emerald-400">78.1 kg</strong> (Nov 03)</span>
              <span>Goal: <strong className="text-red-400">74.0 kg</strong> (4.1 kg left)</span>
            </div>
          </div>
        </div>

        {/* Interactive Pact Activity Calendar with Days & Dates */}
        <PactCalendar />
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
