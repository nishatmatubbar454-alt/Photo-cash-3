import { User, Post, Story, Transaction, AppSettings } from '../types';

export const DEFAULT_CURRENT_USER: User = {
  id: 'u-nishat',
  name: 'NiShAt Buyr 🔕',
  username: 'Nishat13234',
  telegramId: '5569819998',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  bio: '',
  balanceUSDT: 30.344,
  lifetimeEarningsUSDT: 30.344,
  todayEarningsUSDT: 28.144,
  todayEarningPostsCount: 2,
  earnPerPost: 0.02,
  earnIntervalMin: 10,
  totalRefer: 0,
  activeRefer: 0,
  requiredRefer: 18,
  referBonusUSDT: 0.50,
  role: 'admin',
  postsCount: 2,
  followersCount: 1,
  followingCount: 3,
  botReferLink: 'https://t.me/PhotoCash12_bot?start=5569819998',
};

export const DEFAULT_POSTS: Post[] = [
  {
    id: 'p-1',
    userId: 'u-suvo',
    userName: 'Süvõ 2K',
    userUsername: 'FreeEarning984',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    dateString: '9/14/2026',
    content: 'পোস্ট করে প্রতিদিন রিয়েল ইনকাম শুরু করলাম! লাইক কমেন্ট দিয়ে সাথে থাকুন। PhotoCash অ্যাপে জয়েন করে আনলিমিটেড ইনকাম করুন আর ফ্রেন্ডদের রেফার করুন!',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    likesCount: 14,
    commentsCount: 3,
    isLiked: false,
    isFollowing: false,
  },
  {
    id: 'p-nishat-1',
    userId: 'u-nishat',
    userName: 'NiShAt Buyr 🔕',
    userUsername: 'Nishat13234',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    dateString: '9/20/2026',
    content: 'New look salon day ✂️💈 আজকের হেয়ারকাট ও গ্রুমিং সেশনটা অসাধারণ ছিল।',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=80',
    likesCount: 1,
    commentsCount: 0,
    isLiked: true,
    isFollowing: true,
  },
  {
    id: 'p-nishat-2',
    userId: 'u-nishat',
    userName: 'NiShAt Buyr 🔕',
    userUsername: 'Nishat13234',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    dateString: '9/22/2026',
    content: 'Podcast recording session 🎙️ Stay tuned for updates on our latest episodes and upcoming guests!',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
    likesCount: 2,
    commentsCount: 1,
    isLiked: false,
    isFollowing: true,
  }
];

export const DEFAULT_STORIES: Story[] = [
  {
    id: 's-nishat',
    userId: 'u-nishat',
    userName: 'NiShAt Buyr',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    caption: 'My latest story',
    isCurrentUser: true,
    createdAt: new Date().toISOString(),
  }
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-201',
    userId: 'u-nishat',
    userName: 'NiShAt Buyr 🔕',
    amountUSDT: 5.00,
    method: 'Binance (BEP20)',
    address: '0x71C...49b2',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    trxId: 'TX-98231',
    note: 'পেন্ডিং রিকুয়েস্ট',
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  minCashOutUSDT: 5.00,
  requiredRefersForWithdraw: 18,
  referBonusUSDT: 0.50,
  earnPerPostUSDT: 0.02,
  earnTimerMin: 10,
  earnPassiveUSDT: 0.009,
  telegramBotUrl: 'https://t.me/PhotoCash12_bot',
  telegramSupportUrl: 'https://t.me/PhotoCash12_bot',
  noticeText: 'বন্ধু জয়েন করলেই $0.50 USDT বোনাস 🤖 এখনই লিংক শেয়ার করুন 👀',
  imageHostingApiKey: 'cbba7a8d9d2aae1860641bead99ef779',
  bannerAdKey: '911ee250303f0d466e6e2cab58b077e0',
  enableFeedAds: true,
  enableStoryAds: true,
};


