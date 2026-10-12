import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, User, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfileSetupModal: React.FC = () => {
  const {
    profile,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateProfile,
  } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [purok, setPurok] = useState(profile?.purok || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setPurok(profile.purok || '');
    }
  }, [profile]);

  if (!isProfileModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Palihug isulod ang imong Kumpletong Ngalan (Full Name).');
      return;
    }
    if (!purok.trim()) {
      setErrorMsg('Palihug ibutang o i-type ang imong Purok o Sitio.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await updateProfile({
      display_name: displayName.trim(),
      purok: purok.trim(),
    });

    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#24282d]">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-[#eff9ff] border-b border-slate-200">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-[#3e474e] hover:text-[#24282d] bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <User className="w-5 h-5 text-[#62babc]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[#3e474e] bg-[#eff9ff] px-2 py-0.5 rounded border border-[#82dde1]">
              Player Identity
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#24282d]">
            I-kumpleto Imong Profile
          </h2>

          <p className="text-xs text-[#3e474e] mt-1 leading-relaxed">
            Palihug ibutang ang imong kumpletong ngalan ug purok aron mailhan ka sa Barangay Marangog!
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 bg-white">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#3e474e] mb-1">
                Kumpletong Ngalan (Full Name) <span className="text-[#62babc]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#62babc] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz, Pedro Penduko"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#eff9ff] focus:bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-[#24282d] placeholder:text-[#3e474e]/60 focus:outline-none focus:border-[#62babc] focus:ring-1 focus:ring-[#62babc] text-xs sm:text-sm"
                />
              </div>
              <span className="text-[10px] text-[#3e474e] mt-0.5 block">
                Tinuod nga ngalan ang gamiton, dili alias.
              </span>
            </div>

            {/* Purok / Sitio - Free User Input */}
            <div>
              <label className="block text-xs font-semibold text-[#3e474e] mb-1">
                Imong Purok o Sitio sa Marangog <span className="text-[#62babc]">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#62babc] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="I-type imong Purok o Sitio (e.g. Purok 1, Purok 3, Sitio Ilaya)"
                  value={purok}
                  onChange={(e) => setPurok(e.target.value)}
                  className="w-full bg-[#eff9ff] focus:bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-[#24282d] placeholder:text-[#3e474e]/60 focus:outline-none focus:border-[#62babc] focus:ring-1 focus:ring-[#62babc] text-xs sm:text-sm"
                />
              </div>
              <span className="text-[10px] text-[#3e474e] mt-0.5 block">
                I-type kung asa ka nga purok o sitio nagpuyo sa Barangay Marangog.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#62babc] hover:bg-[#52a6a8] text-white font-extrabold rounded-lg shadow-sm shadow-[#62babc]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  I-save ug Padayon sa Duwa
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
