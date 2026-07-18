import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {Path, Circle, Line} from 'react-native-svg';
import ScreenWrapper from '../utils/ScreenWrapper';
import {useApp} from '../context/AppContext';
import {useTheme} from '../utils/theme';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const BackArrow = ({color}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 5L5 12L12 19" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const UserIcon = ({color, size=18}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={1.8}/>
  </Svg>
);

const MailIcon = ({color, size=18}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Path d="M22 6l-10 7L2 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PhoneIcon = ({color, size=18}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const LocationIcon = ({color, size=18}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth={1.8}/>
  </Svg>
);

const BriefcaseIcon = ({color, size=18}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Svg viewBox="0 0 24 24">
      <Path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
        stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
      <Path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"
        stroke={color} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  </Svg>
);

const CameraIcon = ({color, size=22}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
      stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth={1.8}/>
  </Svg>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function EditProfileScreen({navigation, route}) {
  const {state, dispatch} = useApp();
  const T      = useTheme(state.isDarkMode);
  const isDark = state.isDarkMode;

  const [name,     setName]     = useState(state.user?.name     || '');
  const [email,    setEmail]    = useState(state.user?.email    || '');
  const [phone,    setPhone]    = useState(state.user?.phone    || '');
  const [location, setLocation] = useState(state.user?.location || '');
  const [bio,      setBio]      = useState(state.user?.bio      || '');
  const [focused,  setFocused]  = useState('');

  const inputBg   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.70)';
  const inputBd   = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const focusBd   = isDark ? 'rgba(163,230,53,0.65)'  : 'rgba(109,40,217,0.65)';
  const labelCol  = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const textCol   = isDark ? '#F1F5F9'                : '#1A1412';
  const mutedCol  = isDark ? '#64748B'                : '#7A6055';

  function handleSave() {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter your full name.'); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.'); return;
    }
    // Update user in state
    const updatedUser = {
      ...state.user, name: name.trim(), email: email.trim(),
      phone: phone.trim(), location: location.trim(), bio: bio.trim(),
    };
    dispatch({type:'LOGIN', user: updatedUser, isNew: false});
    Alert.alert('Profile Updated', 'Your information has been saved successfully.', [
      {text:'OK', onPress:()=>navigation.goBack()},
    ]);
  }

  return (
    <ScreenWrapper isDarkMode={isDark}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={[s.backBtn, {backgroundColor:T.card,borderColor:T.isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.10)'}]}
          onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <BackArrow color={T.text} />
        </TouchableOpacity>
        <Text style={[s.title, {color:T.text}]}>Edit Profile</Text>
        <View style={{width:38}} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{flex:1}}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:40}}
          keyboardShouldPersistTaps="handled">

          {/* Avatar section */}
          <View style={s.avatarSection}>
            <View style={[s.avatarWrap, {backgroundColor:T.primary}]}>
              <Text style={[s.avatarTxt, {color:isDark?'#0a0f00':'#FFFFFF'}]}>
                {name.slice(0,2).toUpperCase() || 'SW'}
              </Text>
              {/* Camera overlay */}
              <TouchableOpacity style={[s.cameraBtn, {backgroundColor:isDark?'#0F0F18':'#FBF8F4'}]}
                onPress={() => Alert.alert('Change Photo', 'Photo upload available in production version with expo-image-picker.')}
                activeOpacity={0.85}>
                <CameraIcon color={isDark?'#A3E635':'#6366F1'} size={18} />
              </TouchableOpacity>
            </View>
            <Text style={[s.avatarHint, {color:mutedCol}]}>Tap camera to change photo</Text>
          </View>

          {/* Form fields */}
          <View style={s.form}>

            {/* Full Name */}
            <Text style={[s.label, {color:labelCol}]}>FULL NAME *</Text>
            <View style={[s.inputRow, {
              backgroundColor:inputBg,
              borderColor: focused==='name' ? focusBd : inputBd,
            }]}>
              <UserIcon color={focused==='name' ? T.primary : mutedCol} size={18}/>
              <TextInput
                style={[s.input, {color:textCol}]}
                value={name} onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={mutedCol}
                onFocus={()=>setFocused('name')} onBlur={()=>setFocused('')}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <Text style={[s.label, {color:labelCol}]}>EMAIL ADDRESS</Text>
            <View style={[s.inputRow, {
              backgroundColor:inputBg,
              borderColor: focused==='email' ? focusBd : inputBd,
            }]}>
              <MailIcon color={focused==='email' ? T.primary : mutedCol} size={18}/>
              <TextInput
                style={[s.input, {color:textCol}]}
                value={email} onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={mutedCol}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={()=>setFocused('email')} onBlur={()=>setFocused('')}
              />
            </View>

            {/* Phone */}
            <Text style={[s.label, {color:labelCol}]}>PHONE NUMBER</Text>
            <View style={[s.inputRow, {
              backgroundColor:inputBg,
              borderColor: focused==='phone' ? focusBd : inputBd,
            }]}>
              <PhoneIcon color={focused==='phone' ? T.primary : mutedCol} size={18}/>
              <TextInput
                style={[s.input, {color:textCol}]}
                value={phone} onChangeText={setPhone}
                placeholder="+92 300 0000000"
                placeholderTextColor={mutedCol}
                keyboardType="phone-pad"
                onFocus={()=>setFocused('phone')} onBlur={()=>setFocused('')}
              />
            </View>

            {/* Location */}
            <Text style={[s.label, {color:labelCol}]}>CITY / LOCATION</Text>
            <View style={[s.inputRow, {
              backgroundColor:inputBg,
              borderColor: focused==='location' ? focusBd : inputBd,
            }]}>
              <LocationIcon color={focused==='location' ? T.primary : mutedCol} size={18}/>
              <TextInput
                style={[s.input, {color:textCol}]}
                value={location} onChangeText={setLocation}
                placeholder="Peshawar, Pakistan"
                placeholderTextColor={mutedCol}
                onFocus={()=>setFocused('location')} onBlur={()=>setFocused('')}
              />
            </View>

            {/* Bio */}
            <Text style={[s.label, {color:labelCol}]}>SHORT BIO</Text>
            <View style={[s.inputRow, s.bioRow, {
              backgroundColor:inputBg,
              borderColor: focused==='bio' ? focusBd : inputBd,
              alignItems:'flex-start', paddingTop:12,
            }]}>
              <TextInput
                style={[s.input, {color:textCol, height:80}]}
                value={bio} onChangeText={setBio}
                placeholder="Tell us a bit about yourself..."
                placeholderTextColor={mutedCol}
                multiline numberOfLines={3}
                onFocus={()=>setFocused('bio')} onBlur={()=>setFocused('')}
              />
            </View>

            {/* Info row */}
            <View style={[s.infoBox, {backgroundColor:isDark?'rgba(163,230,53,0.06)':'rgba(99,102,241,0.06)',borderColor:isDark?'rgba(163,230,53,0.18)':'rgba(99,102,241,0.18)'}]}>
              <Text style={{fontSize:12,color:isDark?'rgba(163,230,53,0.80)':'#6366F1',lineHeight:18}}>
                Your personal information is stored securely on your device and never shared with third parties.
              </Text>
            </View>

            {/* Save button — pink gradient pill */}
            <TouchableOpacity style={{borderRadius:27,overflow:'hidden',marginBottom:12}} onPress={handleSave}>
              {isDark ? (
                <View style={{height:54,backgroundColor:T.primary,alignItems:'center',justifyContent:'center',borderRadius:27}}>
                  <Text style={{color:'#0A0F00',fontSize:16,fontWeight:'800'}}>Save Changes</Text>
                </View>
              ):(
                <LinearGradient colors={['#E890C8','#D468A8','#C060C0']}
                  start={{x:0,y:0}} end={{x:1,y:0}}
                  style={{height:54,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{color:'#FFFFFF',fontSize:16,fontWeight:'800'}}>Save Changes</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              style={{height:50,borderRadius:27,borderWidth:1.5,borderColor:isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.12)',alignItems:'center',justifyContent:'center'}}
              onPress={() => navigation.goBack()} activeOpacity={0.75}>
              <Text style={{fontSize:15,fontWeight:'700',color:mutedCol}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const s = StyleSheet.create({
  header:      {flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:8,paddingBottom:12},
  backBtn:     {width:38,height:38,borderRadius:12,borderWidth:1,alignItems:'center',justifyContent:'center'},
  title:       {fontSize:18,fontWeight:'800',letterSpacing:-0.3},
  avatarSection:{alignItems:'center',paddingVertical:20},
  avatarWrap:  {width:88,height:88,borderRadius:44,alignItems:'center',justifyContent:'center',marginBottom:10,position:'relative'},
  avatarTxt:   {fontSize:30,fontWeight:'800'},
  cameraBtn:   {position:'absolute',bottom:-2,right:-2,width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'rgba(128,128,128,0.20)'},
  avatarHint:  {fontSize:12,fontWeight:'500'},
  form:        {paddingHorizontal:20},
  label:       {fontSize:10,fontWeight:'800',letterSpacing:1.2,textTransform:'uppercase',marginBottom:8},
  inputRow:    {flexDirection:'row',alignItems:'center',height:54,borderRadius:27,borderWidth:1.5,paddingHorizontal:18,gap:12,marginBottom:16},
  bioRow:      {height:'auto',borderRadius:16},
  input:       {flex:1,fontSize:15,height:'100%'},
  infoBox:     {borderRadius:14,borderWidth:1,padding:12,marginBottom:20},
});
