import type React from "react"
import { useState } from "react"
import { Music, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, GripVertical, X } from "lucide-react"

import duaLipaImg from "@assets/image_1766433868786.png"
import edSheeranImg from "@assets/image_1766433877750.png"
import harryStylesImg from "@assets/image_1766433884900.png"
import oliviaRodrigoImg from "@assets/image_1766433891019.png"
import taylorSwiftImg from "@assets/image_1766433897315.png"
import theWeekndImg from "@assets/image_1766433903376.png"

type Song = {
  id: string
  title: string
  artist: string
  duration: string
  thumbnail: string
}

export function YouTubeMusicQueue() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime] = useState(142)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [draggedOver, setDraggedOver] = useState<string | null>(null)

  const [currentSong] = useState<Song>({
    id: "current",
    title: "Blinding Lights",
    artist: "The Weeknd",
    duration: "3:20",
    thumbnail: theWeekndImg,
  })

  const [queue, setQueue] = useState<Song[]>([
    { id: "1", title: "Levitating", artist: "Dua Lipa", duration: "3:23", thumbnail: duaLipaImg },
    { id: "2", title: "Anti-Hero", artist: "Taylor Swift", duration: "3:20", thumbnail: taylorSwiftImg },
    { id: "3", title: "As It Was", artist: "Harry Styles", duration: "2:47", thumbnail: harryStylesImg },
    { id: "6", title: "good 4 u", artist: "Olivia Rodrigo", duration: "2:58", thumbnail: oliviaRodrigoImg },
    { id: "7", title: "Shivers", artist: "Ed Sheeran", duration: "3:27", thumbnail: edSheeranImg },
  ])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const totalDuration = 200
  const progress = (currentTime / totalDuration) * 100

  const handleRemoveSong = (id: string) => {
    const element = document.getElementById(`song-${id}`)
    if (element) {
      element.style.opacity = "0"
      element.style.transform = "translateX(20px)"
      setTimeout(() => {
        setQueue(queue.filter((song) => song.id !== id))
      }, 200)
    } else {
      setQueue(queue.filter((song) => song.id !== id))
    }
  }

  const handleDragStart = (id: string) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDraggedOver(id)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()

    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null)
      setDraggedOver(null)
      return
    }

    const draggedIndex = queue.findIndex((song) => song.id === draggedItem)
    const targetIndex = queue.findIndex((song) => song.id === targetId)

    const newQueue = [...queue]
    const [removed] = newQueue.splice(draggedIndex, 1)
    newQueue.splice(targetIndex, 0, removed)

    setQueue(newQueue)
    setDraggedItem(null)
    setDraggedOver(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDraggedOver(null)
  }

  const clearQueue = () => {
    setQueue([])
  }

  return (
    <div className="w-full h-full bg-black text-white p-4 overflow-auto">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Song Section */}
        <div className="flex flex-col">
          <div className="bg-neutral-900 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 text-neutral-400 text-xs mb-3">
              <Music className="w-3 h-3" />
              <span>NOW PLAYING</span>
            </div>

            {/* Album Art */}
            <div className="relative mb-4 group">
              <img
                src={currentSong.thumbnail}
                alt={currentSong.title}
                className="w-full aspect-square rounded-lg shadow-lg object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Song Info */}
            <div className="mb-4">
              <h1 className="text-xl font-bold mb-1 text-balance">{currentSong.title}</h1>
              <p className="text-sm text-neutral-400">{currentSong.artist}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="relative h-1 bg-neutral-800 rounded-full mb-2 group cursor-pointer">
                <div
                  className="absolute h-full bg-red-600 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute w-2.5 h-2.5 bg-red-600 rounded-full top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
                />
              </div>
              <div className="flex justify-between text-xs text-neutral-400">
                <span>{formatTime(currentTime)}</span>
                <span>{currentSong.duration}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <button className="text-neutral-400 hover:text-white transition-colors p-1.5">
                <Shuffle className="w-4 h-4" />
              </button>
              <button className="text-neutral-400 hover:text-white transition-colors p-1.5">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white text-black rounded-full p-3 hover:scale-105 transition-transform shadow-lg"
                data-testid="play-pause-btn"
              >
                {isPlaying ? <Pause className="w-5 h-5" fill="black" /> : <Play className="w-5 h-5" fill="black" />}
              </button>
              <button className="text-neutral-400 hover:text-white transition-colors p-1.5">
                <SkipForward className="w-5 h-5" />
              </button>
              <button className="text-neutral-400 hover:text-white transition-colors p-1.5">
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-neutral-400" />
              <div className="flex-1 h-1 bg-neutral-800 rounded-full relative group cursor-pointer">
                <div className="absolute h-full bg-white rounded-full w-[70%]" />
                <div className="absolute w-2.5 h-2.5 bg-white rounded-full top-1/2 left-[70%] -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Queue Section */}
        <div className="flex flex-col">
          <div className="bg-neutral-900 rounded-xl p-4 shadow-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Up Next</h2>
                <div className="inline-flex items-center gap-2">
                  <span className="text-xs text-neutral-400">
                    {queue.length} {queue.length === 1 ? "song" : "songs"} in queue
                  </span>
                  {queue.length > 0 && (
                    <span className="bg-neutral-800 text-neutral-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {queue.length}
                    </span>
                  )}
                </div>
              </div>
              {queue.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="text-xs text-neutral-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-800"
                  data-testid="clear-queue-btn"
                >
                  Clear
                </button>
              )}
            </div>

            {queue.length > 0 && (
              <div className="h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent mb-4" />
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[280px]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#404040 transparent' }}>
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-neutral-500 py-8">
                  <Music className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Queue is empty</p>
                  <p className="text-xs">Add songs to see them here</p>
                </div>
              ) : (
                queue.map((song, index) => (
                  <div
                    key={song.id}
                    id={`song-${song.id}`}
                    draggable
                    onDragStart={() => handleDragStart(song.id)}
                    onDragOver={(e) => handleDragOver(e, song.id)}
                    onDrop={(e) => handleDrop(e, song.id)}
                    onDragEnd={handleDragEnd}
                    className={`group relative flex items-center gap-2 p-2.5 rounded-lg transition-all duration-200 cursor-move ${
                      draggedItem === song.id ? "opacity-40 scale-[0.98]" : ""
                    } ${
                      draggedOver === song.id
                        ? "bg-neutral-700 ring-2 ring-red-500 ring-offset-2 ring-offset-black scale-[1.02]"
                        : index === 0
                          ? "bg-gradient-to-r from-red-950/20 to-neutral-800/50 hover:from-red-950/30 hover:to-neutral-800/70"
                          : "bg-neutral-800/30 hover:bg-neutral-800"
                    }`}
                    data-testid={`queue-song-${song.id}`}
                  >
                    <div className="flex-shrink-0 w-5 text-center">
                      <span className="text-[10px] font-medium text-neutral-500 group-hover:opacity-0 transition-opacity">
                        {index + 1}
                      </span>
                    </div>

                    <div className="absolute left-2 flex-shrink-0 text-neutral-500 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex-shrink-0 relative">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-10 h-10 rounded shadow-md ring-1 ring-white/5 object-cover"
                      />
                      {index === 0 && (
                        <>
                          <div className="absolute -top-1 -left-1 bg-red-600 text-white text-[7px] font-bold px-1 py-0.5 rounded-sm shadow-lg tracking-wider">
                            NEXT
                          </div>
                          <div className="absolute inset-0 rounded ring-2 ring-red-500/30 animate-pulse" />
                        </>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 ml-1">
                      <h3
                        className={`font-bold text-sm truncate mb-0.5 ${index === 0 ? "text-white" : "text-neutral-100 group-hover:text-white"} transition-colors`}
                      >
                        {song.title}
                      </h3>
                      <p className="text-xs text-neutral-500 group-hover:text-neutral-400 truncate transition-colors">
                        {song.artist}
                      </p>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-2">
                      <span className="text-[10px] text-neutral-500 font-medium tabular-nums">{song.duration}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveSong(song.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-neutral-500 hover:text-white hover:bg-red-600 p-1 rounded-md"
                        aria-label="Remove from queue"
                        data-testid={`remove-song-${song.id}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
