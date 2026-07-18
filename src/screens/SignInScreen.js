import React, {useState, useRef, useEffect} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated, Dimensions,
} from 'react-native';
import ScreenWrapper from '../utils/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {Path, Circle, Line} from 'react-native-svg';
import {useApp} from '../context/AppContext';
import {useTheme} from '../utils/theme';
import SocialAuthSheet, {GoogleLogo, AppleLogo} from './SocialAuthSheet';

const {height: SCREEN_H} = Dimensions.get('window');

// ─── Eye Icon ─────────────────────────────────────────────────────────────────
const EyeIcon = ({visible, size = 22, color = 'rgba(255,255,255,0.40)'}) => {
  const sp = {stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', fill: 'none'};
  if (visible) return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2 12 C5 6, 19 6, 22 12"  {...sp}/>
      <Path d="M2 12 C5 18, 19 18, 22 12" {...sp}/>
      <Circle cx="12" cy="12" r="3" {...sp}/>
      <Circle cx="12" cy="12" r="1.2" fill={color} stroke="none"/>
    </Svg>
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2 12 C5 7.5, 19 7.5, 22 12" {...sp}/>
      <Line x1="3.5" y1="3.5" x2="20.5" y2="20.5" {...sp} strokeWidth={1.9}/>
    </Svg>
  );
};

// ─── Sparkle ──────────────────────────────────────────────────────────────────
const Sparkle = ({size = 13, color}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2 L13.4 10.6 L12 22 L10.6 10.6 Z" fill={color}/>
    <Path d="M2 12 L10.6 10.6 L22 12 L10.6 13.4 Z" fill={color}/>
  </Svg>
);

// ─── Ticker ───────────────────────────────────────────────────────────────────
const QUOTES = [
  'Track every dollar. Own your future.',
  'Set goals. Stay focused. Win daily.',
  'Small savings build big wealth.',
  'Budget smart. Live better.',
  'Secure, private, always with you.',
  'Your money, your rules.',
  'Spend less. Save more. Repeat.',
];

function Ticker({isDark}) {
  const [pillWidth, setPillWidth] = useState(0);
  const [curQuote,  setCurQuote]  = useState(QUOTES[0]);
  const animRef  = useRef({posX: new Animated.Value(0), opacity: new Animated.Value(1)});
  const indexRef = useRef(0);
  const timerRef = useRef(null);
  const {posX, opacity} = animRef.current;
  const EXIT_MS = 700, ENTER_MS = 700, HOLD_MS = 2600;

  const runCycle = (w) => {
    if (w <= 0) return;
    Animated.parallel([
      Animated.timing(posX,    {toValue: -w, duration: EXIT_MS,  useNativeDriver: true}),
      Animated.timing(opacity, {toValue: 0,  duration: EXIT_MS,  useNativeDriver: true}),
    ]).start(() => {
      indexRef.current = (indexRef.current + 1) % QUOTES.length;
      setCurQuote(QUOTES[indexRef.current]);
      posX.setValue(w); opacity.setValue(0);
      Animated.parallel([
        Animated.timing(posX,    {toValue: 0, duration: ENTER_MS, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 1, duration: ENTER_MS, useNativeDriver: true}),
      ]).start(() => { timerRef.current = setTimeout(() => runCycle(w), HOLD_MS); });
    });
  };

  useEffect(() => {
    if (pillWidth <= 0) return;
    posX.setValue(pillWidth); opacity.setValue(0);
    Animated.parallel([
      Animated.timing(posX,    {toValue: 0, duration: ENTER_MS, useNativeDriver: true}),
      Animated.timing(opacity, {toValue: 1, duration: ENTER_MS, useNativeDriver: true}),
    ]).start(() => { timerRef.current = setTimeout(() => runCycle(pillWidth), HOLD_MS); });
    return () => clearTimeout(timerRef.current);
  }, [pillWidth]);

  // Both modes: same dark indigo background
  // Dark mode : bright indigo-400 text (#818CF8)
  // Light mode: deep indigo text (#4338CA) readable on dark bg — pill color matches dark mode exactly
  const pillBg   = 'rgba(55,48,163,0.28)';    // same dark indigo bg for both modes
  const pillBd   = 'rgba(79,70,229,0.55)';    // same border for both modes
  const textCol  = isDark ? '#818CF8' : '#A5B4FC'; // bright indigo dark / light indigo light
  const sparkCol = isDark ? '#6366F1' : '#818CF8';
  const textMax  = pillWidth > 0 ? pillWidth - 48 : undefined;

  return (
    <View style={[tk.pill, {backgroundColor: pillBg, borderColor: pillBd}]}
      onLayout={e => {
        const w = e.nativeEvent.layout.width;
        if (w > 0 && pillWidth === 0) setPillWidth(w);
      }}>
      <Animated.View style={[tk.row, {width: pillWidth || '100%', transform: [{translateX: posX}], opacity}]}>
        <Sparkle size={13} color={sparkCol}/>
        <Text style={[tk.text, {color: textCol}, textMax ? {maxWidth: textMax} : {}]} numberOfLines={1}>
          {curQuote}
        </Text>
      </Animated.View>
    </View>
  );
}
const tk = StyleSheet.create({
  pill: {borderWidth: 1.5, borderRadius: 100, paddingVertical: 11, paddingHorizontal: 16,
         marginBottom: 28, height: 42, overflow: 'hidden', justifyContent: 'center', alignItems: 'center'},
  row:  {flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
         gap: 6, paddingHorizontal: 16, position: 'absolute'},
  text: {fontSize: 13, fontWeight: '700', letterSpacing: 0.2, flexShrink: 1},
});

