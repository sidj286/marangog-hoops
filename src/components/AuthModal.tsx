import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, Lock, Mail, User, MapPin, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { POPULAR_PUROKS } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalReason,
    signUp,
    signIn,
    isSupabaseLive,
  } = useAuth();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [purok, setPurok] = useState('Purok 3');
  const [monicker, setMonicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setErrorMsg('Palihug ibutang ang imong Ngalan o Alias.');
          setLoading(false);
          return;
        }
        if (!purok.trim()) {
          setErrorMsg('Palihug ibutang ang imong Purok o Sitio.');
          setLoading(false);
          return;
        }
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Palihug kompletoha ang email ug password.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg('Ang password kinahanglan labing menus 6 ka characters.');
          setLoading(false);
          return;
        }

        const res = await signUp(email, password, displayName, purok, monicker);
        if (res.error) {
          setErrorMsg(res.error);
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMsg('Palihug isulod ang imong email ug password.');
          setLoading(false);
          return;
        }
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoUser = (emailPrefix: string) => {
    setMode('login');
    setEmail(`${emailPrefix}@marangog.ph`);
    setPassword('password123');
    signIn(`${emailPrefix}@marangog.ph`, 'password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 bg-gray-200/60 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">🏀</span>
            <span className="font-bold text-xs uppercase tracking-wider text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded border border-orange-200">
              Barangay Marangog • Hoops Pass
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'signup' ? "Paghimo'g Account" : 'Sulod sa Imong Account'}
          </h2>

          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {authModalReason || "Kinahanglan og profile aron makatubag, makapost, o maka-apil ('Mo-apil Ko') sa duwa sa court."}
          </p>

          {/* Mode Tabs */}
          <div className="flex p-1 mt-3 bg-gray-200/70 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up (Bag-ong Player)
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Log In (Naay Account)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm bg-white">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                {/* Display Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ngalan o Alias <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kobe Bryan, Junmar, Coach Dondon"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Purok / Sitio */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Imong Purok / Sitio sa Marangog <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative mb-2">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Purok 3, Sitio Ilaya, Riverside"
                      value={purok}
                      onChange={(e) => setPurok(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 text-xs sm:text-sm"
                    />
                  </div>
                  {/* Quick Purok Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_PUROKS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPurok(item)}
                        className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                          purok === item
                            ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monicker (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Alas / Monicker <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] text-gray-400">e.g. "The Hawk", "Sniper"</span>
                  </div>
                  <div className="relative">
                    <Sparkles className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. The Sniper, King of Court, Alas"
                      value={monicker}
                      onChange={(e) => setMonicker(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="imong.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Password <span className="text-orange-600">*</span>
                </label>
                <span className="text-[10px] text-gray-400">Min. 6 characters</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'signup' ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Kumpirmaha ug Apil sa Duwa 🏀
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sulod sa Board ⚡
                </>
              )}
            </button>
          </form>

          {/* Quick 1-tap testing accounts */}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-[11px] font-semibold text-gray-500 mb-2 flex items-center justify-between">
              <span>Paspas nga Test Accounts (1-Tap):</span>
              <span className="text-[10px] text-orange-600 font-medium">
                {isSupabaseLive ? 'Supabase Live' : 'Demo Mode'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoUser('kobe')}
                className="p-2 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group"
              >
                <div className="text-xs font-bold text-gray-900 group-hover:text-orange-600">Kobe Bryan</div>
                <div className="text-[10px] text-gray-500">Purok 3 • The Sniper</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoUser('junmar')}
                className="p-2 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group"
              >
                <div className="text-xs font-bold text-gray-900 group-hover:text-orange-600">Junmar Fajardo</div>
                <div className="text-[10px] text-gray-500">Sitio Ilaya • Kraken</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
