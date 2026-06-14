import { createClient } from '@supabase/supabase-js';
import defaultCredentials from './supabase_credentials.json';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function isValidHttpUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Retrieve config from current environment or local override
export function getSupabaseConfig(): SupabaseConfig | null {
  const envUrl = (((import.meta as any).env?.VITE_SUPABASE_URL as string) || '').trim();
  const envKey = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '').trim();
  
  if (envUrl && envKey && isValidHttpUrl(envUrl)) {
    return { url: envUrl, anonKey: envKey };
  }
  
  try {
    const configStr = localStorage.getItem('inven_supabase_config');
    if (configStr) {
      const parsed = JSON.parse(configStr);
      if (parsed.url && parsed.anonKey) {
        const u = parsed.url.trim();
        const k = parsed.anonKey.trim();
        if (u && k && isValidHttpUrl(u)) {
          return { url: u, anonKey: k };
        }
      }
    }
  } catch (err) {
    console.error('Error parsing local Supabase credentials:', err);
  }

  // Fallback to project-wide credentials file
  if (defaultCredentials && defaultCredentials.url && defaultCredentials.anonKey) {
    const u = defaultCredentials.url.trim();
    const k = defaultCredentials.anonKey.trim();
    if (u && k && isValidHttpUrl(u)) {
      return { url: u, anonKey: k };
    }
  }
  
  return null;
}

// Store credentials in localized localStorage config
export function saveSupabaseConfig(config: SupabaseConfig | null) {
  if (config) {
    localStorage.setItem('inven_supabase_config', JSON.stringify(config));
  } else {
    localStorage.removeItem('inven_supabase_config');
  }
}

let cachedClient: any = null;

// Lazy client generation with auto-reload if URL shifts
export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  
  try {
    if (!cachedClient || cachedClient.supabaseUrl !== config.url) {
      cachedClient = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    }
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}
