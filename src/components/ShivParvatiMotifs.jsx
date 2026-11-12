import { motion } from "framer-motion";

export function ShivTrishulCrest({ className = "" }) {
  return (
    <motion.svg
      viewBox="0 0 120 84"
      className={className}
      fill="none"
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Subtle golden aura halo */}
      <circle
        cx="60"
        cy="42"
        r="34"
        stroke="#D8C29B"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      {/* Crescent moon (Chandra of Mahadev) */}
      <path
        d="M39 24C34 28 33 36 38 42C41 46 47 47 51 45C45 45 41 40 41 34C41 29 43 26 46 23C43 22 41 23 39 24Z"
        fill="#D8C29B"
      />
      {/* Trishul prongs */}
      <path
        d="M60 12V72"
        stroke="#8C5A3C"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M60 12L55 21H65L60 12Z"
        fill="#C98A3B"
      />
      <path
        d="M44 26C44 37 51 43 60 43C69 43 76 37 76 26"
        stroke="#8C5A3C"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M44 22L40.5 29H47.5L44 22ZM76 22L72.5 29H79.5L76 22Z"
        fill="#C98A3B"
      />
      {/* Damru accent */}
      <path
        d="M52 50L68 58V50L52 58V50Z"
        fill="#B98C91"
        stroke="#8C5A3C"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Sacred Belpatra leaves at base */}
      <ellipse
        cx="51"
        cy="68"
        rx="6"
        ry="3"
        transform="rotate(-24 51 68)"
        fill="#7C9B6E"
      />
      <ellipse
        cx="69"
        cy="68"
        rx="6"
        ry="3"
        transform="rotate(24 69 68)"
        fill="#7C9B6E"
      />
      <circle cx="60" cy="68" r="3" fill="#E59A38" />
    </motion.svg>
  );
}

export function FloralToran2D() {
  const blossoms = [40, 110, 180, 250, 320, 390, 460, 530, 600, 670, 740];
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-4xl mx-auto overflow-hidden pointer-events-none select-none mb-2"
    >
      <svg viewBox="0 0 780 76" className="w-full h-auto">
        {/* Decorative festoon curves */}
        <path
          d="M10 10 Q195 56 390 16 Q585 56 770 10"
          fill="none"
          stroke="#D8C29B"
          strokeWidth="2"
        />
        <path
          d="M10 14 Q195 44 390 14 Q585 44 770 14"
          fill="none"
          stroke="#B98C91"
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />
        {blossoms.map((x, idx) => {
          const arcY =
            x <= 390
              ? 12 + Math.sin((x / 390) * Math.PI) * 28
              : 12 + Math.sin(((x - 390) / 390) * Math.PI) * 28;
          const isMarigold = idx % 2 === 0;
          const dropLen = idx === 5 ? 24 : idx % 3 === 0 ? 18 : 13;
          return (
            <g key={x} transform={`translate(${x}, ${arcY})`}>
              {/* Belpatra / Mango leaves */}
              <ellipse
                cx="-8"
                cy="3"
                rx="6"
                ry="2.6"
                transform="rotate(-25 -8 3)"
                fill="#7C9B6E"
              />
              <ellipse
                cx="8"
                cy="3"
                rx="6"
                ry="2.6"
                transform="rotate(25 8 3)"
                fill="#7C9B6E"
              />
              {/* Hanging floral strand */}
              <line
                x1="0"
                y1="4"
                x2="0"
                y2={dropLen}
                stroke="#C98A3B"
                strokeWidth="1.2"
              />
              {/* 2D Flower */}
              <circle
                cx="0"
                cy="0"
                r={isMarigold ? 7.5 : 6.5}
                fill={isMarigold ? "#E59A38" : "#C97A82"}
              />
              <circle
                cx="0"
                cy="0"
                r="2.8"
                fill={isMarigold ? "#B85314" : "#F4D186"}
              />
              {/* Bottom bell / bud */}
              <circle
                cx="0"
                cy={dropLen + 3}
                r="3.2"
                fill={idx === 5 ? "#C98A3B" : "#E8A5AB"}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function LotusDivider2D() {
  return (
    <div className="flex items-center justify-center gap-4 my-7" aria-hidden="true">
      <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-champagne" />
      <motion.svg
        viewBox="0 0 64 40"
        className="w-12 h-8"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M32 6C27 15 27 25 32 32C37 25 37 15 32 6Z"
          fill="#C97A82"
        />
        <path
          d="M32 32C24 27 19 20 19 13C24 16 29 22 32 32Z"
          fill="#E8A5AB"
        />
        <path
          d="M32 32C40 27 45 20 45 13C40 16 35 22 32 32Z"
          fill="#E8A5AB"
        />
        <path
          d="M32 32C21 31 13 26 11 19C17 20 25 25 32 32Z"
          fill="#D8C29B"
        />
        <path
          d="M32 32C43 31 51 26 53 19C47 20 39 25 32 32Z"
          fill="#D8C29B"
        />
        <circle cx="32" cy="33" r="2.6" fill="#C98A3B" />
      </motion.svg>
      <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-champagne" />
    </div>
  );
}
