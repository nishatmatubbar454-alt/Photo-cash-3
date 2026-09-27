import React, { useState } from 'react';
import { ArrowLeft, UserPlus, UserCheck, MessageSquare, Grid, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import { CommentSheet } from '../components/CommentSheet';
import { formatCoins } from '../utils/format';

export const UserProfile: React.FC = () => {
  const { selectedUser, allPosts, setActiveTab, setSelectedUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  if (!selectedUser) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>ইউজার খুঁজে পাওয়া যায়নি</p>
        <button
          onClick={() => setActiveTab('home')}
          className="mt-3 px-4 py-2 bg-slate-800 text-slate-200 rounded-xl text-xs"
        >
          হোমে ফিরে যান
        </button>
      </div>
    );
  }

  const userPosts = allPosts.filter((p) => p.userId === selectedUser.id);

  return (
    <div className="flex-1 pb-20">
      {/* Top Bar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center gap-3">
        <button
          onClick={() => {
            setSelectedUser(null);
            setActiveTab('home');
          }}
          className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-extrabold text-sm text-white">{selectedUser.name}</h3>
          <span className="text-[10px] text-slate-400 font-mono">@{selectedUser.username}</span>
        </div>
      </div>

      {/* User Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <img
            src={selectedUser.avatar}
            alt={selectedUser.name}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-slate-700 shadow-xl"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                isFollowing
                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>ফলোয়িং</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>ফলো করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-base font-extrabold text-white flex items-center gap-1.5">
            <span>{selectedUser.name}</span>
            <CheckCircle2 className="w-4 h-4 text-rose-500" />
          </h2>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {selectedUser.bio}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-black text-white block">{userPosts.length}</span>
            <span className="text-[10px] text-slate-400">পোস্ট</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-black text-white block">
              {selectedUser.followersCount + (isFollowing ? 1 : 0)}
            </span>
            <span className="text-[10px] text-slate-400">ফলোয়ার</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-black text-amber-300 block">
              {formatCoins(selectedUser.coins)}
            </span>
            <span className="text-[10px] text-slate-400">কয়েন</span>
          </div>
        </div>
      </div>

      {/* User Posts */}
      <div className="p-4">
        <h4 className="text-xs font-extrabold text-slate-300 mb-3 flex items-center gap-1.5">
          <Grid className="w-4 h-4 text-rose-400" />
          <span>পোস্টসমূহ</span>
        </h4>

        {userPosts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-500 text-xs">
            এই ইউজারের কোনো পাবলিক পোস্ট নেই
          </div>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenComments={(id) => setActiveCommentPostId(id)}
            />
          ))
        )}
      </div>

      {/* Comments Drawer */}
      {activeCommentPostId && (
        <CommentSheet
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />
      )}
    </div>
  );
};
