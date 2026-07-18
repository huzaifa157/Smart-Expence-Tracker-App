// ThemeComponents.js
// Provides themed layout primitives (backgrounds, cards, gradients) that
// automatically adapt between light and dark mode using the token system
// from theme.js.  Import these instead of writing raw View + StyleSheet
// every time you need a card or gradient container.

import React from 'react';                                  // Core React — required for JSX
import {View} from 'react-native';                          // Base layout primitive — used for dark-mode card variants
import {LinearGradient} from 'expo-linear-gradient';
import {LIGHT, DARK} from './theme';                        // Raw token objects — accessed directly (not via useTheme)

// ─── GradientBackground ───────────────────────────────────────────────────────
// Full-screen background wrapper.
// • Dark mode  → solid dark navy View
// • Light mode → animated six-stop pastel gradient
export function GradientBackground({
  isDarkMode, // boolean — selects dark solid vs light gradient
  style,      // optional extra styles merged onto the container
  children,   // ReactNode — everything rendered on top of the background
}) {
  if (isDarkMode) {
    // Dark mode: render a plain View filled with the dark background colour
    return (
      <View style={[{flex: 1, backgroundColor: DARK.bg}, style]}>
        {children}  {/* Render child content inside the dark background */}
      </View>
    );
  }
  // Light mode: render the full cornflower-blue → rose-pink gradient
  return (
    <LinearGradient
      colors={LIGHT.bgGrad}           // Six-stop gradient colour array
      start={LIGHT.bgGradStart}       // Gradient origin — {x: 0.4, y: 0} (slightly right of top-centre)
      end={LIGHT.bgGradEnd}           // Gradient terminus — {x: 0.6, y: 1} (slightly right of bottom-centre)
      style={[{flex: 1}, style]}>     {/* Gradient fills all available space, plus any extra styles */}
      {children}  {/* Render child content on top of the gradient */}
    </LinearGradient>
  );
}

// ─── HeroCard ─────────────────────────────────────────────────────────────────
// Large feature card with maximum visual presence.
// • Dark mode  → solid dark navy with a visible border
// • Light mode → deep midnight-navy gradient with drop-shadow (high contrast on pastel bg)
export function HeroCard({
  T,               // Theme token object returned by useTheme()
  style,           // Optional extra styles merged onto the container
  children,        // ReactNode — the card's content
  radius = 22,     // Corner radius — defaults to 22 for a generously rounded card
}) {
  if (T.isDark) {
    // Dark mode: simple solid dark card with a strong border
    return (
      <View style={[{
        borderRadius:       radius,   // Apply corner radius
        backgroundColor:    T.card2,  // Dark navy surface colour (slightly lighter than the screen bg)
        borderWidth:        1,        // 1pt border
        borderColor:        T.border2,// Stronger border colour for dark mode (visible against dark bg)
      }, style]}>
        {children}  {/* Render card content */}
      </View>
    );
  }
  // Light mode: gradient card with prominent drop-shadow for elevation effect
  return (
    <View style={[{
      borderRadius:  radius,                // Apply corner radius to the outer shadow container
      overflow:      'hidden',              // Clip the gradient to the rounded corners
      shadowColor:   LIGHT.heroCardShadow,  // Dark navy shadow colour
      shadowOffset:  {width: 0, height: 12},// Shadow cast straight down by 12pt
      shadowOpacity: 0.50,                  // 50% shadow opacity — visually prominent
      shadowRadius:  28,                    // Large blur radius — soft, spread-out shadow
      elevation:     12,                    // Android elevation (maps to ~12pt shadow)
    }, style]}>
      {/* Inner LinearGradient provides the midnight-navy fill */}
      <LinearGradient
        colors={LIGHT.heroCardGrad}          // Two-stop dark navy → deep purple-navy gradient
        start={{x: 0, y: 0}}               // Gradient origin — top-left corner
        end={{x: 1, y: 1}}                 // Gradient terminus — bottom-right corner (diagonal)
        style={{
          flex:        1,                   // Fill the outer View completely
          borderRadius: radius,             // Match outer corner radius (required for gradient clipping)
          borderWidth:  1.5,               // Slightly thicker border for light-mode hero card
          borderColor:  LIGHT.heroCardBorder,// Soft blue-white glowing border
        }}>
        {children}  {/* Render card content inside the gradient */}
      </LinearGradient>
    </View>
  );
}

