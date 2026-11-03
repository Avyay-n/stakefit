# StakeFit 🔥
> **Social Fitness Accountability Pact Platform with Financial Stakes, Peer-Verified Activity Check-Ins, Splitwise-Style Settlement Ledgers, and Body Transformation Tracking.**

StakeFit is a high-contrast athletic dark-mode web application engineered to solve fitness accountability through social commitment contracts, peer verification, and automated debt reconciliation.

---

## 🚀 Key Features

### 1. Visual Identity & Athletic Design System
- **Deep Black & Dark Charcoal Canvas:** `#09090b`, `#121214`, and `#18181b` card surfaces with subtle red glow highlights.
- **Bold Crimson Red Accent:** `#ef4444`, `#dc2626` highlighting active streaks, debt alerts, and critical stakes.
- **Emerald Green Accents:** `#22c55e` strictly reserved for completed targets and successful settlements.
- **Micro-Interactions & Celebrations:** Powered by `canvas-confetti` for verified days, dividend wins, and settled debts.

### 2. Group Management & Custom Pacts
- **Private Pacts:** Create private groups, assign custom emblems/avatars, shareable invite links, and group codes (`TITAN-4482`).
- **Flexible Rules:**
  - Weekly targets: 1 to 7 active workout days per week.
  - Rolling cycles resetting every Sunday midnight (with live countdown).
  - Configurable forfeit stake per missed day (₹ INR, $ USD, € EUR, £ GBP).
  - Payout Models:
    1. **Dividend Split:** Missed day forfeits are split among members who met 100% of their target.
    2. **Group Bounty:** Missed day forfeits pool into a shared budget for a group celebration dinner or event.

### 3. Daily Social Proof & Verification Feed
- **Check-In Modal:** Log workout type (Gym, Running, Calisthenics, Swimming, HIIT, Cycling, Sports), duration, distance, calories, and heart rate.
- **Photo Proof & Live EXIF Simulation:** Upload custom photos or choose from 1-click realistic workout presets. Inspects simulated capture time, device, and gym geofence.
- **Peer Verification:** Minimum **2 Vouches** required from peers to verify an active day.
- **Call-Out / Dispute System:** Members can flag suspicious or duplicate photos with reasons for group review.
- **Top Status Bar & Shame Wall:** Real-time avatar ring states:
  - 🟢 **Green:** Verified
  - 🟠 **Orange:** Under Review (pending vouches)
  - ⚪ **Gray:** Yet to log
  - 🔴 **Red:** Defaulted (missed midnight cutoff)

### 4. Financial Ledger & Settlement Engine (Splitwise-Style)
- **Running Balance Sheet:** Avoids upfront escrow friction by tracking running debts and credits.
- **Greedy Splitwise Debt Simplification:** Matches net debtors to net creditors to minimize total peer-to-peer transactions.
- **Instant Settlement Flow:**
  - Dynamic scannable SVG QR Code generated with UPI string.
  - Deep link buttons (`upi://pay?pa=...`) for GPay, PhonePe, Paytm.
  - PayPal & Cash App placeholders.
  - "Mark as Settled" confirmation with reference UTR tracking.

### 5. Habit Mechanics (Streaks & Shields)
- **Consecutive Streak Tracking:** Day & week streaks with flame indicators.
- **Emergency / Rest Shields:** Earn 1 shield every 3 perfect weeks; protects against illness or travel without penalties.
- **Double Down Mode:** Opt in to 2x penalty stake to earn a 2x share of dividend rewards.

### 6. Body Transformation & Progress Tracker
- **Interactive Before vs. After Slider:** Smooth horizontal drag slider comparing Day 1 baseline against latest physique check.
- **Weekly Scale Weight Logger:** SVG trendline chart with moving average and target goal line.
- **Consistency Calendar Heatmap:** 10-week contribution grid showing verified workout consistency.
- **Privacy Controls:** Toggle between "Group Visible" and "Private to Me".

### 7. Interactive Perspective & Simulation Controls
- **Perspective Switcher:** Switch between Rahul Sharma (Admin), Priya Patel (Qualifier), Marcus Chen, Sarah Jenkins (Shielded), and Dev Malik (Defaulted) to test peer vouches, disputes, and debts from any angle.
- **Simulation Bar:**
  - 🌙 *Simulate Midnight Cutoff:* Tests shame wall defaulting.
  - 🏁 *Simulate End of Cycle:* Resolves the week, computes Splitwise debts, and pays out dividends.
  - 🔄 *Reset Demo State:* Restores initial seed data.

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS (v4) with custom glow utilities
- **Icons:** Lucide React
- **Celebration Animations:** Canvas Confetti

---

## 💻 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Or run production preview
npm run build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
