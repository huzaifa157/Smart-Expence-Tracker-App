// SignUpScreen.js
// Registration screen. New users fill in name, email, password, confirm password
// and agree to terms. On success → REGISTER_USER + LOGIN (isNew: true) → Onboarding.
// Social sign-up via Google/Apple also lands on Onboarding for new users.

import React, {useState, useRef} from 'react';
import {
  View,                   // Basic layout container (like a <div>)
  Text,                   // Text display component
  TextInput,              // Editable text field
  TouchableOpacity,       // Pressable wrapper that dims on tap
  StyleSheet,             // Utility to create a stylesheet object (like CSS)
  ScrollView,             // Scrollable container for long content
  KeyboardAvoidingView,   // Shifts content up when keyboard appears
  Platform,               // Detects iOS vs Android for platform-specific logic
  Animated,               // Enables smooth JS-driven animations
} from 'react-native';

// ScreenWrapper — applies the gradient background and safe-area padding
import ScreenWrapper from '../utils/ScreenWrapper';
// LinearGradient — renders a smooth colour gradient (used for the CTA button)
import LinearGradient from 'react-native-linear-gradient';
// SVG primitives for custom vector icons
import Svg, {Path, Circle, Line} from 'react-native-svg';
// Global state hook — provides state (isDarkMode, etc.) and dispatch
import {useApp} from '../context/AppContext';
// Theme helper — returns colour tokens based on dark/light mode
import {useTheme} from '../utils/theme';
// Reusable social auth bottom sheet + Google/Apple logo exports
import SocialAuthSheet, {GoogleLogo, AppleLogo} from './SocialAuthSheet';

// ─── Eye Icon (show/hide password) ───────────────────────────────────────────
// Renders an open eye (password visible) or crossed eye (password hidden).
// props: visible (bool), size (number), color (string)
const EyeIcon = ({visible, size=22, color='rgba(255,255,255,0.40)'}) => {
  // Shared SVG stroke properties to avoid repetition
  const sp = {stroke:color, strokeWidth:1.8, strokeLinecap:'round', fill:'none'};

  // Open eye — two curved paths form the eye outline, circles form the pupil
  if (visible) return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2 12 C5 6, 19 6, 22 12"  {...sp}/> {/* Top eyelid curve */}
      <Path d="M2 12 C5 18, 19 18, 22 12" {...sp}/> {/* Bottom eyelid curve */}
      <Circle cx="12" cy="12" r="3" {...sp}/>         {/* Iris ring */}
      <Circle cx="12" cy="12" r="1.2" fill={color} stroke="none"/> {/* Pupil dot */}
    </Svg>
  );

  // Closed/crossed eye — single arc + diagonal strike-through line
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2 12 C5 7.5, 19 7.5, 22 12" {...sp}/> {/* Squinted eye arc */}
      <Line x1="3.5" y1="3.5" x2="20.5" y2="20.5" {...sp} strokeWidth={1.9}/> {/* Slash */}
    </Svg>
  );
};

// ─── Person Icon (used as prefix icon inside the name field) ─────────────────
// Simple silhouette: circle head + arc shoulders.
const PersonIcon = ({color, size=18}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={1.8}/>          {/* Head */}
    <Path d="M6 21v-1a6 6 0 0112 0v1" stroke={color} strokeWidth={1.8} strokeLinecap="round"/> {/* Shoulders */}
  </Svg>
);

