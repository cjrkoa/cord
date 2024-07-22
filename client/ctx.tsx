import { useContext, createContext, type PropsWithChildren } from "react";
import { useStorageState } from "./hooks/useStorageState";

const AuthContext = createContext<{
  signIn: (access_token: string) => boolean;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => false,
  signOut: () => null,
  session: null,
  isLoading: false,
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
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
