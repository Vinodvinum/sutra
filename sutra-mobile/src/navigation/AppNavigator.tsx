import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import { colors } from '../constants/colors';
import { CINZEL, useSutraFonts } from '../constants/fonts';
import { useAuthContext } from '../context/AuthContext';
import BaselineWeekScreen from '../screens/BaselineWeekScreen';
import BrahmaScreen from '../screens/BrahmaScreen';
import CirclesScreen from '../screens/CirclesScreen';
import FinanceScreen from '../screens/FinanceScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import GoalsSetupScreen from '../screens/GoalsSetupScreen';
import HomeScreen from '../screens/HomeScreen';
import IdentityScreen from '../screens/IdentityScreen';
import IntelligenceScreen from '../screens/IntelligenceScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

export type RootStackParamList = {
  SplashScreen: undefined;
  AuthStack: undefined;
  OnboardingStack: undefined;
  MainTabs: undefined;
};

export type AuthStackParamList = {
  WelcomeScreen: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
  ForgotPasswordScreen: undefined;
};

export type OnboardingStackParamList = {
  GoalsSetupScreen: undefined;
  BaselineWeekScreen: undefined;
};

export type MainTabsParamList = {
  Home: undefined;
  Circles: undefined;
  Intel: undefined;
  Brahma: undefined;
  Finance: undefined;
  Identity: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const OnboardingStack = createStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

const TAB_SYMBOLS: Record<keyof MainTabsParamList, string> = {
  Home: '⊙',
  Circles: '◎',
  Intel: '◈',
  Brahma: '✦',
  Finance: '◇',
  Identity: '◉',
};

const TAB_LABELS: Record<keyof MainTabsParamList, string> = {
  Home: 'HOME',
  Circles: 'CIRCLE',
  Intel: 'INTEL',
  Brahma: 'BRAHMA',
  Finance: 'FINANCE',
  Identity: 'SELF',
};

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <AuthStack.Screen name="LoginScreen" component={LoginScreen} />
      <AuthStack.Screen name="SignupScreen" component={SignupScreen} />
      <AuthStack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingStackNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="GoalsSetupScreen" component={GoalsSetupScreen} />
      <OnboardingStack.Screen name="BaselineWeekScreen" component={BaselineWeekScreen} />
    </OnboardingStack.Navigator>
  );
}

function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.white3,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarActiveBackgroundColor: colors.golddim,
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>{TAB_SYMBOLS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: TAB_LABELS.Home }} />
      <Tab.Screen
        name="Circles"
        component={CirclesScreen}
        options={{ tabBarLabel: TAB_LABELS.Circles }}
      />
      <Tab.Screen
        name="Intel"
        component={IntelligenceScreen}
        options={{ tabBarLabel: TAB_LABELS.Intel }}
      />
      <Tab.Screen
        name="Brahma"
        component={BrahmaScreen}
        options={{ tabBarLabel: TAB_LABELS.Brahma }}
      />
      <Tab.Screen
        name="Finance"
        component={FinanceScreen}
        options={{ tabBarLabel: TAB_LABELS.Finance }}
      />
      <Tab.Screen
        name="Identity"
        component={IdentityScreen}
        options={{ tabBarLabel: TAB_LABELS.Identity }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [fontsLoaded] = useSutraFonts();
  const { user, profile, loading } = useAuthContext();

  const onboardingComplete = Boolean(profile?.onboardingComplete);
  const isLoading = loading || !fontsLoaded;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isLoading ? (
          <RootStack.Screen name="SplashScreen" component={SplashScreen} />
        ) : !user ? (
          <RootStack.Screen name="AuthStack" component={AuthStackNavigator} />
        ) : !onboardingComplete ? (
          <RootStack.Screen name="OnboardingStack" component={OnboardingStackNavigator} />
        ) : (
          <RootStack.Screen name="MainTabs" component={MainTabsNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(5,6,10,0.95)',
    borderTopColor: 'rgba(255,220,130,0.07)',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 16,
  },
  tabLabel: {
    fontFamily: CINZEL,
    fontSize: 8,
    letterSpacing: 2,
  },
  tabItem: {
    borderRadius: 12,
    marginHorizontal: 2,
    marginVertical: 6,
  },
  tabIcon: {
    fontSize: 20,
  },
});