// ─── Password Strength Bar ────────────────────────────────────────────────────
// Shows 4 coloured bars + a label indicating how strong the password is.
// Only renders when the password field has content.
function StrengthBar({password}) {
  // Score 0–4 based on length, uppercase, digit, and special character checks
  const score = (() => {
    let s = 0;
    if (password.length >= 8)          s++; // +1 if at least 8 characters
    if (/[A-Z]/.test(password))        s++; // +1 if contains uppercase letter
    if (/[0-9]/.test(password))        s++; // +1 if contains a digit
    if (/[^A-Za-z0-9]/.test(password)) s++; // +1 if contains special character
    return s;
  })();

  // Human-readable labels mapped to score index
  const labels = ['','Weak','Fair','Good','Strong'];
  // Colour coding: red → amber → blue → green
  const colors = ['','#EF4444','#F59E0B','#3B82F6','#22C55E'];

  // Don't render anything if the field is empty
  if (!password) return null;

  return (
    <View style={str.wrap}>
      {/* Four bar segments — filled or grey depending on current score */}
      <View style={str.bars}>
        {[1,2,3,4].map(i => (
          <View
            key={i}
            style={[str.bar, {backgroundColor: i <= score ? colors[score] : 'rgba(255,255,255,0.12)'}]}
          />
        ))}
      </View>
      {/* Text label e.g. "Strong" */}
      <Text style={[str.label, {color: colors[score]}]}>{labels[score]}</Text>
    </View>
  );
}
const str = StyleSheet.create({
  wrap:  {flexDirection:'row', alignItems:'center', gap:8, marginTop:8, marginBottom:4},
  bars:  {flexDirection:'row', gap:4, flex:1},            // Four bars in a row
  bar:   {flex:1, height:4, borderRadius:2},              // Individual bar segment
  label: {fontSize:11, fontWeight:'700', width:44, textAlign:'right'}, // Strength text
});

// ─── Password Field ───────────────────────────────────────────────────────────
// Reusable input with show/hide eye button and optional strength bar.
function PasswordField({label, value, onChangeText, error, isDark, placeholder, showStrength=false}) {
  const [focused, setFocused] = useState(false); // Whether this input currently has focus
  const [show,    setShow]    = useState(false);  // Whether the password text is visible
  const sc = useRef(new Animated.Value(1)).current; // Scale value for eye button tap animation

  // Bouncy animation when the user taps the eye toggle
  const toggle = () => {
    Animated.sequence([
      Animated.timing(sc, {toValue:0.7, duration:70, useNativeDriver:true}), // Squash
      Animated.spring(sc, {toValue:1,   friction:4,  useNativeDriver:true}), // Bounce back
    ]).start();
    setShow(v => !v); // Flip the visibility flag
  };

  // Dynamic colours based on theme and interaction state
  const inputBg  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.26)'; // Field background
  const inputBd  = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.52)'; // Default border
  const focusBd  = isDark ? 'rgba(99,102,241,0.65)'  : 'rgba(255,255,255,0.95)'; // Focused border
  const errBd    = isDark ? 'rgba(239,68,68,0.55)'   : 'rgba(255,150,160,0.80)'; // Error border
  const labelCol = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.82)'; // Label text
  const eyeCol   = focused                                                         // Eye icon colour
    ? (isDark ? 'rgba(129,140,248,0.9)' : 'rgba(255,255,255,0.92)')               //   Focused
    : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.60)');             //   Unfocused

  return (
    <View style={pf.wrap}>
      {/* Field label e.g. "PASSWORD" */}
      <Text style={[pf.label, {color:labelCol}]}>{label}</Text>

      {/* Input row: text input + eye toggle */}
      <View style={[pf.row, {
        backgroundColor: inputBg,
        borderColor: error ? errBd : focused ? focusBd : inputBd, // Priority: error > focused > normal
      }]}>
        <TextInput
          style={pf.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={()=>setFocused(true)}          // Mark as focused when tapped
          onBlur={()=>setFocused(false)}           // Unmark when focus leaves
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.55)'}
          placeholder={placeholder || 'Your password'}
          secureTextEntry={!show}                  // Hide characters unless show=true
          autoCapitalize="none"                    // Don't auto-capitalise password
          autoCorrect={false}                      // Disable autocorrect for passwords
        />
        {/* Eye toggle button — wraps the icon in an animated scale view */}
        <TouchableOpacity
          onPress={toggle}
          style={pf.eye}
          activeOpacity={1}
          hitSlop={{top:12, bottom:12, left:12, right:12}} // Expand tap area
        >
          <Animated.View style={{transform:[{scale:sc}]}}>
            <EyeIcon visible={show} size={22} color={eyeCol}/>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Password strength bars — only shown on the primary password field */}
      {showStrength && value.length > 0 && <StrengthBar password={value}/>}

      {/* Validation error message */}
      {!!error && <Text style={[pf.err, {color:isDark?'#EF4444':'#FFD6E4'}]}>{error}</Text>}
    </View>
  );
}
const pf = StyleSheet.create({
  wrap:  {marginBottom:16},                                                              // Outer spacing
  label: {fontSize:11, fontWeight:'700', letterSpacing:1, textTransform:'uppercase', marginBottom:8}, // UPPERCASE label
  row:   {flexDirection:'row', alignItems:'center', height:54, borderRadius:27, borderWidth:1.5, paddingLeft:18, paddingRight:10}, // Input + eye row
  input: {flex:1, color:'#FFFFFF', fontSize:15, height:'100%'},                         // Takes up all space left of eye
  eye:   {padding:6, alignItems:'center', justifyContent:'center'},                     // Eye button touch area
  err:   {fontSize:11, fontWeight:'600', marginTop:5},                                  // Error text below input
});

