import { getMyProfile } from "@/logic/profiles";
import { supabase } from "@/supabase/client";
import { Profile } from "@/types/profile";
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
  profile: Profile | null;
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // The user id whose profile fetch has finished (successfully or not)
  const [settledProfileUserId, setSettledProfileUserId] = useState<
    string | null
  >(null);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;

      if (error) {
        console.warn("Could not restore Supabase session:", error.message);
      }

      setSession(data.session);
      setIsLoading(false);
    });

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

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setSettledProfileUserId(null);
      return;
    }

    let cancelled = false;
    setProfile(null); // avoiding showing a previous user's profile

    getMyProfile()
      .then((loadedProfile) => {
        if (!cancelled) setProfile(loadedProfile);
      })
      .catch((error) => {
        console.warn("Could not load profile:", error);
      })
      .finally(() => {
        if (!cancelled) setSettledProfileUserId(userId);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isProfileLoading = userId !== null && settledProfileUserId !== userId;

  const authLoading = isProfileLoading || isLoading;

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
      isLoading: authLoading,
      user: session?.user ?? null,
      profile: profile ?? null,
      signInWithOTP,
      signInUsingPassword,
      verifyOTP,
      signOut,
    }),
    [session, profile, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
