import React, {useState, useMemo} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../utils/ScreenWrapper';
import Svg, {Path, Rect, Circle, Line, Polyline, G, Defs, LinearGradient as SvgLG, Stop} from 'react-native-svg';
import {useApp}   from '../context/AppContext';
import {useTheme} from '../utils/theme';

const {width: SW} = Dimensions.get('window');
const CARD_W  = (SW - 14 * 2 - 10) / 2;
const PERIODS = ['Day', 'Week', 'Month', 'Year'];

// Unique color per position — no two categories share a color regardless of name
const CAT_PALETTE = [
  '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6',
  '#EF4444', '#06B6D4', '#F97316', '#84CC16', '#A855F7',
  '#14B8A6', '#F43F5E',
];
const catColor = (_cat, i) => CAT_PALETTE[i % CAT_PALETTE.length];

const isoDate = d => new Date(d).toISOString().slice(0, 10);
const nowDate = ()  => new Date().toISOString().slice(0, 10);

function getPeriodRange(period, offset = 0) {
  const now = new Date();
  if (period === 'Day') {
    const d = new Date(now); d.setDate(d.getDate() - offset);
    const s = new Date(d); s.setHours(0,0,0,0);
    const e = new Date(d); e.setHours(23,59,59,999);
    return {start:s, end:e};
  }
  if (period === 'Week') {
    const dow = now.getDay();
    const diff = (dow === 0 ? -6 : 1 - dow) - offset * 7;
    const s = new Date(now); s.setDate(now.getDate() + diff); s.setHours(0,0,0,0);
    const e = new Date(s); e.setDate(s.getDate() + 6); e.setHours(23,59,59,999);
    return {start:s, end:e};
  }
  if (period === 'Month') {
    const s = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const e = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0, 23,59,59,999);
    return {start:s, end:e};
  }
  const y = now.getFullYear() - offset;
  return {start: new Date(y,0,1), end: new Date(y,11,31,23,59,59,999)};
}

function filterByPeriod(expenses, period, offset = 0) {
  const {start, end} = getPeriodRange(period, offset);
  return expenses.filter(e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
}

function getPeriodLabel(period, offset = 0) {
  const now = new Date();
  if (period === 'Day') {
    if (offset === 0) return 'Today';
    if (offset === 1) return 'Yesterday';
    const d = new Date(now); d.setDate(d.getDate() - offset);
    return d.toLocaleDateString('en-US', {month:'short', day:'numeric'});
  }
  if (period === 'Week') {
    if (offset === 0) return 'This Week';
    if (offset === 1) return 'Last Week';
    return `${offset} weeks ago`;
  }
  if (period === 'Month') {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    return d.toLocaleString('default', {month:'long', year:'numeric'});
  }
  return `${now.getFullYear() - offset}`;
}

function buildBarData(expenses, period) {
  const now = new Date();
  if (period === 'Day') {
    return Array.from({length:7}, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() - (6-i));
      const ds = isoDate(d);
      const val = expenses.filter(e => !e.isIncome && e.date && isoDate(e.date) === ds).reduce((s,e)=>s+e.amount,0);
      const isToday = ds === nowDate();
      return {val, lbl: isToday ? 'Today' : d.toLocaleDateString('en-US',{weekday:'short'}).slice(0,3), isToday};
    });
  }
  if (period === 'Week') {
    const dow = now.getDay(); const diff = dow === 0 ? -6 : 1-dow;
    return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((lbl,i) => {
      const d = new Date(now); d.setDate(now.getDate()+diff+i);
      const ds = isoDate(d);
      const val = expenses.filter(e=>!e.isIncome&&e.date&&isoDate(e.date)===ds).reduce((s,e)=>s+e.amount,0);
      return {val, lbl, isToday: ds===nowDate()};
    });
  }
  if (period === 'Month') {
    const days = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    return Array.from({length:days}, (_,i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i+1);
      const ds = isoDate(d);
      const val = expenses.filter(e=>!e.isIncome&&e.date&&isoDate(e.date)===ds).reduce((s,e)=>s+e.amount,0);
      return {val, lbl:`${i+1}`, isToday: ds===nowDate()};
    });
  }
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return MONTHS.map((lbl,m) => {
    const s = new Date(now.getFullYear(),m,1);
    const e = new Date(now.getFullYear(),m+1,0,23,59,59,999);
    const val = expenses.filter(ex=>!ex.isIncome&&ex.date&&new Date(ex.date)>=s&&new Date(ex.date)<=e).reduce((sum,ex)=>sum+ex.amount,0);
    return {val, lbl, isToday: m===now.getMonth()};
  });
}

