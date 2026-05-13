import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  PanResponder,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop} from 'react-native-svg';
import {useApp} from '../context/AppContext';
import {useTheme} from '../utils/theme';
import {GradientBackground} from '../utils/ThemeComponents';
import SocialAuthSheet from './SocialAuthSheet';

const {width: W} = Dimensions.get('window');
const TRACK_H         = 58;
const THUMB_SIZE      = 50;
const MAX_SLIDE       = W - 44 - THUMB_SIZE;
const SLIDE_THRESHOLD = MAX_SLIDE * 0.38;

const ARC_SVG_W = W + 80;
const ARC_SVG_H = 140;
const arcD = `M -40 8 Q ${W / 2} ${ARC_SVG_H + 30} ${W + 40} 8`;

const SCHEMES = [
  {
    glow: ['rgba(29,78,216,0)',   'rgba(37,99,235,0.55)',  'rgba(124,58,237,0.60)', 'rgba(29,78,216,0)'],
    mid:  ['rgba(59,130,246,0)',  'rgba(79,120,255,0.80)', 'rgba(129,100,255,0.82)','rgba(59,130,246,0)'],
    line: ['rgba(147,197,253,0)', 'rgba(96,165,250,1)',    'rgba(165,148,255,1)',   'rgba(147,197,253,0)'],
  },
  {
    glow: ['rgba(4,120,87,0)',    'rgba(5,150,105,0.55)',  'rgba(6,182,212,0.55)',  'rgba(4,120,87,0)'],
    mid:  ['rgba(16,185,129,0)',  'rgba(20,184,166,0.80)', 'rgba(34,211,238,0.80)', 'rgba(16,185,129,0)'],
    line: ['rgba(52,211,153,0)',  'rgba(52,211,153,1)',    'rgba(103,232,249,1)',   'rgba(52,211,153,0)'],
  },
  {
    glow: ['rgba(180,83,9,0)',    'rgba(217,119,6,0.55)',  'rgba(225,29,72,0.50)',  'rgba(180,83,9,0)'],
    mid:  ['rgba(245,158,11,0)',  'rgba(251,146,60,0.82)', 'rgba(251,113,133,0.80)','rgba(245,158,11,0)'],
    line: ['rgba(253,211,77,0)',  'rgba(253,186,116,1)',   'rgba(253,164,175,1)',   'rgba(253,211,77,0)'],
  },
  {
    glow: ['rgba(91,33,182,0)',   'rgba(124,58,237,0.55)', 'rgba(190,24,93,0.50)',  'rgba(91,33,182,0)'],
    mid:  ['rgba(124,58,237,0)',  'rgba(167,139,250,0.82)','rgba(236,72,153,0.80)', 'rgba(124,58,237,0)'],
    line: ['rgba(196,181,253,0)', 'rgba(196,181,253,1)',   'rgba(249,168,212,1)',   'rgba(196,181,253,0)'],
  },
];

// ─── Pulsing dot ──────────────────────────────────────────────────────────────
const PulsingDot = ({color}) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 0.08, duration: 1800, useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 1,    duration: 1800, useNativeDriver: true}),
        Animated.delay(600),
      ])
    );
    a.start();
    return () => a.stop();
  }, []);

  // Derive rgba from hex for glow
  const isLime   = color === '#A3E635';
  const glowRgba = isLime ? 'rgba(163,230,53,0.38)' : 'rgba(124,58,237,0.38)';

  return (
    <View style={pd.wrap} renderToHardwareTextureAndroid shouldRasterizeIOS>
      <Animated.View style={[pd.glow, {opacity: pulse, backgroundColor: glowRgba}]} />
      <Animated.View style={[pd.core, {opacity: pulse, backgroundColor: color}]} />
    </View>
  );
};
const pd = StyleSheet.create({
  wrap: {width: 14, height: 14, alignItems: 'center', justifyContent: 'center'},
  glow: {position: 'absolute', width: 14, height: 14, borderRadius: 7},
  core: {width: 7, height: 7, borderRadius: 3.5},
});

// ─── Google SVG logo ──────────────────────────────────────────────────────────
const GoogleLogo = () => (
  <Svg width={22} height={22} viewBox="0 0 48 48">
    <Path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.9 0 20-8.9 20-20 0-1.3-.1-2.7-.4-3.9z"/>
    <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.8 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 40 16.3 44 24 44z"/>
    <Path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.3 5.5l6.2 5.2C40.8 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-3.9z"/>
  </Svg>
);

