import { useState } from 'react';
import { useApp, ADMIN_PASSWORD } from '@/context/AppContext';
import { Package, User, Shield, Lock, Eye, EyeOff, Globe, Moon, Sun } from 'lucide-react';

export default function LoginPage() {
  const { t, lang, setLang, theme, setTheme, login, addToast } = useApp();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError(t.login.errorUsername);
      return;
    }

    if (role === 'admin') {
      if (password !== ADMIN_PASSWORD) {
        setError(t.login.errorPassword);
        return;
      }
      login({ username: username.trim(), role: 'admin' });
      addToast(t.login.welcomeAdmin, 'success');
    } else {
      login({ username: username.trim(), role: 'user' });
      addToast(`${t.login.welcomeUser} ${username.trim()}`, 'success');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top bar with toggles */}
      <div className="flex justify-end gap-2 p-4">
        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium"
        >
          <Globe size={16} />
          {lang === 'ar' ? 'EN' : 'ع'}
        </button>
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      {/* Login card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 shadow-lg mb-4">
              <Package size={40} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {t.appName}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              {t.login.title}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-5"
          >
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.login.username}
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  style={lang === 'ar' ? { right: '12px' } : { left: '12px' }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.login.usernamePlaceholder}
                  className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 ${
                    lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'
                  } text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent`}
                />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {t.login.role}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm ${
                    role === 'user'
                      ? 'border-slate-700 dark:border-slate-500 bg-slate-700 dark:bg-slate-800 text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <User size={18} />
                  {t.login.regularUser}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm ${
                    role === 'admin'
                      ? 'border-slate-700 dark:border-slate-500 bg-slate-700 dark:bg-slate-800 text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Shield size={18} />
                  {t.login.admin}
                </button>
              </div>
            </div>

            {/* Password (admin only) */}
            {role === 'admin' && (
              <div className="modal-content">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.login.password}
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                    style={lang === 'ar' ? { right: '12px' } : { left: '12px' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.login.passwordPlaceholder}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 ${
                      lang === 'ar' ? 'pr-11 pl-11' : 'pl-11 pr-11'
                    } text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    style={lang === 'ar' ? { left: '12px' } : { right: '12px' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm py-2.5 px-4 rounded-lg border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {t.login.loginButton}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

