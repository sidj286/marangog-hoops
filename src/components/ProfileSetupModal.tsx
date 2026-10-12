import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, User, MapPin, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { POPULAR_PUROKS } from '../types';

export const ProfileSetupModal: React.FC = () => {
  const {
    profile,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateProfile,
  } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [purok, setPurok] = useState(profile?.purok || 'Purok 3');
  const [monicker, setMonicker] = useState(profile?.monicker || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setPurok(profile.purok || 'Purok 3');
      setMonicker(profile.monicker || '');
    }
  }, [profile]);

  if (!isProfileModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Palihug isulod ang imong Ngalan o Alias.');
      return;
    }
    if (!purok.trim()) {
      setErrorMsg('Palihug ibutang ang imong Purok o Sitio.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await updateProfile({
      display_name: displayName.trim(),
      purok: purok.trim(),
      monicker: monicker.trim() || undefined,
    });

    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 bg-gray-200/60 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">🏀</span>
            <span className="font-bold text-xs uppercase tracking-wider text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded border border-orange-200">
              Player Identity
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-900">
            I-kumpleto Imong Profile
          </h2>

          <p className="text-xs text-gray-500 mt-1">
            Aron mailhan ka sa mga kumpas ug kaduwa sa Barangay Marangog!
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 bg-white">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="e.g. Kobe Bryan, Dondon, Junmar"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Purok / Sitio */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Purok o Sitio sa Marangog <span className="text-orange-600">*</span>
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

              {/* Quick suggestion pills */}
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

            {/* Monicker */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">
                  Monicker / Alas <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] text-gray-400">e.g. "The Flash", "Sniper"</span>
              </div>
              <div className="relative">
                <Sparkles className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Sniper, Spark, Alas sa Court"
                  value={monicker}
                  onChange={(e) => setMonicker(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 text-xs sm:text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  I-save ug Padayon sa Duwa 🏀
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