// ─── Apple SVG logo ───────────────────────────────────────────────────────────
const AppleLogo = () => (
  <Svg width={20} height={22} viewBox="0 0 814 1000">
    <Path fill="#FFFFFF" d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46.3 790.3 0 694.1 0 601.4c0-151.2 98.8-230.9 195.7-230.9 61 0 111.5 40.2 149.7 40.2 36.3 0 93.7-42.5 162.3-42.5.9 0 1.8 0 2.7.1zM441.4 113.5C463.8 87.5 480.2 51.1 480.2 14.7c0-5.6-.4-11.2-1.2-16.7-36.1 1.3-79 24.1-104.4 52.1C354.6 75.7 336 112.5 336 149.5c0 6.1.8 12.3 1.2 14.3 2.3.4 6.1.6 9.9.6 32.4 0 72.9-21.8 94.3-50.9z"/>
  </Svg>
);

// ─── Arc layer ────────────────────────────────────────────────────────────────
const ArcLayer = ({scheme, opacity}) => (
  <Animated.View
    style={[StyleSheet.absoluteFill, {opacity}]}
    pointerEvents="none"
    renderToHardwareTextureAndroid
    shouldRasterizeIOS>
    <Svg width={ARC_SVG_W} height={ARC_SVG_H} style={{marginLeft: -40, overflow: 'visible'}} overflow="visible">
      <Defs>
        <LinearGradient id={`g${scheme.id}0`} x1="0" y1="0" x2="1" y2="0">
          {scheme.glow.map((c, i) => <Stop key={i} offset={`${i * 33.3}%`} stopColor={c} />)}
        </LinearGradient>
        <LinearGradient id={`g${scheme.id}1`} x1="0" y1="0" x2="1" y2="0">
          {scheme.mid.map((c, i) => <Stop key={i} offset={`${i * 33.3}%`} stopColor={c} />)}
        </LinearGradient>
        <LinearGradient id={`g${scheme.id}2`} x1="0" y1="0" x2="1" y2="0">
          {scheme.line.map((c, i) => <Stop key={i} offset={`${i * 33.3}%`} stopColor={c} />)}
        </LinearGradient>
      </Defs>
      <Path d={arcD} stroke={`url(#g${scheme.id}0)`} strokeWidth={48} fill="none" strokeLinecap="round" />
      <Path d={arcD} stroke={`url(#g${scheme.id}1)`} strokeWidth={20} fill="none" strokeLinecap="round" />
      <Path d={arcD} stroke={`url(#g${scheme.id}2)`} strokeWidth={2.5} fill="none" strokeLinecap="round" />
    </Svg>
  </Animated.View>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function SplashScreen({navigation}) {
  const {state, dispatch} = useApp();
  const T       = useTheme(state.isDarkMode);
  const isDark  = state.isDarkMode;

  // ── Primary accent — lime dark / purple light (matches whole app) ─────────
  const primary     = isDark ? '#A3E635' : '#7C3AED';
  const primaryGlow = isDark ? 'rgba(163,230,53,0.55)'  : 'rgba(124,58,237,0.55)';
  const primaryFill = isDark ? 'rgba(163,230,53,0.18)'  : 'rgba(124,58,237,0.18)';
  const thumbText   = isDark ? '#06070d' : '#FFFFFF';   // dark bg on lime, white on purple

  // Badge colors
  const badgeBg    = isDark ? 'rgba(163,230,53,0.12)' : 'rgba(124,58,237,0.12)';
  const badgeBd    = isDark ? 'rgba(163,230,53,0.55)' : 'rgba(124,58,237,0.55)';
  const badgeTxtC  = isDark ? '#b8f059'               : '#818CF8';

  // ── Social auth sheet state ───────────────────────────────────────────────
  const [socialSheet, setSocialSheet] = useState({visible: false, provider: 'google'});

  // ── Entrance animations ───────────────────────────────────────────────────
  const cardFade  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(-40)).current;
  const bodyFade  = useRef(new Animated.Value(0)).current;
  const bodySlide = useRef(new Animated.Value(32)).current;
  const cardFloat = useRef(new Animated.Value(0)).current;

  // ── Arc scheme opacities ──────────────────────────────────────────────────
  const schemeOp0 = useRef(new Animated.Value(1)).current;
  const schemeOp1 = useRef(new Animated.Value(0)).current;
  const schemeOp2 = useRef(new Animated.Value(0)).current;
  const schemeOp3 = useRef(new Animated.Value(0)).current;
  const schemeOps = [schemeOp0, schemeOp1, schemeOp2, schemeOp3];

  // ── Slide track ───────────────────────────────────────────────────────────
  const slideX          = useRef(new Animated.Value(0)).current;
  const fillOpacityAnim = useRef(new Animated.Value(0)).current;
  const navigating      = useRef(false);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(60),
      Animated.parallel([
        Animated.timing(cardFade,  {toValue: 1, duration: 600, useNativeDriver: true}),
        Animated.timing(cardSlide, {toValue: 0, duration: 560, useNativeDriver: true}),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(260),
      Animated.parallel([
        Animated.timing(bodyFade,  {toValue: 1, duration: 500, useNativeDriver: true}),
        Animated.timing(bodySlide, {toValue: 0, duration: 500, useNativeDriver: true}),
      ]),
    ]).start();

    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(cardFloat, {toValue: -10, duration: 2600, useNativeDriver: true}),
        Animated.timing(cardFloat, {toValue: 0,   duration: 2600, useNativeDriver: true}),
      ])
    );
    floatAnim.start();

    let current = 0;
    let cycleTimer;
    const crossfade = () => {
      const next = (current + 1) % 4;
      Animated.parallel([
        Animated.timing(schemeOps[current], {toValue: 0, duration: 1400, useNativeDriver: true}),
        Animated.timing(schemeOps[next],    {toValue: 1, duration: 1400, useNativeDriver: true}),
      ]).start(() => {
        current = next;
        cycleTimer = setTimeout(crossfade, 3000);
      });
    };
    cycleTimer = setTimeout(crossfade, 3000);

    return () => { floatAnim.stop(); clearTimeout(cycleTimer); };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !navigating.current,
      onMoveShouldSetPanResponder:  (_, g) => Math.abs(g.dx) > 5 && !navigating.current,
      onPanResponderMove: (_, g) => {
        if (g.dx >= 0) {
          const val = Math.min(g.dx, MAX_SLIDE);
          slideX.setValue(val);
          fillOpacityAnim.setValue((val / MAX_SLIDE) * 1.0);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (navigating.current) return;
        if (g.dx > SLIDE_THRESHOLD) {
          navigating.current = true;
          fillOpacityAnim.setValue(1.0);
          Animated.timing(slideX, {toValue: MAX_SLIDE, duration: 160, useNativeDriver: true})
            .start(() => {
              navigation.navigate('SignUp');
              setTimeout(() => {
                Animated.spring(slideX, {toValue: 0, useNativeDriver: true, tension: 80, friction: 10})
                  .start(() => { fillOpacityAnim.setValue(0); navigating.current = false; });
              }, 300);
            });
        } else {
          Animated.parallel([
            Animated.spring(slideX,          {toValue: 0, useNativeDriver: true, tension: 90, friction: 12}),
            Animated.timing(fillOpacityAnim, {toValue: 0, duration: 250, useNativeDriver: true}),
          ]).start();
        }
      },
    })
  ).current;

  const thumbTranslate = slideX.interpolate({inputRange: [0, MAX_SLIDE], outputRange: [0, MAX_SLIDE], extrapolate: 'clamp'});
  const labelOpacity   = slideX.interpolate({inputRange: [0, 55], outputRange: [1, 0], extrapolate: 'clamp'});
  const fillWidth      = slideX.interpolate({inputRange: [0, MAX_SLIDE], outputRange: [THUMB_SIZE + 8, W - 44], extrapolate: 'clamp'});

  const subColor    = isDark ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.88)';
  const signinColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.72)';
  const btnBorder   = 'rgba(255,255,255,0.45)';
  const trackBorder = 'rgba(255,255,255,0.50)';

  return (
    <GradientBackground isDarkMode={isDark} style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* ── CARD ──────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[s.cardZone, {opacity: cardFade, transform: [{translateY: Animated.add(cardSlide, cardFloat)}]}]}
        renderToHardwareTextureAndroid shouldRasterizeIOS>
        <View style={s.card}>
          <View style={s.cardGlow} />
          <View style={s.cardTop}>
            <View style={s.chip}>
              <View style={s.chipH} />
              <View style={s.chipV} />
            </View>
            <View style={s.logoRow}>
              {/* Logo dot matches primary accent */}
              <View style={[s.logoDot, {backgroundColor: primary}]} />
              <Text style={s.logoTxt}>SpendWise</Text>
            </View>
          </View>
          <Text style={s.cardNum}>{'•••  •••  •••  4291'}</Text>
          <View style={s.cardBtm}>
            <Text style={s.cardOwner}>ANAS KHAN</Text>
            <View style={s.rings}>
              <View style={[s.ring, {width: 10, height: 14}]} />
              <View style={[s.ring, {width: 15, height: 20}]} />
              <View style={[s.ring, {width: 20, height: 26}]} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* ── ARC ───────────────────────────────────────────────────────────── */}
      <View style={s.arcContainer} pointerEvents="none">
        {SCHEMES.map((scheme, i) => (
          <ArcLayer key={i} scheme={{...scheme, id: i}} opacity={schemeOps[i]} />
        ))}
      </View>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <View style={s.body}>
        <Animated.View style={{flex: 1, opacity: bodyFade, transform: [{translateY: bodySlide}]}}>

          {/* Badge — themed */}
          <View style={[s.badge, {backgroundColor: badgeBg, borderColor: badgeBd}]}
            renderToHardwareTextureAndroid shouldRasterizeIOS>
            <PulsingDot color={primary} />
            <Text style={[s.badgeTxt, {color: primary}]}>  Smart Expense Tracker</Text>
          </View>

          {/* "spend." — lime dark / purple light */}
          <Text style={[s.h1, {color: '#FFFFFF'}]}>
            {'Control every\n'}
            <Text style={[s.h1Accent, {color: primary}]}>spend.</Text>
            {'  Build\nyour future.'}
          </Text>

          <Text style={[s.sub, {color: subColor}]}>
            Track every expense, set savings goals, and build{'\n'}
            smarter money habits — beautifully simple.
          </Text>

          {/* ── Slide track — themed ── */}
          <View style={[s.slideTrack, {borderColor: trackBorder}]} {...panResponder.panHandlers}>
            {/* Fill — primary color */}
            <Animated.View style={[s.slideFill, {
              width: fillWidth,
              opacity: fillOpacityAnim,
              backgroundColor: primary,
            }]} pointerEvents="none" />

            <Animated.Text style={[s.slideLabel, {opacity: labelOpacity}]} pointerEvents="none">
              Slide to get started  →
            </Animated.Text>

            {/* Thumb — primary bg, contrasting arrow */}
            <Animated.View style={[s.thumb, {
              transform: [{translateX: thumbTranslate}],
              backgroundColor: primary,
              shadowColor: primary,
            }]} pointerEvents="none">
              <Text style={[s.thumbArrow, {color: thumbText}]}>›</Text>
            </Animated.View>
          </View>

          <TouchableOpacity
            style={[s.socialBtn, {borderColor: btnBorder}]}
            activeOpacity={0.78}
            onPress={() => setSocialSheet({visible: true, provider: 'google'})}>
            <View style={s.socialLogo}><GoogleLogo /></View>
            <Text style={s.socialTxt}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.socialBtn, s.appleBtn, {borderColor: btnBorder}]}
            activeOpacity={0.78}
            onPress={() => setSocialSheet({visible: true, provider: 'apple'})}>
            <View style={s.socialLogo}><AppleLogo /></View>
            <Text style={s.socialTxt}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')} activeOpacity={0.7}>
            <Text style={[s.signinTxt, {color: signinColor}]}>
              Already have an account?{'  '}
              <Text style={[s.signinBold, {color: '#FFFFFF'}]}>Sign in</Text>
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </View>

      <SocialAuthSheet
        visible={socialSheet.visible}
        provider={socialSheet.provider}
        mode="signup"
        isDark={isDark}
        navigation={navigation}
        onClose={() => setSocialSheet(p => ({...p, visible: false}))}
        onSuccess={(provider, account) => {
          // Close the social auth sheet first
          setSocialSheet(p => ({...p, visible: false}));
          // Build user from social provider data (name/email from OAuth account)
          const user = {
            name:  account?.name  || 'Social User',
            email: account?.email || `user@${provider === 'apple' ? 'icloud' : 'gmail'}.com`,
            pass:  'social_auth', // Placeholder — no local password for social accounts
          };
          // Register in the local user list so sign-in works later
          dispatch({type: 'REGISTER_USER', user});
          // Log in as a brand-new user — isNew:true gives ZERO_BUDGETS, empty data
          dispatch({type: 'LOGIN', user, isNew: true});
          // New users ALWAYS go to Onboarding, never directly to Main
          navigation.reset({index: 0, routes: [{name: 'Onboarding'}]});
        }}
      />
    </GradientBackground>
  );
}

