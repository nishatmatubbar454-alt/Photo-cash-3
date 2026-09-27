import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle2, Bookmark, Coins } from 'lucide-react';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { timeAgo } from '../utils/format';

interface PostCardProps {
  post: Post;
  onOpenComments: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onOpenComments }) => {
  const { likePost, setSelectedUser, setActiveTab } = useAuth();
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = () => {
    likePost(post.id);
    if (!post.isLiked) {
      setShowHeartPop(true);
      setTimeout(() => setShowHeartPop(false), 900);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'SocialCash Post',
      text: post.content.substring(0, 100),
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log(err);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}?post=${post.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewUser = () => {
    setSelectedUser({
      id: post.userId,
      name: post.userName,
      username: post.userName.toLowerCase().replace(/\s+/g, '_'),
      avatar: post.userAvatar,
      bio: 'SocialCash এর একজন সক্রিয় মেম্বার 🌟',
      coins: 1820,
      balanceBDT: 18.20,
      role: 'user',
      phone: '018XXXXXXXX',
      referralCode: post.userName.substring(0, 4).toUpperCase() + '99',
      referralCount: 8,
      totalEarnedBDT: 320,
      joinedDate: '2025-01-15',
      followersCount: 195,
      followingCount: 110,
    });
    setActiveTab('user-profile');
  };

  return (
    <article className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden mb-4 shadow-sm hover:border-slate-700/60 transition-all">
      {/* Header */}
      <div className="p-3.5 flex items-center justify-between">
        <div 
          onClick={handleViewUser}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img
              src={post.userAvatar}
              alt={post.userName}
              className="w-10 h-10 rounded-full object-cover border border-slate-700 group-hover:border-rose-500 transition"
            />
            {post.userBadge && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-2 ring-slate-900">
                <CheckCircle2 className="w-2.5 h-2.5" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-sm text-slate-100 group-hover:text-rose-400 transition">
                {post.userName}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">{timeAgo(post.createdAt)}</span>
              {post.userBadge && (
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                  {post.userBadge}
                </span>
              )}
            </div>
          </div>
        </div>

        <button className="text-slate-500 hover:text-slate-300 p-1 rounded-full">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content text */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div 
          onDoubleClick={handleLike}
          className="relative w-full max-h-[460px] bg-slate-950 flex items-center justify-center overflow-hidden cursor-pointer select-none"
        >
          <img
            src={post.imageUrl}
            alt="Post media"
            className="w-full h-auto max-h-[460px] object-cover hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />

          {/* Double-tap floating heart pop */}
          {showHeartPop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center animate-float-up">
                <Heart className="w-20 h-20 text-rose-500 fill-rose-500 drop-shadow-2xl" />
                <span className="mt-1 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> +2 কয়েন
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions & counters */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-slate-800/60 text-slate-400">
        <div className="flex items-center gap-5">
          {/* Like button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold transition active:scale-90 ${
              post.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-rose-500 stroke-rose-500' : ''}`} />
            <span>{post.likesCount}</span>
          </button>

          {/* Comment button */}
          <button
            onClick={() => onOpenComments(post.id)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-sky-400 transition"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.commentsCount}</span>
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'কপি হয়েছে!' : 'শেয়ার'}</span>
          </button>
        </div>

        {/* Bookmark save */}
        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`p-1.5 rounded-full transition ${
            isSaved ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
        </button>
      </div>
    </article>
  );
};
