import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, Lock, Mail, User, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { BasketballIcon } from './BasketballIcon';

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
  const [purok, setPurok] = useState('');
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
          setErrorMsg('Palihug ibutang ang imong Kumpletong Ngalan (Full Name).');
          setLoading(false);
          return;
        }
        if (!purok.trim()) {
          setErrorMsg('Palihug ibutang o i-type ang imong Purok o Sitio.');
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

        const res = await signUp(email, password, displayName, purok);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-[390px] sm:max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="relative px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4 bg-slate-50 border-b border-slate-200">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1 sm:p-1.5 rounded-full text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <BasketballIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" />
            <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Barangay Marangog • Hoops Pass
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {mode === 'signup' ? "Paghimo'g Account" : 'Sign in sa Imong Account'}
          </h2>

          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
            {authModalReason || "Kinahanglan og profile aron maka-comment, makapost, o maka-join sa duwa sa court."}
          </p>

          {/* Connection Status Banner (only shown if in offline demo mode) */}
          {!isSupabaseLive && (
            <div className="mt-2 p-2 sm:p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[10px] sm:text-[11px] leading-relaxed text-left flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Offline / Demo Mode:</span> Wala pa nakonektar sa Supabase database (walay <code className="bg-amber-100 px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-mono text-amber-950">.env</code>). Busa bisan unsa nga random credentials mag-simulate lang sa local storage.
              </div>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex p-0.5 sm:p-1 mt-2 sm:mt-2.5 bg-slate-100 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
              className={`flex-1 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign Up (Bag-ong Player)
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); }}
              className={`flex-1 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Log In (Naay Account)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-3.5 text-xs sm:text-sm bg-white">
          {errorMsg && (
            <div className="p-2.5 sm:p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-[11px] sm:text-xs text-rose-700">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            {mode === 'signup' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-0.5 sm:mb-1">
                    Kumpletong Ngalan (Full Name) <span className="text-[#F59E0B]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] absolute left-2.5 top-2 sm:top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Juan Dela Cruz"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-1.5 sm:py-2 pl-8 sm:pl-9 pr-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-xs sm:text-sm"
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 block">
                    Tinuod nga ngalan ang gamiton, dili alias.
                  </span>
                </div>

                {/* Purok / Sitio - Free User Input */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-0.5 sm:mb-1">
                    Imong Purok / Sitio sa Marangog <span className="text-[#F59E0B]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] absolute left-2.5 top-2 sm:top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="I-type imong Purok o Sitio (e.g. Purok 1, Sitio Ilaya)"
                      value={purok}
                      onChange={(e) => setPurok(e.target.value)}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-1.5 sm:py-2 pl-8 sm:pl-9 pr-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-xs sm:text-sm"
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 block">
                    I-type kung asa ka nga purok o sitio nagpuyo.
                  </span>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 mb-0.5 sm:mb-1">
                Email Address <span className="text-[#F59E0B]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] absolute left-2.5 top-2 sm:top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="imong.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-1.5 sm:py-2 pl-8 sm:pl-9 pr-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <label className="text-[11px] sm:text-xs font-semibold text-slate-600">
                  Password <span className="text-[#F59E0B]">*</span>
                </label>
                <span className="text-[9px] sm:text-[10px] text-slate-400">Min. 6 characters</span>
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] absolute left-2.5 top-2 sm:top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-1.5 sm:py-2 pl-8 sm:pl-9 pr-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 sm:mt-2 py-2 sm:py-2.5 px-3 sm:px-4 bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold rounded-lg shadow-sm shadow-[#F59E0B]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : mode === 'signup' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Create Account
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Log in to your Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
