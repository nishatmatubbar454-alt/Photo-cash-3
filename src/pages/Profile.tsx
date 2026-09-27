import React, { useState } from 'react';
import {
  Settings,
  Edit3,
  Share2,
  Coins,
  Shield,
  Send,
  History,
  Users,
  Grid,
  Heart,
  Check,
  X,
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PostCard } from '../components/PostCard';
import { CommentSheet } from '../components/CommentSheet';
import { formatBDT, formatCoins } from '../utils/format';
import { processImageUpload } from '../utils/upload';

export const Profile: React.FC = () => {
  const { currentUser, allPosts, updateProfile, setActiveTab, toggleRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState<'posts' | 'saved'>('posts');
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const myPosts = allPosts.filter((p) => p.userId === currentUser.id);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImageUpload(file, 400);
        setEditAvatar(processed);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      bio: editBio,
      phone: editPhone,
      avatar: editAvatar,
    });
    setIsEditing(false);
  };

  return (
    <div className="flex-1 pb-20">
      {/* Profile Header */}
      <div className="relative px-4 pt-6 pb-4 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="flex items-start justify-between">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl p-1 bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 shadow-xl shadow-rose-500/10">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full rounded-[20px] object-cover bg-slate-900"
              />
            </div>
            {currentUser.role === 'admin' && (
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-purple-600 text-[9px] font-black text-white shadow-md border border-purple-400">
                ADMIN
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>এডিট</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 border border-purple-500/40 text-purple-300 transition"
              title="এডমিন প্যানেল"
            >
              <Shield className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-3">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>{currentUser.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
              ৳{formatBDT(currentUser.balanceBDT)}
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">@{currentUser.username}</p>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {currentUser.bio}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
            <span className="text-xs font-black text-white block">{myPosts.length}</span>
            <span className="text-[10px] text-slate-400">পোস্ট</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
            <span className="text-xs font-black text-amber-300 block">{formatCoins(currentUser.coins)}</span>
            <span className="text-[10px] text-slate-400">কয়েন</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
            <span className="text-xs font-black text-emerald-400 block">৳{currentUser.totalEarnedBDT.toFixed(0)}</span>
            <span className="text-[10px] text-slate-400">মোট আয়</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
            <span className="text-xs font-black text-white block">{currentUser.referralCount}</span>
            <span className="text-[10px] text-slate-400">রেফার</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Menu */}
      <div className="p-4 space-y-2">
        <div
          onClick={() => setActiveTab('wallet')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">ওয়ালেট ও ক্যাশআউট</h4>
              <p className="text-[10px] text-slate-400">বিকাশ ও নগদে টাকা উত্তোলন করুন</p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-400">৳{currentUser.balanceBDT.toFixed(2)}</span>
        </div>

        <div
          onClick={() => setActiveTab('refer')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">রেফারেল বোনাস প্রোগ্রাম</h4>
              <p className="text-[10px] text-slate-400">কোড: {currentUser.referralCode}</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
            +100 Coins
          </span>
        </div>

        <div
          onClick={() => setActiveTab('admin')}
          className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 hover:border-purple-500/60 flex items-center justify-between cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-purple-200">এডমিন ড্যাশবোর্ড (Admin Panel)</h4>
              <p className="text-[10px] text-purple-300/70">ক্যাশআউট অনুমোদন ও সেটিংস পরিবর্তন</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
            ম্যানেজ
          </span>
        </div>

        <a
          href="https://t.me/socialcashbd_official"
          target="_blank"
          rel="noopener noreferrer"
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">টেলিগ্রাম অফিসিয়াল গ্রুপ</h4>
              <p className="text-[10px] text-slate-400">পেমেন্ট প্রুফ ও সার্বক্ষণিক সাপোর্ট</p>
            </div>
          </div>
          <span className="text-xs text-sky-400 font-bold">জয়েন করুন</span>
        </a>
      </div>

      {/* Posts Section */}
      <div className="px-4 mt-2">
        <h3 className="text-xs font-extrabold text-slate-200 mb-3 flex items-center gap-1.5">
          <Grid className="w-4 h-4 text-rose-400" />
          <span>আমার পোস্টসমূহ ({myPosts.length})</span>
        </h3>

        {myPosts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-500">
            <p className="text-xs">আপনি এখনও কোনো পোস্ট করেননি।</p>
            <button
              onClick={() => setActiveTab('create')}
              className="mt-3 px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold"
            >
              প্রথম পোস্ট তৈরি করুন
            </button>
          </div>
        ) : (
          myPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpenComments={(id) => setActiveCommentPostId(id)}
            />
          ))
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-extrabold text-sm text-white">প্রোফাইল এডিট করুন</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              {/* Avatar Picker */}
              <div className="flex items-center gap-3">
                <img
                  src={editAvatar}
                  alt="Avatar"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700"
                />
                <div>
                  <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 border border-slate-700">
                    <Camera className="w-3.5 h-3.5" />
                    <span>ছবি পরিবর্তন</span>
                    <input
                      type="file"
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1">সর্বোচ্চ ২ MB ছবি আপলোড করুন</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">নাম</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">বায়ো (Bio)</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
