import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Post, Story, Transaction, NavigationTab, PostComment } from '../types';
import {
  DEFAULT_CURRENT_USER,
  DEFAULT_POSTS,
  DEFAULT_STORIES,
  DEFAULT_TRANSACTIONS
} from '../data/defaults';
import { useSettings } from './SettingsContext';
import {
  syncUserToFirebase,
  subscribeToUserData,
  syncTransactionToFirebase,
  updateTransactionStatusInFirebase,
  subscribeToTransactions,
  publishPostToFirebase,
  updatePostLikesInFirebase,
  updatePostInFirebase,
  updatePostCommentsInFirebase,
  subscribeToPublicPosts,
  publishStoryToFirebase,
  deleteStoryFromFirebase,
  subscribeToPublicStories,
  deletePostFromFirebase,
  creditReferralInFirebase,
  findUserByTelegramId
} from '../services/firebaseSync';

interface AuthContextType {
  currentUser: User;
  allPosts: Post[];
  allStories: Story[];
  transactions: Transaction[];
  activeTab: NavigationTab;
  draftImage: string | null;
  isAuthenticated: boolean;
  authStatus: 'idle' | 'connecting' | 'verifying' | 'success' | 'error';
  authMessage: string;
  loginWithTelegramData: (telegramUser: {
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  }) => Promise<void>;
  logout: () => void;
  setDraftImage: (img: string | null) => void;
  setActiveTab: (tab: NavigationTab) => void;
  addPost: (content: string, imageUrl?: string) => void;
  editPost: (postId: string, newContent: string) => void;
  deletePost: (postId: string) => void;
  addComment: (postId: string, emoji: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
  addStory: (mediaUrl: string, caption?: string) => Story;
  deleteStory: (storyId: string) => void;
  likePost: (postId: string) => void;
  toggleFollow: (postId: string) => void;
  requestCashout: (amountUSDT: number, address: string) => { success: boolean; message: string };
  approveCashout: (id: string) => void;
  rejectCashout: (id: string) => void;
  updateProfile: (updates: Partial<User>) => void;
  loginAsAdmin: () => void;
  createFreshUser: (name?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'photocash_user_v2';
const STORAGE_KEY_POSTS = 'photocash_posts_v2';
const STORAGE_KEY_STORIES = 'photocash_stories_v2';
const STORAGE_KEY_TX = 'photocash_tx_v2';

const sanitizeUser = (raw: Partial<User>, fallback: User): User => {
  const bal = typeof raw.balanceUSDT === 'number' && !isNaN(raw.balanceUSDT) ? raw.balanceUSDT : (fallback.balanceUSDT ?? 0.50);
  const life = typeof raw.lifetimeEarningsUSDT === 'number' && !isNaN(raw.lifetimeEarningsUSDT) ? raw.lifetimeEarningsUSDT : (fallback.lifetimeEarningsUSDT ?? 0.50);
  const today = typeof raw.todayEarningsUSDT === 'number' && !isNaN(raw.todayEarningsUSDT) ? raw.todayEarningsUSDT : (fallback.todayEarningsUSDT ?? 0);
  const tgId = raw.telegramId || fallback.telegramId || '5569819998';
  return {
    ...fallback,
    ...raw,
    telegramId: tgId,
    botReferLink: `https://t.me/PhotoCash12_bot?start=${tgId}`,
    balanceUSDT: Number(bal.toFixed(3)),
    lifetimeEarningsUSDT: Number(life.toFixed(3)),
    todayEarningsUSDT: Number(today.toFixed(3)),
    earnPerPost: typeof raw.earnPerPost === 'number' ? raw.earnPerPost : 0.02,
    earnIntervalMin: typeof raw.earnIntervalMin === 'number' ? raw.earnIntervalMin : 10,
    referBonusUSDT: typeof raw.referBonusUSDT === 'number' ? raw.referBonusUSDT : 0.50,
    requiredRefer: typeof raw.requiredRefer === 'number' ? raw.requiredRefer : 18,
    totalRefer: typeof raw.totalRefer === 'number' ? raw.totalRefer : 0,
    activeRefer: typeof raw.activeRefer === 'number' ? raw.activeRefer : 0,
    postsCount: typeof raw.postsCount === 'number' ? raw.postsCount : 0,
    lastPassiveEarnTime: raw.lastPassiveEarnTime || Date.now(),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useSettings();

  // Current user state (stored in photo-cash-30b8c)
  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return sanitizeUser(JSON.parse(saved), DEFAULT_CURRENT_USER);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CURRENT_USER;
  });

  // Public posts state (stored in photo-cash-2)
  const [allPosts, setAllPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_POSTS;
  });

  // Public stories state (stored in photo-cash-2)
  const [allStories, setAllStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STORIES;
  });

