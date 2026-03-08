import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
    let handled = false;

    const handleSession = (session: Session | null) => {
      if (handled) return;
      handled = true;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch children in the background — don't block loading
        fetchChildren(session.user.id).catch(() => {});
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

    // Safety net — unconditionally stop loading after 4s
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
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
