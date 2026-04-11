import * as WebBrowser from "expo-web-browser";
import { useAuthRequest, ResponseType } from "expo-auth-session";

// ✅ Must be at module level — closes the browser after redirect
WebBrowser.maybeCompleteAuthSession();

// Google's OAuth discovery endpoints (hardcoded — no dynamic fetch needed)
const GOOGLE_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

// Hardcoded — makeRedirectUri({ useProxy:true }) no longer returns this in SDK 49+
const PROXY_REDIRECT_URI = "https://auth.expo.io/@carconnect02/muvcar";

const WEB_CLIENT_ID =
  "896374568035-p6g77erhvtgnf6e0erh2jf5jos0fbibm.apps.googleusercontent.com";

export const useGoogleAuth = () => {
  console.log("[GoogleAuth] redirectUri:", PROXY_REDIRECT_URI);
  console.log("[GoogleAuth] clientId:", WEB_CLIENT_ID);

  // ✅ Using base useAuthRequest — bypasses Google provider's iOS/Android
  //    platform validation that requires iosClientId / androidClientId.
  // ✅ ResponseType.Token + openid scope → Google returns id_token directly
  //    in the redirect params, no token exchange needed.
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: WEB_CLIENT_ID,
      redirectUri: PROXY_REDIRECT_URI,
      responseType: ResponseType.Token,
      scopes: ["openid", "profile", "email"],
      usePKCE: false,
    },
    GOOGLE_DISCOVERY
  );

  const signIn = () => {
    console.log("[GoogleAuth] Starting sign-in");
    return promptAsync({ showInRecents: true });
  };

  return { request, response, promptAsync: signIn };
};