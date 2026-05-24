import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import DialogProvider from './src/context/DialogContext';

const App = () => {
  return (
    <DialogProvider>
      <AppNavigator />
    </DialogProvider>
  );
};

export default App;