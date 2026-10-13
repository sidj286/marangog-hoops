import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, getSupabaseCredentials } from '../lib/supabase';
import { mockEngine } from '../lib/mockEngine';
import type { Profile } from '../types';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  isSupabaseLive: boolean;
  authModalReason: string;
  isAuthModalOpen: boolean;
  isProfileModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsProfileModalOpen: (open: boolean) => void;
  requireAuth: (actionCallback: () => void, modalReason?: string) => void;
  signUp: (email: string, pass: string, displayName: string, purok: string, monicker?: string) => Promise<{ error?: string }>;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { display_name: string; purok: string; monicker?: string }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalReason, setAuthModalReason] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { isConfigured: isSupabaseLive } = getSupabaseCredentials();
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Fetch or refresh profile
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (isSupabaseLive) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.warn('Profile fetch error or profile not created yet:', error.message);
          return null;
        }
        return data as Profile;
      } catch (err) {
        console.error('Failed to load profile from Supabase:', err);
        return null;
      }
    } else {
      const mockProf = mockEngine.getProfile(userId);
      return mockProf || null;
    }
  }, [isSupabaseLive]);

  // Initial Auth Check
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (isSupabaseLive) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!mounted) return;

          setSession(currentSession);
          if (currentSession?.user) {
            setUser({ id: currentSession.user.id, email: currentSession.user.email });
            const prof = await fetchProfile(currentSession.user.id);
            if (mounted) setProfile(prof);
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error('Supabase session load error:', err);
        } finally {
          if (mounted) setLoading(false);
        }

        // Listen for Supabase Auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
          if (!mounted) return;
          setSession(newSession);
          if (newSession?.user) {
            setUser({ id: newSession.user.id, email: newSession.user.email });
            const prof = await fetchProfile(newSession.user.id);
            if (mounted) setProfile(prof);
          } else {
            setUser(null);
            setProfile(null);
          }
        });

        return () => {
          authListener.subscription.unsubscribe();
        };
      } else {
        // Mock mode auth check
        const currentMockUser = mockEngine.getCurrentUser();
        if (currentMockUser) {
          setUser(currentMockUser);
          const prof = mockEngine.getProfile(currentMockUser.id);
          setProfile(prof || null);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [isSupabaseLive, fetchProfile]);

  // Execute pending user action once profile and auth are completed
  const executePendingAction = useCallback(() => {
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      // Slight delay to allow modal transitions to settle smoothly
      setTimeout(() => {
        try {
          action();
        } catch (err) {
          console.error('Error executing pending action:', err);
        }
      }, 150);
    }
  }, []);

  // Intercepting Guard: requireAuth
  const requireAuth = useCallback((actionCallback: () => void, modalReason?: string) => {
    if (!user) {
      // Step 1: User not logged in -> Open Auth Modal
      pendingActionRef.current = actionCallback;
      setAuthModalReason(modalReason || 'Paghimo\'g account o log in aron maka-comment, makapost, o maka-join sa duwa!');
      setIsAuthModalOpen(true);
      return;
    }

    if (!profile || !profile.display_name?.trim() || !profile.purok?.trim()) {
      // Step 2: Logged in but missing profile details -> Open Profile Setup Modal
      pendingActionRef.current = actionCallback;
      setIsProfileModalOpen(true);
      return;
    }

    // Step 3: Fully authorized -> Run action directly!
    actionCallback();
  }, [user, profile]);

  // Sign Up Flow
  const signUp = async (
    email: string,
    pass: string,
    displayName: string,
    purok: string,
    monicker?: string
  ): Promise<{ error?: string }> => {
    try {
      if (isSupabaseLive) {
        // Pass metadata to Supabase so PostgreSQL triggers can access display_name and purok
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass,
          options: {
            data: {
              display_name: displayName.trim(),
              purok: purok.trim(),
            },
          },
        });

        if (authError) {
          return { error: authError.message };
        }

        const newUser = authData.user;
        if (!newUser) {
          return { error: 'Walay user ID nga nadawat gikan sa server.' };
        }

        // Verify if session was returned. If not, auto-confirm is not disabled in Supabase!
        let activeSession = authData.session;
        if (!activeSession) {
          const { data: loginData } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: pass,
          });
          activeSession = loginData.session;
        }

        if (!activeSession) {
          return {
            error: 'Naka-enable ang "Confirm email" sa Supabase project. Palihug i-disable ang "Confirm email" sa Supabase Dashboard (Authentication -> Providers -> Email) aron makasulod dayon.',
          };
        }

        // Insert or Upsert into public.profiles
        const newProfile: Profile = {
          id: newUser.id,
          display_name: displayName.trim(),
          purok: purok.trim(),
          monicker: monicker?.trim() || null,
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(newProfile);

        if (profileError) {
          console.error('Profile insertion error:', profileError);
          return { error: profileError.message };
        }

        setUser({ id: newUser.id, email: newUser.email });
        setProfile(newProfile);
        setIsAuthModalOpen(false);
        executePendingAction();
        return {};
      } else {
        // Mock Engine Sign Up
        const mockId = 'user-' + Date.now();
        const mockNewUser = { id: mockId, email: email.trim() };
        mockEngine.setCurrentUser(mockNewUser);

        const newProfile: Profile = {
          id: mockId,
          display_name: displayName.trim(),
          purok: purok.trim(),
          monicker: monicker?.trim() || null,
          created_at: new Date().toISOString()
        };
        mockEngine.saveProfile(newProfile);

        setUser(mockNewUser);
        setProfile(newProfile);
        setIsAuthModalOpen(false);
        executePendingAction();
        return {};
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Wala damha nga sayop.';
      return { error: message };
    }
  };

  // Sign In Flow
  const signIn = async (email: string, pass: string): Promise<{ error?: string }> => {
    try {
      if (isSupabaseLive) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          return { error: error.message };
        }

        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email });
          const userProf = await fetchProfile(data.user.id);
          setProfile(userProf);
          setIsAuthModalOpen(false);

          if (!userProf || !userProf.display_name) {
            setIsProfileModalOpen(true);
          } else {
            executePendingAction();
          }
        }
        return {};
      } else {
        // In mock mode, find if existing profile or generate session
        const allProfiles = mockEngine.getProfiles();
        const existingProf = allProfiles.find(p => p.display_name.toLowerCase().includes(email.split('@')[0].toLowerCase())) || allProfiles[0];
        
        const mockUser = { id: existingProf.id, email: email.trim() };
        mockEngine.setCurrentUser(mockUser);
        setUser(mockUser);
        setProfile(existingProf);
        setIsAuthModalOpen(false);
        executePendingAction();
        return {};
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sayop sa pagsulod.';
      return { error: message };
    }
  };

  // Sign Out Flow
  const signOut = async () => {
    if (isSupabaseLive) {
      await supabase.auth.signOut();
    } else {
      mockEngine.setCurrentUser(null);
    }
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // Update Profile Flow
  const updateProfile = async (data: { display_name: string; purok: string; monicker?: string }): Promise<{ error?: string }> => {
    if (!user) return { error: 'Palihug log in una.' };

    try {
      const updatedData: Profile = {
        id: user.id,
        display_name: data.display_name.trim(),
        purok: data.purok.trim(),
        monicker: data.monicker?.trim() || null,
      };

      if (isSupabaseLive) {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          return {
            error: 'Walay aktibong session sa Supabase. Palihug i-disable ang "Confirm email" sa Supabase Dashboard (Authentication -> Providers -> Email) ug pag-login og balik.',
          };
        }

        const { error } = await supabase
          .from('profiles')
          .upsert(updatedData);

        if (error) {
          return { error: error.message };
        }
      } else {
        mockEngine.saveProfile(updatedData);
      }

      setProfile(updatedData);
      setIsProfileModalOpen(false);
      executePendingAction();
      return {};
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sayop sa pag-save sa profile.';
      return { error: message };
    }
  };

  const isGuest = !user || !profile || !profile.display_name;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isGuest,
        isSupabaseLive,
        authModalReason,
        isAuthModalOpen,
        isProfileModalOpen,
        setIsAuthModalOpen,
        setIsProfileModalOpen,
        requireAuth,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
