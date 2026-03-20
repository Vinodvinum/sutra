import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import firebaseApp from './firebase';
import supabase from './supabase';

export interface AuthResult {
  user: FirebaseAuthTypes.User | null;
  error: string | null;
}

export interface PasswordResetResult {
  error: string | null;
}

const getErrorMessage = (error: unknown, fallback = 'Something went wrong.'): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const configureGoogleSignIn = (): void => {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
  });
};

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  try {
    await firebaseApp;

    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const firebaseUser = userCredential.user;

    await firebaseUser.updateProfile({ displayName: name });

    const { error: profileError } = await supabase.from('profiles').insert({
      id: firebaseUser.uid,
      name,
      avatar_emoji: '\u{1F9D8}',
      onboarding_complete: false,
    });

    if (profileError) {
      return { user: null, error: profileError.message };
    }

    return { user: firebaseUser, error: null };
  } catch (error: unknown) {
    return { user: null, error: getErrorMessage(error) };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    await firebaseApp;

    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return { user: userCredential.user, error: null };
  } catch {
    return { user: null, error: 'Incorrect email or password.' };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    await firebaseApp;

    configureGoogleSignIn();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const signInResponse = await GoogleSignin.signIn();
    if (signInResponse.type !== 'success') {
      return { user: null, error: 'Google sign-in was cancelled.' };
    }

    const idToken = signInResponse.data.idToken;
    if (!idToken) {
      return { user: null, error: 'Unable to retrieve Google identity token.' };
    }

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    const firebaseUser = userCredential.user;

    const { data: existingProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', firebaseUser.uid)
      .maybeSingle();

    if (profileFetchError) {
      return { user: null, error: profileFetchError.message };
    }

    if (!existingProfile) {
      const displayName =
        firebaseUser.displayName ?? signInResponse.data.user.name ?? 'Sadhak';

      const { error: insertError } = await supabase.from('profiles').insert({
        id: firebaseUser.uid,
        name: displayName,
        avatar_emoji: '\u{1F9D8}',
        onboarding_complete: false,
      });

      if (insertError) {
        return { user: null, error: insertError.message };
      }
    }

    return { user: firebaseUser, error: null };
  } catch (error: unknown) {
    return { user: null, error: getErrorMessage(error) };
  }
}

export async function signOut(): Promise<void> {
  await firebaseApp;
  await auth().signOut();

  try {
    await GoogleSignin.signOut();
  } catch {
    return;
  }
}

export async function resetPassword(email: string): Promise<PasswordResetResult> {
  try {
    await firebaseApp;
    await auth().sendPasswordResetEmail(email);
    return { error: null };
  } catch (error: unknown) {
    return { error: getErrorMessage(error) };
  }
}

export function getCurrentUser(): FirebaseAuthTypes.User | null {
  return auth().currentUser;
}

