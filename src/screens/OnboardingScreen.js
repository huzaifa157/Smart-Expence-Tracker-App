// OnboardingScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Rect, Line, Polyline, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import ScreenWrapper from '../utils/ScreenWrapper';
import { useApp } from '../context/AppContext';
import { useTheme } from '../utils/theme';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Professional SVG Illustrations per slide ─────────────────────────────────

// Slide 1: Expense tracking — receipt/ledger with bar chart
const IlloTrack = ({ primary, isDark }) => {
  const bg   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.07)';
  const card = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)';
  const mute = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(99,102,241,0.18)';
  return (
    <Svg width={180} height={160} viewBox="0 0 180 160" fill="none">
      {/* Background card */}
      <Rect x="20" y="15" width="140" height="115" rx="18" fill={card} stroke={primary+'30'} strokeWidth="1.5"/>
      {/* Header line */}
      <Rect x="34" y="30" width="60" height="7" rx="3.5" fill={primary+'60'}/>
      <Rect x="34" y="30" width="60" height="7" rx="3.5" fill={primary+'40'}/>
      {/* Amount big */}
      <Rect x="34" y="44" width="90" height="12" rx="5" fill={primary+'80'}/>
      {/* Divider */}
      <Line x1="34" y1="64" x2="146" y2="64" stroke={primary+'25'} strokeWidth="1"/>
      {/* Bar chart */}
      <Rect x="38"  y="105" width="14" height="28" rx="4" fill="#EF4444" opacity="0.80"/>
      <Rect x="58"  y="90"  width="14" height="43" rx="4" fill={primary} opacity="0.90"/>
      <Rect x="78"  y="98"  width="14" height="35" rx="4" fill="#F59E0B" opacity="0.80"/>
      <Rect x="98"  y="82"  width="14" height="51" rx="4" fill={primary} opacity="1.00"/>
      <Rect x="118" y="94"  width="14" height="39" rx="4" fill="#10B981" opacity="0.80"/>
      {/* Axis */}
      <Line x1="34" y1="133" x2="148" y2="133" stroke={primary+'30'} strokeWidth="1" strokeLinecap="round"/>
      {/* Floating tag */}
      <Rect x="105" y="55" width="42" height="22" rx="8" fill={primary} opacity="0.95"/>
      <Rect x="111" y="61" width="18" height="4" rx="2" fill="rgba(255,255,255,0.8)"/>
      <Rect x="111" y="67" width="12" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
    </Svg>
  );
};

// Slide 2: Goals — target with progress ring
const IlloGoals = ({ primary, isDark }) => {
  const card = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)';
  return (
    <Svg width={180} height={160} viewBox="0 0 180 160" fill="none">
      {/* Card bg */}
      <Rect x="20" y="10" width="140" height="140" rx="18" fill={card} stroke={primary+'30'} strokeWidth="1.5"/>
      {/* Outer ring track */}
      <Circle cx="90" cy="80" r="48" stroke={primary+'20'} strokeWidth="10" fill="none"/>
      {/* Progress arc ~72% */}
      <Circle cx="90" cy="80" r="48" stroke={primary} strokeWidth="10" fill="none"
        strokeDasharray="216 300" strokeDashoffset="54" strokeLinecap="round"
        transform="rotate(-90 90 80)"/>
      {/* Inner ring track */}
      <Circle cx="90" cy="80" r="32" stroke={primary+'15'} strokeWidth="7" fill="none"/>
      {/* Inner progress arc ~45% */}
      <Circle cx="90" cy="80" r="32" stroke="#10B981" strokeWidth="7" fill="none"
        strokeDasharray="90 201" strokeDashoffset="23" strokeLinecap="round"
        transform="rotate(-90 90 80)"/>
      {/* Center label */}
      <Rect x="74" y="71" width="32" height="9" rx="4" fill={primary+'70'}/>
      <Rect x="79" y="82" width="22" height="7" rx="3" fill={primary+'40'}/>
      {/* Goal chips below */}
      <Rect x="32" y="140" width="50" height="6" rx="3" fill={primary+'30'}/>
      <Rect x="88" y="140" width="60" height="6" rx="3" fill={"#10B98140"}/>
    </Svg>
  );
};