const s = StyleSheet.create({
  root:      {flex: 1},
  cardZone:  {alignItems: 'center', paddingTop: Platform.OS === 'android' ? 50 : 46, paddingBottom: 12},
  card: {
    width: W * 0.76, height: 178, borderRadius: 22,
    backgroundColor: '#0f1117', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', padding: 20,
    justifyContent: 'space-between', overflow: 'hidden',
    transform: [{rotate: '-2.5deg'}],
  },
  cardGlow:  {position: 'absolute', top: -35, right: -35, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(14,116,144,0.12)'},
  cardTop:   {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  chip:      {width: 36, height: 27, borderRadius: 5, backgroundColor: '#d4a84b', justifyContent: 'center', alignItems: 'center'},
  chipH:     {width: '76%', height: 1, backgroundColor: 'rgba(0,0,0,0.28)'},
  chipV:     {position: 'absolute', width: 1, height: '62%', backgroundColor: 'rgba(0,0,0,0.28)'},
  logoRow:   {flexDirection: 'row', alignItems: 'center', gap: 5},
  logoDot:   {width: 7, height: 7, borderRadius: 3.5},           // color applied inline
  logoTxt:   {color: 'rgba(255,255,255,0.95)', fontSize: 13, fontWeight: '700', letterSpacing: 1.5},
  cardNum:   {color: 'rgba(255,255,255,0.68)', fontSize: 14, letterSpacing: 3.5},
  cardBtm:   {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'},
  cardOwner: {color: 'rgba(255,255,255,0.48)', fontSize: 11, letterSpacing: 2, fontWeight: '600'},
  rings:     {flexDirection: 'row', alignItems: 'center', gap: 2},
  ring:      {borderRadius: 50, borderColor: 'rgba(255,255,255,0.28)', borderWidth: 1.5},

  arcContainer: {width: W, height: ARC_SVG_H, overflow: 'visible', marginTop: -6},

  body:      {flex: 1, paddingHorizontal: 22, paddingTop: 6, paddingBottom: 8, justifyContent: 'space-evenly'},

  badge:     {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    borderWidth: 1.5, borderRadius: 100,
    paddingVertical: 6, paddingHorizontal: 12, marginBottom: 14,
    // backgroundColor & borderColor applied inline
  },
  badgeTxt:  {fontSize: 11.5, fontWeight: '700', letterSpacing: 0.3}, // color inline

  h1:        {fontSize: 36, fontWeight: '800', lineHeight: 46, letterSpacing: -0.5, marginBottom: 10},
  h1Accent:  {fontWeight: '800'},     // color applied inline per theme
  sub:       {fontSize: 14, lineHeight: 22, marginBottom: 20},

  slideTrack: {
    height: TRACK_H, borderRadius: TRACK_H / 2,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5,
    justifyContent: 'center', overflow: 'hidden', position: 'relative', marginBottom: 12,
  },
  slideFill:  {position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: TRACK_H / 2},
                                       // backgroundColor & opacity applied inline
  slideLabel: {position: 'absolute', width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '600', letterSpacing: 0.2},
  thumb: {
    position: 'absolute', left: 4, width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center', justifyContent: 'center', elevation: 8,
    shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.55, shadowRadius: 12,
    // backgroundColor & shadowColor applied inline
  },
  thumbArrow: {fontSize: 28, fontWeight: '900', lineHeight: 32}, // color inline

  socialBtn: {
    height: TRACK_H, borderRadius: TRACK_H / 2,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingHorizontal: 20, marginBottom: 12,
  },
  appleBtn:   {backgroundColor: 'rgba(255,255,255,0.10)'},
  socialLogo: {width: 26, height: 26, alignItems: 'center', justifyContent: 'center'},
  socialTxt:  {color: '#FFFFFF', fontSize: 15, fontWeight: '600', letterSpacing: 0.1},
  signinTxt:  {textAlign: 'center', fontSize: 13},
  signinBold: {fontWeight: '700'},
});