// ─── Text Field ───────────────────────────────────────────────────────────────
// Generic single-line text input. Supports an optional leading icon (e.g. person).
function Field({label, value, onChangeText, error, isDark, icon, ...rest}) {
  const [focused, setFocused] = useState(false); // Focus tracking for border highlight

  // Same dynamic colour tokens as PasswordField
  const inputBg  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.26)';
  const inputBd  = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.52)';
  const focusBd  = isDark ? 'rgba(99,102,241,0.65)'  : 'rgba(255,255,255,0.95)';
  const errBd    = isDark ? 'rgba(239,68,68,0.55)'   : 'rgba(255,150,160,0.80)';
  const labelCol = isDark ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.82)';
  // Icon colour shifts when the field is focused
  const iconCol  = focused
    ? (isDark ? 'rgba(129,140,248,0.8)' : 'rgba(255,255,255,0.85)')
    : (isDark ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.55)');

  // Version WITH a prefix icon (e.g. person icon in the name field)
  if (icon) {
    return (
      <View style={fi.wrap}>
        <Text style={[fi.label, {color:labelCol}]}>{label}</Text>
        <View style={[fi.iconRow, {
          backgroundColor: inputBg,
          borderColor: error ? errBd : focused ? focusBd : inputBd,
        }]}>
          {/* Prefix icon — colour is injected via React.cloneElement */}
          <View style={fi.iconWrap}>{React.cloneElement(icon, {color:iconCol, size:18})}</View>
          <TextInput
            style={fi.inputIcon}
            value={value}
            onChangeText={onChangeText}
            onFocus={()=>setFocused(true)}
            onBlur={()=>setFocused(false)}
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.55)'}
            {...rest} // Pass through placeholder, keyboardType, autoCapitalize, etc.
          />
        </View>
        {!!error && <Text style={[fi.err, {color:isDark?'#EF4444':'#FFD6E4'}]}>{error}</Text>}
      </View>
    );
  }

  // Version WITHOUT a prefix icon (email field, etc.)
  return (
    <View style={fi.wrap}>
      <Text style={[fi.label, {color:labelCol}]}>{label}</Text>
      <TextInput
        style={[fi.input, {
          backgroundColor: inputBg,
          borderColor: error ? errBd : focused ? focusBd : inputBd,
        }]}
        value={value}
        onChangeText={onChangeText}
        onFocus={()=>setFocused(true)}
        onBlur={()=>setFocused(false)}
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.55)'}
        {...rest}
      />
      {!!error && <Text style={[fi.err, {color:isDark?'#EF4444':'#FFD6E4'}]}>{error}</Text>}
    </View>
  );
}
const fi = StyleSheet.create({
  wrap:     {marginBottom:16},
  label:    {fontSize:11, fontWeight:'700', letterSpacing:1, textTransform:'uppercase', marginBottom:8},
  iconRow:  {flexDirection:'row', alignItems:'center', height:54, borderRadius:27, borderWidth:1.5, paddingRight:18}, // Row with icon + input
  iconWrap: {width:48, alignItems:'center', justifyContent:'center'},  // Fixed-width icon slot
  inputIcon:{flex:1, color:'#FFFFFF', fontSize:15, height:'100%'},     // Input takes remaining space
  input:    {height:54, borderRadius:27, borderWidth:1.5, color:'#FFFFFF', fontSize:15, paddingHorizontal:18}, // Standalone input
  err:      {fontSize:11, fontWeight:'600', marginTop:5},
});

