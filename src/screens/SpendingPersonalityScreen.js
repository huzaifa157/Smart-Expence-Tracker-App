// SpendingPersonalityScreen.js
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Line, Polyline, Rect, Ellipse } from 'react-native-svg';
import ScreenWrapper from '../utils/ScreenWrapper';
import {useApp} from '../context/AppContext';
import {useTheme} from '../utils/theme';

const {width: SW} = Dimensions.get('window');

// ─── Back arrow ───────────────────────────────────────────────────────────────
const BackArrow = ({color}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 5L5 12L12 19" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ─── Professional SVG Icons ───────────────────────────────────────────────────

// Critical Zone — warning triangle
const IconCritical = ({color, size=26}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 19h20L12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color+'20'}/>
    <Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Circle cx="12" cy="16.5" r="1.1" fill={color}/>
  </Svg>
);

// Free Spirit — flowing wave
const IconFreeSpirit = ({color, size=26}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M2 11c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M2 16c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
  </Svg>
);

// Active Spender — credit card
const IconActiveSpender = ({color, size=26}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="6" width="20" height="13" rx="3" stroke={color} strokeWidth={1.8} fill={color+'15'}/>
    <Path d="M2 10h20" stroke={color} strokeWidth={1.8}/>
    <Path d="M6 15h4M15 15h3" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </Svg>
);

// Balanced Budgeter — scales of justice
const IconBalanced = ({color, size=26}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3v18M5 21h14" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Path d="M5 9l-3 5h6L5 9z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={color+'18'}/>
    <Path d="M19 9l-3 5h6L19 9z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={color+'18'}/>
    <Path d="M5 9h14" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
  </Svg>
);

// Smart Planner — calendar with checkmark
const IconSmartPlanner = ({color, size=26}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="17" rx="3" stroke={color} strokeWidth={1.8} fill={color+'12'}/>
    <Path d="M3 9h18" stroke={color} strokeWidth={1.8}/>
    <Path d="M8 3v3M16 3v3" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Path d="M8 14l2.5 2.5L16 12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Mindful Spender — head with inner circle (mindfulness)
const IconMindful = ({color, size=26}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} fill={color+'10'}/>
    <Path d="M9 11c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke={color} strokeWidth={1.6} strokeLinecap="round"/>
    <Path d="M12 11v4" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Path d="M10 15h4" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
  </Svg>
);

// Wealth Builder — bar chart with up arrow
const IconWealthBuilder = ({color, size=26}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3"  y="13" width="4" height="8" rx="1" fill={color+'25'} stroke={color} strokeWidth={1.5}/>
    <Rect x="10" y="9"  width="4" height="12" rx="1" fill={color+'35'} stroke={color} strokeWidth={1.5}/>
    <Rect x="17" y="5"  width="4" height="16" rx="1" fill={color+'50'} stroke={color} strokeWidth={1.5}/>
    <Path d="M5 6l4-3 4 2 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M17 3h2v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Elite Saver — diamond gem
const IconEliteSaver = ({color, size=26}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 9l10 13L22 9z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color+'18'}/>
    <Path d="M2 9h20" stroke={color} strokeWidth={1.5}/>
    <Path d="M7 9l5-7 5 7" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 9l3 13 3-13" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" opacity="0.55"/>
  </Svg>
);

// Financial Guru — trophy cup
const IconGuru = ({color, size=26}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M8 21h8M12 17v4" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Path d="M7 4H4a1 1 0 00-1 1v3a4 4 0 003 3.87" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Path d="M17 4h3a1 1 0 011 1v3a4 4 0 01-3 3.87" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Path d="M7 4h10v6a5 5 0 01-10 0V4z" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill={color+'15'}/>
    <Path d="M10 9l1.5 1.5L14 8" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Money Master — crown
const IconMoneyMaster = ({color, size=26}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 17L5 8l4.5 4.5L12 4l2.5 8.5L19 8l2 9H3z"
      stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color+'20'}/>
    <Path d="M3 17h18" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Circle cx="5"  cy="8" r="1.2" fill={color}/>
    <Circle cx="12" cy="4" r="1.2" fill={color}/>
    <Circle cx="19" cy="8" r="1.2" fill={color}/>
  </Svg>
);

