'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { getCurrentUser } from '@/lib/appwrite';

interface User {
  $id: string;
  username: string;
  email: string;
  phone: string;
  profilepicture: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      try {
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          
          const currentUser = await getCurrentUser();
          if (currentUser) {
            const userData: User = {
              $id: currentUser.$id,
              username: currentUser.name || 'DefaultUsername',
              email: currentUser.email,
              phone: currentUser.phone,
              profilepicture: 'default-profile-pic-url', 
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error('Failed to restore user session:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
