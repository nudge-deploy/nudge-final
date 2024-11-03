// context/SessionContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import supabase from "../database/supabaseClient";

// Define the shape of the context state
interface SessionContextType {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create the context with default values
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Custom hook to access the context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

// Session provider component
export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check session and set the user state
  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUser(data.session.user);
      }
      setLoading(false);
    }
    getSession();
  }, []);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, loading, signOut }}>
      {!loading && children}
    </SessionContext.Provider>
  );
};