import { useState } from 'react';
import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { BookOpen, ExternalLink, Search, Filter, ChevronLeft } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  description: string;
  category: 'Tools' | 'Learning' | 'Research' | 'Community' | 'Other';
  url: string;
  tags: string[];
}

const resources: Resource[] = [
  {
    id: 1,
    title: 'ChatGPT',
    description: 'OpenAI\'s conversational AI assistant for various tasks',
    category: 'Tools',
    url: 'https://chat.openai.com',
    tags: ['chatbot', 'assistant', 'gpt']
  },
  {
    id: 2,
    title: 'Claude',
    description: 'Anthropic\'s AI assistant focused on helpfulness and safety',
    category: 'Tools',
    url: 'https://claude.ai',
    tags: ['chatbot', 'assistant', 'claude']
  },
  {
    id: 3,
    title: 'Hugging Face',
    description: 'Platform for sharing and discovering AI models and datasets',
    category: 'Research',
    url: 'https://huggingface.co',
    tags: ['models', 'datasets', 'open-source']
  },
  {
    id: 4,
    title: 'Fast.ai',
    description: 'Practical deep learning courses and resources',
    category: 'Learning',
    url: 'https://www.fast.ai',
    tags: ['courses', 'deep-learning', 'education']
  },
  {
    id: 5,
    title: 'Papers with Code',
    description: 'Research papers with implementation code',
    category: 'Research',
    url: 'https://paperswithcode.com',
    tags: ['research', 'papers', 'code']
  },
  {
    id: 6,
    title: 'Midjourney',
    description: 'AI art generation platform',
    category: 'Tools',
    url: 'https://www.midjourney.com',
    tags: ['image-generation', 'art', 'creative']
  },
  {
    id: 7,
    title: 'Stable Diffusion',
    description: 'Open-source text-to-image AI model',
    category: 'Tools',
    url: 'https://stability.ai',
    tags: ['image-generation', 'open-source']
  },
  {
    id: 8,
    title: 'LangChain',
    description: 'Framework for developing LLM-powered applications',
    category: 'Tools',
    url: 'https://www.langchain.com',
    tags: ['framework', 'llm', 'development']
  },
  {
    id: 9,
    title: 'Replicate',
    description: 'Run and deploy AI models in the cloud',
    category: 'Tools',
    url: 'https://replicate.com',
    tags: ['deployment', 'api', 'models']
  },
  {
    id: 10,
    title: 'r/MachineLearning',
    description: 'Reddit community for ML discussions and news',
    category: 'Community',
    url: 'https://reddit.com/r/MachineLearning',
    tags: ['community', 'discussion', 'news']
  },
];

export function Bookshelf() {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';
  const isMobile = useIsMobile();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(!isMobile);
  
  const categories = ['All', 'Tools', 'Learning', 'Research', 'Community', 'Other'];
  
  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={cn(
      "h-full flex flex-col",
      !isDark && "bg-gradient-to-br from-amber-50 to-orange-50 text-amber-900",
      isDark && "bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] text-blue-100"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b",
        !isDark && "bg-white/50 border-amber-200",
        isDark && "bg-black/30 border-blue-500/20"
      )}>
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className={cn("w-6 h-6", isDark ? "text-cyan-400" : "text-amber-600")} />
          <h1 className="text-2xl font-bold">AI Resources Bookshelf</h1>
        </div>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className={cn(
            "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border",
            !isDark && "bg-white border-amber-300",
            isDark && "bg-black/30 border-blue-500/30"
          )}>
            <Search className="w-4 h-4 opacity-50" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "flex-1 bg-transparent outline-none",
                !isDark && "placeholder:text-amber-400",
                isDark && "placeholder:text-blue-400/50"
              )}
            />
          </div>
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-3 py-2 rounded-lg border flex items-center gap-2",
                !isDark && "bg-white border-amber-300 hover:bg-amber-50",
                isDark && "bg-black/30 border-blue-500/30 hover:bg-blue-500/10"
              )}
            >
              <Filter className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Categories */}
        {(!isMobile || showFilters) && (
          <div className={cn(
            "flex-shrink-0 border-r overflow-y-auto",
            isMobile ? "w-full" : "w-48",
            !isDark && "bg-white/30 border-amber-200",
            isDark && "bg-black/20 border-blue-500/20"
          )}>
            <div className="p-3">
              <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">
                Categories
              </div>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    if (isMobile) setShowFilters(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors",
                    !isDark && "hover:bg-amber-100",
                    isDark && "hover:bg-blue-500/10",
                    selectedCategory === category && (
                      isDark ? "bg-cyan-900/50 text-cyan-300" : "bg-amber-200 text-amber-900"
                    )
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content - Resources Grid */}
        {(!isMobile || !showFilters) && (
          <div className="flex-1 overflow-y-auto p-4">
            {isMobile && showFilters === false && (
              <button
                onClick={() => setShowFilters(true)}
                className={cn(
                  "mb-4 px-3 py-2 rounded-lg border flex items-center gap-2",
                  !isDark && "bg-white border-amber-300 hover:bg-amber-50",
                  isDark && "bg-black/30 border-blue-500/30 hover:bg-blue-500/10"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
                Filters
              </button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all hover:scale-[1.02]",
                    !isDark && "bg-white border-amber-200 hover:shadow-lg hover:border-amber-400",
                    isDark && "bg-black/30 border-blue-500/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] hover:border-cyan-500/50"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{resource.title}</h3>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      !isDark && "bg-amber-100 text-amber-700",
                      isDark && "bg-cyan-900/50 text-cyan-300"
                    )}>
                      {resource.category}
                    </span>
                  </div>
                  
                  <p className={cn(
                    "text-sm mb-3 line-clamp-2",
                    !isDark && "text-amber-700",
                    isDark && "text-blue-300"
                  )}>
                    {resource.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          !isDark && "bg-amber-50 text-amber-600",
                          isDark && "bg-blue-900/30 text-blue-400"
                        )}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors",
                      !isDark && "text-amber-600 hover:text-amber-800",
                      isDark && "text-cyan-400 hover:text-cyan-300"
                    )}
                  >
                    Visit Resource <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
            
            {filteredResources.length === 0 && (
              <div className="text-center py-12 opacity-60">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No resources found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
