import express from 'express';
import path from 'path';
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

// In-memory data store with initial seed (persists during server lifetime, also supported by client localStorage)
let gearStore: GearItem[] = JSON.parse(JSON.stringify(INITIAL_GEAR));
let maintenanceStore: MaintenanceRecord[] = JSON.parse(JSON.stringify(INITIAL_MAINTENANCE));
let projectsStore: ShootProject[] = JSON.parse(JSON.stringify(INITIAL_PROJECTS));
let auditStore: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
let notificationStore: AppNotification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
let cloudBridgeConfig: CloudBridgeConfig = JSON.parse(JSON.stringify(INITIAL_CLOUD_BRIDGE));

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
          g.name.toLowerCase().includes(q) ||
          g.assetTag.toLowerCase().includes(q) ||
          g.brand.toLowerCase().includes(q) ||
          g.serialNumber.toLowerCase().includes(q) ||
          g.location.toLowerCase().includes(q) ||
          (g.kitName && g.kitName.toLowerCase().includes(q))
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
    if (gearStore.some((g) => g.assetTag.toLowerCase() === body.assetTag.toLowerCase())) {
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
    const index = gearStore.findIndex((g) => g.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Gear item not found' });

    const current = gearStore[index];
    const updated: GearItem = {
      ...current,
      ...req.body,
      id: current.id, // Immutable ID
    };

    gearStore[index] = updated;

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

  // Maintenance Endpoints
  app.get('/api/maintenance', (req, res) => {
    res.json(maintenanceStore);
  });

  app.post('/api/maintenance', (req, res) => {
    const body = req.body;
    if (!body.gearId || !body.serviceType) {
      return res.status(400).json({ error: 'gearId and serviceType required' });
    }

    const newRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
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

    maintenanceStore.unshift(newRecord);

    // Update gear item condition and service dates
    const gearIdx = gearStore.findIndex((g) => g.id === body.gearId);
    if (gearIdx !== -1) {
      const gear = gearStore[gearIdx];
      gear.condition = newRecord.conditionAfter;
      gear.lastServiceDate = newRecord.date;
      if (newRecord.nextServiceDueDate) {
        gear.nextServiceDate = newRecord.nextServiceDueDate;
      }
      if (newRecord.resolved && gear.status === 'In Maintenance') {
        gear.status = 'Available';
      } else if (!newRecord.resolved) {
        gear.status = 'In Maintenance';
      }
      gearStore[gearIdx] = gear;

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
