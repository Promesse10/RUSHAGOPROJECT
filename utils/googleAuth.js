import * as Google from "expo-auth-session/providers/google";

export const useGoogleAuth = () => {
  const [request, response, promptAsync] =
    Google.useIdTokenAuthRequest({
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      scopes: ["profile", "email"],
    });

  return { request, response, promptAsync };
};