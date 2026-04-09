import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Membre,
  MembreFormData,
  Pointage,
  Medicament,
  Consultation,
  Evenement,
  VieSociale,
  AuditLog,
  Notification,
  Alerte,
  Rapport,
  User,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from './index';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEYS = {
  MEMBRES: 'made_membres',
  POINTAGES: 'made_pointages',
  MEDICAMENTS: 'made_medicaments',
  CONSULTATIONS: 'made_consultations',
  EVENEMENTS: 'made_evenements',
  VIE_SOCIALE: 'made_vie_sociale',
  AUDIT_LOGS: 'made_audit_logs',
  NOTIFICATIONS: 'made_notifications',
  ALERTES: 'made_alertes',
  RAPPORTS: 'made_rapports',
  USER: 'made_user',
  SYNC_QUEUE: 'made_sync_queue',
};

interface SyncQueueItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

function getFromLocalStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erreur sauvegarde localStorage:', error);
  }
}

function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp'>): void {
  const queue = getFromLocalStorage<SyncQueueItem>(STORAGE_KEYS.SYNC_QUEUE);
  const newItem: SyncQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  queue.push(newItem);
  saveToLocalStorage(STORAGE_KEYS.SYNC_QUEUE, queue);
}

export async function syncOfflineData(): Promise<void> {
  if (!supabase) return;

  const queue = getFromLocalStorage<SyncQueueItem>(STORAGE_KEYS.SYNC_QUEUE);
  if (queue.length === 0) return;

  const processed: string[] = [];

  for (const item of queue) {
    try {
      if (item.operation === 'insert') {
        await supabase.from(item.table).insert(item.data);
      } else if (item.operation === 'update') {
        await supabase.from(item.table).update(item.data).eq('id', item.data.id);
      } else if (item.operation === 'delete') {
        await supabase.from(item.table).delete().eq('id', item.data.id);
      }
      processed.push(item.id);
    } catch (error) {
      console.error('Erreur sync item:', error);
    }
  }

  const remaining = queue.filter((item) => !processed.includes(item.id));
  saveToLocalStorage(STORAGE_KEYS.SYNC_QUEUE, remaining);
}

export async function signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          role: 'Super-PDG',
          created_at: data.user.created_at,
        };
        saveToLocalStorage(STORAGE_KEYS.USER, [user]);
        return { user, error: null };
      }
    } catch (error) {
      console.error('Erreur Supabase auth:', error);
    }
  }

  if (email === 'basedoner711@gmail.com' && password === 'made@711') {
    const user: User = {
      id: 'local-admin',
      email: 'basedoner711@gmail.com',
      role: 'Super-PDG',
      created_at: new Date().toISOString(),
    };
    saveToLocalStorage(STORAGE_KEYS.USER, [user]);
    return { user, error: null };
  }

  return { user: null, error: new Error('Identifiants invalides') };
}

export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export async function getCurrentUser(): Promise<User | null> {
  if (supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        return {
          id: data.user.id,
          email: data.user.email!,
          role: 'Super-PDG',
          created_at: data.user.created_at,
        };
      }
    } catch (error) {
      console.error('Erreur get user:', error);
    }
  }

  const users = getFromLocalStorage<User>(STORAGE_KEYS.USER);
  return users[0] || null;
}

export async function getMembers(): Promise<Membre[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('membres').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        saveToLocalStorage(STORAGE_KEYS.MEMBRES, data);
        return data;
      }
    } catch (error) {
      console.error('Erreur fetch membres:', error);
    }
  }

  return getFromLocalStorage<Membre>(STORAGE_KEYS.MEMBRES);
}

export async function getMemberById(id: string): Promise<Membre | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('membres').select('*').eq('id', id).single();
      if (!error && data) return data;
    } catch (error) {
      console.error('Erreur fetch membre:', error);
    }
  }

  const membres = getFromLocalStorage<Membre>(STORAGE_KEYS.MEMBRES);
  return membres.find((m) => m.id === id) || null;
}

export async function getMemberByBarcode(code: string): Promise<Membre | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('membres').select('*').eq('code_barre', code).single();
      if (!error && data) return data;
    } catch (error) {
      console.error('Erreur fetch membre par code:', error);
    }
  }

  const membres = getFromLocalStorage<Membre>(STORAGE_KEYS.MEMBRES);
  return membres.find((m) => m.code_barre === code) || null;
}

