import React from 'react';
import AppNavigator from './AppNavigator';
import { I18nProvider } from '../utils/i18n';
import { AppContextProvider } from '../context/AppContext';
import { ThemeProvider } from '../navigation/theme-context';

const App = () => (
  <I18nProvider>
    <AppContextProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AppContextProvider>
  </I18nProvider>
);

export default App;