function getCats(expenses) {
  const map = {};
  expenses.filter(e=>!e.isIncome).forEach(e=>{map[e.cat]=(map[e.cat]||0)+e.amount;});
  return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5);
}

function comparisonMsg(currSpent, prevSpent, period, fmt, T) {
  const prevLabel = getPeriodLabel(period, 1);
  if (!prevSpent&&!currSpent) return {txt:'No spending data yet', col:T.muted};
  if (!prevSpent) return {txt:`First ${period.toLowerCase()} on record`, col:T.primary};
  const diff = currSpent-prevSpent;
  const diffPct = Math.abs(Math.round((diff/prevSpent)*100));
  if (diff===0) return {txt:`Exactly the same as ${prevLabel}`, col:T.muted};
  if (diff>0) return {txt:`↑ Spent ${fmt(Math.abs(diff))} more than ${prevLabel}`, col:'#EF4444'};
  return {txt:`↓ Saved ${fmt(Math.abs(diff))} compared to ${prevLabel} · ${diffPct}% less`, col:'#22C55E'};
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconSpent  = ({color,size=20}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" stroke={color} strokeWidth={1.8}/><Path d="M9 12h6M12 9v6" stroke={color} strokeWidth={1.8} strokeLinecap="round"/></Svg>);
const IconTxn    = ({color,size=20}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="3" width="18" height="18" rx="3" stroke={color} strokeWidth={1.8}/><Line x1="7" y1="8" x2="17" y2="8" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Line x1="7" y1="12" x2="17" y2="12" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Line x1="7" y1="16" x2="13" y2="16" stroke={color} strokeWidth={1.8} strokeLinecap="round"/></Svg>);
const IconAvg    = ({color,size=20}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const IconTag    = ({color,size=20}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Line x1="7" y1="7" x2="7.01" y2="7" stroke={color} strokeWidth={2.5} strokeLinecap="round"/></Svg>);
const IconExport = ({color='#4ADE80',size=18}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth={2} strokeLinecap="round"/>
    <Polyline points="17 8 12 3 7 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Line x1="12" y1="3" x2="12" y2="15" stroke={color} strokeWidth={2} strokeLinecap="round"/>
  </Svg>
);

// ─── Empty state illustrations ────────────────────────────────────────────────
const EmptyBudget = ({color}) => (
  <Svg width={90} height={90} viewBox="0 0 90 90" fill="none">
    <Circle cx="45" cy="45" r="30" stroke={color+'30'} strokeWidth="10" strokeDasharray="6 4" fill="none"/>
    <Circle cx="45" cy="45" r="16" fill={color+'12'} stroke={color+'35'} strokeWidth="1.5"/>
    <Path d="M41 38c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.8-1.6 2.8-3.2 3.6V44" stroke={color+'90'} strokeWidth="2.2" strokeLinecap="round"/>
    <Circle cx="45" cy="47.5" r="1.3" fill={color+'90'}/>
    <Line x1="45" y1="8"  x2="45" y2="13" stroke={color+'45'} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="45" y1="77" x2="45" y2="82" stroke={color+'45'} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="8"  y1="45" x2="13" y2="45" stroke={color+'45'} strokeWidth="2" strokeLinecap="round"/>
    <Line x1="77" y1="45" x2="82" y2="45" stroke={color+'45'} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const EmptyCategories = ({color}) => (
  <Svg width={90} height={76} viewBox="0 0 90 76" fill="none">
    <Rect x="8"  y="24" width="14" height="44" rx="4" stroke={color+'35'} strokeWidth="1.5" strokeDasharray="4 3" fill={color+'08'}/>
    <Rect x="28" y="36" width="14" height="32" rx="4" stroke={color+'35'} strokeWidth="1.5" strokeDasharray="4 3" fill={color+'08'}/>
    <Rect x="48" y="44" width="14" height="24" rx="4" stroke={color+'35'} strokeWidth="1.5" strokeDasharray="4 3" fill={color+'08'}/>
    <Rect x="68" y="52" width="14" height="16" rx="4" stroke={color+'35'} strokeWidth="1.5" strokeDasharray="4 3" fill={color+'08'}/>
    <Line x1="4" y1="70" x2="86" y2="70" stroke={color+'30'} strokeWidth="1.5" strokeLinecap="round"/>
    <Circle cx="45" cy="16" r="10" fill={color+'14'} stroke={color+'45'} strokeWidth="1.5"/>
    <Path d="M41 16h8M45 12v8" stroke={color+'80'} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

// ─── Export → Pro upgrade popup ───────────────────────────────────────────────
function ExportProModal({visible, onClose, isDark}) {
  const sheetBg     = isDark ? 'rgba(15,15,24,0.95)'   : 'rgba(255,255,255,0.97)';
  const sheetBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const MTXT        = isDark ? '#F1F5F9' : '#1A1412';
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={{flex:1, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'center', alignItems:'center', paddingHorizontal:32}}
        activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={()=>{}}
          style={{
            backgroundColor:sheetBg, borderRadius:20, borderWidth:1,
            borderColor:sheetBorder, paddingVertical:20, paddingHorizontal:24,
            alignItems:'center', shadowColor:'#000',
            shadowOffset:{width:0,height:10}, shadowOpacity:0.20, shadowRadius:20, elevation:16,
          }}>
          <Text style={{fontSize:15, fontWeight:'700', color:MTXT, textAlign:'center', lineHeight:22}}>
            👑 Upgrade to Pro to export your reports as CSV & PDF
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const {state} = useApp();
  const T       = useTheme(state.isDarkMode);
  const s       = makeStyles(T);
  const isDark  = state.isDarkMode;

  const [period,     setPeriod]     = useState('Month');
  const [showExport, setShowExport] = useState(false);

  const sym  = state.currency.symbol;
  const rate = state.currency.rate;
  const fmt  = v => `${sym} ${Number(v * rate).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

  const currExp   = useMemo(() => filterByPeriod(state.expenses, period, 0), [state.expenses, period]);
  const prevExp   = useMemo(() => filterByPeriod(state.expenses, period, 1), [state.expenses, period]);

  const currSpent  = currExp.filter(e=>!e.isIncome).reduce((a,b)=>a+b.amount,0);
  const prevSpent  = prevExp.filter(e=>!e.isIncome).reduce((a,b)=>a+b.amount,0);
  const currTxnCnt = currExp.filter(e=>!e.isIncome).length;

  const budget = state.budgets?.monthly || 0;

  // ── FIX: Budget Health gauge ──────────────────────────────────────────────
  // Show empty/no-data when:
  //   • budget is 0 (not set) — division by zero would give Infinity → 100%
  //   • currSpent is also 0 — nothing to display yet
  // Only compute a real percentage when BOTH budget > 0 AND currSpent > 0.
  const hasBudgetData = budget > 0 && currSpent > 0;
  const gaugeVal      = hasBudgetData
    ? Math.min(100, Math.round((currSpent / budget) * 100))
    : 0;

  const gaugeStatus = (() => {
    // No budget set OR no spending yet → show "No Data" with neutral colour
    if (!hasBudgetData) return {lbl: 'No Data', col: T.muted};
    if (gaugeVal < 40)  return {lbl: 'Excellent',   col: '#22C55E'};
    if (gaugeVal < 65)  return {lbl: 'On Track',    col: T.primary};
    if (gaugeVal < 85)  return {lbl: 'Caution',     col: '#F59E0B'};
    if (gaugeVal < 100) return {lbl: 'High Spend',  col: '#F97316'};
    return                     {lbl: 'Over Budget', col: '#EF4444'};
  })();

  const avgDivisor = {Day:1, Week:7, Month:30, Year:12}[period];
  const periodAvg  = currSpent / avgDivisor;
  const avgLabel   = period === 'Year' ? 'MONTHLY AVG' : 'DAILY AVG';

  const cats     = useMemo(() => getCats(currExp), [currExp]);
  const catTotal = cats.reduce((s,[,v])=>s+v,0) || 1;
  const topCat   = cats[0]?.[0] ?? '—';

  const barData = useMemo(() => buildBarData(state.expenses, period), [state.expenses, period]);
  const barMax  = Math.max(...barData.map(b=>b.val), 1);

  const diff    = currSpent - prevSpent;
  const diffPct = prevSpent > 0 ? Math.abs(Math.round((diff/prevSpent)*100)) : 0;
  const isUp    = diff > 0;
  const cmpMsg  = comparisonMsg(currSpent, prevSpent, period, fmt, T);

  const currLabel = getPeriodLabel(period, 0);
  const prevLabel = getPeriodLabel(period, 1);

  const cardBase = {
    borderRadius:18, borderWidth:1.5,
    borderColor: isDark?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.10)',
    backgroundColor: T.card,
  };

  const emptyColor = isDark ? '#A3E635' : '#6366F1';

  const miniCards = [
    {
      icon: <IconSpent color={isDark?'#A3E635':'#6366F1'} size={20}/>,
      label:'TOTAL SPENT', value:fmt(currSpent),
      trend:`${currTxnCnt} transaction${currTxnCnt!==1?'s':''}`, tCol:T.primary,
      bg:isDark?'rgba(163,230,53,0.10)':'rgba(99,102,241,0.08)',
      bc:isDark?'rgba(163,230,53,0.20)':'rgba(99,102,241,0.16)',
    },
    {
      icon: <IconTxn color={isDark?'#60A5FA':'#3B82F6'} size={20}/>,
      label:'TRANSACTIONS', value:`${currTxnCnt}`,
      trend:currTxnCnt>0?`${fmt(currSpent/currTxnCnt)} avg/txn`:'None yet',
      tCol:isDark?'#60A5FA':'#3B82F6',
      bg:isDark?'rgba(96,165,250,0.10)':'rgba(59,130,246,0.08)',
      bc:isDark?'rgba(96,165,250,0.20)':'rgba(59,130,246,0.16)',
    },
    {
      icon: <IconAvg color={isDark?'#F59E0B':'#D97706'} size={20}/>,
      label:avgLabel, value:fmt(periodAvg),
      trend:prevSpent>0?(isUp?`↑ ${diffPct}% vs ${prevLabel}`:`↓ ${diffPct}% vs ${prevLabel}`):'First period',
      tCol:isUp?'#EF4444':'#22C55E',
      bg:isDark?'rgba(245,158,11,0.10)':'rgba(217,119,6,0.08)',
      bc:isDark?'rgba(245,158,11,0.20)':'rgba(217,119,6,0.16)',
    },
    {
      icon: <IconTag color={isDark?'#F472B6':'#DB2777'} size={20}/>,
      label:'TOP CATEGORY', value:topCat,
      trend:cats[0]?`${fmt(cats[0][1])} · ${Math.round((cats[0][1]/catTotal)*100)}%`:'No data',
      tCol:catColor(topCat,0),
      bg:isDark?'rgba(244,114,182,0.10)':'rgba(219,39,119,0.08)',
      bc:isDark?'rgba(244,114,182,0.20)':'rgba(219,39,119,0.16)',
    },
  ];

  return (
    <ScreenWrapper isDarkMode={isDark}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:8}}>

        {/* Topbar */}
        <View style={s.topbar}>
          <Text style={[s.title, {color:T.text}]}>Analytics</Text>
          <TouchableOpacity
            style={[s.ib, {borderColor: isDark?'rgba(163,230,53,0.30)':'rgba(99,102,241,0.30)'}]}
            onPress={() => setShowExport(true)}
            activeOpacity={0.80}>
            <IconExport color={isDark?'#A3E635':'#6366F1'} size={17}/>
          </TouchableOpacity>
        </View>

        {/* Period Tabs */}
        <View style={[s.tabs, {backgroundColor:T.card, borderColor:isDark?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.10)'}]}>
          {PERIODS.map(p => (
            <TouchableOpacity key={p}
              style={[s.tab, period===p && {backgroundColor:isDark?'rgba(163,230,53,0.15)':'rgba(99,102,241,0.12)',borderRadius:9}]}
              onPress={()=>setPeriod(p)}>
              <Text style={[s.tabTxt, {color:period===p?T.primary:T.muted}]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Period header */}
        <Text style={[s.periodLbl, {color:T.muted}]}>{currLabel.toUpperCase()}</Text>
        <Text style={[s.totalVal,  {color:T.text}]}>{fmt(currSpent)}</Text>
        <Text style={[s.cmpMsg,    {color:cmpMsg.col}]}>{cmpMsg.txt}</Text>

        {/* Mini Grid */}
        <View style={s.miniGrid}>
          {miniCards.map(({icon,label,value,trend,tCol,bg,bc}) => (
            <View key={label} style={[s.mc, {width:CARD_W, backgroundColor:bg, borderColor:bc, borderWidth:1.5, borderRadius:18}]}>
              <View style={s.mcTop}>
                <View style={s.mcIconBox}>{icon}</View>
                <Text style={[s.mcLabel, {color:T.muted}]}>{label}</Text>
              </View>
              <Text style={[s.mcValue, {color:T.text}]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
              <Text style={[s.mcTrend, {color:tCol}]}   numberOfLines={1}>{trend}</Text>
            </View>
          ))}
        </View>

        {/* ── Budget Health Card ───────────────────────────────────────────── */}
        <View style={[s.card, cardBase]}>
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, {color:T.text}]}>Budget Health</Text>
            {/* Only show the status chip when there is real data */}
            {hasBudgetData && (
              <View style={[s.statusChip, {backgroundColor:gaugeStatus.col+'20', borderColor:gaugeStatus.col+'55'}]}>
                <Text style={[s.statusTxt, {color:gaugeStatus.col}]}>{gaugeStatus.lbl}</Text>
              </View>
            )}
          </View>

          {hasBudgetData ? (
            /* ── Has budget AND spending → show gauge ── */
            <>
              <View style={s.gaugeRow}>
                <View style={[s.gaugeBg, {flex:1}]}>
                  <View style={[s.gaugeFill, {width:`${gaugeVal}%`, backgroundColor:gaugeStatus.col}]}/>
                </View>
                <Text style={[s.gaugePct, {color:T.text}]}>{gaugeVal}%</Text>
              </View>
              <Text style={[s.gaugeSub, {color:T.muted}]}>
                {fmt(currSpent)} spent · {fmt(budget)} monthly budget
              </Text>
            </>
          ) : (
            /* ── No budget set or no spending yet → empty bar + helpful hint ── */
            <>
              {/* Empty gauge bar — hollow track, no fill, no percentage label */}
              <View style={s.gaugeRow}>
                <View style={[s.gaugeBg, {flex:1, backgroundColor:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'}]}>
                  {/* intentionally empty — no fill */}
                </View>
              </View>
              <Text style={[s.gaugeSub, {color:T.muted}]}>
                {budget === 0
                  ? 'Set a monthly budget in Profile → Budget Settings'
                  : 'No expenses recorded for this period yet'}
              </Text>
            </>
          )}

          {/* Category breakdown — only when there is expense data */}
          {cats.length > 0 ? (
            <>
              <Text style={[s.catBarTitle, {color:T.muted}]}>Category Contribution</Text>
              <View style={[s.stackedBar, {backgroundColor:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}]}>
                {cats.map(([cat,amt],i) => {
                  const pct = Math.round((amt/catTotal)*100);
                  const col = catColor(cat,i);
                  return (
                    <View key={cat} style={{
                      width:`${pct}%`, height:'100%', backgroundColor:col,
                      borderTopLeftRadius:i===0?7:0, borderBottomLeftRadius:i===0?7:0,
                      borderTopRightRadius:i===cats.length-1?7:0, borderBottomRightRadius:i===cats.length-1?7:0,
                    }}/>
                  );
                })}
              </View>
              <View style={s.catLegend}>
                {cats.map(([cat,amt],i) => {
                  const pct   = Math.round((amt/catTotal)*100);
                  const col   = catColor(cat,i);
                  const emoji = state.expenses.find(e=>e.cat===cat)?.emoji || '📦';
                  return (
                    <View key={cat} style={s.catLegendRow}>
                      <View style={[s.catDot, {backgroundColor:col}]}/>
                      <Text style={{fontSize:13}}>{emoji}</Text>
                      <Text style={[s.catLegendName, {color:T.text}]}>{cat}</Text>
                      <View style={[s.catBarBg, {backgroundColor:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'}]}>
                        <View style={[s.catBarFill, {width:`${pct}%`, backgroundColor:col}]}/>
                      </View>
                      <Text style={[s.catPct, {color:col}]}>{pct}%</Text>
                      <Text style={[s.catAmt, {color:T.muted}]}>{fmt(amt)}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={s.emptyBox}>
              <EmptyBudget color={emptyColor}/>
              <Text style={[s.emptyTxt,  {color:T.muted}]}>No expense data for this {period.toLowerCase()}</Text>
              <Text style={[s.emptyHint, {color:T.muted2||T.muted}]}>Add transactions to see your budget health</Text>
            </View>
          )}
        </View>

        {/* ── Spending Trend ───────────────────────────────────────────────── */}
        <View style={[s.card, cardBase]}>
          <Text style={[s.cardTitle, {color:T.text, marginBottom:14}]}>Spending Trend</Text>
          {period === 'Month' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{flexDirection:'row', alignItems:'flex-end', height:90, gap:3, paddingRight:8}}>
                {barData.map((bar,i) => {
                  const h = barMax>0?Math.max(4,Math.round((bar.val/barMax)*80)):4;
                  const isMax = bar.val>0&&bar.val===Math.max(...barData.map(b=>b.val));
                  const col = bar.isToday?(isDark?'#A3E635':'#6366F1'):isMax?(isDark?'rgba(163,230,53,0.55)':'rgba(99,102,241,0.55)'):bar.val>0?(isDark?'rgba(163,230,53,0.25)':'rgba(99,102,241,0.25)'):(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)');
                  const showLbl = i===0||(i+1)%5===0||bar.isToday;
                  return (
                    <View key={i} style={{alignItems:'center', gap:3, width:13}}>
                      <View style={{height:h, width:9, borderRadius:3, backgroundColor:col}}/>
                      <Text style={{fontSize:7, color:bar.isToday?T.primary:T.muted}}>{showLbl?bar.lbl:''}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <View style={{flexDirection:'row', alignItems:'flex-end', height:90, gap:4}}>
              {barData.map((bar,i) => {
                const h = barMax>0?Math.max(4,Math.round((bar.val/barMax)*80)):4;
                const isMax = bar.val>0&&bar.val===Math.max(...barData.map(b=>b.val));
                const col = bar.isToday?(isDark?'#A3E635':'#6366F1'):isMax?(isDark?'rgba(163,230,53,0.55)':'rgba(99,102,241,0.55)'):bar.val>0?(isDark?'rgba(163,230,53,0.22)':'rgba(99,102,241,0.22)'):(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)');
                return (
                  <View key={i} style={{flex:1, alignItems:'center', gap:3}}>
                    <View style={{height:h, width:'90%', borderRadius:4, backgroundColor:col}}/>
                    <Text style={{fontSize:8, color:bar.isToday?T.primary:T.muted}}>{bar.lbl}</Text>
                  </View>
                );
              })}
            </View>
          )}
          <View style={{flexDirection:'row', gap:14, marginTop:10}}>
            {[
              {col:isDark?'#A3E635':'#6366F1',                            lbl:period==='Year'?'Current month':'Today'},
              {col:isDark?'rgba(163,230,53,0.55)':'rgba(99,102,241,0.55)',lbl:'Highest day'},
              {col:isDark?'rgba(163,230,53,0.22)':'rgba(99,102,241,0.22)',lbl:'Other days'},
            ].map(({col,lbl}) => (
              <View key={lbl} style={{flexDirection:'row', alignItems:'center', gap:5}}>
                <View style={{width:8, height:8, borderRadius:2, backgroundColor:col}}/>
                <Text style={{fontSize:10, color:T.muted}}>{lbl}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Period Comparison ─────────────────────────────────────────────── */}
        <Text style={[s.sl, {color:T.muted}]}>Period Comparison</Text>
        <View style={{flexDirection:'row', gap:10, marginHorizontal:14, marginBottom:14}}>
          <View style={[s.cmpCard, cardBase, {flex:1}]}>
            <Text style={[s.cmpPeriodTag, {color:T.primary, borderColor:T.primary+'44', backgroundColor:T.primary+'14'}]}>{currLabel}</Text>
            <Text style={[s.cmpVal, {color:T.text}]}>{fmt(currSpent)}</Text>
            <Text style={[s.cmpSub, {color:T.muted}]}>{currTxnCnt} txns</Text>
            {prevSpent>0&&(
              <Text style={[s.cmpDiff, {color:isUp?'#EF4444':'#22C55E', backgroundColor:isUp?'rgba(239,68,68,0.10)':'rgba(34,197,94,0.10)'}]}>
                {isUp?`↑ ${diffPct}% more`:`↓ ${diffPct}% less`}
              </Text>
            )}
          </View>
          <View style={[s.cmpCard, cardBase, {flex:1}]}>
            <Text style={[s.cmpPeriodTag, {color:T.muted, borderColor:T.muted+'44', backgroundColor:T.muted+'14'}]}>{prevLabel}</Text>
            <Text style={[s.cmpVal, {color:T.text}]}>{fmt(prevSpent)}</Text>
            <Text style={[s.cmpSub, {color:T.muted}]}>{prevExp.filter(e=>!e.isIncome).length} txns</Text>
            <Text style={[s.cmpDiff, {color:T.muted, backgroundColor:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.06)'}]}>baseline</Text>
          </View>
        </View>

        {/* ── Top Categories ────────────────────────────────────────────────── */}
        <Text style={[s.sl, {color:T.muted}]}>Top Categories · {currLabel}</Text>
        {cats.length === 0 ? (
          <View style={[s.card, cardBase]}>
            <View style={s.emptyBox}>
              <EmptyCategories color={emptyColor}/>
              <Text style={[s.emptyTxt,  {color:T.muted}]}>No expenses for this period</Text>
              <Text style={[s.emptyHint, {color:T.muted2||T.muted}]}>Start logging transactions to see category breakdown</Text>
            </View>
          </View>
        ) : cats.map(([cat,amt],i) => {
          const pct   = Math.round((amt/catTotal)*100);
          const col   = catColor(cat,i);
          const emoji = state.expenses.find(e=>e.cat===cat)?.emoji || '📦';
          return (
            <View key={cat} style={[s.catRow, cardBase]}>
              <View style={[s.catRowIcon, {backgroundColor:col+'22'}]}>
                <Text style={{fontSize:16}}>{emoji}</Text>
              </View>
              <View style={{flex:1}}>
                <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:6}}>
                  <Text style={{color:T.text, fontWeight:'700', fontSize:13}}>{cat}</Text>
                  <Text style={{color:T.muted, fontSize:11, fontWeight:'600'}}>{pct}%</Text>
                </View>
                <View style={[s.gaugeBg, {height:6, backgroundColor:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'}]}>
                  <View style={[s.gaugeFill, {width:`${pct}%`, height:6, backgroundColor:col}]}/>
                </View>
              </View>
              <Text style={{color:T.text, fontWeight:'800', fontSize:13, marginLeft:12}}>{fmt(amt)}</Text>
            </View>
          );
        })}

      </ScrollView>

      {/* Export Pro Modal */}
      <ExportProModal
        visible={showExport}
        onClose={() => setShowExport(false)}
        isDark={isDark}
      />
    </ScreenWrapper>
  );
}

const makeStyles = T => StyleSheet.create({
  topbar:      {flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:18, paddingTop:12},
  title:       {fontSize:18, fontWeight:'800'},
  ib:          {width:36, height:36, borderRadius:11, borderWidth:1, backgroundColor:T.card, alignItems:'center', justifyContent:'center'},
  tabs:        {flexDirection:'row', borderRadius:12, marginHorizontal:14, marginBottom:14, padding:3, borderWidth:1},
  tab:         {flex:1, height:32, alignItems:'center', justifyContent:'center'},
  tabTxt:      {fontSize:11, fontWeight:'800'},
  periodLbl:   {paddingHorizontal:14, fontSize:10, fontWeight:'800', letterSpacing:0.8, marginBottom:4},
  totalVal:    {paddingHorizontal:14, fontSize:36, fontWeight:'800', letterSpacing:-1, marginBottom:3},
  cmpMsg:      {paddingHorizontal:14, fontSize:13, fontWeight:'700', marginBottom:14},
  miniGrid:    {flexDirection:'row', flexWrap:'wrap', gap:10, marginHorizontal:14, marginBottom:14},
  mc:          {padding:14},
  mcTop:       {flexDirection:'row', alignItems:'center', gap:8, marginBottom:10},
  mcIconBox:   {width:32, height:32, borderRadius:9, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.06)'},
  mcLabel:     {fontSize:10, fontWeight:'800', letterSpacing:0.6, flex:1},
  mcValue:     {fontSize:20, fontWeight:'800', letterSpacing:-0.5, marginBottom:5},
  mcTrend:     {fontSize:11, fontWeight:'700'},
  card:        {marginHorizontal:14, marginBottom:12, padding:16},
  cardHeader:  {flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14},
  cardTitle:   {fontSize:14, fontWeight:'800'},
  statusChip:  {borderRadius:100, paddingVertical:3, paddingHorizontal:10, borderWidth:1},
  statusTxt:   {fontSize:10, fontWeight:'800'},
  gaugeRow:    {flexDirection:'row', alignItems:'center', gap:12, marginBottom:5},
  gaugeBg:     {height:12, borderRadius:100, overflow:'hidden', backgroundColor:'rgba(0,0,0,0.07)'},
  gaugeFill:   {height:'100%', borderRadius:100},
  gaugePct:    {fontSize:16, fontWeight:'800', minWidth:40, textAlign:'right'},
  gaugeSub:    {fontSize:11, marginBottom:14},
  catBarTitle: {fontSize:10, fontWeight:'800', letterSpacing:0.6, textTransform:'uppercase', marginBottom:10},
  stackedBar:  {height:16, borderRadius:8, flexDirection:'row', overflow:'hidden', marginBottom:14},
  catLegend:   {gap:10},
  catLegendRow:{flexDirection:'row', alignItems:'center', gap:7},
  catDot:      {width:8, height:8, borderRadius:4, flexShrink:0},
  catLegendName:{fontSize:12, fontWeight:'700', width:80},
  catBarBg:    {flex:1, height:5, borderRadius:3, overflow:'hidden'},
  catBarFill:  {height:'100%', borderRadius:3},
  catPct:      {fontSize:11, fontWeight:'800', width:30, textAlign:'right'},
  catAmt:      {fontSize:10, fontWeight:'600', width:58, textAlign:'right'},
  emptyBox:    {alignItems:'center', paddingVertical:20},
  emptyTxt:    {fontSize:13, fontWeight:'700', marginTop:10, marginBottom:4},
  emptyHint:   {fontSize:11, textAlign:'center', paddingHorizontal:16},
  sl:          {paddingHorizontal:14, fontSize:10, letterSpacing:0.8, textTransform:'uppercase', fontWeight:'800', marginBottom:8},
  cmpCard:     {padding:14},
  cmpPeriodTag:{fontSize:9, fontWeight:'800', borderRadius:100, borderWidth:1, paddingVertical:3, paddingHorizontal:8, alignSelf:'flex-start', marginBottom:8, letterSpacing:0.4},
  cmpVal:      {fontSize:20, fontWeight:'800', marginBottom:3},
  cmpSub:      {fontSize:11, marginBottom:8},
  cmpDiff:     {fontSize:10, fontWeight:'800', borderRadius:100, paddingVertical:3, paddingHorizontal:8, alignSelf:'flex-start'},
  catRow:      {flexDirection:'row', alignItems:'center', gap:10, marginHorizontal:14, marginBottom:8, padding:12},
  catRowIcon:  {width:38, height:38, borderRadius:11, alignItems:'center', justifyContent:'center'},
});