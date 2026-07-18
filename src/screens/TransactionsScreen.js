// TransactionsScreen.js
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, KeyboardAvoidingView, Platform,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgLG, Stop } from 'react-native-svg';
import ScreenWrapper from '../utils/ScreenWrapper';
import { useApp } from '../context/AppContext';
import { useTheme } from '../utils/theme';
import { EXPENSE_CATEGORIES } from '../data/mockData';

const { width: SW, height: SH } = Dimensions.get('window');
const PERIODS = ['Day', 'Week', 'Month', 'Year'];
const CARD_W  = (SW - 28 - 10) / 2;
const CARD_H  = 70;

const SUB_COLORS = [
  '#E50914','#1DB954','#00A8E1','#FF0000','#1ABCFE',
  '#FC3C44','#1D6DB5','#4A154B','#6366F1','#F59E0B',
  '#059669','#7C3AED','#0891B2','#EC4899','#10A37F',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getPeriodInfo = (p) => {
  if (p === 'Day')   return { label:'Today only',  earnedLabel:'Earned Today' };
  if (p === 'Week')  return { label:'Last 7 days', earnedLabel:'Earned This Week' };
  if (p === 'Month') return { label:'This month',  earnedLabel:'Earned This Month' };
  return                    { label:'All time',    earnedLabel:'All-Time Earned' };
};
const isInPeriod = (dateStr, period) => {
  if (!dateStr) return false;
  const d = new Date(dateStr); const now = new Date();
  if (period === 'Day')   return d.toDateString() === now.toDateString();
  if (period === 'Week')  { const w = new Date(now); w.setDate(now.getDate()-7); return d >= w; }
  if (period === 'Month') return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  return true;
};
const fmtDate = (ds) => {
  try {
    const d = new Date(ds); const now = new Date(); const y = new Date();
    y.setDate(now.getDate()-1);
    if (d.toDateString()===now.toDateString()) return 'Today';
    if (d.toDateString()===y.toDateString())   return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  } catch (_) { return ds; }
};
const clean = (t) => {
  const f = t.replace(/[^0-9.]/g,''); const p = f.split('.');
  return p.length>2 ? p[0]+'.'+p.slice(1).join('') : f;
};

// Check if subscription is overdue
const isOverdue = (dueDate, isPaid) => {
  if (isPaid) return false;
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  return due < now;
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const SalaryIcon = ({ color='#22C55E', size=20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="8" width="20" height="12" rx="3" stroke={color} strokeWidth="1.8"/>
    <Path d="M2 13h20" stroke={color} strokeWidth="1.5"/>
    <Path d="M6 17h5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Circle cx="17" cy="17" r="1.5" fill={color}/>
    <Path d="M12 2v5M9.5 4.5L12 2l2.5 2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const ExportIcon = ({ color='#22C55E' }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M12 16V4M7 9l5-5 5 5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
  </Svg>
);
const WalletSmIcon = ({ color, size=12 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="20" height="14" rx="3" stroke={color} strokeWidth="1.8"/>
    <Path d="M16 14a2 2 0 11-4 0 2 2 0 014 0z" fill={color}/>
    <Path d="M6 7V5a4 4 0 018 0v2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);
const CardSmIcon = ({ color, size=12 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth="1.8"/>
    <Path d="M2 10h20" stroke={color} strokeWidth="1.8"/>
    <Path d="M6 15h4M16 15h2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);
const BalanceIcon = ({ color, size=12 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3v18M5 21h14" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Path d="M5 9l-3 6h6L5 9zM19 9l-3 6h6L19 9z" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    <Path d="M5 9h14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

const EmptyIllustration = ({ color }) => (
  <Svg width={110} height={90} viewBox="0 0 110 90" fill="none">
    <Rect x="20" y="10" width="70" height="60" rx="10" fill={color+'18'} stroke={color+'55'} strokeWidth="1.5"/>
    <Rect x="30" y="25" width="30" height="4" rx="2" fill={color+'44'}/>
    <Rect x="64" y="25" width="16" height="4" rx="2" fill={color+'33'}/>
    <Rect x="30" y="35" width="24" height="4" rx="2" fill={color+'33'}/>
    <Rect x="64" y="35" width="16" height="4" rx="2" fill={color+'25'}/>
    <Rect x="30" y="45" width="28" height="4" rx="2" fill={color+'25'}/>
    <Rect x="64" y="45" width="16" height="4" rx="2" fill={color+'18'}/>
    <Circle cx="78" cy="62" r="14" fill={color+'15'} stroke={color+'55'} strokeWidth="1.5"/>
    <Circle cx="78" cy="62" r="8" fill={color+'10'}/>
    <Path d="M84 68l6 6" stroke={color+'99'} strokeWidth="2.5" strokeLinecap="round"/>
    <Path d="M78 59v6M75 62h6" stroke={color+'BB'} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

// ─── Brand Logos ──────────────────────────────────────────────────────────────
const BINetflix    = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M5 3h3.5l3 8.5V3H15v18h-3.5L8.5 12.5V21H5z" fill="#E50914"/></Svg>);
const BISpotify    = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill="#1DB954"/><Path d="M16.7 16.2c-.2.3-.6.4-.9.2C13.4 15 10.4 14.7 7 15.5c-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 3.7-.9 7-.5 9.7 1.1.3.2.4.6.3.9zm1.1-2.6c-.2.3-.6.4-1 .2-2.7-1.6-6.8-2.1-10-1.1-.4.1-.8-.1-.9-.5-.1-.4.1-.8.5-.9 3.6-1.1 8-.5 11.1 1.3.4.2.5.6.3 1zm.1-2.7c-3.2-1.9-8.4-2-11.5-1.1-.5.1-.9-.1-1.1-.6-.1-.5.1-.9.6-1.1 3.5-1.1 9.4-.9 13 1.3.4.2.6.7.3 1.1-.2.4-.7.5-1.3.4z" fill="#FFF"/></Svg>);
const BIYouTube    = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect x="1" y="4" width="22" height="16" rx="4" fill="#FF0000"/><Path d="M9.5 15.5V8.5l7 3.5-7 3.5z" fill="#FFF"/></Svg>);
const BIPrime      = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill="#00A8E1"/><Path d="M7 12l3 3 7-7" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></Svg>);
const BIDisney     = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="5" fill="#1D6DB5"/><Path d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 2c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4 1.8-4 4-4z" fill="#FFF"/></Svg>);
const BIHBO        = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="5" fill="#5822B4"/><Path d="M3.5 8h2v3H8V8h2v8H8v-3H5.5v3h-2V8zm6.5 0h3.5c1.4 0 2 .9 2 2.3 0 .8-.3 1.4-.8 1.8l1 3.9H14l-.8-3H13V16h-3V8zm2 1.8V12h1.2c.4 0 .5-.2.5-.5v-1.2c0-.3-.2-.5-.5-.5H12zm5-1.8h2v8h-2z" fill="#FFF"/></Svg>);
const BIHulu       = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="5" fill="#1CE783"/><Path d="M6 6h3v4.5h6V6h3v12h-3v-5H9v5H6V6z" fill="#000"/></Svg>);
const BIAppleMusic = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="6" fill="#FC3C44"/><Path d="M17 6L9 8v7.5c0 1-.8 1.5-1.7 1.5S6 16.3 6 15.5s.8-1.5 1.7-1.5c.3 0 .6.1.8.2V9l8-2v6c0 1-.8 1.5-1.7 1.5S13 14.3 13 13.5s.8-1.5 1.7-1.5c.3 0 .5.1.8.2V6z" fill="#FFF"/></Svg>);
const BIChatGPT    = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill="#10A37F"/><Path d="M7 12c0-2.8 2.2-5 5-5s5 2.2 5 5-2.2 5-5 5-5-2.2-5-5z" stroke="#FFF" strokeWidth="1.5" fill="none"/><Circle cx="12" cy="12" r="2" fill="#FFF"/></Svg>);
const BIGitHub     = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill="#24292E"/><Path d="M12 5C8.1 5 5 8.1 5 12c0 3.1 2 5.7 4.8 6.6.4.1.5-.2.5-.4v-1.4c-2 .4-2.5-.5-2.6-.9-.1-.2-.5-.9-.8-1.1-.3-.1-.7-.5 0-.5.6 0 1.1.6 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.2-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.2 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.6v2.4c0 .2.1.5.5.4C17 17.7 19 15.1 19 12c0-3.9-3.1-7-7-7z" fill="#FFF"/></Svg>);
const BIFigma      = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect x="8" y="2" width="8" height="6" rx="2" fill="#F24E1E"/><Rect x="2" y="9" width="8" height="6" rx="2" fill="#A259FF"/><Circle cx="18" cy="12" r="3" fill="#1ABCFE"/><Rect x="2" y="16" width="8" height="6" rx="2" fill="#0ACF83"/><Rect x="8" y="9" width="6" height="6" rx="2" fill="#FF7262"/></Svg>);
const BINotion     = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="4" fill="#FFF"/><Path d="M6 4.5l10 .5c1.5.1 2 .6 2 2v12c0 1.4-.6 2-2 2H8c-1.4 0-2-.6-2-2V4.5z" fill="#1a1a1a"/><Path d="M8 8h6M8 11h5M8 14h4" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round"/></Svg>);
const BISlack      = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M5.04 15.5a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2h2v2zm1 0a2 2 0 012-2 2 2 0 012 2v5a2 2 0 01-2 2 2 2 0 01-2-2v-5z" fill="#E01E5A"/><Path d="M8.5 4.5a2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2v2h-2zm0 1a2 2 0 012 2 2 2 0 01-2 2H3a2 2 0 01-2-2 2 2 0 012-2h5.5z" fill="#36C5F0"/><Path d="M19 8a2 2 0 012 2 2 2 0 01-2 2h-2V8h2zm-1 0a2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2v5a2 2 0 01-2 2 2 2 0 01-2-2V8z" fill="#2EB67D"/><Path d="M15.5 19.5a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2v-2h2zm0-1a2 2 0 01-2-2 2 2 0 012-2H21a2 2 0 012 2 2 2 0 01-2 2h-5.5z" fill="#ECB22E"/></Svg>);
const BIZoom       = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="5" fill="#2D8CFF"/><Path d="M13 9.5H6v5h7l3 2.5V7L13 9.5z" fill="#FFF"/></Svg>);
const BILinkedIn   = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="4" fill="#0077B5"/><Path d="M6 9h2.5v9H6V9zm1.25-3.5c.8 0 1.4.6 1.4 1.4s-.6 1.4-1.4 1.4-1.4-.6-1.4-1.4.6-1.4 1.4-1.4zM10.5 9H13v1.2c.4-.7 1.3-1.4 2.6-1.4 2.8 0 3.4 1.8 3.4 4.2V18H16.5v-4.4c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4V18H10.5V9z" fill="#FFF"/></Svg>);
const BIDropbox    = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M6 2L1 5.5 6 9l-5 3.5L6 16l5-3.5 5 3.5 5-3.5L16 9l5-3.5L16 2l-5 3.5L6 2zm0 14l-5-3.5V17L6 20l5-3.5L16 20l5-3.5v-4.5L16 16l-5-3.5L6 16z" fill="#0061FF"/></Svg>);
const BICanva      = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill="#7D2AE8"/><Path d="M12 7c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5zm0 2c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" fill="#FFF"/></Svg>);
const BITwitch     = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="6" fill="#9146FF"/><Path d="M7 4H17l-2 5h-3v3H9V7H7V4zm5 9.5v2.5H10V9h2v4.5zm4 0V9h2v4.5H16z" fill="#FFF"/></Svg>);
const BIAdobe      = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="5" fill="#FF0000"/><Path d="M14 5l5 14h-4l-1-3H9l-1 3H4L9 5h5zm-2.5 3.5L9.5 13h4l-2-4.5z" fill="#FFF"/></Svg>);
const BIOffice     = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="4" fill="#D83B01"/><Path d="M14 6h4a1 1 0 011 1v10a1 1 0 01-1 1h-4V6zm-1 0L6 8v8l7 2V6z" fill="#FFF"/></Svg>);
const BIDuolingo   = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill="#58CC02"/><Circle cx="9" cy="11" r="1.3" fill="#FFF"/><Circle cx="15" cy="11" r="1.3" fill="#FFF"/><Path d="M9 14.5c.8 1 2 1.5 3 1.5s2.2-.5 3-1.5" stroke="#FFF" strokeWidth="1.4" strokeLinecap="round" fill="none"/></Svg>);
const BIHeadspace  = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill="#F47D31"/><Circle cx="12" cy="11" r="5" fill="#FFF"/><Path d="M9 11a3 3 0 006 0" stroke="#F47D31" strokeWidth="1.5" fill="none"/></Svg>);
const BINordVPN    = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Rect width="24" height="24" rx="6" fill="#4687FF"/><Path d="M12 4L4 18h5l3-5.5L15 18h5L12 4z" fill="#FFF"/></Svg>);
const BIGrammarly  = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Circle cx="12" cy="12" r="10" fill="#15C39A"/><Path d="M12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5c1.5 0 2.8-.6 3.8-1.6l-1.4-1.4c-.6.6-1.4.9-2.4.9-1.7 0-3-1.3-3-3s1.3-3 3-3c.8 0 1.5.3 2 .8h-2v2h4.5v-1c0-2.7-2.2-4.7-4.5-4.7z" fill="#FFF"/></Svg>);
const BIInstagram  = () => (<Svg width={22} height={22} viewBox="0 0 24 24"><Defs><SvgLG id="ig11" x1="0" y1="1" x2="1" y2="0"><Stop offset="0" stopColor="#FED373"/><Stop offset="0.4" stopColor="#F15245"/><Stop offset="0.7" stopColor="#D92E7F"/><Stop offset="1" stopColor="#9B36B7"/></SvgLG></Defs><Rect x="1" y="1" width="22" height="22" rx="6" fill="url(#ig11)"/><Circle cx="12" cy="12" r="4.5" stroke="#fff" strokeWidth="1.8" fill="none"/><Circle cx="17.5" cy="6.5" r="1.2" fill="#fff"/></Svg>);
const BIDefault    = ({ color, size=22 }) => (<Svg width={size} height={size} viewBox="0 0 24 24"><Rect width="24" height="24" rx="6" fill={color||'#6366F1'}/><Path d="M8 8h8M8 12h6M8 16h4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></Svg>);

const BrandIcon = ({ name, color, size=22 }) => {
  const n = (name||'').toLowerCase().trim();
  if (n==='netflix')                              return <BINetflix/>;
  if (n==='spotify')                              return <BISpotify/>;
  if (n==='youtube premium'||n==='youtube')       return <BIYouTube/>;
  if (n==='amazon prime'||n==='prime')            return <BIPrime/>;
  if (n==='disney+'||n==='disney')                return <BIDisney/>;
  if (n==='hbo max'||n==='hbo'||n==='max')        return <BIHBO/>;
  if (n==='hulu')                                 return <BIHulu/>;
  if (n==='apple music')                          return <BIAppleMusic/>;
  if (n==='chatgpt'||n==='openai')                return <BIChatGPT/>;
  if (n==='github')                               return <BIGitHub/>;
  if (n==='figma')                                return <BIFigma/>;
  if (n==='notion')                               return <BINotion/>;
  if (n==='slack')                                return <BISlack/>;
  if (n==='zoom')                                 return <BIZoom/>;
  if (n==='linkedin premium'||n==='linkedin')     return <BILinkedIn/>;
  if (n==='dropbox')                              return <BIDropbox/>;
  if (n==='canva')                                return <BICanva/>;
  if (n==='twitch')                               return <BITwitch/>;
  if (n==='adobe creative'||n==='adobe')          return <BIAdobe/>;
  if (n==='microsoft 365'||n==='office 365')      return <BIOffice/>;
  if (n==='duolingo')                             return <BIDuolingo/>;
  if (n==='headspace')                            return <BIHeadspace/>;
  if (n==='nordvpn')                              return <BINordVPN/>;
  if (n==='grammarly')                            return <BIGrammarly/>;
  if (n==='instagram')                            return <BIInstagram/>;
  return <BIDefault color={color} size={size}/>;
};

const CATALOG = [
  {id:'c1',  name:'Netflix',          color:'#E50914', price:1200, cycle:'mo'},
  {id:'c2',  name:'Spotify',          color:'#1DB954', price:299,  cycle:'mo'},
  {id:'c3',  name:'YouTube Premium',  color:'#FF0000', price:399,  cycle:'mo'},
  {id:'c4',  name:'Amazon Prime',     color:'#00A8E1', price:600,  cycle:'mo'},
  {id:'c5',  name:'Disney+',          color:'#1D6DB5', price:499,  cycle:'mo'},
  {id:'c6',  name:'HBO Max',          color:'#5822B4', price:899,  cycle:'mo'},
  {id:'c7',  name:'Hulu',             color:'#1CE783', price:799,  cycle:'mo'},
  {id:'c8',  name:'Apple Music',      color:'#FC3C44', price:299,  cycle:'mo'},
  {id:'c9',  name:'ChatGPT',          color:'#10A37F', price:2000, cycle:'mo'},
  {id:'c10', name:'GitHub',           color:'#24292E', price:400,  cycle:'mo'},
  {id:'c11', name:'Figma',            color:'#F24E1E', price:1500, cycle:'mo'},
  {id:'c12', name:'Notion',           color:'#1a1a1a', price:800,  cycle:'mo'},
  {id:'c13', name:'Slack',            color:'#4A154B', price:1200, cycle:'mo'},
  {id:'c14', name:'Zoom',             color:'#2D8CFF', price:1500, cycle:'mo'},
  {id:'c15', name:'LinkedIn Premium', color:'#0077B5', price:2500, cycle:'mo'},
  {id:'c16', name:'Dropbox',          color:'#0061FF', price:600,  cycle:'mo'},
  {id:'c17', name:'Canva',            color:'#7D2AE8', price:500,  cycle:'mo'},
  {id:'c18', name:'Twitch',           color:'#9146FF', price:500,  cycle:'mo'},
  {id:'c19', name:'Adobe Creative',   color:'#FF0000', price:5000, cycle:'mo'},
  {id:'c20', name:'Microsoft 365',    color:'#D83B01', price:700,  cycle:'mo'},
  {id:'c21', name:'Duolingo',         color:'#58CC02', price:450,  cycle:'mo'},
  {id:'c22', name:'Headspace',        color:'#F47D31', price:600,  cycle:'mo'},
  {id:'c23', name:'NordVPN',          color:'#4687FF', price:400,  cycle:'mo'},
  {id:'c24', name:'Grammarly',        color:'#15C39A', price:800,  cycle:'mo'},
  {id:'c25', name:'Instagram',        color:'#D92E7F', price:0,    cycle:'mo'},
];

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SumCard = ({ label, value, subVal, textColor, bgColor, borderColor, icon }) => (
  <View style={[sc2.card, { backgroundColor:bgColor, borderColor:borderColor }]}>
    <View style={sc2.row}>{icon}<Text style={[sc2.lbl, { color:textColor }]}>{label}</Text></View>
    <Text style={[sc2.val, { color:textColor }]}>{value}</Text>
    {subVal ? <Text style={[sc2.sub, { color:textColor+'AA' }]}>{subVal}</Text> : null}
  </View>
);
const sc2 = StyleSheet.create({
  card: { flex:1, borderRadius:14, padding:10, borderWidth:2, alignItems:'flex-start' },
  row:  { flexDirection:'row', alignItems:'center', marginBottom:5 },
  lbl:  { fontSize:9, fontWeight:'800', textTransform:'uppercase', letterSpacing:0.7, marginLeft:4 },
  val:  { fontSize:13, fontWeight:'900', marginBottom:1 },
  sub:  { fontSize:8, fontWeight:'600' },
});

// ─── FAB — transparent glass purple ──────────────────────────────────────────
const FAB = ({ onPress, isDark }) => {
  const bg     = isDark ? 'rgba(124,58,237,0.18)' : 'rgba(124,58,237,0.14)';
  const border = isDark ? 'rgba(124,58,237,0.70)' : 'rgba(124,58,237,0.55)';
  return (
    <TouchableOpacity
      style={[fab.base, { backgroundColor: bg, borderColor: border }]}
      onPress={onPress} activeOpacity={0.80}>
      <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
        <Path d="M12 4v16M4 12h16" stroke="#7C3AED" strokeWidth="3.2" strokeLinecap="round"/>
      </Svg>
    </TouchableOpacity>
  );
};
const fab = StyleSheet.create({
  base: { position:'absolute', bottom:92, right:18, width:56, height:56,
          borderRadius:14, borderWidth:2, alignItems:'center', justifyContent:'center' },
});

// ─── Save Button ──────────────────────────────────────────────────────────────
const SaveBtn = ({ label, onPress, isDark }) => {
  const colors = isDark ? ['#4F46E5','#7C3AED','#9B35C5'] : ['#E890C8','#D468A8','#C060C0'];
  return (
    <TouchableOpacity style={{ borderRadius:14, overflow:'hidden' }} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={colors} start={{x:0,y:0}} end={{x:1,y:0}}
        style={{ height:52, alignItems:'center', justifyContent:'center' }}>
        <Text style={{ fontSize:15, fontWeight:'800', color:'#FFF' }}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ─── Sub Cards — with due date, expired, paid status ──────────────────────────
const SubCard = ({ sub, onPress, onLongPress, sym, rate }) => {
  const overdue = isOverdue(sub.dueDate, sub.isPaid);
  const dueDateStr = sub.dueDate ? new Date(sub.dueDate).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '';
  
  return (
    <TouchableOpacity 
      style={[scard.wrap, { 
        borderColor: overdue ? '#EF444470' : sub.isPaid ? '#22C55E55' : (sub.color||'#6366F1')+'55',
        backgroundColor: overdue ? '#0D1117' : sub.isPaid ? '#0D1820' : '#0D1117'
      }]}
      onPress={() => onPress(sub)}
      onLongPress={() => onLongPress(sub.id)} 
      activeOpacity={0.80}>
      <View style={[scard.ring, { borderColor:(sub.color||'#6366F1')+'55' }]}>
        <BrandIcon name={sub.name} color={sub.color} size={20}/>
      </View>
      <View style={scard.info}>
        <Text style={scard.nm} numberOfLines={1}>{sub.name}</Text>
        <Text style={scard.pr}>{sym} {((sub.price||0)*rate).toFixed(0)}/{sub.cycle||'mo'}</Text>
        {sub.dueDate && (
          <View style={{flexDirection:'row', alignItems:'center', marginTop:3}}>
            {overdue ? (
              <Text style={{fontSize:9, fontWeight:'800', color:'#EF4444'}}>⚠ DUE DATE PASSED</Text>
            ) : sub.isPaid ? (
              <Text style={{fontSize:9, fontWeight:'800', color:'#22C55E'}}>✓ PAID</Text>
            ) : (
              <Text style={{fontSize:9, color:'rgba(255,255,255,0.40)'}}>Due: {dueDateStr}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const AddSubCard = ({ onPress }) => (
  <TouchableOpacity style={[scard.wrap, scard.addWrap]} onPress={onPress} activeOpacity={0.75}>
    <View style={[scard.ring, { borderColor:'rgba(129,140,248,0.50)' }]}>
      <Text style={{ fontSize:20, color:'#818CF8', fontWeight:'300' }}>+</Text>
    </View>
    <View style={scard.info}>
      <Text style={[scard.nm, { color:'rgba(255,255,255,0.60)' }]}>Add New</Text>
      <Text style={[scard.pr, { color:'rgba(255,255,255,0.35)' }]}>Subscription</Text>
    </View>
  </TouchableOpacity>
);

const scard = StyleSheet.create({
  wrap:    { width:CARD_W, height:CARD_H, borderRadius:14, paddingHorizontal:10,
             flexDirection:'row', alignItems:'center', backgroundColor:'#0D1117',
             borderWidth:1, marginRight:10,
             shadowColor:'#000', shadowOffset:{width:0,height:3}, shadowOpacity:0.4, shadowRadius:6, elevation:5 },
  addWrap: { borderStyle:'dashed', borderWidth:1.5, borderColor:'rgba(129,140,248,0.40)', backgroundColor:'#0D1117' },
  ring:    { width:36, height:36, borderRadius:10, borderWidth:1, marginRight:9,
             alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.07)' },
  info:    { flex:1, justifyContent:'center' },
  nm:      { fontSize:11, fontWeight:'700', color:'#F1F5F9', marginBottom:2 },
  pr:      { fontSize:10, color:'rgba(255,255,255,0.50)' },
});

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function TransactionsScreen() {
  const { state, dispatch } = useApp();
  const T      = useTheme(state.isDarkMode);
  const isDark = state.isDarkMode;
  const s      = makeStyles(T, isDark);
  const sym    = state.currency.symbol;
  const rate   = state.currency.rate;

  // ── All hooks at top level ─────────────────────────────────────────────────
  const [period,        setPeriod]       = useState('Month');
  const [search,        setSearch]       = useState('');
  const [showAdd,       setShowAdd]      = useState(false);
  const [showEdit,      setShowEdit]     = useState(false);
  const [editExp,       setEditExp]      = useState(null);
  const [amount,        setAmount]       = useState('');
  const [desc,          setDesc]         = useState('');
  const [selCat,        setSelCat]       = useState(EXPENSE_CATEGORIES[0]);
  const [expDate,       setExpDate]      = useState(new Date().toISOString().slice(0,10));
  const [isIncome,      setIsIncome]     = useState(false);
  const [isSubMode,     setIsSubMode]    = useState(false);
  const [selSub,        setSelSub]       = useState(null);
  const [focField,      setFocField]     = useState('');
  
  // Check if user is new - NO DEFAULT SUBS for new users
  // OLD/REGISTERED users get default subs with some marked as paid
  const isNewUser = state.isNewUser ?? (state.user?.pass === undefined);
  
  // Default subscriptions for OLD/REGISTERED users only
  const getOldUserDefaultSubs = () => {
    if (isNewUser) return [];
    
    // Calculate dates
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    
    return [
      {
        id:'ds1', 
        name:'Netflix',  
        color:'#E50914', 
        price:1200, 
        cycle:'mo',
        dueDate: nextMonth.toISOString().slice(0,10),
        isPaid: true,
        lastPaidDate: now.toISOString().slice(0,10)
      },
      {
        id:'ds2', 
        name:'Spotify',  
        color:'#1DB954', 
        price:299,  
        cycle:'mo',
        dueDate: new Date(now.getFullYear(), now.getMonth(), 15).toISOString().slice(0,10),
        isPaid: false,
        lastPaidDate: null
      },
      {
        id:'ds3', 
        name:'ChatGPT',  
        color:'#10A37F', 
        price:2000,  
        cycle:'mo',
        dueDate: lastWeek.toISOString().slice(0,10), // Overdue
        isPaid: false,
        lastPaidDate: null
      },
    ];
  };
  
  const [extraSubs,     setExtraSubs]    = useState(getOldUserDefaultSubs());
  const [showExportPro, setShowExportPro]= useState(false);
  const [showPayModal,  setShowPayModal] = useState(false);
  const [selectedSubToPay, setSelectedSubToPay] = useState(null);
  
  // Catalog subscription customization fields
  const [catSubPrice, setCatSubPrice] = useState('');
  const [catSubDue,   setCatSubDue]   = useState('');
  const [catSubCi,    setCatSubCi]    = useState(0); // Color index for catalog sub
  
  // Custom subscription fields
  const [subNm,   setSubNm]  = useState('');
  const [subAmt,  setSubAmt] = useState('');
  const [subCyc,  setSubCyc] = useState('mo');
  const [subCi,   setSubCi]  = useState(8);
  const [subDue,  setSubDue] = useState('');

  const allSubs = extraSubs;
  const info    = getPeriodInfo(period);

  const earnedTotal = useMemo(() => {
    const lo = search.toLowerCase();
    return state.expenses.filter(e => {
      if (!e.isIncome) return false;
      if (!isInPeriod(e.date,period)) return false;
      if (!search) return true;
      return e.desc.toLowerCase().indexOf(lo)!==-1;
    }).reduce((a,e)=>a+e.amount,0);
  },[state.expenses,period,search]);

  const expTotal = useMemo(() => {
    const lo = search.toLowerCase();
    return state.expenses.filter(e => {
      if (e.isIncome) return false;
      if (!isInPeriod(e.date,period)) return false;
      if (!search) return true;
      return e.desc.toLowerCase().indexOf(lo)!==-1||e.cat.toLowerCase().indexOf(lo)!==-1;
    }).reduce((a,e)=>a+e.amount,0);
  },[state.expenses,period,search]);

  const accountBalance     = earnedTotal > 0 ? earnedTotal - expTotal : 0;
  const accountBalancePlus = accountBalance >= 0;
  const balSubVal = earnedTotal === 0
    ? 'Add income to track'
    : (accountBalancePlus ? 'In Surplus' : 'In Deficit');

  const filtered = useMemo(() => {
    const lo  = search.toLowerCase();
    let   all = state.expenses.filter(e=>isInPeriod(e.date,period));
    if (search) all=all.filter(e=>e.desc.toLowerCase().indexOf(lo)!==-1||e.cat.toLowerCase().indexOf(lo)!==-1);
    return all.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
  },[state.expenses,period,search]);

  const grouped = useMemo(() => {
    const g={};
    filtered.forEach(e=>{ const k=e.date?e.date.slice(0,10):'Unknown'; if(!g[k])g[k]=[]; g[k].push(e); });
    return Object.keys(g).sort((a,b)=>new Date(b)-new Date(a)).map(k=>[k,g[k]]);
  },[filtered]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const openAddOnSubTab = () => {
    setIsIncome(false); setIsSubMode(true);
    setSelSub(null); setAmount(''); setDesc('');
    setShowAdd(true);
  };
  const openAddOnExpenseTab = () => {
    setIsIncome(false); setIsSubMode(false);
    setShowAdd(true);
  };
  const resetAddModal = () => {
    setAmount(''); setDesc(''); setIsIncome(false);
    setIsSubMode(false); setSelSub(null);
    setSelCat(EXPENSE_CATEGORIES[0]);
    setExpDate(new Date().toISOString().slice(0,10));
    setSubNm(''); setSubAmt(''); setSubCyc('mo'); setSubCi(8); setSubDue('');
    setCatSubPrice(''); setCatSubDue(''); setCatSubCi(0);
  };

  const saveExpense = () => {
    if (isSubMode) {
      if (selSub) {
        // FROM CATALOG - use customized values or defaults
        const finalPrice = catSubPrice ? parseFloat(catSubPrice) : selSub.price;
        const finalDue = catSubDue || (() => {
          const nextDue = new Date();
          if (selSub.cycle === 'mo') nextDue.setDate(nextDue.getDate() + 30);
          else if (selSub.cycle === 'wk') nextDue.setDate(nextDue.getDate() + 7);
          else if (selSub.cycle === 'yr') nextDue.setFullYear(nextDue.getFullYear() + 1);
          return nextDue.toISOString().slice(0,10);
        })();
        const finalColor = SUB_COLORS[catSubCi] || selSub.color;
        
        if (!catSubDue) { 
          Alert.alert('Required','Enter a due date (YYYY-MM-DD).'); 
          return; 
        }
        
        const sub = {
          id: Date.now().toString(), 
          name: selSub.name, 
          color: finalColor, 
          price: finalPrice, 
          cycle: selSub.cycle,
          dueDate: finalDue,
          isPaid: false,
          lastPaidDate: null
        };
        setExtraSubs(prev => prev.concat([sub]));
        resetAddModal(); setShowAdd(false);
        Alert.alert('Saved', selSub.name+' subscription added. Due: ' + sub.dueDate);
        return;
      }
      
      // CUSTOM SUBSCRIPTION from fields
      if (!subNm.trim()) { Alert.alert('Required','Enter a service name.'); return; }
      const a = parseFloat(subAmt);
      if (!subAmt||isNaN(a)||a<=0) { Alert.alert('Required','Enter a valid amount.'); return; }
      if (!subDue) { Alert.alert('Required','Enter a due date (YYYY-MM-DD).'); return; }
      
      const sub = { 
        id: Date.now().toString(), 
        name: subNm.trim(), 
        color: SUB_COLORS[subCi], 
        price: a, 
        cycle: subCyc,
        dueDate: subDue,
        isPaid: false,
        lastPaidDate: null
      };
      setExtraSubs(prev=>prev.concat([sub]));
      resetAddModal(); setShowAdd(false);
      Alert.alert('Saved', sub.name+' added. Due: ' + sub.dueDate);
      return;
    }
    
    const p = parseFloat(amount);
    if (!amount||isNaN(p)||p<=0){Alert.alert('Error','Enter a valid amount');return;}
    if (!desc.trim()){Alert.alert('Error','Add a description');return;}
    const exp = {id:Date.now().toString(),desc:desc.trim(),amount:p,cat:selCat.name,emoji:selCat.emoji,date:expDate,isIncome};
    dispatch({type:'ADD_EXPENSE',expense:exp});
    resetAddModal(); setShowAdd(false);
    Alert.alert('Saved',exp.desc);
  };

  const openEdit = (exp)=>{ setEditExp({...exp}); setShowEdit(true); };
  const saveEdit = ()=>{
    if (!editExp.desc||!editExp.amount){Alert.alert('Error','Fill all fields');return;}
    const a=parseFloat(editExp.amount);
    if (isNaN(a)||a<=0){Alert.alert('Error','Invalid amount');return;}
    dispatch({type:'UPDATE_EXPENSE',expense:{...editExp,amount:a}});
    setShowEdit(false); setEditExp(null);
  };
  const deleteExp = ()=>Alert.alert('Delete','Are you sure?',[
    {text:'Cancel',style:'cancel'},
    {text:'Delete',style:'destructive',onPress:()=>{
      dispatch({type:'DELETE_EXPENSE',id:editExp.id});
      setShowEdit(false); setEditExp(null);
    }},
  ]);
  const deleteSub = (id)=>Alert.alert('Remove','Remove subscription?',[
    {text:'Cancel',style:'cancel'},
    {text:'Remove',style:'destructive',onPress:()=>setExtraSubs(prev=>prev.filter(x=>x.id!==id))},
  ]);

  // Handle subscription card click
  const handleSubClick = (sub) => {
    setSelectedSubToPay(sub);
    setShowPayModal(true);
  };

  // Mark subscription as paid
  const markSubAsPaid = () => {
    if (!selectedSubToPay) return;
    
    // Add to transactions
    dispatch({type:'ADD_EXPENSE', expense:{
      id: Date.now().toString(), 
      desc: selectedSubToPay.name + ' Subscription',
      amount: selectedSubToPay.price, 
      cat: 'Bills', 
      emoji: '📱',
      date: new Date().toISOString(), 
      isIncome: false,
    }});
    
    // Update subscription status
    setExtraSubs(prev => prev.map(s => {
      if (s.id === selectedSubToPay.id) {
        // Calculate next due date
        const nextDue = new Date();
        if (s.cycle === 'mo') nextDue.setDate(nextDue.getDate() + 30);
        else if (s.cycle === 'wk') nextDue.setDate(nextDue.getDate() + 7);
        else if (s.cycle === 'yr') nextDue.setFullYear(nextDue.getFullYear() + 1);
        
        return {
          ...s,
          isPaid: true,
          lastPaidDate: new Date().toISOString().slice(0,10),
          dueDate: nextDue.toISOString().slice(0,10)
        };
      }
      return s;
    }));
    
    setShowPayModal(false);
    setSelectedSubToPay(null);
    Alert.alert('Payment Recorded', `${selectedSubToPay.name} marked as paid and added to transactions.`);
  };

  // When selecting a catalog subscription, find its color index
  useEffect(() => {
    if (selSub) {
      const colorIndex = SUB_COLORS.findIndex(c => c === selSub.color);
      setCatSubCi(colorIndex >= 0 ? colorIndex : 0);
      setCatSubPrice(String(selSub.price));
    }
  }, [selSub]);

  // ── Modal theme — WHITE light / DARK dark ──────────────────────────────────
  const MBG  = isDark ? '#0F0F18'                        : '#FFFFFF';
  const MTXT = isDark ? '#F1F5F9'                        : '#0F172A';
  const MMUT = isDark ? '#64748B'                        : '#64748B';
  const IBG  = isDark ? 'rgba(255,255,255,0.07)'         : 'rgba(0,0,0,0.04)';
  const IBD  = isDark ? 'rgba(255,255,255,0.12)'         : 'rgba(0,0,0,0.10)';
  const FBD  = isDark ? 'rgba(163,230,53,0.65)'          : 'rgba(99,102,241,0.65)';
  const HND  = isDark ? 'rgba(255,255,255,0.20)'         : 'rgba(0,0,0,0.14)';
  const MBD  = isDark ? 'rgba(255,255,255,0.08)'         : 'rgba(0,0,0,0.08)';

  // Type toggle buttons
  const expActive = !isIncome && !isSubMode;
  const expBG=expActive?'#EF444420':IBG; const expBD=expActive?'#EF444470':IBD; const expTC=expActive?'#EF4444':MMUT;
  const incBG=isIncome?'#22C55E20':IBG;  const incBD=isIncome?'#22C55E70':IBD;  const incTC=isIncome?'#22C55E':MMUT;
  const subBG=isSubMode?'#818CF820':IBG; const subBD=isSubMode?'#818CF870':IBD; const subTC=isSubMode?'#818CF8':MMUT;
  const saveLabel=isSubMode?'Add Subscription':isIncome?'Save Earned':'Save Expense';

  // Summary card colors
  const earnedTxt='#16A34A'; const expTxt='#DC2626'; const balTxt='#6366F1';
  const balBg = isDark?'rgba(99,102,241,0.15)':'rgba(99,102,241,0.10)';
  const balBd = 'rgba(99,102,241,0.55)';
  const earnedBg = isDark?'rgba(22,163,74,0.14)':'rgba(22,163,74,0.11)';
  const earnedBd = 'rgba(22,163,74,0.55)';
  const expBgC   = isDark?'rgba(220,38,38,0.14)':'rgba(220,38,38,0.11)';
  const expBdC   = 'rgba(220,38,38,0.55)';
  const exportColor  = isDark ? '#A3E635' : '#6366F1';
  const exportBorder = isDark ? 'rgba(163,230,53,0.30)' : 'rgba(99,102,241,0.30)';

  return (
    <ScreenWrapper isDarkMode={isDark}>

      {/* Topbar */}
      <View style={s.topbar}>
        <View>
          <Text style={s.title}>Transactions</Text>
          <Text style={s.subtitle}>{info.label}</Text>
        </View>
        <TouchableOpacity style={[s.ib,{borderColor:exportBorder}]} onPress={()=>setShowExportPro(true)}>
          <ExportIcon color={exportColor}/>
        </TouchableOpacity>
      </View>

      {/* Period Tabs */}
      <View style={[s.tabs,{backgroundColor:T.card,borderColor:isDark?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.10)'}]}>
        {PERIODS.map(p=>{
          const active=period===p;
          return (
            <TouchableOpacity key={p}
              style={[s.tab,active&&{backgroundColor:isDark?'rgba(163,230,53,0.15)':'rgba(99,102,241,0.12)',borderRadius:9}]}
              onPress={()=>setPeriod(p)}>
              <Text style={[s.tabT,{color:active?T.primary:T.muted,fontWeight:active?'800':'600'}]}>{p}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Summary Cards */}
      <View style={s.sumRow}>
        <SumCard label="Earned" value={'+ '+sym+' '+(earnedTotal*rate).toFixed(0)} subVal={info.earnedLabel}
          textColor={earnedTxt} bgColor={earnedBg} borderColor={earnedBd} icon={<WalletSmIcon color={earnedTxt} size={11}/>}/>
        <View style={{width:6}}/>
        <SumCard label="Expenses" value={'- '+sym+' '+(expTotal*rate).toFixed(0)} subVal={info.label}
          textColor={expTxt} bgColor={expBgC} borderColor={expBdC} icon={<CardSmIcon color={expTxt} size={11}/>}/>
        <View style={{width:6}}/>
        <SumCard
          label="Balance"
          value={(accountBalancePlus?'+ ':' - ')+sym+' '+Math.abs(accountBalance*rate).toFixed(0)}
          subVal={balSubVal} textColor={balTxt} bgColor={balBg} borderColor={balBd}
          icon={<BalanceIcon color={balTxt} size={11}/>}/>
      </View>

      {/* Search */}
      <View style={s.search}>
        <Text style={{color:T.muted,fontSize:14}}>🔍</Text>
        <TextInput style={s.searchIn} placeholder="Search..." placeholderTextColor={T.muted}
          value={search} onChangeText={setSearch}/>
        {search.length>0&&<TouchableOpacity onPress={()=>setSearch('')}><Text style={{color:T.muted,fontSize:16}}>✕</Text></TouchableOpacity>}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:8}}>

        {/* Sub Strip */}
        <View style={s.subHdr}>
          <Text style={s.sl}>Subscriptions</Text>
          <Text style={[s.slSm,{color:T.muted}]}>{allSubs.length} · tap to pay, long press to remove</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{marginBottom:18}} contentContainerStyle={{paddingHorizontal:14}}>
          {allSubs.map(sub=>(
            <SubCard key={sub.id} sub={sub} onPress={handleSubClick} onLongPress={deleteSub} sym={sym} rate={rate}/>
          ))}
          <AddSubCard onPress={openAddOnSubTab}/>
        </ScrollView>

        {/* Transaction List */}
        {grouped.length===0 ? (
          <View style={s.emptyWrap}>
            <EmptyIllustration color={isDark?'#A3E635':'#6366F1'}/>
            <Text style={[s.emptyTitle,{color:T.text}]}>No transactions yet</Text>
            <Text style={[s.emptySub,{color:T.muted}]}>
              Tap the{' '}
              <Text style={{color:isDark?'#A3E635':'#6366F1',fontWeight:'800'}}>+</Text>
              {' '}button below to log your{'\n'}first transaction for this period
            </Text>
          </View>
        ) : grouped.map(([date,exps])=>(
          <View key={date}>
            <View style={s.dateRow}>
              <Text style={s.dateLbl}>{fmtDate(date)}</Text>
              <View style={s.dateLine}/>
            </View>
            {exps.map(exp=>{
              const inc=exp.isIncome;
              const amtColor=inc?'#16A34A':'#DC2626';
              const bColor=inc?'rgba(22,163,74,0.18)':isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
              const nmColor=inc?'#16A34A':T.text;
              const badgeBg=inc?'rgba(22,163,74,0.14)':'rgba(220,38,38,0.14)';
              const logoBg=inc?'rgba(22,163,74,0.14)':isDark?'rgba(255,255,255,0.07)':T.card2;
              return (
                <TouchableOpacity key={exp.id}
                  style={[s.txItem,{borderColor:bColor,borderLeftColor:amtColor,borderLeftWidth:3}]}
                  onPress={()=>openEdit(exp)} activeOpacity={0.75}>
                  <View style={[s.txLogo,{backgroundColor:logoBg,borderWidth:inc?1:0,borderColor:'rgba(22,163,74,0.35)'}]}>
                    {inc?<SalaryIcon color="#16A34A" size={20}/>:<Text style={{fontSize:18}}>{exp.emoji}</Text>}
                  </View>
                  <View style={{flex:1}}>
                    <Text style={[s.txNm,{color:nmColor}]} numberOfLines={1}>{exp.desc}</Text>
                    <Text style={s.txCat}>{exp.cat} · {exp.date?exp.date.slice(0,10):''}</Text>
                  </View>
                  <View style={{alignItems:'flex-end'}}>
                    <Text style={[s.txAmt,{color:amtColor}]}>{inc?'+ ':' - '}{sym} {(exp.amount*rate).toFixed(0)}</Text>
                    <View style={[s.txBadge,{backgroundColor:badgeBg}]}>
                      <Text style={{fontSize:9,fontWeight:'800',color:amtColor}}>{inc?'EARNED':'EXPENSE'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* FAB */}
      <FAB onPress={openAddOnExpenseTab} isDark={isDark}/>

      {/* ══════════════════════════════════════════════════════════════════════
          UNIFIED ADD MODAL
          ══════════════════════════════════════════════════════════════════════ */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={()=>{resetAddModal();setShowAdd(false);}}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={()=>{resetAddModal();setShowAdd(false);}}>
            <TouchableOpacity activeOpacity={1} onPress={()=>{}}
              style={[s.modal,{backgroundColor:MBG,borderColor:MBD}]}>

              <View style={[s.handle,{backgroundColor:HND}]}/>

              {/* Header */}
              <View style={{paddingHorizontal:18,marginBottom:14}}>
                <Text style={[s.modalT,{color:MTXT}]}>Add Transaction</Text>
                <Text style={{fontSize:12,color:MMUT,marginTop:2}}>Choose type below</Text>
              </View>

              {/* Type toggle */}
              <View style={{flexDirection:'row',marginHorizontal:18,marginBottom:16}}>
                <TouchableOpacity style={[s.togBtn,{backgroundColor:expBG,borderColor:expBD}]}
                  onPress={()=>{setIsIncome(false);setIsSubMode(false);}} activeOpacity={0.8}>
                  <CardSmIcon color={expTC} size={14}/>
                  <Text style={{fontSize:11,fontWeight:'800',marginTop:3,color:expTC}}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.togBtn,{backgroundColor:incBG,borderColor:incBD}]}
                  onPress={()=>{setIsIncome(true);setIsSubMode(false);}} activeOpacity={0.8}>
                  <WalletSmIcon color={incTC} size={14}/>
                  <Text style={{fontSize:11,fontWeight:'800',marginTop:3,color:incTC}}>Earned</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.togBtn,{backgroundColor:subBG,borderColor:subBD,marginRight:0}]}
                  onPress={()=>{setIsSubMode(true);setIsIncome(false);}} activeOpacity={0.8}>
                  <Text style={{fontSize:14}}>🔄</Text>
                  <Text style={{fontSize:9,fontWeight:'800',marginTop:3,color:subTC}}>Subscription</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight:480}} keyboardShouldPersistTaps="handled">

                {/* ── Subscription tab ── */}
                {isSubMode ? (
                  <View>
                    {/* Catalog */}
                    <View style={{paddingHorizontal:14,marginBottom:10}}>
                      <Text style={[s.editLbl,{color:MMUT,marginBottom:12}]}>SELECT FROM CATALOG · {CATALOG.length} services</Text>
                      {Array.from({length:Math.ceil(CATALOG.length/2)},(_,ri)=>{
                        const pair=CATALOG.slice(ri*2,ri*2+2);
                        return (
                          <View key={ri} style={{flexDirection:'row',marginBottom:8}}>
                            {pair.map((item,ci)=>{
                              const isSel=selSub&&selSub.id===item.id;
                              return (
                                <TouchableOpacity key={item.id}
                                  style={{flex:1,flexDirection:'row',alignItems:'center',
                                    paddingHorizontal:10,paddingVertical:10,borderRadius:13,
                                    borderWidth:1.5,marginLeft:ci===1?8:0,
                                    backgroundColor:isSel?item.color+'22':IBG,
                                    borderColor:isSel?item.color:IBD}}
                                  onPress={()=>setSelSub(item)} activeOpacity={0.75}>
                                  <View style={{width:32,height:32,borderRadius:9,alignItems:'center',
                                    justifyContent:'center',backgroundColor:item.color+'22',marginRight:9}}>
                                    <BrandIcon name={item.name} color={item.color} size={19}/>
                                  </View>
                                  <View style={{flex:1}}>
                                    <Text style={{color:MTXT,fontSize:11,fontWeight:'700'}} numberOfLines={1}>{item.name}</Text>
                                    <Text style={{color:MMUT,fontSize:9,marginTop:1}}>{sym} {((item.price||0)*rate).toFixed(0)}/{item.cycle}</Text>
                                  </View>
                                  {isSel&&<View style={{width:16,height:16,borderRadius:8,backgroundColor:item.color,alignItems:'center',justifyContent:'center'}}><Text style={{color:'#fff',fontSize:9,fontWeight:'900'}}>✓</Text></View>}
                                </TouchableOpacity>
                              );
                            })}
                            {pair.length===1&&<View style={{flex:1,marginLeft:8}}/>}
                          </View>
                        );
                      })}
                    </View>

                    {/* CATALOG CUSTOMIZATION - shown when catalog item is selected */}
                    {selSub && (
                      <View style={{marginHorizontal:14,marginBottom:16,padding:14,borderRadius:14,
                        backgroundColor:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.03)',
                        borderWidth:1,borderColor:selSub.color+'44'}}>
                        <Text style={{fontSize:12,fontWeight:'800',color:selSub.color,marginBottom:12}}>
                          ✨ Customize {selSub.name}
                        </Text>
                        
                        <Text style={[s.editLbl,{color:MMUT}]}>Price (optional - default: {sym}{selSub.price})</Text>
                        <TextInput style={[s.mi,{backgroundColor:IBG,borderColor:focField==='catprice'?FBD:IBD,color:MTXT}]}
                          value={catSubPrice} onChangeText={t=>setCatSubPrice(clean(t))}
                          placeholder={String(selSub.price)} placeholderTextColor={MMUT}
                          keyboardType="decimal-pad"
                          onFocus={()=>setFocField('catprice')} onBlur={()=>setFocField('')}/>
                        
                        <Text style={[s.editLbl,{color:MMUT}]}>Due Date (YYYY-MM-DD) *</Text>
                        <TextInput style={[s.mi,{backgroundColor:IBG,borderColor:focField==='catdue'?FBD:IBD,color:MTXT}]}
                          value={catSubDue} onChangeText={setCatSubDue}
                          placeholder="2026-06-15" placeholderTextColor={MMUT}
                          onFocus={()=>setFocField('catdue')} onBlur={()=>setFocField('')}/>
                        
                        <Text style={[s.editLbl,{color:MMUT}]}>Color (optional)</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:4}}>
                          {SUB_COLORS.map((c,i)=>(
                            <TouchableOpacity key={c}
                              style={{width:28,height:28,borderRadius:14,marginRight:9,backgroundColor:c,
                                      borderWidth:catSubCi===i?3:0,borderColor:'#FFF'}}
                              onPress={()=>setCatSubCi(i)}/>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    {/* Or add custom */}
                    <View style={{flexDirection:'row',alignItems:'center',gap:10,marginHorizontal:14,marginBottom:16,marginTop:4}}>
                      <View style={{flex:1,height:1,backgroundColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}}/>
                      <Text style={{fontSize:10,fontWeight:'700',color:MMUT,letterSpacing:1}}>OR ADD CUSTOM</Text>
                      <View style={{flex:1,height:1,backgroundColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}}/>
                    </View>
                    <View style={{marginHorizontal:14,marginBottom:10}}>
                      <Text style={[s.editLbl,{color:MMUT}]}>Service Name</Text>
                      <TextInput style={[s.mi,{backgroundColor:IBG,borderColor:focField==='snm'?FBD:IBD,color:MTXT}]}
                        value={subNm} onChangeText={setSubNm} placeholder="e.g. iCloud" placeholderTextColor={MMUT}
                        onFocus={()=>setFocField('snm')} onBlur={()=>setFocField('')}/>
                      <Text style={[s.editLbl,{color:MMUT}]}>Amount</Text>
                      <TextInput style={[s.mi,{backgroundColor:IBG,borderColor:focField==='samt'?FBD:IBD,color:MTXT}]}
                        value={subAmt} onChangeText={t=>setSubAmt(clean(t))} placeholder="e.g. 299"
                        placeholderTextColor={MMUT} keyboardType="decimal-pad"
                        onFocus={()=>setFocField('samt')} onBlur={()=>setFocField('')}/>
                      <Text style={[s.editLbl,{color:MMUT}]}>Due Date (YYYY-MM-DD)</Text>
                      <TextInput style={[s.mi,{backgroundColor:IBG,borderColor:focField==='sdue'?FBD:IBD,color:MTXT}]}
                        value={subDue} onChangeText={setSubDue} placeholder="2026-06-15"
                        placeholderTextColor={MMUT}
                        onFocus={()=>setFocField('sdue')} onBlur={()=>setFocField('')}/>
                      <Text style={[s.editLbl,{color:MMUT}]}>Billing Cycle</Text>
                      <View style={{flexDirection:'row',marginBottom:12}}>
                        {[['mo','Monthly'],['wk','Weekly'],['yr','Yearly']].map(([v,l])=>(
                          <TouchableOpacity key={v}
                            style={[s.cycBtn,{backgroundColor:subCyc===v?'#6366F1':IBG,borderColor:subCyc===v?'#6366F1':IBD}]}
                            onPress={()=>setSubCyc(v)} activeOpacity={0.8}>
                            <Text style={{fontSize:12,fontWeight:'700',color:subCyc===v?'#fff':MMUT}}>{l}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      <Text style={[s.editLbl,{color:MMUT}]}>Colour</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:4}}>
                        {SUB_COLORS.map((c,i)=>(
                          <TouchableOpacity key={c}
                            style={{width:28,height:28,borderRadius:14,marginRight:9,backgroundColor:c,
                                    borderWidth:subCi===i?3:0,borderColor:'#FFF'}}
                            onPress={()=>setSubCi(i)}/>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                ) : (
                  /* ── Expense / Earned tab ── */
                  <View>
                    <View style={s.amtWrap}>
                      <Text style={[s.amtSym,{color:MMUT}]}>{sym}</Text>
                      <TextInput style={[s.amtIn,{color:MTXT}]} value={amount}
                        onChangeText={t=>setAmount(clean(t))} keyboardType="decimal-pad"
                        placeholder="0.00" placeholderTextColor={MMUT} autoFocus/>
                    </View>
                    <TextInput style={[s.mi,{marginHorizontal:18,backgroundColor:IBG,borderColor:focField==='desc'?FBD:IBD,color:MTXT}]}
                      value={desc} onChangeText={setDesc} placeholder="Description" placeholderTextColor={MMUT}
                      onFocus={()=>setFocField('desc')} onBlur={()=>setFocField('')}/>
                    <TextInput style={[s.mi,{marginHorizontal:18,backgroundColor:IBG,borderColor:focField==='date'?FBD:IBD,color:MTXT}]}
                      value={expDate} onChangeText={setExpDate} placeholder="YYYY-MM-DD" placeholderTextColor={MMUT}
                      onFocus={()=>setFocField('date')} onBlur={()=>setFocField('')}/>
                    {!isIncome&&(
                      <View>
                        <Text style={[s.sl,{marginLeft:18,marginBottom:10,color:MMUT}]}>Category</Text>
                        <View style={s.catGrid}>
                          {EXPENSE_CATEGORIES.map(cat=>{
                            const sel=selCat.id===cat.id;
                            return (
                              <TouchableOpacity key={cat.id}
                                style={[s.catItem,{backgroundColor:sel?T.primaryGlow:IBG,borderColor:sel?T.primary:IBD}]}
                                onPress={()=>setSelCat(cat)} activeOpacity={0.75}>
                                <Text style={{fontSize:20,marginBottom:3}}>{cat.emoji}</Text>
                                <Text style={[s.catNm,{color:sel?T.primary:MMUT}]}>{cat.name}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                <View style={{marginHorizontal:18,marginTop:8,marginBottom:16}}>
                  <SaveBtn label={saveLabel} onPress={saveExpense} isDark={isDark}/>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={showEdit} animationType="slide" transparent onRequestClose={()=>setShowEdit(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={()=>setShowEdit(false)}>
          <TouchableOpacity activeOpacity={1} onPress={()=>{}} style={[s.modal,{backgroundColor:MBG,borderColor:MBD}]}>
            <View style={[s.handle,{backgroundColor:HND}]}/>
            {editExp&&(
              <View>
                <View style={{flexDirection:'row',alignItems:'center',paddingHorizontal:18,marginBottom:16}}>
                  <View style={{width:44,height:44,borderRadius:13,
                    backgroundColor:editExp.isIncome?'rgba(22,163,74,0.14)':isDark?'rgba(255,255,255,0.07)':T.card2,
                    alignItems:'center',justifyContent:'center',marginRight:12}}>
                    {editExp.isIncome?<SalaryIcon color="#16A34A" size={22}/>:<Text style={{fontSize:22}}>{editExp.emoji}</Text>}
                  </View>
                  <View>
                    <Text style={[s.modalT,{color:MTXT,paddingHorizontal:0,marginBottom:0}]}>Edit Transaction</Text>
                    <Text style={{fontSize:12,color:MMUT,marginTop:2}}>{editExp.cat}</Text>
                  </View>
                </View>
                <View style={{padding:18}}>
                  <Text style={[s.editLbl,{color:MMUT}]}>Description</Text>
                  <TextInput style={[s.mi,{backgroundColor:IBG,borderColor:IBD,color:MTXT}]}
                    value={editExp.desc} onChangeText={v=>setEditExp(p=>({...p,desc:v}))} placeholderTextColor={MMUT}/>
                  <Text style={[s.editLbl,{color:MMUT}]}>Amount</Text>
                  <TextInput style={[s.mi,{backgroundColor:IBG,borderColor:IBD,color:MTXT}]}
                    value={String(editExp.amount)} onChangeText={v=>setEditExp(p=>({...p,amount:clean(v)}))}
                    keyboardType="decimal-pad" placeholderTextColor={MMUT}/>
                  <Text style={[s.editLbl,{color:MMUT}]}>Date</Text>
                  <TextInput style={[s.mi,{backgroundColor:IBG,borderColor:IBD,color:MTXT}]}
                    value={editExp.date?editExp.date.slice(0,10):''}
                    onChangeText={v=>setEditExp(p=>({...p,date:v}))} placeholderTextColor={MMUT}/>
                  <View style={{flexDirection:'row',marginBottom:10}}>
                    <TouchableOpacity style={{flex:1,height:50,borderRadius:14,borderWidth:1.5,
                      borderColor:isDark?'rgba(255,255,255,0.18)':'rgba(0,0,0,0.14)',
                      alignItems:'center',justifyContent:'center',marginRight:10}}
                      onPress={()=>{setShowEdit(false);setEditExp(null);}}>
                      <Text style={{color:MMUT,fontWeight:'700',fontSize:14}}>Cancel</Text>
                    </TouchableOpacity>
                    <View style={{flex:2}}>
                      <SaveBtn label="Save Changes" onPress={saveEdit} isDark={isDark}/>
                    </View>
                  </View>
                  <TouchableOpacity style={{height:50,borderRadius:14,backgroundColor:'rgba(220,38,38,0.10)',
                    borderWidth:1.5,borderColor:'rgba(220,38,38,0.30)',alignItems:'center',justifyContent:'center'}}
                    onPress={deleteExp} activeOpacity={0.8}>
                    <Text style={{color:'#DC2626',fontWeight:'700',fontSize:14}}>Delete Transaction</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* PAY SUBSCRIPTION MODAL */}
      <Modal visible={showPayModal} animationType="slide" transparent onRequestClose={()=>setShowPayModal(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={()=>setShowPayModal(false)}>
          <TouchableOpacity activeOpacity={1} onPress={()=>{}} style={[s.modal,{backgroundColor:MBG,borderColor:MBD}]}>
            <View style={[s.handle,{backgroundColor:HND}]}/>
            {selectedSubToPay && (
              <View style={{padding:24}}>
                <View style={{alignItems:'center',marginBottom:24}}>
                  <View style={{width:64,height:64,borderRadius:18,alignItems:'center',justifyContent:'center',
                    backgroundColor:selectedSubToPay.color+'22',marginBottom:14,
                    borderWidth:2,borderColor:selectedSubToPay.color+'55'}}>
                    <BrandIcon name={selectedSubToPay.name} color={selectedSubToPay.color} size={32}/>
                  </View>
                  <Text style={{fontSize:20,fontWeight:'800',color:MTXT,marginBottom:6}}>
                    {selectedSubToPay.name}
                  </Text>
                  <Text style={{fontSize:15,fontWeight:'700',color:selectedSubToPay.color}}>
                    {sym} {(selectedSubToPay.price * rate).toFixed(0)}/{selectedSubToPay.cycle}
                  </Text>
                  {selectedSubToPay.dueDate && (
                    <Text style={{fontSize:12,color:MMUT,marginTop:8}}>
                      Due: {new Date(selectedSubToPay.dueDate).toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
                    </Text>
                  )}
                  {isOverdue(selectedSubToPay.dueDate, selectedSubToPay.isPaid) && (
                    <View style={{marginTop:8,paddingHorizontal:12,paddingVertical:4,borderRadius:8,backgroundColor:'rgba(239,68,68,0.15)'}}>
                      <Text style={{fontSize:11,fontWeight:'800',color:'#EF4444'}}>⚠ PAYMENT OVERDUE</Text>
                    </View>
                  )}
                  {selectedSubToPay.isPaid && (
                    <View style={{marginTop:8,paddingHorizontal:12,paddingVertical:4,borderRadius:8,backgroundColor:'rgba(34,197,94,0.15)'}}>
                      <Text style={{fontSize:11,fontWeight:'800',color:'#22C55E'}}>✓ PAID</Text>
                    </View>
                  )}
                </View>
                
                {!selectedSubToPay.isPaid && (
                  <SaveBtn label="PAY NOW" onPress={markSubAsPaid} isDark={isDark}/>
                )}
                
                <TouchableOpacity 
                  style={{height:44,alignItems:'center',justifyContent:'center',marginTop:12}}
                  onPress={()=>setShowPayModal(false)}>
                  <Text style={{fontSize:14,fontWeight:'600',color:MMUT}}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Export Pro Modal */}
      <Modal visible={showExportPro} animationType="slide" transparent onRequestClose={()=>setShowExportPro(false)}>
        <TouchableOpacity style={{flex:1,backgroundColor:'rgba(0,0,0,0.72)',justifyContent:'flex-end'}}
          activeOpacity={1} onPress={()=>setShowExportPro(false)}>
          <TouchableOpacity activeOpacity={1} onPress={()=>{}}
            style={{borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,paddingTop:10,maxHeight:'92%',
              backgroundColor:MBG, borderColor:MBD}}>
            <View style={{width:36,height:4,borderRadius:2,alignSelf:'center',marginBottom:18,backgroundColor:HND}}/>
            <View style={{alignItems:'center',paddingHorizontal:24,paddingBottom:24}}>
              <View style={{width:64,height:64,borderRadius:20,alignItems:'center',justifyContent:'center',marginBottom:14,
                backgroundColor:isDark?'rgba(163,230,53,0.10)':'rgba(99,102,241,0.10)',
                borderWidth:1.5,borderColor:isDark?'rgba(163,230,53,0.25)':'rgba(99,102,241,0.25)'}}>
                <Text style={{fontSize:34}}>👑</Text>
              </View>
              <Text style={{fontSize:21,fontWeight:'800',color:MTXT,marginBottom:7}}>SpendWise Pro</Text>
              <Text style={{fontSize:13,color:MMUT,textAlign:'center',lineHeight:20,marginBottom:20}}>
                Export your full transaction history and unlock powerful finance tools
              </Text>
              {[['📤','Export as CSV or PDF'],['📊','Advanced analytics & charts'],['🔔','Smart budget alerts'],['☁️','Multi-device cloud sync']].map(([icon,feat])=>(
                <View key={feat} style={{flexDirection:'row',alignItems:'center',gap:12,width:'100%',marginBottom:11}}>
                  <View style={{width:32,height:32,borderRadius:9,alignItems:'center',justifyContent:'center',
                    backgroundColor:isDark?'rgba(163,230,53,0.10)':'rgba(99,102,241,0.08)',
                    borderWidth:1,borderColor:isDark?'rgba(163,230,53,0.18)':'rgba(99,102,241,0.12)'}}>
                    <Text style={{fontSize:16}}>{icon}</Text>
                  </View>
                  <Text style={{fontSize:13,fontWeight:'600',color:MTXT,flex:1}}>{feat}</Text>
                </View>
              ))}
              <View style={{width:'100%',marginTop:8}}>
                <TouchableOpacity style={{borderRadius:14,overflow:'hidden',marginBottom:10}} onPress={()=>setShowExportPro(false)}>
                  <LinearGradient colors={isDark?['#4F46E5','#7C3AED','#9B35C5']:['#E890C8','#D468A8','#C060C0']}
                    start={{x:0,y:0}} end={{x:1,y:0}}
                    style={{height:52,alignItems:'center',justifyContent:'center'}}>
                    <Text style={{fontSize:15,fontWeight:'800',color:'#FFF'}}>Upgrade to Pro</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={{height:40,alignItems:'center',justifyContent:'center'}} onPress={()=>setShowExportPro(false)}>
                  <Text style={{fontSize:13,fontWeight:'600',color:MMUT}}>Maybe later</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </ScreenWrapper>
  );
}

const makeStyles = (T, isDark) => StyleSheet.create({
  topbar:  {flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',paddingHorizontal:14,paddingTop:8,paddingBottom:6},
  title:   {fontSize:20,fontWeight:'800',color:T.text,letterSpacing:-0.4},
  subtitle:{fontSize:11,color:T.muted,fontWeight:'600',marginTop:2},
  ib:      {width:38,height:38,borderRadius:12,borderWidth:1,backgroundColor:T.card,alignItems:'center',justifyContent:'center'},
  tabs:    {flexDirection:'row',borderRadius:12,marginHorizontal:14,marginBottom:12,padding:3,borderWidth:1},
  tab:     {flex:1,height:32,alignItems:'center',justifyContent:'center'},
  tabT:    {fontSize:11},
  sumRow:  {flexDirection:'row',marginHorizontal:14,marginBottom:12},
  search:  {flexDirection:'row',alignItems:'center',backgroundColor:T.card,borderWidth:1,borderColor:T.border2,borderRadius:13,paddingHorizontal:12,marginHorizontal:14,marginBottom:12,height:42},
  searchIn:{flex:1,color:T.text,fontSize:13,marginLeft:8},
  subHdr:  {flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:14,marginBottom:10},
  sl:      {fontSize:10,color:T.muted,letterSpacing:0.9,textTransform:'uppercase',fontWeight:'800'},
  slSm:    {fontSize:10,fontWeight:'600'},
  emptyWrap: {alignItems:'center',paddingVertical:36,paddingHorizontal:24},
  emptyTitle:{fontSize:16,fontWeight:'800',color:T.text,marginTop:14,marginBottom:8},
  emptySub:  {fontSize:13,color:T.muted,textAlign:'center',lineHeight:20},
  dateRow: {flexDirection:'row',alignItems:'center',paddingHorizontal:14,paddingVertical:6},
  dateLbl: {fontSize:10,color:T.muted,fontWeight:'800',letterSpacing:0.7,textTransform:'uppercase',marginRight:10},
  dateLine:{flex:1,height:1,backgroundColor:T.border,opacity:0.5},
  txItem:  {flexDirection:'row',alignItems:'center',paddingVertical:11,paddingHorizontal:12,marginHorizontal:14,marginBottom:6,borderRadius:16,backgroundColor:T.card,borderWidth:1},
  txLogo:  {width:40,height:40,borderRadius:13,alignItems:'center',justifyContent:'center',marginRight:11},
  txNm:    {fontSize:13,fontWeight:'700',marginBottom:2},
  txCat:   {fontSize:10,color:T.muted,fontWeight:'600'},
  txAmt:   {fontSize:13,fontWeight:'800',marginBottom:4},
  txBadge: {paddingHorizontal:6,paddingVertical:2,borderRadius:5},
  overlay: {flex:1,backgroundColor:'rgba(0,0,0,0.72)',justifyContent:'flex-end'},
  modal:   {borderRadius:28,borderBottomLeftRadius:0,borderBottomRightRadius:0,maxHeight:'94%',borderWidth:1},
  handle:  {width:36,height:4,borderRadius:2,alignSelf:'center',marginTop:12,marginBottom:14},
  modalT:  {fontSize:18,fontWeight:'800',paddingHorizontal:18,marginBottom:4},
  togBtn:  {flex:1,height:48,borderRadius:11,borderWidth:1.5,alignItems:'center',justifyContent:'center',paddingVertical:6,marginRight:7},
  amtWrap: {flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:16,paddingHorizontal:18},
  amtSym:  {fontSize:30,fontWeight:'700',marginRight:4},
  amtIn:   {fontSize:42,fontWeight:'700',minWidth:120,letterSpacing:-1},
  mi:      {height:50,borderRadius:13,borderWidth:1.2,fontSize:15,paddingHorizontal:14,marginBottom:12},
  catGrid: {flexDirection:'row',flexWrap:'wrap',paddingHorizontal:18,marginBottom:14},
  catItem: {width:'22%',borderRadius:13,borderWidth:2,padding:8,alignItems:'center',margin:3},
  catNm:   {fontSize:9,fontWeight:'700'},
  editLbl: {fontSize:10,fontWeight:'800',textTransform:'uppercase',letterSpacing:0.8,marginBottom:8},
  cycBtn:  {flex:1,height:40,borderRadius:10,borderWidth:1.5,alignItems:'center',justifyContent:'center',marginRight:8},
});
