import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_GEAR,
  INITIAL_MAINTENANCE,
  INITIAL_PROJECTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CLOUD_BRIDGE,
  INITIAL_USERS,
} from './src/data/mockData';
import { GearItem, MaintenanceRecord, ShootProject, AuditLog, AppNotification, CloudBridgeConfig } from './src/types';

const DB_FILE_PATH = path.resolve(process.cwd(), 'src/data/persisted_db.json');

// In-memory data store with initial seed (persists to local disk and client localStorage)
let gearStore: GearItem[] = JSON.parse(JSON.stringify(INITIAL_GEAR));
let maintenanceStore: MaintenanceRecord[] = JSON.parse(JSON.stringify(INITIAL_MAINTENANCE));
let projectsStore: ShootProject[] = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
let auditStore: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
let notificationStore: AppNotification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
let cloudBridgeConfig: CloudBridgeConfig = JSON.parse(JSON.stringify(INITIAL_CLOUD_BRIDGE));

function loadPersistedStores() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.gear) && parsed.gear.length > 0) gearStore = parsed.gear;
      if (Array.isArray(parsed.maint) && parsed.maint.length > 0) maintenanceStore = parsed.maint;
      if (Array.isArray(parsed.projects) && parsed.projects.length > 0) projectsStore = parsed.projects;
      if (Array.isArray(parsed.audit) && parsed.audit.length > 0) auditStore = parsed.audit;
      console.log(`[Database] Loaded persisted database from disk: ${gearStore.length} gear items, ${maintenanceStore.length} maintenance records.`);
    }
  } catch (err) {
    console.warn('[Database] Could not load persisted database file, using fallback:', err);
  }
}

function persistStoresToDisk() {
  try {
    fs.writeFileSync(
      DB_FILE_PATH,
      JSON.stringify(
        {
          gear: gearStore,
          maint: maintenanceStore,
          projects: projectsStore,
          audit: auditStore,
        },
        null,
        2
      )
    );
  } catch (err) {
    console.warn('[Database] Failed to persist data to disk:', err);
  }
}

