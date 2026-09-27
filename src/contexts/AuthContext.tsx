import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Post,
  Story,
  Transaction,
  Comment,
  PaymentMethod,
  AccountType,
  NavigationTab,
  TransactionType
} from '../types';
import {
  DEFAULT_CURRENT_USER,
  DEFAULT_POSTS,
  DEFAULT_STORIES,
  DEFAULT_TRANSACTIONS,
  DEFAULT_COMMENTS
} from '../data/defaults';
import { useSettings } from './SettingsContext';
import { sendTelegramCashoutAlert } from '../utils/telegram';

interface AuthContextType {
  currentUser: User;
  allPosts: Post[];
  allStories: Story[];
  allComments: Comment[];
  transactions: Transaction[];
  activeTab: NavigationTab;
  selectedUser: User | null;
  rewardNotification: { id: number; coins: number; message: string } | null;
  setActiveTab: (tab: NavigationTab) => void;
  setSelectedUser: (user: User | null) => void;
  addCoins: (coins: number, message: string, type?: TransactionType) => void;
  claimDailyBonus: () => { success: boolean; message: string; coins?: number };
  requestCashout: (
    method: PaymentMethod,
    accountNumber: string,
    accountType: AccountType,
    amountBDT: number
  ) => Promise<{ success: boolean; message: string }>;
  approveCashout: (txId: string) => void;
  rejectCashout: (txId: string, reason?: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  addPost: (content: string, imageUrl?: string, tags?: string[]) => void;
  addStory: (mediaUrl: string, caption?: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'socialcash_user_data_v1';
const POSTS_STORAGE_KEY = 'socialcash_posts_v1';
const STORIES_STORAGE_KEY = 'socialcash_stories_v1';
const TRANSACTIONS_STORAGE_KEY = 'socialcash_transactions_v1';
const COMMENTS_STORAGE_KEY = 'socialcash_comments_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return { ...DEFAULT_CURRENT_USER, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CURRENT_USER;
  });

  const [allPosts, setAllPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(POSTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_POSTS;
  });

  const [allStories, setAllStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem(STORIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TRANSACTIONS;
  });

