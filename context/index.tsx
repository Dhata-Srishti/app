import React, { createContext, useContext, useState } from 'react';
import { dbUtils } from '../firebaseConfig';

interface User {
  displayName: string;
  email: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SessionContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  setUser: () => {},
  updateUserProfile: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      // Update user data in Firestore
      await dbUtils.updateUser(user.displayName, data);
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  return (
    <SessionContext.Provider value={{ user, setUser, updateUserProfile }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext); 