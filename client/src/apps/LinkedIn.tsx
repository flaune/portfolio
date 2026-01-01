import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ExternalLink, Users } from 'lucide-react';

const LINKEDIN_URL = "https://www.linkedin.com/in/bryanhach/";

export function LinkedIn() {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';

  const handleOpenProfile = () => {
    window.open(LINKEDIN_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={cn(
      "h-full flex flex-col overflow-hidden",
      !isDark && "bg-white",
      isDark && "bg-[#1a1a2e]"
    )}>
      {/* Network Pattern Banner */}
      <div className={cn(
        "h-28 relative overflow-hidden",
        !isDark && "bg-gradient-to-br from-[#0077b5] via-[#0097b2] to-[#00a0a0]",
        isDark && "bg-gradient-to-br from-[#0a1628] via-[#0f2847] to-[#1a3a5c]"
      )}>
        {/* Network dots pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="networkPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1.5" fill="white" />
              <circle cx="30" cy="25" r="1" fill="white" />
              <circle cx="50" cy="15" r="1.5" fill="white" />
              <circle cx="70" cy="35" r="1" fill="white" />
              <circle cx="90" cy="20" r="1.5" fill="white" />
              <circle cx="20" cy="50" r="1" fill="white" />
              <circle cx="45" cy="45" r="1.5" fill="white" />
              <circle cx="65" cy="55" r="1" fill="white" />
              <circle cx="85" cy="45" r="1.5" fill="white" />
              <circle cx="15" cy="75" r="1.5" fill="white" />
              <circle cx="35" cy="70" r="1" fill="white" />
              <circle cx="55" cy="80" r="1.5" fill="white" />
              <circle cx="75" cy="70" r="1" fill="white" />
              <circle cx="95" cy="85" r="1.5" fill="white" />
              <line x1="10" y1="10" x2="30" y2="25" stroke="white" strokeWidth="0.3" opacity="0.5" />
              <line x1="30" y1="25" x2="50" y2="15" stroke="white" strokeWidth="0.3" opacity="0.5" />
              <line x1="50" y1="15" x2="70" y2="35" stroke="white" strokeWidth="0.3" opacity="0.5" />
              <line x1="70" y1="35" x2="90" y2="20" stroke="white" strokeWidth="0.3" opacity="0.5" />
              <line x1="20" y1="50" x2="45" y2="45" stroke="white" strokeWidth="0.3" opacity="0.5" />
              <line x1="45" y1="45" x2="65" y2="55" stroke="white" strokeWidth="0.3" opacity="0.5" />
              <line x1="65" y1="55" x2="85" y2="45" stroke="white" strokeWidth="0.3" opacity="0.5" />
              <line x1="15" y1="75" x2="35" y2="70" stroke="white" strokeWidth="0.3" opacity="0.5" />
              <line x1="35" y1="70" x2="55" y2="80" stroke="white" strokeWidth="0.3" opacity="0.5" />
              <line x1="55" y1="80" x2="75" y2="70" stroke="white" strokeWidth="0.3" opacity="0.5" />
              <line x1="10" y1="10" x2="20" y2="50" stroke="white" strokeWidth="0.3" opacity="0.4" />
              <line x1="50" y1="15" x2="45" y2="45" stroke="white" strokeWidth="0.3" opacity="0.4" />
              <line x1="90" y1="20" x2="85" y2="45" stroke="white" strokeWidth="0.3" opacity="0.4" />
              <line x1="20" y1="50" x2="15" y2="75" stroke="white" strokeWidth="0.3" opacity="0.4" />
              <line x1="65" y1="55" x2="55" y2="80" stroke="white" strokeWidth="0.3" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#networkPattern)" />
        </svg>
      </div>
      {/* Profile Section - Centered */}
      <div className="flex-1 flex flex-col items-center px-6 text-left mt-[-2px] mb-[-2px]">
        {/* Avatar */}
        <div className={cn(
          "w-28 h-28 rounded-full border-4 flex items-center justify-center mb-4 overflow-hidden",
          !isDark && "bg-white border-white shadow-lg",
          isDark && "bg-gray-900 border-[#1a1a2e] shadow-[0_0_20px_rgba(0,255,255,0.2)]"
        )}>
          <div className={cn(
            "w-full h-full rounded-full flex items-center justify-center text-4xl font-bold",
            !isDark && "bg-gradient-to-br from-[#0077b5] to-[#004182] text-white",
            isDark && "bg-gradient-to-br from-cyan-600 to-blue-600 text-white"
          )}>
            BH
          </div>
        </div>

        {/* Name */}
        <h1 className={cn(
          "text-2xl font-semibold mb-1 text-center",
          !isDark && "text-gray-900",
          isDark && "text-white"
        )}>
          Bryan Hach
        </h1>
        
        {/* Title */}
        <p className={cn(
          "text-sm mb-1 text-center",
          !isDark && "text-gray-600",
          isDark && "text-gray-300"
        )}>
          Producer & Business Developer
        </p>

        {/* Company / Details */}
        <p className={cn(
          "text-xs mb-1 text-center",
          !isDark && "text-gray-500",
          isDark && "text-gray-400"
        )}>
          Games & Digital Products
        </p>

        {/* Location & Connections */}
        <div className={cn(
          "flex items-center gap-1 text-xs mb-6",
          !isDark && "text-gray-500",
          isDark && "text-gray-400"
        )}>
          <span>Open to Opportunities</span>
          <span>•</span>
          <Users className="w-3 h-3" />
          <span>500+</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 w-full max-w-xs">
          <button
            onClick={handleOpenProfile}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full font-semibold text-sm transition-all",
              !isDark && "bg-[#0077b5] text-white hover:bg-[#006097]",
              isDark && "bg-cyan-600 text-white hover:bg-cyan-500"
            )}
            data-testid="linkedin-open-profile"
          >
            <span>View Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
