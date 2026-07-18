import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';
import ScreenWrapper from '../utils/ScreenWrapper';
import { useApp } from '../context/AppContext';
import { useTheme } from '../utils/theme';

const { width: SW } = Dimensions.get('window');

// ─── Back arrow ───────────────────────────────────────────────────────────────
const BackArrow = ({color}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 5L5 12L12 19" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ─── Lock icon ────────────────────────────────────────────────────────────────
const LockIcon = ({color, size=16}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth={1.8}/>
    <Path d="M8 11V7a4 4 0 018 0v4" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
  </Svg>
);

// ─── SVG Icons per level — SAME as ProfileScreen GAM_ICONS ───────────────────
// Level 1: Star (beginner spark)
const GamIcon1  = ({color,size=26}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke={color} strokeWidth={1.6} fill={color+'15'}/></Svg>);
// Level 2: Circle checkmark (confirmed)
const GamIcon2  = ({color,size=26}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} fill={color+'12'}/><Path d="M8 12l3 3 5-5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
// Level 3: Lightning bolt (energy)
const GamIcon3  = ({color,size=26}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill={color+'15'}/></Svg>);
// Level 4: Bar chart growing (progress)
const GamIcon4  = ({color,size=26}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="11" width="4" height="10" rx="1" fill={color+'25'} stroke={color} strokeWidth={1.5}/><Rect x="10" y="7" width="4" height="14" rx="1" fill={color+'35'} stroke={color} strokeWidth={1.5}/><Rect x="17" y="3" width="4" height="18" rx="1" fill={color+'50'} stroke={color} strokeWidth={1.5}/></Svg>);
// Level 5: Diamond gem (milestone)
const GamIcon5  = ({color,size=26}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2L2 9l10 13L22 9z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color+'18'}/><Path d="M2 9h20" stroke={color} strokeWidth={1.5}/><Path d="M7 9l5-7 5 7" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
// Level 6: Scales of justice (balance mastery)
const GamIcon6  = ({color,size=26}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 3v18M5 21h14" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M5 9l-3 5h6L5 9z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={color+'18'}/><Path d="M19 9l-3 5h6L19 9z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={color+'18'}/><Path d="M5 9h14" stroke={color} strokeWidth={1.5} strokeLinecap="round"/></Svg>);
// Level 7: Person silhouette (community leader)
const GamIcon7  = ({color,size=26}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="8" r="5" stroke={color} strokeWidth={1.8} fill={color+'15'}/><Path d="M6 21v-2a6 6 0 0112 0v2" stroke={color} strokeWidth={1.8} strokeLinecap="round"/></Svg>);
// Level 8: Trophy cup (winner)
const GamIcon8  = ({color,size=26}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M8 21h8M12 17v4" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 4H4a1 1 0 00-1 1v3a4 4 0 003 3.87" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M17 4h3a1 1 0 011 1v3a4 4 0 01-3 3.87" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 4h10v6a5 5 0 01-10 0V4z" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill={color+'15'}/></Svg>);
// Level 9: Clock / time mastery
const GamIcon9  = ({color,size=26}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8} fill={color+'10'}/><Path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
// Level 10: Crown (master)
const GamIcon10 = ({color,size=26}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 17L5 8l4.5 4.5L12 4l2.5 8.5L19 8l2 9H3z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color+'20'}/><Path d="M3 17h18" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Circle cx="5" cy="8" r="1.2" fill={color}/><Circle cx="12" cy="4" r="1.2" fill={color}/><Circle cx="19" cy="8" r="1.2" fill={color}/></Svg>);

// Icons array indexed by level (1-based, capped at 10)
const GAM_ICONS = [GamIcon1,GamIcon2,GamIcon3,GamIcon4,GamIcon5,GamIcon6,GamIcon7,GamIcon8,GamIcon9,GamIcon10];
function getLevelIcon(levelNum) {
  return GAM_ICONS[Math.min(Math.max((levelNum||1)-1, 0), 9)];
}