export async function addMembre(data: MembreFormData & { code_barre: string }): Promise<Membre | null> {
  const membre: Membre = {
    id: crypto.randomUUID(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data: inserted, error } = await supabase.from('membres').insert(membre).select().single();
      if (!error && inserted) {
        const membres = getFromLocalStorage<Membre>(STORAGE_KEYS.MEMBRES);
        saveToLocalStorage(STORAGE_KEYS.MEMBRES, [inserted, ...membres]);
        return inserted;
      }
    } catch (error) {
      console.error('Erreur insert membre:', error);
    }
  }

  const membres = getFromLocalStorage<Membre>(STORAGE_KEYS.MEMBRES);
  saveToLocalStorage(STORAGE_KEYS.MEMBRES, [membre, ...membres]);
  addToSyncQueue({ table: 'membres', operation: 'insert', data: membre });
  return membre;
}

export async function updateMembre(id: string, data: Partial<MembreFormData>): Promise<Membre | null> {
  const updateData = { ...data, updated_at: new Date().toISOString() };

  if (supabase) {
    try {
      const { data: updated, error } = await supabase.from('membres').update(updateData).eq('id', id).select().single();
      if (!error && updated) {
        const membres = getFromLocalStorage<Membre>(STORAGE_KEYS.MEMBRES);
        const index = membres.findIndex((m) => m.id === id);
        if (index !== -1) {
          membres[index] = updated;
          saveToLocalStorage(STORAGE_KEYS.MEMBRES, membres);
        }
        return updated;
      }
    } catch (error) {
      console.error('Erreur update membre:', error);
    }
  }

  const membres = getFromLocalStorage<Membre>(STORAGE_KEYS.MEMBRES);
  const index = membres.findIndex((m) => m.id === id);
  if (index !== -1) {
    membres[index] = { ...membres[index], ...updateData };
    saveToLocalStorage(STORAGE_KEYS.MEMBRES, membres);
    addToSyncQueue({ table: 'membres', operation: 'update', data: { id, ...updateData } });
    return membres[index];
  }

  return null;
}

export async function deleteMembre(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase.from('membres').delete().eq('id', id);
      if (!error) {
        const membres = getFromLocalStorage<Membre>(STORAGE_KEYS.MEMBRES);
        saveToLocalStorage(
          STORAGE_KEYS.MEMBRES,
          membres.filter((m) => m.id !== id)
        );
        return true;
      }
    } catch (error) {
      console.error('Erreur delete membre:', error);
    }
  }

  const membres = getFromLocalStorage<Membre>(STORAGE_KEYS.MEMBRES);
  saveToLocalStorage(
    STORAGE_KEYS.MEMBRES,
    membres.filter((m) => m.id !== id)
  );
  addToSyncQueue({ table: 'membres', operation: 'delete', data: { id } });
  return true;
}

export async function getPointages(filters?: { membre_id?: string; date_debut?: string; date_fin?: string }): Promise<Pointage[]> {
  if (supabase) {
    try {
      let query = supabase.from('pointages').select('*').order('date_heure', { ascending: false });

      if (filters?.membre_id) {
        query = query.eq('membre_id', filters.membre_id);
      }
      if (filters?.date_debut) {
        query = query.gte('date_heure', filters.date_debut);
      }
      if (filters?.date_fin) {
        query = query.lte('date_heure', filters.date_fin);
      }

      const { data, error } = await query;
      if (!error && data) {
        saveToLocalStorage(STORAGE_KEYS.POINTAGES, data);
        return data;
      }
    } catch (error) {
      console.error('Erreur fetch pointages:', error);
    }
  }

  let pointages = getFromLocalStorage<Pointage>(STORAGE_KEYS.POINTAGES);

  if (filters?.membre_id) {
    pointages = pointages.filter((p) => p.membre_id === filters.membre_id);
  }
  if (filters?.date_debut) {
    pointages = pointages.filter((p) => p.date_heure >= filters.date_debut!);
  }
  if (filters?.date_fin) {
    pointages = pointages.filter((p) => p.date_heure <= filters.date_fin!);
  }

  return pointages;
}

