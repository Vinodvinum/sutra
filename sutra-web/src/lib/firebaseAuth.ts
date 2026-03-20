"use client";

import {
  User,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { firebaseApp } from "./firebase";
import { getSupabaseClient } from "./supabase";

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

interface AuthResult {
  user: User | null;
  error: string | null;
}

const setSessionCookie = (): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = "sutra_session=1; path=/; max-age=2592000; samesite=lax";
};

export const clearSessionCookie = (): void => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = "sutra_session=; path=/; max-age=0; samesite=lax";
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResult> => {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user) {
      await updateProfile(credential.user, { displayName: name });
    }

    const supabase = getSupabaseClient();
    await supabase.from("profiles").upsert({
      id: credential.user.uid,
      name,
      avatar_emoji: "\u{1F9D8}",
      onboarding_complete: false,
    });

    setSessionCookie();
    return { user: credential.user, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create account.";
    return { user: null, error: message };
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    setSessionCookie();
    return { user: credential.user, error: null };
  } catch {
    return { user: null, error: "Incorrect email or password." };
  }
};

export const signInWithGoogle = async (): Promise<AuthResult> => {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = credential.user;
    const supabase = getSupabaseClient();
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", firebaseUser.uid)
      .maybeSingle();

    if (!existing) {
      await supabase.from("profiles").insert({
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? "Sadhak",
        avatar_emoji: "\u{1F9D8}",
        onboarding_complete: false,
      });
    }

    setSessionCookie();
    return { user: firebaseUser, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Google sign-in failed.";
    return { user: null, error: message };
  }
};

export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send reset link.";
    return { error: message };
  }
};

export const getCurrentUser = (): User | null => auth.currentUser;

export const getAuthClient = () => auth;

export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
  clearSessionCookie();
};