// Slide 3: Rewards — trophy with sparkles and badge
const IlloRewards = ({ primary, isDark }) => {
  const card = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)';
  return (
    <Svg width={180} height={160} viewBox="0 0 180 160" fill="none">
      <Rect x="20" y="10" width="140" height="140" rx="18" fill={card} stroke={primary+'30'} strokeWidth="1.5"/>
      {/* Trophy body */}
      <Path d="M65 115h50M90 100v15" stroke={primary} strokeWidth="3" strokeLinecap="round"/>
      <Path d="M70 45H55a3 3 0 00-3 3v8a16 16 0 0012 15.5" stroke={primary} strokeWidth="2.5" strokeLinecap="round"/>
      <Path d="M110 45h15a3 3 0 013 3v8a16 16 0 01-12 15.5" stroke={primary} strokeWidth="2.5" strokeLinecap="round"/>
      <Path d="M70 45h40v22a20 20 0 01-40 0V45z" stroke={primary} strokeWidth="2.5" strokeLinecap="round" fill={primary+'20'}/>
      <Path d="M83 63l4 4 10-10" stroke={primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Stars / sparkles */}
      <Path d="M44 35l1.5 4 4 1.5-4 1.5L44 46l-1.5-4-4-1.5 4-1.5z" fill={primary} opacity="0.9"/>
      <Path d="M138 55l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="#F59E0B" opacity="0.9"/>
      <Path d="M130 28l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill={primary} opacity="0.7"/>
      {/* Level badge */}
      <Circle cx="130" cy="110" r="18" fill={primary} opacity="0.95"/>
      <Rect x="122" y="104" width="16" height="4" rx="2" fill="rgba(255,255,255,0.8)"/>
      <Rect x="124" y="110" width="12" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
      <Rect x="126" y="116" width="8"  height="4" rx="2" fill="rgba(255,255,255,0.3)"/>
    </Svg>
  );
};

// Slide 4: Smart alerts — bell with notification rings
const IlloAlerts = ({ primary, isDark }) => {
  const card = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)';
  return (
    <Svg width={180} height={160} viewBox="0 0 180 160" fill="none">
      <Rect x="20" y="10" width="140" height="140" rx="18" fill={card} stroke={primary+'30'} strokeWidth="1.5"/>
      {/* Ripple rings */}
      <Circle cx="90" cy="75" r="55" stroke={primary+'12'} strokeWidth="1.5" fill="none"/>
      <Circle cx="90" cy="75" r="42" stroke={primary+'20'} strokeWidth="1.5" fill="none"/>
      <Circle cx="90" cy="75" r="30" stroke={primary+'30'} strokeWidth="1.5" fill="none"/>
      {/* Bell */}
      <Path d="M78 75c0-6.6 5.4-12 12-12s12 5.4 12 12v10l4 5H74l4-5V75z" stroke={primary} strokeWidth="2.2" strokeLinecap="round" fill={primary+'20'}/>
      <Path d="M87 90a3 3 0 006 0" stroke={primary} strokeWidth="2" strokeLinecap="round"/>
      {/* Notification dot */}
      <Circle cx="102" cy="63" r="7" fill="#EF4444"/>
      <Rect x="98.5" y="60.5" width="7" height="5" rx="1.5" fill="rgba(255,255,255,0.9)"/>
      {/* Alert cards */}
      <Rect x="32" y="118" width="116" height="22" rx="8" fill="#EF4444" opacity="0.12" stroke="#EF4444" strokeWidth="1" strokeOpacity="0.35"/>
      <Rect x="40" y="124" width="40" height="4" rx="2" fill="#EF4444" opacity="0.60"/>
      <Rect x="40" y="130" width="28" height="3" rx="1.5" fill="#EF4444" opacity="0.35"/>
      <Rect x="122" y="122" width="18" height="18" rx="6" fill="#EF4444" opacity="0.20"/>
      <Path d="M127 131l2 2 4-4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
    </Svg>
  );
};