  const [allComments, setAllComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_COMMENTS;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rewardNotification, setRewardNotification] = useState<{ id: number; coins: number; message: string } | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(allPosts));
  }, [allPosts]);

  useEffect(() => {
    localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(allStories));
  }, [allStories]);

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(allComments));
  }, [allComments]);

  const triggerRewardFeedback = (coins: number, message: string) => {
    setRewardNotification({ id: Date.now(), coins, message });
    setTimeout(() => {
      setRewardNotification(null);
    }, 2500);
  };

  const addCoins = (coinsToAdd: number, message: string, type: TransactionType = 'ad_reward') => {
    const ratePerCoin = (settings.coinRate / 1000);
    const addedBDT = coinsToAdd * ratePerCoin;

    setCurrentUser((prev) => {
      const newCoins = prev.coins + coinsToAdd;
      const newBalanceBDT = Number((prev.balanceBDT + addedBDT).toFixed(2));
      const newTotalEarned = Number((prev.totalEarnedBDT + addedBDT).toFixed(2));
      return {
        ...prev,
        coins: newCoins,
        balanceBDT: newBalanceBDT,
        totalEarnedBDT: newTotalEarned,
      };
    });

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type,
      amountBDT: Number(addedBDT.toFixed(2)),
      coins: coinsToAdd,
      status: 'approved',
      createdAt: new Date().toISOString(),
      note: message,
    };

    setTransactions((prev) => [newTx, ...prev]);
    triggerRewardFeedback(coinsToAdd, message);
  };

  const claimDailyBonus = () => {
    const today = new Date().toDateString();
    if (currentUser.lastDailyClaim === today) {
      return { success: false, message: 'আজকের দৈনিক বোনাস আপনি ইতিমধ্যে ক্লেইম করেছেন!' };
    }

    const bonusCoins = settings.dailyBonusCoins;
    const ratePerCoin = settings.coinRate / 1000;
    const bonusBDT = bonusCoins * ratePerCoin;

    setCurrentUser((prev) => ({
      ...prev,
      coins: prev.coins + bonusCoins,
      balanceBDT: Number((prev.balanceBDT + bonusBDT).toFixed(2)),
      totalEarnedBDT: Number((prev.totalEarnedBDT + bonusBDT).toFixed(2)),
      lastDailyClaim: today,
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'daily_bonus',
      amountBDT: Number(bonusBDT.toFixed(2)),
      coins: bonusCoins,
      status: 'approved',
      createdAt: new Date().toISOString(),
      note: 'দৈনিক চেক-ইন বোনাস',
    };

    setTransactions((prev) => [newTx, ...prev]);
    triggerRewardFeedback(bonusCoins, 'দৈনিক বোনাস সফলভাবে যোগ হয়েছে! 🎁');

    return {
      success: true,
      message: `অভিনন্দন! আপনি ${bonusCoins} কয়েন (৳${bonusBDT.toFixed(2)}) বোনাস পেয়েছেন!`,
      coins: bonusCoins
    };
  };

  const requestCashout = async (
    method: PaymentMethod,
    accountNumber: string,
    accountType: AccountType,
    amountBDT: number
  ) => {
    if (amountBDT < settings.minCashOutBDT) {
      return {
        success: false,
        message: `সর্বনিম্ন ক্যাশআউট ৳${settings.minCashOutBDT}`
      };
    }

    if (currentUser.balanceBDT < amountBDT) {
      return {
        success: false,
        message: 'আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!'
      };
    }

    const ratePerCoin = settings.coinRate / 1000;
    const requiredCoins = Math.round(amountBDT / ratePerCoin);

    const generatedTrxId = `TX-${Math.floor(100000 + Math.random() * 900000)}`;

    // Deduct balance
    setCurrentUser((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins - requiredCoins),
      balanceBDT: Number(Math.max(0, prev.balanceBDT - amountBDT).toFixed(2)),
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'cashout',
      amountBDT,
      coins: requiredCoins,
      method,
      accountNumber,
      accountType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      trxId: generatedTrxId,
      note: 'অ্যাডমিন অনুমোদনের অপেক্ষায়',
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Send telegram alert if configured
    await sendTelegramCashoutAlert(
      {
        userName: currentUser.name,
        phone: currentUser.phone,
        method,
        accountNumber,
        accountType,
        amountBDT,
        coins: requiredCoins,
        trxId: generatedTrxId
      },
      settings.telegramBotToken,
      settings.telegramAdminChatId
    );

    return {
      success: true,
      message: 'ক্যাশআউট রিকোয়েস্ট জমা হয়েছে! এডমিন শীঘ্রই বিকাশ/নগদে টাকা পাঠিয়ে দিবে।'
    };
  };

  const approveCashout = (txId: string) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txId
          ? {
              ...tx,
              status: 'approved',
              note: 'অনুমোদিত ও টাকা পাঠানো সম্পন্ন হয়েছে ✅'
            }
          : tx
      )
    );
  };

  const rejectCashout = (txId: string, reason = 'ভুল অ্যাকাউন্ট নম্বর বা তথ্য') => {
    const targetTx = transactions.find((t) => t.id === txId);
    if (!targetTx) return;

    // Refund coins and BDT
    if (targetTx.userId === currentUser.id) {
      setCurrentUser((prev) => ({
        ...prev,
        coins: prev.coins + targetTx.coins,
        balanceBDT: Number((prev.balanceBDT + targetTx.amountBDT).toFixed(2)),
      }));
    }

    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txId
          ? {
              ...tx,
              status: 'rejected',
              note: `বাতিল: ${reason} (কয়েন ফেরত দেয়া হয়েছে)`
            }
          : tx
      )
    );
  };

  const likePost = (postId: string) => {
    setAllPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const wasLiked = p.isLiked;
          const newLikes = wasLiked ? p.likesCount - 1 : p.likesCount + 1;

          // If liking, reward user with coins
          if (!wasLiked) {
            const reward = settings.likeRewardCoins;
            addCoins(reward, `পোস্টে লাইক করায় +${reward} কয়েন বোনাস! ❤️`, 'like_reward');
          }

          return {
            ...p,
            isLiked: !wasLiked,
            likesCount: Math.max(0, newLikes),
          };
        }
        return p;
      })
    );
  };

  const addComment = (postId: string, text: string) => {
    if (!text.trim()) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      postId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setAllComments((prev) => [newComment, ...prev]);

    setAllPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      )
    );
  };

  const addPost = (content: string, imageUrl?: string, tags?: string[]) => {
    const newPost: Post = {
      id: `p-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userBadge: 'Verified Member',
      content,
      imageUrl,
      likesCount: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      isLiked: true,
      tags: tags || ['SocialCash'],
    };

    setAllPosts((prev) => [newPost, ...prev]);

    // Give post creation reward
    const reward = settings.postRewardCoins;
    addCoins(reward, `পোস্ট তৈরি করায় +${reward} কয়েন উপহার! 📝`, 'post_reward');
    setActiveTab('home');
  };

  const addStory = (mediaUrl: string, caption?: string) => {
    const newStory: Story = {
      id: `s-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      mediaUrl,
      caption,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      viewed: false,
    };

    setAllStories((prev) => [newStory, ...prev]);
    addCoins(10, 'স্টোরি শেয়ার করায় +10 কয়েন উপহার! 📸', 'post_reward');
    setActiveTab('home');
  };

  const updateProfile = (updates: Partial<User>) => {
    setCurrentUser((prev) => ({ ...prev, ...updates }));
  };

  const toggleRole = () => {
    setCurrentUser((prev) => ({
      ...prev,
      role: prev.role === 'admin' ? 'user' : 'admin',
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allPosts,
        allStories,
        allComments,
        transactions,
        activeTab,
        selectedUser,
        rewardNotification,
        setActiveTab,
        setSelectedUser,
        addCoins,
        claimDailyBonus,
        requestCashout,
        approveCashout,
        rejectCashout,
        likePost,
        addComment,
        addPost,
        addStory,
        updateProfile,
        toggleRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
