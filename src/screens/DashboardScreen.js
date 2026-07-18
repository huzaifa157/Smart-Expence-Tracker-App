import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../utils/ScreenWrapper';
import Svg, { Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import { useApp }   from '../context/AppContext';
import { useTheme } from '../utils/theme';
import { GAMIFICATION_LEVELS, EXPENSE_CATEGORIES, GOAL_ICONS } from '../data/mockData';

// ─── Personality SVG Icons ────────────────────────────────────────────────────
const PIcoCritical      = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M12 2L2 19h20L12 2z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" fill={c+'20'}/><Line x1="12" y1="9" x2="12" y2="13" stroke={c} strokeWidth={2} strokeLinecap="round"/><Circle cx="12" cy="16.5" r="1.1" fill={c}/></Svg>);
const PIcoFreeSpirit    = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M2 11c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><Path d="M2 16c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke={c} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/></Svg>);
const PIcoActiveSpender = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x="2" y="6" width="20" height="13" rx="3" stroke={c} strokeWidth={1.8} fill={c+'15'}/><Path d="M2 10h20" stroke={c} strokeWidth={1.8}/><Path d="M6 15h4M15 15h3" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></Svg>);
const PIcoBalanced      = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M12 3v18M5 21h14" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M5 9l-3 5h6L5 9z" stroke={c} strokeWidth={1.5} strokeLinejoin="round" fill={c+'18'}/><Path d="M19 9l-3 5h6L19 9z" stroke={c} strokeWidth={1.5} strokeLinejoin="round" fill={c+'18'}/><Path d="M5 9h14" stroke={c} strokeWidth={1.5} strokeLinecap="round"/></Svg>);
const PIcoSmartPlanner  = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x="3" y="4" width="18" height="17" rx="3" stroke={c} strokeWidth={1.8} fill={c+'12'}/><Path d="M3 9h18" stroke={c} strokeWidth={1.8}/><Path d="M8 3v3M16 3v3" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M8 14l2.5 2.5L16 12" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const PIcoMindful       = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={1.8} fill={c+'10'}/><Path d="M9 11c0-1.7 1.3-3 3-3s3 1.3 3 3" stroke={c} strokeWidth={1.6} strokeLinecap="round"/><Path d="M12 11v4" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M10 15h4" stroke={c} strokeWidth={1.5} strokeLinecap="round"/></Svg>);
const PIcoWealthBuilder = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x="3" y="13" width="4" height="8" rx="1" fill={c+'25'} stroke={c} strokeWidth={1.5}/><Rect x="10" y="9" width="4" height="12" rx="1" fill={c+'35'} stroke={c} strokeWidth={1.5}/><Rect x="17" y="5" width="4" height="16" rx="1" fill={c+'50'} stroke={c} strokeWidth={1.5}/><Path d="M5 6l4-3 4 2 4-4" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/><Path d="M17 3h2v2" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const PIcoEliteSaver    = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M12 2L2 9l10 13L22 9z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" fill={c+'18'}/><Path d="M2 9h20" stroke={c} strokeWidth={1.5}/><Path d="M7 9l5-7 5 7" stroke={c} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const PIcoGuru          = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M8 21h8M12 17v4" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 4H4a1 1 0 00-1 1v3a4 4 0 003 3.87" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M17 4h3a1 1 0 011 1v3a4 4 0 01-3 3.87" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 4h10v6a5 5 0 01-10 0V4z" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill={c+'15'}/><Path d="M10 9l1.5 1.5L14 8" stroke={c} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const PIcoMoneyMaster   = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M3 17L5 8l4.5 4.5L12 4l2.5 8.5L19 8l2 9H3z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" fill={c+'20'}/><Path d="M3 17h18" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Circle cx="5" cy="8" r="1.2" fill={c}/><Circle cx="12" cy="4" r="1.2" fill={c}/><Circle cx="19" cy="8" r="1.2" fill={c}/></Svg>);

