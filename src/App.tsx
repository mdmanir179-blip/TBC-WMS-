/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Gift,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Menu,
  X,
  Globe,
  Rocket,
  Eye,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  UserCheck,
  LogOut,
  Sparkles,
  Palette,
  Eraser,
  Trash2
} from 'lucide-react';

import { WmsProduct, WmsClaim, ClaimStatus, Platform, UserSession, ThemeColor } from './types/wms';
import { storage } from './services/storage';
import { themeService } from './services/theme';
import { ToastContainer, ToastMessage } from './components/Toast';
import { VercelGuideModal } from './components/VercelGuideModal';
import { ProofLightbox } from './components/ProofLightbox';
import { CustomerClaimModal } from './components/CustomerClaimModal';
import { ProductModal } from './components/ProductModal';
import { PayoutModal } from './components/PayoutModal';
import { RejectionModal } from './components/RejectionModal';
import { ClaimDetailDrawer } from './components/ClaimDetailDrawer';
import { LoginModal } from './components/LoginModal';
import { ThemeModal } from './components/ThemeModal';

type NavSection = 'overview' | 'verification' | 'payouts' | 'products' | 'customer_view';

export default function App() {
  // Navigation & View state
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');

  // User Authentication Session state
  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('tbc_wms_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      type: 'admin',
      name: 'Executive Admin',
      email: 'admin@tbcwms.com',
      adminRole: 'Executive Admin'
    };
  });

  // Color Theme Customization state
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>(() => themeService.getTheme());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const themeConfig = themeService.getConfig(currentTheme);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<'customer' | 'admin'>('customer');

  // Core Data
  const [products, setProducts] = useState<WmsProduct[]>([]);
  const [claims, setClaims] = useState<WmsClaim[]>([]);

  // Customer Session details
  const [customerSession, setCustomerSession] = useState({
    name: 'Rahul Roy',
    phone: '9876543210',
    email: 'rahul.roy@example.com'
  });

  // UI Modals & Drawers
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<WmsProduct | null>(null);
  const [selectedProductForClaim, setSelectedProductForClaim] = useState<WmsProduct | null>(null);

  const [selectedClaimForDrawer, setSelectedClaimForDrawer] = useState<WmsClaim | null>(null);
  const [claimToPayout, setClaimToPayout] = useState<WmsClaim | null>(null);
  const [claimToReject, setClaimToReject] = useState<WmsClaim | null>(null);

  // Lightbox
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
    subtitle: ''
  });

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [platformFilter, setPlatformFilter] = useState<string>('ALL');

  // Customer View specific state
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPlatform, setCustomerPlatform] = useState<string>('ALL');
  const [customerTab, setCustomerTab] = useState<'products' | 'my_claims'>('products');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load initial data
  useEffect(() => {
    setProducts(storage.getProducts());
    setClaims(storage.getClaims());
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Stat Calculations
  const stats = useMemo(() => {
    const totalClaims = claims.length;
    const pendingCount = claims.filter((c) => c.status === 'Pending').length;
    const approvedCount = claims.filter((c) => c.status === 'Approved').length;
    const paidCount = claims.filter((c) => c.status === 'Paid').length;
    const rejectedCount = claims.filter((c) => c.status === 'Rejected').length;
    const totalCashbackPaid = claims
      .filter((c) => c.status === 'Paid')
      .reduce((acc, c) => acc + c.cashbackAmount, 0);
    const totalCashbackCommitted = claims
      .filter((c) => c.status === 'Pending' || c.status === 'Approved')
      .reduce((acc, c) => acc + c.cashbackAmount, 0);

    return {
      totalClaims,
      pendingCount,
      approvedCount,
      paidCount,
      rejectedCount,
      totalCashbackPaid,
      totalCashbackCommitted
    };
  }, [claims]);

  // Platform Distribution
  const platformStats = useMemo(() => {
    const map: Record<string, { count: number; totalAmount: number }> = {
      Amazon: { count: 0, totalAmount: 0 },
      Flipkart: { count: 0, totalAmount: 0 },
      Blinkit: { count: 0, totalAmount: 0 },
      Other: { count: 0, totalAmount: 0 }
    };

    claims.forEach((c) => {
      const p = ['Amazon', 'Flipkart', 'Blinkit'].includes(c.platform) ? c.platform : 'Other';
      map[p].count += 1;
      map[p].totalAmount += c.cashbackAmount;
    });

    return map;
  }, [claims]);

  // Filtered Claims for Verification & Payout tabs
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      // Search
      const matchesSearch =
        searchQuery === '' ||
        claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.customerPhone.includes(searchQuery) ||
        claim.refundUpi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.submittedCode.toLowerCase().includes(searchQuery.toLowerCase());

      // Status
      let matchesStatus = true;
      if (statusFilter === 'CODE_MISMATCH') {
        matchesStatus = !claim.isCodeMatched;
      } else if (statusFilter !== 'ALL') {
        matchesStatus = claim.status === statusFilter;
      }

      // Platform
      const matchesPlatform = platformFilter === 'ALL' || claim.platform === platformFilter;

      return matchesSearch && matchesStatus && matchesPlatform;
    });
  }, [claims, searchQuery, statusFilter, platformFilter]);

  // Filtered Products for Customer Portal View
  const filteredCustomerProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch =
        customerSearch === '' ||
        prod.title.toLowerCase().includes(customerSearch.toLowerCase()) ||
        prod.brand.toLowerCase().includes(customerSearch.toLowerCase()) ||
        prod.specialCode.toLowerCase().includes(customerSearch.toLowerCase());
      const matchesPlatform = customerPlatform === 'ALL' || prod.platform === customerPlatform;
      return matchesSearch && matchesPlatform;
    });
  }, [products, customerSearch, customerPlatform]);

  // Customer Claims for current phone session
  const customerClaims = useMemo(() => {
    return claims.filter((c) => c.customerPhone === customerSession.phone);
  }, [claims, customerSession.phone]);

  // Admin Actions
  const handleApproveClaim = (claimId: string) => {
    const updated = storage.updateClaim(claimId, { status: 'Approved' });
    if (updated) {
      setClaims(storage.getClaims());
      if (selectedClaimForDrawer && selectedClaimForDrawer.id === claimId) {
        setSelectedClaimForDrawer(updated);
      }
      addToast(
        'success',
        'Claim Approved',
        `Claim #${claimId} approved. Queued for UPI disbursement.`
      );
    }
  };

  const handleConfirmReject = (claimId: string, reason: string) => {
    const updated = storage.updateClaim(claimId, {
      status: 'Rejected',
      rejectionReason: reason
    });
    if (updated) {
      setClaims(storage.getClaims());
      if (selectedClaimForDrawer && selectedClaimForDrawer.id === claimId) {
        setSelectedClaimForDrawer(updated);
      }
      addToast(
        'error',
        'Claim Rejected',
        `Claim #${claimId} marked as rejected with reason recorded.`
      );
    }
  };

  const handleConfirmPayout = (claimId: string, utrRef: string) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const updated = storage.updateClaim(claimId, {
      status: 'Paid',
      payoutRefNo: utrRef,
      paidAt: now
    });
    if (updated) {
      setClaims(storage.getClaims());
      if (selectedClaimForDrawer && selectedClaimForDrawer.id === claimId) {
        setSelectedClaimForDrawer(updated);
      }
      addToast(
        'success',
        'Payout Complete',
        `Cashback released with UTR ${utrRef}. Recipient credited.`
      );
    }
  };

  const handleSaveProduct = (product: WmsProduct) => {
    const exists = products.some((p) => p.id === product.id);
    if (exists) {
      storage.updateProduct(product.id, product);
    } else {
      storage.addProduct(product);
    }
    setProducts(storage.getProducts());
  };

  const handleToggleProductStatus = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const nextStatus = prod.status === 'active' ? 'paused' : 'active';
    storage.updateProduct(productId, { status: nextStatus });
    setProducts(storage.getProducts());
    addToast(
      'info',
      'Status Updated',
      `Product "${prod.title}" is now ${nextStatus.toUpperCase()}`
    );
  };

  const handleDeleteProduct = (productId: string) => {
    storage.deleteProduct(productId);
    setProducts(storage.getProducts());
    addToast('info', 'Product Removed', 'Campaign product removed from catalog.');
  };

  // Customer actions
  const handleSubmitCustomerClaim = (newClaim: WmsClaim) => {
    storage.addClaim(newClaim);
    setClaims(storage.getClaims());
    setProducts(storage.getProducts());
    addToast(
      'success',
      'Claim Submitted Successfully!',
      'Your 3 verification screenshots have been uploaded for Admin Verification.'
    );
  };

  // Lightbox helper
  const handleOpenLightbox = (imageUrl: string, title: string, subtitle?: string) => {
    setLightboxData({
      isOpen: true,
      imageUrl,
      title,
      subtitle
    });
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvContent = storage.exportClaimsToCsv(claims);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `wms_claims_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'CSV Exported', 'Downloaded complete claims & payout ledger as CSV.');
  };

  // Reset to Demo Data
  const handleResetDemoData = () => {
    if (window.confirm('Reset all campaigns and claims to initial verified demo data?')) {
      storage.resetToDemoData();
      setProducts(storage.getProducts());
      setClaims(storage.getClaims());
      addToast('info', 'Database Reset', 'Restored pristine demo catalog and sample claims.');
    }
  };

  // Clean Slate: Clear all products and claims for fresh custom setup
  const handleCleanAllData = () => {
    const confirmMsg =
      language === 'bn'
        ? 'আপনি কি নিশ্চিত যে সমস্ত ডেমো প্রোডাক্ট এবং ক্লেইম মুছে সফটওয়্যারটি সম্পূর্ণ ফ্রেশ করতে চান? আপনি নিজের পছন্দমতো প্রোডাক্ট যোগ করতে পারবেন।'
        : 'Are you sure you want to clean all demo products and claims? Your software will be completely fresh and ready for your custom products.';

    if (window.confirm(confirmMsg)) {
      storage.clearAllData();
      setProducts([]);
      setClaims([]);
      setActiveSection('products');
      addToast(
        'info',
        language === 'bn' ? 'সফটওয়্যার সম্পূর্ণ ক্লিন করা হয়েছে' : 'Database Cleaned & Fresh',
        language === 'bn'
          ? 'এখন "+ Create Campaign Product" এ ক্লিক করে আপনার নিজের প্রোডাক্ট যুক্ত করুন।'
          : 'Ready! Click "+ Create Campaign Product" to add your own items.'
      );
    }
  };

  // Theme change handler
  const handleSelectTheme = (theme: ThemeColor) => {
    setCurrentTheme(theme);
    themeService.setTheme(theme);
    const cfg = themeService.getConfig(theme);
    addToast(
      'success',
      language === 'bn' ? 'থিম কালার পরিবর্তিত হয়েছে' : 'Theme Color Updated',
      language === 'bn' ? `${cfg.nameBn} কালার প্রয়োগ করা হয়েছে।` : `${cfg.nameEn} color palette applied!`
    );
  };

  // Authentication handlers
  const handleOpenCustomerLogin = () => {
    setLoginModalTab('customer');
    setIsLoginModalOpen(true);
  };

  const handleOpenAdminLogin = () => {
    setLoginModalTab('admin');
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUser(session);
    localStorage.setItem('tbc_wms_session', JSON.stringify(session));
    setIsLoginModalOpen(false);

    if (session.type === 'customer') {
      setCustomerSession({
        name: session.name,
        phone: session.phone || '9876543210',
        email: session.email || 'customer@example.com'
      });
      setActiveSection('customer_view');
      addToast(
        'success',
        language === 'bn' ? 'কাস্টমার লগইন সম্পন্ন' : 'Customer Login Successful',
        language === 'bn' ? `স্বাগতম, ${session.name}!` : `Welcome to TBC WMS, ${session.name}!`
      );
    } else {
      setActiveSection('overview');
      addToast(
        'success',
        language === 'bn' ? 'অ্যাডমিন লগইন সম্পন্ন' : 'Admin Login Successful',
        language === 'bn' ? 'TBC WMS এক্সিকিউটিভ ড্যাশবোর্ডে স্বাগতম।' : 'Welcome to TBC WMS Executive Console.'
      );
    }
  };

  const handleLogout = () => {
    const guest: UserSession = {
      type: 'customer',
      name: 'Guest User',
      phone: '',
      email: ''
    };
    setCurrentUser(guest);
    localStorage.removeItem('tbc_wms_session');
    setActiveSection('customer_view');
    addToast('info', 'Logged Out', 'You have logged out. Opening login selection.');
    setIsLoginModalOpen(true);
  };

  const handleNavClick = (sectionId: NavSection) => {
    if (sectionId !== 'customer_view' && currentUser.type === 'customer') {
      setLoginModalTab('admin');
      setIsLoginModalOpen(true);
      addToast(
        'info',
        language === 'bn' ? 'অ্যাডমিন এক্সেস প্রয়োজন' : 'Admin Access Required',
        language === 'bn'
          ? 'এই সেকশনে প্রবেশের জন্য অ্যাডমিন লগইন ফর্ম পূরণ করুন।'
          : 'Please enter Admin credentials to manage this section.'
      );
      return;
    }
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  // Navigation Items
  const navItems = [
    {
      id: 'overview' as NavSection,
      labelEn: 'Campaign Overview',
      labelBn: 'ক্যাম্পেইন ওভারভিউ',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'verification' as NavSection,
      labelEn: 'Proof Verification',
      labelBn: 'স্ক্রিনশট প্রুফ ভেরিফিকেশন',
      icon: ShieldCheck,
      badge: stats.pendingCount > 0 ? stats.pendingCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'payouts' as NavSection,
      labelEn: 'UPI Payouts',
      labelBn: 'ইউপিআই পেআউট ও ক্যাশব্যাক',
      icon: CreditCard,
      badge: stats.approvedCount > 0 ? `₹${(stats.approvedCount * 1000).toLocaleString('en-IN')}` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'products' as NavSection,
      labelEn: 'Product Rewards',
      labelBn: 'প্রোডাক্ট রিওয়ার্ড ম্যানেজমেন্ট',
      icon: Gift,
      badge: products.length,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'customer_view' as NavSection,
      labelEn: 'Customer Portal',
      labelBn: 'কাস্টমার ভিউ / পোর্টাল',
      icon: ShoppingBag,
      badge: 'Live',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Login Modal (Customer & Admin) */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        initialTab={loginModalTab}
        onLoginSuccess={handleLoginSuccess}
        lang={language}
      />

      {/* Proof Lightbox */}
      <ProofLightbox
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={lightboxData.imageUrl}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
      />

      {/* Claim Detail Drawer */}
      <ClaimDetailDrawer
        claim={selectedClaimForDrawer}
        onClose={() => setSelectedClaimForDrawer(null)}
        onOpenLightbox={handleOpenLightbox}
        onApprove={handleApproveClaim}
        onOpenReject={(c) => setClaimToReject(c)}
        onOpenPayout={(c) => setClaimToPayout(c)}
      />

      {/* Payout Modal */}
      <PayoutModal
        isOpen={!!claimToPayout}
        onClose={() => setClaimToPayout(null)}
        claim={claimToPayout}
        onConfirmPayout={handleConfirmPayout}
        onShowToast={addToast}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={!!claimToReject}
        onClose={() => setClaimToReject(null)}
        claim={claimToReject}
        onConfirmReject={handleConfirmReject}
      />

      {/* Product Form Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        onSaveProduct={handleSaveProduct}
        onShowToast={addToast}
        lang={language}
      />

      {/* Customer Claim Modal */}
      <CustomerClaimModal
        isOpen={!!selectedProductForClaim}
        onClose={() => setSelectedProductForClaim(null)}
        product={selectedProductForClaim}
        customer={customerSession}
        onSubmitClaim={handleSubmitCustomerClaim}
        onShowToast={addToast}
      />

      {/* Vercel Deployment Guide Modal */}
      <VercelGuideModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
        lang={language}
      />

      {/* Theme Customization Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        lang={language}
      />

      {/* ========================================================================= */}
      {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer)                               */}
      {/* ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 md:static md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${themeConfig.gradientFrom} ${themeConfig.gradientTo} flex items-center justify-center text-white font-black text-lg shadow-lg ${themeConfig.shadowColor} tracking-tight`}>
                TBC
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  TBC WMS
                  <span className={`text-[10px] font-mono font-bold ${themeConfig.badgeBg} ${themeConfig.primaryText} border ${themeConfig.badgeBorder} px-1.5 py-0.2 rounded`}>
                    v2.0
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">Cashback &amp; Rewards</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Vercel Ready Pill */}
          <div className="mt-3.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Vercel Ready
            </span>
            <button
              onClick={() => setIsVercelModalOpen(true)}
              className={`text-[10px] font-semibold ${themeConfig.primaryText} hover:underline`}
            >
              Deploy Docs
            </button>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'bn' ? 'প্রধান মেন্যু' : 'Main Modules'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? `${themeConfig.primaryBg} text-white shadow-lg ${themeConfig.shadowColor}`
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Authentication Section */}
          <div className="pt-4 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'bn' ? 'লগইন ও একাউন্ট' : 'Account & Access'}
          </div>

          <button
            onClick={handleOpenCustomerLogin}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-violet-400" />
              <span>{language === 'bn' ? 'কাস্টমার লগইন' : 'Customer Login'}</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={handleOpenAdminLogin}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>{language === 'bn' ? 'অ্যাডমিন লগইন' : 'Admin Login'}</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Quick Actions Header */}
          <div className="pt-3 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {language === 'bn' ? 'টুলস ও সেটিংস' : 'Tools & Settings'}
          </div>

          {/* Change Theme Color Button */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-3.5 h-3.5 rounded-full ${themeConfig.primaryBg} ring-2 ring-white/20 shadow-sm`} />
              <span>{language === 'bn' ? 'কালার পরিবর্তন' : 'Change Theme Color'}</span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${themeConfig.badgeBg} ${themeConfig.primaryText} border ${themeConfig.badgeBorder}`}>
              {language === 'bn' ? themeConfig.nameBn.split(' ')[0] : themeConfig.nameEn.split(' ')[0]}
            </span>
          </button>

          {/* Clean Slate Button */}
          <button
            onClick={handleCleanAllData}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            title={language === 'bn' ? 'সমস্ত ডেমো ডেটা মুছে ফ্রেশ শুরু করুন' : 'Clean all dummy data and start fresh'}
          >
            <div className="flex items-center gap-2.5">
              <Eraser className="w-4 h-4 text-rose-400" />
              <span>{language === 'bn' ? 'সব মুছে ফ্রেশ শুরু' : 'Clean Slate (Start Fresh)'}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Clean
            </span>
          </button>

          <button
            onClick={() => setIsVercelModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Rocket className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'Vercel এ ডিপ্লয় করুন' : 'Deploy to Vercel'}</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={handleExportCsv}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
              <span>{language === 'bn' ? 'CSV লেজার ডাউনলোড' : 'Export Claims CSV'}</span>
            </div>
            <Download className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={handleResetDemoData}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'ডেমো রিসেট' : 'Reset Demo Data'}</span>
            </div>
          </button>
        </div>

        {/* Sidebar Footer / User & Language */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          {/* Language Switcher */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              Lang:
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  language === 'bn'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* User profile card in Menu Bar */}
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                currentUser.type === 'admin'
                  ? `${themeConfig.badgeBg} ${themeConfig.primaryText} border ${themeConfig.badgeBorder}`
                  : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
              }`}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <span className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                    {currentUser.type === 'admin' ? 'Executive Admin' : (language === 'bn' ? 'ভেরিফাইড কাস্টমার' : 'Verified Customer')}
                  </span>
                </div>
                {currentUser.type === 'customer' ? (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    📱 {customerSession.phone} • ✉️ {customerSession.email}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    ✉️ {currentUser.email || 'admin@tbcwms.com'}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Login / Switch buttons inside Menu Bar */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={handleOpenCustomerLogin}
                className="py-1.5 px-2 rounded-lg text-[10px] font-semibold bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border border-violet-500/30 text-center transition-all truncate"
              >
                {language === 'bn' ? 'কাস্টমার সুইচ' : 'Customer Switch'}
              </button>
              <button
                onClick={handleOpenAdminLogin}
                className="py-1.5 px-2 rounded-lg text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-center transition-all truncate"
              >
                {language === 'bn' ? 'অ্যাডমিন লগইন' : 'Admin Login'}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <button
                onClick={handleLogout}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
              </button>
              <button
                onClick={() => {
                  if (currentUser.type === 'admin') {
                    handleOpenCustomerLogin();
                  } else {
                    handleOpenAdminLogin();
                  }
                }}
                className={`font-medium transition-colors ${themeConfig.primaryText} hover:underline`}
              >
                {currentUser.type === 'admin' ? (language === 'bn' ? 'কাস্টমারে যান' : 'Switch Customer') : (language === 'bn' ? 'অ্যাডমিনে যান' : 'Switch Admin')}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-20 bg-slate-950/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT CONTENT                                                      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg border border-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black ${themeConfig.primaryText} font-mono tracking-wider`}>TBC WMS</span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {activeSection === 'overview' && (language === 'bn' ? 'ক্যাম্পেইন ওভারভিউ' : 'Campaign Overview')}
                  {activeSection === 'verification' && (language === 'bn' ? 'স্ক্রিনশট প্রুফ ভেরিফিকেশন' : 'Proof Verification Queue')}
                  {activeSection === 'payouts' && (language === 'bn' ? 'ইউপিআই পেআউট ও ক্যাশব্যাক' : 'UPI Payout Disbursement')}
                  {activeSection === 'products' && (language === 'bn' ? 'প্রোডাক্ট রিওয়ার্ড অফার' : 'Product Rewards Management')}
                  {activeSection === 'customer_view' && (language === 'bn' ? 'কাস্টমার পোর্টাল ভিউ' : 'Customer Rewards Portal')}
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {activeSection === 'overview' && 'Executive metrics, platform distribution, and verification pipeline.'}
                {activeSection === 'verification' && 'Inspect Order, Payment & Rating proofs with Special Code matching.'}
                {activeSection === 'payouts' && 'Disburse cashbacks via UPI ID and record banking transaction UTR references.'}
                {activeSection === 'products' && 'Create and configure merchant products, special verification codes & slots.'}
                {activeSection === 'customer_view' && 'Simulate the public customer interface for claiming and tracking refunds.'}
              </p>
            </div>
          </div>

          {/* Quick Header Actions (Only shown in Admin sections; Customer view stays completely clean) */}
          {activeSection !== 'customer_view' && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Theme Customizer Palette Button */}
              <button
                onClick={() => setIsThemeModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
                title={language === 'bn' ? 'সফটওয়্যারের রঙ পরিবর্তন করুন' : 'Change Software Theme Color'}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${themeConfig.primaryBg} ring-2 ring-white/30`} />
                <span className="hidden sm:inline">{language === 'bn' ? 'কালার থিম' : 'Theme'}</span>
                <Palette className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Customer Login Button */}
              <button
                onClick={handleOpenCustomerLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-500/30 hover:bg-violet-600/30 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কাস্টমার লগইন' : 'Customer Login'}</span>
              </button>

              {/* Admin Login Button */}
              <button
                onClick={handleOpenAdminLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750 hover:text-white transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'bn' ? 'অ্যাডমিন লগইন' : 'Admin Login'}</span>
              </button>

              {/* Current Active User Session Pill */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className={`w-2 h-2 rounded-full ${currentUser.type === 'admin' ? themeConfig.primaryText : 'bg-emerald-400'} animate-pulse`}></span>
                <span className="font-semibold text-slate-200">{currentUser.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({currentUser.type === 'admin' ? 'Admin' : 'Customer'})
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors"
                title="Logout / Switch Account"
              >
                <LogOut className="w-4 h-4" />
              </button>

              {currentUser.type === 'admin' && (
                <button
                  onClick={() => {
                    setProductToEdit(null);
                    setIsProductModalOpen(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs font-bold text-white ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} shadow-md ${themeConfig.shadowColor} transition-all`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'bn' ? 'নতুন প্রোডাক্ট যোগ' : 'Add Offer Product'}</span>
                </button>
              )}

              <button
                onClick={() => setActiveSection('customer_view')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all"
              >
                <Eye className={`w-3.5 h-3.5 ${themeConfig.primaryText}`} />
                <span>{language === 'bn' ? 'কাস্টমার পোর্টাল' : 'Customer Portal'}</span>
              </button>
            </div>
          )}
        </header>

        {/* Dynamic Section Contents */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* ========================================================================= */}
          {/* 1. CAMPAIGN OVERVIEW SECTION                                              */}
          {/* ========================================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Vercel Announcement Banner */}
              <div className={`p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 border ${themeConfig.borderClass} shadow-xl flex flex-wrap items-center justify-between gap-4`}>
                <div className="flex items-center gap-3.5">
                  <div className={`w-12 h-12 rounded-xl ${themeConfig.badgeBg} border ${themeConfig.badgeBorder} flex items-center justify-center ${themeConfig.primaryText}`}>
                    <Rocket className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                      {language === 'bn' ? 'TBC WMS সফটওয়্যারটি সম্পূর্ণ তৈরি ও Vercel এ ডিপ্লয় উপযোগী' : 'TBC WMS Enterprise Cashback Engine'}
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Vercel Ready
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {language === 'bn'
                        ? 'TBC WMS: অর্ডার, পেমেন্ট ও ৫-স্টার রেটিং স্ক্রিনশট যাচাই, স্পেশাল কোড অটোম্যাচ এবং ইউপিআই রিফান্ড প্রসেসিং সিস্টেম।'
                        : 'TBC WMS: Inspect full screenshot proofs, verify 100% cashback claims, and disburse bank UPI refunds.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsThemeModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    <Palette className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'bn' ? 'কালার পরিবর্তন' : 'Change Theme'}</span>
                  </button>
                  <button
                    onClick={() => setIsVercelModalOpen(true)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold text-white ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} shadow-md ${themeConfig.shadowColor} flex items-center gap-1.5 transition-all`}
                  >
                    <span>{language === 'bn' ? 'ডিপ্লয় গাইড' : 'Deploy Guide'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Claims */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Claims</span>
                    <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Layers className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-black font-mono text-white mt-2">{stats.totalClaims}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-indigo-400" />
                    Across Amazon, Flipkart, Blinkit
                  </p>
                </div>

                {/* Pending Verification */}
                <div
                  onClick={() => {
                    setStatusFilter('Pending');
                    setActiveSection('verification');
                  }}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden cursor-pointer hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Pending Proof Review</span>
                    <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-black font-mono text-amber-400 mt-2">{stats.pendingCount}</p>
                  <p className="text-[11px] text-amber-300/80 mt-1 font-semibold flex items-center gap-1">
                    Click to review pending queue &rarr;
                  </p>
                </div>

                {/* Approved & Queued */}
                <div
                  onClick={() => {
                    setStatusFilter('Approved');
                    setActiveSection('payouts');
                  }}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden cursor-pointer hover:border-cyan-500/50 transition-all"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Approved for Payout</span>
                    <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-black font-mono text-cyan-400 mt-2">{stats.approvedCount}</p>
                  <p className="text-[11px] text-cyan-300/80 mt-1 font-semibold flex items-center gap-1">
                    Ready for UPI disbursement &rarr;
                  </p>
                </div>

                {/* Cashback Disbursed */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Cashback Paid</span>
                    <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <IndianRupee className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-black font-mono text-emerald-400 mt-2">
                    ₹{stats.totalCashbackPaid.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {stats.paidCount} claims credited with UTR
                  </p>
                </div>
              </div>

              {/* Mid-Row: Platform Distribution & Recent Pending Pipeline */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Platform Distribution Card */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Merchant Platform Breakdown</h4>
                      <p className="text-[11px] text-slate-400">Claim volume by online shopping marketplace</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {Object.entries(platformStats).map(([plat, data]) => {
                      const percentage =
                        claims.length > 0 ? Math.round((data.count / claims.length) * 100) : 0;
                      const colors: Record<string, string> = {
                        Amazon: 'bg-amber-500',
                        Flipkart: 'bg-blue-500',
                        Blinkit: 'bg-emerald-500',
                        Other: 'bg-indigo-500'
                      };
                      return (
                        <div key={plat} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{plat}</span>
                            <span className="font-mono text-slate-400">
                              {data.count} claims ({percentage}%) • ₹{data.totalAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors[plat] || 'bg-indigo-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Urgent Review Queue (Latest Pending Claims) */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>📋 Pending Verification Queue</span>
                        {stats.pendingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {stats.pendingCount} Action Required
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">Recent customer screenshot uploads awaiting review</p>
                    </div>
                    <button
                      onClick={() => setActiveSection('verification')}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {claims
                      .filter((c) => c.status === 'Pending')
                      .slice(0, 3)
                      .map((c) => (
                        <div
                          key={c.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex -space-x-2">
                              <img
                                src={c.orderScreenshot}
                                alt="SS 1"
                                onClick={() => handleOpenLightbox(c.orderScreenshot, 'Order Proof', c.customerName)}
                                className="w-9 h-9 rounded-lg object-cover border border-slate-700 cursor-pointer hover:scale-105 transition-transform"
                              />
                              <img
                                src={c.paymentScreenshot}
                                alt="SS 2"
                                onClick={() => handleOpenLightbox(c.paymentScreenshot, 'Payment Proof', c.customerName)}
                                className="w-9 h-9 rounded-lg object-cover border border-slate-700 cursor-pointer hover:scale-105 transition-transform"
                              />
                              <img
                                src={c.ratingScreenshot}
                                alt="SS 3"
                                onClick={() => handleOpenLightbox(c.ratingScreenshot, 'Rating Proof', c.customerName)}
                                className="w-9 h-9 rounded-lg object-cover border border-slate-700 cursor-pointer hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate max-w-xs">{c.productTitle}</p>
                              <p className="text-[11px] text-slate-400">
                                {c.customerName} • <span className="font-mono text-emerald-400 font-bold">₹{c.cashbackAmount}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                c.isCodeMatched
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {c.isCodeMatched ? '✓ Code Match' : '✕ Code Mismatch'}
                            </span>
                            <button
                              onClick={() => setSelectedClaimForDrawer(c)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
                            >
                              Inspect Proofs
                            </button>
                            <button
                              onClick={() => handleApproveClaim(c.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      ))}

                    {claims.filter((c) => c.status === 'Pending').length === 0 && (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                        All submitted claims have been processed! No pending reviews.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. PROOF VERIFICATION SECTION                                             */}
          {/* ========================================================================= */}
          {activeSection === 'verification' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Filter & Search Bar */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[240px] relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Claim ID, Customer Name, Mobile, UPI or Special Code..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Filter Tabs */}
                  {['ALL', 'Pending', 'Approved', 'Paid', 'Rejected', 'CODE_MISMATCH'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        statusFilter === st
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {st === 'ALL' && 'All Claims'}
                      {st === 'Pending' && `Pending (${stats.pendingCount})`}
                      {st === 'Approved' && `Approved (${stats.approvedCount})`}
                      {st === 'Paid' && `Paid (${stats.paidCount})`}
                      {st === 'Rejected' && `Rejected (${stats.rejectedCount})`}
                      {st === 'CODE_MISMATCH' && 'Code Mismatch ⚠️'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Claims Ledger Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">Claim ID &amp; Customer</th>
                        <th className="p-4">Product Offer</th>
                        <th className="p-4">Special Code Match</th>
                        <th className="p-4">3 Screenshot Proofs</th>
                        <th className="p-4">Cashback &amp; UPI</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filteredClaims.map((claim) => (
                        <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Customer */}
                          <td className="p-4">
                            <span className="font-mono text-[11px] font-bold text-indigo-400 block">
                              {claim.id}
                            </span>
                            <p className="font-bold text-white mt-0.5">{claim.customerName}</p>
                            <p className="font-mono text-slate-400 text-[11px]">📱 {claim.customerPhone}</p>
                          </td>

                          {/* Product */}
                          <td className="p-4 max-w-[200px]">
                            <p className="font-semibold text-slate-200 truncate">{claim.productTitle}</p>
                            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {claim.platform}
                            </span>
                          </td>

                          {/* Code Verification Match */}
                          <td className="p-4">
                            <span
                              className={`font-mono font-bold text-xs block ${
                                claim.isCodeMatched ? 'text-indigo-400' : 'text-rose-400'
                              }`}
                            >
                              {claim.submittedCode}
                            </span>
                            {claim.isCodeMatched ? (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Exact Code Match
                              </span>
                            ) : (
                              <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                                <AlertCircle className="w-3 h-3" /> Code Mismatch ({claim.systemCode})
                              </span>
                            )}
                          </td>

                          {/* 3 Uploaded Screenshots */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {/* Order SS */}
                              <div
                                onClick={() =>
                                  handleOpenLightbox(claim.orderScreenshot, 'Order Proof', claim.customerName)
                                }
                                className="group relative cursor-pointer"
                                title="Inspect Order Screenshot"
                              >
                                <img
                                  src={claim.orderScreenshot}
                                  alt="Order"
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-700 group-hover:border-indigo-400 transition-colors"
                                />
                                <span className="absolute -bottom-1 -right-1 bg-slate-900 text-[9px] px-1 rounded font-bold text-slate-400 border border-slate-700">
                                  1
                                </span>
                              </div>

                              {/* Payment SS */}
                              <div
                                onClick={() =>
                                  handleOpenLightbox(claim.paymentScreenshot, 'Payment Proof', claim.customerName)
                                }
                                className="group relative cursor-pointer"
                                title="Inspect Payment Receipt"
                              >
                                <img
                                  src={claim.paymentScreenshot}
                                  alt="Payment"
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-700 group-hover:border-indigo-400 transition-colors"
                                />
                                <span className="absolute -bottom-1 -right-1 bg-slate-900 text-[9px] px-1 rounded font-bold text-slate-400 border border-slate-700">
                                  2
                                </span>
                              </div>

                              {/* Rating SS */}
                              <div
                                onClick={() =>
                                  handleOpenLightbox(claim.ratingScreenshot, 'Rating Proof', claim.customerName)
                                }
                                className="group relative cursor-pointer"
                                title="Inspect Rating Review"
                              >
                                <img
                                  src={claim.ratingScreenshot}
                                  alt="Rating"
                                  className="w-10 h-10 object-cover rounded-lg border border-slate-700 group-hover:border-indigo-400 transition-colors"
                                />
                                <span className="absolute -bottom-1 -right-1 bg-slate-900 text-[9px] px-1 rounded font-bold text-slate-400 border border-slate-700">
                                  3
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 block">Click to enlarge</span>
                          </td>

                          {/* Refund Amount & UPI */}
                          <td className="p-4">
                            <p className="font-mono font-bold text-emerald-400 text-sm">
                              ₹{claim.cashbackAmount.toLocaleString('en-IN')}
                            </p>
                            <p className="font-mono text-slate-400 text-[11px] truncate max-w-[130px]">
                              {claim.refundUpi}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${
                                claim.status === 'Paid'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : claim.status === 'Approved'
                                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                  : claim.status === 'Rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              ● {claim.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedClaimForDrawer(claim)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                              >
                                Inspect
                              </button>

                              {claim.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveClaim(claim.id)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => setClaimToReject(claim)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {claim.status === 'Approved' && (
                                <button
                                  onClick={() => setClaimToPayout(claim)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all flex items-center gap-1"
                                >
                                  <span>₹ Pay</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredClaims.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-10 text-center text-slate-400">
                            No claims matching filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. UPI PAYOUTS SECTION                                                    */}
          {/* ========================================================================= */}
          {activeSection === 'payouts' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Payout Metric Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Awaiting Payout Disbursement
                  </span>
                  <p className="text-3xl font-black font-mono text-cyan-400 mt-2">
                    ₹{claims
                      .filter((c) => c.status === 'Approved')
                      .reduce((acc, c) => acc + c.cashbackAmount, 0)
                      .toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {claims.filter((c) => c.status === 'Approved').length} verified claims ready to credit
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Disbursed Cashback
                  </span>
                  <p className="text-3xl font-black font-mono text-emerald-400 mt-2">
                    ₹{stats.totalCashbackPaid.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {stats.paidCount} claims completed with banking UTR
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Bank Settlement File
                    </span>
                    <p className="text-xs text-slate-300 mt-1">
                      Download complete payout list formatted for net-banking batch upload.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCsv}
                    className="mt-3 w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    Download Payout Batch CSV
                  </button>
                </div>
              </div>

              {/* Payout Disbursement Table */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      UPI Disbursement &amp; Payout Audit Ledger
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Process instant UPI refunds, view customer handles and link UTR numbers
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setStatusFilter('Approved')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        statusFilter === 'Approved'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Ready to Pay ({stats.approvedCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('Paid')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        statusFilter === 'Paid'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      Completed ({stats.paidCount})
                    </button>
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        statusFilter === 'ALL'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      All
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">Customer Details</th>
                        <th className="p-4">Refund UPI Handle</th>
                        <th className="p-4">Cashback Amount</th>
                        <th className="p-4">Campaign Product</th>
                        <th className="p-4">UTR Reference / Status</th>
                        <th className="p-4 text-right">Disburse Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filteredClaims
                        .filter((c) =>
                          statusFilter === 'ALL' ? true : c.status === statusFilter
                        )
                        .map((claim) => (
                          <tr key={claim.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4">
                              <p className="font-bold text-white">{claim.customerName}</p>
                              <p className="font-mono text-slate-400 text-[11px]">📱 {claim.customerPhone}</p>
                              <span className="font-mono text-[10px] text-indigo-400">{claim.id}</span>
                            </td>

                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                                  {claim.refundUpi}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(claim.refundUpi);
                                    addToast('info', 'UPI Copied', `Copied ${claim.refundUpi}`);
                                  }}
                                  className="p-1 text-slate-400 hover:text-white"
                                  title="Copy UPI ID"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                            <td className="p-4">
                              <span className="font-mono font-bold text-emerald-400 text-sm">
                                ₹{claim.cashbackAmount.toLocaleString('en-IN')}
                              </span>
                            </td>

                            <td className="p-4 max-w-[200px]">
                              <p className="font-semibold text-slate-200 truncate">{claim.productTitle}</p>
                              <span className="text-[10px] text-slate-400">{claim.platform}</span>
                            </td>

                            <td className="p-4">
                              {claim.status === 'Paid' ? (
                                <div>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    PAID
                                  </span>
                                  <p className="font-mono text-slate-300 text-[11px] mt-1 font-semibold">
                                    UTR: {claim.payoutRefNo}
                                  </p>
                                </div>
                              ) : claim.status === 'Approved' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                  QUEUED FOR PAYOUT
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">{claim.status}</span>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              {claim.status === 'Approved' ? (
                                <button
                                  onClick={() => setClaimToPayout(claim)}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all inline-flex items-center gap-1.5"
                                >
                                  <IndianRupee className="w-3.5 h-3.5" />
                                  <span>Pay Now</span>
                                </button>
                              ) : claim.status === 'Paid' ? (
                                <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                                </span>
                              ) : (
                                <button
                                  onClick={() => setSelectedClaimForDrawer(claim)}
                                  className="text-xs text-indigo-400 hover:underline"
                                >
                                  Review First
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. PRODUCT REWARDS MANAGEMENT                                             */}
          {/* ========================================================================= */}
          {activeSection === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {language === 'bn' ? 'সক্রিয় প্রোডাক্ট ক্যাশব্যাক অফার' : 'Active Cashback Offer Products'}
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${themeConfig.badgeBg} ${themeConfig.primaryText} border ${themeConfig.badgeBorder}`}>
                      {products.length} {language === 'bn' ? 'টি পণ্য' : 'Offers'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'bn'
                      ? 'কাস্টমারদের জন্য প্রোডাক্ট অফার তৈরি করুন, কোড ও স্লট নিয়ন্ত্রণ করুন'
                      : 'Configure customer product campaigns, mandatory verification codes & slots'}
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  {products.length > 0 && (
                    <button
                      onClick={handleCleanAllData}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-slate-800/80 hover:bg-rose-600/30 border border-slate-700 hover:border-rose-500/40 transition-all flex items-center gap-1.5"
                      title={language === 'bn' ? 'সমস্ত প্রোডাক্ট ও ক্লেইম মুছে ক্লিন করুন' : 'Clean all products to start fresh'}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'সব মুছে ফ্রেশ করুন' : 'Clean All Data'}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setProductToEdit(null);
                      setIsProductModalOpen(true);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold text-white ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} shadow-lg ${themeConfig.shadowColor} flex items-center gap-1.5 transition-all`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'bn' ? 'নতুন প্রোডাক্ট যোগ করুন' : 'Create Campaign Product'}</span>
                  </button>
                </div>
              </div>

              {/* Clean Empty State when user wiped dummy data or has 0 products */}
              {products.length === 0 && (
                <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  <div className={`w-16 h-16 mx-auto rounded-2xl ${themeConfig.badgeBg} border ${themeConfig.badgeBorder} flex items-center justify-center text-3xl shadow-inner`}>
                    🎁
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-base font-bold text-white">
                      {language === 'bn' ? 'সফটওয়্যারটি সম্পূর্ণ ফ্রেশ ও ক্লিন!' : 'Software Cleaned — Zero Dummy Products'}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {language === 'bn'
                        ? 'বর্তমানে কোনো প্রোডাক্ট নেই। আপনার নিজের পছন্দমতো প্রোডাক্ট যোগ করতে নিচের বাটনে ক্লিক করুন।'
                        : 'Your software is pristine and ready! Add your own custom e-commerce products with custom prices, cashbacks, and secret codes.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setProductToEdit(null);
                        setIsProductModalOpen(true);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} shadow-lg ${themeConfig.shadowColor} flex items-center gap-2 transition-all`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{language === 'bn' ? 'নিজের প্রোডাক্ট যোগ করুন' : 'Create My First Product'}</span>
                    </button>
                    <button
                      onClick={handleResetDemoData}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                    >
                      {language === 'bn' ? 'নমুনা ডেমো ডেটা আনুন' : 'Load Demo Sample Data'}
                    </button>
                  </div>
                </div>
              )}

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => {
                  const slotsPercent = Math.min(
                    100,
                    Math.round((prod.claimedSlots / prod.totalSlots) * 100)
                  );
                  return (
                    <div
                      key={prod.id}
                      className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md hover:border-slate-700 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image banner */}
                        <div className="relative h-48 bg-slate-950 overflow-hidden">
                          <img
                            src={prod.imageUrl}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as any).src =
                                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';
                            }}
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white border border-slate-700/80 shadow-sm">
                              {prod.platform}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                prod.status === 'active'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {prod.status.toUpperCase()}
                            </span>
                          </div>
                          <div className={`absolute bottom-3 right-3 ${themeConfig.primaryBg}/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow`}>
                            {prod.cashbackType}
                          </div>
                        </div>

                        {/* Body */}
                        <div className="p-5 space-y-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {prod.brand}
                            </span>
                            <h4 className="text-sm font-bold text-white line-clamp-2 mt-0.5 leading-snug">
                              {prod.title}
                            </h4>
                          </div>

                          {/* Pricing & Cashback */}
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 block">{language === 'bn' ? 'মূল মূল্য' : 'Original Price'}</span>
                              <span className="text-xs text-slate-400 line-through font-mono">
                                ₹{prod.originalPrice.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-emerald-400 font-semibold block">
                                {language === 'bn' ? 'ক্যাশব্যাক ফেরত' : 'Cashback Payout'}
                              </span>
                              <span className="text-base font-bold font-mono text-emerald-400">
                                ₹{prod.cashbackAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Mandatory Special Code Display */}
                          <div className={`p-2.5 rounded-xl ${themeConfig.badgeBg} border ${themeConfig.badgeBorder} flex items-center justify-between`}>
                            <div>
                              <span className={`text-[10px] ${themeConfig.primaryText} block font-semibold`}>
                                {language === 'bn' ? 'ভেরিফিকেশন স্পেশাল কোড' : 'Special Verification Code'}
                              </span>
                              <span className={`font-mono font-bold text-sm ${themeConfig.primaryText} tracking-wider`}>
                                {prod.specialCode}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(prod.specialCode);
                                addToast('info', 'Code Copied', `Copied ${prod.specialCode}`);
                              }}
                              className={`p-1.5 ${themeConfig.primaryText} hover:text-white rounded-lg bg-black/20 hover:bg-black/40 transition-colors`}
                              title="Copy code"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Slots Progress */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400">{language === 'bn' ? 'ক্লেইমকৃত স্লট' : 'Claimed Slots'}</span>
                              <span className="font-mono text-slate-200 font-semibold">
                                {prod.claimedSlots} / {prod.totalSlots} ({slotsPercent}%)
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full bg-slate-950 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${themeConfig.primaryBg}`}
                                style={{ width: `${slotsPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-5 pt-0 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setProductToEdit(prod);
                            setIsProductModalOpen(true);
                          }}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                          {language === 'bn' ? 'এডিট' : 'Edit'}
                        </button>
                        <button
                          onClick={() => {
                            const clone: WmsProduct = {
                              ...prod,
                              id: `PROD-${Date.now().toString().slice(-6)}`,
                              title: `${prod.title} (Copy)`,
                              specialCode: `${prod.platform.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
                              claimedSlots: 0,
                              createdAt: new Date().toISOString().slice(0, 10)
                            };
                            storage.addProduct(clone);
                            setProducts(storage.getProducts());
                            addToast('success', 'Product Cloned', `Created copy "${clone.title}"`);
                          }}
                          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
                          title={language === 'bn' ? 'প্রোডাক্ট ডুপ্লিকেট করুন' : 'Clone / Duplicate Product'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleProductStatus(prod.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            prod.status === 'active'
                              ? 'text-amber-300 hover:bg-amber-500/10'
                              : 'text-emerald-300 hover:bg-emerald-500/10'
                          }`}
                        >
                          {prod.status === 'active' ? (language === 'bn' ? 'স্থগিত' : 'Pause') : (language === 'bn' ? 'সক্রিয়' : 'Activate')}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(language === 'bn' ? `আপনি কি "${prod.title}" প্রোডাক্টটি মুছে ফেলতে চান?` : `Are you sure you want to delete "${prod.title}"?`)) {
                              handleDeleteProduct(prod.id);
                            }
                          }}
                          className="p-2 text-rose-400 hover:text-white rounded-xl bg-slate-800 hover:bg-rose-600/30 transition-colors"
                          title={language === 'bn' ? 'প্রোডাক্ট ডিলিট করুন' : 'Delete Product'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={prod.purchaseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
                          title="Open product store link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. CUSTOMER PORTAL VIEW                                                   */}
          {/* ========================================================================= */}
          {activeSection === 'customer_view' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Product Catalog Controls: Platform Filters & Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                {/* Platform Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {['ALL', 'Amazon', 'Flipkart', 'Blinkit', 'Meesho', 'Myntra'].map((plat) => (
                    <button
                      key={plat}
                      onClick={() => {
                        setCustomerPlatform(plat);
                        setCustomerTab('products');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                        customerPlatform === plat && customerTab === 'products'
                          ? `${themeConfig.primaryBg} text-white border-transparent shadow-sm ${themeConfig.shadowColor}`
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {plat === 'ALL' ? (language === 'bn' ? 'সকল অফার' : 'All Deals') : plat}
                    </button>
                  ))}
                </div>

                {/* Search Input & Claims tracking toggle */}
                <div className="flex items-center gap-2">
                  <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setCustomerTab('products');
                      }}
                      placeholder={language === 'bn' ? 'পণ্য খুঁজুন...' : 'Search products...'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {customerClaims.length > 0 && (
                    <button
                      onClick={() => setCustomerTab(customerTab === 'products' ? 'my_claims' : 'products')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        customerTab === 'my_claims'
                          ? `${themeConfig.primaryBg} text-white shadow-sm`
                          : 'bg-slate-950 text-emerald-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{customerTab === 'my_claims' ? (language === 'bn' ? 'পণ্য দেখুন' : 'View Deals') : (language === 'bn' ? `আমার ক্লেইম (${customerClaims.length})` : `My Claims (${customerClaims.length})`)}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* If user toggled to My Claims tab */}
              {customerTab === 'my_claims' && customerClaims.length > 0 ? (
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      {language === 'bn' ? 'আমার সাবমিটকৃত রিফান্ড ক্লেইম' : 'My Submitted Claims & Refund Status'}
                    </h4>
                    <button
                      onClick={() => setCustomerTab('products')}
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      {language === 'bn' ? '← অফার পণ্যসমূহে ফিরে যান' : '← Back to Products'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {customerClaims.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-400">{c.id}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                c.status === 'Paid'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : c.status === 'Approved'
                                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                  : c.status === 'Rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              ● {c.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white mt-1">{c.productTitle}</p>
                          <p className="text-xs text-slate-400 mt-0.5 font-mono">
                            Refund UPI: <span className="text-emerald-400 font-semibold">{c.refundUpi}</span>
                          </p>
                          {c.payoutRefNo && (
                            <p className="text-xs text-emerald-300 font-mono mt-0.5 font-bold">
                              Banking UTR: {c.payoutRefNo}
                            </p>
                          )}
                          {c.rejectionReason && (
                            <p className="text-xs text-rose-300 mt-1">Reason: {c.rejectionReason}</p>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Cashback</span>
                          <span className="text-lg font-mono font-bold text-emerald-400">
                            ₹{c.cashbackAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Default Front View: ONLY Products! */
                <div className="space-y-4">
                  {filteredCustomerProducts.length === 0 && (
                    <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
                      <div className="text-3xl">🛍️</div>
                      <h4 className="text-base font-bold text-white">
                        {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি' : 'No Products Available'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        {products.length === 0
                          ? (language === 'bn' ? 'অ্যাডমিন নতুন ক্যাম্পেইন প্রোডাক্ট যোগ করলে এখানে প্রদর্শিত হবে।' : 'Please check back shortly or log in as Admin to add products.')
                          : (language === 'bn' ? 'অনুসন্ধানের সাথে কোনো পণ্য মেলেনি।' : 'No products matched your search or platform filter.')}
                      </p>
                      {products.length === 0 && (
                        <button
                          onClick={handleOpenAdminLogin}
                          className={`mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} shadow-md ${themeConfig.shadowColor} inline-flex items-center gap-1.5`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'অ্যাডমিন লগইন' : 'Admin Login'}</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCustomerProducts.map((prod) => {
                      const isAlreadyClaimed = claims.some(
                        (c) => c.customerPhone === customerSession.phone && c.productId === prod.id
                      );
                      const existingClaim = claims.find(
                        (c) => c.customerPhone === customerSession.phone && c.productId === prod.id
                      );

                      return (
                        <div
                          key={prod.id}
                          className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-md flex flex-col justify-between group hover:border-slate-700 transition-all"
                        >
                          <div>
                            <div className="relative h-48 bg-slate-950 overflow-hidden">
                              <img
                                src={prod.imageUrl}
                                alt={prod.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <span className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white border border-slate-700">
                                {prod.platform}
                              </span>
                            </div>

                            <div className="p-5 space-y-2.5">
                              <h5 className="font-bold text-white text-sm leading-snug">{prod.title}</h5>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 line-through">
                                  ₹{prod.originalPrice.toLocaleString('en-IN')}
                                </span>
                                <span className="text-emerald-400 font-mono font-bold text-sm">
                                  ₹{prod.cashbackAmount.toLocaleString('en-IN')} Free
                                </span>
                              </div>

                              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px]">
                                <span className="text-slate-400 block">{language === 'bn' ? 'প্রয়োজনীয় স্পেশাল কোড:' : 'Required Special Code:'}</span>
                                <span className={`font-mono font-bold ${themeConfig.primaryText} text-xs`}>
                                  {prod.specialCode}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="p-5 pt-0 space-y-2">
                            <a
                              href={prod.purchaseUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow"
                            >
                              <span>🛒 Buy on {prod.platform}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {isAlreadyClaimed ? (
                              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs">
                                <span className="text-slate-400">Claim status: </span>
                                <span
                                  className={`font-bold ${
                                    existingClaim?.status === 'Paid'
                                      ? 'text-emerald-400'
                                      : existingClaim?.status === 'Approved'
                                      ? 'text-cyan-400'
                                      : existingClaim?.status === 'Rejected'
                                      ? 'text-rose-400'
                                      : 'text-amber-400'
                                  }`}
                                >
                                  {existingClaim?.status}
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedProductForClaim(prod)}
                                className={`w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${themeConfig.primaryClass} ${themeConfig.primaryHoverBg} ${themeConfig.shadowColor}`}
                              >
                                <span>📋 {language === 'bn' ? '৩টি প্রুফ দিয়ে রিফান্ড ক্লেইম করুন' : 'Submit 3 Proofs for Refund'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
