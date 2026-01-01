import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { User, Briefcase, FileText, ChevronRight, TrendingUp, ExternalLink, BookOpen, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { AboutMe } from '@/components/AboutMe';

type FileItem = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  icon?: any;
  content?: React.ReactNode;
};

const caseStudies = [
  {
    id: 1,
    title: "Platform Economics & Growth Strategy: Webtoon Analysis",
    subtitle: "Deep dive into content platform monetization",
    keyMetric: "Comprehensive market analysis",
    description: "Analyzed Webtoon's unique platform economics, creator revenue models, and user acquisition strategies. Explored how the platform balances free content access with premium monetization.",
    tags: ["Platform Economics", "Content Strategy", "Growth"],
    icon: BookOpen,
    color: "from-green-500 to-emerald-600"
  },
  {
    id: 2,
    title: "Platform Economics & Growth Strategy: Epic Games Store Analysis",
    subtitle: "Disruptive strategy in digital game distribution",
    keyMetric: "Competitive landscape study",
    description: "Examined Epic Games Store's aggressive market entry strategy, exclusive content deals, and revenue share disruption. Analyzed the platform's approach to challenging established market leaders.",
    tags: ["Platform Economics", "Gaming", "Market Strategy"],
    icon: Gamepad2,
    color: "from-blue-500 to-indigo-600"
  }
];

const CaseStudiesContent = () => {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';
  
  return (
    <div className="p-6 space-y-6">
      {caseStudies.map((study) => {
        const IconComponent = study.icon;
        return (
          <div 
            key={study.id} 
            className={cn(
              "group rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
              !isDark && "bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300",
              isDark && "bg-white/5 border border-blue-500/20 hover:bg-white/10 hover:border-blue-400/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            )}
            data-testid={`case-study-${study.id}`}
          >
            {/* Header with Icon */}
            <div className={cn(
              "p-4 flex items-start gap-4",
              !isDark && "border-b border-gray-100",
              isDark && "border-b border-blue-500/10"
            )}>
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
                study.color
              )}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {study.title}
                </h3>
                <p className={cn(
                  "text-sm font-medium",
                  !isDark && "text-gray-600",
                  isDark && "text-blue-300"
                )}>
                  {study.subtitle}
                </p>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4 pt-3">
              {/* Key Metric Badge */}
              <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-3",
                !isDark && "bg-amber-100 text-amber-700",
                isDark && "bg-amber-500/20 text-amber-400"
              )}>
                <TrendingUp className="w-3 h-3" />
                {study.keyMetric}
              </div>
              
              <p className={cn(
                "text-sm leading-relaxed mb-4",
                !isDark && "text-gray-600",
                isDark && "text-gray-300"
              )}>
                {study.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {study.tags.map((tag) => (
                  <span 
                    key={tag}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                      !isDark && "bg-gray-100 text-gray-600",
                      isDark && "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* View Button */}
              <button className={cn(
                "flex items-center gap-1.5 text-sm font-semibold transition-colors",
                !isDark && "text-blue-600 hover:text-blue-700",
                isDark && "text-blue-400 hover:text-blue-300"
              )}>
                <span>View Case Study</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function Finder() {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState<string>('about');

  const sidebarItems = [
    { id: 'about', label: 'About Me', icon: User },
    { id: 'casestudies', label: 'Case Studies', icon: Briefcase },
    { id: 'resume', label: 'Resume', icon: FileText },
  ];

  return (
    <div className={cn(
      "h-full",
      isMobile ? "flex flex-col" : "flex",
      !isDark && "bg-[#FAF9F6] text-[#2C2C2C]",
      isDark && "bg-black/40 text-blue-100"
    )}>
      {/* Sidebar - horizontal on mobile */}
      <div className={cn(
        "flex-shrink-0 select-none",
        isMobile 
          ? "flex items-center gap-1 px-2 py-2 overflow-x-auto border-b" 
          : "w-48 flex flex-col py-4 px-2 border-r",
        !isDark && "bg-[#EAD477]/30 border-[#D99D3C]/30",
        isDark && "bg-black/20 border-blue-500/20"
      )}>
        {!isMobile && <div className="text-xs font-bold px-3 mb-2 opacity-50 uppercase tracking-wider">Favorites</div>}
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedId(item.id)}
            className={cn(
              "flex items-center gap-2 rounded-md text-sm transition-colors flex-shrink-0",
              isMobile ? "px-3 py-2" : "px-3 py-1.5 mb-1",
              selectedId === item.id 
                ? (isDark ? "bg-blue-600/30 text-blue-300" : "bg-[#D99D3C]/40 text-[#2C2C2C] font-medium") 
                : "hover:bg-[#D99D3C]/20 opacity-80 hover:opacity-100"
            )}
            data-testid={`sidebar-${item.id}`}
          >
            <item.icon className="w-4 h-4" />
            {!isMobile && item.label}
          </button>
        ))}
      </div>
      {/* Content Area */}
      <div className="flex-1 overflow-auto backdrop-blur-sm bg-[#0000001f]">
        {/* Path Bar - Static, dimmed, non-interactive - hidden on mobile */}
        {!isMobile && (
          <div className={cn(
            "h-10 border-b flex items-center px-4 gap-2 text-sm opacity-40 select-none pointer-events-none",
            !isDark ? "border-gray-200" : "border-blue-500/20"
          )}>
            <span>Bhach HD</span>
            <ChevronRight className="w-4 h-4" />
            <span>Users</span>
            <ChevronRight className="w-4 h-4" />
            <span>Guest</span>
            <ChevronRight className="w-4 h-4" />
            <span>{sidebarItems.find(i => i.id === selectedId)?.label}</span>
          </div>
        )}

        {/* Main View */}
        <div className={cn(
          "overflow-y-auto",
          isMobile ? "h-full" : "h-[calc(100%-40px)]"
        )}>
          {selectedId === 'about' && <AboutMe />}
          {selectedId === 'casestudies' && <CaseStudiesContent />}
          {selectedId === 'resume' && (
             <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-60">
               <FileText className="w-16 h-16 mb-4" />
               <p className="font-medium">Resume.pdf</p>
               <p className="text-xs mt-2 max-w-[200px]">My experience and skills, condensed for your convenience</p>
               <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Download Resume</button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
