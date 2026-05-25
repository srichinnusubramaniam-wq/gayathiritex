import { getSupabaseClient } from './supabase';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'not-configured';

// Listeners tracking sync state shifts
type StatusListener = (status: SyncStatus, lastSyncTime?: string, errorMessage?: string) => void;
const listeners = new Set<StatusListener>();

let currentStatus: SyncStatus = 'idle';
let lastSyncedAt: string = '';
let lastError: string = '';

export function subscribeToSyncStatus(listener: StatusListener) {
  listeners.add(listener);
  listener(currentStatus, lastSyncedAt, lastError);
  return () => {
    listeners.delete(listener);
  };
}

function updateStatus(status: SyncStatus, errorMessage = '') {
  currentStatus = status;
  if (status === 'synced') {
    lastSyncedAt = new Date().toLocaleTimeString();
    lastError = '';
  } else if (status === 'error') {
    lastError = errorMessage;
  }
  listeners.forEach(l => l(currentStatus, lastSyncedAt, lastError));
}

// Check if a localStorage key should be synchronized
export function isSyncableKey(key: string): boolean {
  return key.startsWith('inven_') && 
         key !== 'inven_supabase_config' && 
         key !== 'inven_sound_muted';
}

// Upload a single key's value to the inven_sync table
export async function pushKeyToSupabase(key: string, rawValue: string | null) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    updateStatus('not-configured');
    return;
  }

  // Optimize: skip empty/untracked keys
  if (!isSyncableKey(key)) return;

  try {
    updateStatus('syncing');

    if (rawValue === null) {
      // Key was deleted or cleared
      const { error } = await supabase
        .from('inven_sync')
        .delete()
        .eq('key', key);

      if (error) throw error;
    } else {
      // Upsert record containing JSON payload
      let parsedValue;
      try {
        parsedValue = JSON.parse(rawValue);
      } catch {
        parsedValue = rawValue; // Fallback to raw string
      }

      const { error } = await supabase
        .from('inven_sync')
        .upsert({ 
          key: key, 
          value: parsedValue, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'key' });

      if (error) throw error;
    }

    updateStatus('synced');
  } catch (err: any) {
    console.error(`Supabase persistence error for key "${key}":`, err);
    updateStatus('error', err?.message || 'Database connection or schema mismatch');
  }
}

// LocalStorage write interception helper
let isSyncInProgress = false;

// Up-sync: Overwrite Supabase content with current LocalStorage values
export async function syncAllToSupabase(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    updateStatus('syncing');
    
    // Collect all matching keys
    const entries: { key: string; value: any; updated_at: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && isSyncableKey(key)) {
        const val = localStorage.getItem(key);
        if (val !== null) {
          let parsed;
          try {
            parsed = JSON.parse(val);
          } catch {
            parsed = val;
          }
          entries.push({
            key,
            value: parsed,
            updated_at: new Date().toISOString()
          });
        }
      }
    }

    if (entries.length === 0) {
      updateStatus('synced');
      return { success: true, message: 'No local files are present to be pushed.' };
    }

    // Push each entry to ensure stability, collecting keys that fail to prevent blocking other tables
    const failedKeys: { key: string; error: any }[] = [];
    let successCount = 0;

    for (const entry of entries) {
      try {
        const { error } = await supabase
          .from('inven_sync')
          .upsert(entry, { onConflict: 'key' });
        
        if (error) {
          console.error(`Failed to push key "${entry.key}":`, error);
          failedKeys.push({ key: entry.key, error });
        } else {
          successCount++;
        }
      } catch (err: any) {
        console.error(`Exception pushing key "${entry.key}":`, err);
        failedKeys.push({ key: entry.key, error: err });
      }
    }

    if (failedKeys.length > 0) {
      const errorMsg = failedKeys.map(fk => `"${fk.key}" (${fk.error?.message || fk.error})`).join(', ');
      // If we pushed at least some keys successfully, return partial success to the user
      if (successCount > 0) {
        updateStatus('error', `Partial sync success. Failed to unpack: ${errorMsg}`);
        return { 
          success: true, 
          message: `Synchronized ${successCount} collections successfully. However, ${failedKeys.length} collection(s) failed unpacking: ${errorMsg}. Please ensure you ran the ALIGNMENT/UPGRADE SQL code in the Supabase SQL editor to create all tables and align columns!` 
        };
      } else {
        updateStatus('error', `Sync failed on all tables: ${errorMsg}`);
        return { 
          success: false, 
          message: `Failed to sync database collections: ${errorMsg}. Please verify database triggers and schemas.` 
        };
      }
    }

    updateStatus('synced');
    return { success: true, message: `Successfully synchronized all ${entries.length} collections to Supabase.` };
  } catch (err: any) {
    console.error('Up-Sync Failed:', err);
    const msg = err?.message || 'Schema or policy violation';
    updateStatus('error', msg);
    return { success: false, message: msg };
  }
}

