import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import RequestsScreen from '../screens/RequestsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import BottomTabBar from '../components/navigation/BottomTabBar';

export type MainTabParamList = {
  Home: undefined;
  Requests: undefined;
  Alerts: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => (
  <Tab.Navigator
    tabBar={props => <BottomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      animation: 'fade',
      lazy: false,
      tabBarStyle: {
        position: 'absolute',
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },
    }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Requests" component={RequestsScreen} />
    <Tab.Screen name="Alerts" component={AlertsScreen} />
  </Tab.Navigator>
);

export default MainTabNavigator;
