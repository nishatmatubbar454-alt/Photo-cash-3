export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  coins: number;
  balanceBDT: number;
  role: UserRole;
  phone: string;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  totalEarnedBDT: number;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  lastDailyClaim?: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userBadge?: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isLiked: boolean;
  tags?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  caption?: string;
  createdAt: string;
  expiresAt: string;
  viewed?: boolean;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'recharge';
export type AccountType = 'personal' | 'agent';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';
export type TransactionType = 'cashout' | 'referral' | 'post_reward' | 'like_reward' | 'daily_bonus' | 'ad_reward' | 'welcome_bonus';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amountBDT: number;
  coins: number;
  method?: PaymentMethod;
  accountNumber?: string;
  accountType?: AccountType;
  status: TransactionStatus;
  createdAt: string;
  trxId?: string;
  note?: string;
}

export interface AppSettings {
  coinRate: number; // e.g., 1000 coins = 10 BDT (so 1 coin = 0.01 BDT)
  minCashOutBDT: number; // Minimum cashout amount e.g., 50 BDT
  postRewardCoins: number; // Coins given for posting e.g. 20
  likeRewardCoins: number; // Coins given for liking e.g. 2
  dailyBonusCoins: number; // Daily login reward e.g. 50
  referRewardCoins: number; // Coins per refer e.g. 100
  adRewardCoins: number; // Coins per ad view e.g. 15
  telegramChannelUrl: string;
  telegramSupportUrl: string;
  telegramBotToken?: string;
  telegramAdminChatId?: string;
  noticeText: string;
  maintenanceMode: boolean;
}

export type NavigationTab = 
  | 'home' 
  | 'refer' 
  | 'create' 
  | 'wallet' 
  | 'profile' 
  | 'cashout' 
  | 'payments' 
  | 'admin'
  | 'user-profile';
