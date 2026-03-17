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
          let userDoc;
          
          try {
            userDoc = await getDoc(userDocRef);
          } catch (getDocError: any) {
            console.warn("Initial getDoc failed (possibly offline). Using local defaults.", getDocError);
            // Don't throw - continue with default data so the app stays functional
          }

          if (userDoc?.exists()) {
            setUserData(userDoc.data() as UserData);
          } else {
            // Document doesn't exist or we're offline and it's not cached
            const newUserData: UserData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              readingLevel: 'beginner',
              streak: 0,
              lastActive: null
            };
            
            // This setDoc will now resolve immediately to the local cache if persistent
            try {
              await setDoc(userDocRef, newUserData, { merge: true });
            } catch (setDocError) {
              console.warn("Could not save initial user doc to server, but it's in the local queue.");
            }
            
            setUserData(newUserData);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Critical Firebase Auth/Firestore error:", error);
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
      console.log("updateReadingLevel: Optimistic update starting for", level);
      
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // 1. Update local state immediately (Optimistic)
        setUserData(prev => prev ? { ...prev, readingLevel: level } : null);
        
        // 2. Fire and forget the Firestore write (Background sync)
        // We don't 'await' this so the UI can proceed immediately.
        // Firestore will automatically retry this write when the connection is stable.
        setDoc(userDocRef, { readingLevel: level }, { merge: true }).catch(err => {
          console.warn("Background Firestore update pending or failed:", err);
        });
        
        console.log("updateReadingLevel: Optimistic update complete");
      } catch (error: any) {
        console.error("Critical error in updateReadingLevel:", error);
        throw error;
      }
    }
  };

  const completeStory = async () => {
    if (currentUser && userData) {
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDate = userData.lastActive?.split('T')[0];
      
      let newStreak = userData.streak;
      if (lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastActiveDate === yesterdayStr) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
        
        const now = new Date().toISOString();
        const userDocRef = doc(db, 'users', currentUser.uid);
        
        // Optimistic update for streak
        setUserData(prev => prev ? { ...prev, streak: newStreak, lastActive: now } : null);
        
        // Background sync
        setDoc(userDocRef, { 
          streak: newStreak, 
          lastActive: now 
        }, { merge: true }).catch(err => {
          console.warn("Background streak update pending:", err);
        });
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
