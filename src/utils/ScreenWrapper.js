// ScreenWrapper.js
// A universal screen-level wrapper that applies the correct background
// (gradient in light mode, solid colour in dark mode) and optionally wraps
// children in a SafeAreaView so content avoids notches and home indicators.

import React from 'react';                                   // Core React — needed for JSX
import {StyleSheet, View} from 'react-native';               // StyleSheet for style objects; View as the base layout primitive
import {SafeAreaView} from 'react-native-safe-area-context'; // SafeAreaView that respects device notches / home indicators
import LinearGradient from 'react-native-linear-gradient';   // Third-party gradient component used in light mode
import {LIGHT, DARK} from './theme';                         // Import the raw token objects (not via useTheme) so we can use them outside a component

// ─── Component definition ─────────────────────────────────────────────────────
export default function ScreenWrapper({
  isDarkMode,           // boolean — true → dark background, false → light gradient
  children,             // ReactNode — whatever the screen renders inside this wrapper
  style,                // Optional extra styles applied to the inner content container
  edges,                // SafeAreaView edges prop, e.g. ['top','bottom'] — controls which edges are inset
  noSafeArea = false,   // boolean default false — set true when the screen manages its own SafeAreaView
}) {

  // ── Inner content container ─────────────────────────────────────────────
  // Decides whether to wrap children in SafeAreaView or a plain View
  const content = noSafeArea ? (
    // noSafeArea = true → plain View, no safe-area insets applied
    <View style={[s.flex, style]}>{children}</View>
  ) : (
    // noSafeArea = false (default) → SafeAreaView avoids notches/home bar
    // The `edges` prop lets each screen choose which sides get insets
    <SafeAreaView style={[s.flex, style]} edges={edges}>
      {children}  {/* Render the screen's own content inside the safe area */}
    </SafeAreaView>
  );

  // ── Dark mode branch ────────────────────────────────────────────────────
  if (isDarkMode) {
    return (
      // Outer View fills the whole screen with the dark solid background colour
      <View style={[s.flex, {backgroundColor: DARK.bg}]}>
        {content}  {/* Render the inner container (safe-area or plain View) */}
      </View>
    );
  }

  // ── Light mode branch ───────────────────────────────────────────────────
  // Renders the six-stop cornflower-blue → rose-pink gradient as the background
  return (
    <LinearGradient
      colors={LIGHT.bgGrad}           // Array of colour stops for the gradient
      start={LIGHT.bgGradStart}       // Gradient origin point {x: 0.4, y: 0} — slightly right of top-centre
      end={LIGHT.bgGradEnd}           // Gradient terminus  {x: 0.6, y: 1} — slightly right of bottom-centre
      style={s.flex}>                 // Gradient fills all available space
      {content}  {/* Render the inner container on top of the gradient */}
    </LinearGradient>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  flex: {flex: 1},  // Reusable flex:1 — makes any container fill its parent completely
});