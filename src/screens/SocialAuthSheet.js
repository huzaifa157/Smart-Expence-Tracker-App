import React, {useState, useRef, useEffect} from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Modal, Dimensions, ActivityIndicator,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';

const {height: SCREEN_H} = Dimensions.get('window');
const SHEET_H = SCREEN_H * 0.62;

// ─── Google SVG ───────────────────────────────────────────────────────────────
export const GoogleLogo = ({size=20}) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10.9 0 20-8.9 20-20 0-1.3-.1-2.7-.4-3.9z"/>
    <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.8 19 13 24 13c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.5 35.5 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 40 16.3 44 24 44z"/>
    <Path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.4 4.2-4.3 5.5l6.2 5.2C40.8 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-3.9z"/>
  </Svg>
);

// ─── Apple SVG ────────────────────────────────────────────────────────────────
export const AppleLogo = ({color='#FFFFFF', size=20}) => (
  <Svg width={size} height={size * 1.2} viewBox="0 0 814 1000">
    <Path fill={color} d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46.3 790.3 0 694.1 0 601.4c0-151.2 98.8-230.9 195.7-230.9 61 0 111.5 40.2 149.7 40.2 36.3 0 93.7-42.5 162.3-42.5.9 0 1.8 0 2.7.1zM441.4 113.5C463.8 87.5 480.2 51.1 480.2 14.7c0-5.6-.4-11.2-1.2-16.7-36.1 1.3-79 24.1-104.4 52.1C354.6 75.7 336 112.5 336 149.5c0 6.1.8 12.3 1.2 14.3 2.3.4 6.1.6 9.9.6 32.4 0 72.9-21.8 94.3-50.9z"/>
  </Svg>
);

