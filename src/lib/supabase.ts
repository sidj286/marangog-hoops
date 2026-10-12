import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'marangog_supabase_url';
const STORAGE_KEY_ANON = 'marangog_supabase_anon';

// Check if user set custom credentials in browser, otherwise fallback to Vite env
export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) : null;
  const localAnon = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) : null;

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const url = (localUrl || envUrl || '').trim();
  const anonKey = (localAnon || envAnon || '').trim();

  // Valid if starts with https:// and anon key is not the placeholder text
  const isConfigured = 
    Boolean(url) && 
    Boolean(anonKey) && 
    url.startsWith('https://') && 
    !url.includes('your-project') &&
    !anonKey.includes('your-anon');

  return { url, anonKey, isConfigured };
}

const { url, anonKey, isConfigured } = getSupabaseCredentials();

// Dummy fallback URL for client initialization if unconfigured (prevents crash on load)
const clientUrl = isConfigured ? url : 'https://dummy-marangog-project.supabase.co';
const clientAnon = isConfigured ? anonKey : 'dummy-anon-key-marangog-hoops';

export const supabase: SupabaseClient = createClient(clientUrl, clientAnon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export function saveCustomSupabaseConfig(newUrl: string, newAnonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_URL, newUrl.trim());
    localStorage.setItem(STORAGE_KEY_ANON, newAnonKey.trim());
    window.location.reload();
  }
}

export function clearCustomSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    window.location.reload();
  }
}
