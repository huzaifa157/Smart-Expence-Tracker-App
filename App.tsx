import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppProvider} from './src/context/AppContext';

import SplashScreen         from './src/screens/SplashScreen';
import SignUpScreen         from './src/screens/SignUpScreen';
import SignInScreen         from './src/screens/SignInScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import OnboardingScreen     from './src/screens/OnboardingScreen';
import MainTabs             from './src/screens/MainTabs';
import GoalsScreen          from './src/screens/GoalsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                // Transparent card background so each screen's
                // gradient fills the full display including nav areas
                cardStyle: {backgroundColor: 'transparent'},
              }}>
              <Stack.Screen name="Splash"          component={SplashScreen} />
              <Stack.Screen name="SignUp"          component={SignUpScreen} />
              <Stack.Screen name="SignIn"          component={SignInScreen} />
              <Stack.Screen name="ForgotPassword"  component={ForgotPasswordScreen} />
              <Stack.Screen name="Onboarding"      component={OnboardingScreen} />
              <Stack.Screen name="Main"            component={MainTabs} />
            </Stack.Navigator>
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
