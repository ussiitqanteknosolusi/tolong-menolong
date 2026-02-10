'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, login as authLogin, logout as authLogout, getCurrentUser } from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth status on mount
    const session = getSession();
    if (session) {
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Protect admin routes
    if (!loading && pathname?.startsWith('/admin') && pathname !== '/admin/login') {
      const session = getSession();
      if (!session) {
        router.push('/admin/login');
      }
    }
  }, [pathname, loading, router]);

  const login = async (email, password) => {
    const result = authLogin(email, password);
    if (result.success) {
      setUser(result.user);
      router.push('/admin');
    }
    return result;
  };

  const logout = () => {
    authLogout();
    setUser(null);
    router.push('/admin/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
