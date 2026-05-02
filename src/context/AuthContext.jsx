import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        setProfile(snapshot.data());
      } else {
        const fallbackProfile = {
          id: user.uid,
          name: user.displayName || "New User",
          email: user.email,
          role: "patient"
        };
        await setDoc(userRef, fallbackProfile);
        setProfile(fallbackProfile);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async ({ name, email, password, role }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile = {
      id: credential.user.uid,
      name,
      email,
      role
    };

    await setDoc(doc(db, "users", credential.user.uid), newProfile);
    setProfile(newProfile);

    return credential.user;
  };

  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(
    () => ({
      authUser,
      profile,
      loading,
      register,
      login,
      logout
    }),
    [authUser, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