// Down-sync: Pulled from Supabase. Clears local and updates safely
export async function syncAllFromSupabase(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    updateStatus('syncing');
    
    const { data, error } = await supabase
      .from('inven_sync')
      .select('key, value');

    if (error) throw error;

    if (!data || data.length === 0) {
      updateStatus('synced');
      return { success: true, message: 'Supabase database is currently empty.' };
    }

    isSyncInProgress = true;
    
    // Clear matches to avoid overlap
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && isSyncableKey(key)) {
        localStorage.removeItem(key);
      }
    }

    // Populate retrieved rows
    data.forEach((row: any) => {
      const valueStr = typeof row.value === 'object' ? JSON.stringify(row.value) : row.value;
      localStorage.setItem(row.key, valueStr);
    });

    isSyncInProgress = false;
    updateStatus('synced');

    // Fire cross-app reload notification
    window.dispatchEvent(new Event('inven_localstorage_sync'));
    
    return { success: true, message: `Successfully loaded ${data.length} collections from Supabase.` };
  } catch (err: any) {
    console.error('Down-Sync Failed:', err);
    const msg = err?.message || 'Verification failed';
    updateStatus('error', msg);
    return { success: false, message: msg };
  }
}

// Force Trigger Repair & Unpacking (Fires triggers to unpack JSON sync table records to sub-tables)
export async function forceTriggerUnpack(): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase client is not configured.' };
  }

  try {
    updateStatus('syncing');

    // 1. Fetch all existing sync keys
    const { data, error: fetchError } = await supabase
      .from('inven_sync')
      .select('key, value');

    if (fetchError) throw fetchError;

    if (!data || data.length === 0) {
      updateStatus('synced');
      return { success: true, message: 'Supabase sync table is currently empty. Push storage first.' };
    }

    // 2. Perform redundant updates matching JSON payload, catching failures individually
    const failedKeys: { key: string; error: any }[] = [];
    let successCount = 0;

    for (const row of data) {
      try {
        const { error: updateError } = await supabase
          .from('inven_sync')
          .update({ updated_at: new Date().toISOString() })
          .eq('key', row.key);

        if (updateError) {
          failedKeys.push({ key: row.key, error: updateError });
        } else {
          successCount++;
        }
      } catch (err: any) {
        failedKeys.push({ key: row.key, error: err });
      }
    }

    if (failedKeys.length > 0) {
      const errorMsg = failedKeys.map(fk => `"${fk.key}" (${fk.error?.message || fk.error})`).join(', ');
      if (successCount > 0) {
        updateStatus('error', `Partial pack success. Failed: ${errorMsg}`);
        return { 
          success: true, 
          message: `Relational unpack triggered for ${successCount} tables. However, ${failedKeys.length} table(s) failed: ${errorMsg}. Make sure you executed the ALIGNMENT/UPGRADE SQL statement in your Supabase SQL editor!` 
        };
      } else {
        updateStatus('error', `Failed to unpack all tables: ${errorMsg}`);
        return { 
          success: false, 
          message: `Failed to unpack any table database schemas: ${errorMsg}` 
        };
      }
    }

    updateStatus('synced');
    return { success: true, message: `Successfully triggered database unpacking for all ${data.length} collections! Check your relational tables.` };
  } catch (err: any) {
    console.error('Trigger Unpacking Failed:', err);
    const msg = err?.message || 'Failed to trigger relational triggers';
    updateStatus('error', msg);
    return { success: false, message: msg };
  }
}

// Bootstrapper: Globally intercepts Storage manipulation
export function initializeSupabaseInterceptor() {
  const OriginalSetItem = Storage.prototype.setItem;
  const OriginalRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.setItem = function(key: string, value: string) {
    OriginalSetItem.apply(this, [key, value]);
    if (!isSyncInProgress && isSyncableKey(key)) {
      // Push asynchronously to avoid locking threads
      pushKeyToSupabase(key, value);
    }
  };

  Storage.prototype.removeItem = function(key: string) {
    OriginalRemoveItem.apply(this, [key]);
    if (!isSyncInProgress && isSyncableKey(key)) {
      pushKeyToSupabase(key, null);
    }
  };

  // Run initial pull asynchronously in the background on startup
  setTimeout(() => {
    syncAllFromSupabase().catch(err => {
      console.warn('Initial background Supabase restore/sync failed or not configured:', err);
    });
  }, 300);
}
