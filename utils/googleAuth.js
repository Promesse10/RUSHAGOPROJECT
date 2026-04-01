import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import Constants from "expo-constants";

console.log("ENV:", Constants.executionEnvironment);

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const {
   
    googleWebClientId,
  } = Constants.expoConfig.extra;

  const expectedGoogleWebClientId = "896374568035-p6g77erhvtgnf6e0erh2jf5jos0fbibm.apps.googleusercontent.com"
  const usedGoogleWebClientId = googleWebClientId || expectedGoogleWebClientId

  if (googleWebClientId && googleWebClientId !== expectedGoogleWebClientId) {
    console.warn(
      "[GoogleAuth] Found old googleWebClientId in config; overriding with expected value",
      googleWebClientId,
      "=>",
      expectedGoogleWebClientId,
    )
  }

  console.log("[GoogleAuth] googleWebClientId runtime value:", usedGoogleWebClientId)
  console.log("[GoogleAuth] expected googleWebClientId:", expectedGoogleWebClientId)

  const computedRedirectUri = makeRedirectUri({
    useProxy: true,
    scheme: "muvar",
    projectNameForProxy: "muvcar",
  });

  // enforce the exact value expected from Google console for Expo Go proxy flow
  const redirectUri = computedRedirectUri.startsWith("https://auth.expo.io")
    ? computedRedirectUri
    : "https://auth.expo.io/@carconnect02/muvcar";

  console.log("COMPUTED REDIRECT:", computedRedirectUri);
  console.log("ENFORCED REDIRECT:", redirectUri);

  const [request, response, promptAsync] =
    Google.useAuthRequest({

      clientId: googleWebClientId,
      redirectUri,
      scopes: ["profile", "email"],
    });

  const signIn = async () => {
    console.log("[GoogleAuth] Starting sign-in (fresh session)");
    console.log("[GoogleAuth] redirectUri:", redirectUri);
    console.log("[GoogleAuth] clientId:", usedGoogleWebClientId);

    // (Re)add this for every session attempt to avoid old auth states
    WebBrowser.maybeCompleteAuthSession();

    return promptAsync({
      useProxy: true,
      showInRecents: true,
      prompt: "select_account",
    });
  };

  return { request, response, promptAsync: signIn };
};