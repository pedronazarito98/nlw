import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";
import { AuthContextData, AuthProviderData, AuthResponse, User } from "./type";

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderData) {
  const [user, setUser] = useState<User | null>(null);

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=eb64eeee8c511ca180f9`;

  async function signIn(githubCode: string) {
    const response = await api.post<AuthResponse>("authenticate", {
      code: githubCode,
    });

    const { token, user } = response.data;
    console.log(token);
    

    localStorage.setItem("@doWhile:token", token);
    api.defaults.headers.common.authotization = ` Bearer ${token}`;
    setUser(user);
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("@doWhile:token");
  }

  useEffect(() => {
    const token = localStorage.getItem("@doWhile:token");

    if (token) {
      api.defaults.headers.common.authotization = ` Bearer ${token}`;

      api.get<User>("profile").then((response) => {
        setUser(response.data);
      });
    }
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split("?code=");

      window.history.pushState({}, "", urlWithoutCode);

      signIn(githubCode);
    }
  }, []);
  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