// ─── 10 Personality Levels ────────────────────────────────────────────────────
const PERSONALITIES = [
  { minRate:0,  maxRate:9,   label:'Critical Zone',    SvgIcon:IconCritical,      color:'#EF4444', desc:'Spending exceeds income. Immediate action needed to avoid debt spiral.',            tips:['Track every single purchase','Cut all non-essential subscriptions','Create an emergency budget plan'],            badge:'SOS'     },
  { minRate:10, maxRate:14,  label:'Free Spirit',       SvgIcon:IconFreeSpirit,    color:'#F97316', desc:'Living for the moment. Very little is being saved for the future.',               tips:['Start with saving just 5% more','Automate a small savings transfer','Review recurring expenses monthly'],       badge:'Starter'  },
  { minRate:15, maxRate:19,  label:'Active Spender',    SvgIcon:IconActiveSpender, color:'#F59E0B', desc:'Enjoying life while trying to save. Savings are there but inconsistent.',          tips:['Boost savings by 3-5% this month','Set a specific savings goal','Use the 50/30/20 budgeting rule'],           badge:'Learner'  },
  { minRate:20, maxRate:24,  label:'Balanced Budgeter', SvgIcon:IconBalanced,      color:'#EAB308', desc:'Solid balance between spending and saving. On the right track.',                   tips:['Open a high-yield savings account','Start an investment account','Review budget monthly'],                    badge:'Stable'   },
  { minRate:25, maxRate:29,  label:'Smart Planner',     SvgIcon:IconSmartPlanner,  color:'#84CC16', desc:'Thoughtful with money. Building a comfortable financial cushion.',                 tips:['Explore index fund investing','Build 3-month emergency fund','Automate all savings'],                         badge:'Planned'  },
  { minRate:30, maxRate:34,  label:'Mindful Spender',   SvgIcon:IconMindful,       color:'#22C55E', desc:'Intentional with every purchase. Saving significantly for the future.',            tips:['Diversify your investment portfolio','Consider tax-advantaged accounts','Set 5-year financial milestones'], badge:'Mindful'  },
  { minRate:35, maxRate:39,  label:'Wealth Builder',    SvgIcon:IconWealthBuilder, color:'#10B981', desc:'Consistently building wealth. Financial independence is within reach.',             tips:['Max out retirement contributions','Explore real estate or passive income','Set a FIRE target date'],          badge:'Builder'  },
  { minRate:40, maxRate:49,  label:'Elite Saver',       SvgIcon:IconEliteSaver,    color:'#14B8A6', desc:'Impressive discipline. You are well on the path to financial freedom.',             tips:['Consider early retirement planning','Explore side income streams','Review asset allocation quarterly'],      badge:'Elite'    },
  { minRate:50, maxRate:64,  label:'Financial Guru',    SvgIcon:IconGuru,          color:'#6366F1', desc:'Outstanding savings rate. Financial independence is a near-term reality.',          tips:['Calculate your FIRE number','Consider charitable giving strategies','Explore legacy planning'],              badge:'Guru'     },
  { minRate:65, maxRate:100, label:'Money Master',      SvgIcon:IconMoneyMaster,   color:'#A3E635', desc:'Legendary savings rate. You have mastered the art of personal finance.',           tips:['You are an inspiration to others','Share your knowledge with community','Focus on wealth preservation'],    badge:'Master'   },
];

function getPersonality(rate) {
  return PERSONALITIES.find(p => rate >= p.minRate && rate <= p.maxRate) || PERSONALITIES[0];
}

