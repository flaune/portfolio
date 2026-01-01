import { useState } from "react"
import { Flame, Users, Clock, Grid3x3, Bell, X, Star, TrendingDown, ShoppingCart } from "lucide-react"

import expedition33Img from "@assets/image_1766436986341.png"
import residentEvilImg from "@assets/image_1766436992409.png"
import hades2Img from "@assets/image_1766436976837.png"

type FilterType = "all" | "on-sale" | "friends" | "coming-soon"

interface Game {
  id: number
  title: string
  image: string
  currentPrice: number
  originalPrice: number
  discount: number
  rating: number
  friendCount: number
  popularity: string
  status: "available" | "preorder" | "coming-soon"
  releaseDate: string
  recommendation: string
  recommendationType: "good-price" | "wait"
  recommendationText: string
  wishlistReason: string
}

const GAMES: Game[] = [
  {
    id: 1,
    title: "Clair Obscur: Expedition 33",
    image: expedition33Img,
    currentPrice: 39.99,
    originalPrice: 49.99,
    discount: 20,
    rating: 4.5,
    friendCount: 12,
    popularity: "45.2K wishlisted",
    status: "available",
    releaseDate: "Available now",
    recommendation: "Based on your 120 hours in Final Fantasy XVI",
    recommendationType: "good-price",
    recommendationText: "Good price - typical sale discount",
    wishlistReason: "Because you love turn-based RPGs",
  },
  {
    id: 2,
    title: "Resident Evil: Requiem",
    image: residentEvilImg,
    currentPrice: 69.99,
    originalPrice: 69.99,
    discount: 0,
    rating: 4.8,
    friendCount: 24,
    popularity: "182K wishlisted",
    status: "preorder",
    releaseDate: "Releases Feb 27, 2026",
    recommendation: "RE Village dropped to $34.99 within 90 days of launch",
    recommendationType: "wait",
    recommendationText: "Wait for sales - historically drops 25% in 3 months",
    wishlistReason: "4 friends wishlisted this",
  },
  {
    id: 4,
    title: "Hades II",
    image: hades2Img,
    currentPrice: 29.99,
    originalPrice: 29.99,
    discount: 0,
    rating: 4.9,
    friendCount: 38,
    popularity: "320K wishlisted",
    status: "coming-soon",
    releaseDate: "Coming Q2 2025",
    recommendation: "You've played Hades for 240 hours - this is a must-play sequel",
    recommendationType: "wait",
    recommendationText: "Early Access - may discount at full launch",
    wishlistReason: "Sequel to your favorite roguelike",
  },
]

const FILTERS = [
  { id: "all" as FilterType, label: "All Games", icon: Grid3x3 },
  { id: "on-sale" as FilterType, label: "On Sale", icon: Flame },
  { id: "friends" as FilterType, label: "Friends Interested", icon: Users },
  { id: "coming-soon" as FilterType, label: "Coming Soon", icon: Clock },
]