loadPersistedStores();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper for audit logging
  const recordAudit = (
    userId: string,
    userName: string,
    role: any,
    provider: any,
    action: any,
    targetAssetTag: string,
    targetName: string,
    details: string,
    ipOrDevice: string = 'Web Client'
  ) => {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: userId || 'user-01',
      userName: userName || 'System User',
      userRole: role || 'Admin',
      provider: provider || 'Google Workspace',
      action,
      targetAssetTag,
      targetName,
      details,
      ipOrDevice,
    };
    auditStore.unshift(log);
    // Keep max 150 audit entries
    if (auditStore.length > 150) auditStore.pop();
    return log;
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), totalItems: gearStore.length });
  });

  // Gear CRUD
  app.get('/api/gear', (req, res) => {
    const { category, status, search } = req.query;
    let filtered = [...gearStore];

    if (category && category !== 'All') {
      filtered = filtered.filter((g) => g.category === category);
    }
    if (status && status !== 'All') {
      filtered = filtered.filter((g) => g.status === status);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          String(g.name || '').toLowerCase().includes(q) ||
          String(g.assetTag || '').toLowerCase().includes(q) ||
          String(g.brand || '').toLowerCase().includes(q) ||
          String(g.serialNumber || '').toLowerCase().includes(q) ||
          String(g.location || '').toLowerCase().includes(q) ||
          (g.kitName && String(g.kitName).toLowerCase().includes(q))
      );
    }

    res.json(filtered);
  });

  app.get('/api/gear/:id', (req, res) => {
    const item = gearStore.find((g) => g.id === req.params.id || g.assetTag === req.params.id);
    if (!item) return res.status(404).json({ error: 'Gear item not found' });
    res.json(item);
  });

  app.post('/api/gear', (req, res) => {
    const body = req.body;
    if (!body.name || !body.assetTag || !body.category) {
      return res.status(400).json({ error: 'Missing required fields: name, assetTag, category' });
    }

    // Check duplicate tag
    if (gearStore.some((g) => String(g.assetTag || '').toLowerCase() === String(body.assetTag || '').toLowerCase())) {
      return res.status(409).json({ error: `Asset tag ${body.assetTag} already exists.` });
    }

    const newItem: GearItem = {
      id: `gear-${Date.now()}`,
      assetTag: body.assetTag.toUpperCase().trim(),
      name: body.name.trim(),
      brand: body.brand || 'Custom',
      model: body.model || body.name,
      category: body.category,
      serialNumber: body.serialNumber || `SN-${Math.floor(Math.random() * 900000 + 100000)}`,
      status: body.status || 'Available',
      condition: body.condition || 'Mint',
      location: body.location || 'Studio',
      kitName: body.kitName || undefined,
      purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0],
      purchasePrice: Number(body.purchasePrice) || 0,
      replacementValue: Number(body.replacementValue) || Number(body.purchasePrice) || 0,
      specs: body.specs || {},
      totalShootsCompleted: 0,
      notes: body.notes || '',
      maintenanceIntervalDays: Number(body.maintenanceIntervalDays) || 120,
    };

    gearStore.unshift(newItem);
    persistStoresToDisk();

    recordAudit(
      req.body.currentUser?.id,
      req.body.currentUser?.name,
      req.body.currentUser?.role,
      req.body.currentUser?.provider,
      'CREATE',
      newItem.assetTag,
      newItem.name,
      `New equipment registered: ${newItem.name} (${newItem.category}) in ${newItem.location}`
    );

    res.status(201).json(newItem);
  });

  app.put('/api/gear/:id', (req, res) => {
    let index = gearStore.findIndex((g) => g.id === req.params.id || g.assetTag === req.params.id);
    const body = req.body;
    let updated: GearItem;

    if (index === -1) {
      updated = {
        assetTag: body.assetTag || 'GEAR-' + Date.now(),
        name: body.name || 'Untitled Gear',
        brand: body.brand || 'Custom',
        model: body.model || body.name || '',
        category: body.category || 'Cameras',
        serialNumber: body.serialNumber || '',
        status: body.status || 'Available',
        condition: body.condition || 'Good',
        location: body.location || 'Studio',
        purchasePrice: Number(body.purchasePrice) || 0,
        replacementValue: Number(body.replacementValue) || Number(body.purchasePrice) || 0,
        maintenanceIntervalDays: Number(body.maintenanceIntervalDays) || 120,
        totalShootsCompleted: Number(body.totalShootsCompleted) || 0,
        notes: body.notes || '',
        ...body,
        id: req.params.id,
      };
      gearStore.unshift(updated);
    } else {
      const current = gearStore[index];
      updated = {
        ...current,
        ...body,
        id: current.id, // Immutable ID
      };
      gearStore[index] = updated;
    }
    persistStoresToDisk();

    recordAudit(
      req.body.currentUser?.id,
      req.body.currentUser?.name,
      req.body.currentUser?.role,
      req.body.currentUser?.provider,
      'UPDATE',
      updated.assetTag,
      updated.name,
      `Updated specifications and details for ${updated.name}`
    );

    res.json(updated);
  });

  app.delete('/api/gear/:id', (req, res) => {
    const index = gearStore.findIndex((g) => g.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Gear item not found' });

    const [deleted] = gearStore.splice(index, 1);
    persistStoresToDisk();

    recordAudit(
      req.body.currentUser?.id,
      req.body.currentUser?.name,
      req.body.currentUser?.role,
      req.body.currentUser?.provider,
      'TRANSFER',
      deleted.assetTag,
      deleted.name,
      `Deleted equipment record for ${deleted.name} (${deleted.assetTag})`
    );

    res.json({ success: true, id: deleted.id });
  });

  // Single Item Checkout
  app.post('/api/gear/:id/checkout', (req, res) => {
    const index = gearStore.findIndex((g) => g.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Gear item not found' });

    const item = gearStore[index];
    const { projectName, shootLocation, expectedReturnDate, notes, assigneeName, assigneeEmail, currentUser } = req.body;

    const checkoutRecord = {
      id: `chk-${Date.now()}`,
      gearId: item.id,
      gearName: item.name,
      assetTag: item.assetTag,
      userId: currentUser?.id || 'user-02',
      userName: assigneeName || currentUser?.name || 'Field Crew',
      userEmail: assigneeEmail || currentUser?.email || 'crew@production.work',
      projectName: projectName || 'Active Production Shoot',
      shootLocation: shootLocation || 'Location TBD',
      checkoutDate: new Date().toISOString(),
      expectedReturnDate: expectedReturnDate || new Date(Date.now() + 86400000 * 3).toISOString(),
      status: 'Active' as const,
      notes: notes || '',
      conditionOnCheckout: item.condition,
    };

    item.status = 'Checked Out';
    item.currentCheckout = checkoutRecord;
    item.totalShootsCompleted += 1;
    gearStore[index] = item;

    recordAudit(
      currentUser?.id,
      currentUser?.name,
      currentUser?.role,
      currentUser?.provider,
      'CHECKOUT',
      item.assetTag,
      item.name,
      `Checked out to ${checkoutRecord.userName} for "${checkoutRecord.projectName}" (${checkoutRecord.shootLocation})`
    );

    res.json({ gear: item, checkout: checkoutRecord });
  });

  // Single Item Checkin
  app.post('/api/gear/:id/checkin', (req, res) => {
    const index = gearStore.findIndex((g) => g.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Gear item not found' });

    const item = gearStore[index];
    const { conditionOnReturn, returnNotes, location, currentUser } = req.body;

    const prevCheckout = item.currentCheckout;
    item.status = conditionOnReturn === 'Needs Attention' || conditionOnReturn === 'Damaged' ? 'In Maintenance' : 'Available';
    item.condition = conditionOnReturn || item.condition;
    if (location) item.location = location;
    item.currentCheckout = undefined;
    gearStore[index] = item;

    recordAudit(
      currentUser?.id,
      currentUser?.name,
      currentUser?.role,
      currentUser?.provider,
      'CHECKIN',
      item.assetTag,
      item.name,
      `Returned from shoot. Condition: ${item.condition}. ${returnNotes ? `Notes: ${returnNotes}` : ''}`
    );

    // If item returned damaged or needs attention, create a notification
    if (item.status === 'In Maintenance') {
      notificationStore.unshift({
        id: `notif-${Date.now()}`,
        title: `Gear Attention: ${item.name}`,
        message: `Returned in "${item.condition}" condition by ${prevCheckout?.userName || 'Field Crew'}. Check-in note: ${returnNotes || 'No notes provided'}.`,
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        relatedGearId: item.id,
      });
    }

    res.json({ gear: item, returnedRecord: prevCheckout });
  });

  // Batch Check-out (e.g. for complete Kits or selected list)
  app.post('/api/gear/batch-checkout', (req, res) => {
    const { gearIds, projectName, shootLocation, expectedReturnDate, assigneeName, assigneeEmail, currentUser } = req.body;

    if (!Array.isArray(gearIds) || gearIds.length === 0) {
      return res.status(400).json({ error: 'gearIds array is required' });
    }

    const updatedItems: GearItem[] = [];
    const itemNames: string[] = [];

    gearIds.forEach((id: string) => {
      const idx = gearStore.findIndex((g) => g.id === id);
      if (idx !== -1) {
        const item = gearStore[idx];
        item.status = 'Checked Out';
        item.currentCheckout = {
          id: `chk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          gearId: item.id,
          gearName: item.name,
          assetTag: item.assetTag,
          userId: currentUser?.id || 'user-02',
          userName: assigneeName || currentUser?.name || 'Field Crew',
          userEmail: assigneeEmail || currentUser?.email || 'crew@production.work',
          projectName: projectName || 'Production Shoot',
          shootLocation: shootLocation || 'Location TBD',
          checkoutDate: new Date().toISOString(),
          expectedReturnDate: expectedReturnDate || new Date(Date.now() + 86400000 * 3).toISOString(),
          status: 'Active',
          conditionOnCheckout: item.condition,
        };
        item.totalShootsCompleted += 1;
        gearStore[idx] = item;
        updatedItems.push(item);
        itemNames.push(item.assetTag);
      }
    });

    recordAudit(
      currentUser?.id,
      currentUser?.name,
      currentUser?.role,
      currentUser?.provider,
      'CHECKOUT',
      `BATCH (${gearIds.length} items)`,
      projectName,
      `Batch checked out ${gearIds.length} items (${itemNames.join(', ')}) to ${assigneeName || currentUser?.name} for "${projectName}"`
    );

    res.json({ updatedCount: updatedItems.length, items: updatedItems });
  });

  // Batch Check-in
  app.post('/api/gear/batch-checkin', (req, res) => {
    const { gearIds, currentUser } = req.body;
    if (!Array.isArray(gearIds)) return res.status(400).json({ error: 'gearIds array required' });

    const checkedIn: GearItem[] = [];
    gearIds.forEach((id: string) => {
      const idx = gearStore.findIndex((g) => g.id === id);
      if (idx !== -1) {
        const item = gearStore[idx];
        item.status = 'Available';
        item.currentCheckout = undefined;
        gearStore[idx] = item;
        checkedIn.push(item);
      }
    });

    recordAudit(
      currentUser?.id,
      currentUser?.name,
      currentUser?.role,
      currentUser?.provider,
      'CHECKIN',
      `BATCH (${checkedIn.length} items)`,
      'Field Return',
      `Bulk check-in completed for ${checkedIn.length} items returned to cage.`
    );

    res.json({ count: checkedIn.length, items: checkedIn });
  });

  // Helper to ensure equipment service dates strictly follow the latest Individual Maintenance records
  function syncGearFromMaintenance(gearId: string) {
    const gear = gearStore.find((g) => g.id === gearId);
    if (!gear) return;
    const gearRecs = maintenanceStore
      .filter((m) => m.gearId === gearId && m.date && m.date.trim())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = gearRecs[0];
    if (latest) {
      gear.lastServiceDate = latest.date;
      gear.condition = latest.conditionAfter || gear.condition;
      if (latest.nextServiceDueDate) {
        gear.nextServiceDate = latest.nextServiceDueDate;
      }
      if (latest.resolved && gear.status === 'In Maintenance') {
        gear.status = 'Available';
      } else if (!latest.resolved) {
        gear.status = 'In Maintenance';
      }
    }
  }

  // Maintenance Endpoints
  app.get('/api/maintenance', (req, res) => {
    res.json(maintenanceStore);
  });

  app.post('/api/maintenance', (req, res) => {
    const body = req.body;
    if (!body.gearId || !body.serviceType) {
      return res.status(400).json({ error: 'gearId and serviceType required' });
    }

    const recordId = body.id || `maint-${Date.now()}`;
    const existingIdx = maintenanceStore.findIndex((m) => m.id === recordId);

    const newRecord: MaintenanceRecord = {
      id: recordId,
      gearId: body.gearId,
      date: body.date || new Date().toISOString().split('T')[0],
      serviceType: body.serviceType,
      technician: body.technician || 'Internal Tech',
      vendor: body.vendor,
      cost: Number(body.cost) || 0,
      conditionAfter: body.conditionAfter || 'Good',
      notes: body.notes || '',
      nextServiceDueDate: body.nextServiceDueDate,
      resolved: body.resolved ?? true,
    };

    if (existingIdx !== -1) {
      maintenanceStore[existingIdx] = newRecord;
    } else {
      maintenanceStore.unshift(newRecord);
    }

    syncGearFromMaintenance(body.gearId);

    const gear = gearStore.find((g) => g.id === body.gearId);
    if (gear) {
      recordAudit(
        req.body.currentUser?.id,
        req.body.currentUser?.name,
        req.body.currentUser?.role,
        req.body.currentUser?.provider,
        'MAINTENANCE_LOG',
        gear.assetTag,
        gear.name,
        `Logged ${newRecord.serviceType}: ${newRecord.notes}. Condition rated: ${newRecord.conditionAfter}.`
      );
    }

    res.status(201).json(newRecord);
  });

  app.put('/api/maintenance/:id', (req, res) => {
    let idx = maintenanceStore.findIndex((m) => m.id === req.params.id);
    const body = req.body;
    let updated: MaintenanceRecord;

    if (idx === -1) {
      // Upsert record if not previously present in server memory
      updated = {
        id: req.params.id,
        gearId: body.gearId || '',
        date: body.date || new Date().toISOString().split('T')[0],
        serviceType: body.serviceType || 'General Overhaul',
        technician: body.technician || 'Internal Tech',
        vendor: body.vendor !== undefined ? body.vendor : '',
        cost: body.cost !== undefined ? Number(body.cost) : 0,
        conditionAfter: body.conditionAfter || 'Good',
        notes: body.notes !== undefined ? body.notes : '',
        nextServiceDueDate: body.nextServiceDueDate !== undefined ? body.nextServiceDueDate : '',
        resolved: body.resolved !== undefined ? body.resolved : true,
      };
      maintenanceStore.unshift(updated);
    } else {
      const current = maintenanceStore[idx];
      updated = {
        ...current,
        date: body.date || current.date,
        serviceType: body.serviceType || current.serviceType,
        technician: body.technician || current.technician,
        vendor: body.vendor !== undefined ? body.vendor : current.vendor,
        cost: body.cost !== undefined ? Number(body.cost) : current.cost,
        conditionAfter: body.conditionAfter || current.conditionAfter,
        notes: body.notes !== undefined ? body.notes : current.notes,
        nextServiceDueDate: body.nextServiceDueDate !== undefined ? body.nextServiceDueDate : current.nextServiceDueDate,
        resolved: body.resolved !== undefined ? body.resolved : current.resolved,
      };
      maintenanceStore[idx] = updated;
    }

    syncGearFromMaintenance(updated.gearId);

    const gear = gearStore.find((g) => g.id === updated.gearId);
    if (gear) {
      recordAudit(
        req.body.currentUser?.id,
        req.body.currentUser?.name,
        req.body.currentUser?.role,
        req.body.currentUser?.provider,
        'MAINTENANCE_LOG',
        gear.assetTag,
        gear.name,
        `Updated ${updated.serviceType} record (${updated.date}): ${updated.notes || 'Service details updated'}`
      );
    }

    res.json(updated);
  });

  app.delete('/api/maintenance/:id', (req, res) => {
    const idx = maintenanceStore.findIndex((m) => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Maintenance record not found' });

    const removed = maintenanceStore.splice(idx, 1)[0];
    syncGearFromMaintenance(removed.gearId);

    const gear = gearStore.find((g) => g.id === removed.gearId);
    if (gear) {
      recordAudit(
        req.body.currentUser?.id,
        req.body.currentUser?.name,
        req.body.currentUser?.role,
        req.body.currentUser?.provider,
        'MAINTENANCE_LOG',
        gear.assetTag,
        gear.name,
        `Removed service record ${removed.serviceType} from ${removed.date}`
      );
    }

    res.json({ success: true, removed });
  });

  // Shoots & Projects
  app.get('/api/projects', (req, res) => {
    res.json(projectsStore);
  });

  // Audit Logs
  app.get('/api/audit', (req, res) => {
    res.json(auditStore);
  });

  // Notifications
  app.get('/api/notifications', (req, res) => {
    res.json(notificationStore);
  });

  app.post('/api/notifications/:id/read', (req, res) => {
    const idx = notificationStore.findIndex((n) => n.id === req.params.id);
    if (idx !== -1) {
      notificationStore[idx].read = true;
    }
    res.json({ success: true });
  });

  // Cloud Bridge & Migration Endpoints
  app.get('/api/cloud-bridge', (req, res) => {
    res.json(cloudBridgeConfig);
  });

  app.post('/api/sync/m365', (req, res) => {
    const { currentUser } = req.body;
    cloudBridgeConfig.microsoft365.lastSynced = new Date().toISOString();

    recordAudit(
      currentUser?.id,
      currentUser?.name,
      currentUser?.role,
      'Microsoft 365',
      'CLOUD_SYNC',
      'MICROSOFT-GRAPH-API',
      'SharePoint Lists',
      `Synchronized ${gearStore.length} asset records and movement statuses to Microsoft 365 SharePoint Asset Registry.`
    );

    res.json({
      success: true,
      provider: 'Microsoft 365 / Entra ID',
      syncedRecords: gearStore.length,
      timestamp: cloudBridgeConfig.microsoft365.lastSynced,
      targetList: cloudBridgeConfig.microsoft365.sharePointList,
    });
  });

  app.post('/api/sync/google-workspace', (req, res) => {
    const { currentUser } = req.body;
    cloudBridgeConfig.googleWorkspace.lastSynced = new Date().toISOString();

    recordAudit(
      currentUser?.id,
      currentUser?.name,
      currentUser?.role,
      'Google Workspace',
      'CLOUD_SYNC',
      'GOOGLE-WORKSPACE-API',
      'Google Drive & Sheets',
      `Synchronized ${gearStore.length} asset records to Google Drive Backup and Google Sheets live catalog.`
    );

    res.json({
      success: true,
      provider: 'Google Workspace',
      syncedRecords: gearStore.length,
      timestamp: cloudBridgeConfig.googleWorkspace.lastSynced,
      targetFolder: cloudBridgeConfig.googleWorkspace.targetDriveFolder,
    });
  });

  // Helper to validate and query Google Apps Script Web App
  const validateAndFetchGoogleScript = async (webAppUrl: string, method: 'GET' | 'POST', body?: any) => {
    const trimmed = (webAppUrl || '').trim();
    if (!trimmed) {
      throw new Error('Web App URL cannot be empty.');
    }

    if (trimmed.includes('docs.google.com/spreadsheets/d/')) {
      throw new Error(
        'You entered a Google Sheets spreadsheet link instead of the Apps Script Web App URL. In your Google Sheet, click Extensions > Apps Script > Deploy > New deployment > Web app, and copy the URL ending in /exec.'
      );
    }

    if (trimmed.includes('/dev')) {
      throw new Error(
        "You entered a test '/dev' URL. Google restricts this URL to browser sessions. Please use the production deployment URL that ends with '/exec'."
      );
    }

    if (!trimmed.includes('script.google.com/macros/s/')) {
      throw new Error(
        "The URL must be a Google Apps Script Web App URL starting with 'https://script.google.com/macros/s/...' and ending with '/exec'."
      );
    }

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CineVault/1.0',
      Accept: '*/*',
    };

    let fetchUrl = trimmed;
    const fetchOptions: RequestInit = {
      method,
      headers,
      redirect: 'follow',
    };

    if (method === 'GET') {
      const qs = body ? new URLSearchParams(body).toString() : '';
      if (qs) {
        fetchUrl = trimmed.includes('?') ? `${trimmed}&${qs}` : `${trimmed}?${qs}`;
      }
    } else if (method === 'POST' && body) {
      headers['Content-Type'] = 'text/plain;charset=utf-8';
      fetchOptions.body = JSON.stringify(body);
    }

    console.log(`[Google Sheets Proxy] ${method} -> ${fetchUrl}`);
    const response = await fetch(fetchUrl, fetchOptions);
    console.log(`[Google Sheets Proxy] Status: ${response.status} (${response.statusText})`);
    const rawText = await response.text();
    console.log(`[Google Sheets Proxy] Response preview:`, rawText.substring(0, 200));

    try {
      return JSON.parse(rawText);
    } catch {
      // If Google returned HTML instead of JSON
      if (rawText.includes('ServiceLogin') || rawText.includes('accounts.google.com') || rawText.includes('Sign in')) {
        throw new Error(
          "Google returned a Sign-In page. This happens when 'Who has access' was set to 'Only myself'. In Apps Script, click Deploy > Manage deployments > Edit (pencil icon), change 'Who has access' from 'Only myself' to 'Anyone', and deploy a new version."
        );
      }
      if (rawText.includes('Google Drive') || rawText.includes('Google Docs')) {
        throw new Error(
          'Google returned a Drive/Docs page instead of the Web App. Please ensure you copied the Web App URL from the Deployment dialog.'
        );
      }
      if (rawText.includes('Script function not found') || rawText.includes('Script error')) {
        throw new Error(
          'Apps Script returned an execution error. Please ensure you pasted the full script code into Code.gs and saved it before deploying.'
        );
      }
      throw new Error(
        "Google returned an HTML web page instead of JSON. Ensure your Apps Script is deployed as a Web App with 'Who has access: Anyone' and authorized."
      );
    }
  };

  // Google Sheets Cloud Database Proxy Endpoints
  app.post('/api/sheets/test', async (req, res) => {
    try {
      const data = await validateAndFetchGoogleScript(req.body.webAppUrl, 'GET', { action: 'ping' });
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Failed to reach Google Apps Script' });
    }
  });

  app.post('/api/sheets/fetch-all', async (req, res) => {
    try {
      const data: any = await validateAndFetchGoogleScript(req.body.webAppUrl, 'GET', { action: 'fetchAll' });
      if (data && data.success) {
        if (Array.isArray(data.gear) && data.gear.length > 0) {
          gearStore = data.gear;
        }
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          projectsStore = data.projects;
        }
        if (Array.isArray(data.maintenance) && data.maintenance.length > 0) {
          maintenanceStore = data.maintenance;
        }
        if (Array.isArray(data.auditLogs) && data.auditLogs.length > 0) {
          auditStore = data.auditLogs;
        }
      }
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Error fetching data from Google Sheets' });
    }
  });

  app.post('/api/sheets/push-all', async (req, res) => {
    try {
      if (Array.isArray(req.body.gear) && req.body.gear.length > 0) {
        gearStore = req.body.gear;
      }
      if (Array.isArray(req.body.maintenance) && req.body.maintenance.length > 0) {
        maintenanceStore = req.body.maintenance;
      }
      if (Array.isArray(req.body.projects) && req.body.projects.length > 0) {
        projectsStore = req.body.projects;
      }
      if (Array.isArray(req.body.auditLogs) && req.body.auditLogs.length > 0) {
        auditStore = req.body.auditLogs;
      }

      const payload = {
        action: 'pushAll',
        spreadsheetUrl: req.body.spreadsheetUrl,
        gear: req.body.gear || gearStore,
        projects: req.body.projects || projectsStore,
        maintenance: req.body.maintenance || maintenanceStore,
        auditLogs: req.body.auditLogs || auditStore,
      };
      console.log(`[Google Sheets Proxy] push-all called with ${payload.gear.length} gear items, ${payload.projects.length} projects`);
      const data = await validateAndFetchGoogleScript(req.body.webAppUrl, 'POST', payload);
      res.json(data);
    } catch (err: any) {
      console.error(`[Google Sheets Proxy] push-all error:`, err);
      res.status(400).json({ success: false, error: err.message || 'Error pushing data to Google Sheets' });
    }
  });

  app.post('/api/sheets/update-item', async (req, res) => {
    try {
      const data = await validateAndFetchGoogleScript(req.body.webAppUrl, 'POST', {
        action: req.body.action,
        item: req.body.item,
        id: req.body.id,
      });
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Error updating item in Google Sheets' });
    }
  });

  app.post('/api/sheets/update-project', async (req, res) => {
    try {
      const data = await validateAndFetchGoogleScript(req.body.webAppUrl, 'POST', {
        action: 'updateProject',
        project: req.body.project,
      });
      res.json(data);
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message || 'Error updating project in Google Sheets' });
    }
  });

  // Full Database Export & Transfer
  app.get('/api/export', (req, res) => {
    const format = req.query.format || 'json';

    if (format === 'csv') {
      const headers = ['AssetTag', 'Name', 'Brand', 'Model', 'Category', 'Status', 'Condition', 'Location', 'KitName', 'SerialNumber', 'PurchasePrice', 'ReplacementValue', 'NextServiceDate'];
      const rows = gearStore.map((g) => [
        `"${g.assetTag}"`,
        `"${g.name.replace(/"/g, '""')}"`,
        `"${g.brand}"`,
        `"${g.model}"`,
        `"${g.category}"`,
        `"${g.status}"`,
        `"${g.condition}"`,
        `"${g.location}"`,
        `"${g.kitName || ''}"`,
        `"${g.serialNumber}"`,
        g.purchasePrice,
        g.replacementValue,
        `"${g.nextServiceDate || ''}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=cinevault_gear_export.csv');
      return res.send(csvContent);
    }

    res.json({
      meta: {
        exportedAt: new Date().toISOString(),
        version: 'CineVault-2.0',
        totalItems: gearStore.length,
        system: 'CineVault Studio Asset Manager',
      },
      gear: gearStore,
      maintenance: maintenanceStore,
      projects: projectsStore,
      auditLogs: auditStore,
    });
  });

  app.post('/api/import', (req, res) => {
    const { gear, maintenance, currentUser } = req.body;
    if (!Array.isArray(gear)) {
      return res.status(400).json({ error: 'Invalid payload: gear array required' });
    }

    gearStore = gear;
    if (Array.isArray(maintenance)) {
      maintenanceStore = maintenance;
    }

    recordAudit(
      currentUser?.id,
      currentUser?.name,
      currentUser?.role,
      currentUser?.provider,
      'TRANSFER',
      'DATABASE-RESTORE',
      'Imported Inventory Catalog',
      `Restored / migrated ${gear.length} equipment records into local database.`
    );

    res.json({ success: true, count: gearStore.length });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineVault Gear Inventory Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