export default function SpendingPersonalityScreen({navigation, route}) {
  const {state}  = useApp();
  const T        = useTheme(state.isDarkMode);
  const isDark   = state.isDarkMode;
  const s        = makeStyles(T, isDark);

  const income  = state.expenses.filter(e =>  e.isIncome).reduce((a,b) => a + b.amount, 0);
  const spent   = state.expenses.filter(e => !e.isIncome).reduce((a,b) => a + b.amount, 0);
  const savingRate = route?.params?.savingRate
    ?? (income > 0 ? Math.round(((income - spent) / income) * 100) : 35);
  const myPersonality = getPersonality(savingRate);
  const HeroIcon = myPersonality.SvgIcon;

  // Text colors — strong contrast
  const headText  = isDark ? '#F1F5F9' : '#0F172A';   // near-white dark / darkest slate light
  const bodyText  = isDark ? '#CBD5E1' : '#1E293B';   // slate-300 / slate-800 (much darker)
  const muteText  = isDark ? '#64748B' : '#475569';   // slate-500 dark / slate-600 light (darker mute)

  return (
    <ScreenWrapper isDarkMode={isDark}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <BackArrow color={T.text} />
        </TouchableOpacity>
        <Text style={[s.title, {color: headText}]}>Spending Personality</Text>
        <View style={{width:38}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:8}}>

        {/* ── Hero card ── */}
        <View style={[s.heroCard, {
          backgroundColor: isDark ? myPersonality.color+'1A' : 'rgba(99,102,241,0.08)',
          borderColor:     isDark ? myPersonality.color+'55' : 'rgba(99,102,241,0.30)',
        }]}>
          {/* Icon badge */}
          <View style={[s.heroBadgeWrap, {
            backgroundColor: isDark ? myPersonality.color+'22' : 'rgba(99,102,241,0.12)',
            borderColor:     isDark ? myPersonality.color+'45' : 'rgba(99,102,241,0.30)',
          }]}>
            <HeroIcon color={isDark ? myPersonality.color : '#6366F1'} size={46}/>
          </View>

          <Text style={[s.heroLabel, {color: isDark ? myPersonality.color : '#6366F1'}]}>Your Personality</Text>
          <Text style={[s.heroName,  {color: isDark ? myPersonality.color : '#0F172A'}]}>{myPersonality.label}</Text>
          <Text style={[s.heroRate,  {color: isDark ? myPersonality.color+'CC' : '#6366F1'}]}>{savingRate}% saving rate</Text>
          <Text style={[s.heroDesc,  {color: isDark ? '#CBD5E1' : '#1E293B'}]}>{myPersonality.desc}</Text>

          {/* Meter */}
          <View style={s.meterWrap}>
            <View style={[s.meterBg, {backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.12)'}]}>
              <View style={[s.meterFill, {width:`${Math.min(100,savingRate)}%`, backgroundColor: isDark ? myPersonality.color : '#6366F1'}]}/>
            </View>
            <View style={s.meterLabels}>
              <Text style={[s.meterLbl, {color: muteText}]}>0%</Text>
              <Text style={[s.meterLbl, {color: muteText}]}>50%</Text>
              <Text style={[s.meterLbl, {color: muteText}]}>100%</Text>
            </View>
          </View>

          {/* Tips */}
          <View style={[s.tipsBox, {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.85)',
            borderColor: isDark ? myPersonality.color+'30' : 'rgba(99,102,241,0.25)',
          }]}>
            <Text style={[s.tipTitle, {color: isDark ? myPersonality.color : '#6366F1'}]}>💡  Tips to Improve</Text>
            {myPersonality.tips.map((tip, i) => (
              <View key={i} style={s.tipRow}>
                <View style={[s.tipDot, {backgroundColor: isDark ? myPersonality.color : '#6366F1'}]}/>
                <Text style={[s.tipTxt, {color: bodyText}]}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── All levels ── */}
        <Text style={[s.sl, {color: muteText}]}>All Personality Levels</Text>

        {PERSONALITIES.map((p) => {
          const isMe = p.label === myPersonality.label;
          const LevelIcon = p.SvgIcon;
          // ── Single-line range "0% – 9%" ──
          const rangeStr = `${p.minRate}% – ${p.maxRate}%`;
          return (
            <View key={p.label} style={[s.levelCard, {
              backgroundColor: isMe
                ? (isDark ? p.color+'28' : p.color+'18')
                : (isDark ? p.color+'0E' : p.color+'0A'),
              borderColor: isMe
                ? p.color+'70'
                : p.color+'35',
              borderWidth: isMe ? 2 : 1.5,
            }]}>
              {/* Range pill — one line */}
              <View style={[s.rangePill, {backgroundColor: p.color+(isDark?'22':'16')}]}>
                <Text style={[s.rangeTxt, {color: p.color}]} numberOfLines={1}>{rangeStr}</Text>
              </View>

              {/* SVG icon */}
              <View style={[s.iconWrap, {
                backgroundColor: p.color+(isDark?'18':'10'),
                borderColor:     p.color+'30',
              }]}>
                <LevelIcon color={p.color} size={22}/>
              </View>

              {/* Info */}
              <View style={{flex:1}}>
                <View style={{flexDirection:'row',alignItems:'center',gap:6,marginBottom:3,flexWrap:'wrap'}}>
                  <Text style={[s.pName, {color: headText}]}>{p.label}</Text>
                  {isMe && (
                    <View style={[s.youTag,{backgroundColor:p.color+'25',borderColor:p.color+'50'}]}>
                      <Text style={[s.youTxt,{color:p.color}]}>YOU</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.pDesc, {color: muteText}]} numberOfLines={2}>{p.desc}</Text>
              </View>

              {/* Badge */}
              <View style={[s.badgeChip,{backgroundColor:p.color+'1E',borderColor:p.color+'40'}]}>
                <Text style={[s.badgeTxt,{color:p.color}]}>{p.badge}</Text>
              </View>
            </View>
          );
        })}

        {/* ── Calculation box ── */}
        <View style={[s.calcBox,{
          backgroundColor: isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)',
          borderColor:     isDark?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.10)',
        }]}>
          <Text style={[s.calcTitle,{color:headText}]}>How is it calculated?</Text>
          <Text style={[s.calcBody, {color:muteText}]}>
            Your personality is based on your{' '}
            <Text style={{fontWeight:'700',color:bodyText}}>saving rate</Text>
            {' '}— the percentage of income saved each month.{'\n\n'}
            <Text style={{fontWeight:'700',color:bodyText}}>Formula: </Text>
            (Income − Expenses) ÷ Income × 100{'\n\n'}
            Log income and expenses regularly to keep your personality accurate.
          </Text>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const makeStyles = (T, isDark) => StyleSheet.create({
  header:      {flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:8,paddingBottom:12},
  backBtn:     {width:38,height:38,borderRadius:12,borderWidth:1,borderColor:isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.10)',alignItems:'center',justifyContent:'center',backgroundColor:T.card},
  title:       {fontSize:18,fontWeight:'800',letterSpacing:-0.3},

  heroCard:    {marginHorizontal:14,marginBottom:16,borderRadius:22,padding:20,borderWidth:2,alignItems:'center'},
  heroBadgeWrap:{width:84,height:84,borderRadius:26,alignItems:'center',justifyContent:'center',borderWidth:1.5,marginBottom:14},
  heroLabel:   {fontSize:11,fontWeight:'800',letterSpacing:1,textTransform:'uppercase',marginBottom:5},
  heroName:    {fontSize:24,fontWeight:'800',letterSpacing:-0.4,marginBottom:4},
  heroRate:    {fontSize:15,fontWeight:'700',marginBottom:8},
  heroDesc:    {fontSize:13,textAlign:'center',lineHeight:20,marginBottom:16},

  meterWrap:   {width:'100%',marginBottom:16},
  meterBg:     {height:10,borderRadius:5,overflow:'hidden',marginBottom:5},
  meterFill:   {height:'100%',borderRadius:5},
  meterLabels: {flexDirection:'row',justifyContent:'space-between'},
  meterLbl:    {fontSize:10,fontWeight:'600'},

  tipsBox:     {width:'100%',borderRadius:14,borderWidth:1,padding:14},
  tipTitle:    {fontSize:13,fontWeight:'800',marginBottom:10},
  tipRow:      {flexDirection:'row',alignItems:'flex-start',gap:8,marginBottom:6},
  tipDot:      {width:6,height:6,borderRadius:3,marginTop:5,flexShrink:0},
  tipTxt:      {fontSize:13,flex:1,lineHeight:19},

  sl:          {paddingHorizontal:14,fontSize:10,letterSpacing:0.8,textTransform:'uppercase',fontWeight:'800',marginBottom:10},

  levelCard:   {flexDirection:'row',alignItems:'center',gap:9,marginHorizontal:14,marginBottom:8,borderRadius:18,padding:12},

  rangePill:   {minWidth:62,borderRadius:8,paddingVertical:5,paddingHorizontal:7,alignItems:'center',justifyContent:'center'},
  rangeTxt:    {fontSize:10,fontWeight:'800',letterSpacing:0.1},

  iconWrap:    {width:40,height:40,borderRadius:12,borderWidth:1,alignItems:'center',justifyContent:'center'},

  pName:       {fontSize:13,fontWeight:'800'},
  pDesc:       {fontSize:11,lineHeight:16},
  youTag:      {paddingHorizontal:7,paddingVertical:2,borderRadius:100,borderWidth:1},
  youTxt:      {fontSize:9,fontWeight:'800',letterSpacing:0.8},
  badgeChip:   {paddingHorizontal:8,paddingVertical:4,borderRadius:100,borderWidth:1},
  badgeTxt:    {fontSize:10,fontWeight:'800'},

  calcBox:     {marginHorizontal:14,marginTop:8,borderRadius:18,borderWidth:1.5,padding:16},
  calcTitle:   {fontSize:14,fontWeight:'800',marginBottom:8},
  calcBody:    {fontSize:13,lineHeight:21},
});