function FilterTabs({ activeFilter, onFilterChange }: { activeFilter: FilterType; onFilterChange: (filter: FilterType) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {FILTERS.map((filter) => {
        const Icon = filter.icon
        const isActive = activeFilter === filter.id

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-xs transition-all whitespace-nowrap ${
              isActive
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
            }`}
            data-testid={`filter-${filter.id}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}

function GameCard({ game, onRemove }: { game: Game; onRemove: (id: number) => void }) {
  const [showNotificationModal, setShowNotificationModal] = useState(false)

  return (
    <>
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 hover:border-neutral-700 transition-all group">
        <div className="flex gap-3">
          {/* Game Image */}
          <div className="relative flex-shrink-0">
            <img
              src={game.image}
              alt={game.title}
              className="w-16 h-20 object-cover rounded"
            />
            {game.discount > 0 && (
              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                -{game.discount}%
              </div>
            )}
          </div>

          {/* Game Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-white truncate">{game.title}</h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">{game.releaseDate}</p>
              </div>
              
              {/* Price */}
              <div className="text-right flex-shrink-0">
                {game.discount > 0 ? (
                  <>
                    <p className="text-xs text-neutral-500 line-through">${game.originalPrice}</p>
                    <p className="text-sm font-bold text-green-400">${game.currentPrice}</p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-white">${game.currentPrice}</p>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] text-neutral-400">{game.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-neutral-500" />
                <span className="text-[10px] text-neutral-400">{game.friendCount} friends</span>
              </div>
              <span className="text-[10px] text-neutral-500">{game.popularity}</span>
            </div>

            {/* Recommendation */}
            <div className={`flex items-center gap-1.5 mt-2 px-2 py-1 rounded text-[10px] ${
              game.recommendationType === "good-price" 
                ? "bg-green-500/10 text-green-400" 
                : "bg-yellow-500/10 text-yellow-400"
            }`}>
              <TrendingDown className="w-3 h-3" />
              {game.recommendationText}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-800">
          <button 
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
            data-testid={`buy-${game.id}`}
          >
            <ShoppingCart className="w-3 h-3" />
            {game.status === "preorder" ? "Pre-order" : "Buy Now"}
          </button>
          <button 
            onClick={() => setShowNotificationModal(true)}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            data-testid={`notify-${game.id}`}
          >
            <Bell className="w-3.5 h-3.5 text-neutral-400" />
          </button>
          <button 
            onClick={() => onRemove(game.id)}
            className="p-1.5 bg-neutral-800 hover:bg-red-600 rounded transition-colors group"
            data-testid={`remove-${game.id}`}
          >
            <X className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white" />
          </button>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowNotificationModal(false)} />
          <div className="relative bg-neutral-900 border border-neutral-700 rounded-lg w-full max-w-xs mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-sm text-white">Alert Preferences</h3>
              </div>
              <button onClick={() => setShowNotificationModal(false)} className="p-1 hover:bg-neutral-800 rounded transition-colors">
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
            <div className="p-3 space-y-2">
              <button className="w-full text-left px-3 py-2 rounded border border-neutral-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all">
                <p className="text-xs font-medium text-white">Price drops below ${(game.currentPrice * 0.8).toFixed(2)}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Get notified when this game goes on sale</p>
              </button>
              <button className="w-full text-left px-3 py-2 rounded border border-neutral-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all">
                <p className="text-xs font-medium text-white">Major sale begins</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">Epic Mega Sale, seasonal sales & events</p>
              </button>
            </div>
            <div className="flex gap-2 p-3 border-t border-neutral-800">
              <button onClick={() => setShowNotificationModal(false)} className="flex-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowNotificationModal(false)} className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function EpicGamesWishlist() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [games, setGames] = useState(GAMES)

  const filteredGames = games.filter((game) => {
    if (activeFilter === "all") return true
    if (activeFilter === "on-sale") return game.discount > 0
    if (activeFilter === "friends") return game.friendCount > 10
    if (activeFilter === "coming-soon") return game.status !== "available"
    return true
  })

  const handleRemoveGame = (id: number) => {
    setGames(games.filter(g => g.id !== id))
  }

  return (
    <div className="w-full h-full bg-[#0f0f0f] text-white p-4 overflow-auto">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">My Wishlist</h1>
          <span className="text-xs text-neutral-500">{games.length} games</span>
        </div>

        {/* Notification Toggle */}
        <div className="mb-4 flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-500" />
            <p className="text-xs text-neutral-400">Sale notifications</p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              notificationsEnabled ? "bg-blue-600" : "bg-neutral-700"
            }`}
            data-testid="notification-toggle"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                notificationsEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Filters */}
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />

        {/* Games List */}
        <div className="mt-4 space-y-3">
          {filteredGames.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <p className="text-sm">No games match this filter</p>
            </div>
          ) : (
            filteredGames.map((game) => (
              <GameCard key={game.id} game={game} onRemove={handleRemoveGame} />
            ))
          )}
        </div>

        {/* Results Count */}
        <div className="mt-4 text-center text-[10px] text-neutral-600">
          Showing {filteredGames.length} of {games.length} games
        </div>
      </div>
    </div>
  )
}
