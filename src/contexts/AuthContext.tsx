import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, Child } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  children: Child[];
  hasChildren: boolean;
  refreshChildren: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children: reactChildren }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [childProfiles, setChildProfiles] = useState<Child[]>([]);

  const fetchChildren = async (userId: string) => {
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("profile_id", userId);
    if (!error) {
      setChildProfiles(data ?? []);
    }
  };

  const refreshChildren = async () => {
    if (user) await fetchChildren(user.id);
  };

  useEffect(() => {
    let done = false;

    const handleSession = async (session: Session | null) => {
      if (done) return;
      done = true; // set immediately to prevent race condition
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          await fetchChildren(session.user.id);
        } catch {}
      } else {
        setChildProfiles([]);
      }
      setLoading(false);
    };

    // Set up auth state listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session);
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    }).catch(() => {
      handleSession(null);
    });

    // Safety net — if not fully loaded in 4s, clear state and go to login
    const timeout = setTimeout(() => {
      if (!done) {
        done = true;
        setUser(null);
        setSession(null);
        setChildProfiles([]);
        setLoading(false);
      }
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    // Clear state immediately so UI redirects before Supabase round-trip
    setUser(null);
    setSession(null);
    setChildProfiles([]);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        children: childProfiles,
        hasChildren: childProfiles.length > 0,
        refreshChildren,
        signOut,
      }}
    >
      {reactChildren}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
