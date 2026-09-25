import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type Lang, translations, type TranslationKey } from '@/lib/i18n';
import { type AuthUser } from '@/lib/supabase';

type Theme = 'light' | 'dark';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
};

type AppContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TranslationKey;
  dir: 'rtl' | 'ltr';
  theme: Theme;
  setTheme: (theme: Theme) => void;
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

const ADMIN_PASSWORD = 'logistic admin 100%';

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('cl-lang');
    return (saved as Lang) || 'ar';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('cl-theme');
    return (saved as Theme) || 'light';
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('cl-user');
    return saved ? JSON.parse(saved) : null;
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const t = translations[lang];

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('cl-lang', l);
  }, []);

  const setTheme = useCallback((th: Theme) => {
    setThemeState(th);
    localStorage.setItem('cl-theme', th);
  }, []);

  const login = useCallback((u: AuthUser) => {
    setUser(u);
    localStorage.setItem('cl-user', JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cl-user');
  }, []);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        dir,
        theme,
        setTheme,
        user,
        login,
        logout,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { ADMIN_PASSWORD };
