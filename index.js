import React from 'react';
import { Provider } from 'react-redux';
import store from './redux/store';
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

export default function Main() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

registerRootComponent(Main);