// ─── Password Field ───────────────────────────────────────────────────────────
function PasswordField({label, value, onChangeText, error, isDark, placeholder = 'Your password'}) {
  const [focused, setFocused] = useState(false);
  const [show,    setShow]    = useState(false);
  const sc = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    Animated.sequence([
      Animated.timing(sc, {toValue: 0.7, duration: 70, useNativeDriver: true}),
      Animated.spring(sc, {toValue: 1,   friction: 4,  useNativeDriver: true}),
    ]).start();
    setShow(v => !v);
  };

  const inputBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.26)';
  const inputBd = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.52)';
  const focusBd = isDark ? 'rgba(99,102,241,0.65)'  : 'rgba(255,255,255,0.95)';
  const errBd   = isDark ? 'rgba(239,68,68,0.55)'   : 'rgba(255,150,160,0.80)';
  const labelCol= isDark ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.82)';
  const eyeCol  = focused
    ? (isDark ? 'rgba(129,140,248,0.9)' : 'rgba(255,255,255,0.92)')
    : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.60)');

  return (
    <View style={pf.wrap}>
      <Text style={[pf.label, {color: labelCol}]}>{label}</Text>
      <View style={[pf.row, {
        backgroundColor: inputBg,
        borderColor: error ? errBd : focused ? focusBd : inputBd,
      }]}>
        <TextInput
          style={pf.input} value={value} onChangeText={onChangeText}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.55)'}
          placeholder={placeholder}
          secureTextEntry={!show} autoCapitalize="none" autoCorrect={false}/>
        <TouchableOpacity onPress={toggle} style={pf.eye} activeOpacity={1}
          hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
          <Animated.View style={{transform: [{scale: sc}]}}>
            <EyeIcon visible={show} size={22} color={eyeCol}/>
          </Animated.View>
        </TouchableOpacity>
      </View>
      {!!error && <Text style={[pf.err, {color: isDark ? '#EF4444' : '#FFD6E4'}]}>{error}</Text>}
    </View>
  );
}
const pf = StyleSheet.create({
  wrap:  {marginBottom: 16},
  label: {fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8},
  row:   {flexDirection: 'row', alignItems: 'center', height: 54, borderRadius: 27,
          borderWidth: 1.5, paddingLeft: 18, paddingRight: 10},
  input: {flex: 1, color: '#FFFFFF', fontSize: 15, height: '100%'},
  eye:   {padding: 6, alignItems: 'center', justifyContent: 'center'},
  err:   {fontSize: 11, fontWeight: '600', marginTop: 5},
});

