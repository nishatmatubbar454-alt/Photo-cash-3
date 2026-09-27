import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { timeAgo } from '../utils/format';

interface CommentSheetProps {
  postId: string;
  onClose: () => void;
}

export const CommentSheet: React.FC<CommentSheetProps> = ({ postId, onClose }) => {
  const { allComments, addComment, currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');

  const comments = allComments.filter((c) => c.postId === postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(postId, commentText);
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-100">মন্তব্যসমূহ (Comments)</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
              {comments.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px]">
          {comments.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">এখনও কোনো মন্তব্য করা হয়নি।</p>
              <p className="text-xs text-slate-600 mt-1">প্রথম মন্তব্যটি আপনিই করুন!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3 items-start">
                <img
                  src={c.userAvatar}
                  alt={c.userName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5 border border-slate-700"
                />
                <div className="flex-1 bg-slate-800/70 p-3 rounded-2xl rounded-tl-sm border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{c.userName}</span>
                    <span className="text-[10px] text-slate-500">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2 items-center">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-700 hidden sm:block"
          />
          <input
            type="text"
            placeholder="একটি মন্তব্য লিখুন..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-slate-800/90 border border-slate-700 rounded-full px-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 disabled:hover:bg-rose-500 text-white flex items-center justify-center transition shadow-md shadow-rose-500/20"
          >
            <Send className="w-4 h-4 translate-x-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
