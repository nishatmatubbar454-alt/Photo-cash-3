import { ref, set, update, onValue, remove, get } from 'firebase/database';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import {
  userDb,
  userFirestore,
  mediaDb,
  mediaFirestore
} from '../lib/firebase';
import { User, Post, Story, Transaction, AppSettings, PostComment } from '../types';

/* =========================================================================
   1. USER & WALLET DATABASE (photo-cash-30b8c)
   Handles: User accounts, balance, earnings history, cashout requests & global settings
   ========================================================================= */

// Save or sync user profile & money to photo-cash-30b8c
export const syncUserToFirebase = async (user: User) => {
  try {
    // 1. Realtime Database
    const userRef = ref(userDb, `users/${user.id}`);
    set(userRef, user).catch((err) =>
      console.warn('[UserRTDB] Set user failed:', err.message)
    );

    // 2. Firestore
    const userDocRef = doc(userFirestore, 'users', user.id);
    setDoc(userDocRef, user, { merge: true }).catch((err) =>
      console.warn('[UserFirestore] Set user failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] syncUserToFirebase error:', e);
  }
};

// Listen to specific user updates (real-time earnings or balance changes)
export const subscribeToUserData = (
  userId: string,
  onData: (data: Partial<User>) => void
): (() => void) => {
  try {
    const userRef = ref(userDb, `users/${userId}`);
    const unsubscribeRtdb = onValue(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.val());
        }
      },
      (err) => console.warn('[UserRTDB] Listen error:', err.message)
    );

    return () => {
      unsubscribeRtdb();
    };
  } catch (e) {
    console.warn('[Firebase] subscribeToUserData error:', e);
    return () => {};
  }
};

// Listen to all users (for community earners, leaderboard and multi-device presence)
export const subscribeToAllUsers = (
  onData: (users: User[]) => void
): (() => void) => {
  try {
    const usersRef = ref(userDb, 'users');
    const unsubscribeRtdb = onValue(
      usersRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: User[] = Object.values(val);
          list.sort((a, b) => (b.balanceUSDT || 0) - (a.balanceUSDT || 0));
          onData(list);
        }
      },
      (err) => console.warn('[UserRTDB] All users listen error:', err.message)
    );

    return () => {
      unsubscribeRtdb();
    };
  } catch (e) {
    console.warn('[Firebase] subscribeToAllUsers error:', e);
    return () => {};
  }
};

// Query a user by unique telegramId from photo-cash-30b8c
export const findUserByTelegramId = async (
  telegramId: string
): Promise<User | null> => {
  try {
    const usersRef = ref(userDb, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const usersObj = snapshot.val();
      for (const userVal of Object.values<any>(usersObj)) {
        if (userVal.telegramId === telegramId) {
          return userVal as User;
        }
      }
    }
  } catch (e) {
    console.warn('[Firebase] findUserByTelegramId error:', e);
  }
  return null;
};

// Save a new cashout transaction to photo-cash-30b8c
export const syncTransactionToFirebase = async (tx: Transaction) => {
  try {
    const txRef = ref(userDb, `transactions/${tx.id}`);
    set(txRef, tx).catch((err) =>
      console.warn('[UserRTDB] Set tx failed:', err.message)
    );

    const txDocRef = doc(userFirestore, 'transactions', tx.id);
    setDoc(txDocRef, tx).catch((err) =>
      console.warn('[UserFirestore] Set tx failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] syncTransactionToFirebase error:', e);
  }
};

// Update cashout status (approve / reject)
export const updateTransactionStatusInFirebase = async (
  txId: string,
  status: 'approved' | 'rejected'
) => {
  try {
    const txRef = ref(userDb, `transactions/${txId}`);
    update(txRef, { status }).catch((err) =>
      console.warn('[UserRTDB] Update tx failed:', err.message)
    );

    const txDocRef = doc(userFirestore, 'transactions', txId);
    updateDoc(txDocRef, { status }).catch((err) =>
      console.warn('[UserFirestore] Update tx failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] updateTransactionStatus error:', e);
  }
};

// Listen for all transactions in photo-cash-30b8c
export const subscribeToTransactions = (
  onData: (transactions: Transaction[]) => void
): (() => void) => {
  try {
    const txsRef = ref(userDb, 'transactions');
    const unsubscribeRtdb = onValue(
      txsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: Transaction[] = Object.values(val);
          list.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          onData(list);
        }
      },
      (err) => console.warn('[UserRTDB] Transactions listen error:', err.message)
    );

    return () => {
      unsubscribeRtdb();
    };
  } catch (e) {
    console.warn('[Firebase] subscribeToTransactions error:', e);
    return () => {};
  }
};