export async function addPointage(membre_id: string, type: 'Entrée' | 'Sortie', methode: 'Laser' | 'Manuel'): Promise<Pointage | null> {
  const pointage: Pointage = {
    id: crypto.randomUUID(),
    membre_id,
    date_heure: new Date().toISOString(),
    type,
    methode,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data: inserted, error } = await supabase.from('pointages').insert(pointage).select().single();
      if (!error && inserted) {
        const pointages = getFromLocalStorage<Pointage>(STORAGE_KEYS.POINTAGES);
        saveToLocalStorage(STORAGE_KEYS.POINTAGES, [inserted, ...pointages]);
        return inserted;
      }
    } catch (error) {
      console.error('Erreur insert pointage:', error);
    }
  }

  const pointages = getFromLocalStorage<Pointage>(STORAGE_KEYS.POINTAGES);
  saveToLocalStorage(STORAGE_KEYS.POINTAGES, [pointage, ...pointages]);
  addToSyncQueue({ table: 'pointages', operation: 'insert', data: pointage });
  return pointage;
}

export async function getMedicaments(): Promise<Medicament[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('medicaments').select('*').order('nom');
      if (!error && data) {
        saveToLocalStorage(STORAGE_KEYS.MEDICAMENTS, data);
        return data;
      }
    } catch (error) {
      console.error('Erreur fetch medicaments:', error);
    }
  }

  return getFromLocalStorage<Medicament>(STORAGE_KEYS.MEDICAMENTS);
}

export async function addMedicament(data: Omit<Medicament, 'id' | 'created_at' | 'updated_at'>): Promise<Medicament | null> {
  const medicament: Medicament = {
    id: crypto.randomUUID(),
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    try {
      const { data: inserted, error } = await supabase.from('medicaments').insert(medicament).select().single();
      if (!error && inserted) {
        const medicaments = getFromLocalStorage<Medicament>(STORAGE_KEYS.MEDICAMENTS);
        saveToLocalStorage(STORAGE_KEYS.MEDICAMENTS, [...medicaments, inserted]);
        return inserted;
      }
    } catch (error) {
      console.error('Erreur insert medicament:', error);
    }
  }

  const medicaments = getFromLocalStorage<Medicament>(STORAGE_KEYS.MEDICAMENTS);
  saveToLocalStorage(STORAGE_KEYS.MEDICAMENTS, [...medicaments, medicament]);
  addToSyncQueue({ table: 'medicaments', operation: 'insert', data: medicament });
  return medicament;
}

export async function updateMedicamentStock(id: string, stock_actuel: number): Promise<Medicament | null> {
  const updateData = { stock_actuel, updated_at: new Date().toISOString() };

  if (supabase) {
    try {
      const { data: updated, error } = await supabase.from('medicaments').update(updateData).eq('id', id).select().single();
      if (!error && updated) {
        const medicaments = getFromLocalStorage<Medicament>(STORAGE_KEYS.MEDICAMENTS);
        const index = medicaments.findIndex((m) => m.id === id);
        if (index !== -1) {
          medicaments[index] = updated;
          saveToLocalStorage(STORAGE_KEYS.MEDICAMENTS, medicaments);
        }
        return updated;
      }
    } catch (error) {
      console.error('Erreur update stock:', error);
    }
  }

  const medicaments = getFromLocalStorage<Medicament>(STORAGE_KEYS.MEDICAMENTS);
  const index = medicaments.findIndex((m) => m.id === id);
  if (index !== -1) {
    medicaments[index] = { ...medicaments[index], ...updateData };
    saveToLocalStorage(STORAGE_KEYS.MEDICAMENTS, medicaments);
    addToSyncQueue({ table: 'medicaments', operation: 'update', data: { id, ...updateData } });
    return medicaments[index];
  }

  return null;
}

export async function addAuditLog(auteur: string, action: string, details?: string): Promise<void> {
  const log: AuditLog = {
    id: crypto.randomUUID(),
    auteur,
    action,
    details,
    horodatage: new Date().toISOString(),
  };

  if (supabase) {
    try {
      await supabase.from('audit_logs').insert(log);
    } catch (error) {
      console.error('Erreur insert audit log:', error);
    }
  }

  const logs = getFromLocalStorage<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);
  saveToLocalStorage(STORAGE_KEYS.AUDIT_LOGS, [log, ...logs]);
  addToSyncQueue({ table: 'audit_logs', operation: 'insert', data: log });
}
