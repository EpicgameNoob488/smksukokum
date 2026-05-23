// Design Tokens (Stitch design + UI/UX Pro Max guidance + keep current red sidebar)
// Stitch: https://sm-konven-student-roster/
// Skill: Data-Dense Dashboard style for student management

export const tokens = {
  colors: {
    // PRIMARY COLORS
    // Keep current red for sidebar - #F04444 (KEEP as per user request)
    primaryRed: '#F04444',
    
    // Stitch colors - #131f5d (primary text/navy)
    textNavy: '#131f5d',
    
    // Stitch colors - #2b3674 (accent for icons/labels)
    accentNavy: '#2b3674',
    
    // Stitch colors - #767681 (muted text/outline)
    textMuted: '#767681',
    
    // BACKGROUND COLORS
    // Stitch - #f7f9ff (surface background)
    mainBg: '#f7f9ff',
    // Stitch - #f1f4fb (sidebar background)
    cardOuterBg: '#f1f4fb',
    // White cards
    cardInnerBg: '#ffffff',
    
    // ACCENT COLORS
    // Keep current orange
    accentOrange: '#FF7A59',
    // Keep current yellow
    accentYellow: '#FFB547',
    // Stitch progress bar - #da3437
    accentRed: '#da3437',
    
    // Semantic colors
    trendGreenBg: '#D1FAE5',
    trendGreenText: '#059669',
    trendRedBg: '#FEE2E2',
    trendRedText: '#DC2626',
    
    // Semantic from design_tokens.md
    successBg: '#DCFCE7',
    successText: '#166534',
    warningBg: '#FEF3C7',
    warningText: '#92400E',
    dangerBg: '#FEE2E2',
    dangerText: '#DC2626',
    
    // UI/UX Pro Max recommendations for dashboard
    // #2563EB (primary blue for dashboard elements)
    primaryBlue: '#2563EB',
    // #3B82F6 (secondary blue)
    secondaryBlue: '#3B82F6',
    // #F97316 (CTA orange)
    ctaOrange: '#F97316',
    // #1E293B (dark text)
    darkText: '#1E293B',
  }
};

// Design token constants for consistency
export const DT = {
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    modal: 'shadow-2xl',
    // Stitch card shadow
    card: 'shadow-[0_24px_24px_rgba(19,31,93,0.03)]',
    cardHover: 'shadow-[0_24px_24px_rgba(19,31,93,0.08)]',
  },
  spacing: {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl',
    '2xl': 'text-2xl',
  },
  transition: {
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
  },
  // Dropdown/Select component styles (professional dashboard standard)
  dropdown: {
    // Text styling - standard (14px, medium)
    textSize: 'text-sm',
    fontWeight: 'font-medium',
    // Container styling
    padding: 'px-4 py-2',
    radius: 'rounded-full',
    border: 'border border-slate-200',
    bg: 'bg-white',
    // Focus state - accessible with brand color
    focus: 'focus:outline-none focus:ring-2 focus:ring-red-200',
    // Icon/chevron styling
    iconSize: 'w-4 h-4',
    iconColor: 'textMuted', // use tokens.colors.textMuted
    iconPosition: 'absolute right-3 top-1/2 -translate-y-1/2',
  },
};
