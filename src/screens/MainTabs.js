import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator }     from '@react-navigation/stack';
import Svg, { Path, Circle, Rect, Line, Polyline, G } from 'react-native-svg';
import { useApp }   from '../context/AppContext';
import { useTheme } from '../utils/theme';

import DashboardScreen    from './DashboardScreen';
import AnalyticsScreen    from './AnalyticsScreen';
import TransactionsScreen from './TransactionsScreen';
import GoalsScreen        from './GoalsScreen';
import ProfileScreen      from './ProfileScreen';

import GamificationScreen        from './GamificationScreen';
import SpendingPersonalityScreen from './SpendingPersonalityScreen';
import EditProfileScreen         from '../screens/EditProfileScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Professional SVG Tab Icons ───────────────────────────────────────────────
const IcoDashboard = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="7" height="8" rx="2" stroke={color} strokeWidth="1.8"/>
    <Rect x="14" y="3" width="7" height="5" rx="2" stroke={color} strokeWidth="1.8"/>
    <Rect x="14" y="12" width="7" height="9" rx="2" stroke={color} strokeWidth="1.8"/>
    <Rect x="3" y="15" width="7" height="6" rx="2" stroke={color} strokeWidth="1.8"/>
  </Svg>
);

const IcoAnalytics = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline points="22 12 18 12 15 21 9 3 6 12 2 12"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const IcoExpenses = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth="1.8"/>
    <Path d="M2 10h20" stroke={color} strokeWidth="1.8"/>
    <Path d="M6 15h4M16 15h2" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </Svg>
);

const IcoGoals = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8"/>
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.8"/>
    <Circle cx="12" cy="12" r="1.8" fill={color}/>
  </Svg>
);

const IcoProfile = ({ color, size = 22 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.8"/>
  </Svg>
);

const TAB_ICONS = [IcoDashboard, IcoAnalytics, IcoExpenses, IcoGoals, IcoProfile];
const TAB_LABELS = ['Dashboard', 'Analytics', 'Expenses', 'Goals', 'Profile'];
const TAB_NAMES  = ['Dashboard', 'Analytics', 'Transactions', 'Goals', 'Profile'];

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function MyTabBar({ state, navigation }) {
  const { state: appState } = useApp();
  const T      = useTheme(appState.isDarkMode);
  const isDark = appState.isDarkMode;

  // Light: exact bottom color of LIGHT.bgGrad ['#A8BCEA'...'#F0A8BC']
  // Dark:  DARK.bg solid — matches dark screen background exactly
  const tabBg      = isDark ? '#080C14' : '#F0A8BC';
  const borderCol  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.30)';
  const activeCol  = isDark ? '#A3E635' : '#3B0764';
  const inactiveCol= isDark ? 'rgba(255,255,255,0.38)' : 'rgba(59,7,100,0.40)';
  const pillBg     = isDark ? 'rgba(163,230,53,0.12)'  : 'rgba(109,40,217,0.15)';

  return (
    <View style={[styles.tabBar, { backgroundColor: tabBg, borderTopColor: borderCol }]}>
      {state.routes.map((route, index) => {
        const focused  = state.index === index;
        const IcoComp  = TAB_ICONS[index];
        const color    = focused ? activeCol : inactiveCol;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}>
            <View style={[styles.iconWrap, focused && { backgroundColor: pillBg }]}>
              <IcoComp color={color} size={20}/>
            </View>
            <Text style={[styles.label, { color, fontWeight: focused ? '700' : '500' }]}>
              {TAB_LABELS[index]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <MyTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard"    component={DashboardScreen} />
      <Tab.Screen name="Analytics"    component={AnalyticsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Goals"        component={GoalsScreen} />
      <Tab.Screen name="Profile"      component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs"                component={TabNavigator} />
      <Stack.Screen name="Gamification"        component={GamificationScreen} />
      <Stack.Screen name="SpendingPersonality" component={SpendingPersonalityScreen} />
      <Stack.Screen name="EditProfile"         component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar:  { flexDirection:'row', height:68, borderTopWidth:1,
             paddingTop:6, paddingBottom:8, paddingHorizontal:4 },
  tabItem: { flex:1, alignItems:'center', justifyContent:'center', gap:3 },
  iconWrap:{ width:34, height:30, borderRadius:10, alignItems:'center', justifyContent:'center' },
  label:   { fontSize:10, letterSpacing:0.1 },
});