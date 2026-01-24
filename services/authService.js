import api from "./api"; // your existing axios instance

export const googleAuthApi = (data) => {
  return api.post("/auth/google", data);
};