// Sync global app settings to photo-cash-30b8c
export const syncSettingsToFirebase = async (settings: Partial<AppSettings>) => {
  try {
    const settingsRef = ref(userDb, 'app_settings');
    update(settingsRef, settings).catch((err) =>
      console.warn('[UserRTDB] Settings update failed:', err.message)
    );

    const settingsDoc = doc(userFirestore, 'app_settings', 'config');
    setDoc(settingsDoc, settings, { merge: true }).catch((err) =>
      console.warn('[UserFirestore] Settings update failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] syncSettingsToFirebase error:', e);
  }
};

// Subscribe to global app settings from photo-cash-30b8c
export const subscribeToSettings = (
  onData: (settings: Partial<AppSettings>) => void
): (() => void) => {
  try {
    const settingsRef = ref(userDb, 'app_settings');
    const unsubscribe = onValue(
      settingsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onData(snapshot.val());
        }
      },
      (err) => console.warn('[UserRTDB] Settings listen error:', err.message)
    );
    return () => unsubscribe();
  } catch (e) {
    console.warn('[Firebase] subscribeToSettings error:', e);
    return () => {};
  }
};


/* =========================================================================
   2. PUBLIC MEDIA & FEED DATABASE (photo-cash-2)
   Handles: Public posts, images, captions, stories, likes, multi-device feed
   ========================================================================= */

// Publish a new post to photo-cash-2 so all devices can see it in feed
export const publishPostToFirebase = async (post: Post) => {
  try {
    // 1. Realtime Database
    const postRef = ref(mediaDb, `posts/${post.id}`);
    set(postRef, post).catch((err) =>
      console.warn('[MediaRTDB] Publish post failed:', err.message)
    );

    // 2. Firestore
    const postDocRef = doc(mediaFirestore, 'posts', post.id);
    setDoc(postDocRef, post).catch((err) =>
      console.warn('[MediaFirestore] Publish post failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] publishPostToFirebase error:', e);
  }
};

// Update post like count in photo-cash-2
export const updatePostLikesInFirebase = async (
  postId: string,
  likesCount: number
) => {
  try {
    const postRef = ref(mediaDb, `posts/${postId}`);
    update(postRef, { likesCount }).catch((err) =>
      console.warn('[MediaRTDB] Update likes failed:', err.message)
    );

    const postDocRef = doc(mediaFirestore, 'posts', postId);
    updateDoc(postDocRef, { likesCount }).catch((err) =>
      console.warn('[MediaFirestore] Update likes failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] updatePostLikes error:', e);
  }
};

// Update post content / caption in photo-cash-2
export const updatePostInFirebase = async (
  postId: string,
  updates: Partial<Post>
) => {
  try {
    const postRef = ref(mediaDb, `posts/${postId}`);
    update(postRef, updates).catch((err) =>
      console.warn('[MediaRTDB] Update post failed:', err.message)
    );

    const postDocRef = doc(mediaFirestore, 'posts', postId);
    updateDoc(postDocRef, updates).catch((err) =>
      console.warn('[MediaFirestore] Update post failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] updatePostInFirebase error:', e);
  }
};

// Update post comments in photo-cash-2
export const updatePostCommentsInFirebase = async (
  postId: string,
  comments: PostComment[],
  commentsCount: number
) => {
  try {
    const postRef = ref(mediaDb, `posts/${postId}`);
    update(postRef, { comments, commentsCount }).catch((err) =>
      console.warn('[MediaRTDB] Update comments failed:', err.message)
    );

    const postDocRef = doc(mediaFirestore, 'posts', postId);
    updateDoc(postDocRef, { comments, commentsCount }).catch((err) =>
      console.warn('[MediaFirestore] Update comments failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] updatePostComments error:', e);
  }
};

// Real-time listener for public posts from photo-cash-2 across all devices
export const subscribeToPublicPosts = (
  onData: (posts: Post[]) => void
): (() => void) => {
  try {
    const postsRef = ref(mediaDb, 'posts');
    const unsubscribeRtdb = onValue(
      postsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: Post[] = Object.values(val);
          // Sort newest posts first
          list.sort((a, b) => {
            const timeA = parseInt(a.id.replace('p-', ''), 10) || 0;
            const timeB = parseInt(b.id.replace('p-', ''), 10) || 0;
            return timeB - timeA;
          });
          onData(list);
        }
      },
      (err) => console.warn('[MediaRTDB] Posts listen error:', err.message)
    );

    // Also try Firestore fallback listener
    const postsCollection = collection(mediaFirestore, 'posts');
    const unsubscribeFirestore = onSnapshot(
      postsCollection,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Post[] = snapshot.docs.map((docSnap) => docSnap.data() as Post);
          list.sort((a, b) => {
            const timeA = parseInt(a.id.replace('p-', ''), 10) || 0;
            const timeB = parseInt(b.id.replace('p-', ''), 10) || 0;
            return timeB - timeA;
          });
          onData(list);
        }
      },
      (err) => console.warn('[MediaFirestore] Posts listen error:', err.message)
    );

    return () => {
      unsubscribeRtdb();
      unsubscribeFirestore();
    };
  } catch (e) {
    console.warn('[Firebase] subscribeToPublicPosts error:', e);
    return () => {};
  }
};

