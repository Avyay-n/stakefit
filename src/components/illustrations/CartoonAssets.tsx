import React from 'react';

// Cartoon 3D-Style Dumbbell with gloss reflections and sweat droplets
export const CartoonDumbbell: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Motion/Energy Lines */}
    <path
      d="M18 35C14 42 12 52 14 62"
      stroke="#ef4444"
      strokeWidth="3.5"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path
      d="M102 85C106 78 108 68 106 58"
      stroke="#ef4444"
      strokeWidth="3.5"
      strokeLinecap="round"
      opacity="0.8"
    />

    {/* Center Barbell Grip */}
    <rect
      x="36"
      y="54"
      width="48"
      height="12"
      rx="6"
      fill="#404045"
      stroke="#18181b"
      strokeWidth="3"
    />
    {/* Grip knurling rings */}
    <line x1="50" y1="55" x2="50" y2="65" stroke="#71717a" strokeWidth="2" />
    <line x1="56" y1="55" x2="56" y2="65" stroke="#71717a" strokeWidth="2" />
    <line x1="64" y1="55" x2="64" y2="65" stroke="#71717a" strokeWidth="2" />
    <line x1="70" y1="55" x2="70" y2="65" stroke="#71717a" strokeWidth="2" />

    {/* Left Outer Plate (Chunky Red) */}
    <rect
      x="12"
      y="30"
      width="14"
      height="60"
      rx="7"
      fill="#dc2626"
      stroke="#18181b"
      strokeWidth="3.5"
    />
    {/* Left Inner Plate */}
    <rect
      x="24"
      y="38"
      width="12"
      height="44"
      rx="6"
      fill="#ef4444"
      stroke="#18181b"
      strokeWidth="3.5"
    />
    {/* Left Plate Highlight */}
    <path
      d="M15 36C15 34 16 33 18 33C20 33 21 34 21 36V50C21 52 20 53 18 53C16 53 15 52 15 50V36Z"
      fill="white"
      opacity="0.5"
    />

    {/* Right Outer Plate (Chunky Red) */}
    <rect
      x="94"
      y="30"
      width="14"
      height="60"
      rx="7"
      fill="#dc2626"
      stroke="#18181b"
      strokeWidth="3.5"
    />
    {/* Right Inner Plate */}
    <rect
      x="84"
      y="38"
      width="12"
      height="44"
      rx="6"
      fill="#ef4444"
      stroke="#18181b"
      strokeWidth="3.5"
    />
    {/* Right Plate Highlight */}
    <path
      d="M97 36C97 34 98 33 100 33C102 33 103 34 103 36V50C103 52 102 53 100 53C98 53 97 52 97 50V36Z"
      fill="white"
      opacity="0.5"
    />

    {/* Flying Cartoon Sweat Droplet 1 */}
    <path
      d="M32 24C32 24 38 28 38 32C38 35.3 35.3 38 32 38C28.7 38 26 35.3 26 32C26 28 32 24 32 24Z"
      fill="#38bdf8"
      stroke="#0284c7"
      strokeWidth="1.5"
    />
    {/* Flying Cartoon Sweat Droplet 2 */}
    <path
      d="M90 20C90 20 95 24 95 27C95 29.8 92.8 32 90 32C87.2 32 85 29.8 85 27C85 24 90 20 90 20Z"
      fill="#38bdf8"
      stroke="#0284c7"
      strokeWidth="1.5"
    />

    {/* Sparkle Glint */}
    <path
      d="M60 40L62 46L68 48L62 50L60 56L58 50L52 48L58 46L60 40Z"
      fill="#fde047"
    />
  </svg>
);

