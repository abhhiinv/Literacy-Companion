import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, onSnapshot, query, orderBy, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  readingLevel: string;
  streak: number;
  lastActive: string | null;
}

export interface SavedStory {
  id: string;
  title: string;
  content: string;
  questions: any[];
  level: string;
  topic: string;
  createdAt: any;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  savedStories: SavedStory[];
  loading: boolean;
  updateReadingLevel: (level: string) => Promise<void>;
  completeStory: () => Promise<void>;
  saveStory: (story: any, level: string, topic: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
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
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
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

    let unsubscribeStories: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged fired. User:", user ? user.email : "none");
      clearTimeout(timer);
      setCurrentUser(user);
      
      if (unsubscribeStories) unsubscribeStories();

      try {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          let userDoc;
          
          try {
            userDoc = await getDoc(userDocRef);
          } catch (getDocError: any) {
            console.warn("Initial getDoc failed (possibly offline). Using local defaults.", getDocError);
          }

          if (userDoc?.exists()) {
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
            
            try {
              await setDoc(userDocRef, newUserData, { merge: true });
            } catch (setDocError) {
              console.warn("Could not save initial user doc to server, but it's in the local queue.");
            }
            
            setUserData(newUserData);
          }

          // Set up real-time listener for saved stories
          const storiesRef = collection(db, 'users', user.uid, 'savedStories');
          const q = query(storiesRef, orderBy('createdAt', 'desc'));
          
          unsubscribeStories = onSnapshot(q, (snapshot) => {
            const stories: SavedStory[] = [];
            snapshot.forEach((doc) => {
              stories.push({ id: doc.id, ...doc.data() } as SavedStory);
            });
            setSavedStories(stories);
          }, (err) => {
            console.warn("Saved stories onSnapshot error:", err);
          });

        } else {
          setUserData(null);
          setSavedStories([]);
        }
      } catch (error) {
        console.error("Critical Firebase Auth/Firestore error:", error);
      } finally {
        setLoading(false);
        console.log("Auth loading complete");
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeStories) unsubscribeStories();
      clearTimeout(timer);
    };
  }, []);

  const updateReadingLevel = async (level: string) => {
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        setUserData(prev => prev ? { ...prev, readingLevel: level } : null);
        setDoc(userDocRef, { readingLevel: level }, { merge: true }).catch(err => {
          console.warn("Background Firestore update pending or failed:", err);
        });
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
        
        setUserData(prev => prev ? { ...prev, streak: newStreak, lastActive: now } : null);
        
        setDoc(userDocRef, { 
          streak: newStreak, 
          lastActive: now 
        }, { merge: true }).catch(err => {
          console.warn("Background streak update pending:", err);
        });
      }
    }
  };

  const saveStory = async (story: any, level: string, topic: string) => {
    if (currentUser) {
      const storiesRef = collection(db, 'users', currentUser.uid, 'savedStories');
      const newDocRef = doc(storiesRef);
      const storyData = {
        ...story,
        level,
        topic,
        createdAt: serverTimestamp()
      };
      
      // Optimistic update
      setSavedStories(prev => [{ id: newDocRef.id, ...storyData, createdAt: new Date() }, ...prev]);
      
      // Background sync
      setDoc(newDocRef, storyData).catch(err => {
        console.warn("Background story save pending:", err);
      });
    }
  };

  const deleteStory = async (storyId: string) => {
    if (currentUser) {
      const storyRef = doc(db, 'users', currentUser.uid, 'savedStories', storyId);
      
      // Optimistic update
      setSavedStories(prev => prev.filter(s => s.id !== storyId));
      
      // Background sync
      deleteDoc(storyRef).catch(err => {
        console.warn("Background story delete pending:", err);
      });
    }
  };

  const value = {
    currentUser,
    userData,
    savedStories,
    loading,
    updateReadingLevel,
    completeStory,
    saveStory,
    deleteStory
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

