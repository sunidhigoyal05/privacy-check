interface RiskGaugeProps {
  value: number;
  size?: number;
}

export default function RiskGauge({ value, size = 80 }: RiskGaugeProps) {
  const percentage = Math.round(value * 100);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value * circumference);

  const getColor = (val: number) => {
    if (val >= 0.8) return '#F31260';
    if (val >= 0.6) return '#F5A524';
    if (val >= 0.4) return '#F5A524';
    return '#17C964';
  };

  const color = getColor(value);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1E1E2E" strokeWidth="6"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        {/* Text */}
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          className="text-xs font-semibold" fill={color}
        >
          {percentage}%
        </text>
      </svg>
    </div>
  );
}