// Cartoon Flying Banknotes & Cash Stack
export const CartoonMoneyStack: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Back Cash Bill (Tilted) */}
    <g transform="rotate(-12 60 60)">
      <rect
        x="24"
        y="42"
        width="66"
        height="36"
        rx="6"
        fill="#15803d"
        stroke="#14532d"
        strokeWidth="3"
      />
      <circle cx="57" cy="60" r="10" fill="#22c55e" opacity="0.6" />
      <text x="57" y="65" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif">₹</text>
    </g>

    {/* Middle Cash Bill (Tilted opposite) */}
    <g transform="rotate(8 60 60)">
      <rect
        x="26"
        y="44"
        width="66"
        height="36"
        rx="6"
        fill="#16a34a"
        stroke="#14532d"
        strokeWidth="3"
      />
      <circle cx="59" cy="62" r="10" fill="#4ade80" opacity="0.7" />
      <text x="59" y="67" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900" fontFamily="sans-serif">₹</text>
    </g>

    {/* Front Crisp Cash Bill with Wings */}
    {/* Left Wing */}
    <path
      d="M20 50C10 42 4 52 8 62C12 70 24 64 24 64"
      fill="#e0f2fe"
      stroke="#0284c7"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M10 52C16 55 20 60 20 60"
      stroke="#0284c7"
      strokeWidth="1.5"
    />

    {/* Right Wing */}
    <path
      d="M100 50C110 42 116 52 112 62C108 70 96 64 96 64"
      fill="#e0f2fe"
      stroke="#0284c7"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M110 52C104 55 100 60 100 60"
      stroke="#0284c7"
      strokeWidth="1.5"
    />

    {/* Front Bill Body */}
    <rect
      x="27"
      y="48"
      width="66"
      height="36"
      rx="6"
      fill="#22c55e"
      stroke="#14532d"
      strokeWidth="3.5"
    />
    {/* Bill Border Detail */}
    <rect
      x="31"
      y="52"
      width="58"
      height="28"
      rx="4"
      fill="none"
      stroke="#86efac"
      strokeWidth="1.5"
      strokeDasharray="4 2"
    />
    {/* Center Emblem */}
    <circle cx="60" cy="66" r="10" fill="#15803d" stroke="#86efac" strokeWidth="2" />
    <text x="60" y="71" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="900" fontFamily="sans-serif">₹</text>

    {/* Floating Coin Left */}
    <circle cx="20" cy="85" r="9" fill="#eab308" stroke="#713f12" strokeWidth="2.5" />
    <circle cx="20" cy="85" r="6" fill="#facc15" />
    <text x="20" y="89" textAnchor="middle" fill="#713f12" fontSize="9" fontWeight="900">₹</text>

    {/* Floating Coin Right */}
    <circle cx="100" cy="82" r="11" fill="#eab308" stroke="#713f12" strokeWidth="2.5" />
    <circle cx="100" cy="82" r="8" fill="#facc15" />
    <text x="100" y="86" textAnchor="middle" fill="#713f12" fontSize="11" fontWeight="900">₹</text>

    {/* Sparkle */}
    <path
      d="M78 32L80 38L86 40L80 42L78 48L76 42L70 40L76 38L78 32Z"
      fill="#facc15"
    />
  </svg>
);

// Cartoon Chunky Gold Coin
export const CartoonGoldCoin: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Drop shadow edge */}
    <ellipse cx="40" cy="44" rx="32" ry="32" fill="#854d0e" />
    {/* Main Coin Body */}
    <circle cx="40" cy="40" r="32" fill="#eab308" stroke="#713f12" strokeWidth="4" />
    {/* Inner Bevel Rim */}
    <circle cx="40" cy="40" r="24" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
    {/* Specular Gleam */}
    <path
      d="M22 28C26 20 34 16 44 16"
      stroke="#ffffff"
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.8"
    />
    {/* Currency Symbol */}
    <text
      x="40"
      y="50"
      textAnchor="middle"
      fill="#713f12"
      fontSize="28"
      fontWeight="900"
      fontFamily="sans-serif"
    >
      ₹
    </text>
    {/* Sparkle Star */}
    <path
      d="M62 18L64 24L70 26L64 28L62 34L60 28L54 26L60 24L62 18Z"
      fill="#ffffff"
    />
  </svg>
);

// Cartoon One Piece Pirate Skull with Crossed Barbells
export const CartoonShameSkull: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Crossed Barbell 1 (Diagonal Left to Right) */}
    <g transform="rotate(45 60 60)">
      <rect x="20" y="55" width="80" height="10" rx="5" fill="#52525b" stroke="#18181b" strokeWidth="3" />
      <rect x="10" y="44" width="12" height="32" rx="4" fill="#dc2626" stroke="#18181b" strokeWidth="3" />
      <rect x="98" y="44" width="12" height="32" rx="4" fill="#dc2626" stroke="#18181b" strokeWidth="3" />
    </g>

    {/* Crossed Barbell 2 (Diagonal Right to Left) */}
    <g transform="rotate(-45 60 60)">
      <rect x="20" y="55" width="80" height="10" rx="5" fill="#52525b" stroke="#18181b" strokeWidth="3" />
      <rect x="10" y="44" width="12" height="32" rx="4" fill="#dc2626" stroke="#18181b" strokeWidth="3" />
      <rect x="98" y="44" width="12" height="32" rx="4" fill="#dc2626" stroke="#18181b" strokeWidth="3" />
    </g>

    {/* Skull Head */}
    <ellipse cx="60" cy="54" rx="28" ry="24" fill="#ffffff" stroke="#18181b" strokeWidth="4" />
    {/* Jaw */}
    <path
      d="M44 68H76V82C76 85 73 88 70 88H50C47 88 44 85 44 82V68Z"
      fill="#ffffff"
      stroke="#18181b"
      strokeWidth="4"
    />

    {/* Eye Sockets */}
    <ellipse cx="48" cy="56" rx="7" ry="9" fill="#18181b" />
    <ellipse cx="72" cy="56" rx="7" ry="9" fill="#18181b" />
    {/* Eye sparkles */}
    <circle cx="46" cy="53" r="2" fill="#ef4444" />
    <circle cx="70" cy="53" r="2" fill="#ef4444" />

    {/* Nose Hole */}
    <path d="M57 66L60 62L63 66Z" fill="#18181b" />

    {/* Teeth Lines */}
    <line x1="52" y1="74" x2="52" y2="84" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
    <line x1="60" y1="74" x2="60" y2="84" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />
    <line x1="68" y1="74" x2="68" y2="84" stroke="#18181b" strokeWidth="3" strokeLinecap="round" />

    {/* One Piece Straw Hat / Red Pirate Bandana */}
    <path
      d="M32 44C32 44 48 30 60 30C72 30 88 44 88 44C88 44 76 38 60 38C44 38 32 44 32 44Z"
      fill="#dc2626"
      stroke="#18181b"
      strokeWidth="3.5"
    />
    <circle cx="34" cy="46" r="4" fill="#ffffff" />
    <circle cx="86" cy="46" r="4" fill="#ffffff" />
  </svg>
);