// Slide 5: Currencies — globe with currency symbols
const IlloCurrencies = ({ primary, isDark }) => {
  const card = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.80)';
  return (
    <Svg width={180} height={160} viewBox="0 0 180 160" fill="none">
      <Rect x="20" y="10" width="140" height="140" rx="18" fill={card} stroke={primary+'30'} strokeWidth="1.5"/>
      {/* Globe */}
      <Circle cx="90" cy="75" r="36" stroke={primary} strokeWidth="2" fill={primary+'10'}/>
      <Ellipse cx="90" cy="75" rx="16" ry="36" stroke={primary+'60'} strokeWidth="1.5" fill="none"/>
      <Line x1="54" y1="75" x2="126" y2="75" stroke={primary+'60'} strokeWidth="1.5"/>
      <Line x1="58" y1="58" x2="122" y2="58" stroke={primary+'35'} strokeWidth="1"/>
      <Line x1="58" y1="92" x2="122" y2="92" stroke={primary+'35'} strokeWidth="1"/>
      {/* Currency chips */}
      <Rect x="22" y="118" width="36" height="22" rx="8" fill={primary} opacity="0.90"/>
      <Rect x="27" y="124" width="12" height="4" rx="2" fill="rgba(255,255,255,0.8)"/>
      <Rect x="27" y="130" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.5)"/>
      <Rect x="64" y="118" width="36" height="22" rx="8" fill="#10B981" opacity="0.85"/>
      <Rect x="69" y="124" width="12" height="4" rx="2" fill="rgba(255,255,255,0.8)"/>
      <Rect x="69" y="130" width="18" height="3" rx="1.5" fill="rgba(255,255,255,0.5)"/>
      <Rect x="106" y="118" width="52" height="22" rx="8" fill={primary} opacity="0.70"/>
      <Rect x="111" y="124" width="20" height="4" rx="2" fill="rgba(255,255,255,0.8)"/>
      <Rect x="111" y="130" width="14" height="3" rx="1.5" fill="rgba(255,255,255,0.5)"/>
    </Svg>
  );
};

// ─── Slide definitions ─────────────────────────────────────────────────────────
const SLIDES = [
  {
    tag:   'EXPENSE TRACKING',
    title: 'Track Every\nExpense',
    desc:  'Log expenses in seconds across 35+ smart categories. See exactly where your money goes — by day, week, month or year.',
    Illo:  IlloTrack,
    accent:'#6366F1',
  },
  {
    tag:   'SAVINGS GOALS',
    title: 'Set & Crush\nYour Goals',
    desc:  'Create savings goals, visualise progress, and transfer money directly to goals. Earn badges when you hit milestones.',
    Illo:  IlloGoals,
    accent:'#10B981',
  },
  {
    tag:   'REWARDS SYSTEM',
    title: 'Earn Rewards\n& Level Up',
    desc:  'Build streaks, collect badges, climb 30 levels, and unlock Pro features. The more you save, the more you earn.',
    Illo:  IlloRewards,
    accent:'#F59E0B',
  },
  {
    tag:   'SMART ALERTS',
    title: 'Stay on Budget\nAlways',
    desc:  'Get instant alerts when you approach budget limits. Set custom thresholds per category and stay in full control.',
    Illo:  IlloAlerts,
    accent:'#EF4444',
  },
  {
    tag:   'MULTI-CURRENCY',
    title: '50+ Global\nCurrencies',
    desc:  'Switch between 50+ currencies instantly. All amounts convert at real exchange rates — perfect for travellers.',
    Illo:  IlloCurrencies,
    accent:'#8B5CF6',
  },
];

