import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, X, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { uploadToImgBB } from '../utils/upload';
import { safeNumber } from '../utils/format';

export const Create: React.FC = () => {
  const { currentUser, addPost, addStory, setActiveTab, draftImage, setDraftImage } = useAuth();
  const { settings } = useSettings();

  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState(draftImage || '');
  const [postType, setPostType] = useState<'feed' | 'story'>('feed');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoOpenCountdown, setAutoOpenCountdown] = useState<number | null>(2);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPromiseRef = useRef<Promise<string> | null>(null);
  const hasAutoPromptedRef = useRef(false);

  // Sync draftImage if set
  useEffect(() => {
    if (draftImage) {
      setImageUrl(draftImage);
    }
  }, [draftImage]);

  // When Create page opens, wait exactly 2 seconds, then automatically trigger device gallery
  useEffect(() => {
    if (!imageUrl && !hasAutoPromptedRef.current) {
      hasAutoPromptedRef.current = true;

      // 2-second countdown for gallery opening
      const countdownInterval = setInterval(() => {
        setAutoOpenCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(countdownInterval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      const timer = setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        setAutoOpenCountdown(null);
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    } else {
      setAutoOpenCountdown(null);
    }
  }, [imageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Show immediate high-quality local preview so the user sees their photo instantaneously
      const localPreviewUrl = URL.createObjectURL(file);
      setImageUrl(localPreviewUrl);
      setIsUploading(true);

      // 2. Seamlessly upload in background without exposing any external service
      const uploadPromise = uploadToImgBB(file, settings.imageHostingApiKey)
        .then((remoteUrl) => {
          setImageUrl(remoteUrl);
          setDraftImage(remoteUrl);
          setIsUploading(false);
          return remoteUrl;
        })
        .catch((err) => {
          console.warn('Image processing completed with local asset', err);
          setIsUploading(false);
          return localPreviewUrl;
        });

      uploadPromiseRef.current = uploadPromise;
    }
  };

  const handlePost = async () => {
    if (postType === 'story') {
      if (!imageUrl) return;
      setIsSubmitting(true);
      try {
        let finalUrl = imageUrl;
        if (isUploading && uploadPromiseRef.current) {
          finalUrl = await uploadPromiseRef.current;
        }
        addStory(finalUrl, caption.trim() || undefined);
        setDraftImage(null);
      } finally {
        setIsSubmitting(false);
        setActiveTab('home');
      }
      return;
    }

    if (!caption.trim() && !imageUrl) return;
    setIsSubmitting(true);
    try {
      let finalUrl = imageUrl;
      if (isUploading && uploadPromiseRef.current) {
        finalUrl = await uploadPromiseRef.current;
      }
      addPost(caption, finalUrl || undefined);
      setDraftImage(null);
    } finally {
      setIsSubmitting(false);
      setActiveTab('home');
    }
  };

  const isCanPost =
    postType === 'story'
      ? !!imageUrl
      : caption.trim().length > 0 || imageUrl.length > 0;

  const earnPerPost = safeNumber(currentUser?.earnPerPost, settings?.earnPerPostUSDT ?? 0.02);
  const earnIntervalMin = currentUser?.earnIntervalMin ?? settings?.earnTimerMin ?? 10;
  const earnPassiveAmount = settings?.earnPassiveUSDT ?? 0.009;

  return (
    <div className="flex-1 bg-[#f8fafc] pb-20 font-sans min-h-screen flex flex-col">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-100 px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="p-1 text-slate-800 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-extrabold text-slate-900">
            {postType === 'story' ? 'Create Story' : 'Create post'}
          </h2>
        </div>

        <button
          onClick={handlePost}
          disabled={!isCanPost || isSubmitting}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
            isCanPost && !isSubmitting
              ? 'bg-[#ff5938] text-white shadow-xs hover:bg-[#e04526] active:scale-95'
              : 'bg-slate-200/80 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>প্রসেসিং হচ্ছে...</span>
            </>
          ) : postType === 'story' ? (
            'Share Story'
          ) : (
            'Post'
          )}
        </button>
      </div>

      <div className="p-3.5 space-y-3 flex-1">
        {/* Post Type Selector (Feed post vs Story) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-200/60 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setPostType('feed')}
            className={`py-2 rounded-xl font-black text-xs transition shadow-xs ${
              postType === 'feed'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Feed post
          </button>
          <button
            type="button"
            onClick={() => setPostType('story')}
            className={`py-2 rounded-xl font-black text-xs transition shadow-xs flex items-center justify-center gap-1.5 ${
              postType === 'story'
                ? 'bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Story (24h)</span>
          </button>
        </div>

        {/* Author Header */}
        <div className="flex items-center gap-2.5">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
          <div>
            <h3 className="font-extrabold text-xs text-slate-900">{currentUser.name}</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              {postType === 'story'
                ? '২৪ ঘণ্টার জন্য আপনার স্টোরিতে শেয়ার হবে'
                : `ইনকাম: $${earnPerPost.toFixed(2)} প্রতি পোস্ট + $${earnPassiveAmount.toFixed(3)} প্রতি ${earnIntervalMin} মিনিটে`}
            </p>
          </div>
        </div>

        {/* Caption Box */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-1.5">
          <textarea
            rows={postType === 'story' ? 2 : 3}
            placeholder={
              postType === 'story'
                ? 'স্টোরির সাথে কোনো ক্যাপশন লিখতে চাইলে লিখুন...'
                : 'Write a caption... (৬০ অক্ষরের বেশি হলে see more.. থাকবে)'
            }
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
          />

          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-50">
            <span>
              {caption.length > 60 ? (
                <span className="text-amber-600 font-bold">
                  {caption.length} chars (will show 'see more..')
                </span>
              ) : (
                <span>{caption.length}/60 chars</span>
              )}
            </span>

            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>পাবলিক ফিডে সিঙ্ক সক্রিয়</span>
            </span>
          </div>
        </div>

        {/* Hidden Native File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Image Preview & Upload Container */}
        {imageUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-[4/5] max-h-80 flex items-center justify-center mx-auto w-full shadow-inner">
            <img
              src={imageUrl}
              alt="Uploaded media"
              className="w-full h-full object-contain"
            />

            {/* Seamless in-app processing badge */}
            {isUploading && (
              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md border border-white/20 text-white rounded-full px-3 py-1 text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                <Loader2 className="w-3 h-3 animate-spin text-[#ff7438]" />
                <span>ছবি অপ্টিমাইজ হচ্ছে...</span>
              </div>
            )}

            <button
              onClick={() => {
                setImageUrl('');
                setDraftImage(null);
                uploadPromiseRef.current = null;
              }}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#ff5938] transition shadow-xs group relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ff5938] flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
              <ImageIcon className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h4 className="text-xs font-black text-slate-800">গ্যালারি থেকে ফটো নির্বাচন করুন</h4>
            <p className="text-[10px] text-slate-400 mt-1">
              {autoOpenCountdown !== null ? (
                <span className="text-[#ff5938] font-bold animate-pulse">
                  {autoOpenCountdown} সেকেন্ডে স্বয়ংক্রিয়ভাবে গ্যালারি ওপেন হচ্ছে...
                </span>
              ) : (
                'ট্যাপ করে আপনার ডিভাইস থেকে ছবি আপলোড করুন'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
