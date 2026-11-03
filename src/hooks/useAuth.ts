import { useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signInAsGuest, logout } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    login: signInWithGoogle,
    loginAsGuest: signInAsGuest,
    logout,
    isAuthenticated: !!user,
    isGuest: user?.isAnonymous || false,
  };
}

