import React, { useState, useEffect } from 'react';
import {
  Navbar,
  DashboardView,
  FieldShootSummaryView,
  InventoryView,
  MaintenanceView,
  QrTagManager,
  UserAuthModal,
  CheckoutModal,
  CheckinModal,
  AddGearModal,
  ItemDetailModal,
  EditGearModal,
  NotificationsDrawer,
} from './components';
import {
  GearItem,
  MaintenanceRecord,
  ProjectShoot,
  AuditLog,
  InventoryNotification,
  UserAccount,
  ConditionRating,
} from './types';
import {
  INITIAL_GEAR,
  INITIAL_PROJECTS,
  INITIAL_MAINTENANCE,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
} from './data/mockData';
import { apiClient } from './services/api';

const LOCAL_STORAGE_GEAR_KEY = 'cinevault_live_gear_v2';
const LOCAL_STORAGE_MAINT_KEY = 'cinevault_live_maint_v2';
const LOCAL_STORAGE_AUDIT_KEY = 'cinevault_live_audit_v2';
const LOCAL_STORAGE_PROJECTS_KEY = 'cinevault_live_projects_v2';

export default function App() {
  // Navigation (Dashboard is the default page on each new access)
  const [activeTab, setActiveTab] = useState<'field' | 'inventory' | 'dashboard' | 'maintenance' | 'qr'>('dashboard');

  // Core App State with Real-Time Local Storage Hydration
  const [gear, setGear] = useState<GearItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_GEAR_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as GearItem[];
        return parsed.map((item) => ({
          ...item,
          location:
            item.location === 'Studio' || item.location === 'Gripvan' || item.location === 'Charging Bay'
              ? item.location
              : item.category === 'Power & Batteries' || item.category === 'Media & Storage'
              ? 'Charging Bay'
              : 'Studio',
        }));
      }
    } catch {
      // fallback
    }
    return INITIAL_GEAR;
  });

  const [projects, setProjects] = useState<ProjectShoot[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PROJECTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PROJECTS;
  });
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_MAINT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_MAINTENANCE;
  });

  const [notifications, setNotifications] = useState<InventoryNotification[]>(INITIAL_NOTIFICATIONS);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_AUDIT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Modal open states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddGearOpen, setIsAddGearOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCheckinOpen, setIsCheckinOpen] = useState(false);

  // Item interaction states
  const [selectedGearItem, setSelectedGearItem] = useState<GearItem | null>(null);
  const [editingGearItem, setEditingGearItem] = useState<GearItem | null>(null);
  const [checkoutQueue, setCheckoutQueue] = useState<GearItem[]>([]);
  const [checkinTarget, setCheckinTarget] = useState<GearItem | null>(null);

  // Continuous Real-Time Synchronization
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_GEAR_KEY, JSON.stringify(gear));
    } catch {
      // ignore
    }
  }, [gear]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_MAINT_KEY, JSON.stringify(maintenance));
    } catch {
      // ignore
    }
  }, [maintenance]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_AUDIT_KEY, JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }, [projects]);

  // Initial load from backend (or fallback to cached/initial)
  useEffect(() => {
    async function loadData() {
      try {
        const [gearData, maintData, projData, auditData] = await Promise.all([
          apiClient.getGear(),
          apiClient.getMaintenance(),
          apiClient.getProjects(),
          apiClient.getAuditLogs(),
        ]);
        if (gearData && gearData.length > 0 && !localStorage.getItem(LOCAL_STORAGE_GEAR_KEY)) {
          setGear(gearData);
        }
        if (maintData && maintData.length > 0 && !localStorage.getItem(LOCAL_STORAGE_MAINT_KEY)) {
          setMaintenance(maintData);
        }
        if (projData && projData.length > 0) {
          setProjects(projData);
        }
        if (auditData && auditData.length > 0 && !localStorage.getItem(LOCAL_STORAGE_AUDIT_KEY)) {
          setAuditLogs(auditData);
        }
      } catch (err) {
        console.warn('Backend live sync utilizing instant local store:', err);
      }
    }
    loadData();
  }, []);

  // Switch active user & record audit entry
  const handleSwitchUser = (user: UserAccount) => {
    setCurrentUser(user);
    const log: AuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      provider: user.provider,
      action: 'LOGIN',
      targetAssetTag: 'ROLE-SESSION',
      details: `Switched active access level to ${user.role} (${user.name})`,
      ipOrDevice: 'Real-time Client',
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Add new gear item
  const handleAddGear = async (newItemData: Partial<GearItem>) => {
    const interval = newItemData.maintenanceIntervalDays || 90;
    let nextDue = newItemData.nextServiceDate;
    if (!nextDue && newItemData.lastServiceDate) {
      const d = new Date(newItemData.lastServiceDate);
      d.setDate(d.getDate() + interval);
      nextDue = d.toISOString().split('T')[0];
    }

    const item: GearItem = {
      id: `gear-${Date.now()}`,
      assetTag: newItemData.assetTag || `TAG-${Date.now().toString().slice(-4)}`,
      name: newItemData.name || 'Untitled Gear',
      brand: newItemData.brand || 'Generic',
      model: newItemData.model || '',
      category: newItemData.category || 'Cameras',
      serialNumber: newItemData.serialNumber || `SN-${Date.now()}`,
      condition: newItemData.condition || 'Mint',
      status: 'Available',
      location: newItemData.location || 'Studio',
      kitName: newItemData.kitName,
      purchaseDate: newItemData.purchaseDate,
      purchasePrice: newItemData.purchasePrice || 0,
      replacementValue: newItemData.purchasePrice || 0,
      lastServiceDate: newItemData.lastServiceDate,
      nextServiceDate: nextDue,
      maintenanceIntervalDays: interval,
      notes: newItemData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGear((prev) => [item, ...prev]);

    // Continual background sync
    try {
      await apiClient.createGear(item, currentUser);
    } catch {
      // Local state is authoritative in real time
    }

    // Push notification
    const notif: InventoryNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'New Asset Registered',
      message: `Equipment [${item.assetTag}] ${item.name} added to catalog.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'STATUS_ALERT',
      gearId: item.id,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Update existing gear item details
  const handleUpdateGear = async (updatedItem: GearItem) => {
    const now = new Date().toISOString();
    const finalItem: GearItem = {
      ...updatedItem,
      updatedAt: now,
    };

    setGear((prev) =>
      prev.map((item) => (item.id === finalItem.id ? finalItem : item))
    );

    // If currently selected in detail modal, update it as well
    if (selectedGearItem && selectedGearItem.id === finalItem.id) {
      setSelectedGearItem(finalItem);
    }

    // Continual background sync to server
    try {
      await apiClient.updateGear(finalItem.id, finalItem, currentUser);
    } catch {
      // Local state is authoritative in real time
    }

    // Push audit log
    const auditEntry: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      provider: currentUser.provider,
      action: 'UPDATE',
      targetAssetTag: finalItem.assetTag,
      targetName: finalItem.name,
      details: `Updated specifications and details for ${finalItem.name} (${finalItem.category}) in ${finalItem.location}`,
      ipOrDevice: 'Web Client',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    // Push notification
    const notif: InventoryNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Equipment Details Updated',
      message: `[${finalItem.assetTag}] ${finalItem.name} details and specs were updated.`,
      timestamp: now,
      read: false,
      type: 'STATUS_ALERT',
      gearId: finalItem.id,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Duplicate an existing gear item
  const handleDuplicateGear = async (sourceItem: GearItem) => {
    const timestamp = Date.now();
    const duplicated: GearItem = {
      ...sourceItem,
      id: `gear-${timestamp}`,
      assetTag: `${sourceItem.assetTag}-COPY`,
      name: `${sourceItem.name} (Copy)`,
      serialNumber: `SN-${Math.floor(Math.random() * 900000 + 100000)}`,
      status: 'Available',
      currentCheckout: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setGear((prev) => [duplicated, ...prev]);

    try {
      await apiClient.createGear(duplicated, currentUser);
    } catch {
      // Local authoritative
    }

    const auditEntry: AuditLog = {
      id: `audit-${timestamp}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      provider: currentUser.provider,
      action: 'CREATE',
      targetAssetTag: duplicated.assetTag,
      targetName: duplicated.name,
      details: `Duplicated item created from [${sourceItem.assetTag}] ${sourceItem.name}`,
      ipOrDevice: 'Web Client',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    const notif: InventoryNotification = {
      id: `NOTIF-${timestamp}`,
      title: 'Item Duplicated',
      message: `Created duplicate asset [${duplicated.assetTag}] (${duplicated.name}).`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'STATUS_ALERT',
      gearId: duplicated.id,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Permanently delete a gear item
  const handleDeleteGear = async (gearId: string) => {
    const targetItem = gear.find((g) => g.id === gearId);
    if (!targetItem) return;

    setGear((prev) => prev.filter((g) => g.id !== gearId));

    if (selectedGearItem && selectedGearItem.id === gearId) {
      setSelectedGearItem(null);
    }
    if (editingGearItem && editingGearItem.id === gearId) {
      setEditingGearItem(null);
    }

    try {
      await apiClient.deleteGear(gearId, currentUser);
    } catch {
      // Local state authoritative
    }

    const auditEntry: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      provider: currentUser.provider,
      action: 'TRANSFER',
      targetAssetTag: targetItem.assetTag,
      targetName: targetItem.name,
      details: `Permanently deleted equipment asset ${targetItem.name} (${targetItem.assetTag})`,
      ipOrDevice: 'Web Client',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    const notif: InventoryNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Equipment Asset Deleted',
      message: `[${targetItem.assetTag}] ${targetItem.name} removed from inventory.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'STATUS_ALERT',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Batch clear calibration horizon dates
  const handleBatchClearHorizon = async () => {
    const clearedItems: GearItem[] = [];
    setGear((prev) =>
      prev.map((item) => {
        if (item.nextServiceDate) {
          const updated = {
            ...item,
            nextServiceDate: undefined,
            updatedAt: new Date().toISOString(),
          };
          clearedItems.push(updated);
          return updated;
        }
        return item;
      })
    );

    for (const item of clearedItems) {
      try {
        await apiClient.updateGear(item.id, item, currentUser);
      } catch {}
    }

    const auditEntry: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      provider: currentUser.provider,
      action: 'UPDATE',
      targetAssetTag: 'HORIZON-BATCH',
      targetName: 'Service Horizon',
      details: `Batch cleared calibration horizon schedule for ${clearedItems.length} items.`,
      ipOrDevice: 'Web Client',
    };
    setAuditLogs((prev) => [auditEntry, ...prev]);

    const notif: InventoryNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Calibration Horizon Cleared',
      message: `Batch cleared upcoming scheduled service dates for ${clearedItems.length} items.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'SERVICE_REMINDER',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Resolve an item directly from the Horizon
  const handleResolveHorizonItem = async (item: GearItem) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const interval = item.maintenanceIntervalDays || 90;
    const nextDue = new Date(Date.now() + 86400000 * interval).toISOString().split('T')[0];

    await handleAddMaintenance({
      gearId: item.id,
      date: todayStr,
      serviceType: 'Calibration',
      technician: currentUser.name,
      conditionAfter: 'Mint',
      notes: `Service calibration resolved via Horizon schedule. Next calibration due in ${interval} days.`,
      nextServiceDueDate: nextDue,
      resolved: true,
    });
  };

  // Delete/remove an item from the Horizon
  const handleDeleteHorizonItem = async (item: GearItem) => {
    await handleUpdateGear({
      ...item,
      nextServiceDate: undefined,
    });
  };

  // Perform checkout
  const handleConfirmCheckout = async (payload: {
    gearIds: string[];
    projectName: string;
    shootLocation: string;
    expectedReturnDate: string;
    assigneeName: string;
    assigneeEmail: string;
    notes?: string;
  }) => {
    const now = new Date().toISOString();

    setGear((prev) =>
      prev.map((item) => {
        if (payload.gearIds.includes(item.id)) {
          return {
            ...item,
            status: 'Checked Out',
            currentCheckout: {
              projectName: payload.projectName,
              shootLocation: payload.shootLocation,
              checkoutDate: now,
              expectedReturnDate: payload.expectedReturnDate,
              userId: currentUser.id,
              userName: payload.assigneeName,
              userEmail: payload.assigneeEmail,
              notes: payload.notes,
            },
            updatedAt: now,
          };
        }
        return item;
      })
    );

    // Background sync
    for (const id of payload.gearIds) {
      try {
        await apiClient.checkoutGear(
          id,
          {
            projectName: payload.projectName,
            shootLocation: payload.shootLocation,
            expectedReturnDate: payload.expectedReturnDate,
            userName: payload.assigneeName,
            userEmail: payload.assigneeEmail,
            notes: payload.notes,
          },
          currentUser
        );
      } catch {
        // Handled in real time locally
      }
    }

    const notif: InventoryNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Field Gear Dispatched',
      message: `${payload.gearIds.length} item(s) checked out to "${payload.projectName}" for ${payload.assigneeName}.`,
      timestamp: now,
      read: false,
      type: 'STATUS_ALERT',
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Perform check-in / return
  const handleConfirmCheckin = async (
    id: string,
    conditionOnReturn: ConditionRating,
    returnNotes: string,
    location: string
  ) => {
    const now = new Date().toISOString();
    const targetItem = gear.find((g) => g.id === id);

    setGear((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: conditionOnReturn === 'Damaged' ? 'In Maintenance' : 'Available',
            condition: conditionOnReturn,
            location: location || item.location,
            currentCheckout: undefined,
            updatedAt: now,
          };
        }
        return item;
      })
    );

    try {
      await apiClient.checkinGear(id, conditionOnReturn, returnNotes, currentUser);
    } catch {
      // Local state is authoritative
    }

    if (targetItem) {
      const notif: InventoryNotification = {
        id: `NOTIF-${Date.now()}`,
        title: 'Equipment Returned to Cage',
        message: `[${targetItem.assetTag}] ${targetItem.name} returned in ${conditionOnReturn} condition.`,
        timestamp: now,
        read: false,
        type: 'STATUS_ALERT',
        gearId: id,
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Add Maintenance Record
  const handleAddMaintenance = async (recordData: Partial<MaintenanceRecord>) => {
    const record: MaintenanceRecord = {
      id: `MAINT-${Date.now()}`,
      gearId: recordData.gearId || gear[0]?.id || 'gear-1',
      date: recordData.date || new Date().toISOString().split('T')[0],
      serviceType: recordData.serviceType || 'Sensor Cleaning',
      technician: recordData.technician || currentUser.name,
      vendor: recordData.vendor,
      cost: recordData.cost || 0,
      conditionAfter: recordData.conditionAfter || 'Good',
      notes: recordData.notes || '',
      nextServiceDueDate: recordData.nextServiceDueDate,
      resolved: recordData.resolved ?? true,
    };

    setMaintenance((prev) => [record, ...prev]);

    setGear((prev) =>
      prev.map((g) => {
        if (g.id === record.gearId) {
          return {
            ...g,
            status: record.resolved && g.status === 'In Maintenance' ? 'Available' : g.status,
            condition: record.conditionAfter,
            lastServiceDate: record.date,
            nextServiceDate: record.nextServiceDueDate || g.nextServiceDate,
            updatedAt: new Date().toISOString(),
          };
        }
        return g;
      })
    );

    try {
      await apiClient.addMaintenance(record, currentUser);
    } catch {
      // Synchronized locally
    }

    const matchedGear = gear.find((g) => g.id === record.gearId);
    const notif: InventoryNotification = {
      id: `NOTIF-${Date.now()}`,
      title: 'Service Completed',
      message: `${record.serviceType} logged for [${matchedGear?.assetTag || 'GEAR'}] by ${record.technician}.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'SERVICE_REMINDER',
      gearId: record.gearId,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Quick action openers
  const openCheckoutForItems = (items: GearItem[]) => {
    setCheckoutQueue(items);
    setIsCheckoutOpen(true);
  };

  const openCheckinForItem = (item: GearItem) => {
    setCheckinTarget(item);
    setIsCheckinOpen(true);
  };

  const handleExportCsv = () => {
    const headers = ['Asset Tag', 'Name', 'Brand', 'Model', 'Category', 'Status', 'Condition', 'Location', 'Serial Number', 'Value'];
    const rows = gear.map((g) => [
      g.assetTag,
      `"${(g.name || '').replace(/"/g, '""')}"`,
      `"${(g.brand || '').replace(/"/g, '""')}"`,
      `"${(g.model || '').replace(/"/g, '""')}"`,
      g.category,
      g.status,
      g.condition,
      `"${(g.location || '').replace(/"/g, '""')}"`,
      g.serialNumber,
      g.replacementValue,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cinevault-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-100 selection:text-amber-900 font-sans">
      {/* Top Universal Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-[2000px] xl:max-w-[2100px] 2xl:max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'field' && (
          <FieldShootSummaryView
            gear={gear}
            projects={projects}
            currentUser={currentUser}
            onSelectGear={(item) => setSelectedGearItem(item)}
            onCheckinGear={(id, condition, returnNotes) =>
              handleConfirmCheckin(id, condition, returnNotes, '')
            }
            onBatchCheckin={async (ids) => {
              for (const id of ids) {
                await handleConfirmCheckin(id, 'Good', 'Batch returned from field shoot', '');
              }
            }}
            onOpenQrModal={(item) => {
              setSelectedGearItem(item);
            }}
            onReportIssue={(item) => {
              setSelectedGearItem(item);
              setActiveTab('maintenance');
            }}
            onUpdateGear={handleUpdateGear}
            onAddProject={(newProject) => {
              setProjects((prev) => [newProject, ...prev]);
              const now = new Date().toISOString();
              const auditEntry: AuditLog = {
                id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                timestamp: now,
                userId: currentUser.id,
                userName: currentUser.name,
                userRole: currentUser.role,
                provider: currentUser.provider,
                action: 'CREATE',
                targetAssetTag: newProject.name,
                targetName: newProject.name,
                details: `Scheduled new shoot deployment: "${newProject.name}" (Date: ${newProject.startDate})`,
                ipOrDevice: 'Web Client',
              };
              setAuditLogs((prev) => [auditEntry, ...prev]);
            }}
            onProjectsChange={setProjects}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            gear={gear}
            currentUser={currentUser}
            onSelectGear={(item) => setSelectedGearItem(item)}
            onEditGear={(item) => setEditingGearItem(item)}
            onUpdateGear={handleUpdateGear}
            onDuplicateGear={handleDuplicateGear}
            onDeleteGear={handleDeleteGear}
            onOpenAddModal={() => setIsAddGearOpen(true)}
            onOpenCheckoutModal={openCheckoutForItems}
            onOpenCheckinModal={openCheckinForItem}
            onOpenQrModal={(item) => {
              setSelectedGearItem(item);
            }}
            onOpenBatchQrModal={() => setActiveTab('qr')}
            onOpenMaintenanceModal={(item) => {
              setSelectedGearItem(item);
              setActiveTab('maintenance');
            }}
            onExportCsv={handleExportCsv}
            onCheckoutGear={(item) => openCheckoutForItems([item])}
            onCheckinGear={openCheckinForItem}
            onAddGearClick={() => setIsAddGearOpen(true)}
            onBatchCheckout={openCheckoutForItems}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            gear={gear}
            maintenance={maintenance}
            projects={projects}
            onNavigateToField={() => setActiveTab('field')}
            onNavigateToInventory={() => setActiveTab('inventory')}
            onNavigateToMaintenance={() => setActiveTab('maintenance')}
            onSelectGearItem={(item) => setSelectedGearItem(item)}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceView
            gear={gear}
            maintenance={maintenance}
            currentUser={currentUser}
            onAddMaintenance={handleAddMaintenance}
            onSelectGear={(item) => setSelectedGearItem(item)}
            onBatchClearHorizon={handleBatchClearHorizon}
            onResolveHorizonItem={handleResolveHorizonItem}
            onDeleteHorizonItem={handleDeleteHorizonItem}
            onUpdateGear={handleUpdateGear}
          />
        )}

        {activeTab === 'qr' && (
          <QrTagManager
            gear={gear}
            onSelectGear={(item) => setSelectedGearItem(item)}
            onQuickCheckout={(item) => openCheckoutForItems([item])}
            onQuickCheckin={openCheckinForItem}
          />
        )}
      </main>

      {/* Footer System Status Strip */}
      <footer className="no-print border-t border-slate-200 bg-white py-3.5 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-800 font-semibold">CineVault Camera Fleet Operations</span>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-500 hidden sm:inline">Automatic Real-Time Sync</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Real-Time Persistent Storage Active
          </span>
          <span className="text-slate-300">•</span>
          <span>Role: <strong className="text-slate-700">{currentUser.role}</strong> ({currentUser.name})</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        auditLogs={auditLogs}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutQueue}
        currentUser={currentUser}
        onConfirmCheckout={handleConfirmCheckout}
      />

      <CheckinModal
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        item={checkinTarget}
        currentUser={currentUser}
        onConfirmCheckin={handleConfirmCheckin}
      />

      <AddGearModal
        isOpen={isAddGearOpen}
        onClose={() => setIsAddGearOpen(false)}
        currentUser={currentUser}
        onAddGear={handleAddGear}
      />

      <ItemDetailModal
        isOpen={!!selectedGearItem}
        onClose={() => setSelectedGearItem(null)}
        item={selectedGearItem}
        currentUser={currentUser}
        maintenanceRecords={maintenance}
        onCheckout={(item) => openCheckoutForItems([item])}
        onCheckin={openCheckinForItem}
        onOpenMaintenance={(item) => {
          setActiveTab('maintenance');
          setSelectedGearItem(null);
        }}
        onEditGear={(item) => setEditingGearItem(item)}
        onUpdateGear={handleUpdateGear}
      />

      <EditGearModal
        isOpen={!!editingGearItem}
        onClose={() => setEditingGearItem(null)}
        item={editingGearItem}
        currentUser={currentUser}
        onSaveGear={handleUpdateGear}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onClearAll={() => setNotifications([])}
        onSelectGearById={(id) => {
          const item = gear.find((g) => g.id === id);
          if (item) setSelectedGearItem(item);
        }}
      />
    </div>
  );
}


