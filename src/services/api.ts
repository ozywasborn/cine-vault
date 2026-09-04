import { GearItem, MaintenanceRecord, ShootProject, AuditLog, AppNotification, CloudBridgeConfig, UserAccount } from '../types';
import { INITIAL_GEAR, INITIAL_MAINTENANCE, INITIAL_PROJECTS, INITIAL_AUDIT_LOGS, INITIAL_NOTIFICATIONS, INITIAL_CLOUD_BRIDGE } from '../data/mockData';

const LOCAL_STORAGE_KEY_GEAR = 'cinevault_gear_data';
const LOCAL_STORAGE_KEY_MAINT = 'cinevault_maint_data';
const LOCAL_STORAGE_KEY_AUDIT = 'cinevault_audit_data';
const LOCAL_STORAGE_KEY_NOTIFS = 'cinevault_notifs_data';
const LOCAL_STORAGE_KEY_OFFLINE_QUEUE = 'cinevault_offline_queue';

export interface OfflineAction {
  id: string;
  timestamp: string;
  type: 'CHECKOUT' | 'CHECKIN' | 'BATCH_CHECKOUT' | 'MAINTENANCE' | 'CREATE_GEAR' | 'UPDATE_GEAR';
  payload: any;
}

// Helpers for offline storage
export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineAction[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (err) {
    console.warn('Failed to save offline queue', err);
  }
}

