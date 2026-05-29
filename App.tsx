import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import DialogProvider from './src/context/DialogContext';
import {ThemeProvider} from './src/context/ThemeContext';

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemeProvider>
        <DialogProvider>
          <AppNavigator />
        </DialogProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default App;
