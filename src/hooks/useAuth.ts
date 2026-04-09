import { useState, useEffect, useCallback } from 'react';
import {
  signIn,
  signOut,
  getCurrentUser,
  addAuditLog,
} from '@/lib/supabase';
import type { User } from '@/lib/index';
import { ADMIN_PASSWORD } from '@/lib/index';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requirePassword: (password: string) => boolean;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setState({
        user,
        isAuthenticated: Boolean(user),
        isLoading: false,
      });
    } catch (error) {
      console.error('Erreur refresh user:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const { user, error } = await signIn(email, password);

        if (error || !user) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return {
            success: false,
            error: error?.message || 'Identifiants invalides',
          };
        }

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        await addAuditLog(user.email, 'Connexion', 'Connexion réussie');

        return { success: true };
      } catch (error) {
        console.error('Erreur login:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return {
          success: false,
          error: 'Erreur de connexion',
        };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      if (state.user) {
        await addAuditLog(state.user.email, 'Déconnexion', 'Déconnexion réussie');
      }

      await signOut();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  }, [state.user]);

  const requirePassword = useCallback((password: string): boolean => {
    return password === ADMIN_PASSWORD;
  }, []);

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    requirePassword,
    refreshUser,
  };
}
