// Simple auth store using localStorage
// In production, use proper JWT/session-based auth

const AUTH_KEY = 'berbagipath_admin_auth';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

// Demo admin credentials
const ADMIN_CREDENTIALS = [
  { email: 'admin@berbagipath.com', password: 'admin123', name: 'Admin Utama', role: 'admin' },
  { email: 'staff@berbagipath.com', password: 'staff123', name: 'Staff', role: 'staff' },
];

export function login(email, password) {
  const user = ADMIN_CREDENTIALS.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return { success: false, error: 'Email atau password salah' };
  }

  const session = {
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
    expiresAt: Date.now() + SESSION_DURATION,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  }

  return { success: true, user: session.user };
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function getSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored);

    // Check if session expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getSession() !== null;
}

export function getCurrentUser() {
  const session = getSession();
  return session?.user || null;
}
