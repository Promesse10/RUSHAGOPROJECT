import * as WebBrowser from "expo-web-browser"
import { Linking } from "react-native"

const POLICY_URL = "https://v0-muvcar.vercel.app/"

export async function openPrivacyTerms() {
  const url = POLICY_URL
  try {
    const result = await WebBrowser.openBrowserAsync(url)

    if (result.type === "cancel") {
      // user closed the browser or action cancelled; no-op
      return result
    }

    return result
  } catch (error) {
    console.warn("[openPrivacyTerms] expo-web-browser fail", error)
    try {
      return await Linking.openURL(url)
    } catch (linkError) {
      console.error("[openPrivacyTerms] fallback Linking.openURL failed", linkError)
      throw linkError
    }
  }
}

