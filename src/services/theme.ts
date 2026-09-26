import { ThemeColor, ThemeConfig } from '../types/wms';

const STORAGE_KEY_THEME = 'tbc_wms_theme_color_v2';

export const THEMES: ThemeConfig[] = [
  {
    id: 'indigo',
    nameEn: 'Indigo Pro',
    nameBn: 'ইন্ডিগো ব্লু',
    primaryClass: 'bg-indigo-600',
    primaryBg: 'bg-indigo-600',
    primaryHoverBg: 'hover:bg-indigo-500',
    primaryText: 'text-indigo-400',
    borderClass: 'border-indigo-500/40',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-500/30',
    gradientFrom: 'from-indigo-600',
    gradientTo: 'to-violet-600',
    shadowColor: 'shadow-indigo-600/30',
    ringFocus: 'focus:ring-indigo-500'
  },
  {
    id: 'emerald',
    nameEn: 'Emerald Green',
    nameBn: 'পান্না সবুজ (Emerald)',
    primaryClass: 'bg-emerald-600',
    primaryBg: 'bg-emerald-600',
    primaryHoverBg: 'hover:bg-emerald-500',
    primaryText: 'text-emerald-400',
    borderClass: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/30',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-teal-600',
    shadowColor: 'shadow-emerald-600/30',
    ringFocus: 'focus:ring-emerald-500'
  },
  {
    id: 'blue',
    nameEn: 'Royal Blue',
    nameBn: 'রয়েল ব্লু (Royal Blue)',
    primaryClass: 'bg-blue-600',
    primaryBg: 'bg-blue-600',
    primaryHoverBg: 'hover:bg-blue-500',
    primaryText: 'text-blue-400',
    borderClass: 'border-blue-500/40',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-500/30',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-cyan-600',
    shadowColor: 'shadow-blue-600/30',
    ringFocus: 'focus:ring-blue-500'
  },
  {
    id: 'violet',
    nameEn: 'Velvet Purple',
    nameBn: 'ভেলভেট বেগুনী (Purple)',
    primaryClass: 'bg-violet-600',
    primaryBg: 'bg-violet-600',
    primaryHoverBg: 'hover:bg-violet-500',
    primaryText: 'text-violet-400',
    borderClass: 'border-violet-500/40',
    badgeBg: 'bg-violet-500/20',
    badgeText: 'text-violet-300',
    badgeBorder: 'border-violet-500/30',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-purple-600',
    shadowColor: 'shadow-violet-600/30',
    ringFocus: 'focus:ring-violet-500'
  },
  {
    id: 'rose',
    nameEn: 'Crimson Rose',
    nameBn: 'রুবি লাল (Crimson)',
    primaryClass: 'bg-rose-600',
    primaryBg: 'bg-rose-600',
    primaryHoverBg: 'hover:bg-rose-500',
    primaryText: 'text-rose-400',
    borderClass: 'border-rose-500/40',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    badgeBorder: 'border-rose-500/30',
    gradientFrom: 'from-rose-600',
    gradientTo: 'to-pink-600',
    shadowColor: 'shadow-rose-600/30',
    ringFocus: 'focus:ring-rose-500'
  },
  {
    id: 'amber',
    nameEn: 'Sunset Amber',
    nameBn: 'সূর্যাস্ত গোল্ড (Amber)',
    primaryClass: 'bg-amber-600',
    primaryBg: 'bg-amber-600',
    primaryHoverBg: 'hover:bg-amber-500',
    primaryText: 'text-amber-400',
    borderClass: 'border-amber-500/40',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-500/30',
    gradientFrom: 'from-amber-600',
    gradientTo: 'to-orange-600',
    shadowColor: 'shadow-amber-600/30',
    ringFocus: 'focus:ring-amber-500'
  },
  {
    id: 'cyan',
    nameEn: 'Cyber Cyan',
    nameBn: 'সাইবার সায়ান (Cyan)',
    primaryClass: 'bg-cyan-600',
    primaryBg: 'bg-cyan-600',
    primaryHoverBg: 'hover:bg-cyan-500',
    primaryText: 'text-cyan-400',
    borderClass: 'border-cyan-500/40',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-500/30',
    gradientFrom: 'from-cyan-600',
    gradientTo: 'to-teal-600',
    shadowColor: 'shadow-cyan-600/30',
    ringFocus: 'focus:ring-cyan-500'
  }
];

export const THEME_CONFIGS: Record<ThemeColor, ThemeConfig> = THEMES.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<ThemeColor, ThemeConfig>);

export const themeService = {
  getTheme(): ThemeColor {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved && THEME_CONFIGS[saved as ThemeColor]) {
        return saved as ThemeColor;
      }
    } catch {
      // fallback
    }
    return 'indigo';
  },

  setTheme(theme: ThemeColor): void {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
      // ignore
    }
  },

  getConfig(theme: ThemeColor): ThemeConfig {
    return THEME_CONFIGS[theme] || THEME_CONFIGS.indigo;
  }
};
