import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  displayName: string | null;
  email: string | null;
  uid: string | null;
}

interface SessionContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from AsyncStorage on mount
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Save user data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveUser = async () => {
      if (user) {
        try {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Error saving user data:', error);
        }
      } else {
        try {
          await AsyncStorage.removeItem('user');
        } catch (error) {
          console.error('Error removing user data:', error);
        }
      }
    };

    saveUser();
  }, [user]);

  return (
    <SessionContext.Provider value={{ user, setUser, loading }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext); 