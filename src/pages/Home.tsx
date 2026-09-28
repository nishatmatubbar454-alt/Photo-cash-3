import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ListFilter,
  Trophy,
  Gift,
  Image as ImageIcon,
  Plus,
  MoreVertical,
  Heart,
  MessageCircle,
  Share2,
  X,
  Maximize2,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Copy,
  Check,
  Smile,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { uploadToImgBB } from '../utils/upload';
import { Story, Post } from '../types';
import { AdBanner300x250 } from '../components/AdBanner300x250';
import { StoryAdBanner } from '../components/StoryAdBanner';


// Facebook-style 60-character expandable caption component
const ExpandableCaption: React.FC<{ content?: string }> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const LIMIT = 60;

  if (!content) return null;

  if (content.length <= LIMIT) {
    return (
      <p className="px-3.5 mt-2 text-xs text-slate-800 leading-relaxed font-sans">
        {content}
      </p>
    );
  }

  return (
    <p
      onClick={() => setIsExpanded(!isExpanded)}
      className="px-3.5 mt-2 text-xs text-slate-800 leading-relaxed font-sans cursor-pointer select-none"
      title="Click to toggle text"
    >
      {isExpanded ? content : `${content.slice(0, LIMIT)}... `}
      <span className="font-extrabold text-slate-500 hover:text-slate-800 ml-1">
        {isExpanded ? 'See less' : 'see more..'}
      </span>
    </p>
  );
};

const EMOJI_PALETTE = [
  '❤️', '🔥', '😍', '👏', '🥳', '💯', '👍', '🌟',
  '🤩', '🎉', '💖', '😂', '🙌', '✨', '🚀', '💰',
  '🤑', '😎', '💐', '👌', '💎', '⚡', '🏆', '👑',
  '🎁', '😻', '😇', '💥', '💫', '🌹', '🥰', '🎈'
];

