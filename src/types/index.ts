export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  telegramId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  name: string;
  avatar: string;
  photoUrl?: string;
  createdAt?: string;
  lastLogin?: string;
  bio?: string;
  balanceUSDT: number;
  lifetimeEarningsUSDT: number;
  todayEarningsUSDT: number;
  todayEarningPostsCount: number;
  earnPerPost: number;
  earnIntervalMin: number;
  totalRefer: number;
  activeRefer: number;
  requiredRefer: number;
  referBonusUSDT: number;
  role: UserRole;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  botReferLink: string;
  lastEarningTime?: string;
  lastPassiveEarnTime?: number;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  emoji: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userUsername?: string;
  userAvatar: string;
  userBadge?: string;
  dateString: string;
  content?: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  comments?: PostComment[];
  isLiked?: boolean;
  isFollowing?: boolean;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  caption?: string;
  isCurrentUser?: boolean;
  isAd?: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amountUSDT: number;
  method: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  trxId?: string;
  note?: string;
}

export interface AppSettings {
  minCashOutUSDT: number;
  requiredRefersForWithdraw: number;
  referBonusUSDT: number;
  earnPerPostUSDT: number;
  earnTimerMin: number;
  earnPassiveUSDT: number; // 0.009 USDT per 10 minutes per post
  telegramBotUrl: string;
  telegramSupportUrl: string;
  noticeText: string;
  imageHostingApiKey: string;
  bannerAdKey: string;
  enableFeedAds: boolean;
  enableStoryAds: boolean;
}


export type NavigationTab =
  | 'home'
  | 'refer'
  | 'create'
  | 'wallet'
  | 'profile'
  | 'cashout'
  | 'payments'
  | 'admin';
