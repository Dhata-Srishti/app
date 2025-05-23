import React, { createContext, useContext, useState } from 'react';

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
  const [user, setUser] = useState<User | null>({
    displayName: 'User',
    email: 'user@example.com'
  });

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return;

    try {
      // For now, just update local state
      // In the future, you can add backend API calls here
      setUser(prev => prev ? { ...prev, ...data } : null);
      console.log('User profile updated:', data);
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