// ─── 30 LEVELS definition ─────────────────────────────────────────────────────
const LEVELS = [
  // Tier 1: Beginner (1-5)
  {level:1,  name:'Penny Saver',      pts:0,      color:'#6B7280', tier:'Beginner'},
  {level:2,  name:'Coin Counter',     pts:200,    color:'#6B7280', tier:'Beginner'},
  {level:3,  name:'Budget Starter',   pts:500,    color:'#6B7280', tier:'Beginner'},
  {level:4,  name:'Expense Logger',   pts:900,    color:'#6B7280', tier:'Beginner'},
  {level:5,  name:'Habit Builder',    pts:1400,   color:'#6B7280', tier:'Beginner'},
  // Tier 2: Intermediate (6-10)
  {level:6,  name:'Money Manager',    pts:2000,   color:'#10B981', tier:'Intermediate'},
  {level:7,  name:'Budget Keeper',    pts:2800,   color:'#10B981', tier:'Intermediate'},
  {level:8,  name:'Smart Spender',    pts:3800,   color:'#10B981', tier:'Intermediate'},
  {level:9,  name:'Savings Hunter',   pts:5000,   color:'#10B981', tier:'Intermediate'},
  {level:10, name:'Finance Pro',      pts:6500,   color:'#10B981', tier:'Intermediate'},
  // Tier 3: Advanced (11-15)
  {level:11, name:'Wealth Tracker',   pts:8500,   color:'#3B82F6', tier:'Advanced'},
  {level:12, name:'Budget Master',    pts:11000,  color:'#3B82F6', tier:'Advanced'},
  {level:13, name:'Investment Scout', pts:14000,  color:'#3B82F6', tier:'Advanced'},
  {level:14, name:'Frugal Expert',    pts:17500,  color:'#3B82F6', tier:'Advanced'},
  {level:15, name:'Money Tactician',  pts:21500,  color:'#3B82F6', tier:'Advanced'},
  // Tier 4: Elite (16-20)
  {level:16, name:'Finance Eagle',    pts:26000,  color:'#8B5CF6', tier:'Elite'},
  {level:17, name:'Wealth Builder',   pts:31500,  color:'#8B5CF6', tier:'Elite'},
  {level:18, name:'Portfolio Pro',    pts:38000,  color:'#8B5CF6', tier:'Elite'},
  {level:19, name:'Capital Maestro',  pts:45500,  color:'#8B5CF6', tier:'Elite'},
  {level:20, name:'Money Oracle',     pts:54000,  color:'#8B5CF6', tier:'Elite'},
  // Tier 5: Legend (21-25)
  {level:21, name:'Finance Titan',    pts:64000,  color:'#F59E0B', tier:'Legend'},
  {level:22, name:'Wealth Architect', pts:76000,  color:'#F59E0B', tier:'Legend'},
  {level:23, name:'Money Sovereign',  pts:90000,  color:'#F59E0B', tier:'Legend'},
  {level:24, name:'Capital King',     pts:106000, color:'#F59E0B', tier:'Legend'},
  {level:25, name:'SpendWise Legend', pts:125000, color:'#F59E0B', tier:'Legend'},
  // Tier 6: Mythic (26-30)
  {level:26, name:'Finance Deity',    pts:147000, color:'#EC4899', tier:'Mythic'},
  {level:27, name:'Wealth Immortal',  pts:173000, color:'#EC4899', tier:'Mythic'},
  {level:28, name:'Money Phantom',    pts:203000, color:'#EC4899', tier:'Mythic'},
  {level:29, name:'Capital Myth',     pts:238000, color:'#EC4899', tier:'Mythic'},
  {level:30, name:'The Enlightened',  pts:280000, color:'#A3E635', tier:'Mythic'},
];

