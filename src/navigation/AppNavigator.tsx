import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import ProfileRegScreen from '../screens/ProfileRegScreen';
import LocationLanguageScreen from '../screens/LocationLanguageScreen';
import CategoryPreferenceScreen from '../screens/CategoryPreferenceScreen';
import MainTabNavigator from './MainTabNavigator';
import ReceivedRequestDetailScreen from '../screens/ReceivedRequestDetailScreen';
import SentRequestDetailScreen from '../screens/SentRequestDetailScreen';
import ConversationScreen from '../screens/ConversationScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ProfileUpdateMoreScreen from '../screens/ProfileUpdateMoreScreen';
import SearchScreen from '../screens/SearchScreen';
import MateProfileScreen from '../screens/MateProfileScreen';
import GalleryScreen from '../screens/GalleryScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}>
        
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="Otp"
          component={OtpScreen}
        />
        <Stack.Screen
            name="ProfileCreation"
            component={ProfileRegScreen}
        />
        <Stack.Screen
          name="LocationLanguage"
          component={LocationLanguageScreen}
        />
        <Stack.Screen 
          name="CategoryPreference"
          component={CategoryPreferenceScreen}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
        />
        <Stack.Screen
          name="ReceivedRequestDetail"
          component={ReceivedRequestDetailScreen}
        />
        <Stack.Screen
          name="SentRequestDetail"
          component={SentRequestDetailScreen}
        />
        <Stack.Screen
          name="Conversation"
          component={ConversationScreen}
        />
        <Stack.Screen
          name="UserProfile"
          component={UserProfileScreen}
        />
        <Stack.Screen
          name="ProfileUpdateMore"
          component={ProfileUpdateMoreScreen}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
        />
        <Stack.Screen
          name="MateProfile"
          component={MateProfileScreen}
        />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;