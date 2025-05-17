import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './AppNavigator';
import { I18nProvider } from '../utils/i18n';

const App = () => {
  return (
    <I18nProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </I18nProvider>
  );
};

export default App;