export default function OnboardingScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const T      = useTheme(state.isDarkMode);
  const isDark = state.isDarkMode;
  const s      = makeStyles(T, isDark);

  const [current, setCurrent] = useState(0);
  // Single useRef for all animated values — prevents hook count mismatch on hot reload
  const animRef = useRef({
    fade:  new Animated.Value(1),
    slide: new Animated.Value(0),
    scale: new Animated.Value(1),
  });
  const fadeAnim  = animRef.current.fade;
  const slideAnim = animRef.current.slide;
  const scaleAnim = animRef.current.scale;

  function animateTransition(cb) {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue:0,   duration:180, useNativeDriver:true }),
      Animated.timing(slideAnim, { toValue:-24, duration:180, useNativeDriver:true }),
      Animated.timing(scaleAnim, { toValue:0.96,duration:180, useNativeDriver:true }),
    ]).start(() => {
      cb();
      slideAnim.setValue(24);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue:1,  duration:260, useNativeDriver:true }),
        Animated.timing(slideAnim, { toValue:0,  duration:260, useNativeDriver:true }),
        Animated.timing(scaleAnim, { toValue:1,  duration:260, useNativeDriver:true }),
      ]).start();
    });
  }

  function next() {
    if (current < SLIDES.length - 1) {
      animateTransition(() => setCurrent(c => c + 1));
    } else {
      finish();
    }
  }

  function finish() {
    dispatch({ type:'COMPLETE_ONBOARDING' });
    navigation.reset({ index:0, routes:[{ name:'Main' }] });
  }

  const slide     = SLIDES[current];
  const isLast    = current === SLIDES.length - 1;
  const primary   = isDark ? '#A3E635' : slide.accent;
  const Illo      = slide.Illo;

  return (
    <ScreenWrapper isDarkMode={isDark}>
      {/* Skip top-right */}
      <TouchableOpacity style={s.skip} onPress={finish} activeOpacity={0.7}>
        <Text style={s.skipTxt}>Skip</Text>
      </TouchableOpacity>

      <Animated.View style={[s.contentWrap, {
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
      }]}>
        {/* Tag */}
        <View style={[s.tagPill, {
          backgroundColor: isDark ? primary+'18' : slide.accent+'14',
          borderColor:     isDark ? primary+'35' : slide.accent+'30',
        }]}>
          <Text style={[s.tagTxt, {color: isDark ? primary : slide.accent}]}>{slide.tag}</Text>
        </View>

        {/* Illustration */}
        <View style={[s.illoWrap, {
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.60)',
          borderColor:     isDark ? primary+'20' : slide.accent+'20',
        }]}>
          <Illo primary={isDark ? primary : slide.accent} isDark={isDark}/>
        </View>

        {/* Title */}
        <Text style={[s.title, {color: isDark ? '#F1F5F9' : '#0F172A'}]}>{slide.title}</Text>

        {/* Description */}
        <Text style={[s.desc, {color: isDark ? '#94A3B8' : '#475569'}]}>{slide.desc}</Text>
      </Animated.View>

      {/* Footer */}
      <View style={s.footer}>
        {/* Dots */}
        <View style={s.dots}>
          {SLIDES.map((sl, i) => {
            const active = i === current;
            const pastOrActive = i <= current;
            return (
              <TouchableOpacity key={i} onPress={() => animateTransition(() => setCurrent(i))}>
                <View style={[
                  s.dot,
                  active  && [s.dotActive, {backgroundColor: isDark ? primary : sl.accent, width:24}],
                  !active && pastOrActive && {backgroundColor: (isDark ? primary : sl.accent)+'50'},
                ]}/>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={s.nextBtnWrap} onPress={next} activeOpacity={0.88}>
          <LinearGradient
            colors={isDark
              ? ['#4F46E5','#7C3AED','#9B35C5']
              : isLast
                ? [slide.accent, slide.accent+'CC']
                : ['#E890C8','#D468A8','#C060C0']}
            start={{x:0,y:0}} end={{x:1,y:0}}
            style={s.nextBtn}>
            <Text style={s.nextTxt}>{isLast ? "Let's Get Started →" : 'Continue →'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Subtle skip */}
        <TouchableOpacity style={s.skipRowBtn} onPress={finish} activeOpacity={0.7}>
          <Text style={[s.skipRowTxt, {color: isDark ? '#475569' : '#94A3B8'}]}>
            I'll explore on my own
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const makeStyles = (T, isDark) => StyleSheet.create({
  skip:       { position:'absolute', top:50, right:20, zIndex:10, paddingVertical:6, paddingHorizontal:12, borderRadius:100, backgroundColor: isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)' },
  skipTxt:    { color: isDark?'#64748B':'#94A3B8', fontSize:13, fontWeight:'700' },

  contentWrap:{ flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal:24, paddingTop:48 },

  tagPill:    { borderRadius:100, borderWidth:1, paddingVertical:5, paddingHorizontal:14, marginBottom:22 },
  tagTxt:     { fontSize:10, fontWeight:'800', letterSpacing:1.2 },

  illoWrap:   { width:SW-64, height:170, borderRadius:24, borderWidth:1.5, alignItems:'center', justifyContent:'center', marginBottom:28, overflow:'hidden' },

  title:      { fontSize:30, fontWeight:'800', letterSpacing:-0.6, textAlign:'center', lineHeight:38, marginBottom:14 },
  desc:       { fontSize:14, lineHeight:22, textAlign:'center', paddingHorizontal:8 },

  footer:     { paddingHorizontal:24, paddingBottom:36 },

  dots:       { flexDirection:'row', gap:6, justifyContent:'center', marginBottom:20 },
  dot:        { width:8, height:8, borderRadius:4, backgroundColor: isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.12)' },
  dotActive:  { height:8, borderRadius:4 },

  nextBtnWrap:{ borderRadius:16, overflow:'hidden', marginBottom:12 },
  nextBtn:    { height:54, alignItems:'center', justifyContent:'center' },
  nextTxt:    { fontSize:16, fontWeight:'800', color:'#FFF' },

  skipRowBtn: { height:40, alignItems:'center', justifyContent:'center' },
  skipRowTxt: { fontSize:13, fontWeight:'600' },
});