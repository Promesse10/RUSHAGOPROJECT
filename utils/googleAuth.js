import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const {
    googleAndroidClientId,
    googleIosClientId,
  } = Constants.expoConfig.extra;

 const [request, response, promptAsync] =
  Google.useIdTokenAuthRequest({
    androidClientId: googleAndroidClientId,
    iosClientId: googleIosClientId,
    scopes: ["profile", "email"],
  });


  return { request, response, promptAsync };
};
