import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleAuthProvider,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  onAuthStateChanged,
  User,
  getUserProfileFromFirestore,
  saveUserProfileToFirestore,
  BOOTSTRAPPED_ADMIN_EMAIL,
  sendVerificationEmailToUser,
  sendPasswordReset,
  getAuthorizedStaffByEmail,
  isEmailAuthorizedStaff
} from './firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isStaff: boolean;
  isAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  signUpWithEmail: (email: string, pass: string, displayName: string, desiredRole?: UserRole) => Promise<User>;
  signInWithGoogle: (desiredRole?: UserRole) => Promise<User>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  reloadUser: () => Promise<User | null>;
  sendVerificationEmail: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  checkIsAuthorizedStaff: (email: string) => Promise<{ authorized: boolean; role: UserRole }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrCreateProfile = async (firebaseUser: User, fallbackRole: UserRole = 'customer'): Promise<UserProfile> => {
    const emailLower = (firebaseUser.email || '').toLowerCase().trim();
    const isBootstrappedAdmin = emailLower === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

    try {
      const existing = await getUserProfileFromFirestore(firebaseUser.uid);

      let targetRole: UserRole = fallbackRole;
      if (isBootstrappedAdmin) {
        targetRole = 'admin';
      } else if (emailLower) {
        const authorizedEntry = await getAuthorizedStaffByEmail(emailLower);
        if (authorizedEntry) {
          targetRole = authorizedEntry.role;
        } else if (existing?.role === 'staff' || existing?.role === 'admin') {
          targetRole = existing.role;
        }
      }

      if (existing) {
        if (existing.role !== targetRole) {
          const updated: UserProfile = { ...existing, role: targetRole };
          await saveUserProfileToFirestore(updated);
          return updated;
        }
        return existing;
      }

      // Create new profile
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        role: targetRole,
        createdAt: new Date().toISOString()
      };
      await saveUserProfileToFirestore(newProfile);
      return newProfile;
    } catch (err) {
      console.error('Error fetching or creating profile:', err);
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        role: isBootstrappedAdmin ? 'admin' : fallbackRole,
        createdAt: new Date().toISOString()
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userProfile = await fetchOrCreateProfile(currentUser);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      const p = await fetchOrCreateProfile(auth.currentUser);
      setProfile(p);
    }
  };

  const handleSignInWithEmail = async (email: string, pass: string): Promise<User> => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const p = await fetchOrCreateProfile(cred.user);
    setProfile(p);
    return cred.user;
  };

  const handleSignUpWithEmail = async (
    email: string, 
    pass: string, 
    displayName: string,
    desiredRole: UserRole = 'customer'
  ): Promise<User> => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    try {
      await sendVerificationEmailToUser(cred.user);
    } catch (verErr) {
      console.warn('Could not send immediate verification email:', verErr);
    }
    const isBootstrapped = email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
    const finalRole: UserRole = isBootstrapped ? 'admin' : (desiredRole === 'staff' ? 'customer' : 'customer'); // Prevent rogue staff self-registration
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: displayName.trim() || email.split('@')[0],
      role: finalRole,
      createdAt: new Date().toISOString()
    };
    await saveUserProfileToFirestore(newProfile);
    setProfile(newProfile);
    return cred.user;
  };

  const handleSignInWithGoogle = async (desiredRole: UserRole = 'customer'): Promise<User> => {
    const cred = await signInWithPopup(auth, googleAuthProvider);
    const p = await fetchOrCreateProfile(cred.user, desiredRole);
    setProfile(p);
    return cred.user;
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const reloadUser = async (): Promise<User | null> => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser({ ...auth.currentUser });
      return auth.currentUser;
    }
    return null;
  };

  const handleSendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await sendVerificationEmailToUser(auth.currentUser);
    } else {
      throw new Error('No user is currently signed in.');
    }
  };

  const handleSendPasswordReset = async (targetEmail: string): Promise<void> => {
    await sendPasswordReset(targetEmail);
  };

  const role: UserRole | null = profile?.role || null;
  const isStaff = role === 'staff' || role === 'admin';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isStaff,
        isAdmin,
        loading,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        signInWithGoogle: handleSignInWithGoogle,
        signOutUser: handleSignOut,
        refreshProfile,
        reloadUser,
        sendVerificationEmail: handleSendVerificationEmail,
        sendPasswordReset: handleSendPasswordReset,
        checkIsAuthorizedStaff: isEmailAuthorizedStaff
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
