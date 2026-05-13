// theme.js
// Defines the full design-token system for both Light and Dark modes,
// plus the useTheme() hook that selects the correct token set at runtime.

// ─── LIGHT theme object ───────────────────────────────────────────────────────
export const LIGHT = {

  // ── Fallback / solid background ──────────────────────────────────────────
  bg:      '#B4A8E0',           // Solid lavender — shown before the gradient renders
  surface: '#F0EAFF',           // Slightly lighter lavender used for elevated surfaces (sheets, cards)
  card:    'rgba(255,255,255,0.28)',  // Semi-transparent white — frosted-glass card fill
  card2:   'rgba(30,20,80,0.70)',    // Dark navy with opacity — used on hero card inner sections

  // ── Background gradient ───────────────────────────────────────────────────
  // Six-stop gradient that flows from cool cornflower-blue down to warm rose-pink
  bgGrad: [
    '#A8BCEA', // Stop 0 — cornflower blue (top-left origin)
    '#B4A8E0', // Stop 1 — mid lavender
    '#C4A0D4', // Stop 2 — muted purple
    '#D898C0', // Stop 3 — dusty rose
    '#ECA0B8', // Stop 4 — warm pink
    '#F0A8BC', // Stop 5 — soft rose-pink (bottom-right terminus)
  ],
  bgGradStart: {x: 0.4, y: 0}, // Gradient origin — slightly right of centre at the top edge
  bgGradEnd:   {x: 0.6, y: 1}, // Gradient terminus — slightly right of centre at the bottom edge

  // ── Hero card (deep midnight navy) ───────────────────────────────────────
  // Creates strong contrast against the pastel background
  heroCard:       'rgba(15,18,50,0.82)',           // Semi-opaque midnight navy fill
  heroCardBorder: 'rgba(168,188,234,0.55)',         // Soft blue-white border glow
  heroCardGrad:   ['rgba(18,22,65,0.88)',           // Gradient start — very dark navy
                   'rgba(35,15,75,0.85)'],          // Gradient end   — deep purple-navy
  heroCardShadow: '#0A0D28',                        // Pure dark navy used as drop-shadow colour

  // ── Glass card (frosted white) ────────────────────────────────────────────
  // Used for content cards that float on top of the background gradient
  glassCard:       'rgba(255,255,255,0.30)',        // Translucent white fill — the "frosted" effect
  glassCardBorder: 'rgba(255,255,255,0.62)',        // Higher-opacity white border — catches the light
  glassCardShadow: 'rgba(100,80,180,0.22)',         // Purple-tinted shadow — blends with the gradient

  // ── KPI accent cards ──────────────────────────────────────────────────────
  // Each key maps to a colour set for a specific stat category
  kpi: {
    income:  {                                      // Income / earnings card
      bg:     'rgba(99,102,241,0.82)',              // Indigo fill at 82% opacity
      border: 'rgba(199,210,254,0.60)',             // Periwinkle border
      text:   '#FFFFFF',                            // Pure white primary text
      sub:    'rgba(255,255,255,0.75)',             // 75%-white secondary / subtitle text
    },
    expense: {                                      // Expense / spending card
      bg:     'rgba(219,39,119,0.82)',              // Hot-pink fill
      border: 'rgba(251,207,232,0.60)',             // Light pink border
      text:   '#FFFFFF',                            // White primary text
      sub:    'rgba(255,255,255,0.75)',             // Dimmed white subtitle
    },
    saving:  {                                      // Savings card
      bg:     'rgba(14,116,144,0.82)',              // Teal fill
      border: 'rgba(165,243,252,0.50)',             // Pale cyan border
      text:   '#FFFFFF',                            // White primary text
      sub:    'rgba(255,255,255,0.75)',             // Dimmed white subtitle
    },
    budget:  {                                      // Budget card
      bg:     'rgba(109,40,217,0.82)',              // Purple fill
      border: 'rgba(221,214,254,0.55)',             // Soft violet border
      text:   '#FFFFFF',                            // White primary text
      sub:    'rgba(255,255,255,0.75)',             // Dimmed white subtitle
    },
    net:     {                                      // Net balance card
      bg:     'rgba(4,120,87,0.82)',               // Emerald green fill
      border: 'rgba(167,243,208,0.50)',             // Mint border
      text:   '#FFFFFF',                            // White primary text
      sub:    'rgba(255,255,255,0.75)',             // Dimmed white subtitle
    },
  },

  // ── Typography colours ────────────────────────────────────────────────────
  text:          '#1A1440',                         // Primary text — deep indigo, high contrast on light bg
  muted:         '#4A3878',                         // Secondary text — muted purple, used for labels/subtitles
  muted2:        '#7A68A8',                         // Tertiary text — lighter purple, hints and timestamps
  textOnDark:    '#FFFFFF',                         // Text rendered on top of dark/navy surfaces
  mutedOnDark:   'rgba(200,210,255,0.80)',          // Subdued text on dark surfaces — blue-white at 80%
  textOnGrad:    '#FFFFFF',                         // Text rendered directly on the gradient background
  mutedOnGrad:   'rgba(255,255,255,0.82)',          // Subdued text on gradient — semi-transparent white

  // ── Border colours ────────────────────────────────────────────────────────
  border:  'rgba(255,255,255,0.40)',                // Default border — 40%-white, subtle on gradient
  border2: 'rgba(255,255,255,0.68)',                // Stronger border — 68%-white, used for emphasis

  // ── Input field tokens ────────────────────────────────────────────────────
  inputBg:          'rgba(255,255,255,0.28)',       // Input background — frosted glass feel
  inputBorder:      'rgba(255,255,255,0.55)',       // Resting border — visible but soft
  inputBorderFocus: 'rgba(255,255,255,0.90)',       // Focused border — near-opaque white highlight
  inputText:        '#FFFFFF',                      // Typed text colour inside the input
  inputPlaceholder: 'rgba(255,255,255,0.58)',       // Placeholder hint text — dimmed white

  // ── Brand / accent ────────────────────────────────────────────────────────
  primary:     '#6D28D9',                           // Primary brand colour — deep purple
  primaryGlow: 'rgba(109,40,217,0.22)',             // Glow / tinted background for selected states
  primaryDark: '#5B21B6',                           // Darker shade of primary — pressed/active states

  // ── CTA (call-to-action) button gradient ─────────────────────────────────
  ctaGrad:      ['#E890C8','#D468A8','#C860C0'],   // Pink-to-magenta gradient for primary buttons
  ctaGradStart: {x: 0, y: 0},                      // Left edge — gradient origin
  ctaGradEnd:   {x: 1, y: 0},                      // Right edge — gradient terminus (horizontal sweep)
  ctaText:      '#FFFFFF',                          // White label text on CTA buttons

  // ── Semantic status colours ───────────────────────────────────────────────
  red:    '#DC2626',                                // Error / destructive / over-budget
  orange: '#D97706',                                // Warning / caution
  blue:   '#4F46E5',                               // Informational / analytics accent
  purple: '#7C3AED',                               // Personality / gamification accent
  green:  '#059669',                               // Success / income / savings
  teal:   '#0891B2',                               // Support / secondary informational

  isDark: false,                                    // Flag — false means this is the LIGHT token set
};

