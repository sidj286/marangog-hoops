import React, { useState } from 'react';
import type { PostCategory } from '../types';
import { CATEGORIES, COMMON_COURTS } from '../types';
import { useAuth } from '../hooks/useAuth';
import { 
  X, 
  MapPin, 
  Send, 
  AlertCircle 
} from 'lucide-react';

interface CreatePostDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (data: {
    category: PostCategory;
    court_name: string;
    message: string;
    players_needed: number;
  }) => Promise<void>;
}

const PRESET_MESSAGES: Record<PostCategory, string[]> = {
  'Magduwa Hapon': [
    'Abot ta ninyo mga 4:30 PM! Dala lang mo ug bola ug tubig.',
    'Duwa ta unyang 5:00 PM! Ready na ang suga sa court.',
    'Conditioning duwa ta karong hapon, kinsay mangapil?'
  ],
  'Naa Nanulong': [
    'Naay grupo nanulong gikan silingang barangay! 5v5 pustaanay o dula-dula lang.',
    'Naay mga bisita sa court karon, kinahanglan tag lig-on nga lineup!',
    'Pustaanay 5v5 softdrinks, kinsa puyde mosukol?'
  ],
  'Need Player': [
    'Kulang 1 para 4v4 half-court! Duwa nata dayon.',
    'Kulang 2 players para makasugod na ta sa 5v5.',
    'Kulang tag shooter/big man, dula na ta!'
  ],
  'Manong sa Court': [
    'Kami daog 2 games straight. Team Ilaya sunod manong!',
    'Team Purok 3 manong karon. Sunod lineup pag-lista na.',
    'Hapsay ang rotation karon, 3 ka team nag-ilis-ilis.'
  ]
};

export const CreatePostDrawer: React.FC<CreatePostDrawerProps> = ({
  isOpen,
  onClose,
  onSubmitPost,
}) => {
  const { profile } = useAuth();
  const [category, setCategory] = useState<PostCategory>('Magduwa Hapon');
  const [courtName, setCourtName] = useState('Marangog Main Court');
  const [message, setMessage] = useState('');
  const [playersNeeded, setPlayersNeeded] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Palihug pagbutang ug mensahe o pahibalo kabahin sa duwa.');
      return;
    }
    if (message.length > 140) {
      setErrorMsg('Ang mensahe kinahanglan dili molapas sa 140 ka characters.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmitPost({
        category,
        court_name: courtName.trim() || 'Marangog Main Court',
        message: message.trim(),
        players_needed: category === 'Need Player' ? playersNeeded : 0,
      });
      setMessage('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sayop sa pag-post.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickPreset = (preset: string) => {
    setMessage(preset);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10">
        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-gray-50">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏀</span>
              <h3 className="text-base font-bold text-gray-900">
                I-post sa Marangog Board
              </h3>
            </div>
            <p className="text-[11px] text-gray-500">
              Isip <span className="text-orange-700 font-semibold">{profile?.display_name}</span> ({profile?.purok})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 bg-gray-200/60 hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 bg-white">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              1. Pilia ang Kategoriya
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CATEGORIES) as PostCategory[]).map((catKey) => {
                const info = CATEGORIES[catKey];
                const isSelected = category === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setCategory(catKey);
                      if (!message) {
                        setMessage(PRESET_MESSAGES[catKey][0]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex items-start gap-2 ${
                      isSelected
                        ? 'bg-orange-50 border-orange-500 text-orange-950 border-2 shadow-xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg shrink-0">{info.emoji}</span>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>
                        {info.label}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {info.sublabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. If 'Need Player', show quick selector */}
          {category === 'Need Player' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 animate-fade-in">
              <label className="block text-xs font-bold text-amber-900">
                Pila ka magduduwa ang kulang?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPlayersNeeded(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      playersNeeded === num
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    Kulang {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Court Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              2. Basketball Court
            </label>
            <div className="relative mb-2">
              <MapPin className="w-4 h-4 text-orange-600 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="Pangalan sa Court..."
                className="w-full bg-white border border-gray-300 rounded-lg py-2 pl-9 pr-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 text-xs sm:text-sm"
              />
            </div>
            {/* Quick Court Chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_COURTS.map((court) => (
                <button
                  key={court}
                  type="button"
                  onClick={() => setCourtName(court)}
                  className={`text-[10px] px-2.5 py-1 rounded-md border transition-all ${
                    courtName === court
                      ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {court}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Message / Note (<140 chars) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                3. Mensahe / Detalye
              </label>
              <span className={`text-[11px] font-mono font-bold ${
                message.length > 130 ? 'text-red-600' : 'text-gray-400'
              }`}>
                {message.length}/140
              </span>
            </div>

            <textarea
              required
              rows={3}
              maxLength={140}
              placeholder="Unsay sabot? Kanus-a sugdan? Dala bola? Pila kabuok ka team?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 text-xs sm:text-sm resize-none"
            />

            {/* Quick Preset Phrases */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] text-gray-500 font-semibold block">
                Paspas nga mga pulong (1-tap):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_MESSAGES[category].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickPreset(preset)}
                    className="text-[10px] text-left px-2 py-1 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors"
                  >
                    "{preset.slice(0, 32)}..."
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  I-post sa Marangog Board 🏀
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
