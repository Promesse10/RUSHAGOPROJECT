import React from 'react';
import { Provider } from 'react-redux';
import { registerRootComponent } from 'expo';
import { store } from './redux/store'; 
import App from './App';
import 'react-native-gesture-handler';

function Main() {
  console.log('✅ Store in index.js:', store); 

  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}

registerRootComponent(Main);
