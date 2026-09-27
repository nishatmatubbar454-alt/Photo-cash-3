import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Story } from '../types';

export const StoryBar: React.FC = () => {
  const { allStories, currentUser, setActiveTab } = useAuth();
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Auto-advance story timer
  useEffect(() => {
    if (activeStoryIndex === null) {
      setProgress(0);
      return;
    }

    const interval = 50; // ms
    const step = 100 / (5000 / interval); // 5 seconds per story

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance or close
          if (activeStoryIndex < allStories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStoryIndex, allStories.length]);

  const activeStory: Story | null =
    activeStoryIndex !== null ? allStories[activeStoryIndex] : null;

  return (
    <div className="py-3 px-4 bg-slate-900/60 border-b border-slate-800/80">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
        {/* Add story button */}
        <div 
          onClick={() => setActiveTab('create')}
          className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
        >
          <div className="relative w-16 h-16 rounded-full p-[2px] bg-slate-800 group-hover:bg-slate-700 transition">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover rounded-full"
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-rose-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-md">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] font-medium text-slate-300 truncate w-16 text-center">
            আপনার স্টোরি
          </span>
        </div>

        {/* Stories list */}
        {allStories.map((story, index) => (
          <div
            key={story.id}
            onClick={() => {
              setActiveStoryIndex(index);
              setProgress(0);
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full p-[2px] story-ring-active group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full rounded-full p-[2px] bg-slate-900">
                <img
                  src={story.userAvatar}
                  alt={story.userName}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-300 truncate w-16 text-center">
              {story.userName.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-0 md:p-4 backdrop-blur-lg">
          <div className="relative w-full max-w-sm h-full md:h-[680px] bg-slate-950 rounded-none md:rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
            {/* Top progress bars */}
            <div className="absolute top-0 left-0 right-0 z-20 p-3 pt-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex gap-1.5 mb-2">
                {allStories.map((_, i) => (
                  <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width:
                          i < activeStoryIndex!
                            ? '100%'
                            : i === activeStoryIndex
                            ? `${progress}%`
                            : '0%',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Author info & Close */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={activeStory.userAvatar}
                    alt={activeStory.userName}
                    className="w-9 h-9 rounded-full object-cover border border-white/40"
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">
                      {activeStory.userName}
                    </p>
                    <p className="text-[10px] text-white/70">স্টোরি আপডেট</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveStoryIndex(null)}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Image */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={activeStory.mediaUrl}
                alt="Story content"
                className="w-full h-full object-cover select-none"
              />

              {/* Navigation overlays */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeStoryIndex! > 0) {
                    setActiveStoryIndex(activeStoryIndex! - 1);
                    setProgress(0);
                  }
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeStoryIndex! < allStories.length - 1) {
                    setActiveStoryIndex(activeStoryIndex! + 1);
                    setProgress(0);
                  } else {
                    setActiveStoryIndex(null);
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Caption bottom bar */}
            {activeStory.caption && (
              <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <p className="text-sm font-medium text-white text-center drop-shadow-md">
                  {activeStory.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
