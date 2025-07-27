import * as SecureStore from "expo-secure-store";

export const saveAuthData = async (user, token) => {
try {
await SecureStore.setItemAsync("user", JSON.stringify(user));
await SecureStore.setItemAsync("token", token);
} catch (error) {
console.log("Failed to save auth data:", error);
}
};

export const getAuthToken = async () => {
try {
return await SecureStore.getItemAsync("token");
} catch (error) {
console.log("Failed to get token:", error);
return null;
}
};

export const getAuthUser = async () => {
try {
const userJson = await SecureStore.getItemAsync("user");
return userJson ? JSON.parse(userJson) : null;
} catch (error) {
console.log("Failed to get user:", error);
return null;
}
};

export const clearAuthData = async () => {
try {
await SecureStore.deleteItemAsync("token");
await SecureStore.deleteItemAsync("user");
} catch (error) {
console.log("Failed to clear auth data:", error);
}
};