// ─── Text Field ───────────────────────────────────────────────────────────────
function Field({label, value, onChangeText, error, isDark, ...rest}) {
  const [focused, setFocused] = useState(false);
  const inputBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.26)';
  const inputBd = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.52)';
  const focusBd = isDark ? 'rgba(99,102,241,0.65)'  : 'rgba(255,255,255,0.95)';
  const errBd   = isDark ? 'rgba(239,68,68,0.55)'   : 'rgba(255,150,160,0.80)';
  const labelCol= isDark ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.82)';
  return (
    <View style={fi.wrap}>
      <Text style={[fi.label, {color: labelCol}]}>{label}</Text>
      <TextInput
        style={[fi.input, {
          backgroundColor: inputBg,
          borderColor: error ? errBd : focused ? focusBd : inputBd,
        }]}
        value={value} onChangeText={onChangeText}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.55)'}
        {...rest}/>
      {!!error && <Text style={[fi.err, {color: isDark ? '#EF4444' : '#FFD6E4'}]}>{error}</Text>}
    </View>
  );
}
const fi = StyleSheet.create({
  wrap:  {marginBottom: 16},
  label: {fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8},
  input: {height: 54, borderRadius: 27, borderWidth: 1.5, color: '#FFFFFF', fontSize: 15, paddingHorizontal: 18},
  err:   {fontSize: 11, fontWeight: '600', marginTop: 5},
});

