import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { User, Sparkles, Database, FileSpreadsheet, PenTool, TrendingUp, Package, BookOpen, Gamepad2, ExternalLink, Code, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

const skills = [
  { name: "Data analysis and insights", icon: BarChart3 },
  { name: "SQL and database management", icon: Database },
  { name: "Microsoft Excel and PowerPoint", icon: FileSpreadsheet },
  { name: "Technical writing", icon: PenTool },
  { name: "Business development strategy", icon: TrendingUp },
  { name: "Product management and planning", icon: Package },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function AboutMe() {
  const { theme, reduceMotion } = useOSStore();
  const isDark = theme === 'dark';
  const greeting = useMemo(() => getGreeting(), []);

  const MotionDiv = reduceMotion ? 'div' : motion.div;
  const motionProps = reduceMotion ? {} : { 
    initial: "hidden", 
    whileInView: "visible", 
    viewport: { once: true, margin: "-50px" },
    variants: fadeInUp 
  };

  return (
    <div className={cn(
      "min-h-full overflow-y-auto",
      !isDark && "bg-gradient-to-b from-white to-gray-50",
      isDark && "bg-gradient-to-b from-[#0a0a14] to-[#0f0f1a]"
    )}>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-16">
        
        {/* Hero Section */}
        <MotionDiv {...motionProps} className="space-y-6">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
            !isDark && "bg-amber-100 text-amber-700",
            isDark && "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          )}>
            <Sparkles className="w-4 h-4" />
            {greeting}
          </div>
          
          <h1 className={cn(
            "text-4xl md:text-5xl font-bold leading-tight",
            !isDark && "text-gray-900",
            isDark && "text-white"
          )}>
            Hey, I'm <span className={cn(
              !isDark && "text-amber-600",
              isDark && "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
            )}>Bryan</span>
          </h1>
          
          <p className={cn(
            "text-lg md:text-xl leading-relaxed",
            !isDark && "text-gray-600",
            isDark && "text-gray-300"
          )}>
            I'm a junior in university pursuing a bachelor's degree in economics with a concentration in finance. 
            I'm aiming for a career in <span className="font-semibold">business development</span> and <span className="font-semibold">project management</span>.
          </p>
        </MotionDiv>

        {/* Divider */}
        <div className={cn(
          "h-px",
          !isDark && "bg-gradient-to-r from-transparent via-gray-300 to-transparent",
          isDark && "bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
        )} />

        {/* My Story Section */}
        <MotionDiv {...motionProps} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              !isDark && "bg-amber-100",
              isDark && "bg-cyan-500/10 border border-cyan-500/20"
            )}>
              <User className={cn(
                "w-5 h-5",
                !isDark && "text-amber-600",
                isDark && "text-cyan-400"
              )} />
            </div>
            <h2 className={cn(
              "text-2xl font-bold",
              !isDark && "text-gray-900",
              isDark && "text-white"
            )}>My Story</h2>
          </div>
          
          <div className={cn(
            "space-y-4 text-base leading-relaxed",
            !isDark && "text-gray-600",
            isDark && "text-gray-300"
          )}>
            <p>
              My path to university has been unconventional to say the least. For the past few years, I prioritized 
              <span className={cn(
                "font-semibold",
                !isDark && "text-gray-900",
                isDark && "text-white"
              )}> supporting my family</span> when they needed me most. Becoming the main caregiver, and now that 
              they're healthy and thriving, I'm finally pursuing the education and ambitions I had to put on hold.
            </p>
            <p>
              I thought it was too late to start something. But no matter where you are in life, you can 
              <span className={cn(
                "font-semibold",
                !isDark && "text-gray-900",
                isDark && "text-cyan-300"
              )}> build, create, and make a difference</span> and progress towards your dreams and goals. 
              That's a lesson I'm learning firsthand, and it's something I want to share through the things I create.
            </p>
          </div>
        </MotionDiv>

        {/* Divider */}
        <div className={cn(
          "h-px",
          !isDark && "bg-gradient-to-r from-transparent via-gray-300 to-transparent",
          isDark && "bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
        )} />

        {/* Skills Section */}
        <MotionDiv 
          {...(reduceMotion ? {} : { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: staggerContainer })}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              !isDark && "bg-amber-100",
              isDark && "bg-cyan-500/10 border border-cyan-500/20"
            )}>
              <Code className={cn(
                "w-5 h-5",
                !isDark && "text-amber-600",
                isDark && "text-cyan-400"
              )} />
            </div>
            <h2 className={cn(
              "text-2xl font-bold",
              !isDark && "text-gray-900",
              isDark && "text-white"
            )}>Skills & Expertise</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <MotionDiv
                  key={skill.name}
                  {...(reduceMotion ? {} : { variants: fadeInUp })}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl transition-all duration-200",
                    !isDark && "bg-white border border-gray-200 hover:border-amber-300 hover:shadow-md",
                    isDark && "bg-white/5 border border-cyan-500/10 hover:border-cyan-500/30 hover:bg-white/10"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    !isDark && "text-amber-600",
                    isDark && "text-cyan-400"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    !isDark && "text-gray-700",
                    isDark && "text-gray-200"
                  )}>{skill.name}</span>
                </MotionDiv>
              );
            })}
          </div>
        </MotionDiv>

        {/* Divider */}
        <div className={cn(
          "h-px",
          !isDark && "bg-gradient-to-r from-transparent via-gray-300 to-transparent",
          isDark && "bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
        )} />

        {/* What I'm Building Section */}
        <MotionDiv {...motionProps} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              !isDark && "bg-amber-100",
              isDark && "bg-cyan-500/10 border border-cyan-500/20"
            )}>
              <Gamepad2 className={cn(
                "w-5 h-5",
                !isDark && "text-amber-600",
                isDark && "text-cyan-400"
              )} />
            </div>
            <h2 className={cn(
              "text-2xl font-bold",
              !isDark && "text-gray-900",
              isDark && "text-white"
            )}>What I'm Building</h2>
          </div>
          
          <div className={cn(
            "p-6 rounded-2xl",
            !isDark && "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200",
            isDark && "bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20"
          )}>
            <h3 className={cn(
              "text-xl font-bold mb-3",
              !isDark && "text-gray-900",
              isDark && "text-white"
            )}>Mikanra</h3>
            <p className={cn(
              "text-base leading-relaxed mb-4",
              !isDark && "text-gray-600",
              isDark && "text-gray-300"
            )}>
              Right now, I'm working on <span className="font-semibold">mikanra</span>! My indie game that explores 
              themes of family, second chances, and discovering yourself. It's a project I'm genuinely proud of, 
              and I'm excited to share it with people when the time comes.
            </p>
            <p className={cn(
              "text-sm mb-4",
              !isDark && "text-gray-500",
              isDark && "text-gray-400"
            )}>
              At the moment it isn't close to being done, but you can learn more about what I'm building. 
              Keep in mind the website is still being built, so there will be sections under construction.
            </p>
            <a 
              href="https://mikanra.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200",
                !isDark && "bg-amber-600 text-white hover:bg-amber-700",
                isDark && "bg-cyan-600 text-white hover:bg-cyan-500"
              )}
              data-testid="link-mikanra"
            >
              Visit mikanra.com
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </MotionDiv>

        {/* Divider */}
        <div className={cn(
          "h-px",
          !isDark && "bg-gradient-to-r from-transparent via-gray-300 to-transparent",
          isDark && "bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"
        )} />

        {/* Beyond Work Section */}
        <MotionDiv {...motionProps} className="space-y-6 pb-8">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              !isDark && "bg-amber-100",
              isDark && "bg-cyan-500/10 border border-cyan-500/20"
            )}>
              <BookOpen className={cn(
                "w-5 h-5",
                !isDark && "text-amber-600",
                isDark && "text-cyan-400"
              )} />
            </div>
            <h2 className={cn(
              "text-2xl font-bold",
              !isDark && "text-gray-900",
              isDark && "text-white"
            )}>Beyond Work</h2>
          </div>
          
          <p className={cn(
            "text-base leading-relaxed",
            !isDark && "text-gray-600",
            isDark && "text-gray-300"
          )}>
            I'm a reader and writer. I love to spend time with 
            <span className={cn(
              "font-semibold",
              !isDark && "text-gray-900",
              isDark && "text-white"
            )}> comics and light novels</span>, always looking for stories that stick with you. 
            I'm planning to add a bookshelf here soon, it's on my roadmap of things to do for this website!
          </p>
          
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
            !isDark && "bg-gray-100 text-gray-600",
            isDark && "bg-white/5 text-gray-400 border border-cyan-500/10"
          )}>
            <span className="text-lg">📚</span>
            <span>Bookshelf coming soon...</span>
          </div>
        </MotionDiv>

      </div>
    </div>
  );
}
