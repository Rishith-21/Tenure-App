import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import MainBottomNav from '../components/navigation/MainBottomNav';

export type MainTabParamList = {
  Home: undefined;
  Requests: undefined;
  Alerts: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => (
  <Tab.Navigator
    tabBar={props => <MainBottomNav {...props} />}
    screenOptions={{
      headerShown: false,
    }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Requests" component={RequestsScreen} />
    <Tab.Screen name="Alerts" component={AlertsScreen} />
  </Tab.Navigator>
);

export default MainTabNavigator;