export const Home: React.FC = () => {
  const {
    currentUser,
    allPosts,
    allStories,
    setActiveTab,
    likePost,
    editPost,
    deletePost,
    addComment,
    deleteComment,
    toggleFollow,
    setDraftImage,
    addStory,
    deleteStory
  } = useAuth();
  const { settings } = useSettings();
  const [activeFilter, setActiveFilter] = useState<'for_you' | 'following' | 'top_earners' | 'rewards'>('for_you');

  // Fullscreen post image viewer state
  const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

  // Story Viewer state
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isUploadingStory, setIsUploadingStory] = useState(false);

  // Post options & management states
  const [menuPost, setMenuPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Emoji comments drawer state
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [lastReactedEmoji, setLastReactedEmoji] = useState<string | null>(null);

  // Share state
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const storyInputRef = useRef<HTMLInputElement>(null);

  const filterTabs = [
    { id: 'for_you', label: 'For you', icon: Sparkles },
    { id: 'following', label: 'Following', icon: ListFilter },
    { id: 'top_earners', label: 'Top earners', icon: Trophy },
    { id: 'rewards', label: 'Rewards', icon: Gift },
  ];

  // Feed photo upload handler -> opens Create post
  const handlePickFromHome = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setActiveTab('create');
      try {
        const url = await uploadToImgBB(file, settings.imageHostingApiKey);
        setDraftImage(url);
      } catch (err) {
        console.error(err);
      }
    }
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // Direct Story Upload Handler -> uploads directly to ImgBB and adds to Stories reel immediately!
  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingStory(true);
      try {
        const url = await uploadToImgBB(file, settings.imageHostingApiKey);
        const newStory = addStory(url);
        // Automatically open the newly uploaded story so the user can see it right away!
        setActiveStoryIndex(0);
      } catch (err) {
        console.error('Failed to upload story', err);
      } finally {
        setIsUploadingStory(false);
      }
    }
    if (storyInputRef.current) storyInputRef.current.value = '';
  };

  // Compute stories for display, seamlessly embedding story ads when enabled
  const displayStories = React.useMemo(() => {
    if (settings.enableStoryAds === false) return allStories;
    const hasAd = allStories.some((s) => s.isAd);
    if (hasAd) return allStories;

    const adStory: Story = {
      id: 'story-ad-featured',
      userId: 'u-trending-sponsor',
      userName: 'Trending Special 🌟',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      caption: 'Exclusive deals & rewards ✨',
      isAd: true,
      createdAt: new Date().toISOString(),
    };

    if (allStories.length === 0) return [adStory];
    const list = [...allStories];
    list.splice(1, 0, adStory);
    return list;
  }, [allStories, settings.enableStoryAds]);

  // Auto-progress timer for Story Viewer
  useEffect(() => {
    if (activeStoryIndex === null) return;
    const timer = setTimeout(() => {
      if (activeStoryIndex < displayStories.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
      } else {
        setActiveStoryIndex(null);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeStoryIndex, displayStories.length]);


  return (
    <div className="flex-1 bg-white pb-20">
      {/* Hidden file input for feed post */}
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handlePickFromHome}
        accept="image/*"
        className="hidden"
      />

      {/* Hidden file input for DIRECT STORY upload */}
      <input
        type="file"
        ref={storyInputRef}
        onChange={handleStoryUpload}
        accept="image/*"
        className="hidden"
      />

      {/* What's on your mind row */}
      <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-2.5">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-9 h-9 rounded-full object-cover border border-slate-200"
        />

        <div
          onClick={() => galleryInputRef.current?.click()}
          className="flex-1 bg-[#f1f5f9] hover:bg-slate-200/70 rounded-full px-3.5 py-2 cursor-pointer text-slate-500 text-xs font-sans transition select-none flex items-center justify-between"
        >
          <span>What's on your mind?</span>
        </div>

        <button
          onClick={() => galleryInputRef.current?.click()}
          className="p-1 text-slate-600 hover:text-slate-900 transition"
          title="Add photo from gallery"
        >
          <ImageIcon className="w-5 h-5 stroke-[1.8]" />
        </button>
      </div>

      {/* Stories Row */}
      <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
        {/* Direct Add Story Card */}
        <div
          onClick={() => !isUploadingStory && storyInputRef.current?.click()}
          className="w-[74px] h-[102px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer flex flex-col justify-between relative group flex-shrink-0 shadow-xs hover:border-slate-300 transition"
          title="Upload photo to story"
        >
          <div className="relative w-full h-[76px] overflow-hidden bg-slate-200">
            <img
              src={currentUser.avatar}
              alt="My Avatar"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/15"></div>

            {/* Center + Badge or Loading Spinner */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#f04438] text-white flex items-center justify-center shadow-md">
              {isUploadingStory ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 stroke-[3]" />
              )}
            </div>
          </div>
          <div className="h-6 bg-white flex items-center justify-center border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-700">
              {isUploadingStory ? 'Uploading...' : 'Add story'}
            </span>
          </div>
        </div>

        {/* Existing Stories Reel */}
        {displayStories.map((story, idx) => (
          <div
            key={story.id}
            onClick={() => setActiveStoryIndex(idx)}
            className={`w-[74px] h-[102px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 cursor-pointer relative group flex-shrink-0 shadow-xs ring-2 transition-all ${
              story.isAd
                ? 'ring-emerald-400 hover:ring-emerald-500'
                : 'ring-[#ff416c]/40 hover:ring-[#ff416c]'
            }`}
            title={`View ${story.userName}'s story`}
          >
            <img
              src={story.mediaUrl}
              alt={story.userName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>

            {/* Avatar Badge with Story Ring */}
            <div
              className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full p-[1.5px] shadow-sm ${
                story.isAd
                  ? 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500'
                  : 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]'
              }`}
            >
              <img
                src={story.userAvatar}
                alt={story.userName}
                className="w-full h-full rounded-full object-cover border border-white"
              />
            </div>

            <span className="absolute bottom-1 left-1.5 right-1.5 text-[9px] font-bold text-white truncate shadow-xs">
              {story.isCurrentUser || story.userId === currentUser.id
                ? 'Your story'
                : story.userName}
            </span>
          </div>
        ))}

      </div>

      {/* Filter Pills */}
      <div className="px-3.5 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeFilter === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold transition flex-shrink-0 select-none ${
                isActive
                  ? 'bg-[#ff5938] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feed Posts */}
      <div className="divide-y divide-slate-100">
        {allPosts.map((post, idx) => (
          <React.Fragment key={post.id}>
            <article className="pt-2 pb-3">
              {/* Post Author Header */}
              <div className="px-3.5 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-xs text-slate-900 font-sans">
                        {post.userName}
                      </h4>
                      {post.userId !== currentUser.id && (
                        <button
                          onClick={() => toggleFollow(post.id)}
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition ${
                            post.isFollowing
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-[#ff5938] hover:bg-[#e04526] text-white'
                          }`}
                        >
                          {post.isFollowing ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-sans block leading-none mt-0.5">
                      {post.dateString}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMenuPost(post)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition"
                  title="More options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Post Media: Instagram Standard Aspect Ratio Container (aspect-[4/5] max-h-[460px]) */}
              {post.imageUrl && (
                <div
                  onClick={() => setFullImageUrl(post.imageUrl || null)}
                  className="w-full bg-slate-950 aspect-[4/5] max-h-[460px] overflow-hidden relative cursor-pointer group select-none flex items-center justify-center"
                  title="Click to view full image"
                >
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                  />

                  {/* Subtle Expand Indicator */}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs rounded-full p-1.5 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Post Caption: 60-character Facebook style expandable toggle */}
              <ExpandableCaption content={post.content} />

              {/* Interaction Bar */}
              <div className="px-3.5 pt-2 flex items-center justify-between text-slate-500">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => likePost(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold py-1 px-1.5 rounded-lg transition active:scale-125 ${
                      post.isLiked ? 'text-[#ff5938]' : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={post.isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart className={`w-4 h-4 transition-colors ${post.isLiked ? 'fill-[#ff5938] stroke-[#ff5938]' : ''}`} />
                    <span className="text-[11px] font-bold">{post.likesCount || 0}</span>
                  </button>

                  <button
                    onClick={() => setCommentingPostId(post.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold py-1 px-1.5 rounded-lg text-slate-600 hover:text-slate-900 active:scale-110 transition"
                    title="ইমোজি কমেন্ট দিন"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-[11px] font-bold">
                      {post.comments ? post.comments.length : (post.commentsCount || 0)}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setSharingPost(post);
                    setCopiedLink(false);
                  }}
                  className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 active:scale-110 transition flex items-center gap-1"
                  title="শেয়ার করুন"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </article>

            {/* Banner Ad between posts */}
            {settings.enableFeedAds !== false && (
              <AdBanner300x250
                adKey={settings.bannerAdKey}
                index={idx}
              />
            )}
          </React.Fragment>
        ))}
      </div>


      {/* FULLSCREEN STORY VIEWER MODAL */}
      {activeStoryIndex !== null && displayStories[activeStoryIndex] && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center max-w-md mx-auto select-none">
          {/* Top Progress Bar */}
          <div className="w-full px-3 pt-3 flex gap-1 z-20">
            {displayStories.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    i < activeStoryIndex
                      ? 'w-full'
                      : i === activeStoryIndex
                      ? 'w-full animate-[progress_6s_linear]'
                      : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Story Header */}
          <div className="w-full px-3.5 py-2.5 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <img
                src={displayStories[activeStoryIndex].userAvatar}
                alt={displayStories[activeStoryIndex].userName}
                className="w-8 h-8 rounded-full object-cover border border-white/80"
              />
              <div>
                <span className="text-xs font-black text-white block leading-tight">
                  {displayStories[activeStoryIndex].userName}
                </span>
                <span className="text-[10px] text-white/70 block leading-tight">
                  {displayStories[activeStoryIndex].isAd ? 'Sponsored' : 'Story (24h)'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* If it's currentUser's story, provide delete option */}
              {(displayStories[activeStoryIndex].isCurrentUser ||
                displayStories[activeStoryIndex].userId === currentUser.id) &&
                !displayStories[activeStoryIndex].isAd && (
                <button
                  onClick={() => {
                    const idToDelete = displayStories[activeStoryIndex].id;
                    deleteStory(idToDelete);
                    if (displayStories.length <= 1) {
                      setActiveStoryIndex(null);
                    } else if (activeStoryIndex >= displayStories.length - 1) {
                      setActiveStoryIndex(activeStoryIndex - 1);
                    }
                  }}
                  className="p-1.5 rounded-full bg-black/40 text-white/90 hover:text-red-400 hover:bg-black/60 transition"
                  title="Delete story"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setActiveStoryIndex(null)}
                className="p-1.5 rounded-full bg-black/40 text-white/90 hover:bg-black/60 transition"
                title="Close story"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Story Main Image with Left/Right Click Nav */}
          <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
            {/* Left Tap for Previous */}
            <div
              onClick={() => {
                if (activeStoryIndex > 0) {
                  setActiveStoryIndex(activeStoryIndex - 1);
                }
              }}
              className="absolute left-0 top-0 bottom-0 w-1/4 z-30 cursor-pointer"
            />

            {/* Right Tap for Next */}
            <div
              onClick={() => {
                if (activeStoryIndex < displayStories.length - 1) {
                  setActiveStoryIndex(activeStoryIndex + 1);
                } else {
                  setActiveStoryIndex(null);
                }
              }}
              className="absolute right-0 top-0 bottom-0 w-1/4 z-30 cursor-pointer"
            />

            {/* If story is an Ad, render StoryAdBanner */}
            {displayStories[activeStoryIndex].isAd ? (
              <StoryAdBanner adKey={settings.bannerAdKey} />
            ) : (
              <img
                src={displayStories[activeStoryIndex].mediaUrl}
                alt="Story media"
                className="w-full h-full object-contain max-h-[82vh]"
              />
            )}

            {/* Previous & Next Arrows for Desktop */}
            {activeStoryIndex > 0 && (
              <button
                onClick={() => setActiveStoryIndex(activeStoryIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white/80 hover:bg-black/70 flex items-center justify-center z-40"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {activeStoryIndex < displayStories.length - 1 && (
              <button
                onClick={() => setActiveStoryIndex(activeStoryIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white/80 hover:bg-black/70 flex items-center justify-center z-40"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Story Caption if available */}
          {displayStories[activeStoryIndex].caption && !displayStories[activeStoryIndex].isAd && (
            <div className="w-full px-4 py-3 bg-gradient-to-t from-black via-black/60 to-transparent text-center z-20">
              <p className="text-white text-xs font-medium">
                {displayStories[activeStoryIndex].caption}
              </p>
            </div>
          )}
        </div>
      )}


      {/* Full-Screen Lightbox Modal for Uncropped Post Image View */}
      {fullImageUrl && (
        <div
          onClick={() => setFullImageUrl(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 animate-in fade-in"
        >
          {/* Close button */}
          <button
            onClick={() => setFullImageUrl(null)}
            className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Full uncropped image */}
          <img
            src={fullImageUrl}
            alt="Full size view"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[92vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
      {/* POST OPTIONS MENU (Bottom Sheet/Modal) */}
      {menuPost && (
        <div
          onClick={() => setMenuPost(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-4 shadow-2xl space-y-2 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-extrabold text-xs text-slate-800">পোস্টের অপশন</h4>
              <button
                onClick={() => setMenuPost(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {menuPost.userId === currentUser.id ? (
              <>
                <button
                  onClick={() => {
                    const p = menuPost;
                    setMenuPost(null);
                    setEditingPost(p);
                    setEditContent(p.content || '');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 text-xs font-bold transition text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">ক্যাপশন এডিট করুন</span>
                    <span className="text-[10px] text-slate-400 font-normal">পোস্টের লেখা পরিবর্তন করুন</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const pid = menuPost.id;
                    setMenuPost(null);
                    setDeletingPostId(pid);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-rose-50 text-rose-600 text-xs font-bold transition text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">পোস্ট ডিলিট করুন</span>
                    <span className="text-[10px] text-rose-400 font-normal">ফিড থেকে চিরতরে মুছে ফেলুন</span>
                  </div>
                </button>
              </>
            ) : null}

            <button
              onClick={() => {
                const url = window.location.origin;
                navigator.clipboard.writeText(url);
                setMenuPost(null);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 text-xs font-bold transition text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <Copy className="w-4 h-4" />
              </div>
              <div>
                <span className="block">লিংক কপি করুন</span>
                <span className="text-[10px] text-slate-400 font-normal">শেয়ার করার জন্য লিংক কপি করুন</span>
              </div>
            </button>

            <button
              onClick={() => {
                const p = menuPost;
                setMenuPost(null);
                setSharingPost(p);
                setCopiedLink(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 text-xs font-bold transition text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <span className="block">শেয়ার করুন</span>
                <span className="text-[10px] text-slate-400 font-normal">টেলিগ্রাম, হোয়াটসঅ্যাপ ইত্যাদিতে</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* EDIT POST MODAL */}
      {editingPost && (
        <div
          onClick={() => setEditingPost(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Edit3 className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">পোস্ট এডিট করুন</h3>
              </div>
              <button
                onClick={() => setEditingPost(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editingPost.imageUrl && (
              <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={editingPost.imageUrl}
                  alt="Post preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ক্যাপশন লিখুন
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                placeholder="নতুন ক্যাপশন লিখুন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#ff5938] resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="flex-1 py-2.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  editPost(editingPost.id, editContent);
                  setEditingPost(null);
                }}
                className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-[#ff5938] to-[#ff416c] text-white text-xs font-bold shadow-md hover:opacity-95 transition cursor-pointer"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingPostId && (
        <div
          onClick={() => setDeletingPostId(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">পোস্টটি মুছে ফেলতে চান?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                এটি চিরতরে মুছে ফেলা হবে এবং ফিড থেকে সরিয়ে নেওয়া হবে।
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPostId(null)}
                className="flex-1 py-2.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePost(deletingPostId);
                  setDeletingPostId(null);
                }}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 transition cursor-pointer"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMOJI-ONLY COMMENTS DRAWER / MODAL */}
      {commentingPostId && (() => {
        const targetPost = allPosts.find((p) => p.id === commentingPostId);
        if (!targetPost) return null;
        const comments = targetPost.comments || [];

        return (
          <div
            onClick={() => setCommentingPostId(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-[#ff5938]" />
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900">
                      ইমোজি কমেন্টস ({comments.length})
                    </h3>
                    <p className="text-[10px] text-slate-400 font-sans">
                      {targetPost.userName}-এর পোস্ট
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCommentingPostId(null)}
                  className="w-7 h-7 rounded-full bg-slate-200/70 text-slate-600 hover:text-slate-900 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reaction Toast */}
              {lastReactedEmoji && (
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 text-center text-xs font-bold flex items-center justify-center gap-1.5 border-b border-emerald-100 animate-in fade-in">
                  <span>রিঅ্যাকশন দেওয়া হয়েছে:</span>
                  <span className="text-lg">{lastReactedEmoji}</span>
                </div>
              )}

              {/* Comments List (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-[160px] max-h-[280px]">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Smile className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="text-xs font-semibold text-slate-600">এখনো কোনো কমেন্ট নেই</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      নিচের যেকোনো ইমোজিতে ট্যাপ করে রিঅ্যাকশন দিন! 👇
                    </p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/70 p-2.5 rounded-2xl transition border border-slate-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={c.userAvatar}
                          alt={c.userName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-800 block leading-tight">
                            {c.userName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-sans block">
                            {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-2xl select-none animate-in zoom-in-75 duration-150">
                          {c.emoji}
                        </span>

                        {(c.userId === currentUser.id || targetPost.userId === currentUser.id) && (
                          <button
                            onClick={() => deleteComment(targetPost.id, c.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 rounded-full transition cursor-pointer"
                            title="মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* STRICTLY EMOJI-ONLY PALETTE (NO TEXT WRITING) */}
              <div className="p-3.5 bg-slate-50 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold text-slate-700">
                    ইমোজি ট্যাপ করে পাঠান:
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                    শুধু ইমোজি সমর্থিত
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-1.5 p-2 bg-white rounded-2xl border border-slate-200 shadow-inner">
                  {EMOJI_PALETTE.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        addComment(targetPost.id, emoji);
                        setLastReactedEmoji(emoji);
                        setTimeout(() => setLastReactedEmoji(null), 1500);
                      }}
                      className="h-10 text-xl rounded-xl hover:bg-slate-100 active:scale-125 transition-transform flex items-center justify-center select-none cursor-pointer"
                      title={`Send ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 text-center mt-2 font-sans">
                  🔒 এখানে কোনো কিছু লেখার সুযোগ নেই, শুধু ইমোজি রিঅ্যাকশন দেওয়া যাবে।
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SHARE POST MODAL */}
      {sharingPost && (
        <div
          onClick={() => setSharingPost(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">পোস্টটি শেয়ার করুন</h3>
              </div>
              <button
                onClick={() => setSharingPost(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {sharingPost.imageUrl && (
              <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <img
                  src={sharingPost.imageUrl}
                  alt="Thumbnail"
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{sharingPost.userName}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{sharingPost.content || 'Photo on PhotoCash'}</p>
                </div>
              </div>
            )}

            {/* Quick Share Links */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(sharingPost.content ? `${sharingPost.content} - PhotoCash` : 'PhotoCash ফটো পোস্ট')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] font-bold text-xs transition justify-center"
              >
                <span>Telegram</span>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${sharingPost.content || 'PhotoCash Post'} ${window.location.origin}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold text-xs transition justify-center"
              >
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-bold text-xs transition justify-center"
              >
                <span>Facebook</span>
              </a>

              <button
                onClick={() => {
                  const url = window.location.origin;
                  navigator.clipboard.writeText(url);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition justify-center cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'কপি হয়েছে!' : 'Copy Link'}</span>
              </button>
            </div>

            {navigator.share && (
              <button
                onClick={() => {
                  navigator.share({
                    title: 'PhotoCash',
                    text: sharingPost.content || 'PhotoCash ফটো পোস্ট',
                    url: window.location.origin,
                  }).catch(() => {});
                }}
                className="w-full py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition cursor-pointer"
              >
                ডিভাইসের অন্য অ্যাপে শেয়ার করুন
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
