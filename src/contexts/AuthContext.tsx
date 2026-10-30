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
    let initialised = false;

    const applySession = async (session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          await fetchChildren(session.user.id);
        } catch (err) {
          console.error("Failed to fetch children:", err);
        }
      } else {
        setChildProfiles([]);
      }
      setLoading(false);
    };

    // Set up auth state listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!initialised) {
          // Skip the initial event from onAuthStateChange — getSession handles it
          return;
        }
        applySession(session);
      }
    );

    // Get initial session (single source of truth for first load)
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
      initialised = true;
    }).catch(() => {
      applySession(null);
      initialised = true;
    });

    // Safety net — if not fully loaded in 8s, clear state
    const timeout = setTimeout(() => {
      if (!initialised) {
        initialised = true;
        setUser(null);
        setSession(null);
        setChildProfiles([]);
        setLoading(false);
      }
    }, 8000);

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
