import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import UserProfileScreen from '../screens/UserProfileScreenClean';
import MainBottomNav from '../components/navigation/MainBottomNav';

export type MainTabParamList = {
  Home: undefined;
  Requests: undefined;
  Alerts: undefined;
  Profile: {embeddedTab?: boolean} | undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => (
  <Tab.Navigator
    tabBar={props => <MainBottomNav {...props} />}
    screenOptions={{
      headerShown: false,
      animation: 'fade',
      lazy: false,
    }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Requests" component={RequestsScreen} />
    <Tab.Screen name="Alerts" component={AlertsScreen} />
    <Tab.Screen
      name="Profile"
      component={UserProfileScreen}
      initialParams={{embeddedTab: true}}
    />
  </Tab.Navigator>
);

export default MainTabNavigator;
