import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  readingLevel: string;
  streak: number;
  lastActive: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  updateReadingLevel: (level: string) => Promise<void>;
  completeStory: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider mounted, setting up onAuthStateChanged...");
    
    // Safety timeout: if Firebase doesn't respond in 10 seconds, stop loading
    const timer = setTimeout(() => {
      if (loading) {
        console.warn("Firebase Auth timed out. Proceeding...");
        setLoading(false);
      }
    }, 10000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged fired. User:", user ? user.email : "none");
      clearTimeout(timer);
      setCurrentUser(user);
      try {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            const newUserData: UserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              readingLevel: 'beginner',
              streak: 0,
              lastActive: null
            };
            await setDoc(userDocRef, newUserData);
            setUserData(newUserData);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Firebase Auth/Firestore error:", error);
      } finally {
        setLoading(false);
        console.log("Auth loading complete");
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const updateReadingLevel = async (level: string) => {
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, { readingLevel: level }, { merge: true });
      setUserData(prev => prev ? { ...prev, readingLevel: level } : null);
    }
  };

  const completeStory = async () => {
    if (currentUser && userData) {
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDate = userData.lastActive?.split('T')[0];
      
      let newStreak = userData.streak;
      if (lastActiveDate !== today) {
        // Check if last active was yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActiveDate === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1; // Restart streak
        }
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { 
          streak: newStreak, 
          lastActive: new Date().toISOString() 
        }, { merge: true });
        
        setUserData(prev => prev ? { ...prev, streak: newStreak, lastActive: new Date().toISOString() } : null);
      }
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    updateReadingLevel,
    completeStory
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="lead text-muted">Starting Literacy Companion...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
