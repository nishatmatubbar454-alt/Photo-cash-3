import React, { useState } from 'react';
import { StoryBar } from '../components/StoryBar';
import { PostCard } from '../components/PostCard';
import { BannerAd } from '../components/BannerAd';
import { CommentSheet } from '../components/CommentSheet';
import { useFeed } from '../hooks/useFeed';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Flame, Clock, Sparkles, Gift, CheckCircle, Search, Volume2 } from 'lucide-react';

export const Home: React.FC = () => {
  const { posts, filter, setFilter, searchQuery, setSearchQuery, activeCommentPostId, setActiveCommentPostId } = useFeed();
  const { currentUser, claimDailyBonus } = useAuth();
  const { settings } = useSettings();
  const [dailyClaimMsg, setDailyClaimMsg] = useState<string | null>(null);

  const today = new Date().toDateString();
  const hasClaimedToday = currentUser.lastDailyClaim === today;

  const handleClaim = () => {
    const res = claimDailyBonus();
    setDailyClaimMsg(res.message);
    setTimeout(() => setDailyClaimMsg(null), 3500);
  };

  return (
    <div className="flex-1 pb-4">
      {/* Notice Banner */}
      {settings.noticeText && (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/80 border-b border-rose-500/20 px-3 py-2 flex items-center gap-2 text-xs text-rose-200">
          <Volume2 className="w-4 h-4 text-rose-400 flex-shrink-0 animate-bounce" />
          <div className="overflow-hidden whitespace-nowrap w-full">
            <span className="inline-block animate-marquee">{settings.noticeText}</span>
          </div>
        </div>
      )}

      {/* Stories Carousel */}
      <StoryBar />

      {/* Daily Bonus Card */}
      <div className="mx-4 mt-3 mb-2 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/50 to-pink-900/60 border border-purple-500/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 shadow-md">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>দৈনিক ফ্রি বোনাস</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-extrabold">
                +{settings.dailyBonusCoins} কয়েন
              </span>
            </h4>
            <p className="text-[11px] text-purple-200/70 mt-0.5">
              প্রতিদিন লগইন করে ফ্রিতে কয়েন নিন
            </p>
          </div>
        </div>

        <div>
          {hasClaimedToday ? (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>আজকেরটি শেষ</span>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 text-slate-950 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition"
            >
              ক্লেইম করুন
            </button>
          )}
        </div>
      </div>

      {dailyClaimMsg && (
        <div className="mx-4 my-2 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs text-center font-medium animate-in fade-in">
          {dailyClaimMsg}
        </div>
      )}

      {/* Feed Filter Tabs & Search */}
      <div className="px-4 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setFilter('for_you')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
              filter === 'for_you'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>সকল</span>
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
              filter === 'trending'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>জনপ্রিয়</span>
          </button>
          <button
            onClick={() => setFilter('latest')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
              filter === 'latest'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>নতুন</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-[140px]">
          <input
            type="text"
            placeholder="খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
        </div>
      </div>

      {/* Sponsored Banner Ad */}
      <BannerAd />

      {/* Posts List */}
      <div className="px-4 mt-2">
        {posts.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <p className="text-sm">কোনো পোস্ট খুঁজে পাওয়া যায়নি</p>
            <p className="text-xs text-slate-600 mt-1">নতুন একটি পোস্ট তৈরি করুন ও কয়েন ইনকাম করুন!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenComments={(id) => setActiveCommentPostId(id)}
            />
          ))
        )}
      </div>

      {/* Comments Bottom Sheet Drawer */}
      {activeCommentPostId && (
        <CommentSheet
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />
      )}
    </div>
  );
};
