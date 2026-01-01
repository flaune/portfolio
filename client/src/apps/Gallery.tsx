import { useOSStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { CaseStudyCard } from '@/components/CaseStudyCard';
import { YouTubeMusicQueue } from '@/components/YouTubeMusicQueue';
import { EpicGamesWishlist } from '@/components/EpicGamesWishlist';
import youtubeBeforeImg from '@assets/image_1766435006257.png';
import epicBeforeImg from '@assets/image_1766437371029.png';

const caseStudies = [
  {
    id: 'youtube-music',
    title: 'YouTube Music Queue Redesign',
    beforeImage: youtubeBeforeImg,
    problem: "YouTube Music's queue interface is cramped and disorganized. Users struggle to understand what's playing next, and interactive options like drag-to-reorder aren't obvious. This poor UX frustrates users and drives them to better-designed competitors like Spotify.",
    solution: "I redesigned the queue with better spacing and visual hierarchy to make songs easier to scan, a clear 'Next Up' badge on the first song, and song numbering for easy reference. Interactive elements appear on hover, keeping the interface clean while making functionality discoverable.",
    businessImpact: "This reduces friction in queue management, encouraging users to spend more time customizing playlists. Improved usability increases engagement with the queue feature, directly improving retention rates. By matching competitor quality, this addresses a major pain point that drives churn.",
    improvements: [
      "Better spacing and visual hierarchy improves scannability",
      "Clear 'Next Up' indicator provides predictability",
      "Song numbering makes navigation intuitive",
      "Hover-reveal interactive elements keep interface clean",
      "Premium feel matches best-in-class competitors"
    ],
    InteractiveComponent: YouTubeMusicQueue
  },
  {
    id: 'epic-games',
    title: 'Epic Games Store Wishlist Redesign',
    beforeImage: epicBeforeImg,
    problem: "The Epic Games Store wishlist feels basic and doesn't help users make purchase decisions. There's no price tracking, no sale predictions, and no social signals. Users miss sales and can't easily manage their wishlists, leading to lower conversion rates.",
    solution: "I redesigned the wishlist with smart filtering, price recommendations, and social proof. Users can filter by sale status or friend interest, see AI-powered purchase timing suggestions, and get notification preferences per game. The interface surfaces actionable insights to drive purchases.",
    businessImpact: "Smart recommendations increase conversion by helping users buy at the right time. Social proof (friend counts) creates urgency and validates purchase decisions. Notification preferences keep users engaged and returning to the store, directly boosting revenue.",
    improvements: [
      "Smart filters help users find games on sale quickly",
      "Price recommendations guide purchase timing",
      "Social proof shows friend interest and popularity",
      "Per-game notification preferences increase engagement",
      "Clean card design makes wishlist management enjoyable"
    ],
    InteractiveComponent: EpicGamesWishlist
  }
];

export function Gallery() {
  const { theme } = useOSStore();
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "h-full w-full overflow-auto",
      isDark ? "bg-gradient-to-b from-[#0a0a14] to-[#0f0f1a]" : "bg-gradient-to-b from-white to-gray-50"
    )}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className={cn(
            "text-3xl md:text-4xl font-bold mb-3",
            !isDark && "text-gray-900",
            isDark && "text-white"
          )}>Featured Work</h1>
          <p className={cn(
            "text-base max-w-2xl mx-auto",
            !isDark && "text-gray-600",
            isDark && "text-gray-400"
          )}>
            Deep dives into UX problems I've solved, demonstrating product thinking and design execution.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {caseStudies.map((study) => (
            <CaseStudyCard key={study.id} caseStudy={study} />
          ))}
        </div>
      </div>
    </div>
  );
}