// Publish a new story to photo-cash-2 so all devices can view it
export const publishStoryToFirebase = async (story: Story) => {
  try {
    const storyRef = ref(mediaDb, `stories/${story.id}`);
    set(storyRef, story).catch((err) =>
      console.warn('[MediaRTDB] Publish story failed:', err.message)
    );

    const storyDocRef = doc(mediaFirestore, 'stories', story.id);
    setDoc(storyDocRef, story).catch((err) =>
      console.warn('[MediaFirestore] Publish story failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] publishStoryToFirebase error:', e);
  }
};

// Delete story from photo-cash-2
export const deleteStoryFromFirebase = async (storyId: string) => {
  try {
    const storyRef = ref(mediaDb, `stories/${storyId}`);
    remove(storyRef).catch((err) =>
      console.warn('[MediaRTDB] Delete story failed:', err.message)
    );

    const storyDocRef = doc(mediaFirestore, 'stories', storyId);
    deleteDoc(storyDocRef).catch((err) =>
      console.warn('[MediaFirestore] Delete story failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] deleteStoryFromFirebase error:', e);
  }
};

// Real-time listener for public stories from photo-cash-2
export const subscribeToPublicStories = (
  onData: (stories: Story[]) => void
): (() => void) => {
  try {
    const storiesRef = ref(mediaDb, 'stories');
    const unsubscribeRtdb = onValue(
      storiesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          const list: Story[] = Object.values(val);
          list.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          onData(list);
        }
      },
      (err) => console.warn('[MediaRTDB] Stories listen error:', err.message)
    );

    return () => {
      unsubscribeRtdb();
    };
  } catch (e) {
    console.warn('[Firebase] subscribeToPublicStories error:', e);
    return () => {};
  }
};

// Delete a post from photo-cash-2 (Admin moderation)
export const deletePostFromFirebase = async (postId: string) => {
  try {
    const postRef = ref(mediaDb, `posts/${postId}`);
    remove(postRef).catch((err) =>
      console.warn('[MediaRTDB] Delete post failed:', err.message)
    );

    const postDocRef = doc(mediaFirestore, 'posts', postId);
    deleteDoc(postDocRef).catch((err) =>
      console.warn('[MediaFirestore] Delete post failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] deletePostFromFirebase error:', e);
  }
};

// Update user balance or data in photo-cash-30b8c
export const updateUserInFirebase = async (userId: string, updates: Partial<User>) => {
  try {
    const userRef = ref(userDb, `users/${userId}`);
    update(userRef, updates).catch((err) =>
      console.warn('[UserRTDB] Update user failed:', err.message)
    );

    const userDocRef = doc(userFirestore, 'users', userId);
    updateDoc(userDocRef, updates).catch((err) =>
      console.warn('[UserFirestore] Update user failed:', err.message)
    );
  } catch (e) {
    console.warn('[Firebase] updateUserInFirebase error:', e);
  }
};

// Credit referral bonus to referrer by telegramId in photo-cash-30b8c
export const creditReferralInFirebase = async (
  referrerTelegramId: string,
  bonusAmount: number
) => {
  try {
    const usersRef = ref(userDb, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const usersObj = snapshot.val();
      for (const [key, userVal] of Object.entries<any>(usersObj)) {
        if (userVal.telegramId === referrerTelegramId) {
          const newTotalRefer = (userVal.totalRefer || 0) + 1;
          const newActiveRefer = (userVal.activeRefer || 0) + 1;
          const newBal = Number(((userVal.balanceUSDT || 0) + bonusAmount).toFixed(3));
          const newLife = Number(((userVal.lifetimeEarningsUSDT || 0) + bonusAmount).toFixed(3));

          update(ref(userDb, `users/${key}`), {
            totalRefer: newTotalRefer,
            activeRefer: newActiveRefer,
            balanceUSDT: newBal,
            lifetimeEarningsUSDT: newLife,
          }).catch((err) => console.warn('[UserRTDB] Refer credit error:', err));

          updateDoc(doc(userFirestore, 'users', key), {
            totalRefer: newTotalRefer,
            activeRefer: newActiveRefer,
            balanceUSDT: newBal,
            lifetimeEarningsUSDT: newLife,
          }).catch((err) => console.warn('[UserFirestore] Refer credit error:', err));
          break;
        }
      }
    }
  } catch (e) {
    console.warn('[Firebase] creditReferralInFirebase error:', e);
  }
};