// ─── GlassCard ────────────────────────────────────────────────────────────────
// Standard content card with a frosted-glass appearance.
// • Dark mode  → solid dark card with subtle border
// • Light mode → semi-transparent white with high-opacity border and purple-tinted shadow
export function GlassCard({
  T,              // Theme token object
  style,          // Optional extra styles
  children,       // Card content
  radius = 18,    // Corner radius — defaults to 18 (slightly less rounded than HeroCard)
}) {
  if (T.isDark) {
    // Dark mode: opaque dark card — no transparency needed on a dark background
    return (
      <View style={[{
        borderRadius:    radius,    // Apply corner radius
        backgroundColor: T.card,   // Dark navy card fill (one step lighter than screen bg)
        borderWidth:     1,         // Standard 1pt border
        borderColor:     T.border,  // Dark mode default border colour
      }, style]}>
        {children}  {/* Render card content */}
      </View>
    );
  }
  // Light mode: frosted-glass card that lets the gradient show through
  return (
    <View style={[{
      borderRadius:    radius,                  // Apply corner radius
      backgroundColor: LIGHT.glassCard,         // 30%-white translucent fill — the "glass" effect
      borderWidth:     1.5,                     // Slightly thick border catches specular highlight
      borderColor:     LIGHT.glassCardBorder,   // 62%-white border — prominent on pastel background
      shadowColor:     LIGHT.glassCardShadow,   // Purple-tinted shadow — harmonises with gradient
      shadowOffset:    {width: 0, height: 6},   // Shadow cast 6pt downward
      shadowOpacity:   1,                       // Full opacity — shadow colour already has alpha baked in
      shadowRadius:    18,                      // Medium-large blur radius for a soft halo effect
      elevation:       6,                       // Android elevation level
    }, style]}>
      {children}  {/* Render card content on top of the frosted glass */}
    </View>
  );
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────
// Vivid accent card for KPI / stat display.
// • Dark mode  → plain dark card (accent colour shown via text/icons instead)
// • Light mode → saturated accent fill with matching border and coloured shadow
export function KpiCard({
  T,                    // Theme token object
  accentKey = 'income', // Which KPI palette to use: 'income' | 'expense' | 'saving' | 'budget' | 'net'
  style,                // Optional extra styles
  children,             // Card content
  radius = 16,          // Corner radius — 16pt for a more compact card than GlassCard
}) {
  if (T.isDark) {
    // Dark mode: keep cards dark — the accent shows in the stat text colour, not the card bg
    return (
      <View style={[{
        borderRadius:    radius,   // Apply corner radius
        backgroundColor: T.card,  // Standard dark card fill
        borderWidth:     1,        // Thin border
        borderColor:     T.border, // Default dark border colour
      }, style]}>
        {children}  {/* Render KPI content */}
      </View>
    );
  }
  // Light mode: retrieve the specific accent palette entry, falling back to 'income' if key is invalid
  const accent = (T.kpi && T.kpi[accentKey]) ? T.kpi[accentKey] : T.kpi.income;
  // Render a saturated coloured card with a matching shadow glow
  return (
    <View style={[{
      borderRadius:    radius,        // Apply corner radius
      backgroundColor: accent.bg,    // Vivid semi-opaque accent fill (e.g. indigo, pink, teal…)
      borderWidth:     1.5,          // Slightly thick border for visual presence
      borderColor:     accent.border, // Light tint of the accent colour for the border
      shadowColor:     accent.bg,    // Shadow matches the fill colour — creates a coloured glow effect
      shadowOffset:    {width: 0, height: 6},  // Shadow cast 6pt downward
      shadowOpacity:   0.55,         // 55% shadow opacity — visible but not overpowering
      shadowRadius:    14,           // Medium blur radius for a focused glow
      elevation:       7,            // Android elevation (slightly higher than GlassCard)
    }, style]}>
      {children}  {/* Render KPI stat content inside the accent card */}
    </View>
  );
}

// ─── CtaGradient ──────────────────────────────────────────────────────────────
// Call-to-action gradient container for primary buttons.
// • Dark mode  → lime-green gradient (matches the dark-mode primary brand colour)
// • Light mode → pink-to-magenta gradient (matches the light-mode CTA tokens)
export function CtaGradient({
  T,             // Theme token object
  style,         // Optional extra styles applied to the gradient
  children,      // Button label / content (usually a Text component)
  radius = 30,   // Corner radius — 30pt gives a fully pill-shaped button by default
}) {
  return (
    <LinearGradient
      // In dark mode use lime green stops; in light mode use the pink CTA gradient
      colors={T.isDark ? ['#A3E635', '#84CC16'] : LIGHT.ctaGrad}
      start={{x: 0, y: 0}}  // Gradient origin — left edge
      end={{x: 1, y: 0}}    // Gradient terminus — right edge (horizontal sweep)
      style={[{borderRadius: radius}, style]}>  {/* Apply radius + any extra styles */}
      {children}  {/* Render button label on top of the gradient */}
    </LinearGradient>
  );
}

// ─── cardStyle (plain helper) ─────────────────────────────────────────────────
// Returns a plain style object (not a component) for inline use with View.
// Useful when you need the card appearance but can't or don't want to use a component.
// variant: 'glass' (default) | 'hero'
export function cardStyle(T, variant = 'glass') {
  if (T.isDark) {
    // Dark mode: same solid card style regardless of variant
    return {
      backgroundColor: T.card,    // Standard dark card fill
      borderWidth:     1,          // Thin 1pt border
      borderColor:     T.border,   // Default dark border colour
    };
  }
  if (variant === 'hero') {
    // Light mode hero variant: dark navy with prominent shadow (mirrors HeroCard above)
    return {
      backgroundColor: 'rgba(15,18,50,0.82)',   // Midnight navy fill
      borderWidth:     1.5,                      // Slightly thick border
      borderColor:     'rgba(168,188,234,0.55)', // Soft blue-white border glow
      shadowColor:     '#0A0D28',                // Dark navy shadow
      shadowOffset:    {width: 0, height: 12},   // Deep downward shadow
      shadowOpacity:   0.50,                     // 50% opacity
      shadowRadius:    28,                        // Large spread
      elevation:       12,                        // Android elevation
    };
  }
  // Light mode glass variant (default): frosted white (mirrors GlassCard above)
  return {
    backgroundColor: 'rgba(255,255,255,0.30)',   // 30%-white translucent fill
    borderWidth:     1.5,                         // Thick border for specular highlight
    borderColor:     'rgba(255,255,255,0.62)',    // 62%-white border
    shadowColor:     'rgba(100,80,180,0.22)',     // Purple-tinted shadow
    shadowOffset:    {width: 0, height: 6},        // 6pt downward shadow
    shadowOpacity:   1,                            // Full opacity (alpha is in the colour)
    shadowRadius:    18,                            // Soft halo blur
    elevation:       6,                             // Android elevation
  };
}

// ─── kpiCardStyle (plain helper) ─────────────────────────────────────────────
// Returns a plain style object for KPI cards — mirrors KpiCard component above
// but usable inline without wrapping children in a component.
export function kpiCardStyle(T, key = 'income') {
  if (T.isDark) {
    // Dark mode: plain dark card with fixed 16pt radius
    return {
      backgroundColor: T.card,   // Standard dark card fill
      borderWidth:     1,         // Thin 1pt border
      borderColor:     T.border,  // Default dark border colour
      borderRadius:    16,        // Fixed 16pt corner radius for KPI cards
    };
  }
  // Light mode: look up the accent palette entry, falling back to 'income'
  const a = (T.kpi && T.kpi[key]) ? T.kpi[key] : T.kpi.income;
  return {
    backgroundColor: a.bg,          // Vivid accent fill
    borderWidth:     1.5,           // Thick border
    borderColor:     a.border,      // Accent-tinted border
    borderRadius:    16,             // Fixed 16pt corner radius
    shadowColor:     a.bg,          // Coloured glow shadow matching the fill
    shadowOffset:    {width: 0, height: 6},  // 6pt downward shadow
    shadowOpacity:   0.55,          // 55% opacity glow
    shadowRadius:    14,             // Medium blur
    elevation:       7,              // Android elevation
  };
}