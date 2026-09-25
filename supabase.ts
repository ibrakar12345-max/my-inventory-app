import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    flowType: 'implicit',
    storageKey: 'center-logistic-auth',
    storage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'center-logistic',
    },
  },
});

export type Item = {
  id: string;
  title: string;
  description: string;
  quantity: number;
  image_url: string;
  location: 'room' | 'warehouse';
  created_by_username: string;
  created_by_role: string;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  item_id: string;
  item_name: string;
  action: 'add' | 'edit' | 'delete' | 'decrease' | 'restore' | 'move';
  details: string;
  quantity_from: number | null;
  quantity_to: number | null;
  username: string;
  role: string;
  created_at: string;
};

export type UserRole = 'user' | 'admin';

export type AuthUser = {
  username: string;
  role: UserRole;
};
