// ProfileScreen.js
import React, {useState, useMemo} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Path, Circle, Line, Rect} from 'react-native-svg';
import ScreenWrapper from '../utils/ScreenWrapper';
import {useApp} from '../context/AppContext';
import {useTheme} from '../utils/theme';
import {CURRENCIES, GAMIFICATION_LEVELS, FAQ_DATA} from '../data/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
function RoundedAlert({visible, icon, title, message, buttons, isDark}) {
  if (!visible) return null;
  const bg      = isDark ? '#1A1A2E' : '#FFFFFF';
  const text    = isDark ? '#F1F5F9' : '#0F172A';
  const muted   = isDark ? '#94A3B8' : '#64748B';
  const divider = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)';
  const accent  = isDark ? '#A3E635' : '#6366F1';

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={alertS.overlay}>
        <View style={[alertS.card, {backgroundColor: bg}]}>
          {icon ? <Text style={alertS.icon}>{icon}</Text> : null}
          <Text style={[alertS.title, {color: text}]}>{title}</Text>
          {message ? (
            <Text style={[alertS.message, {color: muted}]}>{message}</Text>
          ) : null}
          <View style={[alertS.divider, {backgroundColor: divider}]} />
          <View style={alertS.btnRow}>
            {(buttons || []).map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  alertS.btn,
                  i > 0 && {borderLeftWidth: 1, borderLeftColor: divider},
                ]}
                onPress={btn.onPress}
                activeOpacity={0.7}>
                <Text
                  style={[
                    alertS.btnText,
                    {color: btn.style === 'destructive' ? '#EF4444' : accent},
                    btn.style !== 'cancel' && {fontWeight: '800'},
                  ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const alertS = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '80%',
    borderRadius: 24,
    paddingTop: 28,
    paddingHorizontal: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 14},
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 20,
  },
  icon:    {fontSize: 36, textAlign: 'center', marginBottom: 10},
  title:   {fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 6, letterSpacing: 0.1},
  message: {fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 4},
  divider: {height: 1, marginTop: 20, marginHorizontal: -22},
  btnRow:  {flexDirection: 'row'},
  btn:     {flex: 1, paddingVertical: 15, alignItems: 'center', justifyContent: 'center'},
  btnText: {fontSize: 15, fontWeight: '600'},
});

// ─── Hook that drives the custom alert ───────────────────────────────────────
function useAlert(isDark) {
  const [cfg, setCfg] = useState(null);

  function showAlert({icon, title, message, buttons}) {
    setCfg({
      icon,
      title,
      message,
      buttons: buttons || [{text: 'OK', style: 'default', onPress: null}],
    });
  }

  const alertNode = cfg ? (
    <RoundedAlert
      visible
      icon={cfg.icon}
      title={cfg.title}
      message={cfg.message}
      isDark={isDark}
      buttons={cfg.buttons.map(b => ({
        ...b,
        onPress: () => {
          setCfg(null);
          if (b.onPress) b.onPress();
        },
      }))}
    />
  ) : null;

  return [showAlert, alertNode];
}

// ─── Menu SVG Icons ───────────────────────────────────────────────────────────
const IcEdit    = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><Path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const IcCurrency= ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={1.8}/><Path d="M14.5 9.5a3 3 0 100 5H9.5" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M12 7v10" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></Svg>);
const IcBudget  = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x="2" y="3" width="20" height="18" rx="3" stroke={c} strokeWidth={1.8}/><Path d="M2 9h20" stroke={c} strokeWidth={1.8}/><Path d="M7 15h4M15 15h2" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 12h2" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></Svg>);
const IcCrown   = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M2 19h20M3 19L5 9l4 5 3-8 3 8 4-5 2 10H3z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const IcPalette = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.8 1.5-1.5 0-.4-.2-.8-.4-1.1-.2-.3-.4-.7-.4-1.1 0-.8.7-1.5 1.5-1.5H17c2.8 0 5-2.2 5-5C22 6.2 17.5 2 12 2z" stroke={c} strokeWidth={1.8}/><Circle cx="7" cy="12" r="1.2" fill={c}/><Circle cx="9.5" cy="7.5" r="1.2" fill={c}/><Circle cx="14.5" cy="7.5" r="1.2" fill={c}/><Circle cx="17" cy="12" r="1.2" fill={c}/></Svg>);
const IcLock    = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x="3" y="11" width="18" height="11" rx="3" stroke={c} strokeWidth={1.8}/><Path d="M7 11V7a5 5 0 0110 0v4" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Circle cx="12" cy="16" r="1.5" fill={c}/></Svg>);
const IcBell    = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M18 8a6 6 0 10-12 0c0 5-3 7-3 7h18s-3-2-3-7" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/><Path d="M13.73 21a2 2 0 01-3.46 0" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const IcHelp    = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={c} strokeWidth={1.8}/><Path d="M9 9a3 3 0 015.12 2.1C14 12.6 12 13 12 14" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Circle cx="12" cy="17" r="1" fill={c}/></Svg>);
const IcInfo    = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={c} strokeWidth={1.8}/><Path d="M12 16v-4M12 8h.01" stroke={c} strokeWidth={2} strokeLinecap="round"/></Svg>);

