'use client';
import { useEffect, useState } from 'react';

interface AGIGaugeProps {
  value: number;
}

export default function AGIGauge({ value }: AGIGaugeProps) {
  const [displayed, setDisplayed] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
      let start = 0;
      const step = value / 80;
      const interval = setInterval(() => {
        start += step;
        if (start >= value) {
          start = value;
          clearInterval(interval);
        }
        setDisplayed(parseFloat(start.toFixed(1)));
      }, 16);
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  const SIZE = 320;
  const STROKE = 18;
  const R = (SIZE - STROKE * 2) / 2;
  const CX = SIZE / 2;
  const CY = SIZE / 2;

  // Arc from -225deg to +45deg (270deg sweep)
  const startAngle = -225;
  const sweepAngle = 270;
  const endAngle = startAngle + sweepAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const arcPath = (fromDeg: number, toDeg: number) => {
    const x1 = CX + R * Math.cos(toRad(fromDeg));
    const y1 = CY + R * Math.sin(toRad(fromDeg));
    const x2 = CX + R * Math.cos(toRad(toDeg));
    const y2 = CY + R * Math.sin(toRad(toDeg));
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  };

  const fillAngle = startAngle + (sweepAngle * displayed) / 100;
  const filledPath = arcPath(startAngle, Math.min(fillAngle, endAngle));
  const bgPath = arcPath(startAngle, endAngle);

  // Danger color gradient based on value
  const color = displayed >= 95 ? '#ff1111' : displayed >= 85 ? '#ff4444' : displayed >= 70 ? '#ff6b35' : '#f59e0b';

  // Tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="overflow-visible">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-strong">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer ring decoration */}
          <circle cx={CX} cy={CY} r={R + STROKE + 4} fill="none" stroke="#1a1a2e" strokeWidth="1" />
          <circle cx={CX} cy={CY} r={R + STROKE + 8} fill="none" stroke="#0f0f1a" strokeWidth="1" />

          {/* Tick marks */}
          {ticks.map((tick) => {
            const angle = startAngle + (sweepAngle * tick) / 100;
            const rad = toRad(angle);
            const inner = R - 12;
            const outer = R + 4;
            const x1 = CX + inner * Math.cos(rad);
            const y1 = CY + inner * Math.sin(rad);
            const x2 = CX + outer * Math.cos(rad);
            const y2 = CY + outer * Math.sin(rad);
            const isMajor = tick % 25 === 0;
            return (
              <line
                key={tick}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={tick <= displayed ? color : '#2a2a3e'}
                strokeWidth={isMajor ? 2 : 1}
                opacity={isMajor ? 1 : 0.5}
              />
            );
          })}

          {/* Background track */}
          <path d={bgPath} fill="none" stroke="#1a1a2e" strokeWidth={STROKE} strokeLinecap="round" />
          <path d={bgPath} fill="none" stroke="#0d0d1a" strokeWidth={STROKE - 4} strokeLinecap="round" />

          {/* Fill arc */}
          {animated && (
            <path
              d={filledPath}
              fill="none"
              stroke={color}
              strokeWidth={STROKE}
              strokeLinecap="round"
              filter="url(#glow)"
              style={{
                transition: 'none',
              }}
            />
          )}

          {/* Center circle */}
          <circle cx={CX} cy={CY} r={R - STROKE - 16} fill="#080810" />
          <circle cx={CX} cy={CY} r={R - STROKE - 20} fill="none" stroke="#1a1a2e" strokeWidth="1" />

          {/* Label top */}
          <text x={CX} y={CY - 42} textAnchor="middle" fill="#4a4a6a" fontSize="10" fontFamily="'Space Mono', monospace" letterSpacing="3">
            AGI INDEX
          </text>

          {/* Main value */}
          <text
            x={CX}
            y={CY + 16}
            textAnchor="middle"
            fill={color}
            fontSize="54"
            fontFamily="'Space Mono', monospace"
            fontWeight="bold"
            filter="url(#glow)"
          >
            {displayed.toFixed(1)}
          </text>

          {/* % symbol */}
          <text x={CX + 66} y={CY + 6} textAnchor="middle" fill={color} fontSize="22" fontFamily="'Space Mono', monospace" opacity="0.8">
            %
          </text>

          {/* Bottom label */}
          <text x={CX} y={CY + 42} textAnchor="middle" fill="#4a4a6a" fontSize="9" fontFamily="'Space Mono', monospace" letterSpacing="2">
            OF EXPERT HUMAN
          </text>

          {/* Danger indicator */}
          {displayed >= 80 && (
            <text x={CX} y={CY + 58} textAnchor="middle" fill={color} fontSize="8" fontFamily="'Space Mono', monospace" letterSpacing="1" opacity="0.6">
              ▲ CRITICAL PROXIMITY
            </text>
          )}

          {/* Scale labels */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = startAngle + (sweepAngle * tick) / 100;
            const rad = toRad(angle);
            const labelR = R + STROKE + 18;
            const x = CX + labelR * Math.cos(rad);
            const y = CY + labelR * Math.sin(rad);
            return (
              <text key={tick} x={x} y={y + 4} textAnchor="middle" fill="#2a2a4a" fontSize="8" fontFamily="'Space Mono', monospace">
                {tick}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
