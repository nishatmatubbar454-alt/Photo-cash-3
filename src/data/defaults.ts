import { User, Post, Story, Transaction, AppSettings, Comment } from '../types';

export const DEFAULT_CURRENT_USER: User = {
  id: 'u-current',
  name: 'Nishat Matubbar',
  username: 'nishat_official',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Content creator & tech enthusiast 🚀 প্রতিদিন পোস্ট করুন ও কয়েন ইনকাম করুন!',
  coins: 2450,
  balanceBDT: 24.50,
  role: 'user', // Can be toggled to 'admin' in UI
  phone: '01712345678',
  referralCode: 'NISHAT77',
  referralCount: 12,
  totalEarnedBDT: 480.00,
  joinedDate: '2025-01-10',
  followersCount: 342,
  followingCount: 189,
};

export const DEFAULT_SETTINGS: AppSettings = {
  coinRate: 10, // 1000 coins = 10 BDT (so 1 coin = 0.01 BDT)
  minCashOutBDT: 50, // Min 50 Taka to cash out
  postRewardCoins: 25, // 25 coins for each post
  likeRewardCoins: 2, // 2 coins for each like
  dailyBonusCoins: 50, // 50 coins daily bonus
  referRewardCoins: 100, // 100 coins for every friend invited
  adRewardCoins: 15, // 15 coins for watching a sponsored ad
  telegramChannelUrl: 'https://t.me/socialcashbd_official',
  telegramSupportUrl: 'https://t.me/socialcash_helpdesk',
  noticeText: '🎉 নতুন আপডেট: এখন প্রতি রেফারে পাচ্ছেন ১০০ কয়েন এবং দৈনিক বোনাস ৫০ কয়েন! ক্যাশআউট বিকাশ ও নগদে ৫ মিনিটে!',
  maintenanceMode: false,
};

export const DEFAULT_STORIES: Story[] = [
  {
    id: 's-1',
    userId: 'u-1',
    userName: 'Tanvir Hossain',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    caption: 'Sunset at Hatirjheel, Dhaka 🌅',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 22).toISOString(),
    viewed: false,
  },
  {
    id: 's-2',
    userId: 'u-2',
    userName: 'Nusrat Jahan',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&auto=format&fit=crop&q=80',
    caption: 'Weekend trip to Sajek Valley ☁️⛰️',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 20).toISOString(),
    viewed: false,
  },
  {
    id: 's-3',
    userId: 'u-3',
    userName: 'Fahim Ahmed',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
    caption: 'Coffee time with friends ☕',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 18).toISOString(),
    viewed: false,
  },
  {
    id: 's-4',
    userId: 'u-4',
    userName: 'Sadia Rahman',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80',
    caption: 'Rainy Dhaka vibes 🌧️',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 14).toISOString(),
    viewed: true,
  },
];

export const DEFAULT_POSTS: Post[] = [
  {
    id: 'p-1',
    userId: 'u-1',
    userName: 'Tanvir Hossain',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    userBadge: 'Top Contributor',
    content: 'আজকে বিকাশ এ ৫০০ টাকা পেমেন্ট পেলাম SocialCash থেকে! মাত্র ৩ দিন কাজ করে। ধন্যবাদ এডমিন টিমকে ❤️💸 সবার সাথে স্ক্রিনশট শেয়ার করলাম। পোস্ট ও লাইক করে ইনকাম দারুণ হচ্ছে!',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80',
    likesCount: 142,
    commentsCount: 28,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    isLiked: false,
    tags: ['EarningProof', 'bKashPayment', 'SocialCash'],
  },
  {
    id: 'p-2',
    userId: 'u-2',
    userName: 'Nusrat Jahan',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    userBadge: 'Pro Member',
    content: 'মেঘের রাজ্য সাজেক ভ্যালি! প্রকৃতির অপরূপ সৌন্দর্য দেখলে মন ভালো হয়ে যায়। যারা যাননি তারা একবার ঘুরে আসুন। ভালো লাগলে লাইক ও কমেন্ট করবেন বন্ধুরা 🌸✨',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    likesCount: 289,
    commentsCount: 45,
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    isLiked: true,
    tags: ['SajekValley', 'TravelBD', 'Nature'],
  },
  {
    id: 'p-3',
    userId: 'u-3',
    userName: 'Fahim Ahmed',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    content: 'বন্ধুত্ব অমূল্য। আজকের সন্ধ্যার আড্ডা বন্ধুদের সাথে ধানমন্ডি লেকে। সবাই কেমন আছেন জানাবেন! ☕✨',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    likesCount: 88,
    commentsCount: 12,
    createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
    isLiked: false,
    tags: ['Friendship', 'DhakaLife', 'Adda'],
  },
];

export const DEFAULT_COMMENTS: Comment[] = [
  {
    id: 'c-1',
    postId: 'p-1',
    userId: 'u-2',
    userName: 'Nusrat Jahan',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    text: 'অভিনন্দন ভাই! আমিও গতকাল ২০০ টাকা পেয়েছি নগদে 😍',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'c-2',
    postId: 'p-1',
    userId: 'u-3',
    userName: 'Fahim Ahmed',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    text: 'ক্যাশআউট দিতে কত সময় লেগেছে ভাই?',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'c-3',
    postId: 'p-2',
    userId: 'u-1',
    userName: 'Tanvir Hossain',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    text: 'ছবিগুলো অসাধারণ হয়েছে আপু! কোন ক্যামেরায় তোলা?',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  }
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    userId: 'u-current',
    userName: 'Nishat Matubbar',
    type: 'cashout',
    amountBDT: 100,
    coins: 10000,
    method: 'bkash',
    accountNumber: '01712345678',
    accountType: 'personal',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    trxId: 'BKS98234190',
    note: 'সফলভাবে পাঠানো হয়েছে',
  },
  {
    id: 'tx-102',
    userId: 'u-current',
    userName: 'Nishat Matubbar',
    type: 'referral',
    amountBDT: 1,
    coins: 100,
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    note: 'রেফারেল বোনাস (হাসান জয়েন করেছে)',
  },
  {
    id: 'tx-103',
    userId: 'u-current',
    userName: 'Nishat Matubbar',
    type: 'daily_bonus',
    amountBDT: 0.5,
    coins: 50,
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    note: 'দৈনিক চেক-ইন রিওয়ার্ড',
  },
  {
    id: 'tx-104',
    userId: 'u-1',
    userName: 'Tanvir Hossain',
    type: 'cashout',
    amountBDT: 200,
    coins: 20000,
    method: 'nagad',
    accountNumber: '01899123456',
    accountType: 'personal',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    trxId: 'TX-PENDING-492',
    note: 'অ্যাডমিন অনুমোদনের অপেক্ষায়',
  },
  {
    id: 'tx-105',
    userId: 'u-4',
    userName: 'Sadia Rahman',
    type: 'cashout',
    amountBDT: 50,
    coins: 5000,
    method: 'bkash',
    accountNumber: '01678112233',
    accountType: 'personal',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    trxId: 'TX-PENDING-493',
    note: 'অ্যাডমিন অনুমোদনের অপেক্ষায়',
  }
];
