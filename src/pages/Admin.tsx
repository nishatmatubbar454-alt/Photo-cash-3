import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Key,
  Settings,
  DollarSign,
  Megaphone,
  Database,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  History,
  Radio,
  Sliders,
  CreditCard,
  Users,
  Search,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { uploadToImgBB } from '../utils/upload';
import {
  subscribeToAllUsers,
  updateUserInFirebase
} from '../services/firebaseSync';
import { User, Post, Transaction } from '../types';

type AdminTab =
  | 'dashboard'
  | 'add_post'
  | 'post_history'
  | 'ads_manager'
  | 'settings'
  | 'payments'
  | 'users';

const ADMIN_SESSION_KEY = 'pc_admin_session_auth_v1';
const ADMIN_SECRET_CODE = 'NiShAt11234';

export const Admin: React.FC = () => {
  const {
    currentUser,
    setActiveTab,
    transactions,
    allPosts,
    addPost,
    deletePost,
    approveCashout,
    rejectCashout
  } = useAuth();
  const { settings, updateSettings } = useSettings();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authorized';
  });
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  // Active Menu Section
  const [currentMenuTab, setCurrentMenuTab] = useState<AdminTab>('dashboard');

  // Real-time Users List from Firebase photo-cash-30b8c
  const [allUsersList, setAllUsersList] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [postSearchQuery, setPostSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Settings State
  const [apiKey, setApiKey] = useState(settings.imageHostingApiKey || 'cbba7a8d9d2aae1860641bead99ef779');
  const [bannerAdKey, setBannerAdKey] = useState(settings.bannerAdKey || '911ee250303f0d466e6e2cab58b077e0');
  const [enableFeedAds, setEnableFeedAds] = useState(settings.enableFeedAds !== false);
  const [enableStoryAds, setEnableStoryAds] = useState(settings.enableStoryAds !== false);
  const [minWithdraw, setMinWithdraw] = useState(settings.minCashOutUSDT.toString());
  const [reqRefers, setReqRefers] = useState(settings.requiredRefersForWithdraw.toString());
  const [referBonus, setReferBonus] = useState(settings.referBonusUSDT?.toString() || '0.50');
  const [earnPerPost, setEarnPerPost] = useState(settings.earnPerPostUSDT?.toString() || '0.02');
  const [earnTimer, setEarnTimer] = useState((settings.earnTimerMin ?? 10).toString());
  const [earnPassive, setEarnPassive] = useState((settings.earnPassiveUSDT ?? 0.009).toString());
  const [notice, setNotice] = useState(settings.noticeText);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Add Official Post State
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Listen to all users from photo-cash-30b8c
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = subscribeToAllUsers((users) => {
      if (users && users.length > 0) {
        setAllUsersList(users);
      }
    });
    return () => unsubscribe();
  }, [isAuthenticated]);

  // Auth Verification Handler
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === ADMIN_SECRET_CODE) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'authorized');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      const nextAttempts = attemptCount + 1;
      setAttemptCount(nextAttempts);
      setAuthError('অননুমোদিত অ্যাক্সেস কোড! সঠিক সিকিউরিটি কোড দিন।');
      setPasscode('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Save Settings Handler
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      imageHostingApiKey: apiKey.trim(),
      bannerAdKey: bannerAdKey.trim(),
      enableFeedAds,
      enableStoryAds,
      minCashOutUSDT: parseFloat(minWithdraw) || 5.0,
      requiredRefersForWithdraw: parseInt(reqRefers, 10) || 18,
      referBonusUSDT: parseFloat(referBonus) || 0.50,
      earnPerPostUSDT: parseFloat(earnPerPost) || 0.02,
      earnTimerMin: parseInt(earnTimer, 10) || 10,
      earnPassiveUSDT: parseFloat(earnPassive) || 0.009,
      noticeText: notice,
    });
    setSavedToast('সেটিংস সফলভাবে সংরক্ষিত ও ক্লাউডে সিঙ্ক হয়েছে!');
    setTimeout(() => setSavedToast(null), 3500);
  };

  // Image Upload Handler for Official Admin Post
  const handleAdminImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImg(true);
      try {
        const url = await uploadToImgBB(file, apiKey);
        setNewPostImageUrl(url);
      } catch (err) {
        console.error('Image upload failed', err);
      } finally {
        setIsUploadingImg(false);
      }
    }
  };

  // Create Official Post
  const handleCreateOfficialPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostCaption.trim() && !newPostImageUrl) return;

    addPost(newPostCaption, newPostImageUrl || undefined);
    setNewPostCaption('');
    setNewPostImageUrl('');
    setSavedToast('অফিসিয়াল পোস্ট সফলভাবে পাবলিক ফিডে পাবলিশ হয়েছে!');
    setTimeout(() => setSavedToast(null), 3500);
    setCurrentMenuTab('post_history');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered lists
  const filteredUsers = allUsersList.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.telegramId.includes(q)
    );
  });

  const filteredPosts = allPosts.filter((p) => {
    const q = postSearchQuery.toLowerCase();
    return (
      (p.content || '').toLowerCase().includes(q) ||
      (p.userName || '').toLowerCase().includes(q)
    );
  });

  const filteredTransactions = transactions.filter((t) => {
    if (paymentFilter === 'all') return true;
    return t.status === paymentFilter;
  });

  // Calculate stats
  const totalPendingAmount = transactions
    .filter((t) => t.status === 'pending')
    .reduce((acc, t) => acc + t.amountUSDT, 0);

  const totalApprovedAmount = transactions
    .filter((t) => t.status === 'approved')
    .reduce((acc, t) => acc + t.amountUSDT, 0);

  /* =========================================================================
     SECURITY LOCK SCREEN (যদি পাসকোড ম্যাচ না করে)
     পাসওয়ার্ড কোথাও লেখা থাকবে না!
     ========================================================================= */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-white">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Background glowing cyber effect */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-600/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-600/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Top back button */}
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমে ফিরে যান</span>
          </button>

          {/* Security Shield Icon */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 mx-auto flex items-center justify-center shadow-lg shadow-rose-900/30">
              <ShieldCheck className="w-9 h-9 text-white stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-white">
              এডমিন সিকিউরিটি গেটওয়ে
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed px-2">
              এই কন্ট্রোল প্যানেলে প্রবেশ করতে শুধুমাত্র অনুমোদিত মাস্টার অ্যাক্সেস কোড প্রদান করুন।
            </p>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs text-center font-bold flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Passcode Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 block uppercase tracking-wider">
                মাস্টার সিকিউরিটি কোড
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                  required
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl px-4 py-3 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-[#ff5938] to-amber-500 text-white font-black text-xs tracking-wider uppercase shadow-lg shadow-rose-950/50 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4 stroke-[2.5]" />
              <span>ভেরিফাই ও আনলক করুন</span>
            </button>
          </form>

          <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
            Protected by Dual Cloud Security Architecture
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     ADMIN PANEL AUTHENTICATED DASHBOARD & MENU SECTIONS
     ========================================================================= */
  return (
    <div className="flex-1 bg-[#f8fafc] pb-24 font-sans min-h-screen">
      {/* Top Header */}
      <div className="bg-slate-900 text-white px-4 py-3 sticky top-0 z-30 shadow-md flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-sm font-black tracking-tight">এডমিন কন্ট্রোল প্যানেল</h2>
            </div>
            <span className="text-[10px] text-slate-400">মাস্টার সিকিউরিটি সক্রিয়</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            title="লক করুন"
            className="px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-800/80 text-rose-300 text-[10px] font-bold flex items-center gap-1 hover:bg-rose-900 active:scale-95 transition"
          >
            <LogOut className="w-3 h-3" />
            <span>লক করুন</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {savedToast && (
        <div className="m-3 p-3 bg-emerald-500 text-white text-xs rounded-2xl text-center font-bold flex items-center justify-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Navigation Tab Menu Bar (মেনু অংশ) */}
      <div className="bg-white border-b border-slate-200 sticky top-14 z-20 overflow-x-auto no-scrollbar py-1 px-2 shadow-xs">
        <div className="flex items-center gap-1 min-w-max">
          {/* Dashboard */}
          <button
            onClick={() => setCurrentMenuTab('dashboard')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              currentMenuTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>ড্যাশবোর্ড</span>
          </button>

          {/* 1. পোস্ট এড */}
          <button
            onClick={() => setCurrentMenuTab('add_post')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              currentMenuTab === 'add_post'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>১. পোস্ট এড</span>
          </button>

          {/* 2. পোস্ট হিস্টরি */}
          <button
            onClick={() => setCurrentMenuTab('post_history')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              currentMenuTab === 'post_history'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>২. পোস্ট হিস্টরি</span>
          </button>

          {/* 3. ads Manag */}
          <button
            onClick={() => setCurrentMenuTab('ads_manager')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              currentMenuTab === 'ads_manager'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>৩. ads Manag</span>
          </button>

          {/* 4. Satting */}
          <button
            onClick={() => setCurrentMenuTab('settings')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              currentMenuTab === 'settings'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>৪. Satting</span>
          </button>

          {/* 5. পেমেন্ট রিকুয়েস্ট */}
          <button
            onClick={() => setCurrentMenuTab('payments')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              currentMenuTab === 'payments'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>৫. পেমেন্ট রিকুয়েস্ট</span>
            {transactions.filter((t) => t.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>

          {/* 6. ইউজার লিস্ট */}
          <button
            onClick={() => setCurrentMenuTab('users')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
              currentMenuTab === 'users'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>৬. ইউজার লিস্ট</span>
          </button>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5 max-w-3xl mx-auto">
        {/* ===================================================================
           TAB: ড্যাশবোর্ড (Dashboard with live users & financial stats)
           =================================================================== */}
        {currentMenuTab === 'dashboard' && (
          <div className="space-y-3.5 animate-in fade-in">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Users */}
              <div
                onClick={() => setCurrentMenuTab('users')}
                className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs cursor-pointer hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold">মোট ইউজার</span>
                  <Users className="w-4 h-4 text-sky-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {Math.max(1, allUsersList.length)} জন
                </h3>
                <span className="text-[10px] text-sky-600 font-bold">Firebase DB 1</span>
              </div>

              {/* Feed Posts */}
              <div
                onClick={() => setCurrentMenuTab('post_history')}
                className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs cursor-pointer hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold">পাবলিক পোস্ট</span>
                  <History className="w-4 h-4 text-[#ff5938]" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {allPosts.length} টি
                </h3>
                <span className="text-[10px] text-[#ff5938] font-bold">Firebase DB 2</span>
              </div>

              {/* Pending Withdrawals */}
              <div
                onClick={() => setCurrentMenuTab('payments')}
                className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs cursor-pointer hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold">পেন্ডিং ক্যাশআউট</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-amber-600 mt-1">
                  ${totalPendingAmount.toFixed(2)}
                </h3>
                <span className="text-[10px] text-amber-600 font-bold">
                  {transactions.filter((t) => t.status === 'pending').length} টি রিকোয়েস্ট
                </span>
              </div>

              {/* Total Paid */}
              <div
                onClick={() => setCurrentMenuTab('payments')}
                className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs cursor-pointer hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-bold">টোটাল পেইড</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-emerald-600 mt-1">
                  ${totalApprovedAmount.toFixed(2)}
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">অনুমোদিত উইথড্র</span>
              </div>
            </div>

            {/* Dual Firebase Live Status Card */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <Database className="w-4 h-4 text-[#ff5938]" />
                  <h3 className="text-xs font-black">Connected Dual Firebase Databases</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  🟢 2 Databases Live
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* DB 1 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      DB 1: User & Wallet
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      photo-cash-30b8c
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    ইউজারের সকল তথ্য, ব্যালেন্স ($USDT), প্রতি পোস্টের ইনকাম ও ক্যাশআউট রিকোয়েস্ট।
                  </p>
                  <div className="text-[10px] font-bold text-slate-700 bg-white p-1.5 rounded-xl border border-slate-200/60 flex justify-between">
                    <span>ক্যাশআউট রিকোয়েস্ট:</span>
                    <span>{transactions.length} টি</span>
                  </div>
                </div>

                {/* DB 2 */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                      DB 2: Public Media & Feed
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      photo-cash-2
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    সকল পোস্টের ছবি, ক্যাপশন ও স্টোরি ক্রস-ডিভাইসে ফেসবুকের মতো স্ক্রোলিং হচ্ছে।
                  </p>
                  <div className="text-[10px] font-bold text-slate-700 bg-white p-1.5 rounded-xl border border-slate-200/60 flex justify-between">
                    <span>লাইভ পোস্ট:</span>
                    <span>{allPosts.length} টি পোস্ট ফিডে</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Grid */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
              <h3 className="text-xs font-black text-slate-800">কুইক অ্যাকশন মেনু</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setCurrentMenuTab('add_post')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition"
                >
                  <PlusCircle className="w-5 h-5 text-indigo-500 mb-1" />
                  <span className="text-xs font-black text-slate-900 block">নতুন পোস্ট করুন</span>
                  <span className="text-[10px] text-slate-400">পাবলিক ফিডে অ্যাড বা নোটিশ দিন</span>
                </button>

                <button
                  onClick={() => setCurrentMenuTab('payments')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition"
                >
                  <CreditCard className="w-5 h-5 text-emerald-500 mb-1" />
                  <span className="text-xs font-black text-slate-900 block">পেমেন্ট রিকোয়েস্ট</span>
                  <span className="text-[10px] text-slate-400">উইথড্রল অ্যাপ্রুভ বা রিজেক্ট করুন</span>
                </button>

                <button
                  onClick={() => setCurrentMenuTab('ads_manager')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition"
                >
                  <Megaphone className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="text-xs font-black text-slate-900 block">অ্যাড কন্ট্রোল</span>
                  <span className="text-[10px] text-slate-400">Adsterra ব্যানার কি ও টগল</span>
                </button>

                <button
                  onClick={() => setCurrentMenuTab('settings')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition"
                >
                  <Sliders className="w-5 h-5 text-blue-500 mb-1" />
                  <span className="text-xs font-black text-slate-900 block">অ্যাপ সেটিংস</span>
                  <span className="text-[10px] text-slate-400">মিনিমাম উইথড্র ও প্রতি পোস্ট আয়</span>
                </button>

                <button
                  onClick={() => setCurrentMenuTab('users')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition"
                >
                  <Users className="w-5 h-5 text-purple-500 mb-1" />
                  <span className="text-xs font-black text-slate-900 block">ইউজার ম্যানেজমেন্ট</span>
                  <span className="text-[10px] text-slate-400">ইউজারদের ব্যালেন্স ও রেফার ট্র্যাক</span>
                </button>

                <button
                  onClick={() => setCurrentMenuTab('post_history')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-left transition"
                >
                  <History className="w-5 h-5 text-rose-500 mb-1" />
                  <span className="text-xs font-black text-slate-900 block">পোস্ট হিস্টরি</span>
                  <span className="text-[10px] text-slate-400">পোস্ট ডিলিট বা মডারেশন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
           TAB: ১. পোস্ট এড (Add / Create Post to Feed)
           =================================================================== */}
        {currentMenuTab === 'add_post' && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-slate-800">
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-black">১. এডমিন পোস্ট ও স্পনসরড অ্যাড পাবলিশ</h3>
            </div>
            <p className="text-[10px] text-slate-500">
              এখানে পোস্ট করলে তা সরাসরি <strong className="text-sky-600 font-mono">photo-cash-2</strong> ডাটাবেজে যুক্ত হয়ে সমস্ত ভিজিটরদের ফিডে চলে যাবে।
            </p>

            <form onSubmit={handleCreateOfficialPost} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  পোস্টের ক্যাপশন বা নোটিশ
                </label>
                <textarea
                  rows={3}
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  placeholder="অফিসিয়াল আপডেট বা স্পনসরড মেসেজ লিখুন..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Image selector or URL */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  ছবি আপলোড (ImgBB দিয়ে সরাসরি ক্লাউডে সেভ হবে)
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1.5 transition">
                    <ImageIcon className="w-4 h-4" />
                    <span>{isUploadingImg ? 'আপলোড হচ্ছে...' : 'ছবি বাছাই করুন'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminImageUpload}
                      disabled={isUploadingImg}
                      className="hidden"
                    />
                  </label>

                  <span className="text-[10px] text-slate-400">বা সরাসরি ইমেজ লিংক দিন:</span>
                </div>

                <input
                  type="url"
                  value={newPostImageUrl}
                  onChange={(e) => setNewPostImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                />

                {newPostImageUrl && (
                  <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 max-h-48 flex items-center justify-center bg-slate-100">
                    <img
                      src={newPostImageUrl}
                      alt="Preview"
                      className="max-h-48 object-contain"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isUploadingImg || (!newPostCaption.trim() && !newPostImageUrl)}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black text-xs shadow-sm hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>পাবলিক ফিডে পোস্ট করুন</span>
              </button>
            </form>
          </div>
        )}

        {/* ===================================================================
           TAB: ২. পোস্ট হিস্টরি (Post History & Moderation)
           =================================================================== */}
        {currentMenuTab === 'post_history' && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <History className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-black">২. পোস্ট হিস্টরি ({allPosts.length})</h3>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={postSearchQuery}
                onChange={(e) => setPostSearchQuery(e.target.value)}
                placeholder="পোস্টের ক্যাপশন বা ইউজারের নাম দিয়ে খুঁজুন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Posts List */}
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredPosts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  কোনো পোস্ট পাওয়া যায়নি
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 hover:border-slate-300 transition"
                  >
                    {/* Thumbnail if image exists */}
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt="Post"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-bold flex-shrink-0">
                        Text Only
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {post.userName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {post.dateString}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                        <span>❤️ {post.likesCount} লাইক</span>
                        <span>💬 {post.commentsCount} কমেন্ট</span>
                      </div>
                    </div>

                    {/* Delete Action Button */}
                    <button
                      onClick={() => {
                        if (confirm('আপনি কি নিশ্চিত যে এই পোস্টটি মুছে ফেলতে চান?')) {
                          deletePost(post.id);
                          setSavedToast('পোস্ট সফলভাবে ডাটাবেজ থেকে মুছে ফেলা হয়েছে!');
                          setTimeout(() => setSavedToast(null), 3000);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition active:scale-95 flex-shrink-0 cursor-pointer"
                      title="পোস্ট মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
           TAB: ৩. ads Manag (Ads Manager)
           =================================================================== */}
        {currentMenuTab === 'ads_manager' && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-slate-800">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-black">৩. Adsterra ও ব্যানার অ্যাড ম্যানেজার</h3>
            </div>
            <p className="text-[10px] text-slate-500">
              ফিডের প্রতিটি পোস্টের পর এবং ইনস্টাগ্রাম স্টোরির মাঝে স্বয়ংক্রিয়ভাবে ডিসপ্লে হওয়া ৩০০×২৫০ ব্যানার বিজ্ঞাপন নিয়ন্ত্রণ করুন।
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  Adsterra 300×250 Banner Key
                </label>
                <input
                  type="text"
                  value={bannerAdKey}
                  onChange={(e) => setBannerAdKey(e.target.value)}
                  placeholder="911ee250303f0d466e6e2cab58b077e0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      ফিডে ব্যানার অ্যাড দেখান (Feed Banner Ads)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      পোস্টের মাঝে মাঝে 300x250 Adsterra ব্যানার রান হবে
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableFeedAds}
                      onChange={(e) => setEnableFeedAds(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      স্টোরির মাঝে ব্যানার অ্যাড দেখান (Story Ads)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ২৪ ঘণ্টার স্টোরি স্লাইডশো দেখার সময় অ্যাড শো করবে
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableStoryAds}
                      onChange={(e) => setEnableStoryAds(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs shadow-sm hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>বিজ্ঞাপন সেটিংস সেভ করুন</span>
              </button>
            </form>
          </div>
        )}

        {/* ===================================================================
           TAB: ৪. Satting (Settings)
           =================================================================== */}
        {currentMenuTab === 'settings' && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in"
          >
            <div className="flex items-center gap-2 text-slate-800">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black">৪. অ্যাপ গ্লোবাল সেটিংস ও আর্নিং রুলস</h3>
            </div>
            <p className="text-[10px] text-slate-500">
              এখানে পরিবর্তন করা মানগুলো সাথে সাথে <strong className="text-emerald-600 font-mono">photo-cash-30b8c</strong> ডাটাবেজে আপডেট হয়ে বিশ্বের সমস্ত ইউজারের ডিভাইসে রিয়েল-টাইমে কার্যকর হবে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  মিনিমাম ক্যাশআউট ($USDT)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={minWithdraw}
                  onChange={(e) => setMinWithdraw(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  উইথড্র করতে প্রয়োজনীয় রেফার সংখ্যা
                </label>
                <input
                  type="number"
                  value={reqRefers}
                  onChange={(e) => setReqRefers(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  প্রতি পোস্টের ইনকাম ($USDT)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={earnPerPost}
                  onChange={(e) => setEarnPerPost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  প্রতি সফল রেফারে বোনাস ($USDT)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={referBonus}
                  onChange={(e) => setReferBonus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  প্রতি ১০ মিনিটে প্রতি পোস্টের আয় ($USDT)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={earnPassive}
                  onChange={(e) => setEarnPassive(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  প্যাসিভ আর্নিং ইন্টারভাল (মিনিট)
                </label>
                <input
                  type="number"
                  value={earnTimer}
                  onChange={(e) => setEarnTimer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                ImgBB Image Hosting API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="cbba7a8d9d2aae1860641bead99ef779"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                গ্লোবাল নোটিশ টেক্সট (রেফার পেজে প্রদর্শিত)
              </label>
              <textarea
                rows={2}
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-sm hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>সেটিংস সেভ ও সিঙ্ক করুন</span>
            </button>
          </form>
        )}

        {/* ===================================================================
           TAB: ৫. পেমেন্ট রিকুয়েস্ট (Payment Requests Management)
           =================================================================== */}
        {currentMenuTab === 'payments' && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black">৫. ক্যাশআউট ও পেমেন্ট রিকুয়েস্ট</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-500 font-mono">
                মোট: {transactions.length}
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPaymentFilter(filter)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition capitalize ${
                    paymentFilter === filter
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Transactions List */}
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  কোনো পেমেন্ট রিকোয়েস্ট পাওয়া যায়নি
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-slate-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{tx.userName}</span>
                          <span className="text-[10px] font-mono text-slate-500">ID: {tx.userId}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          ${(tx.amountUSDT ?? 0).toFixed(2)} USDT
                        </span>
                        <span
                          className={`text-[10px] font-bold block ${
                            tx.status === 'approved'
                              ? 'text-emerald-600'
                              : tx.status === 'rejected'
                              ? 'text-rose-600'
                              : 'text-amber-500'
                          }`}
                        >
                          ● {tx.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Binance BEP20 Address Row */}
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 text-xs font-mono">
                      <span className="text-slate-700 truncate pr-2">{tx.address}</span>
                      <button
                        onClick={() => copyToClipboard(tx.address, tx.id)}
                        className="text-slate-400 hover:text-slate-800 flex-shrink-0"
                        title="কপি করুন"
                      >
                        {copiedId === tx.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Action Buttons for Pending */}
                    {tx.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            approveCashout(tx.id);
                            setSavedToast('পেমেন্ট রিকোয়েস্ট সফলভাবে Approved করা হয়েছে!');
                            setTimeout(() => setSavedToast(null), 3000);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve (অনুমোদন)</span>
                        </button>

                        <button
                          onClick={() => {
                            rejectCashout(tx.id);
                            setSavedToast('পেমেন্ট রিকোয়েস্ট Rejected এবং রিফান্ড করা হয়েছে!');
                            setTimeout(() => setSavedToast(null), 3000);
                          }}
                          className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject (বাতিল)</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
           TAB: ৬. ইউজার লিস্ট (User List Management)
           =================================================================== */}
        {currentMenuTab === 'users' && (
          <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Users className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-black">
                  ৬. রেজিস্টার্ড ইউজার তালিকা ({allUsersList.length})
                </h3>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                photo-cash-30b8c
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="নাম, ইউজারনেম বা টেলিগ্রাম আইডি দিয়ে খুঁজুন..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Users List */}
            <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  কোনো ইউজার পাওয়া যায়নি
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-900">{user.name}</span>
                          {user.role === 'admin' && (
                            <span className="bg-rose-100 text-rose-700 text-[9px] px-1.5 py-0.2 rounded font-black">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          TG ID: {user.telegramId}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span>পোস্ট: {user.postsCount}</span>
                          <span>•</span>
                          <span>রেফার: {user.totalRefer} জন</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600 block">
                        ${(user.balanceUSDT || 0).toFixed(3)} USDT
                      </span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        লাইফটাইম: ${(user.lifetimeEarningsUSDT || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