export function enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
  const queue = getOfflineQueue();
  const item: OfflineAction = {
    ...action,
    id: `offline-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
  };
  queue.push(item);
  saveOfflineQueue(queue);
  return item;
}

export function clearOfflineQueue() {
  saveOfflineQueue([]);
}

// Local cache fallbacks
export function getCachedGear(): GearItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_GEAR);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_GEAR;
}

export function saveCachedGear(gear: GearItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_GEAR, JSON.stringify(gear));
  } catch {}
}

export function getCachedMaintenance(): MaintenanceRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_MAINT);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_MAINTENANCE;
}

export function saveCachedMaintenance(records: MaintenanceRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_MAINT, JSON.stringify(records));
  } catch {}
}

export function getCachedAudit(): AuditLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_AUDIT);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_AUDIT_LOGS;
}

export function saveCachedAudit(logs: AuditLog[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_AUDIT, JSON.stringify(logs));
  } catch {}
}

export function getCachedNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_NOTIFICATIONS;
}

export function saveCachedNotifications(notifs: AppNotification[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFS, JSON.stringify(notifs));
  } catch {}
}

// Unified API Client
export const api = {
  async fetchGear(): Promise<GearItem[]> {
    try {
      const res = await fetch('/api/gear');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      saveCachedGear(data);
      return data;
    } catch {
      return getCachedGear();
    }
  },

  async fetchMaintenance(): Promise<MaintenanceRecord[]> {
    try {
      const res = await fetch('/api/maintenance');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      saveCachedMaintenance(data);
      return data;
    } catch {
      return getCachedMaintenance();
    }
  },

  async fetchProjects(): Promise<ShootProject[]> {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('API fetch failed');
      return await res.json();
    } catch {
      return INITIAL_PROJECTS;
    }
  },

  async fetchAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await fetch('/api/audit');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      saveCachedAudit(data);
      return data;
    } catch {
      return getCachedAudit();
    }
  },

  async fetchNotifications(): Promise<AppNotification[]> {
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('API fetch failed');
      const data = await res.json();
      saveCachedNotifications(data);
      return data;
    } catch {
      return getCachedNotifications();
    }
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    } catch {}
  },

  async checkoutGear(
    id: string,
    payload: {
      projectName: string;
      shootLocation: string;
      expectedReturnDate: string;
      notes?: string;
      assigneeName?: string;
      assigneeEmail?: string;
      currentUser: UserAccount;
    }
  ): Promise<{ gear: GearItem }> {
    try {
      const res = await fetch(`/api/gear/${id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Checkout API request failed');
      return await res.json();
    } catch (err) {
      // Offline fallback
      enqueueOfflineAction({ type: 'CHECKOUT', payload: { id, ...payload } });
      const currentGear = getCachedGear();
      const idx = currentGear.findIndex((g) => g.id === id);
      if (idx !== -1) {
        currentGear[idx].status = 'Checked Out';
        currentGear[idx].currentCheckout = {
          id: `chk-offline-${Date.now()}`,
          gearId: id,
          gearName: currentGear[idx].name,
          assetTag: currentGear[idx].assetTag,
          userId: payload.currentUser.id,
          userName: payload.assigneeName || payload.currentUser.name,
          userEmail: payload.assigneeEmail || payload.currentUser.email,
          projectName: payload.projectName,
          shootLocation: payload.shootLocation,
          checkoutDate: new Date().toISOString(),
          expectedReturnDate: payload.expectedReturnDate,
          status: 'Active',
          notes: payload.notes,
          conditionOnCheckout: currentGear[idx].condition,
        };
        saveCachedGear(currentGear);
        return { gear: currentGear[idx] };
      }
      throw err;
    }
  },

  async checkinGear(
    id: string,
    payload: {
      conditionOnReturn?: any;
      returnNotes?: string;
      location?: string;
      currentUser: UserAccount;
    }
  ): Promise<{ gear: GearItem }> {
    try {
      const res = await fetch(`/api/gear/${id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Checkin API request failed');
      return await res.json();
    } catch (err) {
      enqueueOfflineAction({ type: 'CHECKIN', payload: { id, ...payload } });
      const currentGear = getCachedGear();
      const idx = currentGear.findIndex((g) => g.id === id);
      if (idx !== -1) {
        currentGear[idx].status =
          payload.conditionOnReturn === 'Needs Attention' || payload.conditionOnReturn === 'Damaged'
            ? 'In Maintenance'
            : 'Available';
        if (payload.conditionOnReturn) currentGear[idx].condition = payload.conditionOnReturn;
        if (payload.location) currentGear[idx].location = payload.location;
        currentGear[idx].currentCheckout = undefined;
        saveCachedGear(currentGear);
        return { gear: currentGear[idx] };
      }
      throw err;
    }
  },

  async batchCheckout(payload: {
    gearIds: string[];
    projectName: string;
    shootLocation: string;
    expectedReturnDate: string;
    assigneeName: string;
    assigneeEmail: string;
    currentUser: UserAccount;
  }): Promise<{ updatedCount: number }> {
    try {
      const res = await fetch('/api/gear/batch-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Batch checkout failed');
      return await res.json();
    } catch (err) {
      enqueueOfflineAction({ type: 'BATCH_CHECKOUT', payload });
      const cached = getCachedGear();
      payload.gearIds.forEach((id) => {
        const item = cached.find((g) => g.id === id);
        if (item) {
          item.status = 'Checked Out';
          item.currentCheckout = {
            id: `chk-offline-${Date.now()}`,
            gearId: item.id,
            gearName: item.name,
            assetTag: item.assetTag,
            userId: payload.currentUser.id,
            userName: payload.assigneeName,
            userEmail: payload.assigneeEmail,
            projectName: payload.projectName,
            shootLocation: payload.shootLocation,
            checkoutDate: new Date().toISOString(),
            expectedReturnDate: payload.expectedReturnDate,
            status: 'Active',
            conditionOnCheckout: item.condition,
          };
        }
      });
      saveCachedGear(cached);
      return { updatedCount: payload.gearIds.length };
    }
  },

  async addMaintenance(payload: Partial<MaintenanceRecord> & { currentUser: UserAccount }): Promise<MaintenanceRecord> {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Maintenance post failed');
      return await res.json();
    } catch (err) {
      enqueueOfflineAction({ type: 'MAINTENANCE', payload });
      const record: MaintenanceRecord = {
        id: `maint-offline-${Date.now()}`,
        gearId: payload.gearId || '',
        date: payload.date || new Date().toISOString().split('T')[0],
        serviceType: payload.serviceType || 'General Overhaul',
        technician: payload.technician || 'Field Tech',
        cost: Number(payload.cost) || 0,
        conditionAfter: payload.conditionAfter || 'Good',
        notes: payload.notes || '',
        nextServiceDueDate: payload.nextServiceDueDate,
        resolved: payload.resolved ?? true,
      };
      const cachedMaint = getCachedMaintenance();
      cachedMaint.unshift(record);
      saveCachedMaintenance(cachedMaint);
      return record;
    }
  },

  async addGearItem(item: Partial<GearItem> & { currentUser: UserAccount }): Promise<GearItem> {
    try {
      const res = await fetch('/api/gear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to add gear');
      }
      return await res.json();
    } catch (err) {
      enqueueOfflineAction({ type: 'CREATE_GEAR', payload: item });
      const fallbackItem: GearItem = {
        id: `gear-offline-${Date.now()}`,
        assetTag: (item.assetTag || 'NEW-TAG').toUpperCase(),
        name: item.name || 'New Gear',
        brand: item.brand || 'Brand',
        model: item.model || 'Model',
        category: item.category || 'Cameras',
        serialNumber: item.serialNumber || 'SN-UNKNOWN',
        status: item.status || 'Available',
        condition: item.condition || 'Mint',
        location: item.location || 'Studio',
        purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0],
        purchasePrice: Number(item.purchasePrice) || 0,
        replacementValue: Number(item.replacementValue) || 0,
        specs: item.specs || {},
        totalShootsCompleted: 0,
      };
      const cached = getCachedGear();
      cached.unshift(fallbackItem);
      saveCachedGear(cached);
      return fallbackItem;
    }
  },

  async updateGearItem(id: string, updates: Partial<GearItem> & { currentUser: UserAccount }): Promise<GearItem> {
    try {
      const res = await fetch(`/api/gear/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Update failed');
      return await res.json();
    } catch (err) {
      enqueueOfflineAction({ type: 'UPDATE_GEAR', payload: { id, updates } });
      const cached = getCachedGear();
      const idx = cached.findIndex((g) => g.id === id);
      if (idx !== -1) {
        cached[idx] = { ...cached[idx], ...updates };
        saveCachedGear(cached);
        return cached[idx];
      }
      throw err;
    }
  },

  async deleteGearItem(id: string, currentUser?: UserAccount): Promise<boolean> {
    try {
      const res = await fetch(`/api/gear/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUser }),
      });
      if (!res.ok) throw new Error('Delete failed');
      const cached = getCachedGear();
      const filtered = cached.filter((g) => g.id !== id);
      saveCachedGear(filtered);
      return true;
    } catch (err) {
      const cached = getCachedGear();
      const filtered = cached.filter((g) => g.id !== id);
      saveCachedGear(filtered);
      return true;
    }
  },

  async syncWithM365(currentUser: UserAccount) {
    const res = await fetch('/api/sync/m365', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUser }),
    });
    return await res.json();
  },

  async syncWithGoogleWorkspace(currentUser: UserAccount) {
    const res = await fetch('/api/sync/google-workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUser }),
    });
    return await res.json();
  },

  async replayOfflineQueue(): Promise<{ syncedCount: number }> {
    const queue = getOfflineQueue();
    if (queue.length === 0) return { syncedCount: 0 };

    let count = 0;
    for (const action of queue) {
      try {
        if (action.type === 'CHECKOUT') {
          await fetch(`/api/gear/${action.payload.id}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload),
          });
        } else if (action.type === 'CHECKIN') {
          await fetch(`/api/gear/${action.payload.id}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload),
          });
        } else if (action.type === 'BATCH_CHECKOUT') {
          await fetch('/api/gear/batch-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload),
          });
        } else if (action.type === 'MAINTENANCE') {
          await fetch('/api/maintenance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload),
          });
        } else if (action.type === 'CREATE_GEAR') {
          await fetch('/api/gear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(action.payload),
          });
        }
        count++;
      } catch (e) {
        console.warn('Queue replay step failed:', e);
      }
    }
    clearOfflineQueue();
    return { syncedCount: count };
  },
};

export const replayOfflineQueue = () => api.replayOfflineQueue();

export const apiClient = {
  getGear: () => api.fetchGear(),
  getMaintenance: () => api.fetchMaintenance(),
  getProjects: () => api.fetchProjects(),
  getAuditLogs: () => api.fetchAuditLogs(),
  getNotifications: () => api.fetchNotifications(),
  createGear: (item: any, currentUser: UserAccount) => api.addGearItem({ ...item, currentUser }),
  updateGear: (id: string, updates: any, currentUser: UserAccount) =>
    api.updateGearItem(id, { ...updates, currentUser }),
  deleteGear: (id: string, currentUser?: UserAccount) => api.deleteGearItem(id, currentUser),
  checkoutGear: (id: string, payload: any, currentUser: UserAccount) =>
    api.checkoutGear(id, { ...payload, currentUser }),
  checkinGear: (id: string, conditionOnReturn: any, returnNotes: string, currentUser: UserAccount) =>
    api.checkinGear(id, { conditionOnReturn, returnNotes, currentUser }),
  addMaintenance: async (record: any, currentUser: UserAccount) => {
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...record, currentUser }),
      });
      if (!res.ok) throw new Error('Maintenance request failed');
      return await res.json();
    } catch (err) {
      enqueueOfflineAction({ type: 'MAINTENANCE', payload: { ...record, currentUser } });
      const cached = getCachedMaintenance();
      cached.unshift(record);
      saveCachedMaintenance(cached);
      return record;
    }
  },
  syncM365: (currentUser: UserAccount) => api.syncWithM365(currentUser),
  syncGoogleWorkspace: (currentUser: UserAccount) => api.syncWithGoogleWorkspace(currentUser),
};

