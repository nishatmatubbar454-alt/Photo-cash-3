import React, { useRef } from 'react';
import { Plus, Search, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { uploadToImgBB } from '../utils/upload';

export const TopBar: React.FC = () => {
  const { setActiveTab, currentUser, setDraftImage } = useAuth();
  const { settings } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setActiveTab('create');
      try {
        const url = await uploadToImgBB(file, settings.imageHostingApiKey);
        setDraftImage(url);
      } catch (err) {
        console.error(err);
      }
    } else {
      setActiveTab('create');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-3.5 py-2.5 flex items-center justify-between">
      {/* Hidden file input for direct gallery trigger */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePickPhoto}
        accept="image/*"
        className="hidden"
      />

      {/* Brand logo & title */}
      <div 
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2 cursor-pointer select-none"
      >
        <div className="w-7 h-7 rounded-full bg-[#f04438] flex items-center justify-center text-white font-black text-sm shadow-xs">
          P
        </div>
        <span className="font-black text-lg tracking-tight text-slate-900 font-sans">
          PhotoCash
        </span>
      </div>

      {/* Right Circular Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95"
          title="Open Gallery & Create Post"
        >
          <Plus className="w-4 h-4 stroke-[2.4]" />
        </button>

        <button
          className="w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95"
          title="Search"
        >
          <Search className="w-3.5 h-3.5 stroke-[2.4]" />
        </button>

        <a
          href={currentUser.botReferLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95"
          title="Open Telegram Bot"
        >
          <Send className="w-3.5 h-3.5 -rotate-12 translate-x-0.5 stroke-[2.4]" />
        </a>
      </div>
    </header>
  );
};
