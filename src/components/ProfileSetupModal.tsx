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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-[#1E1E1E] border border-[#2D2D2D] rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[#F3F4F6]">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-[#171717] border-b border-[#2D2D2D]">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-[#9CA3AF] hover:text-[#F3F4F6] bg-[#262626] hover:bg-[#333333] border border-[#333333] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <User className="w-5 h-5 text-[#F59E0B]" />
            <span className="font-bold text-xs uppercase tracking-wider text-[#9CA3AF] bg-[#262626] px-2 py-0.5 rounded border border-[#333333]">
              Player Identity
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#F3F4F6]">
            I-kumpleto Imong Profile
          </h2>

          <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
            Palihug ibutang ang imong kumpletong ngalan ug purok aron mailhan ka sa Barangay Marangog!
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 bg-[#1E1E1E]">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
                Kumpletong Ngalan (Full Name) <span className="text-[#F59E0B]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#F59E0B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz, Pedro Penduko"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#262626] focus:bg-[#1E1E1E] border border-[#333333] rounded-lg py-2 pl-9 pr-3 text-[#F3F4F6] placeholder:text-[#9CA3AF]/60 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-xs sm:text-sm"
                />
              </div>
              <span className="text-[10px] text-[#9CA3AF] mt-0.5 block">
                Tinuod nga ngalan ang gamiton, dili alias.
              </span>
            </div>

            {/* Purok / Sitio - Free User Input */}
            <div>
              <label className="block text-xs font-semibold text-[#9CA3AF] mb-1">
                Imong Purok o Sitio sa Marangog <span className="text-[#F59E0B]">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#F59E0B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="I-type imong Purok o Sitio (e.g. Purok 1, Purok 3, Sitio Ilaya)"
                  value={purok}
                  onChange={(e) => setPurok(e.target.value)}
                  className="w-full bg-[#262626] focus:bg-[#1E1E1E] border border-[#333333] rounded-lg py-2 pl-9 pr-3 text-[#F3F4F6] placeholder:text-[#9CA3AF]/60 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-xs sm:text-sm"
                />
              </div>
              <span className="text-[10px] text-[#9CA3AF] mt-0.5 block">
                I-type kung asa ka nga purok o sitio nagpuyo sa Barangay Marangog.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold rounded-lg shadow-sm shadow-[#F59E0B]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