function getPersonalitySvg(r) {
  if (r>=65) return {SvgIcon:PIcoMoneyMaster,  color:'#A3E635', label:'Money Master'};
  if (r>=50) return {SvgIcon:PIcoGuru,          color:'#6366F1', label:'Financial Guru'};
  if (r>=40) return {SvgIcon:PIcoEliteSaver,    color:'#14B8A6', label:'Elite Saver'};
  if (r>=35) return {SvgIcon:PIcoWealthBuilder, color:'#10B981', label:'Wealth Builder'};
  if (r>=30) return {SvgIcon:PIcoMindful,       color:'#22C55E', label:'Mindful Spender'};
  if (r>=25) return {SvgIcon:PIcoSmartPlanner,  color:'#84CC16', label:'Smart Planner'};
  if (r>=20) return {SvgIcon:PIcoBalanced,      color:'#EAB308', label:'Balanced Budgeter'};
  if (r>=15) return {SvgIcon:PIcoActiveSpender, color:'#F59E0B', label:'Active Spender'};
  if (r>=10) return {SvgIcon:PIcoFreeSpirit,    color:'#F97316', label:'Free Spirit'};
  return         {SvgIcon:PIcoCritical,          color:'#EF4444', label:'Critical Zone'};
}

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - 14 * 2 - 10) / 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cleanNum = t => { const f=t.replace(/[^0-9.]/g,''); const p=f.split('.'); return p.length>2?p[0]+'.'+p.slice(1).join(''):f; };
function getCurrentPeriod() { const n=new Date(); return `${n.toLocaleString('default',{month:'long'})} ${n.getFullYear()}`; }
function getLastUpdated() { const n=new Date(),h=n.getHours(),m=n.getMinutes().toString().padStart(2,'0'); return `Updated ${(h%12)||12}:${m} ${h>=12?'PM':'AM'} · ${getCurrentPeriod()}`; }
function fmtTxDate(ds) {
  if (!ds) return '';
  try {
    const d=new Date(ds),now=new Date(),y=new Date(); y.setDate(now.getDate()-1);
    if (d.toDateString()===now.toDateString()) return 'Today';
    if (d.toDateString()===y.toDateString())   return 'Yesterday';
    return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  } catch(_){return '';}
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconGoal     = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={c} strokeWidth={2}/><Circle cx="12" cy="12" r="6" stroke={c} strokeWidth={2}/><Circle cx="12" cy="12" r="2" fill={c}/></Svg>);
const IconTransfer = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M7 16V4m0 0L3 8m4-4l4 4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><Path d="M17 8v12m0 0l4-4m-4 4l-4-4" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const IconExport   = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={c} strokeWidth={2} strokeLinecap="round"/><Polyline points="17 8 12 3 7 8" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><Line x1="12" y1="3" x2="12" y2="15" stroke={c} strokeWidth={2} strokeLinecap="round"/></Svg>);
const IconPlus     = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={c} strokeWidth={2}/><Line x1="12" y1="8" x2="12" y2="16" stroke={c} strokeWidth={2} strokeLinecap="round"/><Line x1="8" y1="12" x2="16" y2="12" stroke={c} strokeWidth={2} strokeLinecap="round"/></Svg>);
const IconTrophy   = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M8 21h8M12 17v4M7 4H4a1 1 0 00-1 1v3a4 4 0 003 3.87M17 4h3a1 1 0 011 1v3a4 4 0 01-3 3.87" stroke={c} strokeWidth={2} strokeLinecap="round"/><Path d="M7 4h10v6a5 5 0 01-10 0V4z" stroke={c} strokeWidth={2} strokeLinecap="round"/></Svg>);
const IconBar      = ({c,s=18}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x="18" y="3" width="4" height="18" rx="1" fill={c}/><Rect x="11" y="8" width="4" height="13" rx="1" fill={c}/><Rect x="4" y="13" width="4" height="8" rx="1" fill={c}/></Svg>);
const IconWallet   = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M21 12V7H5a2 2 0 010-4h14v4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><Path d="M3 5v14a2 2 0 002 2h16v-5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><Path d="M18 12h3v4h-3a2 2 0 010-4z" stroke={c} strokeWidth="1.8"/></Svg>);
const IconBag      = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><Line x1="3" y1="6" x2="21" y2="6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><Path d="M16 10a4 4 0 01-8 0" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></Svg>);
const IconSaved    = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8"/><Path d="M8 12l3-3 2 2 3-4" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><Path d="M14 7h3v3" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const IconSun      = ({c,s=22}) => (<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="4" stroke={c} strokeWidth="1.8"/><Line x1="12" y1="2" x2="12" y2="5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><Line x1="12" y1="19" x2="12" y2="22" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><Line x1="2" y1="12" x2="5" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><Line x1="19" y1="12" x2="22" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></Svg>);
const SalaryIcon   = ({color='#16A34A',size=18}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="2" y="8" width="20" height="12" rx="3" stroke={color} strokeWidth="1.8"/><Path d="M2 13h20" stroke={color} strokeWidth="1.5"/><Path d="M6 17h5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/><Circle cx="17" cy="17" r="1.5" fill={color}/><Path d="M12 2v5M9.5 4.5L12 2l2.5 2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></Svg>);
const CardSm       = ({color,size=14}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth="1.8"/><Path d="M2 10h20" stroke={color} strokeWidth="1.8"/><Path d="M6 15h4M16 15h2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></Svg>);
const WalletSm     = ({color,size=14}) => (<Svg width={size} height={size} viewBox="0 0 24 24" fill="none"><Rect x="2" y="7" width="20" height="14" rx="3" stroke={color} strokeWidth="1.8"/><Path d="M16 14a2 2 0 11-4 0 2 2 0 014 0z" fill={color}/><Path d="M6 7V5a4 4 0 018 0v2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/></Svg>);

// ─── Shared modal styles ───────────────────────────────────────────────────────
const ov = StyleSheet.create({
  overlay: {flex:1,backgroundColor:'rgba(0,0,0,0.72)',justifyContent:'flex-end'},
  sheet:   {borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,paddingTop:10},
  handle:  {width:36,height:4,borderRadius:2,alignSelf:'center',marginBottom:18},
  lbl:     {fontSize:11,fontWeight:'700',textTransform:'uppercase',letterSpacing:0.6,marginBottom:7},
  mi:      {height:50,borderRadius:13,borderWidth:1,fontSize:15,paddingHorizontal:14,marginBottom:12},
  togBtn:  {flex:1,height:48,borderRadius:11,borderWidth:1.5,alignItems:'center',justifyContent:'center',paddingVertical:6,marginRight:7},
});

// ─── Gradient save button ─────────────────────────────────────────────────────
const SaveBtn = ({label,onPress,isDark,disabled}) => (
  <TouchableOpacity style={{borderRadius:14,overflow:'hidden',opacity:disabled?0.5:1}}
    onPress={onPress} disabled={disabled} activeOpacity={0.85}>
    <LinearGradient colors={isDark?['#4F46E5','#7C3AED','#9B35C5']:['#E890C8','#D468A8','#C060C0']}
      start={{x:0,y:0}} end={{x:1,y:0}}
      style={{height:52,alignItems:'center',justifyContent:'center'}}>
      <Text style={{fontSize:15,fontWeight:'800',color:'#FFF'}}>{label}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// ─── 1. Add Expense Modal ─────────────────────────────────────────────────────
function AddExpenseModal({visible,onClose,isDark,T,state,dispatch}) {
  const sym = state.currency.symbol;
  const rate = state.currency.rate;
  const [amount,setAmount]=useState(''); const [desc,setDesc]=useState('');
  const [expDate,setExpDate]=useState(new Date().toISOString().slice(0,10));
  const [isIncome,setIsIncome]=useState(false);
  const [selCat,setSelCat]=useState(EXPENSE_CATEGORIES[0]);
  const reset=()=>{setAmount('');setDesc('');setIsIncome(false);setSelCat(EXPENSE_CATEGORIES[0]);setExpDate(new Date().toISOString().slice(0,10));};
  const save=()=>{
    const p=parseFloat(amount);
    if(!amount||isNaN(p)||p<=0){Alert.alert('Error','Enter a valid amount');return;}
    if(!desc.trim()){Alert.alert('Error','Add a description');return;}
    dispatch({type:'ADD_EXPENSE',expense:{id:Date.now().toString(),desc:desc.trim(),amount:p,cat:selCat.name,emoji:selCat.emoji,date:expDate,isIncome}});
    Alert.alert('Saved!',`${desc.trim()} logged.`); reset(); onClose();
  };
  const MBG=isDark?'#0F0F18':'#FBF8F4'; const MTXT=isDark?'#F1F5F9':'#1A1412'; const MMUT=isDark?'#64748B':'#7A6055';
  const IBG=isDark?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.70)'; const IBD=isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)';
  const HND=isDark?'rgba(255,255,255,0.20)':'rgba(0,0,0,0.14)';
  const expActive=!isIncome;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={()=>{reset();onClose();}}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
        <TouchableOpacity style={ov.overlay} activeOpacity={1} onPress={()=>{reset();onClose();}}>
          <TouchableOpacity activeOpacity={1} onPress={()=>{}} style={[ov.sheet,{backgroundColor:MBG,borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)',maxHeight:'92%'}]}>
            <View style={[ov.handle,{backgroundColor:HND}]}/>
            <View style={{paddingHorizontal:18,marginBottom:14}}>
              <Text style={{fontSize:18,fontWeight:'800',color:MTXT}}>Add Transaction</Text>
              <Text style={{fontSize:12,color:MMUT,marginTop:2}}>Log an expense or earned amount</Text>
            </View>
            <View style={{flexDirection:'row',marginHorizontal:18,marginBottom:16}}>
              <TouchableOpacity style={[ov.togBtn,{backgroundColor:expActive?'#EF444420':IBG,borderColor:expActive?'#EF444470':IBD}]} onPress={()=>setIsIncome(false)} activeOpacity={0.8}>
                <CardSm color={expActive?'#EF4444':MMUT} size={14}/>
                <Text style={{fontSize:11,fontWeight:'800',marginTop:3,color:expActive?'#EF4444':MMUT}}>Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[ov.togBtn,{backgroundColor:isIncome?'#22C55E20':IBG,borderColor:isIncome?'#22C55E70':IBD,marginRight:0}]} onPress={()=>setIsIncome(true)} activeOpacity={0.8}>
                <WalletSm color={isIncome?'#22C55E':MMUT} size={14}/>
                <Text style={{fontSize:11,fontWeight:'800',marginTop:3,color:isIncome?'#22C55E':MMUT}}>Earned</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight:460}} keyboardShouldPersistTaps="handled">
              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',marginBottom:16,paddingHorizontal:18}}>
                <Text style={{fontSize:30,fontWeight:'700',marginRight:4,color:MMUT}}>{sym}</Text>
                <TextInput style={{fontSize:42,fontWeight:'700',minWidth:120,letterSpacing:-1,color:MTXT}}
                  value={amount} onChangeText={t=>setAmount(cleanNum(t))} keyboardType="decimal-pad"
                  placeholder="0.00" placeholderTextColor={MMUT} autoFocus/>
              </View>
              <TextInput style={[ov.mi,{marginHorizontal:18,backgroundColor:IBG,borderColor:IBD,color:MTXT}]}
                value={desc} onChangeText={setDesc} placeholder="Description" placeholderTextColor={MMUT}/>
              <TextInput style={[ov.mi,{marginHorizontal:18,backgroundColor:IBG,borderColor:IBD,color:MTXT}]}
                value={expDate} onChangeText={setExpDate} placeholder="YYYY-MM-DD" placeholderTextColor={MMUT}/>
              {!isIncome && (
                <View>
                  <Text style={[ov.lbl,{marginLeft:18,color:MMUT}]}>Category</Text>
                  <View style={{flexDirection:'row',flexWrap:'wrap',paddingHorizontal:18,marginBottom:14}}>
                    {EXPENSE_CATEGORIES.map(cat=>{
                      const sel=selCat.id===cat.id;
                      return (<TouchableOpacity key={cat.id}
                        style={{width:'22%',borderRadius:13,borderWidth:2,padding:8,alignItems:'center',margin:3,backgroundColor:sel?T.primaryGlow:IBG,borderColor:sel?T.primary:IBD}}
                        onPress={()=>setSelCat(cat)} activeOpacity={0.75}>
                        <Text style={{fontSize:20,marginBottom:3}}>{cat.emoji}</Text>
                        <Text style={{fontSize:9,fontWeight:'700',color:sel?T.primary:MMUT}}>{cat.name}</Text>
                      </TouchableOpacity>);
                    })}
                  </View>
                </View>
              )}
              <View style={{marginHorizontal:18,marginTop:8,marginBottom:16}}>
                <SaveBtn label={isIncome?'Save Earned':'Save Expense'} onPress={save} isDark={isDark}/>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── 2. Add Goal Modal ────────────────────────────────────────────────────────
function AddGoalModal({visible,onClose,isDark,T,state,dispatch}) {
  const sym=state.currency.symbol;
  const [gName,setGName]=useState(''); const [gTarget,setGTarget]=useState('');
  const [gSaved,setGSaved]=useState(''); const [gDeadline,setGDeadline]=useState('');
  const [gIcon,setGIcon]=useState('🎯');
  const reset=()=>{setGName('');setGTarget('');setGSaved('');setGDeadline('');setGIcon('🎯');};
  const save=()=>{
    if(!gName.trim()){Alert.alert('Error','Goal name required');return;}
    if(!gTarget||parseFloat(gTarget)<=0){Alert.alert('Error','Enter a valid target amount');return;}
    const goal={id:Date.now().toString(),name:gName.trim(),icon:gIcon,target:parseFloat(gTarget),saved:parseFloat(gSaved)||0,color:isDark?'#a3e635':'#6366F1',deadline:gDeadline||''};
    dispatch({type:'ADD_GOAL',goal});
    Alert.alert('Goal Created!',`"${goal.name}" added. You earned 50 points!`);
    reset(); onClose();
  };
  const MBG=isDark?'#0F0F18':'#FBF8F4'; const MTXT=isDark?'#F1F5F9':'#1A1412'; const MMUT=isDark?'#64748B':'#7A6055';
  const IBG=isDark?'rgba(255,255,255,0.07)':'#FFFFFF'; const IBD=isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.10)';
  const HND=isDark?'rgba(255,255,255,0.20)':'rgba(0,0,0,0.14)';
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={()=>{reset();onClose();}}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
        <TouchableOpacity style={ov.overlay} activeOpacity={1} onPress={()=>{reset();onClose();}}>
          <TouchableOpacity activeOpacity={1} onPress={()=>{}} style={[ov.sheet,{backgroundColor:MBG,borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)',maxHeight:'92%'}]}>
            <View style={[ov.handle,{backgroundColor:HND}]}/>
            <Text style={{fontSize:18,fontWeight:'800',color:MTXT,paddingHorizontal:18,marginBottom:4}}>Add New Goal</Text>
            <ScrollView style={{maxHeight:500}} keyboardShouldPersistTaps="handled">
              <Text style={[ov.lbl,{paddingHorizontal:18,color:MMUT}]}>Choose Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingHorizontal:18,marginBottom:14}}>
                <View style={{flexDirection:'row',gap:8}}>
                  {GOAL_ICONS.map(ic=>(<TouchableOpacity key={ic}
                    style={{width:48,height:48,borderRadius:13,borderWidth:2,alignItems:'center',justifyContent:'center',backgroundColor:gIcon===ic?T.primaryGlow:IBG,borderColor:gIcon===ic?T.primary:IBD}}
                    onPress={()=>setGIcon(ic)}><Text style={{fontSize:24}}>{ic}</Text></TouchableOpacity>))}
                </View>
              </ScrollView>
              <View style={{paddingHorizontal:18}}>
                <Text style={[ov.lbl,{color:MMUT}]}>Goal Name *</Text>
                <TextInput style={[ov.mi,{backgroundColor:IBG,borderColor:IBD,color:MTXT}]} value={gName} onChangeText={setGName} placeholder="e.g. Dubai Trip" placeholderTextColor={MMUT}/>
                <Text style={[ov.lbl,{color:MMUT}]}>Target Amount ({sym}) *</Text>
                <TextInput style={[ov.mi,{backgroundColor:IBG,borderColor:IBD,color:MTXT}]} value={gTarget} onChangeText={setGTarget} placeholder="e.g. 80000" keyboardType="decimal-pad" placeholderTextColor={MMUT}/>
                <Text style={[ov.lbl,{color:MMUT}]}>Already Saved ({sym})</Text>
                <TextInput style={[ov.mi,{backgroundColor:IBG,borderColor:IBD,color:MTXT}]} value={gSaved} onChangeText={setGSaved} placeholder="0" keyboardType="decimal-pad" placeholderTextColor={MMUT}/>
                <Text style={[ov.lbl,{color:MMUT}]}>Target Date</Text>
                <TextInput style={[ov.mi,{backgroundColor:IBG,borderColor:IBD,color:MTXT}]} value={gDeadline} onChangeText={setGDeadline} placeholder="YYYY-MM-DD" placeholderTextColor={MMUT}/>
                <SaveBtn label="Create Goal" onPress={save} isDark={isDark}/>
                <View style={{height:16}}/>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── 3. Transfer Modal ────────────────────────────────────────────────────────
function TransferModal({visible,onClose,isDark,T,state,dispatch}) {
  const sym=state.currency.symbol; const rate=state.currency.rate;
  const nowTM = new Date();
  const isThisMonthTM = e => { if(!e.date)return false; const d=new Date(e.date); return d.getMonth()===nowTM.getMonth()&&d.getFullYear()===nowTM.getFullYear(); };
  const monthSpentTM  = state.expenses.filter(e=>!e.isIncome&&isThisMonthTM(e)).reduce((a,b)=>a+b.amount,0)*rate;
  const totalBalance = state.budgets.monthly*rate - monthSpentTM;
  const [transferAmt,setTransferAmt]=useState('');
  const [transferGoalId,setTransferGoalId]=useState(null);
  const reset=()=>{setTransferAmt('');setTransferGoalId(null);};
  const doTransfer=()=>{
    const amt=parseFloat(transferAmt);
    if(!transferGoalId){Alert.alert('Error','Select a goal first');return;}
    if(!amt||amt<=0){Alert.alert('Error','Enter a valid amount');return;}
    if(amt>totalBalance){Alert.alert('Error','Insufficient balance');return;}
    const goal=state.goals.find(g=>g.id===transferGoalId);
    dispatch({type:'TRANSFER_TO_GOAL',goalId:transferGoalId,amount:amt,goalName:goal?.name||''});
    Alert.alert('Transferred!',`${sym} ${amt} sent to "${goal?.name}". You earned 25 points!`);
    reset(); onClose();
  };
  const MBG=isDark?'#0F0F18':'#FBF8F4'; const MTXT=isDark?'#F1F5F9':'#1A1412'; const MMUT=isDark?'#64748B':'#7A6055';
  const IBG=isDark?'rgba(255,255,255,0.07)':'#FFFFFF'; const IBD=isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.10)';
  const HND=isDark?'rgba(255,255,255,0.20)':'rgba(0,0,0,0.14)';
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={()=>{reset();onClose();}}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
        <TouchableOpacity style={ov.overlay} activeOpacity={1} onPress={()=>{reset();onClose();}}>
          <TouchableOpacity activeOpacity={1} onPress={()=>{}} style={[ov.sheet,{backgroundColor:MBG,borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}]}>
            <View style={[ov.handle,{backgroundColor:HND}]}/>
            <Text style={{fontSize:18,fontWeight:'800',color:MTXT,paddingHorizontal:18,marginBottom:4}}>Transfer to Goal</Text>
            <View style={{padding:18}}>
              {state.goals.length===0?(
                <View style={{alignItems:'center',paddingVertical:24}}>
                  <Text style={{fontSize:40,marginBottom:12}}>🎯</Text>
                  <Text style={{fontSize:15,fontWeight:'700',color:MTXT,marginBottom:6}}>No Goals Yet</Text>
                  <Text style={{fontSize:13,color:MMUT,textAlign:'center',marginBottom:20}}>Create a goal first to transfer funds to it.</Text>
                  <SaveBtn label="Create a Goal" onPress={()=>{onClose();}} isDark={isDark}/>
                </View>
              ):(
                <>
                  <Text style={[ov.lbl,{color:MMUT,marginBottom:12}]}>Select Goal</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}}>
                    <View style={{flexDirection:'row',gap:8}}>
                      {state.goals.map(g=>(<TouchableOpacity key={g.id}
                        style={{borderRadius:13,borderWidth:2,padding:10,alignItems:'center',minWidth:90,backgroundColor:transferGoalId===g.id?T.primaryGlow:IBG,borderColor:transferGoalId===g.id?T.primary:IBD}}
                        onPress={()=>setTransferGoalId(g.id)}>
                        <Text style={{fontSize:22,marginBottom:4}}>{g.icon}</Text>
                        <Text style={{fontSize:11,fontWeight:'700',color:MTXT,marginBottom:2,textAlign:'center'}}>{g.name}</Text>
                        <Text style={{fontSize:10,color:MMUT}}>{Math.round((g.saved/g.target)*100)}%</Text>
                      </TouchableOpacity>))}
                    </View>
                  </ScrollView>
                  <Text style={[ov.lbl,{color:MMUT}]}>Amount ({sym})</Text>
                  <TextInput style={[ov.mi,{backgroundColor:IBG,borderColor:IBD,color:MTXT}]}
                    value={transferAmt} onChangeText={setTransferAmt} keyboardType="decimal-pad" placeholder="e.g. 5000" placeholderTextColor={MMUT}/>
                  <Text style={{fontSize:12,color:MMUT,marginBottom:16}}>
                    Available: <Text style={{color:T.primary,fontWeight:'700'}}>{sym} {totalBalance.toFixed(0)}</Text>
                  </Text>
                  <SaveBtn label="Transfer Now" onPress={doTransfer} isDark={isDark} disabled={!transferGoalId||!transferAmt}/>
                </>
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── 4. Export Pro Modal ──────────────────────────────────────────────────────
function ProModal({visible,onClose,isDark}) {
  const [yearly, setYearly] = useState(true);
  const MBG  = isDark ? '#0F0F18' : '#FFFFFF';
  const MTXT = isDark ? '#F1F5F9' : '#1A1412';
  const MMUT = isDark ? '#64748B' : '#7A6055';
  const HND  = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)';
  const CBD  = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const features = [
    {icon:'📊', text:'Export reports as CSV & PDF'},
    {icon:'🤖', text:'AI-powered spending insights'},
    {icon:'🔔', text:'Advanced budget alerts & automation'},
    {icon:'🎯', text:'Unlimited categories & custom goals'},
    {icon:'☁️', text:'Multi-device sync & cloud backup'},
  ];
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={ov.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={()=>{}}
          style={[ov.sheet, {backgroundColor:MBG, borderColor:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)', maxHeight:'94%'}]}>
          <View style={[ov.handle, {backgroundColor:HND}]}/>
          <View style={{alignItems:'center', paddingHorizontal:24, paddingBottom:6}}>
            <Text style={{fontSize:48, marginBottom:8}}>👑</Text>
            <Text style={{fontSize:22, fontWeight:'800', color:MTXT, marginBottom:6}}>SpendWise Pro</Text>
            <Text style={{fontSize:13, color:MMUT, textAlign:'center', lineHeight:19, marginBottom:18}}>
              Unlock powerful features to take full control of your finances
            </Text>
            <View style={{width:'100%', marginBottom:20}}>
              {features.map((f,i) => (
                <View key={i} style={{flexDirection:'row', alignItems:'center', marginBottom:11}}>
                  <View style={{width:30, height:30, borderRadius:9, backgroundColor:isDark?'rgba(163,230,53,0.10)':'rgba(109,40,217,0.08)', alignItems:'center', justifyContent:'center', marginRight:12, borderWidth:1, borderColor:isDark?'rgba(163,230,53,0.20)':'rgba(109,40,217,0.14)'}}>
                    <Text style={{fontSize:15}}>{f.icon}</Text>
                  </View>
                  <Text style={{fontSize:13, color:MTXT, fontWeight:'600', flex:1}}>{f.text}</Text>
                </View>
              ))}
            </View>
            <View style={{flexDirection:'row', width:'100%', gap:10, marginBottom:16}}>
              <TouchableOpacity
                style={{flex:1, borderRadius:14, borderWidth:2, padding:14, alignItems:'center',
                  backgroundColor:!yearly?(isDark?'rgba(163,230,53,0.10)':'rgba(109,40,217,0.08)'):'transparent',
                  borderColor:!yearly?(isDark?'#A3E635':'#6D28D9'):CBD}}
                onPress={()=>setYearly(false)}>
                <Text style={{fontSize:10, fontWeight:'700', color:!yearly?(isDark?'#A3E635':'#6D28D9'):MMUT, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4}}>Monthly</Text>
                <Text style={{fontSize:20, fontWeight:'800', color:MTXT}}>₹199</Text>
                <Text style={{fontSize:11, color:MMUT}}>/ month</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{flex:1, borderRadius:14, borderWidth:2, padding:14, alignItems:'center',
                  backgroundColor:yearly?(isDark?'rgba(163,230,53,0.10)':'rgba(109,40,217,0.08)'):'transparent',
                  borderColor:yearly?(isDark?'#A3E635':'#6D28D9'):CBD}}
                onPress={()=>setYearly(true)}>
                <Text style={{fontSize:10, fontWeight:'700', color:yearly?(isDark?'#A3E635':'#6D28D9'):MMUT, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4}}>Yearly</Text>
                <Text style={{fontSize:20, fontWeight:'800', color:MTXT}}>₹1,499</Text>
                <View style={{flexDirection:'row', alignItems:'center', gap:5}}>
                  <Text style={{fontSize:11, color:MMUT}}>/ year</Text>
                  <View style={{backgroundColor:isDark?'rgba(163,230,53,0.20)':'rgba(109,40,217,0.12)', borderRadius:6, paddingHorizontal:5, paddingVertical:1}}>
                    <Text style={{fontSize:10, fontWeight:'800', color:isDark?'#A3E635':'#6D28D9'}}>Save 37%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{width:'100%', borderRadius:14, overflow:'hidden', marginBottom:12}} onPress={onClose}>
              <LinearGradient
                colors={isDark?['#4F46E5','#7C3AED','#9B35C5']:['#E890C8','#D468A8','#C060C0']}
                start={{x:0,y:0}} end={{x:1,y:0}}
                style={{height:54, alignItems:'center', justifyContent:'center'}}>
                <Text style={{fontSize:16, fontWeight:'800', color:'#FFF'}}>Start 7-Day Free Trial</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={{height:40, alignItems:'center', justifyContent:'center'}} onPress={onClose}>
              <Text style={{fontSize:13, fontWeight:'600', color:MMUT}}>No thanks, continue free</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function DashboardScreen({navigation}) {
  const {state,dispatch} = useApp();
  const T      = useTheme(state.isDarkMode);
  const s      = makeStyles(T);
  const isDark = state.isDarkMode;
  const sym    = state.currency.symbol;
  const rate   = state.currency.rate;

  const [showExpense,  setShowExpense]  = useState(false);
  const [showGoal,     setShowGoal]     = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showExport,   setShowExport]   = useState(false);

  // ── Monthly filter ────────────────────────────────────────────────────────
  const nowM = new Date();
  const isThisMonth = e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getMonth()===nowM.getMonth() && d.getFullYear()===nowM.getFullYear();
  };

  const spent  = state.expenses.filter(e=>!e.isIncome && isThisMonth(e)).reduce((a,b)=>a+b.amount,0)*rate;
  const income = state.expenses.filter(e=> e.isIncome && isThisMonth(e)).reduce((a,b)=>a+b.amount,0)*rate;
  const budget = state.budgets.monthly*rate;

  const totalBalance = income - spent;
  const pct          = budget > 0 ? Math.min(100, Math.round((spent/budget)*100)) : 0;
  const savingRate   = income > 0 ? Math.round(((income-spent)/income)*100) : 35;
  const netSaved     = income > spent ? income - spent : 0;

  // ── KEY FIX: hasData drives the personality card subtext ─────────────────
  // hasData is true only when the user has logged at least one transaction.
  // This is the same condition ProfileScreen uses for its personality subtext.
  const hasData = (state.expenses||[]).length > 0;

  const level      = GAMIFICATION_LEVELS.find(l=>state.points>=l.minPts&&state.points<l.nextPts)||GAMIFICATION_LEVELS[0];
  const nextLevel  = GAMIFICATION_LEVELS[Math.min(level.level,9)];
  const xpPct      = ((state.points-level.minPts)/(nextLevel.minPts-level.minPts))*100;
  const recent     = [...state.expenses].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  const lastExpense= state.expenses.filter(e=>!e.isIncome)[0];
  const fmt        = v=>`${sym} ${Number(v).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',')}`;
  const todayStr   = new Date().toISOString().slice(0,10);
  const spentToday = state.expenses.filter(e=>{if(e.isIncome)return false;return e.date?new Date(e.date).toISOString().slice(0,10)===todayStr:false;}).reduce((s,e)=>s+e.amount,0)*rate;
  const dailyBudget= budget/30;
  const todayPct   = Math.min(100,Math.round((spentToday/dailyBudget)*100));
  const todayTxCnt = state.expenses.filter(e=>{if(e.isIncome)return false;return e.date?new Date(e.date).toISOString().slice(0,10)===todayStr:false;}).length;

  const personality    = getPersonalitySvg(savingRate);
  const PersonalityIcon= personality.SvgIcon;

  const heroCardBg  = isDark?'#0C1B0A':'#13133A';
  const heroBorderCol=isDark?'rgba(163,230,53,0.22)':'rgba(130,120,255,0.35)';
  const heroLblColor =isDark?'rgba(163,230,53,0.70)':'rgba(190,185,255,0.85)';
  const period       = getCurrentPeriod();
  const cardStyle    = {borderRadius:18,borderWidth:1.5,borderColor:isDark?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.10)',backgroundColor:T.card};

  const daysInMonth = new Date(nowM.getFullYear(), nowM.getMonth()+1, 0).getDate();
  const miniCards = [
    {icon:<IconWallet c={isDark?'#60A5FA':'#4F46E5'} s={20}/>,label:'DAILY AVG',value:`${sym} ${(spent/Math.max(1,daysInMonth)).toFixed(0)}`,trend:'Based on this month',tCol:T.red,bg:isDark?'rgba(96,165,250,0.10)':'rgba(79,70,229,0.08)',bc:isDark?'rgba(96,165,250,0.18)':'rgba(79,70,229,0.14)'},
    {icon:<IconBag c={isDark?'#F59E0B':'#D97706'} s={20}/>,label:'LAST PURCHASE',value:lastExpense?`${sym} ${(lastExpense.amount*rate).toFixed(0)}`:`${sym} 0`,trend:lastExpense?lastExpense.cat:'No expenses yet',tCol:T.orange,bg:isDark?'rgba(245,158,11,0.10)':'rgba(217,119,6,0.08)',bc:isDark?'rgba(245,158,11,0.18)':'rgba(217,119,6,0.14)'},
    {icon:<IconSaved c={isDark?'#34D399':'#059669'} s={20}/>,label:'NET SAVED',value:fmt(netSaved),trend:`${savingRate}% saving rate`,tCol:isDark?'#34D399':'#059669',bg:isDark?'rgba(52,211,153,0.10)':'rgba(5,150,105,0.08)',bc:isDark?'rgba(52,211,153,0.18)':'rgba(5,150,105,0.14)'},
    {icon:<IconSun c={isDark?'#F472B6':'#DB2777'} s={20}/>,label:'SPENT TODAY',value:spentToday>0?fmt(spentToday):`${sym} 0`,trend:todayTxCnt>0?`${todayTxCnt} transaction${todayTxCnt>1?'s':''} · ${todayPct}% of daily`:'No spending today 🎉',tCol:todayPct>80?T.red:todayPct>50?T.orange:(isDark?'#F472B6':'#DB2777'),bg:isDark?'rgba(244,114,182,0.10)':'rgba(219,39,119,0.08)',bc:isDark?'rgba(244,114,182,0.18)':'rgba(219,39,119,0.14)'},
  ];

  const quickActions = [
    {icon:<IconPlus     c={isDark?'#A3E635':'#6366F1'} s={18}/>,lbl:'Expense',  onPress:()=>setShowExpense(true)},
    {icon:<IconBar      c={isDark?'#60A5FA':'#3B82F6'} s={18}/>,lbl:'Analytics',onPress:()=>navigation.navigate('Analytics')},
    {icon:<IconGoal     c={isDark?'#F59E0B':'#D97706'} s={18}/>,lbl:'Goals',    onPress:()=>setShowGoal(true)},
    {icon:<IconTransfer c={isDark?'#A78BFA':'#7C3AED'} s={18}/>,lbl:'Transfer', onPress:()=>setShowTransfer(true)},
    {icon:<IconExport   c="#4ADE80"                    s={18}/>,lbl:'Export',   onPress:()=>setShowExport(true)},
  ];

  return (
    <ScreenWrapper isDarkMode={isDark}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:8}}>

        {/* Topbar */}
        <View style={s.topbar}>
          <TouchableOpacity style={[s.avatar,{backgroundColor:T.primary}]} onPress={()=>navigation.navigate('Profile')}>
            <Text style={[s.avatarTxt,{color:isDark?'#0a0f00':'#fff'}]}>{state.user?.name?.slice(0,2).toUpperCase()||'SW'}</Text>
          </TouchableOpacity>
          <View style={{alignItems:'center'}}>
            <Text style={{fontSize:10,color:T.muted,fontWeight:'700',letterSpacing:0.5}}>{period.toUpperCase()}</Text>
            <Text style={{fontSize:14,fontWeight:'800',color:T.text}}>SpendWise</Text>
          </View>
          <TouchableOpacity style={[s.ib,{borderColor:isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'}]}
            onPress={()=>navigation.navigate('Gamification',{level,xpPct,points:state.points})}>
            <IconTrophy c={isDark?'#A3E635':'#6366F1'} s={17}/>
          </TouchableOpacity>
        </View>

        <Text style={[s.hi,{color:T.primary}]}>Hello, {state.user?.name?.split(' ')[0]||'there'} 👋</Text>
        <Text style={[s.tagline,{color:T.text}]}>
          {budget > 0
            ? <>You've used <Text style={{color:pct>80?T.red:pct>60?T.orange:T.primary,fontWeight:'800'}}>{pct}%</Text> of your {period} budget</>
            : <>Set a budget in <Text style={{color:T.primary,fontWeight:'800'}}>Profile</Text> to get started</>}
        </Text>

        {/* Hero card */}
        <View style={[s.hero,{backgroundColor:heroCardBg,borderColor:heroBorderCol}]}>
          <Text style={[s.heroLbl,{color:heroLblColor}]}>Monthly Balance</Text>
          <Text style={s.heroAmt}>{totalBalance >= 0 ? '' : '- '}{fmt(Math.abs(totalBalance))}</Text>
          <Text style={s.heroSub}>{getLastUpdated()}</Text>
          <View style={s.progRow}>
            <Text style={s.progLbl}>Monthly Spending</Text>
            <Text style={{fontSize:11,color:pct>80?T.orange:T.primary,fontWeight:'700'}}>{budget > 0 ? `${pct}% used` : 'Set budget in Profile'}</Text>
          </View>
          <View style={s.progBg}><View style={[s.progFill,{width:`${pct}%`,backgroundColor:pct>90?T.red:pct>80?T.orange:T.primary}]}/></View>
          <View style={s.heroBtm}>
            <View style={{alignItems:'center'}}><Text style={[s.heroVal,{color:'#F87171'}]}>{fmt(spent)}</Text><Text style={s.heroVlbl}>Spent</Text></View>
            <View style={{alignItems:'center'}}><Text style={[s.heroVal,{color:T.primary}]}>{fmt(budget-spent)}</Text><Text style={s.heroVlbl}>Left</Text></View>
            <View style={{alignItems:'center'}}><Text style={[s.heroVal,{color:'#93C5FD'}]}>{fmt(budget)}</Text><Text style={s.heroVlbl}>Budget</Text></View>
          </View>
        </View>

        {pct>=80&&(
          <View style={[s.alertCard,{borderColor:'rgba(249,115,22,0.28)',backgroundColor:'rgba(249,115,22,0.08)'}]}>
            <Text style={{fontSize:18}}>⚠️</Text>
            <View style={{flex:1}}>
              <Text style={[s.alertTitle,{color:T.orange}]}>Budget Alert</Text>
              <Text style={[s.alertSub,{color:T.muted}]}>{pct}% of {period} budget used · {fmt(budget-spent)} remaining</Text>
            </View>
          </View>
        )}

        {/* ── Spending Personality ─────────────────────────────────────────── */}
        <TouchableOpacity
          style={[
            s.persCard, cardStyle,
            {
              borderColor: isDark?'rgba(168,85,247,0.25)':'rgba(139,92,246,0.22)',
              backgroundColor: isDark?'rgba(168,85,247,0.07)':'rgba(139,92,246,0.06)',
            },
          ]}
          onPress={()=>navigation.navigate('SpendingPersonality',{savingRate,personality})}>
          <View style={[
            s.persIconBox,
            {
              backgroundColor: personality.color+'22',
              borderWidth: 1,
              borderColor: isDark ? personality.color+'35' : 'rgba(99,102,241,0.22)',
            },
          ]}>
            <PersonalityIcon c={isDark ? personality.color : '#6366F1'} s={22}/>
          </View>
          <View style={{flex:1}}>
            <Text style={[s.persLbl, {color:T.purple}]}>SPENDING PERSONALITY</Text>
            <Text style={[s.persVal, {color:T.text}]}>{personality.label}</Text>

            {/* ── Subtext: matches ProfileScreen exactly ── */}
            <Text style={[s.persSub, {color:T.muted}]}>
              {hasData
                ? `Saving ${savingRate}% · ${savingRate >= 20 ? 'Above average' : 'Keep it up!'}`
                : 'Add income & expenses to track'}
            </Text>
          </View>
          <Text style={{color:T.muted,fontSize:18}}>›</Text>
        </TouchableOpacity>

        {/* Gamification strip */}
        <TouchableOpacity style={[s.gamStrip,{borderColor:isDark?'rgba(59,130,246,0.22)':'rgba(59,130,246,0.25)',backgroundColor:isDark?'rgba(59,130,246,0.06)':'rgba(59,130,246,0.07)'}]}
          onPress={()=>navigation.navigate('Gamification',{level,xpPct,points:state.points})}>
          <View style={[s.lvlBadge,{backgroundColor:isDark?'rgba(99,102,241,0.18)':'rgba(99,102,241,0.12)',borderColor:isDark?'rgba(99,102,241,0.35)':'rgba(99,102,241,0.25)'}]}>
            {(() => {
              const GI=[
                ({c,s})=>(<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" stroke={c} strokeWidth={1.6} fill={c+'15'}/></Svg>),
                ({c,s})=>(<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={1.8} fill={c+'12'}/><Path d="M8 12l3 3 5-5" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>),
                ({c,s})=>(<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill={c+'15'}/></Svg>),
                ({c,s})=>(<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Rect x="3" y="11" width="4" height="10" rx="1" fill={c+'25'} stroke={c} strokeWidth={1.5}/><Rect x="10" y="7" width="4" height="14" rx="1" fill={c+'35'} stroke={c} strokeWidth={1.5}/><Rect x="17" y="3" width="4" height="18" rx="1" fill={c+'50'} stroke={c} strokeWidth={1.5}/></Svg>),
                ({c,s})=>(<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M12 2L2 9l10 13L22 9z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" fill={c+'18'}/><Path d="M2 9h20" stroke={c} strokeWidth={1.5}/></Svg>),
                ({c,s})=>(<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M12 3v18M5 21h14" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M5 9l-3 5h6L5 9zM19 9l-3 5h6L19 9z" stroke={c} strokeWidth={1.5} strokeLinejoin="round" fill={c+'18'}/><Path d="M5 9h14" stroke={c} strokeWidth={1.5} strokeLinecap="round"/></Svg>),
                ({c,s})=>(<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="8" r="5" stroke={c} strokeWidth={1.8} fill={c+'15'}/><Path d="M6 21v-2a6 6 0 0112 0v2" stroke={c} strokeWidth={1.8} strokeLinecap="round"/></Svg>),
                ({c,s})=>(<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M8 21h8M12 17v4" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 4H4a1 1 0 00-1 1v3a4 4 0 003 3.87M17 4h3a1 1 0 011 1v3a4 4 0 01-3 3.87" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Path d="M7 4h10v6a5 5 0 01-10 0V4z" stroke={c} strokeWidth={1.8} strokeLinecap="round" fill={c+'15'}/></Svg>),
                ({c,s})=>(<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Circle cx="12" cy="12" r="10" stroke={c} strokeWidth={1.8} fill={c+'10'}/><Path d="M12 6v6l4 2" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/></Svg>),
                ({c,s})=>(<Svg width={s} height={s} viewBox="0 0 24 24" fill="none"><Path d="M3 17L5 8l4.5 4.5L12 4l2.5 8.5L19 8l2 9H3z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" fill={c+'20'}/><Path d="M3 17h18" stroke={c} strokeWidth={1.8} strokeLinecap="round"/><Circle cx="12" cy="4" r="1.2" fill={c}/></Svg>),
              ];
              const DI=GI[Math.min(Math.max((level.level||1)-1,0),9)];
              return <DI c={isDark?'#818CF8':'#6366F1'} s={26}/>;
            })()}
          </View>
          <View style={{flex:1}}>
            <Text style={{fontSize:9,color:isDark?'#818CF8':'#6366F1',fontWeight:'800',textTransform:'uppercase',letterSpacing:0.8,marginBottom:2}}>Level {level.level}</Text>
            <Text style={{fontSize:15,fontWeight:'800',color:T.text,marginBottom:5}}>{level.name}</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:8}}>
              <View style={[s.xpBg,{flex:1}]}><View style={[s.xpBar,{width:`${Math.min(100,xpPct)}%`,backgroundColor:isDark?'#818CF8':'#6366F1'}]}/></View>
              <Text style={{fontSize:10,color:T.muted,fontWeight:'600',minWidth:60}}>{nextLevel.minPts-state.points} to Lvl {level.level+1}</Text>
            </View>
          </View>
          <Text style={{color:T.muted,fontSize:18,marginLeft:4}}>›</Text>
        </TouchableOpacity>

        {/* Mini grid */}
        <View style={s.miniGrid}>
          {miniCards.map(({icon,label,value,trend,tCol,bg,bc})=>(
            <View key={label} style={[s.mc,{width:CARD_W,backgroundColor:bg,borderColor:bc,borderWidth:1.5,borderRadius:18}]}>
              <View style={s.mcTop}><View style={s.mcIconBox}>{icon}</View><Text style={[s.mcLabel,{color:T.muted}]}>{label}</Text></View>
              <Text style={[s.mcValue,{color:T.text}]}>{value}</Text>
              <Text style={[s.mcTrend,{color:tCol}]} numberOfLines={1}>{trend}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={[s.sl,{color:T.muted}]}>Quick Actions</Text>
        <View style={s.qaRow}>
          {quickActions.map(({icon,lbl,onPress})=>(
            <TouchableOpacity key={lbl} style={[s.qa,cardStyle]} onPress={onPress}>
              {icon}<Text style={[s.qaLbl,{color:T.muted,marginTop:5}]}>{lbl}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <Text style={[s.sl,{color:T.muted}]}>Recent Transactions</Text>
        {recent.length===0?(
          <View style={s.emptyState}>
            <Text style={{fontSize:44,marginBottom:12}}>📝</Text>
            <Text style={[s.emptyTitle,{color:T.text}]}>No transactions yet</Text>
            <Text style={[s.emptySub,{color:T.muted}]}>Tap Expense in Quick Actions to log your first transaction</Text>
            <TouchableOpacity style={[s.emptyBtn,{backgroundColor:T.primary}]} onPress={()=>setShowExpense(true)}>
              <Text style={{color:isDark?'#0a0f00':'#fff',fontWeight:'700',fontSize:14}}>Add First Expense</Text>
            </TouchableOpacity>
          </View>
        ):recent.map(exp=>{
          const inc=exp.isIncome; const amtColor=inc?'#16A34A':'#DC2626';
          const bColor=inc?'rgba(22,163,74,0.18)':isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
          const nmColor=inc?'#16A34A':T.text; const badgeBg=inc?'rgba(22,163,74,0.14)':'rgba(220,38,38,0.14)';
          const logoBg=inc?'rgba(22,163,74,0.14)':isDark?'rgba(255,255,255,0.07)':T.card2;
          const dateStr=fmtTxDate(exp.date);
          return (
            <TouchableOpacity key={exp.id} style={[s.txItem,{borderColor:bColor,borderLeftColor:amtColor,borderLeftWidth:3,backgroundColor:T.card}]}
              onPress={()=>navigation.navigate('Transactions')} activeOpacity={0.75}>
              <View style={[s.txLogo,{backgroundColor:logoBg,borderWidth:inc?1:0,borderColor:'rgba(22,163,74,0.35)'}]}>
                {inc?<SalaryIcon color="#16A34A" size={18}/>:<Text style={{fontSize:18}}>{exp.emoji}</Text>}
              </View>
              <View style={{flex:1}}>
                <Text style={[s.txNm,{color:nmColor}]} numberOfLines={1}>{exp.desc}</Text>
                <Text style={s.txCat}>{exp.cat}{dateStr?` · ${dateStr}`:''}</Text>
              </View>
              <View style={{alignItems:'flex-end'}}>
                <Text style={[s.txAmt,{color:amtColor}]}>{inc?'+ ':'- '}{sym} {(exp.amount*rate).toFixed(0)}</Text>
                <View style={[s.txBadge,{backgroundColor:badgeBg}]}>
                  <Text style={{fontSize:9,fontWeight:'800',color:amtColor}}>{inc?'EARNED':'EXPENSE'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Modals ── */}
      <AddExpenseModal  visible={showExpense}  onClose={()=>setShowExpense(false)}  isDark={isDark} T={T} state={state} dispatch={dispatch}/>
      <AddGoalModal     visible={showGoal}     onClose={()=>setShowGoal(false)}     isDark={isDark} T={T} state={state} dispatch={dispatch}/>
      <TransferModal    visible={showTransfer} onClose={()=>setShowTransfer(false)} isDark={isDark} T={T} state={state} dispatch={dispatch}/>
      <ProModal         visible={showExport}   onClose={()=>setShowExport(false)}   isDark={isDark}/>
    </ScreenWrapper>
  );
}

const makeStyles = T => StyleSheet.create({
  topbar:    {flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:14,paddingTop:8,paddingBottom:4},
  avatar:    {width:38,height:50,borderRadius:19,alignItems:'center',justifyContent:'center'},
  avatarTxt: {fontSize:13,fontWeight:'800'},
  ib:        {width:36,height:36,borderRadius:11,borderWidth:1,backgroundColor:T.card,alignItems:'center',justifyContent:'center'},
  hi:        {paddingHorizontal:14,fontSize:13,fontWeight:'700',marginBottom:2},
  tagline:   {paddingHorizontal:14,fontSize:20,fontWeight:'700',lineHeight:26,marginBottom:12},
  hero:      {marginHorizontal:14,marginBottom:10,borderRadius:22,padding:18,borderWidth:1.5},
  heroLbl:   {fontSize:10,fontWeight:'700',letterSpacing:0.8,textTransform:'uppercase',marginBottom:4},
  heroAmt:   {fontSize:36,fontWeight:'800',color:'#F1F5F9',letterSpacing:-1,marginBottom:2},
  heroSub:   {fontSize:11,color:'rgba(255,255,255,0.38)',marginBottom:12},
  progRow:   {flexDirection:'row',justifyContent:'space-between',marginBottom:5},
  progLbl:   {fontSize:11,color:'rgba(255,255,255,0.50)',fontWeight:'500'},
  progBg:    {height:8,borderRadius:100,backgroundColor:'rgba(255,255,255,0.10)',overflow:'hidden',marginBottom:12},
  progFill:  {height:'100%',borderRadius:100},
  heroBtm:   {flexDirection:'row',justifyContent:'space-around',borderTopWidth:1,borderColor:'rgba(255,255,255,0.08)',paddingTop:12},
  heroVal:   {fontSize:14,fontWeight:'800',marginBottom:2},
  heroVlbl:  {fontSize:10,color:'rgba(255,255,255,0.40)',fontWeight:'500'},
  alertCard: {flexDirection:'row',alignItems:'center',gap:10,marginHorizontal:14,marginBottom:8,borderRadius:16,padding:12,borderWidth:1.5},
  alertTitle:{fontSize:13,fontWeight:'800',marginBottom:2},
  alertSub:  {fontSize:11},
  // ── Personality card ──
  persCard:  {flexDirection:'row',alignItems:'center',gap:12,marginHorizontal:14,marginBottom:8,padding:14,borderRadius:18,borderWidth:1.5},
  persIconBox:{width:46,height:47,borderRadius:14,alignItems:'center',justifyContent:'center'},
  persLbl:   {fontSize:9,fontWeight:'800',textTransform:'uppercase',letterSpacing:0.8,marginBottom:3},
  persVal:   {fontSize:14,fontWeight:'800',marginBottom:2},
  persSub:   {fontSize:11},           // ← subtext driven by hasData flag above
  // ─────────────────────
  gamStrip:  {flexDirection:'row',alignItems:'center',gap:14,marginHorizontal:14,marginBottom:14,padding:14,borderRadius:18,borderWidth:1.5},
  lvlBadge:  {width:52,height:52,borderRadius:15,alignItems:'center',justifyContent:'center',borderWidth:1},
  xpBg:      {height:5,borderRadius:3,backgroundColor:'rgba(255,255,255,0.10)',overflow:'hidden'},
  xpBar:     {height:'100%',borderRadius:3},
  miniGrid:  {flexDirection:'row',flexWrap:'wrap',gap:10,marginHorizontal:14,marginBottom:14},
  mc:        {padding:12},
  mcTop:     {flexDirection:'row',alignItems:'center',gap:8,marginBottom:8},
  mcIconBox: {width:32,height:36,borderRadius:9,alignItems:'center',justifyContent:'center',backgroundColor:'rgba(255,255,255,0.06)'},
  mcLabel:   {fontSize:10,fontWeight:'800',letterSpacing:0.6,flex:1},
  mcValue:   {fontSize:20,fontWeight:'800',letterSpacing:-0.5,marginBottom:5},
  mcTrend:   {fontSize:11,fontWeight:'700'},
  sl:        {paddingHorizontal:14,fontSize:10,letterSpacing:0.8,textTransform:'uppercase',fontWeight:'800',marginBottom:8},
  qaRow:     {flexDirection:'row',gap:6,marginHorizontal:14,marginBottom:14},
  qa:        {flex:1,padding:10,alignItems:'center',justifyContent:'center'},
  qaLbl:     {fontSize:9,fontWeight:'700'},
  txItem:    {flexDirection:'row',alignItems:'center',paddingVertical:11,paddingHorizontal:12,marginHorizontal:14,marginBottom:6,borderRadius:16,borderWidth:1},
  txLogo:    {width:40,height:40,borderRadius:13,alignItems:'center',justifyContent:'center',marginRight:11},
  txNm:      {fontSize:13,fontWeight:'700',marginBottom:2},
  txCat:     {fontSize:10,color:T.muted,fontWeight:'600'},
  txAmt:     {fontSize:13,fontWeight:'800',marginBottom:4},
  txBadge:   {paddingHorizontal:6,paddingVertical:2,borderRadius:5},
  emptyState:{alignItems:'center',padding:32,marginHorizontal:14},
  emptyTitle:{fontSize:18,fontWeight:'800',marginBottom:8},
  emptySub:  {fontSize:13,textAlign:'center',lineHeight:20,marginBottom:20,color:T.muted},
  emptyBtn:  {borderRadius:14,paddingVertical:12,paddingHorizontal:24},
});