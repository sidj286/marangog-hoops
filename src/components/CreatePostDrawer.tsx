import React, { useState } from 'react';
import type { PostCategory } from '../types';
import { CATEGORIES } from '../types';
import { useAuth } from '../hooks/useAuth';
import { CategoryIcon } from './CategoryIcon';
import { BasketballIcon } from './BasketballIcon';
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
  const [courtName, setCourtName] = useState('');
  const [message, setMessage] = useState('');
  const [playersNeeded, setPlayersNeeded] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtName.trim()) {
      setErrorMsg('Palihug ibutang o i-type ang pangalan sa basketball court.');
      return;
    }
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
        court_name: courtName.trim(),
        message: message.trim(),
        players_needed: category === 'Need Player' ? playersNeeded : 0,
      });
      setMessage('');
      setCourtName('');
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10 text-[#24282d]">
        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-[#eff9ff] border-b border-slate-200">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-[#eff9ff] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BasketballIcon className="w-5 h-5 text-[#62babc]" />
              <h3 className="text-base font-bold text-[#24282d]">
                I-post sa Marangog Board
              </h3>
            </div>
            <p className="text-[11px] text-[#3e474e]">
              Isip <span className="text-[#62babc] font-semibold">{profile?.display_name}</span> ({profile?.purok})
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#3e474e] hover:text-[#24282d] bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 bg-white">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3e474e] mb-2">
              1. Pilia ang Kategoriya
            </label>
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
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
                    className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#eff9ff] border-[#62babc] text-[#62babc] border-2 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-[#3e474e] hover:bg-[#eff9ff]'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <CategoryIcon category={catKey} className={`w-4 h-4 ${isSelected ? 'text-[#62babc]' : 'text-slate-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#24282d]' : 'text-[#3e474e]'}`}>
                        {info.label}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-[#62babc]' : 'text-slate-500'}`}>
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
            <div className="p-3 bg-[#eff9ff] border border-[#82dde1] rounded-xl space-y-1.5 animate-fade-in">
              <label className="block text-xs font-bold text-[#24282d]">
                Pila ka magduduwa ang kulang?
              </label>
              <div className="flex gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPlayersNeeded(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all text-center ${
                      playersNeeded === num
                        ? 'bg-[#62babc] text-white font-black border-[#62babc]'
                        : 'bg-white border-slate-200 text-[#3e474e] hover:bg-slate-100'
                    }`}
                  >
                    <span className="hidden min-[380px]:inline">Kulang </span>{num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Basketball Court (Free User Input, No Auto-Suggest) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3e474e] mb-1.5">
              2. Basketball Court <span className="text-[#62babc]">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#62babc] absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                placeholder="I-type ang Pangalan sa Court (e.g. Marangog Main Court)"
                className="w-full bg-[#eff9ff] focus:bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-[#24282d] placeholder:text-[#3e474e]/60 focus:outline-none focus:border-[#62babc] focus:ring-1 focus:ring-[#62babc] text-xs sm:text-sm"
              />
            </div>
            <span className="text-[10px] text-[#3e474e] mt-1 block">
              I-type kung asa nga basketball court mag-abot o moduwa.
            </span>
          </div>

          {/* 3. Message / Note (<140 chars) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#3e474e]">
                3. Mensahe / Detalye
              </label>
              <span className={`text-[11px] font-mono font-bold ${
                message.length > 130 ? 'text-rose-500' : 'text-slate-400'
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
              className="w-full bg-[#eff9ff] focus:bg-white border border-slate-200 rounded-lg p-3 text-[#24282d] placeholder:text-[#3e474e]/60 focus:outline-none focus:border-[#62babc] focus:ring-1 focus:ring-[#62babc] text-xs sm:text-sm resize-none"
            />

            {/* Quick Preset Phrases */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] text-[#3e474e] font-semibold block">
                Paspas nga mga pulong (1-tap):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_MESSAGES[category].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickPreset(preset)}
                    className="text-[10px] text-left px-2 py-1 rounded-md bg-[#eff9ff] hover:bg-[#82dde1]/30 text-[#3e474e] hover:text-[#24282d] border border-slate-200 transition-colors"
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
              disabled={submitting || !courtName.trim() || !message.trim()}
              className="w-full py-3 px-4 bg-[#62babc] hover:bg-[#52a6a8] disabled:opacity-50 text-white font-extrabold rounded-lg shadow-sm shadow-[#62babc]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  I-post sa Marangog Board
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
