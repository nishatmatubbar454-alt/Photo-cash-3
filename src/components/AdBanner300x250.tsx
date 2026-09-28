import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';

interface AdBanner300x250Props {
  adKey?: string;
  index?: number;
}

// Native user profiles to make the ad look like a real post
const NATIVE_PROFILES = [
  {
    name: 'Tania Akter 🌸',
    username: 'tania_photo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    time: '18m',
    caption: 'Special collection for today ✨ swipe & check it out!',
    likes: 184,
    comments: 29,
  },
  {
    name: 'Arif Ahmed 📸',
    username: 'arif_creative',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    time: '35m',
    caption: 'Must see today 🔥 don’t miss this trending pick!',
    likes: 246,
    comments: 41,
  },
  {
    name: 'Sadia Rahman 💫',
    username: 'sadia_vibes',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    time: '1h',
    caption: 'Recommended for you! Have a look 🚀',
    likes: 312,
    comments: 53,
  },
];

export const AdBanner300x250: React.FC<AdBanner300x250Props> = ({
  adKey = '911ee250303f0d466e6e2cab58b077e0',
  index = 0,
}) => {
  const currentKey = adKey?.trim() || '911ee250303f0d466e6e2cab58b077e0';
  const profile = NATIVE_PROFILES[index % NATIVE_PROFILES.length];

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(profile.likes);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #ffffff;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${currentKey}',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://glamourpicklessteward.com/${currentKey}/invoke.js"></script>
</body>
</html>`;

  return (
    <article className="pt-2 pb-3 bg-white border-b border-slate-100 select-none">
      {/* Native Post Header (Looks exactly like a regular post) */}
      <div className="px-3.5 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-xs text-slate-900 font-sans">
                {profile.name}
              </h4>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition ${
                  isFollowing
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-[#ff5938] hover:bg-[#e04526] text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 font-sans block leading-none mt-0.5">
              {profile.time}
            </span>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-700 p-1">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Post Media: Centered native display of the 300x250 ad without any "Sponsored" label */}
      <div className="w-full bg-slate-50 py-1.5 flex items-center justify-center">
        <div className="w-[300px] h-[250px] bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-xs">
          <iframe
            key={`native-ad-${currentKey}-${index}`}
            title={`Post Media ${index + 1}`}
            srcDoc={htmlContent}
            width={300}
            height={250}
            className="border-0 w-[300px] h-[250px] overflow-hidden"
            loading="lazy"
          />
        </div>
      </div>

      {/* Post Caption: Looks natural */}
      <div className="px-3.5 pt-2">
        <p className="text-xs text-slate-800 font-sans leading-relaxed">
          {profile.caption}
        </p>
      </div>

      {/* Interaction Bar: Identical to regular posts */}
      <div className="px-3.5 pt-2 flex items-center justify-between text-slate-500">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs font-semibold ${
              isLiked ? 'text-[#ff5938]' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#ff5938] stroke-[#ff5938]' : ''}`} />
            <span className="text-[11px]">{likesCount}</span>
          </button>

          <button className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900">
            <MessageCircle className="w-4 h-4" />
            <span className="text-[11px]">{profile.comments}</span>
          </button>
        </div>

        <button className="text-slate-500 hover:text-slate-800">
          <Share2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
