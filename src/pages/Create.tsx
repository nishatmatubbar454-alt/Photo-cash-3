import React, { useState, useRef } from 'react';
import { Image, Sparkles, Send, X, Camera, Plus, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { processImageUpload } from '../utils/upload';

export const Create: React.FC = () => {
  const { addPost, addStory, currentUser } = useAuth();
  const { settings } = useSettings();

  const [mode, setMode] = useState<'post' | 'story'>('post');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>(['SocialCash']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80',
  ];

  const popularTags = ['Bangladesh', 'Nature', 'Earning', 'Motivation', 'LifeUpdate', 'Dhaka'];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const processed = await processImageUpload(file);
        setImageUrl(processed);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'post' && !content.trim() && !imageUrl) return;
    if (mode === 'story' && !imageUrl) return;

    setIsSubmitting(true);
    setTimeout(() => {
      if (mode === 'post') {
        addPost(content, imageUrl || undefined, tags);
      } else {
        addStory(imageUrl, content || undefined);
      }
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="flex-1 p-4 pb-20">
      {/* Page Title & Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-100">
            {mode === 'post' ? 'নতুন পোস্ট তৈরি করুন' : 'নতুন স্টোরি দিন'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'post' 
              ? `পোস্ট করলেই পাবেন +${settings.postRewardCoins} ফ্রি কয়েন!`
              : 'স্টোরি শেয়ার করে সবার সাথে যুক্ত থাকুন'}
          </p>
        </div>

        {/* Post/Story Toggle */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('post')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              mode === 'post' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            পোস্ট
          </button>
          <button
            type="button"
            onClick={() => setMode('story')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              mode === 'story' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            স্টোরি
          </button>
        </div>
      </div>

      {/* Reward Announcement Banner */}
      <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="text-xs text-amber-200">
          পোস্ট পাবলিশ হওয়ার সাথে সাথেই আপনার ওয়ালেটে <strong className="text-amber-300">+{settings.postRewardCoins} কয়েন</strong> জমা হয়ে যাবে।
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author preview */}
        <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-700"
          />
          <div>
            <h4 className="text-xs font-bold text-slate-200">{currentUser.name}</h4>
            <span className="text-[10px] text-emerald-400 font-medium">পাবলিক পোস্ট</span>
          </div>
        </div>

        {/* Textarea */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 focus-within:border-rose-500/60 transition">
          <textarea
            placeholder={
              mode === 'post'
                ? 'আপনার মনে কী আছে লিখুন? (শেয়ার করুন অভিজ্ঞতা, আয় বা সুন্দর কোনো মুহূর্ত)...'
                : 'স্টোরির জন্য ক্যাপশন লিখুন...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={mode === 'post' ? 4 : 2}
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
          />
          <div className="text-right text-[10px] text-slate-500 pt-1">
            {content.length} অক্ষর
          </div>
        </div>

        {/* Image preview / uploader */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-2">
            ছবি যুক্ত করুন (Image)
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-64 flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Selected"
                className="w-full h-auto max-h-64 object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-rose-500/50 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-900/40 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-rose-500/20 text-slate-400 group-hover:text-rose-400 mx-auto flex items-center justify-center transition mb-2">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-300">ডিভাইস থেকে ছবি আপলোড করুন</p>
              <p className="text-[10px] text-slate-500 mt-1">PNG, JPG অথবা WEBP ফাইল সাপোর্টেড</p>
            </div>
          )}

          {/* Preset image suggestions */}
          {!imageUrl && (
            <div className="mt-3">
              <span className="text-[11px] text-slate-400 mb-1.5 block">অথবা নমুনা ছবি বেছে নিন:</span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sampleImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Sample"
                    onClick={() => setImageUrl(img)}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-800 hover:border-rose-500 cursor-pointer flex-shrink-0 transition"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags (for posts) */}
        {mode === 'post' && (
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              হ্যাশট্যাগ যুক্ত করুন
            </label>
            <div className="flex flex-wrap gap-1.5">
              {popularTags.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition flex items-center gap-1 ${
                      active
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>#{tag}</span>
                    {active && <Check className="w-3 h-3 text-rose-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || (mode === 'post' && !content.trim() && !imageUrl) || (mode === 'story' && !imageUrl)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2 active:scale-95 transition"
        >
          {isSubmitting ? (
            <span>পাবলিশ হচ্ছে...</span>
          ) : (
            <>
              <Send className="w-4 h-4 translate-x-0.5" />
              <span>{mode === 'post' ? 'পোস্ট করুন এবং কয়েন নিন' : 'স্টোরি শেয়ার করুন'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