// ─── Pro Modal SVG Gem ────────────────────────────────────────────────────────
const IcProGem = ({size=52, isDark}) => {
  const top = isDark ? '#A3E635' : '#7C3AED';
  const mid = isDark ? '#84CC16' : '#6D28D9';
  const bot = isDark ? '#65A30D' : '#5B21B6';
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <Path d="M26 6 L14 20 L26 16 Z" fill={top} opacity={0.9}/>
      <Path d="M26 6 L38 20 L26 16 Z" fill={top} opacity={0.75}/>
      <Path d="M6 20 L14 20 L26 16 L26 6 Z" fill={mid} opacity={0.6}/>
      <Path d="M46 20 L38 20 L26 16 L26 6 Z" fill={mid} opacity={0.5}/>
      <Path d="M6 20 L14 20 L26 46 Z"  fill={bot} opacity={0.85}/>
      <Path d="M46 20 L38 20 L26 46 Z" fill={bot} opacity={0.7}/>
      <Path d="M14 20 L38 20 L26 46 Z" fill={top} opacity={0.55}/>
      <Path d="M26 6 L38 20 L46 20 L26 46 L6 20 L14 20 Z" stroke={top} strokeWidth={1.4} strokeLinejoin="round" fill="none"/>
      <Path d="M6 20 H46" stroke={top} strokeWidth={0.8} opacity={0.4}/>
      <Path d="M14 20 L26 16 L38 20" stroke={top} strokeWidth={0.8} opacity={0.35} fill="none"/>
    </Svg>
  );
};

// ─── Personality Icons ────────────────────────────────────────────────────────
const IconCritical      = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2L2 19h20L12 2z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color+'20'}/><Line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth={2} strokeLinecap="round"/><Circle cx="12" cy="16.5" r="1.1" fill={color}/></Svg>);
const IconFreeSpirit    = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M2 11c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><Path d="M2 16c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/></Svg>);
const IconActiveSpender = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="2" y="6" width="20" height="13" rx="3" stroke={color} strokeWidth={1.8} fill={color+'15'}/><Path d="M2 10h20" stroke={color} strokeWidth={1.8}/><Path d="M6 15h4M15 15h3" stroke={color} strokeWidth={1.8} strokeLinecap="round"/></Svg>);
const IconBalanced      = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 3v18M5 21h14" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M5 9l-3 5h6L5 9z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={color+'18'}/><Path d="M19 9l-3 5h6L19 9z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={color+'18'}/><Path d="M5 9h14" stroke={color} strokeWidth={1.5} strokeLinecap="round"/></Svg>);
const IconSmartPlanner  = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="4" width="18" height="17" rx="3" stroke={color} strokeWidth={1.8} fill={color+'12'}/><Path d="M3 9h18" stroke={color} strokeWidth={1.8}/><Path d="M8 3v3M16 3v3" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M8 14l2.5 2.5L16 12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const IconMindful       = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} fill={color+'10'}/><Path d="M9 11c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke={color} strokeWidth={1.6} strokeLinecap="round"/><Path d="M12 11v4" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M10 15h4" stroke={color} strokeWidth={1.5} strokeLinecap="round"/></Svg>);
const IconWealthBuilder = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="13" width="4" height="8" rx="1" fill={color+'25'} stroke={color} strokeWidth={1.5}/><Rect x="10" y="9" width="4" height="12" rx="1" fill={color+'35'} stroke={color} strokeWidth={1.5}/><Rect x="17" y="5" width="4" height="16" rx="1" fill={color+'50'} stroke={color} strokeWidth={1.5}/><Path d="M5 6l4-3 4 2 4-4" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/><Path d="M17 3h2v2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const IconEliteSaver    = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2L2 9l10 13L22 9z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color+'18'}/><Path d="M2 9h20" stroke={color} strokeWidth={1.5}/><Path d="M7 9l5-7 5 7" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const IconGuru          = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M8 21h8M12 17v4" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 4H4a1 1 0 00-1 1v3a4 4 0 003 3.87" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M17 4h3a1 1 0 011 1v3a4 4 0 01-3 3.87" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 4h10v6a5 5 0 01-10 0V4z" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill={color+'15'}/><Path d="M10 9l1.5 1.5L14 8" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const IconMoneyMaster   = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 17L5 8l4.5 4.5L12 4l2.5 8.5L19 8l2 9H3z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color+'20'}/><Path d="M3 17h18" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Circle cx="5" cy="8" r="1.2" fill={color}/><Circle cx="12" cy="4" r="1.2" fill={color}/><Circle cx="19" cy="8" r="1.2" fill={color}/></Svg>);

function getPersonalitySvg(rate) {
  if (rate >= 65) return {SvgIcon:IconMoneyMaster,  color:'#A3E635', label:'Money Master'};
  if (rate >= 50) return {SvgIcon:IconGuru,          color:'#6366F1', label:'Financial Guru'};
  if (rate >= 40) return {SvgIcon:IconEliteSaver,    color:'#14B8A6', label:'Elite Saver'};
  if (rate >= 35) return {SvgIcon:IconWealthBuilder, color:'#10B981', label:'Wealth Builder'};
  if (rate >= 30) return {SvgIcon:IconMindful,       color:'#22C55E', label:'Mindful Spender'};
  if (rate >= 25) return {SvgIcon:IconSmartPlanner,  color:'#84CC16', label:'Smart Planner'};
  if (rate >= 20) return {SvgIcon:IconBalanced,      color:'#EAB308', label:'Balanced Budgeter'};
  if (rate >= 15) return {SvgIcon:IconActiveSpender, color:'#F59E0B', label:'Active Spender'};
  if (rate >= 10) return {SvgIcon:IconFreeSpirit,    color:'#F97316', label:'Free Spirit'};
  return              {SvgIcon:IconCritical,          color:'#EF4444', label:'Critical Zone'};
}