  // User Cashout Transactions (stored in photo-cash-30b8c)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TRANSACTIONS;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [draftImage, setDraftImage] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('photocash_auth_session') || localStorage.getItem(STORAGE_KEY_USER));
  });
  const [authStatus, setAuthStatus] = useState<'idle' | 'connecting' | 'verifying' | 'success' | 'error'>('idle');
  const [authMessage, setAuthMessage] = useState<string>('');

  // Sync to local storage for fast instant load
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(allPosts));
  }, [allPosts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STORIES, JSON.stringify(allStories));
  }, [allStories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
  }, [transactions]);

  /* =========================================================================
     PASSIVE POST EARNINGS (প্রতি ১০ মিনিটে ০.০০৯ USDT করে যোগ হবে)
     "একটা পোস্টে প্রতি ১০ মিনিটে 0.009 করে পাইবে"
     ========================================================================= */
  useEffect(() => {
    // Check if user has posts
    if (!currentUser.postsCount || currentUser.postsCount <= 0) return;

    const intervalMinutes = settings.earnTimerMin || 10;
    const intervalMs = intervalMinutes * 60 * 1000;
    const ratePerPost = settings.earnPassiveUSDT || 0.009;

    const checkIntervalEarning = () => {
      const now = Date.now();
      const lastEarn = currentUser.lastPassiveEarnTime || (now - intervalMs);
      const elapsed = now - lastEarn;

      if (elapsed >= intervalMs) {
        const intervalsCount = Math.floor(elapsed / intervalMs);
        if (intervalsCount > 0) {
          // Cap catch-up to max 12 cycles (2 hours)
          const cycles = Math.min(intervalsCount, 12);
          const totalPassiveEarn = Number((cycles * currentUser.postsCount * ratePerPost).toFixed(3));

          if (totalPassiveEarn > 0) {
            setCurrentUser((prev) => {
              const currentBal = prev.balanceUSDT ?? 0;
              const currentLife = prev.lifetimeEarningsUSDT ?? 0;
              const currentToday = prev.todayEarningsUSDT ?? 0;
              const updated: User = {
                ...prev,
                balanceUSDT: Number((currentBal + totalPassiveEarn).toFixed(3)),
                lifetimeEarningsUSDT: Number((currentLife + totalPassiveEarn).toFixed(3)),
                todayEarningsUSDT: Number((currentToday + totalPassiveEarn).toFixed(3)),
                lastPassiveEarnTime: now,
              };
              syncUserToFirebase(updated);
              return updated;
            });
          }
        }
      }
    };

    // Run check once on load/change, and periodically every 30 seconds
    checkIntervalEarning();
    const timerId = setInterval(checkIntervalEarning, 30000);
    return () => clearInterval(timerId);
  }, [currentUser.postsCount, currentUser.lastPassiveEarnTime, settings.earnTimerMin, settings.earnPassiveUSDT]);

  /* =========================================================================
     REAL-TIME LISTENERS:
     - photo-cash-2: Public Posts & Stories (Cross-device public feed)
     - photo-cash-30b8c: User Account, Wallet, Earnings & Transactions
     ========================================================================= */

  // 1. Listen to photo-cash-2 for real-time public posts across devices
  useEffect(() => {
    const unsubscribePosts = subscribeToPublicPosts((firebasePosts) => {
      if (firebasePosts && firebasePosts.length > 0) {
        setAllPosts((prev) => {
          const map = new Map<string, Post>();
          firebasePosts.forEach((p) => map.set(p.id, p));
          prev.forEach((p) => {
            if (!map.has(p.id)) map.set(p.id, p);
          });
          return Array.from(map.values()).sort((a, b) => {
            const timeA = parseInt(a.id.replace('p-', ''), 10) || 0;
            const timeB = parseInt(b.id.replace('p-', ''), 10) || 0;
            return timeB - timeA;
          });
        });
      }
    });

    // 2. Listen to photo-cash-2 for real-time stories across devices
    const unsubscribeStories = subscribeToPublicStories((firebaseStories) => {
      if (firebaseStories && firebaseStories.length > 0) {
        setAllStories(firebaseStories);
      }
    });

    // 3. Listen to photo-cash-30b8c for user account & transactions
    const unsubscribeUser = subscribeToUserData(currentUser.id, (userData) => {
      if (userData) {
        setCurrentUser((prev) => sanitizeUser(userData, prev));
      }
    });

    const unsubscribeTxs = subscribeToTransactions((firebaseTxs) => {
      if (firebaseTxs && firebaseTxs.length > 0) {
        setTransactions(firebaseTxs);
      }
    });

    // Initial sync of current user to photo-cash-30b8c
    syncUserToFirebase(currentUser);

    return () => {
      unsubscribePosts();
      unsubscribeStories();
      unsubscribeUser();
      unsubscribeTxs();
    };
  }, [currentUser.id]);

  // Check for incoming referral from Telegram bot or web URL and reward referrer in Firebase
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, '?'));
      const refParam =
        searchParams.get('start') ||
        searchParams.get('ref') ||
        searchParams.get('tgWebAppStartParam') ||
        hashParams.get('tgWebAppStartParam');

      if (refParam && refParam !== currentUser.telegramId) {
        const storedReferral = localStorage.getItem('photocash_referred_by');
        if (!storedReferral) {
          localStorage.setItem('photocash_referred_by', refParam);
          const bonus = settings?.referBonusUSDT ?? 0.50;
          creditReferralInFirebase(refParam, bonus);
        }
      }
    } catch (e) {
      console.warn('Referral check error:', e);
    }
  }, [currentUser.telegramId, settings?.referBonusUSDT]);

  // Login with verified Telegram user data (Auto Login / Auto Signup)
  const loginWithTelegramData = async (tgUser: {
    telegramId: string;
    chatId?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
    name?: string;
  }) => {
    setAuthStatus('verifying');
    setAuthMessage('Verifying Account...');

    try {
      const existing = await findUserByTelegramId(tgUser.telegramId);
      let resolvedUser: User;

      const calculatedName =
        tgUser.name ||
        [tgUser.firstName, tgUser.lastName].filter(Boolean).join(' ') ||
        (existing ? existing.name : `User #${tgUser.telegramId.slice(-4)}`);

      const photoToUse =
        tgUser.photoUrl ||
        existing?.avatar ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${tgUser.telegramId}`;

      if (existing) {
        // Returning user: keep balance, earnings, referrals, and update Telegram name/photo
        resolvedUser = {
          ...existing,
          name: calculatedName,
          username: tgUser.username || existing.username || `user_${tgUser.telegramId}`,
          firstName: tgUser.firstName || existing.firstName,
          lastName: tgUser.lastName || existing.lastName,
          avatar: photoToUse,
          photoUrl: photoToUse,
          lastLogin: new Date().toISOString(),
        };
      } else {
        // New user: auto-create account with Telegram photo, name, and Chat ID
        const welcomeBonus = 0.50;
        resolvedUser = {
          id: `u-tg-${tgUser.telegramId}`,
          telegramId: tgUser.telegramId,
          username: tgUser.username || `user_${tgUser.telegramId}`,
          firstName: tgUser.firstName,
          lastName: tgUser.lastName,
          name: calculatedName,
          avatar: photoToUse,
          photoUrl: photoToUse,
          bio: 'PhotoCash এ ছবি পোস্ট করে টাকা ইনকাম করছি!',
          balanceUSDT: welcomeBonus,
          lifetimeEarningsUSDT: welcomeBonus,
          todayEarningsUSDT: welcomeBonus,
          todayEarningPostsCount: 0,
          earnPerPost: settings?.earnPerPostUSDT ?? 0.02,
          earnIntervalMin: settings?.earnTimerMin ?? 10,
          totalRefer: 0,
          activeRefer: 0,
          requiredRefer: settings?.requiredRefersForWithdraw ?? 18,
          referBonusUSDT: settings?.referBonusUSDT ?? 0.50,
          role: 'user',
          postsCount: 0,
          followersCount: 0,
          followingCount: 1,
          botReferLink: `https://t.me/PhotoCash12_bot?start=${tgUser.telegramId}`,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          lastPassiveEarnTime: Date.now(),
        };
      }

      setCurrentUser(resolvedUser);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(resolvedUser));
      localStorage.setItem(
        'photocash_auth_session',
        `session-${tgUser.telegramId}-${Date.now()}`
      );
      setIsAuthenticated(true);
      setAuthStatus('success');
      setAuthMessage('Login Successful');

      // Sync user to Firebase
      syncUserToFirebase(resolvedUser);
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthStatus('error');
      setAuthMessage(err.message || 'Login failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('photocash_auth_session');
    localStorage.removeItem(STORAGE_KEY_USER);
    setIsAuthenticated(false);
    setAuthStatus('idle');
    setAuthMessage('');
  };

  // Auto Telegram WebApp Authentication on launch
  useEffect(() => {
    let isMounted = true;

    const checkTelegramAuth = async () => {
      try {
        const tgWebApp = (window as any).Telegram?.WebApp;
        if (tgWebApp) {
          tgWebApp.ready();
          tgWebApp.expand();
        }

        const initData = tgWebApp?.initData;
        const unsafeUser = tgWebApp?.initDataUnsafe?.user;

        // 1. If inside Telegram WebApp with genuine initData
        if (initData && initData.length > 0) {
          setAuthStatus('connecting');
          setAuthMessage('Connecting Telegram...');

          try {
            setAuthStatus('verifying');
            setAuthMessage('Verifying Account...');

            const res = await fetch('/api/auth/telegram-webapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData }),
            });

            const data = await res.json();
            if (data.success && data.user) {
              setAuthStatus('success');
              setAuthMessage('Login Successful');
              if (isMounted) {
                await loginWithTelegramData(data.user);
              }
              return;
            } else {
              setAuthStatus('error');
              setAuthMessage(
                data.error || 'Authentication signature verification failed.'
              );
              return;
            }
          } catch (err) {
            console.error('Server verification error:', err);
            setAuthStatus('error');
            setAuthMessage('Failed to verify Telegram credentials.');
            return;
          }
        }

        // 2. Fallback if inside Telegram WebApp and user data is directly present
        if (unsafeUser && unsafeUser.id) {
          const fullName =
            [unsafeUser.first_name, unsafeUser.last_name].filter(Boolean).join(' ') ||
            unsafeUser.first_name ||
            unsafeUser.username ||
            'Telegram User';

          await loginWithTelegramData({
            telegramId: String(unsafeUser.id),
            chatId: String(unsafeUser.id),
            firstName: unsafeUser.first_name,
            lastName: unsafeUser.last_name,
            name: fullName,
            username: unsafeUser.username || `user_${unsafeUser.id}`,
            photoUrl:
              unsafeUser.photo_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${unsafeUser.id}`,
          });
          return;
        }
      } catch (err) {
        console.error('Telegram auth init error:', err);
      }
    };

    checkTelegramAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================================
     USER ACTIONS & SYNCHRONIZATION
     ========================================================================= */

  // Add post -> writes image and caption to photo-cash-2 (Media DB)
  // and updates earnings in photo-cash-30b8c (User & Wallet DB)
  const addPost = (content: string, imageUrl?: string) => {
    const newPost: Post = {
      id: `p-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userUsername: currentUser.username,
      userAvatar: currentUser.avatar,
      dateString: new Date().toLocaleDateString('en-US'),
      content,
      imageUrl,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isFollowing: true,
    };

    // 1. Update local state for immediate feedback
    setAllPosts((prev) => [newPost, ...prev]);

    // 2. Publish post to photo-cash-2 (Media DB) for all devices to see
    publishPostToFirebase(newPost);

    // 3. Update earnings dynamically from settings (0.02 USDT per post) and sync to photo-cash-30b8c (User DB)
    const earnAmount = settings?.earnPerPostUSDT ?? 0.02;
    const currentBal = currentUser.balanceUSDT ?? 0;
    const currentLife = currentUser.lifetimeEarningsUSDT ?? 0;
    const currentToday = currentUser.todayEarningsUSDT ?? 0;

    const updatedUser: User = {
      ...currentUser,
      balanceUSDT: Number((currentBal + earnAmount).toFixed(3)),
      lifetimeEarningsUSDT: Number((currentLife + earnAmount).toFixed(3)),
      todayEarningsUSDT: Number((currentToday + earnAmount).toFixed(3)),
      todayEarningPostsCount: (currentUser.todayEarningPostsCount || 0) + 1,
      postsCount: (currentUser.postsCount || 0) + 1,
      lastPassiveEarnTime: currentUser.lastPassiveEarnTime || Date.now(),
    };

    setCurrentUser(updatedUser);
    syncUserToFirebase(updatedUser);

    setDraftImage(null);
    setActiveTab('home');
  };

  // Edit post content / caption
  const editPost = (postId: string, newContent: string) => {
    setAllPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updated = { ...p, content: newContent };
          updatePostInFirebase(postId, { content: newContent });
          return updated;
        }
        return p;
      })
    );
  };

  // Delete post -> removes from local state and photo-cash-2
  const deletePost = (postId: string) => {
    const target = allPosts.find((p) => p.id === postId);
    setAllPosts((prev) => prev.filter((p) => p.id !== postId));
    deletePostFromFirebase(postId);

    if (target && target.userId === currentUser.id) {
      const updatedUser: User = {
        ...currentUser,
        postsCount: Math.max(0, (currentUser.postsCount || 1) - 1),
      };
      setCurrentUser(updatedUser);
      syncUserToFirebase(updatedUser);
    }
  };

  // Add emoji comment to post -> updates photo-cash-2
  const addComment = (postId: string, emoji: string) => {
    const newComment: PostComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      postId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      emoji,
      createdAt: new Date().toISOString(),
    };

    setAllPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const comments = [...(p.comments || []), newComment];
          const commentsCount = comments.length;
          updatePostCommentsInFirebase(postId, comments, commentsCount);
          return {
            ...p,
            comments,
            commentsCount,
          };
        }
        return p;
      })
    );
  };

  // Delete comment from post
  const deleteComment = (postId: string, commentId: string) => {
    setAllPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const comments = (p.comments || []).filter((c) => c.id !== commentId);
          const commentsCount = comments.length;
          updatePostCommentsInFirebase(postId, comments, commentsCount);
          return {
            ...p,
            comments,
            commentsCount,
          };
        }
        return p;
      })
    );
  };

  // Add story -> writes to photo-cash-2 (Media DB) for public viewing
  const addStory = (mediaUrl: string, caption?: string): Story => {
    const newStory: Story = {
      id: `s-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      mediaUrl,
      caption,
      isCurrentUser: true,
      createdAt: new Date().toISOString(),
    };

    setAllStories((prev) => [newStory, ...prev]);

    // Publish story to photo-cash-2
    publishStoryToFirebase(newStory);

    return newStory;
  };

  // Delete story -> removes from photo-cash-2
  const deleteStory = (storyId: string) => {
    setAllStories((prev) => prev.filter((s) => s.id !== storyId));
    deleteStoryFromFirebase(storyId);
  };

  // Like post -> updates like count in photo-cash-2
  const likePost = (postId: string) => {
    setAllPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          const newLikesCount = isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1);
          // Sync like to photo-cash-2
          updatePostLikesInFirebase(postId, newLikesCount);
          return {
            ...p,
            isLiked,
            likesCount: newLikesCount,
          };
        }
        return p;
      })
    );
  };

  const toggleFollow = (postId: string) => {
    setAllPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, isFollowing: !p.isFollowing };
        }
        return p;
      })
    );
  };

  // Request cashout -> deducts balance and saves transaction in photo-cash-30b8c
  const requestCashout = (amountUSDT: number, address: string) => {
    const requiredRefs = settings?.requiredRefersForWithdraw ?? 18;
    if (currentUser.totalRefer < requiredRefs) {
      return {
        success: false,
        message: `${requiredRefs} টা রেফার ছাড়া withdraw হবে না। আগে ${requiredRefs} টি রেফার সম্পূর্ণ করুন। (বর্তমানে ${currentUser.totalRefer} টি)`,
      };
    }

    const minAmount = settings?.minCashOutUSDT ?? 5.0;
    if (amountUSDT < minAmount) {
      return {
        success: false,
        message: `মিনিমাম উইথড্র অ্যামাউন্ট $${minAmount.toFixed(2)} USDT হতে হবে!`,
      };
    }

    if (currentUser.balanceUSDT < amountUSDT) {
      return {
        success: false,
        message: 'আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!',
      };
    }

    const updatedUser: User = {
      ...currentUser,
      balanceUSDT: Number((currentUser.balanceUSDT - amountUSDT).toFixed(3)),
    };

    setCurrentUser(updatedUser);
    syncUserToFirebase(updatedUser);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      amountUSDT,
      method: 'Binance (BEP20)',
      address,
      status: 'pending',
      createdAt: new Date().toISOString(),
      trxId: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    setTransactions((prev) => [newTx, ...prev]);
    // Sync transaction to photo-cash-30b8c (User & Wallet DB)
    syncTransactionToFirebase(newTx);

    return {
      success: true,
      message: 'ক্যাশআউট রিকোয়েস্ট সফলভাবে জমা হয়েছে!',
    };
  };

  // Approve cashout -> updates transaction in photo-cash-30b8c
  const approveCashout = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t))
    );
    updateTransactionStatusInFirebase(id, 'approved');
  };

  // Reject cashout -> refunds balance to user and updates transaction in photo-cash-30b8c
  const rejectCashout = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    const updatedUser: User = {
      ...currentUser,
      balanceUSDT: Number((currentUser.balanceUSDT + target.amountUSDT).toFixed(3)),
    };

    setCurrentUser(updatedUser);
    syncUserToFirebase(updatedUser);

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'rejected' } : t))
    );
    updateTransactionStatusInFirebase(id, 'rejected');
  };

  const updateProfile = (updates: Partial<User>) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    syncUserToFirebase(updatedUser);
  };

  const loginAsAdmin = () => {
    setCurrentUser(DEFAULT_CURRENT_USER);
    syncUserToFirebase(DEFAULT_CURRENT_USER);
  };

  const createFreshUser = (name?: string) => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const tgId = `${Math.floor(5000000000 + Math.random() * 4000000000)}`;
    const welcomeBonus = 0.50; // "নতুন একাউন্ট করলে 0.5 USDT"
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: name || `User #${rand}`,
      username: `Earner${rand}`,
      telegramId: tgId,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Earner${rand}`,
      bio: 'PhotoCash এ ছবি পোস্ট করে টাকা ইনকাম করছি!',
      balanceUSDT: welcomeBonus,
      lifetimeEarningsUSDT: welcomeBonus,
      todayEarningsUSDT: welcomeBonus,
      todayEarningPostsCount: 0,
      earnPerPost: settings?.earnPerPostUSDT ?? 0.02,
      earnIntervalMin: settings?.earnTimerMin ?? 10,
      totalRefer: 0,
      activeRefer: 0,
      requiredRefer: settings?.requiredRefersForWithdraw ?? 18,
      referBonusUSDT: settings?.referBonusUSDT ?? 0.50,
      role: 'user',
      postsCount: 0,
      followersCount: 0,
      followingCount: 1,
      botReferLink: `https://t.me/PhotoCash12_bot?start=${tgId}`,
      lastPassiveEarnTime: Date.now(),
    };
    setCurrentUser(newUser);
    syncUserToFirebase(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allPosts,
        allStories,
        transactions,
        activeTab,
        draftImage,
        isAuthenticated,
        authStatus,
        authMessage,
        loginWithTelegramData,
        logout,
        setDraftImage,
        setActiveTab,
        addPost,
        editPost,
        deletePost,
        addComment,
        deleteComment,
        addStory,
        deleteStory,
        likePost,
        toggleFollow,
        requestCashout,
        approveCashout,
        rejectCashout,
        updateProfile,
        loginAsAdmin,
        createFreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
