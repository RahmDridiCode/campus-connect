'use client';

import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import type { User, RegisterFormData, AuthContextType } from '@/types';
import { authAPI } from '@/lib/auth';

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const userData = await authAPI.getMe();
        setUser(userData);
        setError(null);
      } catch (err: any) {
        setUser(null);
        if (err.response?.status !== 401) {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const { user: userData } = await authAPI.login({
        email,
        password,
      });
      setUser(userData);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur de connexion';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (data: RegisterFormData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      // L'inscription ne connecte pas : on ne met PAS à jour l'état user
      await authAPI.register(data);
    } catch (err: any) {
      const message = err.response?.data?.message || "Erreur d'inscription";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authAPI.logout();
      setUser(null);
      setError(null);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur de déconnexion';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur de mise à jour';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook pour utiliser le contexte
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
