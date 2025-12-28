import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: number;
  email: string;
  role?: 'user' | 'admin' | 'enterprise';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEnterprise: boolean;
  signUp: (email: string, password: string, passwordConfirmation: string) => Promise<string | void>;
  signIn: (email: string, password: string) => Promise<string | void>;
  signOut: () => Promise<string>;
  resetPassword: (email: string) => Promise<string | void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const token = apiClient.getToken();
    if (token) {
      // Fetch current user from backend
      authApi.getCurrentUser()
        .then((response) => {
          if (response.data) {
            const userData = response.data as Record<string, unknown>;
            // Handle role conversion (integer to string during migration)
            let role: 'user' | 'admin' | 'enterprise' = 'user';
            if (userData.role !== undefined && userData.role !== null) {
              if (typeof userData.role === 'number') {
                // Convert integer to string during migration
                role = userData.role === 0 ? 'user' : userData.role === 1 ? 'admin' : 'enterprise';
              } else if (typeof userData.role === 'string') {
                role = (userData.role as 'user' | 'admin' | 'enterprise') || 'user';
              }
            }
            
            const user: User = {
              id: userData.id as number,
              email: userData.email as string,
              role,
              created_at: userData.created_at as string,
              updated_at: userData.updated_at as string,
            };
            setUser(user);
          }
        })
        .catch((error) => {
          console.error('Error fetching current user:', error);
          // If token is invalid, clear it
          apiClient.setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, passwordConfirmation: string) => {
    try {
      const response = await authApi.signUp(email, password, passwordConfirmation);
      // ActiveModel::Serializer returns data directly as an object
      if (response.data) {
        const userData = response.data as Record<string, unknown>;
        const user: User = {
          id: userData.id as number,
          email: userData.email as string,
          role: (userData.role as 'user' | 'admin' | 'enterprise') || 'user',
          created_at: userData.created_at as string,
          updated_at: userData.updated_at as string,
        };
        setUser(user);
        toast({
          title: 'Account created',
          description: 'Your account has been created successfully.',
        });
        // Navigation will be handled by the component
        return '/assistants?create=true';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign up';
      toast({
        title: 'Sign up failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.signIn(email, password);
      // ActiveModel::Serializer returns data directly as an object
      if (response.data) {
        const userData = response.data as Record<string, unknown>;
        const user: User = {
          id: userData.id as number,
          email: userData.email as string,
          role: (userData.role as 'user' | 'admin' | 'enterprise') || 'user',
          created_at: userData.created_at as string,
          updated_at: userData.updated_at as string,
        };
        setUser(user);
        // Store token if provided in response
        if (response.token) {
          apiClient.setToken(response.token);
        }
        toast({
          title: 'Signed in',
          description: 'Welcome back!',
        });
        // Navigation will be handled by the component
        return '/overview';
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
      toast({
        title: 'Sign in failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
      setUser(null);
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      // Navigation will be handled by the component
      return '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      apiClient.setToken(null);
      return '/login';
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await authApi.resetPassword(email);
      toast({
        title: 'Reset email sent',
        description: 'Please check your email for password reset instructions.',
      });
      // Navigation will be handled by the component
      return '/login';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      toast({
        title: 'Reset failed',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const refreshUser = async () => {
    const token = apiClient.getToken();
    if (!token) {
      return;
    }
    
    try {
      const response = await authApi.getCurrentUser();
      if (response.data) {
        const userData = response.data as Record<string, unknown>;
        // Handle role conversion (integer to string during migration)
        let role: 'user' | 'admin' | 'enterprise' = 'user';
        if (userData.role !== undefined && userData.role !== null) {
          if (typeof userData.role === 'number') {
            // Convert integer to string during migration
            role = userData.role === 0 ? 'user' : userData.role === 1 ? 'admin' : 'enterprise';
          } else if (typeof userData.role === 'string') {
            role = (userData.role as 'user' | 'admin' | 'enterprise') || 'user';
          }
        }
        
        const updatedUser: User = {
          id: userData.id as number,
          email: userData.email as string,
          role,
          created_at: userData.created_at as string,
          updated_at: userData.updated_at as string,
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isEnterprise = user?.role === 'enterprise';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        isEnterprise,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