// ─── Gradient Button ──────────────────────────────────────────────────────────
function GradientButton({label, onPress, loading, style, isDark}) {
  const colors = isDark
    ? ['#4F46E5', '#7C3AED', '#9B35C5']
    : ['#E890C8', '#D468A8', '#C060C0'];
  return (
    <TouchableOpacity style={[gb.touch, style, loading && {opacity: 0.7}]}
      onPress={onPress} disabled={loading} activeOpacity={0.85}>
      <LinearGradient colors={colors} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={gb.grad}>
        <Text style={gb.label}>{loading ? 'Signing in...' : label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
const gb = StyleSheet.create({
  touch: {borderRadius: 27, overflow: 'hidden'},
  grad:  {height: 54, alignItems: 'center', justifyContent: 'center'},
  label: {color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3},
});

// ─── Social Button ────────────────────────────────────────────────────────────
function SocialButton({provider, onPress, isDark}) {
  const isGoogle = provider === 'google';
  const btnBg  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.26)';
  const btnBd  = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.52)';
  return (
    <TouchableOpacity
      style={[sbb.btn, {backgroundColor: btnBg, borderColor: btnBd}]}
      onPress={onPress} activeOpacity={0.78}>
      <View style={sbb.logoWrap}>
        {isGoogle ? <GoogleLogo size={20}/> : <AppleLogo color="#FFFFFF" size={18}/>}
      </View>
      <Text style={sbb.txt}>
        {isGoogle ? 'Continue with Google' : 'Continue with Apple'}
      </Text>
    </TouchableOpacity>
  );
}
const sbb = StyleSheet.create({
  btn:     {height: 52, borderRadius: 27, flexDirection: 'row', alignItems: 'center',
            justifyContent: 'center', marginBottom: 10, borderWidth: 1.5},
  logoWrap:{width: 24, height: 24, alignItems: 'center', justifyContent: 'center', marginRight: 10},
  txt:     {fontSize: 15, fontWeight: '600', color: '#FFFFFF', letterSpacing: 0.1},
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function SignInScreen({navigation}) {
  const {state, dispatch} = useApp();
  const T      = useTheme(state.isDarkMode);
  const isDark = state.isDarkMode;

  const [email,         setEmail]         = useState('');
  const [pass,          setPass]          = useState('');
  const [errors,        setErrors]        = useState({});
  const [loading,       setLoading]       = useState(false);
  const [sheetVisible,  setSheetVisible]  = useState(false);
  const [sheetProvider, setSheetProvider] = useState('google');

  function openSheet(provider) {
    setSheetProvider(provider);
    setSheetVisible(true);
  }

  function validate() {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!pass) e.pass = 'Password is required';
    return e;
  }

  function handleSignin() {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length > 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const found = state.registeredUsers?.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) { setErrors({email: 'No account found. Sign up first.'}); return; }
      if (found.pass !== pass) { setErrors({pass: 'Incorrect password.'}); return; }
      dispatch({type: 'LOGIN', user: found, isNew: false});
      navigation.reset({index: 0, routes: [{name: 'Main'}]});
    }, 800);
  }

  function handleDemo() {
    dispatch({type: 'LOGIN', user: {name: 'Anas Khan', email: 'demo@spendwise.app', pass: 'Demo1234'}, isNew: false});
    navigation.reset({index: 0, routes: [{name: 'Main'}]});
  }

  function handleSocialSuccess(provider, account) {
    setSheetVisible(false);
    dispatch({type: 'LOGIN', user: {
      name:  account?.name  || 'Social User',
      email: account?.email || `user@${provider === 'apple' ? 'icloud' : 'gmail'}.com`,
      pass:  'social_auth',
    }, isNew: false});
    navigation.reset({index: 0, routes: [{name: 'Main'}]});
  }

  const subtitleCol = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.82)';
  const forgotCol   = isDark ? '#A3E635' : '#FFFFFF';
  const divLineCol  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.30)';
  const divTxtCol   = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.65)';
  const demoBg      = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.18)';
  const demoBd      = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.40)';
  const demoTxtCol  = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.82)';
  const switchCol   = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.70)';
  const switchHl    = isDark ? '#F97316' : '#FFFFFF';

  return (
    <ScreenWrapper isDarkMode={isDark}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={s.header}>
            <Text style={s.title}>Welcome back</Text>
            <Text style={[s.subtitle, {color: subtitleCol}]}>Sign in to your SpendWise account</Text>
          </View>

          <View style={s.tickerWrap}><Ticker isDark={isDark}/></View>

          <View style={s.body}>
            <Field
              label="Email Address" value={email} isDark={isDark}
              onChangeText={v => {setEmail(v); setErrors(p => ({...p, email: undefined}));}}
              error={errors.email} placeholder="you@example.com"
              keyboardType="email-address" autoCapitalize="none" autoCorrect={false}/>

            <PasswordField
              label="Password" value={pass} isDark={isDark}
              onChangeText={v => {setPass(v); setErrors(p => ({...p, pass: undefined}));}}
              error={errors.pass}/>

            <TouchableOpacity style={s.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[s.forgotTxt, {color: forgotCol}]}>Forgot password?</Text>
            </TouchableOpacity>

            <GradientButton
              label="Sign In" onPress={handleSignin}
              loading={loading} style={s.submitWrap} isDark={isDark}/>

            <View style={s.divider}>
              <View style={[s.divLine, {backgroundColor: divLineCol}]}/>
              <Text style={[s.divTxt, {color: divTxtCol}]}>OR</Text>
              <View style={[s.divLine, {backgroundColor: divLineCol}]}/>
            </View>

            <SocialButton provider="google" isDark={isDark} onPress={() => openSheet('google')}/>
            <SocialButton provider="apple"  isDark={isDark} onPress={() => openSheet('apple')}/>

            <TouchableOpacity
              style={[s.demoBtn, {backgroundColor: demoBg, borderColor: demoBd}]}
              onPress={handleDemo}>
              <Text style={[s.demoTxt, {color: demoTxtCol}]}>Try Demo Account</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={[s.switchTxt, {color: switchCol}]}>
                Don't have an account?{' '}
                <Text style={[s.switchHl, {color: switchHl}]}>Sign up free</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SocialAuthSheet
        visible={sheetVisible}
        provider={sheetProvider}
        mode="signin"
        isDark={isDark}
        onClose={() => setSheetVisible(false)}
        onSuccess={handleSocialSuccess}
      />
    </ScreenWrapper>
  );
}
const s = StyleSheet.create({
  header:    {paddingHorizontal: 24, paddingTop: 48, paddingBottom: 20},
  title:     {fontSize: 34, fontWeight: '800', color: '#FFFFFF', marginBottom: 8, letterSpacing: -0.5},
  subtitle:  {fontSize: 15, lineHeight: 22},
  tickerWrap:{paddingHorizontal: 24},
  body:      {paddingHorizontal: 24, paddingBottom: 60},
  forgotRow: {alignSelf: 'flex-end', marginTop: -4, marginBottom: 20},
  forgotTxt: {fontSize: 13, fontWeight: '700'},
  submitWrap:{marginBottom: 22},
  divider:   {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16},
  divLine:   {flex: 1, height: 1},
  divTxt:    {fontSize: 12, fontWeight: '500'},
  demoBtn:   {borderRadius: 27, height: 52, alignItems: 'center', justifyContent: 'center',
              marginTop: 6, marginBottom: 22, borderWidth: 1.5},
  demoTxt:   {fontSize: 14, fontWeight: '600'},
  switchTxt: {textAlign: 'center', fontSize: 14},
  switchHl:  {fontWeight: '700'},
});