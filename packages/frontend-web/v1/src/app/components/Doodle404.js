'use client';

import React, { useState } from 'react';

export default function Doodle404() {
  const [isHovered, setIsHovered] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 1200);
      }}
      role="img"
      aria-label="Cute lost crypto astronaut doodle floating in space"
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 auto 12px',
        position: 'relative',
      }}
    >
      <svg
        viewBox="0 0 380 260"
        style={{
          width: 'min(380px, 86vw)',
          height: 'auto',
          overflow: 'visible',
          filter: isHovered
            ? 'drop-shadow(0 16px 28px rgba(15,15,15,0.08))'
            : 'drop-shadow(0 8px 16px rgba(15,15,15,0.04))',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease',
          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        <defs>
          {/* Subtle gradient for paper-like glow on astronaut helmet */}
          <linearGradient id="visorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <linearGradient id="tokenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>

        <style>{`
          @keyframes doodleFloat {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-9px) rotate(1.5deg);
            }
          }

          @keyframes doodleOrbit {
            0% {
              transform: translateY(0) rotate(0deg);
            }
            50% {
              transform: translateY(-6px) rotate(-8deg);
            }
            100% {
              transform: translateY(0) rotate(0deg);
            }
          }

          @keyframes doodleBlink {
            0%, 94%, 100% { transform: scaleY(1); }
            96% { transform: scaleY(0.1); }
          }

          @keyframes starTwinkle {
            0%, 100% { opacity: 0.25; transform: scale(0.85); }
            50% { opacity: 0.95; transform: scale(1.15); }
          }

          @keyframes pulseChart {
            0%, 100% { stroke-dashoffset: 0; }
            50% { stroke-dashoffset: 14; }
          }

          @keyframes antennaWave {
            0%, 100% { transform: rotate(0deg); }
            35% { transform: rotate(18deg); }
            70% { transform: rotate(-14deg); }
          }

          @keyframes paperFoldShake {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-2px) rotate(3deg); }
            75% { transform: translateY(2px) rotate(-3deg); }
          }

          .doodle-character {
            animation: doodleFloat 3.8s ease-in-out infinite;
            transform-origin: 190px 140px;
          }

          .floating-token {
            animation: doodleOrbit 4.5s ease-in-out infinite;
            transform-origin: center;
          }

          .twinkle-star-1 { animation: starTwinkle 2.2s ease-in-out infinite 0.1s; transform-origin: center; }
          .twinkle-star-2 { animation: starTwinkle 2.8s ease-in-out infinite 0.9s; transform-origin: center; }
          .twinkle-star-3 { animation: starTwinkle 3.1s ease-in-out infinite 0.4s; transform-origin: center; }

          .chart-line-anim {
            stroke-dasharray: 6 4;
            animation: pulseChart 3s linear infinite;
          }

          .antenna-bob {
            animation: antennaWave 2.5s ease-in-out infinite;
            transform-origin: 190px 72px;
          }

          .spark-hover {
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>

        {/* Ambient Floating Doodle Stars & Orbs */}
        <g opacity="0.8">
          {/* Star 1 (Left top) */}
          <g className="twinkle-star-1" style={{ transformBox: 'fill-box' }}>
            <path
              d="M 54 48 L 57 38 L 60 48 L 70 51 L 60 54 L 57 64 L 54 54 L 44 51 Z"
              fill="#0F0F0F"
              opacity="0.18"
            />
          </g>

          {/* Star 2 (Right top) */}
          <g className="twinkle-star-2" style={{ transformBox: 'fill-box' }}>
            <path
              d="M 324 64 L 326.5 56 L 329 64 L 337 66.5 L 329 69 L 326.5 77 L 324 69 L 316 66.5 Z"
              fill="#0F0F0F"
              opacity="0.22"
            />
          </g>

          {/* Star 3 (Bottom left) */}
          <g className="twinkle-star-3" style={{ transformBox: 'fill-box' }}>
            <path
              d="M 68 186 L 70 180 L 72 186 L 78 188 L 72 190 L 70 196 L 68 190 L 62 188 Z"
              fill="#0F0F0F"
              opacity="0.16"
            />
          </g>

          {/* Dotted little orbit arcs in hand-drawn doodle style */}
          <path
            d="M 40 120 Q 90 70 160 82"
            stroke="#0F0F0F"
            strokeWidth="1.8"
            strokeDasharray="4 6"
            strokeLinecap="round"
            fill="none"
            opacity="0.16"
          />

          <path
            d="M 230 195 Q 295 190 340 140"
            stroke="#0F0F0F"
            strokeWidth="1.8"
            strokeDasharray="4 6"
            strokeLinecap="round"
            fill="none"
            opacity="0.16"
          />

          {/* Mini planet doodle */}
          <circle cx="320" cy="180" r="14" fill="none" stroke="#0F0F0F" strokeWidth="2" strokeDasharray="3 3" opacity="0.28" />
          <ellipse cx="320" cy="180" rx="22" ry="5" fill="none" stroke="#0F0F0F" strokeWidth="1.8" opacity="0.22" transform="rotate(-15 320 180)" />
        </g>

        {/* Big stylized 404 outlined numbers in hand-drawn doodle style in background */}
        <g opacity="0.18">
          <text
            x="42"
            y="170"
            fontFamily="monospace, var(--font-sans), sans-serif"
            fontSize="108"
            fontWeight="900"
            fill="none"
            stroke="#0F0F0F"
            strokeWidth="2.5"
            strokeLinejoin="round"
            letterSpacing="-4px"
          >
            4
          </text>
          <text
            x="272"
            y="170"
            fontFamily="monospace, var(--font-sans), sans-serif"
            fontSize="108"
            fontWeight="900"
            fill="none"
            stroke="#0F0F0F"
            strokeWidth="2.5"
            strokeLinejoin="round"
            letterSpacing="-4px"
          >
            4
          </text>
        </g>

        {/* Floating Paper Token Doodle (Left side) */}
        <g className="floating-token" style={{ transformBox: 'fill-box' }}>
          <g transform="translate(48, 102)">
            {/* Paper coin badge */}
            <circle cx="24" cy="24" r="20" fill="#FFFDF8" stroke="#0F0F0F" strokeWidth="2.2" />
            <circle cx="24" cy="24" r="16" fill="url(#tokenGlow)" opacity="0.5" stroke="#0F0F0F" strokeWidth="1" strokeDasharray="2 2" />
            <text x="24" y="29" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0F0F0F" fontFamily="monospace">
              P
            </text>
            {/* Wing / Paper fold */}
            <path d="M 40 16 Q 48 10 46 22 Z" fill="#F8F6F1" stroke="#0F0F0F" strokeWidth="2" strokeLinejoin="round" />
            <path d="M 8 16 Q 0 10 2 22 Z" fill="#F8F6F1" stroke="#0F0F0F" strokeWidth="2" strokeLinejoin="round" />
          </g>
        </g>

        {/* Floating Broken Chart Doodle (Right side) */}
        <g className="floating-token" style={{ animationDelay: '-2s', transformBox: 'fill-box' }}>
          <g transform="translate(276, 88)">
            {/* Mini terminal tablet */}
            <rect x="0" y="0" width="56" height="42" rx="7" fill="#FFFFFF" stroke="#0F0F0F" strokeWidth="2.2" />
            {/* Glass header */}
            <line x1="0" y1="12" x2="56" y2="12" stroke="#0F0F0F" strokeWidth="1.6" opacity="0.4" />
            <circle cx="7" cy="6" r="2" fill="#ef4444" />
            <circle cx="14" cy="6" r="2" fill="#f59e0b" />
            <circle cx="21" cy="6" r="2" fill="#10b981" />
            {/* Erratic broken candlestick / line doodle */}
            <path
              d="M 6 34 L 16 28 L 26 36 L 36 20 L 46 24 L 50 16"
              fill="none"
              stroke="#0F0F0F"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="chart-line-anim"
            />
            {/* Question mark above tablet */}
            <text x="56" y="-3" fontSize="13" fontWeight="bold" fill="#f59e0b">
              ?
            </text>
          </g>
        </g>

        {/* MAIN DOODLE: The Lost Astronaut / PaperBot */}
        <g className="doodle-character">
          {/* Shadow beneath character */}
          <ellipse
            cx="190"
            cy="238"
            rx={isHovered ? 48 : 42}
            ry="7"
            fill="rgba(15,15,15,0.06)"
            style={{ transition: 'all 0.3s ease' }}
          />

          {/* Jetpack / Oxygen Backpack */}
          <rect
            x="146"
            y="114"
            width="88"
            height="58"
            rx="16"
            fill="#EDE8DF"
            stroke="#0F0F0F"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Jetpack nozzle + cute cloud puffs */}
          <rect x="156" y="168" width="16" height="8" rx="3" fill="#D3CCC1" stroke="#0F0F0F" strokeWidth="2" />
          <rect x="208" y="168" width="16" height="8" rx="3" fill="#D3CCC1" stroke="#0F0F0F" strokeWidth="2" />
          
          {/* Tiny thrust doodle puffs */}
          <path
            d="M 160 178 Q 164 186 161 192 Q 167 186 170 178"
            fill="none"
            stroke="#0F0F0F"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />
          <path
            d="M 212 178 Q 216 186 213 192 Q 219 186 222 178"
            fill="none"
            stroke="#0F0F0F"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Astronaut Main Body */}
          <path
            d="M 160 120 C 160 108 220 108 220 120 C 224 145 224 185 220 198 C 210 203 170 203 160 198 C 156 185 156 145 160 120 Z"
            fill="#FFFFFF"
            stroke="#0F0F0F"
            strokeWidth="2.8"
            strokeLinejoin="round"
          />

          {/* Cute belly patch (Paper trade ledger badge) */}
          <rect
            x="172"
            y="136"
            width="36"
            height="30"
            rx="7"
            fill="#F8F6F1"
            stroke="#0F0F0F"
            strokeWidth="2"
          />
          {/* Mini faux code / transaction lines */}
          <line x1="178" y1="144" x2="198" y2="144" stroke="#0F0F0F" strokeWidth="2" strokeLinecap="round" />
          <line x1="178" y1="151" x2="202" y2="151" stroke="#0F0F0F" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="178" y1="158" x2="190" y2="158" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />

          {/* Left Foot */}
          <path
            d="M 166 198 C 166 216 156 222 150 224 C 144 224 144 214 154 210 C 158 208 160 202 163 198 Z"
            fill="#FFFFFF"
            stroke="#0F0F0F"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Right Foot */}
          <path
            d="M 214 198 C 214 216 224 222 230 224 C 236 224 236 214 226 210 C 222 208 220 202 217 198 Z"
            fill="#FFFFFF"
            stroke="#0F0F0F"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Left Arm (holding map or floating) */}
          <path
            d="M 158 132 C 142 138 136 154 134 168 C 134 174 142 176 145 170 C 148 160 152 148 160 144 Z"
            fill="#FFFFFF"
            stroke="#0F0F0F"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Cute glove cuff */}
          <ellipse cx="140" cy="170" rx="5" ry="3" fill="#EDE8DF" stroke="#0F0F0F" strokeWidth="1.8" />

          {/* Right Arm (Waving or Scratching Helmet) */}
          <g
            style={{
              transformOrigin: '222px 134px',
              transform: isWaving
                ? 'rotate(-28deg)'
                : isHovered
                ? 'rotate(-16deg)'
                : 'rotate(0deg)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <path
              d="M 222 132 C 238 126 250 114 254 98 C 256 92 248 88 245 94 C 240 106 230 118 220 124 Z"
              fill="#FFFFFF"
              stroke="#0F0F0F"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Glove waving */}
            <circle cx="251" cy="94" r="6" fill="#EDE8DF" stroke="#0F0F0F" strokeWidth="2" />
            {/* Motion lines for wave */}
            <path
              d="M 262 86 C 265 91 265 97 262 102"
              fill="none"
              stroke="#0F0F0F"
              strokeWidth="2"
              strokeLinecap="round"
              opacity={isHovered || isWaving ? 0.8 : 0}
              style={{ transition: 'opacity 0.2s ease' }}
            />
          </g>

          {/* Helmet Dome */}
          <circle
            cx="190"
            cy="78"
            r="38"
            fill="#FFFFFF"
            stroke="#0F0F0F"
            strokeWidth="2.8"
          />

          {/* Helmet Antenna (Bouncing with cute transmission) */}
          <g className="antenna-bob">
            <line x1="190" y1="40" x2="190" y2="22" stroke="#0F0F0F" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="190" cy="18" r="5" fill="#f59e0b" stroke="#0F0F0F" strokeWidth="2.2" />
            {/* Signal waves */}
            <path
              d="M 180 14 C 185 8 195 8 200 14"
              fill="none"
              stroke="#0F0F0F"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.5"
            />
          </g>

          {/* Dark Glass Visor */}
          <rect
            x="166"
            y="56"
            width="48"
            height="34"
            rx="17"
            fill="url(#visorGradient)"
            stroke="#0F0F0F"
            strokeWidth="2.2"
          />

          {/* Visor Glare / Reflection doodle */}
          <path
            d="M 174 62 C 178 60 188 60 196 62"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx="204" cy="65" r="1.8" fill="#ffffff" opacity="0.6" />

          {/* Visor Animated Eyes (Cute blinking doodle inside glass) */}
          <g style={{ transformOrigin: '190px 73px', animation: 'doodleBlink 4.2s infinite' }}>
            <ellipse cx="182" cy="74" rx="3.5" ry="4" fill="#38bdf8" />
            <ellipse cx="198" cy="74" rx="3.5" ry="4" fill="#38bdf8" />
            {/* Catchlight */}
            <circle cx="183.5" cy="72.5" r="1.2" fill="#ffffff" />
            <circle cx="199.5" cy="72.5" r="1.2" fill="#ffffff" />
          </g>

          {/* Cute paper folds & tape on helmet */}
          <rect
            x="152"
            y="72"
            width="10"
            height="14"
            rx="3"
            fill="#EDE8DF"
            stroke="#0F0F0F"
            strokeWidth="2"
            transform="rotate(-15 152 72)"
          />
          <rect
            x="218"
            y="72"
            width="10"
            height="14"
            rx="3"
            fill="#EDE8DF"
            stroke="#0F0F0F"
            strokeWidth="2"
            transform="rotate(15 218 72)"
          />
        </g>

        {/* Speech / Thought Bubble: "Where's the chain?" */}
        <g
          transform="translate(230, 20)"
          style={{
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            transformOrigin: '20px 20px',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Main Bubble */}
          <path
            d="M 12 0 L 86 0 C 92 0 98 6 98 12 L 98 34 C 98 40 92 46 86 46 L 24 46 L 6 56 L 10 46 L 12 46 C 6 46 0 40 0 34 L 0 12 C 0 6 6 0 12 0 Z"
            fill="#FFFFFF"
            stroke="#0F0F0F"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <text
            x="48"
            y="26"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#0F0F0F"
            letterSpacing="-0.2px"
            fontFamily="monospace, var(--font-sans), sans-serif"
          >
            404 NOT FOUND
          </text>
        </g>
      </svg>

      {/* Interactive Helper Text */}
      <span
        style={{
          fontSize: '11px',
          color: '#999',
          marginTop: '6px',
          letterSpacing: '0.04em',
          transition: 'color 0.2s ease',
        }}
      >
        {isWaving ? '👋 *beep boop* signaling node...' : '(tap astronaut to ping relay)'}
      </span>
    </div>
  );
}