const TIER_COLORS = {
  Beginner:'#6B7280', Intermediate:'#10B981', Advanced:'#3B82F6',
  Elite:'#8B5CF6', Legend:'#F59E0B', Mythic:'#EC4899',
};

function fmt(n) {
  if (n >= 1000) return `${(n/1000).toFixed(n%1000===0?0:1)}K`;
  return n.toString();
}

export default function GamificationScreen({navigation, route}) {
  const {state} = useApp();
  const T       = useTheme(state.isDarkMode);
  const isDark  = state.isDarkMode;
  const pts     = state.points || (route?.params?.points ?? 0);
  const s       = makeStyles(T, isDark);

  // Current level & next level
  const curLevel = LEVELS.slice().reverse().find(l => pts >= l.pts) || LEVELS[0];
  const nextLvl  = LEVELS.find(l => l.pts > pts);
  const toNext   = nextLvl ? nextLvl.pts - pts : 0;
  const pct      = nextLvl
    ? Math.round(((pts - curLevel.pts) / (nextLvl.pts - curLevel.pts)) * 100)
    : 100;

  // Hero SVG icon — same icon used in ProfileScreen for this level
  const HeroIcon = getLevelIcon(curLevel.level);
  const heroColor = isDark ? curLevel.color : '#6366F1';

  // Next level SVG icon
  const NextIcon = nextLvl ? getLevelIcon(nextLvl.level) : null;

  const tiers = ['Beginner','Intermediate','Advanced','Elite','Legend','Mythic'];

  return (
    <ScreenWrapper isDarkMode={isDark}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <BackArrow color={T.text}/>
        </TouchableOpacity>
        <Text style={[s.title, {color: T.text}]}>Levels & Rewards</Text>
        <View style={{width:38}}/>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:8}}>

        {/* ── Current Level Hero Card ── */}
        <View style={[s.heroCard, {
          backgroundColor: isDark ? curLevel.color+'1A' : 'rgba(99,102,241,0.08)',
          borderColor:     isDark ? curLevel.color+'50' : 'rgba(99,102,241,0.30)',
        }]}>
          {/* SVG icon badge — matching ProfileScreen */}
          <View style={[s.heroBadgeWrap, {
            backgroundColor: isDark ? curLevel.color+'22' : 'rgba(99,102,241,0.12)',
            borderColor:     isDark ? curLevel.color+'45' : 'rgba(99,102,241,0.28)',
          }]}>
            <HeroIcon color={heroColor} size={46}/>
          </View>

          <Text style={[s.heroLvlNum, {color: isDark ? curLevel.color : '#6366F1'}]}>Level {curLevel.level}</Text>
          <Text style={[s.heroLvlName, {color: isDark ? '#F1F5F9' : '#0F172A'}]}>{curLevel.name}</Text>
          <Text style={[s.heroPts, {color: isDark ? '#94A3B8' : '#475569'}]}>{pts.toLocaleString()} points earned</Text>

          {/* XP bar */}
          <View style={s.xpRow}>
            <View style={[s.xpBg, {backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(99,102,241,0.12)'}]}>
              <View style={[s.xpFill, {width:`${pct}%`, backgroundColor: isDark ? curLevel.color : '#6366F1'}]}/>
            </View>
            <Text style={[s.xpPct, {color: isDark ? curLevel.color : '#6366F1'}]}>{pct}%</Text>
          </View>

          {/* Next level preview */}
          {nextLvl && NextIcon && (
            <View style={[s.nextLevelRow, {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.07)',
              borderColor:     isDark ? 'rgba(255,255,255,0.12)' : 'rgba(99,102,241,0.18)',
            }]}>
              <View style={[s.nextIconWrap, {
                backgroundColor: isDark ? nextLvl.color+'18' : 'rgba(99,102,241,0.10)',
                borderColor:     isDark ? nextLvl.color+'30' : 'rgba(99,102,241,0.20)',
              }]}>
                <NextIcon color={isDark ? nextLvl.color : '#6366F1'} size={18}/>
              </View>
              <View style={{flex:1}}>
                <Text style={{fontSize:9, fontWeight:'800', color: isDark ? '#64748B' : '#94A3B8', textTransform:'uppercase', letterSpacing:0.6, marginBottom:2}}>Next Level</Text>
                <Text style={{fontSize:13, fontWeight:'700', color: isDark ? '#F1F5F9' : '#0F172A'}}>Level {nextLvl.level} · {nextLvl.name}</Text>
              </View>
              <View style={[s.nextPtsPill, {backgroundColor: isDark ? nextLvl.color+'20' : 'rgba(99,102,241,0.10)', borderColor: isDark ? nextLvl.color+'40' : 'rgba(99,102,241,0.25)'}]}>
                <Text style={{fontSize:10, fontWeight:'800', color: isDark ? nextLvl.color : '#6366F1'}}>{toNext.toLocaleString()} pts</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── All Tiers ── */}
        {tiers.map(tier => {
          const tierLevels = LEVELS.filter(l => l.tier === tier);
          const tierColor  = TIER_COLORS[tier];

          return (
            <View key={tier} style={s.tierSection}>
              {/* Tier header */}
              <View style={s.tierHeader}>
                <View style={[s.tierBadge, {backgroundColor: tierColor+'20', borderColor: tierColor+'40'}]}>
                  <Text style={[s.tierLabel, {color: tierColor}]}>{tier.toUpperCase()}</Text>
                </View>
                <View style={[s.tierLine, {backgroundColor: tierColor+'30'}]}/>
              </View>

              {/* Level cards */}
              {tierLevels.map(lvl => {
                const unlocked = pts >= lvl.pts;
                const current  = lvl.level === curLevel.level;
                const isNext   = nextLvl && lvl.level === nextLvl.level;
                const LvlIcon  = getLevelIcon(lvl.level);
                const iconColor = isDark ? lvl.color : (unlocked ? lvl.color : '#94A3B8');

                return (
                  <View key={lvl.level} style={[s.lvlCard, {
                    backgroundColor: current
                      ? (isDark ? lvl.color+'20' : lvl.color+'12')
                      : isNext
                        ? (isDark ? lvl.color+'10' : lvl.color+'08')
                        : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                    borderColor: current
                      ? lvl.color+'60'
                      : isNext
                        ? lvl.color+'35'
                        : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                    borderWidth: current ? 2 : 1.5,
                    opacity: unlocked || isNext ? 1 : 0.42,
                  }]}>
                    {/* Level number box */}
                    <View style={[s.lvlNumBox, {backgroundColor: (isDark ? lvl.color : unlocked ? lvl.color : '#94A3B8')+'22'}]}>
                      <Text style={[s.lvlNum, {color: isDark ? lvl.color : unlocked ? lvl.color : '#94A3B8'}]}>{lvl.level}</Text>
                    </View>

                    {/* SVG Icon — matching GAM_ICONS from ProfileScreen */}
                    <View style={[s.lvlIconWrap, {
                      backgroundColor: (isDark ? lvl.color : unlocked ? lvl.color : '#94A3B8')+'15',
                      borderColor:     (isDark ? lvl.color : unlocked ? lvl.color : '#94A3B8')+'28',
                    }]}>
                      <LvlIcon color={iconColor} size={20}/>
                    </View>

                    {/* Info */}
                    <View style={{flex:1}}>
                      <View style={{flexDirection:'row', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                        <Text style={[s.lvlName, {color: isDark ? '#F1F5F9' : '#0F172A'}]}>{lvl.name}</Text>
                        {current && (
                          <View style={[s.currentTag, {backgroundColor: lvl.color+'22', borderColor: lvl.color+'44'}]}>
                            <Text style={[s.currentTagTxt, {color: lvl.color}]}>YOU</Text>
                          </View>
                        )}
                        {isNext && (
                          <View style={[s.currentTag, {backgroundColor: lvl.color+'16', borderColor: lvl.color+'30'}]}>
                            <Text style={[s.currentTagTxt, {color: isDark ? lvl.color : '#6366F1'}]}>NEXT</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[s.lvlPts, {color: isDark ? '#64748B' : '#94A3B8'}]}>
                        {unlocked ? `✓ Unlocked · ${lvl.pts.toLocaleString()} pts` : `${fmt(lvl.pts)} pts required`}
                      </Text>
                    </View>

                    {/* Lock or check */}
                    {unlocked
                      ? <Text style={{fontSize:16, color: isDark ? lvl.color : '#6366F1'}}>✓</Text>
                      : <LockIcon color={isDark ? 'rgba(255,255,255,0.25)' : '#94A3B8'} size={15}/>
                    }
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </ScreenWrapper>
  );
}

const makeStyles = (T, isDark) => StyleSheet.create({
  header:       {flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:8,paddingBottom:12},
  backBtn:      {width:38,height:38,borderRadius:12,borderWidth:1,borderColor:isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.10)',alignItems:'center',justifyContent:'center',backgroundColor:T.card},
  title:        {fontSize:18,fontWeight:'800',letterSpacing:-0.3},

  heroCard:     {marginHorizontal:14,marginBottom:20,borderRadius:22,padding:22,borderWidth:2,alignItems:'center'},
  heroBadgeWrap:{width:84,height:84,borderRadius:26,alignItems:'center',justifyContent:'center',borderWidth:1.5,marginBottom:12},
  heroLvlNum:   {fontSize:13,fontWeight:'800',letterSpacing:0.5,marginBottom:4},
  heroLvlName:  {fontSize:24,fontWeight:'800',letterSpacing:-0.4,marginBottom:4},
  heroPts:      {fontSize:13,marginBottom:16},

  xpRow:        {flexDirection:'row',alignItems:'center',gap:10,width:'100%',marginBottom:14},
  xpBg:         {flex:1,height:10,borderRadius:5,overflow:'hidden'},
  xpFill:       {height:'100%',borderRadius:5},
  xpPct:        {fontSize:13,fontWeight:'800',width:38,textAlign:'right'},

  nextLevelRow: {flexDirection:'row',alignItems:'center',gap:10,width:'100%',borderRadius:14,borderWidth:1,padding:11},
  nextIconWrap: {width:36,height:36,borderRadius:10,borderWidth:1,alignItems:'center',justifyContent:'center'},
  nextPtsPill:  {borderRadius:100,borderWidth:1,paddingHorizontal:10,paddingVertical:4},

  tierSection:  {marginHorizontal:14,marginBottom:4},
  tierHeader:   {flexDirection:'row',alignItems:'center',gap:10,marginBottom:10,marginTop:14},
  tierBadge:    {paddingHorizontal:10,paddingVertical:4,borderRadius:100,borderWidth:1},
  tierLabel:    {fontSize:10,fontWeight:'800',letterSpacing:1.2},
  tierLine:     {flex:1,height:1.5,borderRadius:1},

  lvlCard:      {flexDirection:'row',alignItems:'center',gap:10,borderRadius:16,padding:12,marginBottom:8},
  lvlNumBox:    {width:32,height:32,borderRadius:9,alignItems:'center',justifyContent:'center'},
  lvlNum:       {fontSize:12,fontWeight:'800'},
  lvlIconWrap:  {width:38,height:38,borderRadius:11,borderWidth:1,alignItems:'center',justifyContent:'center'},
  lvlName:      {fontSize:13,fontWeight:'700',marginBottom:2},
  lvlPts:       {fontSize:11,fontWeight:'500'},
  currentTag:   {paddingHorizontal:7,paddingVertical:2,borderRadius:100,borderWidth:1},
  currentTagTxt:{fontSize:9,fontWeight:'800',letterSpacing:0.8},
});