// Cartoon Streak Shield (Duolingo style defense shield)
export const CartoonStreakShield: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Glow shadow */}
    <path
      d="M50 14L84 26V54C84 72 68 86 50 92C32 86 16 72 16 54V26L50 14Z"
      fill="#0284c7"
      opacity="0.3"
    />
    {/* Outer Shield (Dark Blue) */}
    <path
      d="M50 10L82 22V50C82 68 66 82 50 88C34 82 18 68 18 50V22L50 10Z"
      fill="#0284c7"
      stroke="#082f49"
      strokeWidth="4"
    />
    {/* Inner Shield (Vibrant Cyan) */}
    <path
      d="M50 18L74 27V48C74 62 62 74 50 78C38 74 26 62 26 48V27L50 18Z"
      fill="#38bdf8"
      stroke="#0284c7"
      strokeWidth="2"
    />
    {/* Specular Highlight */}
    <path
      d="M32 30C32 30 40 24 50 24V74C42 70 32 60 32 48V30Z"
      fill="#ffffff"
      opacity="0.35"
    />
    {/* Lightning Bolt Center */}
    <path
      d="M52 28L40 46H50L46 66L62 44H50L54 28H52Z"
      fill="#facc15"
      stroke="#713f12"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

// Cartoon Trophy Cup with Confetti
export const CartoonTrophy: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Left Handle */}
    <path
      d="M32 34C18 34 16 50 28 56C34 58 38 52 38 52"
      fill="none"
      stroke="#ca8a04"
      strokeWidth="5"
      strokeLinecap="round"
    />
    {/* Right Handle */}
    <path
      d="M68 34C82 34 84 50 72 56C66 58 62 52 62 52"
      fill="none"
      stroke="#ca8a04"
      strokeWidth="5"
      strokeLinecap="round"
    />

    {/* Trophy Cup Body */}
    <path
      d="M30 24H70V44C70 56 60 64 50 64C40 64 30 56 30 44V24Z"
      fill="#facc15"
      stroke="#713f12"
      strokeWidth="4"
    />
    {/* Inner Cup Shading */}
    <path
      d="M36 28H64V44C64 52 58 58 50 58C42 58 36 52 36 44V28Z"
      fill="#eab308"
    />
    {/* Specular Highlight */}
    <path
      d="M36 30C36 30 40 48 46 54"
      stroke="#ffffff"
      strokeWidth="3.5"
      strokeLinecap="round"
      opacity="0.7"
    />

    {/* Stem */}
    <rect x="46" y="64" width="8" height="12" fill="#ca8a04" stroke="#713f12" strokeWidth="3" />

    {/* Base Pedestal */}
    <rect x="34" y="76" width="32" height="14" rx="4" fill="#713f12" stroke="#18181b" strokeWidth="3" />
    <rect x="40" y="80" width="20" height="6" rx="2" fill="#ca8a04" />

    {/* Star Emblem on Cup */}
    <path
      d="M50 36L52 41L57 41L53 44L55 49L50 46L45 49L47 44L43 41L48 41L50 36Z"
      fill="#ffffff"
      stroke="#713f12"
      strokeWidth="1.5"
    />

    {/* Confetti Sparks */}
    <circle cx="20" cy="22" r="3" fill="#ef4444" />
    <circle cx="82" cy="24" r="3" fill="#38bdf8" />
    <rect x="76" y="14" width="5" height="5" fill="#facc15" transform="rotate(25 76 14)" />
    <rect x="24" y="14" width="5" height="5" fill="#22c55e" transform="rotate(-30 24 14)" />
  </svg>
);

