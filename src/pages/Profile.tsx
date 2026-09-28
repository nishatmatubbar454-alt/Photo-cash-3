import React, { useState } from 'react';
import {
  MoreHorizontal,
  Edit2,
  DollarSign,
  Grid,
  Image as ImageIcon,
  Film,
  Heart,
  X,
  ShieldCheck,
  Copy,
  Check,
  UserPlus,
  Trash2,
  Edit3,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { processImageUpload } from '../utils/upload';
import { Post } from '../types';

export const Profile: React.FC = () => {
  const {
    currentUser,
    allPosts,
    setActiveTab,
    updateProfile,
    loginAsAdmin,
    createFreshUser,
    editPost,
    deletePost,
    logout
  } = useAuth();
  const [activeTabSub, setActiveTabSub] = useState<'grid' | 'photos' | 'reels'>('grid');
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const myPosts = allPosts.filter((p) => p.userId === currentUser.id);

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImageUpload(file, 400);
        setEditAvatar(processed);
        updateProfile({ avatar: processed });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: editName, avatar: editAvatar });
    setIsEditing(false);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentUser.telegramId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="flex-1 bg-white pb-20 font-sans min-h-screen">
      {/* Top Header with Soft Gradient & Options Menu */}
      <div className="pt-3 px-3.5 pb-1 bg-gradient-to-b from-[#fff7ed]/60 to-white flex justify-end relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-100 flex items-center justify-center text-slate-700 active:scale-95"
        >
          <MoreHorizontal className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-12 right-3.5 z-30 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 space-y-0.5 animate-in fade-in">
            <button
              onClick={() => {
                setShowMenu(false);
                setActiveTab('admin');
              }}
              className="w-full px-3 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#ff5938]" />
              <span>Admin Panel</span>
            </button>

            {currentUser.role !== 'admin' && (
              <button
                onClick={() => {
                  loginAsAdmin();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Switch to Admin</span>
              </button>
            )}

            <button
              onClick={() => {
                createFreshUser();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-slate-500" />
              <span>New Earner Account</span>
            </button>

            <button
              onClick={() => {
                handleCopyId();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center gap-2"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>Copy Telegram ID</span>
            </button>

            <button
              onClick={() => {
                logout();
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>লগআউট (Logout)</span>
            </button>
          </div>
        )}
      </div>

      <div className="px-4 space-y-3">
        {/* Avatar & ID Row */}
        <div className="flex items-start justify-between">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
            />
            {/* Edit Pencil Icon badge */}
            <label className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#f04438] text-white flex items-center justify-center shadow-md cursor-pointer border-2 border-white">
              <Edit2 className="w-3 h-3 stroke-[2.5]" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarPick}
                className="hidden"
              />
            </label>
          </div>

          <div
            onClick={handleCopyId}
            className="mt-3 bg-sky-50 border border-sky-100 rounded-full px-3 py-1 text-[10px] font-bold text-[#0088cc] shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
            title="Click to copy Chat ID"
          >
            <span>Chat ID: {currentUser.telegramId}</span>
            {copiedId ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3 text-sky-400" />
            )}
          </div>
        </div>

        {/* Name & Telegram handle */}
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            {currentUser.name}
          </h2>
          {currentUser.username && (
            <p className="text-xs text-[#0088cc] font-semibold mt-0.5 flex items-center gap-1">
              <span>@{currentUser.username}</span>
            </p>
          )}
        </div>

        {/* 3 Stats Row (Posts, Followers, Following) */}
        <div className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-xs grid grid-cols-3 text-center divide-x divide-slate-100">
          <div>
            <span className="text-sm font-black text-slate-900 block">{myPosts.length}</span>
            <span className="text-[10px] text-slate-400 font-medium">Posts</span>
          </div>
          <div>
            <span className="text-sm font-black text-slate-900 block">{currentUser.followersCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Followers</span>
          </div>
          <div>
            <span className="text-sm font-black text-slate-900 block">{currentUser.followingCount}</span>
            <span className="text-[10px] text-slate-400 font-medium">Following</span>
          </div>
        </div>

        {/* Action Buttons: Edit Profile & Earnings */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setIsEditing(true)}
            className="py-2.5 px-3 rounded-full bg-white border border-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs hover:bg-slate-50 active:scale-95 transition"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit profile</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className="py-2.5 px-3 rounded-full bg-gradient-to-r from-[#ff4b3e] to-[#ff7438] text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition"
          >
            <DollarSign className="w-3.5 h-3.5 stroke-[3]" />
            <span>Earnings ${(currentUser?.balanceUSDT ?? 0).toFixed(2)}</span>
          </button>
        </div>

        {/* 3 Tabs Row: Grid, Photos, Reels */}
        <div className="border-b border-slate-100 flex items-center justify-around pt-1">
          <button
            onClick={() => setActiveTabSub('grid')}
            className={`pb-2.5 px-5 transition relative ${
              activeTabSub === 'grid' ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <Grid className="w-4 h-4 stroke-[2.2]" />
            {activeTabSub === 'grid' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTabSub('photos')}
            className={`pb-2.5 px-5 transition relative ${
              activeTabSub === 'photos' ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <ImageIcon className="w-4 h-4 stroke-[2.2]" />
            {activeTabSub === 'photos' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTabSub('reels')}
            className={`pb-2.5 px-5 transition relative ${
              activeTabSub === 'reels' ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <Film className="w-4 h-4 stroke-[2.2]" />
            {activeTabSub === 'reels' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"></span>
            )}
          </button>
        </div>

        {/* 2-Column Photo Grid with Management View */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          {myPosts.length === 0 ? (
            <div className="col-span-2 text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-1" />
              <p className="text-xs font-bold text-slate-600">কোন পোস্ট নেই</p>
              <p className="text-[11px] text-slate-400 mt-0.5">নতুন ফটো পোস্ট করে USDT আয় করুন!</p>
            </div>
          ) : (
            myPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-xs cursor-pointer group select-none"
                title="পোস্ট বিস্তারিত দেখতে ক্লিক করুন"
              >
                <img
                  src={post.imageUrl}
                  alt="Post item"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Heart Badge at bottom-right */}
                <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs rounded-full px-2 py-0.5 flex items-center gap-1 text-white text-[10px] font-bold">
                  <Heart className="w-2.5 h-2.5 text-white fill-white" />
                  <span>{post.likesCount}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post Viewer & Management Modal */}
      {selectedPost && (
        <div
          onClick={() => setSelectedPost(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl space-y-3"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={selectedPost.userAvatar}
                  alt={selectedPost.userName}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <span className="text-xs font-extrabold text-slate-900">{selectedPost.userName}</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media */}
            {selectedPost.imageUrl && (
              <div className="w-full bg-slate-950 max-h-[300px] flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPost.imageUrl}
                  alt="Post content"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Caption */}
            {selectedPost.content && (
              <p className="px-4 text-xs text-slate-700 leading-relaxed font-sans">
                {selectedPost.content}
              </p>
            )}

            {/* Actions: Edit & Delete buttons */}
            <div className="p-3.5 pt-1 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const p = selectedPost;
                  setSelectedPost(null);
                  setEditingPost(p);
                  setEditContent(p.content || '');
                }}
                className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>এডিট</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const pid = selectedPost.id;
                  setSelectedPost(null);
                  setDeletingPostId(pid);
                }}
                className="flex-1 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ডিলিট</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal in Profile */}
      {editingPost && (
        <div
          onClick={() => setEditingPost(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#ff5938]" />
                পোস্ট এডিট করুন
              </h3>
              <button
                onClick={() => setEditingPost(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ক্যাপশন পরিবর্তন করুন
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

      {/* Delete Post Modal in Profile */}
      {deletingPostId && (
        <div
          onClick={() => setDeletingPostId(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-center"
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

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Edit profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#ff5938]"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#ff5938] text-white text-xs font-bold shadow-md hover:bg-[#e04526]"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