// ─── Gamification Icons ───────────────────────────────────────────────────────
const GamIcon1  = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke={color} strokeWidth={1.6} fill={color+'15'}/></Svg>);
const GamIcon2  = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.8} fill={color+'12'}/><Path d="M8 12l3 3 5-5" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const GamIcon3  = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill={color+'15'}/></Svg>);
const GamIcon4  = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="3" y="11" width="4" height="10" rx="1" fill={color+'25'} stroke={color} strokeWidth={1.5}/><Rect x="10" y="7" width="4" height="14" rx="1" fill={color+'35'} stroke={color} strokeWidth={1.5}/><Rect x="17" y="3" width="4" height="18" rx="1" fill={color+'50'} stroke={color} strokeWidth={1.5}/></Svg>);
const GamIcon5  = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 2L2 9l10 13L22 9z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color+'18'}/><Path d="M2 9h20" stroke={color} strokeWidth={1.5}/></Svg>);
const GamIcon6  = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M12 3v18M5 21h14" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M5 9l-3 5h6L5 9zM19 9l-3 5h6L19 9z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" fill={color+'18'}/><Path d="M5 9h14" stroke={color} strokeWidth={1.5} strokeLinecap="round"/></Svg>);
const GamIcon7  = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="8" r="5" stroke={color} strokeWidth={1.8} fill={color+'15'}/><Path d="M6 21v-2a6 6 0 0112 0v2" stroke={color} strokeWidth={1.8} strokeLinecap="round"/></Svg>);
const GamIcon8  = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M8 21h8M12 17v4" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 4H4a1 1 0 00-1 1v3a4 4 0 003 3.87M17 4h3a1 1 0 011 1v3a4 4 0 01-3 3.87" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 4h10v6a5 5 0 01-10 0V4z" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill={color+'15'}/></Svg>);
const GamIcon9  = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.8} fill={color+'10'}/><Path d="M12 6v6l4 2" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const GamIcon10 = ({color,size=22}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Path d="M3 17L5 8l4.5 4.5L12 4l2.5 8.5L19 8l2 9H3z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill={color+'20'}/><Path d="M3 17h18" stroke={color} strokeWidth={1.8} strokeLinecap="round"/><Circle cx="12" cy="4" r="1.2" fill={color}/></Svg>);
const GAM_ICONS = [GamIcon1,GamIcon2,GamIcon3,GamIcon4,GamIcon5,GamIcon6,GamIcon7,GamIcon8,GamIcon9,GamIcon10];

// ─── Gradient pill button ─────────────────────────────────────────────────────
function GradPillBtn({label, onPress, isDark, style, disabled}) {
  const colors = isDark ? ['#4F46E5','#7C3AED','#9B35C5'] : ['#E890C8','#D468A8','#C060C0'];
  return (
    <TouchableOpacity
      style={[{borderRadius:14,overflow:'hidden'},style,disabled&&{opacity:0.55}]}
      onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <LinearGradient colors={colors} start={{x:0,y:0}} end={{x:1,y:0}}
        style={{height:50,alignItems:'center',justifyContent:'center'}}>
        <Text style={{fontSize:15,fontWeight:'800',color:'#FFF'}}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Budget categories ────────────────────────────────────────────────────────
const ALL_BUDGET_CATS = [
  {key:'monthly',       label:'Monthly Budget',   IcFn:({c})=><IcBudget c={c} s={16}/>},
  {key:'food',          label:'Food & Dining',     IcFn:({c})=><Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>},
  {key:'transport',     label:'Transport',         IcFn:({c})=><Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Rect x="1" y="3" width="15" height="13" rx="2" stroke={c} strokeWidth={1.8}/><Path d="M16 8h4l3 3v5h-7V8z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/><Circle cx="5.5" cy="18.5" r="2.5" stroke={c} strokeWidth={1.8}/><Circle cx="18.5" cy="18.5" r="2.5" stroke={c} strokeWidth={1.8}/></Svg>},
  {key:'entertainment', label:'Entertainment',     IcFn:({c})=><Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Rect x="2" y="2" width="20" height="20" rx="2.18" stroke={c} strokeWidth={1.8}/><Path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></Svg>},
  {key:'shopping',      label:'Shopping',          IcFn:({c})=><Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/><Line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth={1.8}/><Path d="M16 10a4 4 0 01-8 0" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></Svg>},
  {key:'health',        label:'Health',            IcFn:({c})=><Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>},
  {key:'education',     label:'Education',         IcFn:({c})=><Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/><Path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>},
  {key:'utilities',     label:'Utilities',         IcFn:({c})=><Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>},
  {key:'savings',       label:'Savings Target',    IcFn:({c})=><Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Path d="M19 7H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" stroke={c} strokeWidth={1.8}/><Path d="M3 11h18M12 7V3M8 3h8" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></Svg>},
  {key:'other',         label:'Other',             IcFn:({c})=><Svg width={16} height={16} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="1.5" fill={c}/><Circle cx="6" cy="12" r="1.5" fill={c}/><Circle cx="18" cy="12" r="1.5" fill={c}/></Svg>},
];

const ZERO_BUDGET_VALS = {};
ALL_BUDGET_CATS.forEach(({key}) => { ZERO_BUDGET_VALS[key] = '0'; });

// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen({navigation}) {
  const {state, dispatch} = useApp();
  const T      = useTheme(state.isDarkMode);
  const s      = makeStyles(T);
  const isDark = state.isDarkMode;

  const [showAlert, alertNode] = useAlert(isDark);

  const [showCurrency, setShowCurrency] = useState(false);
  const [showFAQ,      setShowFAQ]      = useState(false);
  const [showBudget,   setShowBudget]   = useState(false);
  const [showSub,      setShowSub]      = useState(false);
  const [curSearch,    setCurSearch]    = useState('');
  const [openFAQ,      setOpenFAQ]      = useState(null);
  const [openCat,      setOpenCat]      = useState(null);
  const [selCats,      setSelCats]      = useState([]);
  const [budgetVals,   setBudgetVals]   = useState({...ZERO_BUDGET_VALS});
  const [selPlan,      setSelPlan]      = useState('yearly');

  const sym  = state.currency.symbol;
  const rate = state.currency.rate;

  const nowM = new Date();
  const isThisMonth = e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getMonth()===nowM.getMonth() && d.getFullYear()===nowM.getFullYear();
  };
  const monthSpent     = (state.expenses||[]).filter(e=>!e.isIncome&&isThisMonth(e)).reduce((a,b)=>a+b.amount,0)*rate;
  const monthIncome    = (state.expenses||[]).filter(e=> e.isIncome&&isThisMonth(e)).reduce((a,b)=>a+b.amount,0)*rate;
  const monthlyBalance = monthIncome - monthSpent;
  const savingRate     = monthIncome > 0 ? Math.round(((monthIncome-monthSpent)/monthIncome)*100) : 35;
  const hasData        = (state.expenses||[]).length > 0;
  const displayBalance = hasData ? monthlyBalance : 0;

  const level        = GAMIFICATION_LEVELS.find(l=>state.points>=l.minPts&&state.points<l.nextPts)||GAMIFICATION_LEVELS[0];
  const nextLevel    = GAMIFICATION_LEVELS[Math.min(level.level,9)];
  const xpPct        = Math.min(100,((state.points-level.minPts)/Math.max(1,nextLevel.minPts-level.minPts))*100);
  const GamLevelIcon = GAM_ICONS[Math.min(Math.max((level.level||1)-1,0),9)];
  const gamColor     = isDark ? '#A3E635' : '#6366F1';
  const personality  = getPersonalitySvg(savingRate);
  const PersonalityIcon = personality.SvgIcon;

  const filteredCurrencies = useMemo(()=>
    CURRENCIES.filter(c=>c.name.toLowerCase().includes(curSearch.toLowerCase())||c.code.toLowerCase().includes(curSearch.toLowerCase())),
    [curSearch]);

  function toggleCat(key) {
    setSelCats(prev => prev.includes(key) ? prev.filter(k=>k!==key) : [...prev,key]);
  }

  function openBudgetModal() {
    setSelCats([]);
    setBudgetVals({...ZERO_BUDGET_VALS});
    setShowBudget(true);
  }

  function saveBudget() {
    const budgets = {};
    ALL_BUDGET_CATS.forEach(({key}) => {
      budgets[key] = selCats.includes(key) ? (parseFloat(budgetVals[key])||0) : 0;
    });
    dispatch({type:'SET_BUDGET', budgets});
    setShowBudget(false);
    showAlert({
      icon: '✅',
      title: 'Budget Saved',
      message: "Your spending limits have been updated. We'll send you a heads-up before you hit any category cap.",
      buttons: [{text: 'Got it', style: 'default'}],
    });
  }

  function logout() {
    dispatch({type:'LOGOUT'});
    navigation.reset({index:0,routes:[{name:'Splash'}]});
  }

  const modalBg   = isDark ? '#0F0F18' : '#FFFFFF';
  const modalText = isDark ? '#F1F5F9' : '#0F172A';
  const modalMuted= isDark ? '#64748B' : '#64748B';
  const inputBg   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
  const inputBd   = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
  const handleCol = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)';
  const modalBd   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const balColor  = isDark ? '#A3E635' : '#7C3AED';
  const balFmt    = v => { const a=Math.abs(v); return a>=1000?`${sym} ${(a/1000).toFixed(1)}K`:`${sym} ${a.toFixed(0)}`; };

  // ── Modals slide up from bottom — only top corners are rounded ────────────
  const sheetRadius = {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  };

  const menuTop = [
    {
      onPress: ()=>{setCurSearch('');setShowCurrency(true);},
      IcComp: <IcCurrency c={isDark?'#A3E635':'#059669'} s={17}/>,
      bg: isDark?'rgba(163,230,53,0.10)':'rgba(5,150,105,0.10)',
      nm: 'Currency', sb: 'Change display currency',
      right: <Text style={{fontWeight:'700',color:T.primary,fontSize:12}}>{sym} {state.currency.code}</Text>,
    },
    {
      onPress: openBudgetModal,
      IcComp: <IcBudget c={isDark?'#60A5FA':'#3B82F6'} s={17}/>,
      bg: 'rgba(59,130,246,0.10)',
      nm: 'Budget Settings', sb: 'Set monthly limits per category',
    },
    {
      onPress: ()=>setShowSub(true),
      IcComp: <IcCrown c={isDark?'#F59E0B':'#D97706'} s={17}/>,
      bg: 'rgba(249,115,22,0.10)',
      nm: 'SpendWise Pro', sb: 'Export reports, AI insights & more',
      right: <View style={s.upgradeChip}><Text style={{fontSize:10,color:T.orange,fontWeight:'700'}}>Upgrade</Text></View>,
    },
  ];

  const menuBottom = [
    {
      onPress: ()=>showAlert({
        icon: '🔐',
        title: 'Security Features',
        message: 'Biometric authentication and PIN lock keep your data safe. Upgrade to Pro to enable advanced security options.',
        buttons: [{text: 'OK', style: 'default'}],
      }),
      IcComp: <IcLock c={isDark?'#34D399':'#059669'} s={17}/>,
      bg: 'rgba(16,185,129,0.10)', nm: 'Security', sb: 'Biometric & PIN lock',
    },
    {
      onPress: ()=>showAlert({
        icon: '🔔',
        title: 'Notifications Active',
        message: "You're all set — budget alerts and spending reminders are enabled. We'll notify you before you overspend.",
        buttons: [{text: 'Perfect', style: 'default'}],
      }),
      IcComp: <IcBell c={isDark?'#F87171':'#EF4444'} s={17}/>,
      bg: 'rgba(239,68,68,0.10)', nm: 'Notifications', sb: 'Budget alerts & reminders',
    },
    {
      onPress: ()=>setShowFAQ(true),
      IcComp: <IcHelp c={isDark?'#67E8F9':'#0891B2'} s={17}/>,
      bg: 'rgba(6,182,212,0.10)', nm: 'Help & FAQ', sb: 'Everything you need to know',
    },
    {
      onPress: ()=>showAlert({
        icon: '💼',
        title: 'SpendWise v1.0.0',
        message: 'Built with React Native. SpendWise is your smart companion for tracking spending and building better money habits.',
        buttons: [{text: 'Nice!', style: 'default'}],
      }),
      IcComp: <IcInfo c={isDark?'#A3E635':'#6366F1'} s={17}/>,
      bg: 'rgba(163,230,53,0.08)', nm: 'About SpendWise', sb: 'Version 1.0.0',
    },
  ];

  return (
    <ScreenWrapper isDarkMode={isDark}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:8}}>

        {/* Topbar */}
        <View style={s.topbar}>
          <Text style={s.title}>Profile</Text>
          <TouchableOpacity style={s.ib} onPress={()=>navigation.navigate('EditProfile',{user:state.user})}>
            <IcEdit c={isDark?T.primary:'#6366F1'} s={17}/>
          </TouchableOpacity>
        </View>

        {/* Hero card */}
        <View style={s.heroCard}>
          <View style={[s.avatar,{backgroundColor:T.primary}]}>
            <Text style={[s.avatarTxt,{color:isDark?'#0a0f00':'#fff'}]}>
              {state.user?.name?.slice(0,2).toUpperCase()||'AK'}
            </Text>
          </View>
          <Text style={s.userName}>{state.user?.name||'Anas Khan'}</Text>
          <Text style={s.userEmail}>{state.user?.email||'user@spendwise.app'}</Text>
          <View style={s.statsRow}>
            <View style={{alignItems:'center'}}>
              <Text style={[s.statV,{color:displayBalance<0?'#EF4444':balColor}]}>
                {displayBalance<0?'-':''}{balFmt(displayBalance)}
              </Text>
              <Text style={s.statL}>Balance</Text>
            </View>
            <View style={{alignItems:'center'}}>
              <Text style={[s.statV,{color:T.text}]}>{(state.expenses||[]).length}</Text>
              <Text style={s.statL}>Transactions</Text>
            </View>
            <View style={{alignItems:'center'}}>
              <Text style={[s.statV,{color:T.orange}]}>{(state.goals||[]).length}</Text>
              <Text style={s.statL}>Goals</Text>
            </View>
            <View style={{alignItems:'center'}}>
              <Text style={[s.statV,{color:isDark?'#A3E635':'#6366F1'}]}>{(state.badges||[]).length}</Text>
              <Text style={s.statL}>Badges</Text>
            </View>
          </View>
        </View>

        {/* Spending Personality */}
        <TouchableOpacity
          style={[s.compactCard,{backgroundColor:isDark?personality.color+'12':'rgba(139,92,246,0.06)',borderColor:isDark?personality.color+'30':'rgba(139,92,246,0.20)'}]}
          onPress={()=>navigation.navigate('SpendingPersonality',{savingRate,personality})} activeOpacity={0.80}>
          <View style={[s.compactIcon,{backgroundColor:isDark?personality.color+'20':'rgba(99,102,241,0.10)',borderColor:isDark?personality.color+'35':'rgba(99,102,241,0.22)',borderWidth:1}]}>
            <PersonalityIcon color={isDark?personality.color:'#6366F1'} size={22}/>
          </View>
          <View style={{flex:1}}>
            <Text style={{fontSize:9,color:isDark?T.purple:'#6366F1',fontWeight:'800',textTransform:'uppercase',letterSpacing:0.6,marginBottom:2}}>Spending Personality</Text>
            <Text style={{fontSize:14,fontWeight:'800',color:T.text,marginBottom:1}}>{personality.label}</Text>
            <Text style={{fontSize:11,color:T.muted}}>
              {hasData?`Saving ${savingRate}% · ${savingRate>=20?'Above average':'Keep it up!'}` : 'Add income & expenses to track'}
            </Text>
          </View>
          <Text style={{color:T.muted,fontSize:18}}>›</Text>
        </TouchableOpacity>

        {/* Gamification */}
        <TouchableOpacity
          style={[s.compactCard,{backgroundColor:isDark?'rgba(59,130,246,0.06)':'rgba(59,130,246,0.05)',borderColor:isDark?'rgba(59,130,246,0.20)':'rgba(59,130,246,0.22)'}]}
          onPress={()=>navigation.navigate('Gamification',{level,xpPct,points:state.points})} activeOpacity={0.80}>
          <View style={[s.compactIcon,{backgroundColor:isDark?'rgba(163,230,53,0.12)':'rgba(99,102,241,0.10)',borderColor:isDark?'rgba(163,230,53,0.25)':'rgba(99,102,241,0.22)',borderWidth:1}]}>
            <GamLevelIcon color={gamColor} size={22}/>
          </View>
          <View style={{flex:1}}>
            <Text style={{fontSize:9,color:T.blue,fontWeight:'800',textTransform:'uppercase',letterSpacing:0.6,marginBottom:2}}>Level {level.level}</Text>
            <Text style={{fontSize:14,fontWeight:'800',color:T.text,marginBottom:1}}>{level.name}</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
              <View style={{flex:1,height:4,borderRadius:2,backgroundColor:isDark?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.08)',overflow:'hidden'}}>
                <View style={{height:'100%',borderRadius:2,width:`${xpPct}%`,backgroundColor:T.blue}}/>
              </View>
              <Text style={{fontSize:9,color:T.muted}}>{state.points} pts</Text>
            </View>
          </View>
          <Text style={{color:T.muted,fontSize:18}}>›</Text>
        </TouchableOpacity>

        {/* Menu */}
        <View style={s.menu}>
          {menuTop.map(({onPress,IcComp,bg,nm,sb,right},i)=>(
            <TouchableOpacity key={i} style={s.mi} onPress={onPress}>
              <View style={[s.miIco,{backgroundColor:bg}]}>{IcComp}</View>
              <View style={{flex:1}}><Text style={s.miNm}>{nm}</Text><Text style={s.miSb}>{sb}</Text></View>
              {right||null}
              {!right&&<Text style={s.arrow}>›</Text>}
              {right&&nm!=='SpendWise Pro'&&<Text style={s.arrow}>›</Text>}
            </TouchableOpacity>
          ))}

          <View style={s.mi}>
            <View style={[s.miIco,{backgroundColor:'rgba(168,85,247,0.10)'}]}>
              <IcPalette c={isDark?'#C084FC':'#7C3AED'} s={17}/>
            </View>
            <View style={{flex:1}}>
              <Text style={s.miNm}>Dark Mode</Text>
              <Text style={s.miSb}>{isDark?'On — tap to switch light':'Off — tap to switch dark'}</Text>
            </View>
            <Switch value={isDark} onValueChange={v=>dispatch({type:'SET_THEME',val:v})}
              trackColor={{false:'#767577',true:'rgba(163,230,53,0.4)'}}
              thumbColor={isDark?T.primary:'#f4f3f4'}/>
          </View>

          {menuBottom.map(({onPress,IcComp,bg,nm,sb},i)=>(
            <TouchableOpacity key={i} style={s.mi} onPress={onPress}>
              <View style={[s.miIco,{backgroundColor:bg}]}>{IcComp}</View>
              <View style={{flex:1}}><Text style={s.miNm}>{nm}</Text><Text style={s.miSb}>{sb}</Text></View>
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Log Out */}
        <TouchableOpacity
          style={{marginHorizontal:14,borderRadius:14,overflow:'hidden',marginBottom:16}}
          onPress={logout}>
          <LinearGradient
            colors={isDark?['#4F46E5','#7C3AED','#9B35C5']:['#E890C8','#D468A8','#C060C0']}
            start={{x:0,y:0}} end={{x:1,y:0}}
            style={{height:52,alignItems:'center',justifyContent:'center'}}>
            <Text style={{color:'#FFF',fontSize:15,fontWeight:'800'}}>Log Out</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* ── CURRENCY MODAL ── top corners rounded, flat bottom ── */}
      <Modal visible={showCurrency} animationType="slide" transparent onRequestClose={()=>setShowCurrency(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={()=>setShowCurrency(false)}>
          <TouchableOpacity activeOpacity={1} style={[s.modal, sheetRadius, {maxHeight:'80%',backgroundColor:modalBg,borderColor:modalBd}]}>
            <View style={[s.handle,{backgroundColor:handleCol}]}/>
            <Text style={[s.modalTitle,{color:modalText}]}>Select Currency</Text>
            <View style={[s.curSearch,{backgroundColor:inputBg,borderColor:inputBd}]}>
              <Text style={{fontSize:14,color:modalMuted}}>🔍</Text>
              <TextInput style={[s.curSearchIn,{color:modalText}]} value={curSearch}
                onChangeText={setCurSearch} placeholder="Search currency..."
                placeholderTextColor={modalMuted} autoFocus/>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredCurrencies.map(cur=>(
                <TouchableOpacity key={cur.code}
                  style={[s.curItem,{borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)'},
                    state.currency.code===cur.code&&{backgroundColor:isDark?'rgba(163,230,53,0.08)':'rgba(99,102,241,0.08)'}]}
                  onPress={()=>{
                    dispatch({type:'SET_CURRENCY',currency:cur});
                    setShowCurrency(false);
                    showAlert({
                      icon: cur.flag,
                      title: 'Currency Updated',
                      message: `All amounts are now displayed in ${cur.name} (${cur.symbol}).`,
                      buttons: [{text: 'Got it', style: 'default'}],
                    });
                  }}>
                  <Text style={{fontSize:22}}>{cur.flag}</Text>
                  <View style={{flex:1}}>
                    <Text style={{fontSize:13,fontWeight:'700',color:modalText}}>{cur.name}</Text>
                    <Text style={{fontSize:11,color:modalMuted}}>1 PKR = {cur.rate.toFixed(4)} {cur.code}</Text>
                  </View>
                  <Text style={{fontSize:16,fontWeight:'700',color:T.primary}}>{cur.symbol}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── BUDGET MODAL ── top corners rounded, flat bottom ── */}
      <Modal visible={showBudget} animationType="slide" transparent onRequestClose={()=>setShowBudget(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={()=>setShowBudget(false)}>
          <TouchableOpacity activeOpacity={1} style={[s.modal, sheetRadius, {backgroundColor:modalBg,borderColor:modalBd}]}>
            <View style={[s.handle,{backgroundColor:handleCol}]}/>
            <Text style={[s.modalTitle,{color:modalText}]}>Budget Settings</Text>
            <Text style={{paddingHorizontal:18,fontSize:12,color:modalMuted,marginBottom:12}}>
              Tap a category to select it, then enter your monthly limit.
            </Text>
            <ScrollView style={{maxHeight:500}} keyboardShouldPersistTaps="handled">
              <View style={{paddingHorizontal:18,paddingBottom:16}}>
                {ALL_BUDGET_CATS.map(({key,label,IcFn})=>{
                  const selected = selCats.includes(key);
                  const accent   = isDark ? '#A3E635' : '#7C3AED';
                  return (
                    <View key={key} style={{marginBottom:10}}>
                      <TouchableOpacity
                        style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:selected?8:0}}
                        onPress={()=>toggleCat(key)} activeOpacity={0.80}>
                        <View style={{width:22,height:22,borderRadius:7,borderWidth:1.5,
                          alignItems:'center',justifyContent:'center',
                          backgroundColor:selected?accent:inputBg,
                          borderColor:selected?accent:inputBd}}>
                          {selected&&(
                            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                              <Path d="M5 12l4 4 8-8" stroke={isDark?'#0d1f00':'#fff'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
                            </Svg>
                          )}
                        </View>
                        <View style={{width:28,height:28,borderRadius:8,alignItems:'center',justifyContent:'center',
                          backgroundColor:selected?accent+'22':inputBg}}>
                          <IcFn c={selected?accent:modalMuted}/>
                        </View>
                        <Text style={{flex:1,fontSize:13,fontWeight:'700',
                          color:selected?modalText:modalMuted}}>{label}</Text>
                      </TouchableOpacity>
                      {selected&&(
                        <TextInput
                          style={[s.minput,{backgroundColor:inputBg,borderColor:accent+'55',color:modalText,marginLeft:32}]}
                          value={budgetVals[key]}
                          onChangeText={v=>setBudgetVals(p=>({...p,[key]:v}))}
                          placeholder={`${label} limit (${sym})`}
                          placeholderTextColor={modalMuted}
                          keyboardType="decimal-pad"/>
                      )}
                    </View>
                  );
                })}
                <View style={{marginTop:8}}>
                  <GradPillBtn label="Save Budget" onPress={saveBudget} isDark={isDark}/>
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── FAQ MODAL ── top corners rounded, flat bottom ── */}
      <Modal visible={showFAQ} animationType="slide" transparent onRequestClose={()=>setShowFAQ(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={()=>setShowFAQ(false)}>
          <TouchableOpacity activeOpacity={1} style={[s.modal, sheetRadius, {maxHeight:'90%',backgroundColor:modalBg,borderColor:modalBd}]}>
            <View style={[s.handle,{backgroundColor:handleCol}]}/>
            <Text style={[s.modalTitle,{color:modalText}]}>Help & FAQ</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:20}}>
              {FAQ_DATA.map((section,si)=>(
                <View key={si} style={{marginHorizontal:14,marginBottom:10}}>
                  <TouchableOpacity
                    style={[s.faqCat,{backgroundColor:inputBg,borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'},
                      openCat===si&&{backgroundColor:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'}]}
                    onPress={()=>setOpenCat(openCat===si?null:si)}>
                    <Text style={{flex:1,fontSize:14,fontWeight:'700',color:modalText}}>{section.category}</Text>
                    <Text style={{color:modalMuted,fontSize:12}}>{openCat===si?'▲':'▶'}</Text>
                  </TouchableOpacity>
                  {openCat===si&&section.items.map((item,qi)=>(
                    <View key={qi} style={[s.faqItem,{backgroundColor:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)',borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}]}>
                      <TouchableOpacity style={s.faqQ} onPress={()=>setOpenFAQ(openFAQ===`${si}-${qi}`?null:`${si}-${qi}`)}>
                        <Text style={{flex:1,fontSize:13,fontWeight:'700',color:modalText,lineHeight:20}}>{item.q}</Text>
                        <Text style={{color:modalMuted,fontSize:11}}>{openFAQ===`${si}-${qi}`?'▲':'▼'}</Text>
                      </TouchableOpacity>
                      {openFAQ===`${si}-${qi}`&&(
                        <View style={[s.faqAns,{borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)'}]}>
                          <Text style={{fontSize:13,color:modalMuted,lineHeight:20}}>{item.a}</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}
              <View style={{marginHorizontal:14,backgroundColor:inputBg,borderRadius:14,padding:16,borderWidth:1,borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}}>
                <Text style={{fontSize:15,fontWeight:'700',color:modalText,marginBottom:12}}>Contact Support</Text>
                {[['📧','Email','support@spendwise.app'],['🌐','Website','www.spendwise.app'],['💬','Discord','discord.gg/spendwise']].map(([icon,lbl,val])=>(
                  <View key={lbl} style={{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:8,borderBottomWidth:1,borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)'}}>
                    <Text style={{fontSize:16}}>{icon}</Text>
                    <Text style={{fontSize:13,color:modalMuted,width:70}}>{lbl}</Text>
                    <Text style={{fontSize:13,color:T.primary,fontWeight:'600'}}>{val}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── PRO MODAL ── top corners rounded, flat bottom ── */}
      <Modal visible={showSub} animationType="slide" transparent onRequestClose={()=>setShowSub(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={()=>setShowSub(false)}>
          <TouchableOpacity activeOpacity={1} style={[s.modal, sheetRadius, {backgroundColor:modalBg,borderColor:modalBd}]}>
            <View style={[s.handle,{backgroundColor:handleCol}]}/>
            <View style={{padding:24,alignItems:'center',paddingBottom:12}}>
              <View style={{marginBottom:9}}>
                <IcProGem size={52} isDark={isDark}/>
              </View>
              <Text style={{fontSize:22,fontWeight:'800',color:modalText,marginBottom:5}}>SpendWise Pro</Text>
              <Text style={{fontSize:13,color:modalMuted,textAlign:'center',lineHeight:20}}>
                Take full control of your finances with powerful tools built for serious savers.
              </Text>
            </View>
            <View style={{paddingHorizontal:18,paddingBottom:18}}>
              {[['📤','Export reports as CSV & PDF'],['🤖','AI-powered spending insights'],['🔔','Smart budget alerts & automation'],['📊','Unlimited categories & custom goals'],['☁️','Multi-device sync & cloud backup']].map(([icon,feat])=>(
                <View key={feat} style={{flexDirection:'row',alignItems:'center',gap:9,paddingVertical:7,borderBottomWidth:1,borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)'}}>
                  <Text style={{fontSize:14}}>{icon}</Text>
                  <Text style={{fontSize:13,color:modalText,fontWeight:'500'}}>{feat}</Text>
                </View>
              ))}

              <View style={{flexDirection:'row',gap:10,marginTop:16,marginBottom:14}}>
                <TouchableOpacity
                  style={[s.priceCard,{
                    backgroundColor: selPlan==='monthly' ? (isDark?'rgba(163,230,53,0.08)':'rgba(99,102,241,0.08)') : inputBg,
                    borderColor: selPlan==='monthly' ? T.primary : inputBd,
                    borderWidth: selPlan==='monthly' ? 2 : 1.5,
                  }]}
                  onPress={()=>setSelPlan('monthly')}>
                  <Text style={{fontSize:11,color:selPlan==='monthly'?T.primary:modalMuted,fontWeight:'700',marginBottom:3}}>MONTHLY</Text>
                  <Text style={{fontSize:18,fontWeight:'700',color:modalText}}>₹199</Text>
                  <Text style={{fontSize:10,color:selPlan==='monthly'?T.primary:modalMuted}}>/ month</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.priceCard,{
                    backgroundColor: selPlan==='yearly' ? (isDark?'rgba(163,230,53,0.08)':'rgba(99,102,241,0.08)') : inputBg,
                    borderColor: selPlan==='yearly' ? T.primary : inputBd,
                    borderWidth: selPlan==='yearly' ? 2 : 1.5,
                  }]}
                  onPress={()=>setSelPlan('yearly')}>
                  <Text style={{fontSize:11,color:selPlan==='yearly'?T.primary:modalMuted,fontWeight:'700',marginBottom:3}}>YEARLY</Text>
                  <Text style={{fontSize:18,fontWeight:'700',color:modalText}}>₹1,499</Text>
                  <Text style={{fontSize:10,color:selPlan==='yearly'?T.primary:modalMuted,fontWeight:'700'}}>Save 37%</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={{borderRadius:14,overflow:'hidden',marginBottom:12}}
                onPress={()=>{
                  setShowSub(false);
                  showAlert({
                    icon: '🎉',
                    title: 'Trial Started!',
                    message: `Your 7-day free trial on the ${selPlan} plan is now active. Explore every Pro feature — no charge until your trial ends.`,
                    buttons: [{text: "Let's Go!", style: 'default'}],
                  });
                }}>
                <LinearGradient colors={isDark?['#4F46E5','#7C3AED','#9B35C5']:['#E890C8','#D468A8','#C060C0']}
                  start={{x:0,y:0}} end={{x:1,y:0}}
                  style={{height:50,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{color:'#FFF',fontSize:15,fontWeight:'800'}}>Start 7-Day Free Trial</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setShowSub(false)}>
                <Text style={{textAlign:'center',color:modalMuted,fontSize:12}}>
                  No thanks, I'll stick with the free plan
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Custom rounded alert — rendered above all other content */}
      {alertNode}
    </ScreenWrapper>
  );
}

const makeStyles = T => StyleSheet.create({
  topbar:      {flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:18,paddingTop:12},
  title:       {fontSize:18,fontWeight:'700',color:T.text},
  ib:          {width:36,height:36,borderRadius:11,borderWidth:1,borderColor:T.border2,backgroundColor:T.card,alignItems:'center',justifyContent:'center'},
  heroCard:    {marginHorizontal:14,marginBottom:10,borderRadius:20,backgroundColor:T.card,borderWidth:1,borderColor:T.border,padding:18,alignItems:'center'},
  avatar:      {width:64,height:64,borderRadius:32,alignItems:'center',justifyContent:'center',marginBottom:9},
  avatarTxt:   {fontSize:22,fontWeight:'800'},
  userName:    {fontSize:18,fontWeight:'700',color:T.text,marginBottom:2},
  userEmail:   {fontSize:12,color:T.muted,marginBottom:13},
  statsRow:    {flexDirection:'row',justifyContent:'space-around',borderTopWidth:1,borderColor:T.border,paddingTop:12,width:'100%'},
  statV:       {fontSize:15,fontWeight:'700',marginBottom:2},
  statL:       {fontSize:10,color:T.muted},
  compactCard: {flexDirection:'row',alignItems:'center',gap:12,marginHorizontal:14,marginBottom:8,borderRadius:16,padding:13,borderWidth:1.5},
  compactIcon: {width:46,height:46,borderRadius:14,alignItems:'center',justifyContent:'center'},
  menu:        {marginHorizontal:14,marginBottom:12},
  mi:          {flexDirection:'row',alignItems:'center',gap:10,padding:12,borderRadius:13,backgroundColor:T.card,borderWidth:1,borderColor:T.border,marginBottom:7},
  miIco:       {width:34,height:34,borderRadius:10,alignItems:'center',justifyContent:'center'},
  miNm:        {fontSize:13,fontWeight:'700',color:T.text},
  miSb:        {fontSize:11,color:T.muted},
  arrow:       {color:T.muted,fontSize:16,marginLeft:'auto'},
  upgradeChip: {borderRadius:100,paddingVertical:3,paddingHorizontal:9,backgroundColor:'rgba(249,115,22,0.12)',borderWidth:1,borderColor:'rgba(249,115,22,0.3)'},
  overlay:     {flex:1,backgroundColor:'rgba(0,0,0,0.72)',justifyContent:'flex-end'},
  modal:       {borderWidth:1,maxHeight:'90%'},   // radius applied via sheetRadius inline
  handle:      {width:36,height:4,borderRadius:2,alignSelf:'center',marginTop:12,marginBottom:18},
  modalTitle:  {fontSize:18,fontWeight:'800',paddingHorizontal:18,marginBottom:4},
  curSearch:   {flexDirection:'row',alignItems:'center',gap:8,borderWidth:1,borderRadius:11,paddingHorizontal:12,marginHorizontal:14,marginBottom:12,height:40},
  curSearchIn: {flex:1,fontSize:13},
  curItem:     {flexDirection:'row',alignItems:'center',gap:10,padding:12,borderBottomWidth:1,marginHorizontal:14},
  minput:      {height:50,borderRadius:13,borderWidth:1,fontSize:15,paddingHorizontal:14,marginBottom:4},
  faqCat:      {flexDirection:'row',alignItems:'center',borderRadius:12,padding:13,borderWidth:1,marginBottom:6},
  faqItem:     {borderRadius:10,borderWidth:1,marginBottom:5,overflow:'hidden'},
  faqQ:        {flexDirection:'row',alignItems:'flex-start',padding:12,gap:8},
  faqAns:      {padding:12,paddingTop:0,borderTopWidth:1},
  priceCard:   {flex:1,borderRadius:14,padding:12,alignItems:'center'},
});