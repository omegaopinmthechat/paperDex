'use client';

export default function Sparkline({
  data = [],
  width = 135,
  height = 42,
  isPositive = true,
  strokeWidth = 1.75,
  showGradient = true,
  id = 'sparkline',
}) {
  if (!Array.isArray(data) || data.length < 2) {
    return (
      <div style={{ width: `${width}px`, height: `${height}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '10px' }}>
        —
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingY = 4;
  const availableHeight = height - paddingY * 2;

  // Convert points to SVG coordinates
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
    const normalizedY = (val - min) / range;
    // SVG y=0 is top, so invert
    const y = height - paddingY - normalizedY * availableHeight;
    return [x, y];
  });

  // Construct smooth SVG path
  let pathD = `M ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // Control points for smooth bezier
    const cpX1 = prev[0] + (curr[0] - prev[0]) / 2;
    const cpY1 = prev[1];
    const cpX2 = prev[0] + (curr[0] - prev[0]) / 2;
    const cpY2 = curr[1];
    pathD += ` C ${cpX1.toFixed(2)} ${cpY1.toFixed(2)}, ${cpX2.toFixed(2)} ${cpY2.toFixed(2)}, ${curr[0].toFixed(2)} ${curr[1].toFixed(2)}`;
  }

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const strokeColor = isPositive ? '#16a34a' : '#dc2626';
  const gradientId = `grad-${id}-${isPositive ? 'up' : 'down'}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible', display: 'block' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={showGradient ? 0.22 : 0} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {showGradient && (
        <path d={areaD} fill={`url(#${gradientId})`} />
      )}

      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
