// ForgotPasswordScreen.js
import React, {useState, useRef, useEffect} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {useApp} from '../context/AppContext';
import {useTheme} from '../utils/theme';
import {GradientBackground} from '../utils/ThemeComponents';

export default function ForgotPasswordScreen({navigation}) {
  const {state} = useApp();
  const T       = useTheme(state.isDarkMode);
  const isDark  = state.isDarkMode;

  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  // ── Entrance animation ────────────────────────────────────────────────────
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  {toValue:1, duration:500, useNativeDriver:true}),
      Animated.timing(slideAnim, {toValue:0, duration:460, useNativeDriver:true}),
    ]).start();
  }, []);

  // ── Success animation ─────────────────────────────────────────────────────
  const successFade  = useRef(new Animated.Value(0)).current;
  const successSlide = useRef(new Animated.Value(20)).current;
  const showSuccess = () => {
    setSent(true);
    Animated.parallel([
      Animated.timing(successFade,  {toValue:1, duration:400, useNativeDriver:true}),
      Animated.timing(successSlide, {toValue:0, duration:380, useNativeDriver:true}),
    ]).start();
  };

  const validate = () => {
    if (!email.trim())                              { setError('Email address is required'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return false; }
    return true;
  };

  const handleSend = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); showSuccess(); }, 1200);
  };

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const headCol     = isDark ? '#F1F5F9'                 : '#FFFFFF';
  const subCol      = isDark ? 'rgba(255,255,255,0.50)'  : 'rgba(255,255,255,0.80)';
  const labelCol    = isDark ? 'rgba(255,255,255,0.48)'  : 'rgba(255,255,255,0.76)';
  const inputBg     = isDark ? 'rgba(255,255,255,0.06)'  : 'rgba(255,255,255,0.22)';
  const inputBd     = isDark ? 'rgba(255,255,255,0.12)'  : 'rgba(255,255,255,0.52)';
  const inputFocBg  = isDark ? 'rgba(99,102,241,0.08)'  : 'rgba(255,255,255,0.34)';
  const inputFocBd  = isDark ? 'rgba(99,102,241,0.70)'  : 'rgba(255,255,255,0.95)';
  const placeholderC= isDark ? 'rgba(255,255,255,0.28)'  : 'rgba(255,255,255,0.52)';
  const inputTxt    = '#FFFFFF';
  const errCol      = isDark ? '#FCA5A5'                 : '#FFD6E4';
  const backLinkCol = isDark ? 'rgba(255,255,255,0.42)'  : 'rgba(255,255,255,0.68)';
  const divCol      = isDark ? 'rgba(255,255,255,0.08)'  : 'rgba(255,255,255,0.25)';
  const emailHlCol  = isDark ? '#818CF8'                 : '#FFFFFF';
  const resendBg    = isDark ? 'rgba(255,255,255,0.05)'  : 'rgba(255,255,255,0.18)';
  const resendBd    = isDark ? 'rgba(255,255,255,0.10)'  : 'rgba(255,255,255,0.45)';
  const ctaColors   = isDark
    ? ['#4F46E5','#7C3AED','#9B35C5']
    : ['#E890C8','#D468A8','#C860C0'];

  return (
    <GradientBackground isDarkMode={isDark}>
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{flex:1}}>

          <Animated.View style={[s.content, {
            opacity:   fadeAnim,
            transform: [{translateY: slideAnim}],
          }]}>

            {/* ── FORM STATE ── */}
            {!sent ? (
              <>
                {/* Step indicator */}
                <View style={s.stepRow}>
                  <View style={[s.stepDot, {backgroundColor: isDark ? '#6366F1' : '#FFFFFF'}]}/>
                  <View style={[s.stepLine, {backgroundColor: divCol}]}/>
                  <View style={[s.stepDot, {backgroundColor: divCol}]}/>
                </View>

                {/* Heading */}
                <Text style={[s.eyebrow, {color: isDark ? '#818CF8' : 'rgba(255,255,255,0.75)'}]}>
                  ACCOUNT RECOVERY
                </Text>
                <Text style={[s.title, {color: headCol}]}>Forgot your{'\n'}password?</Text>
                <Text style={[s.subtitle, {color: subCol}]}>
                  Enter the email address linked to your SpendWise account and we'll send you a secure reset link.
                </Text>

                {/* Divider */}
                <View style={[s.divider, {backgroundColor: divCol}]}/>

                {/* Email input */}
                <Text style={[s.label, {color: labelCol}]}>EMAIL ADDRESS</Text>
                <View style={[s.inputWrap, {
                  backgroundColor: focused ? inputFocBg : inputBg,
                  borderColor:     error   ? errCol     : focused ? inputFocBd : inputBd,
                }]}>
                  <TextInput
                    style={[s.input, {color: inputTxt}]}
                    value={email}
                    onChangeText={v => {setEmail(v); setError('');}}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="you@example.com"
                    placeholderTextColor={placeholderC}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus/>
                </View>
                {!!error && (
                  <Text style={[s.errTxt, {color: errCol}]}>{error}</Text>
                )}

                {/* Security note */}
                <Text style={[s.secNote, {color: subCol}]}>
                  🔒  Link expires in 15 minutes · One-time use only
                </Text>

                {/* CTA */}
                <TouchableOpacity
                  style={[s.ctaWrap, loading && {opacity:0.72}]}
                  onPress={handleSend}
                  disabled={loading}
                  activeOpacity={0.85}>
                  <LinearGradient
                    colors={ctaColors}
                    start={{x:0,y:0}} end={{x:1,y:0}}
                    style={s.ctaGrad}>
                    <Text style={s.ctaTxt}>
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                  <Text style={[s.backLink, {color: backLinkCol}]}>← Back to Sign In</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ── SUCCESS STATE ── */
              <Animated.View style={[s.successWrap, {
                opacity:   successFade,
                transform: [{translateY: successSlide}],
              }]}>
                {/* Step indicator — completed */}
                <View style={s.stepRow}>
                  <View style={[s.stepDot, {backgroundColor: isDark ? '#A3E635' : '#FFFFFF'}]}/>
                  <View style={[s.stepLineActive, {
                    backgroundColor: isDark ? '#A3E635' : 'rgba(255,255,255,0.70)',
                  }]}/>
                  <View style={[s.stepDot, {backgroundColor: isDark ? '#A3E635' : '#FFFFFF'}]}/>
                </View>

                {/* Sent badge */}
                <View style={[s.sentBadge, {
                  backgroundColor: isDark ? 'rgba(163,230,53,0.10)' : 'rgba(255,255,255,0.18)',
                  borderColor:     isDark ? 'rgba(163,230,53,0.30)' : 'rgba(255,255,255,0.45)',
                }]}>
                  <Text style={[s.sentBadgeTxt, {color: isDark ? '#A3E635' : '#FFFFFF'}]}>
                    EMAIL SENT
                  </Text>
                </View>

                <Text style={[s.title, {color: headCol}]}>Check your{'\n'}inbox</Text>
                <Text style={[s.subtitle, {color: subCol}]}>
                  We sent a password reset link to:
                </Text>

                {/* Email highlight card */}
                <View style={[s.emailCard, {
                  backgroundColor: isDark ? 'rgba(129,140,248,0.10)' : 'rgba(255,255,255,0.16)',
                  borderColor:     isDark ? 'rgba(129,140,248,0.28)' : 'rgba(255,255,255,0.40)',
                }]}>
                  <Text style={[s.emailHl, {color: emailHlCol}]}>{email}</Text>
                </View>

                <Text style={[s.subtitle, {color: subCol, marginTop:12}]}>
                  Click the link in the email to set a new password. If you don't see it, check your spam or junk folder.
                </Text>

                <View style={[s.divider, {backgroundColor: divCol, marginVertical:20}]}/>

                {/* Resend */}
                <TouchableOpacity
                  style={[s.resendBtn, {backgroundColor:resendBg, borderColor:resendBd}]}
                  onPress={() => {setSent(false); setEmail('');}}
                  activeOpacity={0.75}>
                  <Text style={[s.resendTxt, {color: headCol}]}>Didn't receive it? Try again</Text>
                </TouchableOpacity>

                {/* Back to sign in */}
                <TouchableOpacity
                  style={[s.ctaWrap, {marginTop:10}]}
                  onPress={() => navigation.navigate('SignIn')}
                  activeOpacity={0.85}>
                  <LinearGradient
                    colors={ctaColors}
                    start={{x:0,y:0}} end={{x:1,y:0}}
                    style={s.ctaGrad}>
                    <Text style={s.ctaTxt}>Back to Sign In</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const s = StyleSheet.create({
  safe:     {flex:1},

  content:  {flex:1, paddingHorizontal:24, paddingTop:12},

  // Step indicator
  stepRow:      {flexDirection:'row', alignItems:'center', gap:8, marginBottom:20},
  stepDot:      {width:8, height:8, borderRadius:4},
  stepLine:     {flex:1, height:2, borderRadius:1},
  stepLineActive:{flex:1, height:2, borderRadius:1},

  // Typography
  eyebrow:  {fontSize:10, fontWeight:'800', letterSpacing:1.5, marginBottom:10},
  title:    {fontSize:32, fontWeight:'800', letterSpacing:-0.5, lineHeight:40, marginBottom:12},
  subtitle: {fontSize:14, lineHeight:22, marginBottom:8},

  divider:  {height:1, borderRadius:1, marginBottom:22},

  label:    {fontSize:10, fontWeight:'800', letterSpacing:1.2, textTransform:'uppercase', marginBottom:10},

  inputWrap:{
    height:54, borderRadius:27, borderWidth:1.5,
    paddingHorizontal:20, marginBottom:8,
    justifyContent:'center',
  },
  input:    {fontSize:15, height:'100%'},

  errTxt:   {fontSize:12, fontWeight:'600', marginBottom:10, marginLeft:4},

  secNote:  {fontSize:11, fontWeight:'500', marginBottom:22, marginLeft:2},

  ctaWrap:  {borderRadius:27, overflow:'hidden', marginBottom:14},
  ctaGrad:  {height:54, alignItems:'center', justifyContent:'center'},
  ctaTxt:   {fontSize:16, fontWeight:'700', color:'#FFFFFF', letterSpacing:0.3},

  backLink: {textAlign:'center', fontSize:13, fontWeight:'600'},

  // Success
  successWrap:{},
  sentBadge:  {
    alignSelf:'flex-start', borderRadius:100, borderWidth:1,
    paddingVertical:5, paddingHorizontal:14, marginBottom:16,
  },
  sentBadgeTxt:{fontSize:10, fontWeight:'800', letterSpacing:1.4},

  emailCard:{
    borderRadius:14, borderWidth:1,
    paddingVertical:14, paddingHorizontal:18,
    alignItems:'center', marginBottom:4,
  },
  emailHl:  {fontSize:15, fontWeight:'700'},

  resendBtn:{
    height:50, borderRadius:14, borderWidth:1.5,
    alignItems:'center', justifyContent:'center',
    marginBottom:4,
  },
  resendTxt:{fontSize:14, fontWeight:'600'},
});