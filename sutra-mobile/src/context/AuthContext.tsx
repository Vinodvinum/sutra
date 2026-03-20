import React, { createContext, ReactNode, useContext } from 'react';

import useAuth, { UseAuthState } from '../hooks/useAuth';

const AuthContext = createContext<UseAuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authState = useAuth();

  return <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): UseAuthState {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider.');
  }

  return context;
}