// ─── Check icon ───────────────────────────────────────────────────────────────
const CheckIcon = ({color='#A3E635', size=34}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 13l4 4L19 7" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ─── Mock accounts ────────────────────────────────────────────────────────────
const MOCK_ACCOUNTS = {
  google: [
    {name:'Hamza Wahaj', email:'hamzawahaj@gmail.com',  avatar:'HW', avatarColor:'#4285F4'},
    {name:'Anas Khan',   email:'anaskhan@gmail.com',     avatar:'AK', avatarColor:'#34A853'},
  ],
  apple: [
    {name:'Hamza Wahaj', email:'hamzawahaj@icloud.com', avatar:'HW', avatarColor:'#555'},
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
export default function SocialAuthSheet({
  visible, provider, mode='signin', isDark=true, onClose, onSuccess,
}) {
  const slideY    = useRef(new Animated.Value(SHEET_H)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;
  const [step,       setStep]       = useState('pick');
  const [selAccount, setSelAccount] = useState(null);

  const isGoogle     = provider === 'google';
  const isSignup     = mode === 'signup';
  const providerName = isGoogle ? 'Google' : 'Apple';
  const accounts     = MOCK_ACCOUNTS[provider] || [];

  // ── Theme tokens — white light / dark mirror ──────────────────────────────
  const sheetBg      = isDark ? '#0F0F18'              : '#FFFFFF';
  const sheetBorder  = isDark ? 'rgba(255,255,255,0.09)': 'rgba(0,0,0,0.08)';
  const handleColor  = isDark ? 'rgba(255,255,255,0.20)': 'rgba(0,0,0,0.15)';
  const titleColor   = isDark ? '#F1F5F9'              : '#0F172A';
  const subColor     = isDark ? 'rgba(255,255,255,0.40)': '#64748B';
  const highlightCol = isDark ? '#A3E635'              : '#6366F1';
  const accListBg    = isDark ? 'rgba(255,255,255,0.04)': 'rgba(255,255,255,0.90)';
  const accListBd    = isDark ? 'rgba(255,255,255,0.08)': 'rgba(0,0,0,0.08)';
  const accRowBd     = isDark ? 'rgba(255,255,255,0.07)': 'rgba(0,0,0,0.06)';
  const accNameColor = isDark ? '#F1F5F9'              : '#0F172A';
  const accEmailCol  = isDark ? 'rgba(255,255,255,0.42)': '#64748B';
  const arrowColor   = isDark ? 'rgba(255,255,255,0.25)': 'rgba(0,0,0,0.20)';
  const anotherBg    = isDark ? 'rgba(255,255,255,0.03)': 'rgba(255,255,255,0.85)';
  const anotherBd    = isDark ? 'rgba(255,255,255,0.07)': 'rgba(0,0,0,0.08)';
  const anotherIconBd= isDark ? 'rgba(255,255,255,0.12)': 'rgba(0,0,0,0.12)';
  const anotherPlus  = isDark ? 'rgba(255,255,255,0.42)': 'rgba(0,0,0,0.35)';
  const anotherTxt   = isDark ? 'rgba(255,255,255,0.50)': '#64748B';
  const cancelColor  = isDark ? 'rgba(255,255,255,0.30)': '#94A3B8';
  const legalColor   = isDark ? 'rgba(255,255,255,0.20)': '#94A3B8';
  const legalLinkCol = isDark ? 'rgba(255,255,255,0.40)': '#64748B';
  const verifyCardBg = isDark ? 'rgba(255,255,255,0.04)': 'rgba(0,0,0,0.03)';
  const verifyCardBd = isDark ? 'rgba(255,255,255,0.10)': 'rgba(0,0,0,0.08)';
  const stateTitleCol= isDark ? '#F1F5F9'              : '#0F172A';
  const stateSubCol  = isDark ? 'rgba(255,255,255,0.38)': '#64748B';
  const providerColor= isGoogle ? '#4285F4' : (isDark ? '#F1F5F9' : '#0F172A');
  const successRingBd= '#A3E635';
  const successRingBg= 'rgba(163,230,53,0.08)';

  // ── Animate in/out ────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setStep('pick');
      setSelAccount(null);
      Animated.parallel([
        Animated.spring(slideY,    {toValue:0,       friction:9, tension:70, useNativeDriver:true}),
        Animated.timing(bgOpacity, {toValue:1,       duration:280, useNativeDriver:true}),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY,    {toValue:SHEET_H, duration:260, useNativeDriver:true}),
        Animated.timing(bgOpacity, {toValue:0,       duration:200, useNativeDriver:true}),
      ]).start();
    }
  }, [visible]);

  const doClose = () => {
    if (step === 'verifying') return;
    Animated.parallel([
      Animated.timing(slideY,    {toValue:SHEET_H, duration:260, useNativeDriver:true}),
      Animated.timing(bgOpacity, {toValue:0,       duration:200, useNativeDriver:true}),
    ]).start(() => onClose());
  };

  const pickAccount = (account) => {
    setSelAccount(account);
    setStep('verifying');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => onSuccess(provider, account), 950);
    }, 1700);
  };

  const handleNewAccount = () => {
    pickAccount({
      name:'New User',
      email:`newuser@${isGoogle ? 'gmail' : 'icloud'}.com`,
      avatar:'NU',
      avatarColor:'#64748B',
    });
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={doClose}>
      {/* Backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, {backgroundColor:'rgba(0,0,0,0.60)', opacity:bgOpacity}]}>
        <TouchableOpacity style={{flex:1}} activeOpacity={1} onPress={doClose}/>
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[s.sheet, {
        backgroundColor: sheetBg,
        borderColor:     sheetBorder,
        transform:       [{translateY: slideY}],
        // Light mode shadow lifts sheet off bg
        shadowColor:     isDark ? 'transparent' : '#000',
        shadowOffset:    {width:0, height:-3},
        shadowOpacity:   isDark ? 0 : 0.10,
        shadowRadius:    16,
        elevation:       isDark ? 0 : 10,
      }]}>
        {/* Handle */}
        <View style={[s.handle, {backgroundColor: handleColor}]}/>

        {/* ── STEP: Account picker ── */}
        {step === 'pick' && (
          <>
            {/* Provider header */}
            <View style={s.providerHeader}>
              <View style={[s.providerIconBox, {
                backgroundColor: isGoogle ? '#FFFFFF' : (isDark ? '#1C1C1E' : '#F1F5F9'),
                borderColor:     isGoogle ? '#E0E0E0' : (isDark ? '#3A3A3C' : '#CBD5E1'),
              }]}>
                {isGoogle
                  ? <GoogleLogo size={28}/>
                  : <AppleLogo color={isDark ? '#FFFFFF' : '#0F172A'} size={22}/>
                }
              </View>
              <Text style={[s.providerTitle, {color: titleColor}]}>
                {isSignup ? 'Sign up with' : 'Choose an account'}
              </Text>
              <Text style={[s.providerSub, {color: subColor}]}>
                {isSignup
                  ? `Choose a ${providerName} account to create your SpendWise profile`
                  : 'to continue to '}
                {!isSignup && (
                  <Text style={[s.appHighlight, {color: highlightCol}]}>SpendWise</Text>
                )}
              </Text>
            </View>

            {/* Account list card */}
            <View style={[s.accountList, {backgroundColor: accListBg, borderColor: accListBd}]}>
              {accounts.map((acc, i) => (
                <TouchableOpacity
                  key={acc.email}
                  style={[
                    s.accountRow,
                    i < accounts.length - 1 && {borderBottomWidth:1, borderBottomColor: accRowBd},
                  ]}
                  onPress={() => pickAccount(acc)}
                  activeOpacity={0.78}>
                  <View style={[s.avatar, {backgroundColor: acc.avatarColor}]}>
                    <Text style={s.avatarTxt}>{acc.avatar}</Text>
                  </View>
                  <View style={{flex:1}}>
                    <Text style={[s.accName,  {color: accNameColor}]}>{acc.name}</Text>
                    <Text style={[s.accEmail, {color: accEmailCol}]}>{acc.email}</Text>
                  </View>
                  <Text style={[s.accArrow, {color: arrowColor}]}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Use another account */}
            <TouchableOpacity
              style={[s.anotherBtn, {backgroundColor: anotherBg, borderColor: anotherBd}]}
              onPress={handleNewAccount}
              activeOpacity={0.75}>
              <View style={[s.anotherIconBox, {borderColor: anotherIconBd}]}>
                <Text style={[s.anotherPlusTxt, {color: anotherPlus}]}>＋</Text>
              </View>
              <Text style={[s.anotherTxtStyle, {color: anotherTxt}]}>
                {isSignup ? 'Use a different account' : 'Use another account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.cancelBtn} onPress={doClose} activeOpacity={0.7}>
              <Text style={[s.cancelTxt, {color: cancelColor}]}>Cancel</Text>
            </TouchableOpacity>

            <Text style={[s.legalNote, {color: legalColor}]}>
              {isSignup
                ? `By signing up, ${providerName} will share your name and email with SpendWise. `
                : `To continue, ${providerName} will share your name and email with SpendWise. `}
              <Text style={[s.legalLink, {color: legalLinkCol}]}>Privacy Policy</Text>
            </Text>
          </>
        )}

        {/* ── STEP: Verifying ── */}
        {step === 'verifying' && selAccount && (
          <View style={s.stateWrap}>
            <View style={[s.verifyCard, {
              backgroundColor: verifyCardBg,
              borderColor:     isGoogle ? 'rgba(66,133,244,0.28)' : verifyCardBd,
            }]}>
              <View style={[s.avatar, s.avatarLg, {backgroundColor: selAccount.avatarColor}]}>
                <Text style={[s.avatarTxt, {fontSize:20}]}>{selAccount.avatar}</Text>
              </View>
              <View style={{alignItems:'center', marginTop:12}}>
                <Text style={[s.verifyName,  {color: accNameColor}]}>{selAccount.name}</Text>
                <Text style={[s.verifyEmail, {color: accEmailCol}]}>{selAccount.email}</Text>
              </View>
            </View>
            <ActivityIndicator size="large" color={providerColor} style={{marginBottom:14}}/>
            <Text style={[s.stateTitle, {color: stateTitleCol}]}>
              Verifying with {providerName}...
            </Text>
            <Text style={[s.stateSub, {color: stateSubCol}]}>
              {isSignup ? 'Creating your account securely' : 'Authenticating your account securely'}
            </Text>
          </View>
        )}

        {/* ── STEP: Success ── */}
        {step === 'success' && (
          <View style={s.stateWrap}>
            <View style={[s.successRing, {borderColor: successRingBd, backgroundColor: successRingBg}]}>
              <CheckIcon color="#A3E635" size={34}/>
            </View>
            <Text style={[s.stateTitle, {color:'#A3E635'}]}>
              {isSignup ? 'Account Created!' : 'Verified!'}
            </Text>
            {selAccount && (
              <Text style={[s.verifyEmail, {color: accEmailCol, marginTop:4}]}>
                {selAccount.email}
              </Text>
            )}
            <Text style={[s.stateSub, {color: stateSubCol, marginTop:8}]}>
              {isSignup ? 'Setting up your SpendWise profile...' : 'Signing you in to SpendWise...'}
            </Text>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

// ─── Static layout styles only (colors applied inline) ────────────────────────
const s = StyleSheet.create({
  sheet:          {position:'absolute',bottom:0,left:0,right:0,height:SHEET_H,
                   borderTopLeftRadius:28,borderTopRightRadius:28,borderWidth:1,
                   paddingHorizontal:20,paddingBottom:24,paddingTop:10,alignItems:'center'},
  handle:         {width:36,height:4,borderRadius:2,marginBottom:20},

  providerHeader: {alignItems:'center',marginBottom:18,width:'100%'},
  providerIconBox:{width:56,height:56,borderRadius:16,borderWidth:1.5,
                   alignItems:'center',justifyContent:'center',marginBottom:12},
  providerTitle:  {fontSize:18,fontWeight:'700',marginBottom:4,letterSpacing:-0.2},
  providerSub:    {fontSize:13,textAlign:'center',lineHeight:18},
  appHighlight:   {fontWeight:'700'},

  accountList:    {width:'100%',borderRadius:16,borderWidth:1,overflow:'hidden',marginBottom:10},
  accountRow:     {flexDirection:'row',alignItems:'center',gap:12,padding:14},

  avatar:         {width:42,height:42,borderRadius:21,alignItems:'center',justifyContent:'center'},
  avatarLg:       {width:58,height:58,borderRadius:29},
  avatarTxt:      {fontSize:14,fontWeight:'800',color:'#FFFFFF'},

  accName:        {fontSize:14,fontWeight:'700',marginBottom:2},
  accEmail:       {fontSize:12},
  accArrow:       {fontSize:22,lineHeight:24},

  anotherBtn:     {flexDirection:'row',alignItems:'center',gap:12,width:'100%',
                   padding:13,borderRadius:14,borderWidth:1,marginBottom:14},
  anotherIconBox: {width:42,height:42,borderRadius:21,borderWidth:1,
                   alignItems:'center',justifyContent:'center'},
  anotherPlusTxt: {fontSize:18,lineHeight:22},
  anotherTxtStyle:{fontSize:14,fontWeight:'600'},

  cancelBtn:      {height:40,alignItems:'center',justifyContent:'center',marginBottom:8},
  cancelTxt:      {fontSize:14,fontWeight:'600'},

  legalNote:      {fontSize:10,textAlign:'center',lineHeight:15,paddingHorizontal:12},
  legalLink:      {textDecorationLine:'underline'},

  stateWrap:      {flex:1,alignItems:'center',justifyContent:'center',width:'100%'},
  verifyCard:     {alignItems:'center',borderRadius:18,borderWidth:1,
                   padding:22,marginBottom:28,width:'100%'},
  verifyName:     {fontSize:15,fontWeight:'700',marginBottom:3},
  verifyEmail:    {fontSize:13},
  stateTitle:     {fontSize:19,fontWeight:'700',marginBottom:8,letterSpacing:-0.2},
  stateSub:       {fontSize:13,textAlign:'center'},
  successRing:    {width:74,height:74,borderRadius:37,borderWidth:2,
                   alignItems:'center',justifyContent:'center',marginBottom:18},
});