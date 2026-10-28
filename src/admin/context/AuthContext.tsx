import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_BASE_PATH } from '../config';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editeur';
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('admin_token');
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState<boolean>(false);

  const navigate = useNavigate();
  const lastActivityRef = useRef<number>(Date.now());

  // Function to perform logout
  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      setToken(null);
      setUser(null);
      setShowInactivityWarning(false);
      navigate(`${ADMIN_BASE_PATH}/login`);
    }
  }, [token, navigate]);

  // Activity tracking for auto-logout (30 min timeout, warning at 28 min)
  useEffect(() => {
    if (!token) return;

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      if (showInactivityWarning) setShowInactivityWarning(false);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    const checkInterval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const warningLimit = 28 * 60 * 1000; // 28 minutes
      const logoutLimit = 30 * 60 * 1000; // 30 minutes

      if (elapsed >= logoutLimit) {
        logout();
      } else if (elapsed >= warningLimit && !showInactivityWarning) {
        setShowInactivityWarning(true);
      }
    }, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
      clearInterval(checkInterval);
    };
  }, [token, showInactivityWarning, logout]);

  // Initial token verification
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('admin_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser({
            id: data.user.userId,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
          });
          setToken(storedToken);
        } else {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          setToken(null);
          setUser(null);
        }
      } catch {
        // Fallback to stored user if offline or network hiccup
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Response is HTML or non-JSON (e.g. 404/502 from proxy or hosting)
      }

      if (!res.ok) {
        if (res.status === 404) {
          return { success: false, error: "L'endpoint API d'authentification est indisponible (erreur 404). Vérifiez le routage Vercel." };
        }
        if (res.status >= 500) {
          return {
            success: false,
            error: data?.error || `Erreur serveur (HTTP ${res.status}). Le service d'authentification ou la base de données est momentanément indisponible.`,
          };
        }
        return { success: false, error: data?.error || 'Identifiant ou mot de passe incorrect.' };
      }

      if (!data?.token || !data?.user) {
        return { success: false, error: 'Réponse du serveur incomplète.' };
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      lastActivityRef.current = Date.now();
      return { success: true };
    } catch {
      return { success: false, error: 'Impossible de contacter le serveur. Vérifiez votre connexion.' };
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}

      {/* Inactivity Warning Dialog */}
      {showInactivityWarning && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl border border-[#E6B325]">
            <h3 className="text-base font-bold text-[#1B2A5E] mb-2">
              Avertissement d'inactivité
            </h3>
            <p className="text-xs text-[#4A4A4A] leading-relaxed mb-4">
              Votre session administrateur expire dans moins de 2 minutes pour des raisons de sécurité. Effectuez une action ou cliquez ci-dessous pour rester connecté.
            </p>
            <button
              type="button"
              onClick={() => {
                lastActivityRef.current = Date.now();
                setShowInactivityWarning(false);
              }}
              className="w-full py-2 bg-[#1B2A5E] text-white text-xs font-bold rounded hover:bg-[#131F45]"
            >
              Prolonger ma session
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