// ─── DARK theme object ────────────────────────────────────────────────────────
export const DARK = {

  // ── Background ────────────────────────────────────────────────────────────
  bg:      '#080C14',                               // Near-black navy — full-screen background fill
  card:    '#0F1626',                               // Slightly lighter navy — card / panel surface
  card2:   '#1A2235',                               // Medium dark navy — inner sections, nested cards
  surface: '#111827',                               // Sheet/modal surface — between bg and card brightness

  // ── Typography ────────────────────────────────────────────────────────────
  text:        '#F1F5F9',                           // Primary text — near-white, max legibility on dark bg
  muted:       '#64748B',                           // Secondary text — slate grey for labels, hints
  muted2:      '#475569',                           // Tertiary text — darker slate for timestamps, captions
  textOnDark:  '#F1F5F9',                           // Alias — text that sits on any dark surface
  mutedOnDark: '#94A3B8',                           // Alias — subdued text on dark surfaces

  // ── Borders ───────────────────────────────────────────────────────────────
  border:  '#1E293B',                               // Default border — dark navy line, subtle card edges
  border2: '#334155',                               // Stronger border — used for selected/focused states

  // ── Brand / accent ────────────────────────────────────────────────────────
  primary:     '#A3E635',                           // Primary brand colour in dark — electric lime green
  primaryGlow: 'rgba(163,230,53,0.12)',             // Tinted glow background for selected/active states
  primaryDark: '#84CC16',                           // Darker lime — pressed/active variant of primary

  // ── Semantic status colours ───────────────────────────────────────────────
  red:    '#EF4444',                                // Error / destructive / over-budget (brighter on dark)
  orange: '#F97316',                                // Warning / caution (vivid on dark)
  blue:   '#3B82F6',                               // Informational / analytics (bright blue on dark)
  purple: '#A78BFA',                               // Personality / gamification (soft violet on dark)
  green:  '#4ADE80',                               // Success / income / savings (vivid lime-green on dark)
  teal:   '#2DD4BF',                               // Support / secondary informational (bright teal on dark)

  isDark: true,                                     // Flag — true means this is the DARK token set
};

// ─── useTheme hook ────────────────────────────────────────────────────────────
// Accepts a boolean isDarkMode and returns the matching token object.
// Consumed by every screen and component via:  const T = useTheme(state.isDarkMode)
export function useTheme(isDarkMode) {
  return isDarkMode ? DARK : LIGHT; // Return DARK tokens when dark mode is on, LIGHT tokens otherwise
}