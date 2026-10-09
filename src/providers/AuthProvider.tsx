import { supabase } from "@/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  user: User | null;
  signInWithOTP: (email: string) => Promise<void>;
  signInUsingPassword: (email: string, password: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useSession(): AuthContextValue {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useSession must be used within a <SessionProvider />");
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.warn("Could not restore Supabase session:", error.message);
      }

      if (isMounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    }

    restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signInWithOTP(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function signInUsingPassword(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async function verifyOTP(email: string, code: string) {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: code.trim(),
      type: "email",
    });

    if (error) {
      throw new Error(error.message);
    }

    // `onAuthStateChange` updates `session` after successful verification.
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    // `onAuthStateChange` updates `session` to null.
  }

  const value = useMemo(
    () => ({
      session,
      isLoading,
      user: session?.user ?? null,
      signInWithOTP,
      signInUsingPassword,
      verifyOTP,
      signOut,
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