// ─── Gradient Button ──────────────────────────────────────────────────────────
// Primary CTA button with an indigo→purple gradient (dark) or pink gradient (light).
function GradientButton({label, onPress, loading, style, isDark}) {
  // Choose gradient colours based on current theme
  const colors = isDark
    ? ['#4F46E5','#7C3AED','#9B35C5']  // Indigo-purple gradient for dark mode
    : ['#E890C8','#D468A8','#C060C0']; // Pink gradient for light mode
  return (
    <TouchableOpacity
      style={[gb.touch, style, loading && {opacity:0.7}]} // Dim when loading
      onPress={onPress}
      disabled={loading}  // Prevent multiple taps during async operation
      activeOpacity={0.85}
    >
      <LinearGradient colors={colors} start={{x:0,y:0}} end={{x:1,y:0}} style={gb.grad}>
        {/* Show "Creating account..." while the signup setTimeout is running */}
        <Text style={gb.label}>{loading ? 'Creating account...' : label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}
const gb = StyleSheet.create({
  touch: {borderRadius:27, overflow:'hidden'},           // Pill shape with clipped gradient
  grad:  {height:54, alignItems:'center', justifyContent:'center'}, // Gradient fill
  label: {color:'#FFFFFF', fontSize:16, fontWeight:'700', letterSpacing:0.3}, // Button text
});

// ─── Social Button ────────────────────────────────────────────────────────────
// Semi-transparent pill button for Google and Apple sign-up options.
function SocialButton({provider, onPress}) {
  const isGoogle = provider === 'google'; // Distinguish which provider's logo/label to use
  return (
    <TouchableOpacity style={sbb.btn} onPress={onPress} activeOpacity={0.78}>
      <View style={sbb.logoWrap}>
        {/* Conditionally render Google or Apple logo */}
        {isGoogle ? <GoogleLogo size={20}/> : <AppleLogo color="#FFFFFF" size={18}/>}
      </View>
      <Text style={sbb.txt}>
        {isGoogle ? 'Sign up with Google' : 'Sign up with Apple'}
      </Text>
    </TouchableOpacity>
  );
}
const sbb = StyleSheet.create({
  btn:     {height:52, borderRadius:27, flexDirection:'row', alignItems:'center', justifyContent:'center',
            marginBottom:10, backgroundColor:'rgba(255,255,255,0.08)',
            borderWidth:1.5, borderColor:'rgba(255,255,255,0.14)'},
  logoWrap:{width:24, height:24, alignItems:'center', justifyContent:'center', marginRight:10},
  txt:     {fontSize:15, fontWeight:'600', color:'#FFFFFF', letterSpacing:0.1},
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SignUpScreen({navigation}) {
  // Pull state (for isDarkMode, registeredUsers) and dispatch from global context
  const {state, dispatch} = useApp();
  const T      = useTheme(state.isDarkMode); // Theme colour tokens
  const isDark = state.isDarkMode;           // Shorthand boolean

  // ── Form field state ────────────────────────────────────────────────────────
  const [name,    setName]    = useState(''); // Full name input value
  const [email,   setEmail]   = useState(''); // Email input value
  const [pass,    setPass]    = useState(''); // Password input value
  const [confirm, setConfirm] = useState(''); // Confirm-password input value

  // ── UI state ────────────────────────────────────────────────────────────────
  const [errors,  setErrors]  = useState({});           // Validation error messages per field
  const [loading, setLoading] = useState(false);        // True while simulating network call
  const [agreed,  setAgreed]  = useState(false);        // Whether terms checkbox is ticked
  const [sheet,   setSheet]   = useState({visible:false, provider:'google'}); // Social auth sheet

  // ── Form validation ─────────────────────────────────────────────────────────
  // Returns an object of field-keyed error strings. Empty object = all valid.
  function validate() {
    const e = {}; // Accumulate errors here

    // Name: required and at least 2 characters
    if (!name.trim())             e.name = 'Full name is required';
    else if (name.trim().length < 2) e.name = 'Name must be at least 2 characters';

    // Email: required and must match a basic email pattern
    if (!email.trim())            e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';

    // Password: required and at least 8 characters
    if (!pass)                    e.pass = 'Password is required';
    else if (pass.length < 8)     e.pass = 'Password must be at least 8 characters';

    // Confirm password: required and must match password
    if (!confirm)                 e.confirm = 'Please confirm your password';
    else if (pass !== confirm)    e.confirm = 'Passwords do not match';

    // Terms: user must tick the checkbox
    if (!agreed)                  e.agreed = 'Please accept the terms to continue';

    return e; // Return all found errors (or empty obj if none)
  }

  // ── Email / form sign-up handler ────────────────────────────────────────────
  function handleSignup() {
    // Run validation first; bail out if any errors are found
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true); // Show loading state on the button

    // Simulate a network call with a 900ms delay
    setTimeout(() => {
      setLoading(false); // Reset button

      // Check if this email is already registered on this device
      const existing = state.registeredUsers?.find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        // Show inline error — don't navigate
        setErrors({email: 'An account with this email already exists.'});
        return;
      }

      // Build the new user object
      const user = {
        name:  name.trim(),                  // Trimmed display name
        email: email.toLowerCase().trim(),   // Lowercase canonical email
        pass,                                // Plain text password (local only)
      };

      // Step 1: save the user to the device-local "database" so they can sign in later
      dispatch({type: 'REGISTER_USER', user});

      // Step 2: log the user in immediately with isNew: true
      // isNew: true → AppContext sets ZERO_BUDGETS, empty expenses/goals, 0 XP
      dispatch({type: 'LOGIN', user, isNew: true});

      // Step 3: NAVIGATE TO ONBOARDING (not Main!)
      // New users must see the onboarding slides before reaching the main app.
      // navigation.reset replaces the entire stack so the user can't go back to SignUp.
      navigation.reset({index: 0, routes: [{name: 'Onboarding'}]});
    }, 900); // 900ms simulated delay
  }

  // ── Social auth success handler ─────────────────────────────────────────────
  // Called by SocialAuthSheet after the user completes Google/Apple auth.
  function handleSocialSuccess(provider, account) {
    setSheet(p => ({...p, visible: false})); // Close the bottom sheet

    // Build user object from social provider data (or fallback defaults)
    const user = {
      name:  account?.name  || 'Social User',
      email: account?.email || `user@${provider === 'apple' ? 'icloud' : 'gmail'}.com`,
      pass:  'social_auth', // Placeholder — social users don't have a local password
    };

    // Register the social user in the local user list
    dispatch({type: 'REGISTER_USER', user});

    // Log them in as a brand-new user (zero budgets, no expenses)
    dispatch({type: 'LOGIN', user, isNew: true});

    // Send social sign-up users to Onboarding too — same as email sign-up
    navigation.reset({index: 0, routes: [{name: 'Onboarding'}]});
  }

  // ── Theme-derived colour values ─────────────────────────────────────────────
  const subtitleCol = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.82)'; // Subtitle text
  const divLineCol  = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.30)'; // Divider line
  const divTxtCol   = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.65)'; // "or sign up with email" text
  const switchCol   = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.70)'; // "Already have account?" text
  const switchHl    = isDark ? '#F97316' : '#FFFFFF';                                // "Sign in" highlight

  const termCol     = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.75)'; // Terms body text
  const termHl      = isDark ? '#A3E635' : '#FFFFFF';                                // "Terms of Service" link colour

  // Checkbox visual state — filled with primary when agreed, ghost border when not
  const checkBg = agreed
    ? (isDark ? '#A3E635' : '#6366F1')               // Ticked: lime dark / purple light
    : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.20)'); // Unticked
  const checkBd = agreed
    ? 'transparent'                                   // Ticked: no border (filled)
    : (isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.42)'); // Unticked border

  // Perks banner colours
  const perksBg   = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)'; // Banner bg
  const perksBd   = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.25)'; // Banner border
  const perkIcon  = isDark ? '#A3E635' : '#FFFFFF'; // Tick icon colour
  const perkTxt   = isDark ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.85)'; // Perk text

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ScreenWrapper isDarkMode={isDark}>
      {/* KeyboardAvoidingView shifts the screen up on iOS when keyboard opens */}
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
        {/* ScrollView lets users scroll through the form if the screen is too short */}
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Header ─────────────────────────────────────────────────────── */}
          <View style={s.header}>
            {/* Back arrow — goes to the previous screen (Splash) */}
            <TouchableOpacity style={s.backBtn} onPress={()=>navigation.goBack()} activeOpacity={0.7}>
              <Text style={[s.backTxt, {color:'rgba(255,255,255,0.65)'}]}>← Back</Text>
            </TouchableOpacity>
            <Text style={s.title}>Create Account</Text>
            <Text style={[s.subtitle, {color:subtitleCol}]}>Join SpendWise — it's free forever</Text>
          </View>

          {/* ── Social sign-up options — above the form ─────────────────────── */}
          <View style={s.socialWrap}>
            <SocialButton provider="google" onPress={()=>setSheet({visible:true, provider:'google'})}/>
            <SocialButton provider="apple"  onPress={()=>setSheet({visible:true, provider:'apple'})}/>
          </View>

          {/* ── Divider — "or sign up with email" ──────────────────────────── */}
          <View style={s.divider}>
            <View style={[s.divLine, {backgroundColor:divLineCol}]}/> {/* Left line */}
            <Text style={[s.divTxt, {color:divTxtCol}]}>or sign up with email</Text>
            <View style={[s.divLine, {backgroundColor:divLineCol}]}/> {/* Right line */}
          </View>

          {/* ── Form body ──────────────────────────────────────────────────── */}
          <View style={s.body}>

            {/* Full name field with person icon prefix */}
            <Field
              label="Full Name"
              value={name}
              isDark={isDark}
              icon={<PersonIcon/>}  // Prefix icon (colour injected by Field)
              onChangeText={v=>{setName(v); setErrors(p=>({...p, name:undefined}));}}
              error={errors.name}
              placeholder="Hamza Wahaj"
              autoCapitalize="words"
              autoCorrect={false}
            />

            {/* Email field */}
            <Field
              label="Email Address"
              value={email}
              isDark={isDark}
              onChangeText={v=>{setEmail(v); setErrors(p=>({...p, email:undefined}));}}
              error={errors.email}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password field with strength meter */}
            <PasswordField
              label="Password"
              value={pass}
              isDark={isDark}
              placeholder="Min. 8 characters"
              showStrength={true}  // Render strength bars below this field
              onChangeText={v=>{setPass(v); setErrors(p=>({...p, pass:undefined}));}}
              error={errors.pass}
            />

            {/* Confirm password field (no strength meter) */}
            <PasswordField
              label="Confirm Password"
              value={confirm}
              isDark={isDark}
              placeholder="Re-enter your password"
              onChangeText={v=>{setConfirm(v); setErrors(p=>({...p, confirm:undefined}));}}
              error={errors.confirm}
            />

            {/* ── Terms & Conditions checkbox row ────────────────────────── */}
            <TouchableOpacity
              style={s.termsRow}
              onPress={()=>{setAgreed(v=>!v); setErrors(p=>({...p, agreed:undefined}));}}
              activeOpacity={0.8}
            >
              {/* Checkbox square — filled when agreed */}
              <View style={[s.checkbox, {backgroundColor:checkBg, borderColor:checkBd}]}>
                {agreed && <Text style={s.checkmark}>✓</Text>} {/* Checkmark when ticked */}
              </View>
              {/* Terms text with hyperlink-style highlights */}
              <Text style={[s.termsTxt, {color:termCol}]}>
                I agree to the{' '}
                <Text style={[s.termsHl, {color:termHl}]}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={[s.termsHl, {color:termHl}]}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Terms error message (shown when user tries to submit without agreeing) */}
            {!!errors.agreed && (
              <Text style={[s.termsErr, {color:isDark?'#EF4444':'#FFD6E4'}]}>{errors.agreed}</Text>
            )}

            {/* ── Create Account primary button ─────────────────────────── */}
            <GradientButton
              label="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={s.submitWrap}
              isDark={isDark}
            />

            {/* ── Perks banner ("Free forever", "No credit card", etc.) ──── */}
            <View style={[s.perksRow, {backgroundColor:perksBg, borderColor:perksBd}]}>
              {[
                {icon:'✓', text:'Free forever'},    // No paid plan required
                {icon:'✓', text:'No credit card'},  // No billing info needed
                {icon:'✓', text:'50+ currencies'},  // Multi-currency support
              ].map(({icon, text}) => (
                <View key={text} style={s.perkItem}>
                  <Text style={[s.perkIcon, {color:perkIcon}]}>{icon}</Text>
                  <Text style={[s.perkTxt,  {color:perkTxt}]}>{text}</Text>
                </View>
              ))}
            </View>

            {/* ── Sign-in link for existing users ──────────────────────── */}
            <TouchableOpacity onPress={()=>navigation.navigate('SignIn')}>
              <Text style={[s.switchTxt, {color:switchCol}]}>
                Already have an account?{' '}
                <Text style={[s.switchHl, {color:switchHl}]}>Sign in</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Social Auth Bottom Sheet ──────────────────────────────────────── */}
      {/* Floats above everything else as a Modal; not inside the ScrollView */}
      <SocialAuthSheet
        visible={sheet.visible}          // Controls sheet open/close
        provider={sheet.provider}        // 'google' or 'apple'
        mode="signup"                    // Sheet knows this is sign-up context
        isDark={isDark}                  // Theme matching
        onClose={()=>setSheet(p=>({...p, visible:false}))}  // Close without signing up
        onSuccess={handleSocialSuccess}  // Called after successful OAuth flow
      />
    </ScreenWrapper>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  header:    {paddingHorizontal:24, paddingTop:48, paddingBottom:20},        // Top section padding
  backBtn:   {marginBottom:16},                                              // Back arrow spacing
  backTxt:   {fontSize:14, fontWeight:'600'},                                // Back arrow text
  title:     {fontSize:34, fontWeight:'800', color:'#FFFFFF', marginBottom:8, letterSpacing:-0.5}, // "Create Account"
  subtitle:  {fontSize:15, lineHeight:22},                                   // Subtitle under title

  socialWrap:{paddingHorizontal:24, marginBottom:8},                         // Google/Apple buttons wrapper
  divider:   {flexDirection:'row', alignItems:'center', gap:12, marginHorizontal:24, marginBottom:20}, // "or" divider row
  divLine:   {flex:1, height:1},                                             // Horizontal rule
  divTxt:    {fontSize:12, fontWeight:'500'},                                // "or sign up with email"

  body:      {paddingHorizontal:24, paddingBottom:60},                       // Form fields section

  termsRow:  {flexDirection:'row', alignItems:'flex-start', gap:12, marginBottom:8, marginTop:4}, // Checkbox + text row
  checkbox:  {width:22, height:22, borderRadius:7, borderWidth:1.5, alignItems:'center',          // Checkbox box
              justifyContent:'center', marginTop:1, flexShrink:0},
  checkmark: {fontSize:13, color:'#FFFFFF', fontWeight:'800', lineHeight:16},                     // ✓ inside checkbox
  termsTxt:  {flex:1, fontSize:13, lineHeight:20},                                                 // Terms body text
  termsHl:   {fontWeight:'700', textDecorationLine:'underline'},                                   // Linked words
  termsErr:  {fontSize:11, fontWeight:'600', marginBottom:10, marginLeft:34},                      // Error below checkbox

  submitWrap:{marginTop:16, marginBottom:16},                                // Spacing around CTA button

  perksRow:  {flexDirection:'row', justifyContent:'space-around', borderRadius:16,                 // Perks banner
              borderWidth:1, padding:14, marginBottom:22},
  perkItem:  {flexDirection:'row', alignItems:'center', gap:5},              // Individual perk item
  perkIcon:  {fontSize:12, fontWeight:'800'},                                // ✓ icon in perks
  perkTxt:   {fontSize:11, fontWeight:'600'},                                // Perk label

  switchTxt: {textAlign:'center', fontSize:14},                              // "Already have an account?"
  switchHl:  {fontWeight:'700'},                                             // "Sign in" bold link
});