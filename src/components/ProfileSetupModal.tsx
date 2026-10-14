import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { X, User, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { isNbaName } from '../lib/nbaNameFilter';

export const ProfileSetupModal: React.FC = () => {
  const {
    profile,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateProfile,
  } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [purok, setPurok] = useState(profile?.purok || '');
  const [isGuest, setIsGuest] = useState(profile?.purok === 'Guest');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setPurok(profile.purok || '');
      setIsGuest(profile.purok === 'Guest');
    }
  }, [profile]);

  if (!isProfileModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Palihug isulod ang imong Kumpletong Ngalan (Full Name).');
      return;
    }
    if (isNbaName(displayName)) {
      setErrorMsg('Use your real full name');
      return;
    }
    if (!isGuest && !purok.trim()) {
      setErrorMsg('Palihug ibutang o i-type ang imong Purok o Sitio sa Marangog.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const finalPurok = isGuest ? 'Guest' : purok.trim();
    const res = await updateProfile({
      display_name: displayName.trim(),
      purok: finalPurok,
    });

    setLoading(false);
    if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-[390px] sm:max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="relative px-4 pt-4 pb-3 sm:px-6 sm:pt-5 sm:pb-4 bg-slate-50 border-b border-slate-200">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1 sm:p-1.5 rounded-full text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" />
            <span className="font-bold text-[10px] sm:text-xs uppercase tracking-wider text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Player Identity
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            I-kumpleto Imong Profile
          </h2>

          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
            Palihug ibutang ang imong kumpletong ngalan ug purok aron mailhan ka sa Barangay Marangog!
          </p>
        </div>

        {/* Form Body */}
        <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-4 bg-white overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 sm:p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-[11px] sm:text-xs text-rose-700">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                Kumpletong Ngalan (Full Name) <span className="text-[#F59E0B]">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] absolute left-2.5 top-2 sm:top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Juan Dela Cruz, Pedro Penduko"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-1.5 sm:py-2 pl-8 sm:pl-9 pr-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-xs sm:text-sm"
                />
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 block">
                Tinuod nga ngalan ang gamiton, dili alias.
              </span>
            </div>

            {/* Residence / Purok Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                  Residente / Lokasyon <span className="text-[#F59E0B]">*</span>
                </label>
              </div>

              {/* Options: Taga Marangog vs Guest */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsGuest(false);
                    if (purok === 'Guest') setPurok('');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[11px] sm:text-xs font-bold border transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                    !isGuest
                      ? 'bg-[#F59E0B] text-black border-[#F59E0B] shadow-2xs font-extrabold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>Taga Marangog</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsGuest(true);
                    setPurok('Guest');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[11px] sm:text-xs font-bold border transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                    isGuest
                      ? 'bg-[#06B6D4] text-black border-[#06B6D4] shadow-2xs font-extrabold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>Guest</span>
                </button>
              </div>

              {!isGuest ? (
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5 sm:mb-1">
                    Imong Purok o Sitio sa Marangog <span className="text-[#F59E0B]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F59E0B] absolute left-2.5 top-2 sm:top-2.5" />
                    <input
                      type="text"
                      required={!isGuest}
                      placeholder="I-type imong Purok o Sitio (e.g. Purok 1, Sitio Ilaya)"
                      value={purok}
                      onChange={(e) => setPurok(e.target.value)}
                      className="w-full bg-slate-50 focus:bg-white border border-slate-200 rounded-lg py-1.5 sm:py-2 pl-8 sm:pl-9 pr-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-xs sm:text-sm"
                    />
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 block">
                    I-type kung asa ka nga purok o sitio nagpuyo sa Barangay Marangog.
                  </span>
                </div>
              ) : (
                <div className="p-2 sm:p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-900 text-[11px] leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-cyan-950">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#06B6D4]" />
                    <span>Naka-select: Guest</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-cyan-800 mt-0.5">
                    Dili kinahanglan og purok. Makapadayon na ka isip guest player.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold rounded-lg shadow-sm shadow-[#F59E0B]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs sm:text-sm mt-1 sm:mt-2"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
