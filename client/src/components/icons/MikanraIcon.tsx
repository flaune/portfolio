import { cn } from '@/lib/utils';

interface MikanraIconProps {
  className?: string;
  isDark?: boolean;
}

export function MikanraIcon({ className, isDark = false }: MikanraIconProps) {
  const orangeColor = "#EA580C";
  const accentColor = orangeColor;
  
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-10 h-10", className)}
    >
      {/* Outer circle ring */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke={accentColor}
        strokeWidth="4"
        fill="none"
      />
      
      {/* Background for contrast */}
      <circle
        cx="50"
        cy="50"
        r="38"
        fill={isDark ? "#1e293b" : "#FEF3C7"}
      />
      
      {/* Citrus segments - 8 segments with gaps */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const innerRadius = 10;
        const outerRadius = 36;
        const segmentAngle = 17;
        const segmentRad = (segmentAngle * Math.PI) / 180;
        
        const x1 = 50 + innerRadius * Math.cos(rad - segmentRad);
        const y1 = 50 + innerRadius * Math.sin(rad - segmentRad);
        const x2 = 50 + outerRadius * Math.cos(rad - segmentRad);
        const y2 = 50 + outerRadius * Math.sin(rad - segmentRad);
        const x3 = 50 + outerRadius * Math.cos(rad + segmentRad);
        const y3 = 50 + outerRadius * Math.sin(rad + segmentRad);
        const x4 = 50 + innerRadius * Math.cos(rad + segmentRad);
        const y4 = 50 + innerRadius * Math.sin(rad + segmentRad);
        
        return (
          <path
            key={i}
            d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1}`}
            fill={accentColor}
          />
        );
      })}
      
      {/* Center dot */}
      <circle
        cx="50"
        cy="50"
        r="7"
        fill={accentColor}
      />
    </svg>
  );
}
