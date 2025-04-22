import { useContext, createContext, type PropsWithChildren } from "react";
import { useStorageState } from "./hooks/useStorageState";

const AuthContext = createContext<{
  signIn: (access_token: string) => boolean;
  storeRefreshToken: (refresh_token: string) => boolean;
  signOut: () => void;
  refreshSession: () => Promise<boolean>;
  storeUsername: (username: string) => boolean;
  getUsername: () => string | null;
  session?: string | null;
  isLoading: boolean;
  refresh?: string | null;
  username?: string | null;
}>({
  signIn: () => false,
  storeRefreshToken: () => false,
  signOut: () => null,
  refreshSession: () => Promise.resolve(false),
  storeUsername: () => false,
  getUsername: () => null,
  session: null,
  isLoading: false,
  refresh: null,
  username: null,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");
  const [refresh, setRefresh] = useStorageState("refresh");
  const [[, username], setUsername] = useStorageState("username");

  return (
    <AuthContext.Provider
      value={{
        signIn: (access_token: string) => {
          if (access_token != null) {
            setSession(access_token);
            return true;
          }
          return false;
        },
        signOut: () => {
          setSession(null);
          setRefresh(null);
          setUsername(null);
        },
        storeRefreshToken: (refresh_token: string) => {
          if (refresh_token != null) {
            setRefresh(refresh_token);
            return true;
          }
          return false;
        },
        storeUsername: (username: string) => {
          if (username != null) {
            setUsername(username);
            return true;
          }
          return false;
        },
        getUsername: () => {
          return username ?? null;
        },
        refreshSession: async () => {
          try {
            const response = await fetch("http://127.0.0.1:5000/refresh", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refresh}`, // Use stored refresh token
              },
            });

            if (response.ok) {
              const json = await response.json();
              setSession(json.access_token);
              setRefresh(json.refresh_token);
              return true;
            } else {
              console.error("Failed to refresh token");
              return false;
            }
          } catch (error) {
            console.error("Error refreshing token:", error);
            return false;
          }
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
