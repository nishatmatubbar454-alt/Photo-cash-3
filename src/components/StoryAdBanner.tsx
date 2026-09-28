import React from 'react';

interface StoryAdBannerProps {
  adKey?: string;
}

export const StoryAdBanner: React.FC<StoryAdBannerProps> = ({
  adKey = '911ee250303f0d466e6e2cab58b077e0',
}) => {
  const currentKey = adKey?.trim() || '911ee250303f0d466e6e2cab58b077e0';

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Story Advertisement</title>
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
      background-color: transparent;
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
    <div className="w-full h-full flex flex-col items-center justify-center p-3 relative z-10 select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/40 via-purple-950/30 to-black/80 pointer-events-none" />

      {/* Modern Story Ad Box */}
      <div className="w-full max-w-[320px] bg-slate-900/90 backdrop-blur-xl rounded-3xl p-3 border border-white/15 shadow-2xl flex flex-col items-center relative z-20 animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header inside story card */}
        <div className="w-full flex items-center justify-between px-1 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-black text-white tracking-wide">Featured Recommendation</span>
          </div>
          <span className="text-[9px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
            Special
          </span>
        </div>

        {/* 300x250 Adsterra Banner Container */}
        <div className="w-[300px] h-[250px] rounded-2xl overflow-hidden bg-white shadow-xl flex items-center justify-center relative border border-white/10">
          <iframe
            key={`story-banner-${currentKey}`}
            title="Story Adsterra Ad"
            srcDoc={htmlContent}
            width={300}
            height={250}
            className="border-0 w-[300px] h-[250px] overflow-hidden"
            loading="eager"
          />
        </div>

        {/* Story Action Prompt */}
        <div className="mt-3 text-center w-full px-2">
          <p className="text-white text-xs font-bold leading-tight">
            ট্যাপ করে বিস্তারিত দেখুন ✨
          </p>
          <span className="text-[10px] text-white/60 block mt-0.5">
            Tap right side for next story →
          </span>
        </div>
      </div>
    </div>
  );
};
