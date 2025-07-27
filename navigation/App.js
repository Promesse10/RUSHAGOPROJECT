import React, { useEffect } from "react";
import AppNavigator from "./AppNavigator";
import { I18nProvider } from "../utils/i18n";
import { AppContextProvider } from "../context/AppContext";
import { ThemeProvider } from "../navigation/theme-context";
import { Provider, useDispatch } from "react-redux";
import store from "../redux/store";
import { loadAuthFromStorage } from "../redux/action/LoginActions";

const Startup = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadAuthFromStorage());
  }, []);

  return (
    <I18nProvider>
      <AppContextProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </AppContextProvider>
    </I18nProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <Startup />
  </Provider>
);

export default App;
