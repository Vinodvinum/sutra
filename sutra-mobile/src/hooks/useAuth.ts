import { useCallback, useEffect, useState } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { User } from '../constants/types';
import { signOut as signOutUser } from '../lib/firebaseAuth';
import { getProfile } from '../lib/supabase';

export interface UseAuthState {
  user: FirebaseAuthTypes.User | null;
  profile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export default function useAuth(): UseAuthState {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (!isMounted) {
        return;
      }

      setLoading(true);
      setUser(firebaseUser);

      if (firebaseUser) {
        const userProfile = await getProfile(firebaseUser.uid);
        if (!isMounted) {
          return;
        }
        setProfile(userProfile);
      } else {
        setProfile(null);
      }

      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;
    const interval = setInterval(async () => {
      const latestProfile = await getProfile(user.uid);
      if (!cancelled) {
        setProfile(latestProfile);
      }
    }, 2500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  const handleSignOut = useCallback(async () => {
    await signOutUser();
  }, []);

  return {
    user,
    profile,
    loading,
    signOut: handleSignOut,
  };
}
