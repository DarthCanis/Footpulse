import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './useAuth';

export interface UserPreferences {
  favoriteClubs: string[];
  favoriteLeagues: string[];
  savedQueries: {
    id: string;
    query: string;
    answer: string;
    timestamp: string;
  }[];
  updatedAt?: string;
}

const LOCAL_STORAGE_KEY = 'footpulse_local_user_preferences';

function getLocalPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        favoriteClubs: Array.isArray(parsed.favoriteClubs) ? parsed.favoriteClubs : [],
        favoriteLeagues: Array.isArray(parsed.favoriteLeagues) ? parsed.favoriteLeagues : [],
        savedQueries: Array.isArray(parsed.savedQueries) ? parsed.savedQueries : [],
      };
    }
  } catch (e) {
    console.warn('Failed to parse local preferences:', e);
  }
  return { favoriteClubs: [], favoriteLeagues: [], savedQueries: [] };
}

function saveLocalPreferences(prefs: UserPreferences) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save local preferences:', e);
  }
}

export function useUserData() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(getLocalPreferences);
  const [loading, setLoading] = useState(true);

  // Synchronize Firestore preferences when logged in; fallback to localStorage when logged out
  useEffect(() => {
    if (!user) {
      const local = getLocalPreferences();
      setPreferences(local);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const mergedPrefs: UserPreferences = {
            favoriteClubs: Array.isArray(data.favoriteClubs) ? data.favoriteClubs : [],
            favoriteLeagues: Array.isArray(data.favoriteLeagues) ? data.favoriteLeagues : [],
            savedQueries: Array.isArray(data.savedQueries) ? data.savedQueries : [],
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
          setPreferences(mergedPrefs);
          saveLocalPreferences(mergedPrefs);
        } else {
          // New authenticated user: migrate any local favorites seamlessly into Firestore
          const localPrefs = getLocalPreferences();
          const initialData: UserPreferences = {
            favoriteClubs: localPrefs.favoriteClubs || [],
            favoriteLeagues: localPrefs.favoriteLeagues || [],
            savedQueries: localPrefs.savedQueries || [],
            updatedAt: new Date().toISOString(),
          };
          try {
            await setDoc(userDocRef, initialData);
            setPreferences(initialData);
          } catch (createErr) {
            handleFirestoreError(createErr, OperationType.CREATE, `users/${user.uid}`);
          }
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore user snapshot warning:', error);
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Toggle favorite club (persists to Firestore if authenticated, or localStorage if offline/guest)
  const toggleFavoriteClub = useCallback(
    async (clubShort: string): Promise<boolean> => {
      const currentClubs = preferences.favoriteClubs;
      const normalizedClub = clubShort.toUpperCase();
      const updatedClubs = currentClubs.includes(normalizedClub)
        ? currentClubs.filter((c) => c !== normalizedClub)
        : [...currentClubs, normalizedClub];

      const newPrefs: UserPreferences = {
        ...preferences,
        favoriteClubs: updatedClubs,
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update state and localStorage
      setPreferences(newPrefs);
      saveLocalPreferences(newPrefs);

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, newPrefs, { merge: true });
          return true;
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
          return false;
        }
      }
      return true;
    },
    [preferences, user]
  );

  // Toggle favorite league (persists to Firestore if authenticated, or localStorage if offline/guest)
  const toggleFavoriteLeague = useCallback(
    async (leagueId: string): Promise<boolean> => {
      const currentLeagues = preferences.favoriteLeagues;
      const normalizedLeague = leagueId.toLowerCase();
      const updatedLeagues = currentLeagues.includes(normalizedLeague)
        ? currentLeagues.filter((l) => l !== normalizedLeague)
        : [...currentLeagues, normalizedLeague];

      const newPrefs: UserPreferences = {
        ...preferences,
        favoriteLeagues: updatedLeagues,
        updatedAt: new Date().toISOString(),
      };

      // Optimistically update state and localStorage
      setPreferences(newPrefs);
      saveLocalPreferences(newPrefs);

      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, newPrefs, { merge: true });
          return true;
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
          return false;
        }
      }
      return true;
    },
    [preferences, user]
  );

  const isClubFavorite = useCallback(
    (clubIdentifier: string): boolean => {
      if (!clubIdentifier) return false;
      const upper = clubIdentifier.toUpperCase();
      return preferences.favoriteClubs.some(
        (c) => c.toUpperCase() === upper || clubIdentifier.toUpperCase().includes(c.toUpperCase())
      );
    },
    [preferences.favoriteClubs]
  );

  const isLeagueFavorite = useCallback(
    (leagueId: string): boolean => {
      if (!leagueId) return false;
      const lower = leagueId.toLowerCase();
      return preferences.favoriteLeagues.some((l) => l.toLowerCase() === lower);
    },
    [preferences.favoriteLeagues]
  );

  const saveAIQuery = async (query: string, answer: string) => {
    const newQuery = {
      id: Math.random().toString(36).substring(2, 9),
      query,
      answer,
      timestamp: new Date().toISOString(),
    };
    const updatedQueries = [newQuery, ...preferences.savedQueries].slice(0, 10);
    const newPrefs = { ...preferences, savedQueries: updatedQueries };

    setPreferences(newPrefs);
    saveLocalPreferences(newPrefs);

    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, newPrefs, { merge: true });
        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        return false;
      }
    }
    return true;
  };

  const deleteAIQuery = async (queryId: string) => {
    const updatedQueries = preferences.savedQueries.filter((q) => q.id !== queryId);
    const newPrefs = { ...preferences, savedQueries: updatedQueries };

    setPreferences(newPrefs);
    saveLocalPreferences(newPrefs);

    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, newPrefs, { merge: true });
        return true;
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        return false;
      }
    }
    return true;
  };

  return {
    preferences,
    loading,
    toggleFavoriteClub,
    toggleFavoriteLeague,
    isClubFavorite,
    isLeagueFavorite,
    favoriteClubsCount: preferences.favoriteClubs.length,
    favoriteLeaguesCount: preferences.favoriteLeagues.length,
    totalFavoritesCount: preferences.favoriteClubs.length + preferences.favoriteLeagues.length,
    saveAIQuery,
    deleteAIQuery,
  };
}

