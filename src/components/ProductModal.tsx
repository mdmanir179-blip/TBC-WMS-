import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  ShoppingBag,
  Check,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { WmsProduct, Platform } from '../types/wms';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: WmsProduct | null;
  onSaveProduct: (product: WmsProduct) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
  lang?: 'en' | 'bn';
}

const PLATFORMS: Platform[] = ['Amazon', 'Flipkart', 'Blinkit', 'Meesho', 'Myntra', 'Other'];

const PRODUCT_PRESETS = [
  {
    labelEn: 'Wireless Headphones',
    labelBn: 'হেডফোন',
    title: 'boAt Rockerz 450 Bluetooth Wireless Headphone',
    brand: 'boAt',
    platform: 'Amazon' as Platform,
    price: 1499,
    cashback: 1499,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80',
    type: '100% Free' as const,
    slots: 50
  },
  {
    labelEn: 'Smart Fitness Watch',
    labelBn: 'স্মার্টওয়াচ',
    title: 'Noise ColorFit Pulse AMOLED Smartwatch v2',
    brand: 'Noise',
    platform: 'Flipkart' as Platform,
    price: 2499,
    cashback: 2499,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80',
    type: '100% Free' as const,
    slots: 40
  },
  {
    labelEn: 'Coffee Tumbler',
    labelBn: 'কফি মগ',
    title: 'Insulated Stainless Steel Coffee Travel Tumbler 500ml',
    brand: 'ThermosPro',
    platform: 'Blinkit' as Platform,
    price: 899,
    cashback: 899,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=700&q=80',
    type: '100% Free' as const,
    slots: 60
  },
  {
    labelEn: 'Running Shoes',
    labelBn: 'রানিং শু',
    title: 'SprintAir Breathable Cushion Athletic Running Shoes',
    brand: 'SprintAir',
    platform: 'Meesho' as Platform,
    price: 1899,
    cashback: 1899,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80',
    type: '100% Free' as const,
    slots: 35
  },
  {
    labelEn: '65W GaN Fast Charger',
    labelBn: 'ফাস্ট চার্জার',
    title: 'UltraFast 65W GaN Dual Type-C Quick Adapter',
    brand: 'PowerCore',
    platform: 'Amazon' as Platform,
    price: 1299,
    cashback: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=80',
    type: '100% Free' as const,
    slots: 50
  },
  {
    labelEn: 'Laptop Backpack',
    labelBn: 'ল্যাপটপ ব্যাগ',
    title: 'Anti-Theft Waterproof Office & Travel Laptop Backpack 30L',
    brand: 'UrbanGear',
    platform: 'Flipkart' as Platform,
    price: 1599,
    cashback: 1599,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80',
    type: '100% Free' as const,
    slots: 45
  }
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaveProduct,
  onShowToast,
  lang = 'en'
}) => {
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [platform, setPlatform] = useState<Platform>('Amazon');
  const [imageUrl, setImageUrl] = useState('');
  const [originalPrice, setOriginalPrice] = useState(1499);
  const [cashbackAmount, setCashbackAmount] = useState(1499);
  const [cashbackType, setCashbackType] = useState<'100% Free' | 'Flat Cashback' | 'Review Bonus'>('100% Free');
  const [specialCode, setSpecialCode] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [totalSlots, setTotalSlots] = useState(50);
  const [instructions, setInstructions] = useState<string[]>([
    'Order item via the direct store link',
    'Keep invoice receipt and payment screenshot',
    'Post 5-star review after delivery',
    'Upload screenshots for 100% UPI cashback'
  ]);

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setBrand(productToEdit.brand);
      setPlatform(productToEdit.platform);
      setImageUrl(productToEdit.imageUrl);
      setOriginalPrice(productToEdit.originalPrice);
      setCashbackAmount(productToEdit.cashbackAmount);
      setCashbackType(productToEdit.cashbackType);
      setSpecialCode(productToEdit.specialCode);
      setPurchaseUrl(productToEdit.purchaseUrl);
      setTotalSlots(productToEdit.totalSlots);
      setInstructions(productToEdit.instructions || []);
    } else {
      resetForm();
    }
  }, [productToEdit, isOpen]);

  const resetForm = () => {
    setTitle('');
    setBrand('');
    setPlatform('Amazon');
    setImageUrl('');
    setOriginalPrice(1499);
    setCashbackAmount(1499);
    setCashbackType('100% Free');
    setSpecialCode(`AMZ-${Math.floor(1000 + Math.random() * 9000)}`);
    setPurchaseUrl('');
    setTotalSlots(50);
    setInstructions([
      'Order item via the direct store link',
      'Keep invoice receipt and payment screenshot',
      'Post 5-star review after delivery',
      'Upload screenshots for 100% UPI cashback'
    ]);
  };

  const applyPreset = (preset: typeof PRODUCT_PRESETS[0]) => {
    setTitle(preset.title);
    setBrand(preset.brand);
    setPlatform(preset.platform);
    setImageUrl(preset.imageUrl);
    setOriginalPrice(preset.price);
    setCashbackAmount(preset.cashback);
    setCashbackType(preset.type);
    setTotalSlots(preset.slots);

    const prefix = preset.platform === 'Amazon' ? 'AMZ' : preset.platform === 'Flipkart' ? 'FLP' : preset.platform === 'Blinkit' ? 'BLK' : 'TBC';
    const randCode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    setSpecialCode(randCode);

    onShowToast(
      'info',
      lang === 'bn' ? 'প্রিসেট যোগ করা হয়েছে' : 'Preset Loaded',
      lang === 'bn' ? `"${preset.title}" লোড হয়েছে। নিজের মতো এডিট করতে পারেন।` : `Loaded "${preset.title}". You can modify any field.`
    );
  };

  const generateRandomCode = () => {
    const prefix = platform === 'Amazon' ? 'AMZ' : platform === 'Flipkart' ? 'FLP' : platform === 'Blinkit' ? 'BLK' : platform === 'Meesho' ? 'MSH' : 'TBC';
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    const code = `${prefix}-${randDigits}`;
    setSpecialCode(code);
    onShowToast('info', 'Code Generated', `Generated unique code: ${code}`);
  };

  const handleSetFullRefund = () => {
    setCashbackAmount(originalPrice);
    setCashbackType('100% Free');
    onShowToast(
      'info',
      '100% Cashback',
      `Cashback set to ₹${originalPrice.toLocaleString('en-IN')} (Full Free Refund)`
    );
  };

  const handleSetHalfCashback = () => {
    const half = Math.round(originalPrice * 0.5);
    setCashbackAmount(half);
    setCashbackType('Flat Cashback');
    onShowToast(
      'info',
      '50% Cashback',
      `Cashback set to ₹${half.toLocaleString('en-IN')}`
    );
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onShowToast('error', 'File Too Large', 'Please upload an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImageUrl(base64);
        onShowToast('success', 'Photo Attached', 'Product photo uploaded successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !specialCode.trim()) {
      onShowToast(
        'error',
        'Missing Information',
        lang === 'bn' ? 'প্রোডাক্টের নাম এবং স্পেশাল কোড আবশ্যক।' : 'Title and Special Code are required.'
      );
      return;
    }

    const fallbackImg =
      imageUrl.trim() ||
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

    const saved: WmsProduct = {
      id: productToEdit ? productToEdit.id : `PROD-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      brand: brand.trim() || 'Official Brand',
      platform,
      imageUrl: fallbackImg,
      originalPrice: Number(originalPrice),
      cashbackAmount: Number(cashbackAmount),
      cashbackType,
      specialCode: specialCode.trim().toUpperCase(),
      purchaseUrl: purchaseUrl.trim() || 'https://amazon.in',
      totalSlots: Number(totalSlots),
      claimedSlots: productToEdit ? productToEdit.claimedSlots : 0,
      status: productToEdit ? productToEdit.status : 'active',
      instructions: instructions.filter((i) => i.trim().length > 0),
      createdAt: productToEdit ? productToEdit.createdAt : new Date().toISOString().slice(0, 10)
    };

    onSaveProduct(saved);
    onShowToast(
      'success',
      productToEdit ? (lang === 'bn' ? 'প্রোডাক্ট আপডেট হয়েছে' : 'Product Updated') : (lang === 'bn' ? 'নতুন প্রোডাক্ট তৈরি হয়েছে' : 'Product Created'),
      `"${saved.title}" — Code: ${saved.specialCode}`
    );
    onClose();
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleUpdateInstruction = (index: number, val: string) => {
    const updated = [...instructions];
    updated[index] = val;
    setInstructions(updated);
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, idx) => idx !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {productToEdit
                  ? (lang === 'bn' ? 'প্রোডাক্ট ক্যাশব্যাক অফার এডিট' : 'Edit Cashback Offer Campaign')
                  : (lang === 'bn' ? 'নতুন কাস্টম প্রোডাক্ট যোগ করুন' : 'Create Custom Cashback Offer Product')}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'bn'
                  ? 'আপনার পণ্যের তথ্য, প্ল্যাটফর্ম, ক্যাশব্যাক ও ভেরিফিকেশন কোড সেট করুন'
                  : 'Configure product details, mandatory verification code, and payout rewards'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Quick Presets for fast product adding */}
        {!productToEdit && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-800/80 bg-slate-950/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'bn' ? 'দ্রুত প্রিসেট (১-ক্লিকে লোড করুন)' : '1-Click Quick Product Presets'}
              </span>
              <span className="text-[10px] text-slate-400">
                {lang === 'bn' ? 'ক্লিক করে সরাসরি ফিল্ড পূরণ করুন' : 'Click any preset to autofill'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pb-2">
              {PRODUCT_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <span>{lang === 'bn' ? preset.labelBn : preset.labelEn}</span>
                  <span className="text-[10px] font-mono text-emerald-400">₹{preset.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {lang === 'bn' ? 'প্রোডাক্টের নাম (Product Title) *' : 'Product Title *'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={lang === 'bn' ? 'উদাঃ boAt Rockerz 450 Bluetooth Headphone' : 'e.g. Wireless ANC Pro Studio Headphones'}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Brand */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {lang === 'bn' ? 'ব্র্যান্ড / সেলার নাম' : 'Brand / Seller Name'}
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. boAt / Samsung / Noise"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Platform */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {lang === 'bn' ? 'ই-কমার্স প্ল্যাটফর্ম *' : 'Merchant Platform *'}
              </label>
              <select
                value={platform}
                onChange={(e) => {
                  const newPlat = e.target.value as Platform;
                  setPlatform(newPlat);
                  const prefix = newPlat === 'Amazon' ? 'AMZ' : newPlat === 'Flipkart' ? 'FLP' : newPlat === 'Blinkit' ? 'BLK' : newPlat === 'Meesho' ? 'MSH' : 'TBC';
                  setSpecialCode(`${prefix}-${Math.floor(1000 + Math.random() * 9000)}`);
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Original Price */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'bn' ? 'মূল বিক্রয় মূল্য (₹) *' : 'Original Price (₹) *'}
                </label>
              </div>
              <input
                type="number"
                min="1"
                required
                value={originalPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setOriginalPrice(val);
                  if (cashbackType === '100% Free') {
                    setCashbackAmount(val);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Cashback Amount */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'bn' ? 'ক্যাশব্যাক ফেরত (₹) *' : 'Cashback Payout (₹) *'}
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleSetFullRefund}
                    className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
                  >
                    100% Free
                  </button>
                  <button
                    type="button"
                    onClick={handleSetHalfCashback}
                    className="text-[10px] font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20"
                  >
                    50% Off
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="1"
                required
                value={cashbackAmount}
                onChange={(e) => setCashbackAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Cashback Type */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {lang === 'bn' ? 'অফারের ধরন' : 'Cashback Offer Type'}
              </label>
              <select
                value={cashbackType}
                onChange={(e) => {
                  const type = e.target.value as any;
                  setCashbackType(type);
                  if (type === '100% Free') {
                    setCashbackAmount(originalPrice);
                  }
                }}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="100% Free">{lang === 'bn' ? '১০০% ফ্রি (সম্পূর্ণ রিফান্ড)' : '100% Free (Full Refund)'}</option>
                <option value="Flat Cashback">{lang === 'bn' ? 'নির্দিষ্ট ক্যাশব্যাক (Flat Amount)' : 'Flat Cashback Amount'}</option>
                <option value="Review Bonus">{lang === 'bn' ? 'রিভিউ বোনাস অফার' : 'Review Bonus Incentive'}</option>
              </select>
            </div>

            {/* Total Slots */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {lang === 'bn' ? 'মোট বরাদ্দ স্লট (Total Slots)' : 'Total Campaign Slots'}
              </label>
              <input
                type="number"
                min="1"
                value={totalSlots}
                onChange={(e) => setTotalSlots(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Special Code Generator */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'bn' ? 'স্পেশাল ভেরিফিকেশন কোড (কাস্টমার এই কোড লিখে ক্লেইম করবে) *' : 'Special Verification Code (Customer Must Enter This Code) *'}
                </label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> {lang === 'bn' ? 'অটো-কোড জেনারেট' : 'Auto-Generate'}
                </button>
              </div>
              <input
                type="text"
                required
                value={specialCode}
                onChange={(e) => setSpecialCode(e.target.value.toUpperCase())}
                placeholder="e.g. AMZ-9821"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-indigo-400 uppercase tracking-wider focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Product Image URL or File Upload */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {lang === 'bn' ? 'প্রোডাক্টের ছবি (ছবি আপলোড করুন বা লিংক দিন)' : 'Product Image (Upload Photo or Paste URL)'}
              </label>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or choose file"
                  className="flex-1 w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />

                <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'bn' ? 'ডিভাইস থেকে ছবি আপলোড' : 'Choose Device Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {imageUrl && (
                <div className="flex items-center gap-3 p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-emerald-400 block">
                      ✓ {lang === 'bn' ? 'ছবি সংযুক্ত হয়েছে' : 'Product Photo Attached'}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {lang === 'bn' ? 'অফার কার্ডে প্রদর্শিত হবে' : 'Ready to be displayed on offer card'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-[11px] text-rose-400 hover:underline px-2"
                  >
                    {lang === 'bn' ? 'রিমুভ' : 'Remove'}
                  </button>
                </div>
              )}
            </div>

            {/* Purchase Link */}
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {lang === 'bn' ? 'স্টোর লিংক (Amazon / Flipkart / Blinkit)' : 'Store Purchase Link (Amazon/Flipkart/Blinkit)'}
              </label>
              <input
                type="url"
                value={purchaseUrl}
                onChange={(e) => setPurchaseUrl(e.target.value)}
                placeholder="https://www.amazon.in/dp/..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Step-by-Step Instructions */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'bn' ? 'কাস্টমারের জন্য নির্দেশনাবলী' : 'Step-by-Step Instructions for Customers'}
                </label>
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> {lang === 'bn' ? 'ধাপ যোগ করুন' : 'Add Step'}
                </button>
              </div>

              <div className="space-y-2">
                {instructions.map((inst, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={inst}
                      onChange={(e) => handleUpdateInstruction(idx, e.target.value)}
                      placeholder={`Instruction step ${idx + 1}`}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    {instructions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveInstruction(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>
                {productToEdit
                  ? (lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')
                  : (lang === 'bn' ? 'প্রোডাক্ট ক্যাম্পেইন চালু করুন' : 'Publish Offer Product')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
