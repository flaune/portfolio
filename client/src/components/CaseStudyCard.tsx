import { useState } from 'react';
import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface CaseStudy {
  id: string;
  title: string;
  beforeImage?: string;
  problem: string;
  solution: string;
  businessImpact: string;
  improvements: string[];
  InteractiveComponent?: React.ComponentType;
}

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
}

export function CaseStudyCard({ caseStudy }: CaseStudyCardProps) {
  const [showSolution, setShowSolution] = useState(false);
  const { theme, reduceMotion } = useOSStore();
  const isDark = theme === 'dark';

  const { title, beforeImage, problem, solution, businessImpact, improvements, InteractiveComponent } = caseStudy;

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden transition-all duration-300",
      !isDark && "bg-white border border-gray-200 shadow-lg",
      isDark && "bg-gray-900/80 border border-blue-500/20 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
    )}>
      <AnimatePresence mode="wait">
        {!showSolution ? (
          <motion.div
            key="before"
            initial={reduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? {} : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Before State */}
            <div className={cn(
              "aspect-video w-full flex items-center justify-center relative overflow-hidden",
              !isDark && "bg-gradient-to-br from-gray-100 to-gray-200",
              isDark && "bg-gradient-to-br from-gray-800 to-gray-900"
            )}>
              {beforeImage ? (
                <img src={beforeImage} alt={`${title} - Before`} className="w-full h-full object-cover" />
              ) : (
                <div className={cn(
                  "text-center p-8",
                  !isDark && "text-gray-400",
                  isDark && "text-gray-500"
                )}>
                  <p className="text-sm font-medium">Before Screenshot</p>
                  <p className="text-xs mt-1">Original Design</p>
                </div>
              )}
              <div className={cn(
                "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                !isDark && "bg-red-100 text-red-700",
                isDark && "bg-red-500/20 text-red-400 border border-red-500/30"
              )}>
                Before
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className={cn(
                "text-xl font-bold",
                !isDark && "text-gray-900",
                isDark && "text-white"
              )}>{title}</h3>

              <div className="space-y-2">
                <h4 className={cn(
                  "text-sm font-bold uppercase tracking-wider",
                  !isDark && "text-red-600",
                  isDark && "text-red-400"
                )}>The Problem</h4>
                <p className={cn(
                  "text-sm leading-relaxed",
                  !isDark && "text-gray-600",
                  isDark && "text-gray-300"
                )}>{problem}</p>
              </div>

              <button
                onClick={() => setShowSolution(true)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200",
                  !isDark && "bg-amber-500 text-white hover:bg-amber-600",
                  isDark && "bg-blue-600 text-white hover:bg-blue-500"
                )}
                data-testid={`view-solution-${caseStudy.id}`}
              >
                View Solution
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="after"
            initial={reduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? {} : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* After State */}
            <div className={cn(
              "w-full flex items-center justify-center relative overflow-hidden",
              InteractiveComponent ? "min-h-[400px]" : "aspect-video",
              !isDark && "bg-gradient-to-br from-gray-800 to-gray-900",
              isDark && "bg-gradient-to-br from-gray-900 to-black"
            )}>
              {InteractiveComponent ? (
                <div className="w-full h-full">
                  <InteractiveComponent />
                </div>
              ) : (
                <div className={cn(
                  "text-center p-8 text-gray-400"
                )}>
                  <p className="text-sm font-medium">Interactive Component</p>
                  <p className="text-xs mt-1">v0 Component Placeholder</p>
                </div>
              )}
              <div className={cn(
                "absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10",
                !isDark && "bg-green-100 text-green-700",
                isDark && "bg-green-500/20 text-green-400 border border-green-500/30"
              )}>
                After
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className={cn(
                "text-xl font-bold",
                !isDark && "text-gray-900",
                isDark && "text-white"
              )}>{title}</h3>

              <div className="space-y-2">
                <h4 className={cn(
                  "text-sm font-bold uppercase tracking-wider",
                  !isDark && "text-green-600",
                  isDark && "text-green-400"
                )}>My Solution</h4>
                <p className={cn(
                  "text-sm leading-relaxed",
                  !isDark && "text-gray-600",
                  isDark && "text-gray-300"
                )}>{solution}</p>
              </div>

              <div className="space-y-2">
                <h4 className={cn(
                  "text-sm font-bold uppercase tracking-wider",
                  !isDark && "text-blue-600",
                  isDark && "text-blue-400"
                )}>Product & Business Impact</h4>
                <p className={cn(
                  "text-sm leading-relaxed",
                  !isDark && "text-gray-600",
                  isDark && "text-gray-300"
                )}>{businessImpact}</p>
              </div>

              <div className="space-y-2">
                <h4 className={cn(
                  "text-sm font-bold uppercase tracking-wider",
                  !isDark && "text-amber-600",
                  isDark && "text-amber-400"
                )}>Key Improvements</h4>
                <ul className="space-y-1.5">
                  {improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className={cn(
                        "w-4 h-4 flex-shrink-0 mt-0.5",
                        !isDark && "text-green-500",
                        isDark && "text-green-400"
                      )} />
                      <span className={cn(
                        "text-sm",
                        !isDark && "text-gray-600",
                        isDark && "text-gray-300"
                      )}>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setShowSolution(false)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200",
                  !isDark && "bg-gray-200 text-gray-700 hover:bg-gray-300",
                  isDark && "bg-gray-700 text-gray-200 hover:bg-gray-600"
                )}
                data-testid={`back-to-problem-${caseStudy.id}`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Problem
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
