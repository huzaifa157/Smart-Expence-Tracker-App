// GoalsScreen.js

import React, {useState, useMemo} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Path, Circle, Rect, G, Defs, LinearGradient as SvgLG, Stop} from 'react-native-svg';
import ScreenWrapper from '../utils/ScreenWrapper';
import {useApp} from '../context/AppContext';
import {useTheme} from '../utils/theme';
import {GOAL_ICONS} from '../data/mockData';

// ─── Icons ────────────────────────────────────────────────────────────────────
const TransferIcon = ({color, size=18}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M7 16V4m0 0L3 8m4-4l4 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M17 8v12m0 0l4-4m-4 4l-4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const EditIcon = ({color, size=15}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const SendIcon = ({color, size=18}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 2L15 22l-4-9-9-4 20-7z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const EmptyGoalsIllustration = ({color}) => (
  <Svg width={110} height={110} viewBox="0 0 110 110" fill="none">
    {/* Outer ring — filled subtle background */}
    <Circle cx="55" cy="55" r="48" fill={color+'12'} stroke={color+'40'} strokeWidth="2"/>
    {/* Middle ring */}
    <Circle cx="55" cy="55" r="32" fill={color+'10'} stroke={color+'66'} strokeWidth="2.5"/>
    {/* Inner ring */}
    <Circle cx="55" cy="55" r="17" fill={color+'18'} stroke={color+'99'} strokeWidth="2.5"/>
    {/* Center dot */}
    <Circle cx="55" cy="55" r="7" fill={color}/>
    {/* Arrow shaft */}
    <Path d="M84 26L57 53" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    {/* Arrow head */}
    <Path d="M84 26L75 28L82 35Z" fill={color}/>
  </Svg>
);

// ─── SolidPillBtn ─────────────────────────────────────────────────────────────
function SolidPillBtn({label, onPress, isDark, style, disabled}) {
  const bg     = isDark ? '#A3E635' : '#7C3AED';
  const txtCol = isDark ? '#0d1f00' : '#FFFFFF';
  return (
    <TouchableOpacity
      style={[{
        borderRadius:100, backgroundColor:bg,
        height:52, alignItems:'center', justifyContent:'center', paddingHorizontal:28,
      }, style, disabled&&{opacity:0.50}]}
      onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <Text style={{fontSize:15, fontWeight:'800', color:txtCol}}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── GradPillBtn ─────────────────────────────────────────────────────────────
function GradPillBtn({label, onPress, isDark, style, disabled, outline}) {
  if (outline) {
    return (
      <TouchableOpacity
        style={[{
          height:52, borderRadius:100, borderWidth:1.5,
          borderColor:isDark?'rgba(255,255,255,0.20)':'rgba(0,0,0,0.15)',
          alignItems:'center', justifyContent:'center',
        }, style, disabled&&{opacity:0.50}]}
        onPress={onPress} disabled={disabled} activeOpacity={0.75}>
        <Text style={{fontSize:14, fontWeight:'700',
          color:isDark?'rgba(255,255,255,0.55)':'#64748B'}}>{label}</Text>
      </TouchableOpacity>
    );
  }
  const colors = isDark ? ['#4F46E5','#7C3AED','#9B35C5'] : ['#E890C8','#D468A8','#C060C0'];
  return (
    <TouchableOpacity
      style={[{borderRadius:100, overflow:'hidden'}, style, disabled&&{opacity:0.50}]}
      onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <LinearGradient colors={colors} start={{x:0,y:0}} end={{x:1,y:0}}
        style={{height:52, alignItems:'center', justifyContent:'center', paddingHorizontal:28}}>
        <Text style={{fontSize:15, fontWeight:'800', color:'#FFFFFF'}}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── DangerBtn ────────────────────────────────────────────────────────────────
function DangerBtn({label, onPress, style}) {
  return (
    <TouchableOpacity
      style={[{
        height:50, borderRadius:100,
        backgroundColor:'rgba(239,68,68,0.10)',
        borderWidth:1.5, borderColor:'rgba(239,68,68,0.30)',
        alignItems:'center', justifyContent:'center',
      }, style]}
      onPress={onPress} activeOpacity={0.75}>
      <Text style={{fontSize:14, fontWeight:'700', color:'#EF4444'}}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function GoalsScreen() {
  const {state, dispatch} = useApp();
  const T      = useTheme(state.isDarkMode);
  const s      = makeStyles(T);
  const isDark = state.isDarkMode;
  const sym    = state.currency.symbol;
  const rate   = state.currency.rate;

  const [showAdd,        setShowAdd]        = useState(false);
  const [showUpdate,     setShowUpdate]     = useState(false);
  const [showTransfer,   setShowTransfer]   = useState(false);
  const [activeGoal,     setActiveGoal]     = useState(null);
  const [gName,          setGName]          = useState('');
  const [gTarget,        setGTarget]        = useState('');
  const [gSaved,         setGSaved]         = useState('');
  const [gDeadline,      setGDeadline]      = useState('');
  const [gIcon,          setGIcon]          = useState('🎯');
  const [transferAmt,    setTransferAmt]    = useState('');
  const [transferGoalId, setTransferGoalId] = useState(null);

  const nowM = new Date();
  const isThisMonth = e => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d.getMonth() === nowM.getMonth() && d.getFullYear() === nowM.getFullYear();
  };
  const monthIncome  = (state.expenses||[]).filter(e=> e.isIncome && isThisMonth(e)).reduce((a,e)=>a+(e.amount||0),0);
  const monthSpent   = (state.expenses||[]).filter(e=>!e.isIncome && isThisMonth(e)).reduce((a,e)=>a+(e.amount||0),0);
  const monthlyBalance = (monthIncome - monthSpent) * rate;
  // Show 0 if no data yet (avoids negative display for new users)
  const hasData = (state.expenses||[]).length > 0;
  const displayBalance = hasData ? Math.max(0, monthlyBalance) : 0;

  const overallPct = useMemo(()=>{
    if (!state.goals.length) return 0;
    const tot = state.goals.reduce((a,g)=>a+Math.min(1,g.saved/g.target),0);
    return Math.round((tot/state.goals.length)*100);
  },[state.goals]);

  const completedGoals  = state.goals.filter(g=>g.saved>=g.target).length;
  const inProgressGoals = state.goals.filter(g=>g.saved<g.target).length;

  const accent    = isDark ? '#A3E635' : '#7C3AED';
  const cardBg    = isDark ? '#0f1f0a' : '#13133A';
  const cardBorder= isDark ? 'rgba(163,230,53,0.18)' : 'rgba(130,120,255,0.35)';
  const modalBg   = isDark ? '#0F0F18' : '#FFFFFF';
  const modalText = isDark ? '#F1F5F9' : '#0F172A';
  const modalMuted= isDark ? '#64748B' : '#64748B';
  const inputBg   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
  const inputBd   = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
  const handleCol = isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.14)';
  const modalBd   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const balanceFmt = v => {
    const a = Math.abs(v);
    if (a >= 1000000) return `${sym} ${(a/1000000).toFixed(1)}M`;
    if (a >= 1000)    return `${sym} ${(a/1000).toFixed(1)}K`;
    return `${sym} ${a.toFixed(0)}`;
  };

  function saveGoal() {
    if (!gName.trim()){Alert.alert('Error','Goal name required');return;}
    if (!gTarget||parseFloat(gTarget)<=0){Alert.alert('Error','Enter a valid target');return;}
    const goal={
      id:Date.now().toString(), name:gName.trim(), icon:gIcon,
      target:parseFloat(gTarget), saved:parseFloat(gSaved)||0,
      color:accent, deadline:gDeadline||'',
    };
    dispatch({type:'ADD_GOAL',goal});
    setShowAdd(false);setGName('');setGTarget('');setGSaved('');setGDeadline('');setGIcon('🎯');
    Alert.alert('Goal Created!',`"${goal.name}" added. You earned 50 points!`);
  }

  function openUpdate(goal){setActiveGoal({...goal});setShowUpdate(true);}

  function saveUpdate(){
    if (!activeGoal.name.trim()){Alert.alert('Error','Goal name required');return;}
    dispatch({type:'UPDATE_GOAL',goal:{
      ...activeGoal,
      target:parseFloat(activeGoal.target),
      saved:parseFloat(activeGoal.saved),
    }});
    setShowUpdate(false);
  }

  function deleteGoal(){
    Alert.alert('Delete Goal',`Delete "${activeGoal.name}"?`,[
      {text:'Cancel',style:'cancel'},
      {text:'Delete',style:'destructive',onPress:()=>{
        dispatch({type:'DELETE_GOAL',id:activeGoal.id});
        setShowUpdate(false);
      }},
    ]);
  }

  function openTransferForGoal(goal){
    setTransferGoalId(goal.id);setActiveGoal(goal);setTransferAmt('');setShowTransfer(true);
  }

  function doTransfer(){
    const amt=parseFloat(transferAmt);
    if (!amt||amt<=0){Alert.alert('Error','Enter a valid amount');return;}
    if (amt>displayBalance){Alert.alert('Error','Insufficient balance');return;}
    const goal=state.goals.find(g=>g.id===transferGoalId);
    dispatch({type:'TRANSFER_TO_GOAL',goalId:transferGoalId,amount:amt,goalName:goal?.name||''});
    setShowTransfer(false);setTransferAmt('');
    Alert.alert('Transferred!',`${sym} ${amt} sent to "${goal?.name}". You earned 25 points!`);
  }

  return (
    <ScreenWrapper isDarkMode={isDark}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:8}}>

        {/* Topbar */}
        <View style={s.topbar}>
          <Text style={s.title}>Goal Tracker</Text>
          <TouchableOpacity style={s.ib} onPress={()=>setShowTransfer(true)}>
            <SendIcon color={accent} size={17}/>
          </TouchableOpacity>
        </View>

        {/* Overall progress card */}
        <View style={[s.gtCard,{backgroundColor:cardBg,borderColor:cardBorder}]}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <Text style={{fontSize:14,fontWeight:'700',color:'#F1F5F9'}}>Overall Progress</Text>
            <Text style={{fontSize:30,fontWeight:'800',color:T.primary}}>{overallPct}%</Text>
          </View>
          <View style={s.progressBg}>
            <View style={[s.progressFill,{width:`${overallPct}%`,backgroundColor:T.primary}]}/>
          </View>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:8}}>
            <Text style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>0%</Text>
            <View style={s.chip}>
              <Text style={{fontSize:10,color:T.primary,fontWeight:'700'}}>On Track ✓</Text>
            </View>
            <Text style={{fontSize:10,color:'rgba(255,255,255,0.4)'}}>100%</Text>
          </View>
        </View>

        {/* Mini stats row */}
        <View style={{flexDirection:'row',gap:9,marginHorizontal:14,marginBottom:12}}>
          {/* Completed */}
          <View style={s.miniCard}>
            <Text style={s.miniLbl}>Completed</Text>
            <Text style={[s.miniVal,{color:T.primary}]}>{completedGoals}</Text>
            <Text style={s.miniSub}>goals done</Text>
          </View>

          {/* In Progress */}
          <View style={s.miniCard}>
            <Text style={s.miniLbl}>In Progress</Text>
            <Text style={[s.miniVal,{color:T.orange}]}>{inProgressGoals}</Text>
            <Text style={s.miniSub}>active goals</Text>
          </View>

          <View style={s.miniCard}>
            <Text style={s.miniLbl}>Balance</Text>
            <Text style={[s.miniVal,{color:accent}]} numberOfLines={1} adjustsFontSizeToFit>
              {balanceFmt(displayBalance)}
            </Text>
            <Text style={s.miniSub}>this month</Text>
          </View>
        </View>

        {/* Goals header */}
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginHorizontal:14,marginBottom:9}}>
          <Text style={s.sl}>Your Goals</Text>
          <TouchableOpacity style={s.addBtn} onPress={()=>setShowAdd(true)}>
            <Text style={{color:T.primary,fontSize:16,fontWeight:'700'}}>+</Text>
          </TouchableOpacity>
        </View>

        {state.goals.length === 0 ? (
          <View style={{alignItems:'center',paddingVertical:32,paddingHorizontal:32}}>
            <EmptyGoalsIllustration color={isDark?'#A3E635':'#7C3AED'}/>
            <Text style={{fontSize:17,fontWeight:'800',color:T.text,marginTop:16,marginBottom:6}}>
              No goals yet
            </Text>
            <Text style={{fontSize:13,color:T.muted,textAlign:'center',lineHeight:20,marginBottom:24}}>
              Set your first savings goal and start building your future — one step at a time.
            </Text>
            <SolidPillBtn
              label="Create Your First Goal"
              onPress={()=>setShowAdd(true)}
              isDark={isDark}
            />
          </View>
        ) : state.goals.map(goal=>{
          const pct2=Math.min(100,Math.round((goal.saved/goal.target)*100));
          const done=goal.saved>=goal.target;
          return (
            <View key={goal.id} style={s.goalCard}>
              <View style={s.goalTop}>
                <View style={[s.goalIcon,{backgroundColor:done?'rgba(163,230,53,0.12)':isDark?'rgba(255,255,255,0.06)':T.card2}]}>
                  <Text style={{fontSize:20}}>{goal.icon}</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={s.goalNm}>{goal.name}</Text>
                  <Text style={s.goalProg}>
                    {sym} {(goal.saved*rate).toFixed(0)} / {sym} {(goal.target*rate).toFixed(0)}
                    {goal.deadline?`  ·  Due ${goal.deadline}`:''}
                  </Text>
                </View>
                <Text style={{fontSize:14,fontWeight:'800',color:done?T.primary:T.text}}>{pct2}%</Text>
              </View>

              <View style={[s.progressBg,{backgroundColor:T.card2,marginBottom:10}]}>
                <View style={[s.progressFill,{width:`${pct2}%`,backgroundColor:done?T.primary:T.blue}]}/>
              </View>

              <View style={{flexDirection:'row',gap:8}}>
                <TouchableOpacity style={[s.goalBtn,s.goalBtnTransfer]}
                  onPress={()=>openTransferForGoal(goal)} activeOpacity={0.80}>
                  <TransferIcon color={accent} size={14}/>
                  <Text style={[s.goalBtnTxt,{color:accent}]}>Transfer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.goalBtn,s.goalBtnEdit]}
                  onPress={()=>openUpdate(goal)} activeOpacity={0.80}>
                  <EditIcon color={isDark?'#F1F5F9':'#0F172A'} size={13}/>
                  <Text style={[s.goalBtnTxt,{color:isDark?'#F1F5F9':'#0F172A'}]}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* ── ADD GOAL MODAL ── */}
      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={()=>setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={()=>setShowAdd(false)}>
            <TouchableOpacity activeOpacity={1} style={[s.modal,{backgroundColor:modalBg,borderColor:modalBd}]}>
              <View style={[s.handle,{backgroundColor:handleCol}]}/>
              <Text style={[s.modalTitle,{color:modalText}]}>Add New Goal</Text>

              <ScrollView style={{maxHeight:500}} keyboardShouldPersistTaps="handled">
                <Text style={[s.mlbl,{paddingHorizontal:18,color:modalMuted}]}>Choose Icon</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}
                  style={{paddingHorizontal:18,marginBottom:14}}>
                  <View style={{flexDirection:'row',gap:8}}>
                    {GOAL_ICONS.map(ic=>(
                      <TouchableOpacity key={ic}
                        style={[s.iconPicker,{backgroundColor:inputBg,borderColor:inputBd},
                          gIcon===ic&&{borderColor:T.primary,backgroundColor:T.primaryGlow}]}
                        onPress={()=>setGIcon(ic)}>
                        <Text style={{fontSize:24}}>{ic}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <View style={{paddingHorizontal:18}}>
                  <Text style={[s.mlbl,{color:modalMuted}]}>Goal Name *</Text>
                  <TextInput style={[s.mi,{backgroundColor:inputBg,borderColor:inputBd,color:modalText}]}
                    value={gName} onChangeText={setGName}
                    placeholder="e.g. Dubai Trip" placeholderTextColor={modalMuted}/>

                  <Text style={[s.mlbl,{color:modalMuted}]}>Target Amount ({sym}) *</Text>
                  <TextInput style={[s.mi,{backgroundColor:inputBg,borderColor:inputBd,color:modalText}]}
                    value={gTarget} onChangeText={setGTarget}
                    placeholder="e.g. 80000" keyboardType="decimal-pad"
                    placeholderTextColor={modalMuted}/>

                  <Text style={[s.mlbl,{color:modalMuted}]}>Already Saved ({sym})</Text>
                  <TextInput style={[s.mi,{backgroundColor:inputBg,borderColor:inputBd,color:modalText}]}
                    value={gSaved} onChangeText={setGSaved}
                    placeholder="0" keyboardType="decimal-pad"
                    placeholderTextColor={modalMuted}/>

                  <Text style={[s.mlbl,{color:modalMuted}]}>Target Date (YYYY-MM-DD)</Text>
                  <TextInput style={[s.mi,{backgroundColor:inputBg,borderColor:inputBd,color:modalText}]}
                    value={gDeadline} onChangeText={setGDeadline}
                    placeholder="2026-12-31" placeholderTextColor={modalMuted}/>

                  <GradPillBtn label="Create Goal" onPress={saveGoal}
                    isDark={isDark} style={{marginBottom:8}}/>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── UPDATE GOAL MODAL ── */}
      <Modal visible={showUpdate} animationType="slide" transparent onRequestClose={()=>setShowUpdate(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={()=>setShowUpdate(false)}>
          <TouchableOpacity activeOpacity={1} style={[s.modal,{backgroundColor:modalBg,borderColor:modalBd}]}>
            <View style={[s.handle,{backgroundColor:handleCol}]}/>
            <Text style={[s.modalTitle,{color:modalText}]}>Update Goal</Text>

            {activeGoal&&(
              <View style={{padding:18}}>
                <Text style={[s.mlbl,{color:modalMuted}]}>Goal Name</Text>
                <TextInput style={[s.mi,{backgroundColor:inputBg,borderColor:inputBd,color:modalText}]}
                  value={activeGoal.name} onChangeText={v=>setActiveGoal(p=>({...p,name:v}))}
                  placeholderTextColor={modalMuted}/>

                <Text style={[s.mlbl,{color:modalMuted}]}>Target Amount ({sym})</Text>
                <TextInput style={[s.mi,{backgroundColor:inputBg,borderColor:inputBd,color:modalText}]}
                  value={String(activeGoal.target)} onChangeText={v=>setActiveGoal(p=>({...p,target:v}))}
                  keyboardType="decimal-pad" placeholderTextColor={modalMuted}/>

                <Text style={[s.mlbl,{color:modalMuted}]}>Saved So Far ({sym})</Text>
                <TextInput style={[s.mi,{backgroundColor:inputBg,borderColor:inputBd,color:modalText}]}
                  value={String(activeGoal.saved)} onChangeText={v=>setActiveGoal(p=>({...p,saved:v}))}
                  keyboardType="decimal-pad" placeholderTextColor={modalMuted}/>

                <Text style={[s.mlbl,{color:modalMuted}]}>Deadline</Text>
                <TextInput style={[s.mi,{backgroundColor:inputBg,borderColor:inputBd,color:modalText}]}
                  value={activeGoal.deadline||''} onChangeText={v=>setActiveGoal(p=>({...p,deadline:v}))}
                  placeholder="YYYY-MM-DD" placeholderTextColor={modalMuted}/>

                <View style={{flexDirection:'row',gap:10,marginBottom:10}}>
                  <GradPillBtn label="Cancel" onPress={()=>setShowUpdate(false)}
                    isDark={isDark} outline style={{flex:1}}/>
                  <GradPillBtn label="Save Changes" onPress={saveUpdate}
                    isDark={isDark} style={{flex:2}}/>
                </View>
                <DangerBtn label="Delete Goal" onPress={deleteGoal}/>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── TRANSFER MODAL ── */}
      <Modal visible={showTransfer} animationType="slide" transparent onRequestClose={()=>setShowTransfer(false)}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={()=>setShowTransfer(false)}>
            <TouchableOpacity activeOpacity={1} style={[s.modal,{backgroundColor:modalBg,borderColor:modalBd}]}>
              <View style={[s.handle,{backgroundColor:handleCol}]}/>
              <Text style={[s.modalTitle,{color:modalText}]}>Transfer to Goal</Text>

              <View style={{padding:18}}>
                <Text style={[s.mlbl,{marginBottom:12,color:modalMuted}]}>Select Goal</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:16}}>
                  <View style={{flexDirection:'row',gap:8}}>
                    {state.goals.map(g=>(
                      <TouchableOpacity key={g.id}
                        style={[s.tgItem,{backgroundColor:inputBg,borderColor:inputBd},
                          transferGoalId===g.id&&{borderColor:T.primary,backgroundColor:T.primaryGlow}]}
                        onPress={()=>setTransferGoalId(g.id)}>
                        <Text style={{fontSize:22,marginBottom:4}}>{g.icon}</Text>
                        <Text style={{fontSize:11,fontWeight:'700',color:modalText,marginBottom:2,textAlign:'center'}}>{g.name}</Text>
                        <Text style={{fontSize:10,color:modalMuted}}>{Math.round((g.saved/g.target)*100)}%</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <Text style={[s.mlbl,{color:modalMuted}]}>Amount ({sym})</Text>
                <TextInput style={[s.mi,{backgroundColor:inputBg,borderColor:inputBd,color:modalText}]}
                  value={transferAmt} onChangeText={setTransferAmt}
                  keyboardType="decimal-pad" placeholder="e.g. 5000"
                  placeholderTextColor={modalMuted}/>

                <Text style={{fontSize:12,color:modalMuted,marginBottom:16}}>
                  Available:{' '}
                  <Text style={{color:accent,fontWeight:'700'}}>{balanceFmt(displayBalance)}</Text>
                </Text>

                <GradPillBtn label="Transfer Now" onPress={doTransfer}
                  isDark={isDark} disabled={!transferGoalId||!transferAmt}/>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const makeStyles = T => StyleSheet.create({
  topbar:      {flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:18,paddingTop:12},
  title:       {fontSize:18,fontWeight:'700',color:T.text},
  ib:          {width:36,height:36,borderRadius:11,borderWidth:1,borderColor:T.border2,backgroundColor:T.card,alignItems:'center',justifyContent:'center'},
  gtCard:      {margin:14,marginTop:0,borderRadius:20,padding:16,borderWidth:1.5},
  progressBg:  {height:13,borderRadius:100,backgroundColor:T.isDark?'rgba(255,255,255,0.08)':T.card2,overflow:'hidden'},
  progressFill:{height:'100%',borderRadius:100},
  chip:        {borderRadius:100,paddingVertical:3,paddingHorizontal:9,backgroundColor:T.isDark?'rgba(163,230,53,0.12)':'rgba(99,102,241,0.1)',borderWidth:1,borderColor:T.isDark?'rgba(163,230,53,0.25)':'rgba(99,102,241,0.2)'},
  miniCard:    {flex:1,backgroundColor:T.card,borderRadius:14,padding:12,borderWidth:1,borderColor:T.border},
  miniLbl:     {fontSize:10,color:T.muted,fontWeight:'700',textTransform:'uppercase',marginBottom:4},
  miniVal:     {fontSize:22,fontWeight:'800',marginBottom:2},   // ← same for all 3 cards
  miniSub:     {fontSize:10,color:T.muted},
  sl:          {fontSize:11,color:T.muted,letterSpacing:0.7,textTransform:'uppercase',fontWeight:'700'},
  addBtn:      {width:28,height:28,borderRadius:9,backgroundColor:T.primaryGlow,borderWidth:1,borderColor:T.isDark?'rgba(163,230,53,0.28)':'rgba(99,102,241,0.2)',alignItems:'center',justifyContent:'center'},
  goalCard:    {marginHorizontal:14,marginBottom:10,backgroundColor:T.card,borderRadius:18,padding:14,borderWidth:1.5,borderColor:T.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.09)'},
  goalTop:     {flexDirection:'row',alignItems:'center',gap:10,marginBottom:10},
  goalIcon:    {width:38,height:38,borderRadius:11,alignItems:'center',justifyContent:'center'},
  goalNm:      {fontSize:13,fontWeight:'700',color:T.text,marginBottom:2},
  goalProg:    {fontSize:11,color:T.muted},
  goalBtn:     {flex:1,height:36,borderRadius:100,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,borderWidth:1.5},
  goalBtnTxt:  {fontSize:11,fontWeight:'700'},
  goalBtnTransfer:{backgroundColor:T.isDark?'rgba(163,230,53,0.10)':'rgba(124,58,237,0.08)',borderColor:T.isDark?'rgba(163,230,53,0.30)':'rgba(124,58,237,0.28)'},
  goalBtnEdit: {backgroundColor:T.isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)',borderColor:T.isDark?'rgba(255,255,255,0.20)':'rgba(0,0,0,0.18)'},
  overlay:     {flex:1,backgroundColor:'rgba(0,0,0,0.72)',justifyContent:'flex-end'},
  modal:       {borderRadius:28,borderBottomLeftRadius:0,borderBottomRightRadius:0,borderWidth:1,maxHeight:'90%'},
  handle:      {width:36,height:4,borderRadius:2,alignSelf:'center',marginTop:12,marginBottom:18},
  modalTitle:  {fontSize:18,fontWeight:'800',paddingHorizontal:18,marginBottom:4},
  mlbl:        {fontSize:11,fontWeight:'700',textTransform:'uppercase',letterSpacing:0.6,marginBottom:7},
  mi:          {height:50,borderRadius:13,borderWidth:1,fontSize:15,paddingHorizontal:14,marginBottom:12},
  iconPicker:  {width:48,height:48,borderRadius:13,borderWidth:2,alignItems:'center',justifyContent:'center'},
  tgItem:      {borderRadius:13,borderWidth:2,padding:10,alignItems:'center',minWidth:90},
});