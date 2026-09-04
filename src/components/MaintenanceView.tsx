import React, { useState, useEffect, useMemo } from 'react';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  DollarSign,
  Calendar,
  Filter,
  Search,
  ExternalLink,
  ShieldAlert,
  Trash2,
  Check,
  X,
  List,
  LayoutGrid,
  CalendarDays,
  ArrowRight,
  Sparkles,
  MapPin,
  Tag,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { GearItem, MaintenanceRecord, UserAccount, ConditionRating } from '../types';

interface MaintenanceViewProps {
  gear: GearItem[];
  maintenance: MaintenanceRecord[];
  currentUser: UserAccount;
  onAddMaintenance: (record: Partial<MaintenanceRecord>) => void;
  onSelectGear: (item: GearItem) => void;
  onBatchClearHorizon?: () => void;
  onResolveHorizonItem?: (item: GearItem) => void;
  onDeleteHorizonItem?: (item: GearItem) => void;
  onUpdateGear?: (item: GearItem) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  gear,
  maintenance,
  currentUser,
  onAddMaintenance,
  onSelectGear,
  onBatchClearHorizon,
  onResolveHorizonItem,
  onDeleteHorizonItem,
  onUpdateGear,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');

  // Context menu state for virtual right-click on Horizon items
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    item: GearItem | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    item: null,
  });

  // Batch clear confirmation modal state
  const [showBatchClearModal, setShowBatchClearModal] = useState(false);

  // Chronological Horizon Presentation States
  const [horizonViewMode, setHorizonViewMode] = useState<'timeline' | 'swimlane' | 'agenda'>('timeline');
  const [horizonTimeFilter, setHorizonTimeFilter] = useState<'all' | 'overdue' | 'week' | 'month' | 'quarter'>('all');
  const [horizonSearch, setHorizonSearch] = useState('');

  // Close context menu on outside click or scroll
  useEffect(() => {
    const handleDismiss = () => {
      if (contextMenu.isOpen) {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('click', handleDismiss);
    window.addEventListener('scroll', handleDismiss, true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.isOpen]);

  // New record form state
  const [selectedGearId, setSelectedGearId] = useState(gear[0]?.id || '');
  const [serviceType, setServiceType] = useState<MaintenanceRecord['serviceType']>('Sensor Cleaning');
  const [technician, setTechnician] = useState(currentUser.name);
  const [vendor, setVendor] = useState('');
  const [cost, setCost] = useState<number | string>(0);
  const [conditionAfter, setConditionAfter] = useState<ConditionRating>('Mint');
  const [nextServiceDueDate, setNextServiceDueDate] = useState(
    new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [resolved, setResolved] = useState(true);

  const canLogMaintenance = currentUser.role === 'Admin' || currentUser.role === 'Equipment Manager';

  const today = new Date();

  // Metrics
  const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
  const pendingRecords = maintenance.filter((m) => !m.resolved);

  const overdueItems = gear.filter((g) => {
    if (!g.nextServiceDate) return false;
    return new Date(g.nextServiceDate) < today;
  });

  const upcomingItems = gear.filter((g) => {
    if (!g.nextServiceDate) return false;
    const d = new Date(g.nextServiceDate);
    const diff = (d.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 30;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGearId) return;

    onAddMaintenance({
      gearId: selectedGearId,
      date: new Date().toISOString().split('T')[0],
      serviceType,
      technician: technician || currentUser.name,
      vendor: vendor || undefined,
      cost: Number(cost) || 0,
      conditionAfter,
      notes,
      nextServiceDueDate: nextServiceDueDate || undefined,
      resolved,
    });

    setShowAddForm(false);
    setNotes('');
    setCost(0);
  };

  const filteredLogs = maintenance.filter((m) => {
    if (filterType !== 'All' && m.serviceType !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchedGear = gear.find((g) => g.id === m.gearId);
      const match =
        m.serviceType.toLowerCase().includes(q) ||
        m.technician.toLowerCase().includes(q) ||
        m.notes.toLowerCase().includes(q) ||
        (m.vendor && m.vendor.toLowerCase().includes(q)) ||
        (matchedGear && (matchedGear.name.toLowerCase().includes(q) || matchedGear.assetTag.toLowerCase().includes(q)));
      if (!match) return false;
    }
    return true;
  });

  // Raw items with nextServiceDate, strictly sorted chronologically ascending
  const rawHorizonItems = useMemo(() => {
    return gear
      .filter((g) => !!g.nextServiceDate)
      .sort((a, b) => new Date(a.nextServiceDate!).getTime() - new Date(b.nextServiceDate!).getTime());
  }, [gear]);

  // Alias for backward-compatibility
  const horizonItems = rawHorizonItems;

  // Enhanced with chronological metadata & countdowns
  const horizonItemsWithMeta = useMemo(() => {
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    return rawHorizonItems.map((item) => {
      const parts = item.nextServiceDate!.split('-');
      const itemDate = parts.length === 3 
        ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])) 
        : new Date(item.nextServiceDate!);

      const targetMidnight = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()).getTime();
      const diffDays = Math.round((targetMidnight - todayMidnight) / (1000 * 3600 * 24));
      const isOverdue = diffDays < 0;
      const isDueToday = diffDays === 0;
      const isDueThisWeek = diffDays > 0 && diffDays <= 7;
      const isDueThisMonth = diffDays > 7 && diffDays <= 30;
      const isDueNextQuarter = diffDays > 30 && diffDays <= 90;

      const monthKey = itemDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const dayName = itemDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = itemDate.getDate();
      const monthAbbr = itemDate.toLocaleDateString('en-US', { month: 'short' });
      const formattedDate = `${monthAbbr} ${dayNumber}, ${itemDate.getFullYear()}`;

      let urgencyLabel = '';
      if (isOverdue) {
        const abs = Math.abs(diffDays);
        urgencyLabel = `${abs} ${abs === 1 ? 'day' : 'days'} overdue`;
      } else if (isDueToday) {
        urgencyLabel = 'Due today';
      } else if (diffDays <= 7) {
        urgencyLabel = `In ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
      } else if (diffDays <= 30) {
        urgencyLabel = `In ${diffDays} days`;
      } else {
        urgencyLabel = `In ${diffDays} days (~${Math.round(diffDays / 30)}mo)`;
      }

      return {
        item,
        date: itemDate,
        dateString: item.nextServiceDate!,
        formattedDate,
        monthKey,
        monthAbbr,
        dayName,
        dayNumber,
        diffDays,
        isOverdue,
        isDueToday,
        isDueThisWeek,
        isDueThisMonth,
        isDueNextQuarter,
        urgencyLabel,
      };
    });
  }, [rawHorizonItems, today]);

  // Counts for filter bar
  const countOverdue = useMemo(() => horizonItemsWithMeta.filter((h) => h.isOverdue).length, [horizonItemsWithMeta]);
  const countWeek = useMemo(() => horizonItemsWithMeta.filter((h) => h.diffDays >= 0 && h.diffDays <= 7).length, [horizonItemsWithMeta]);
  const countMonth = useMemo(() => horizonItemsWithMeta.filter((h) => h.diffDays > 7 && h.diffDays <= 30).length, [horizonItemsWithMeta]);
  const countQuarter = useMemo(() => horizonItemsWithMeta.filter((h) => h.diffDays > 30 && h.diffDays <= 90).length, [horizonItemsWithMeta]);

  // Filtered horizon items based on timeline filter and search
  const filteredHorizonItems = useMemo(() => {
    return horizonItemsWithMeta.filter((h) => {
      if (horizonTimeFilter === 'overdue' && !h.isOverdue) return false;
      if (horizonTimeFilter === 'week' && !(h.isDueToday || h.isDueThisWeek)) return false;
      if (horizonTimeFilter === 'month' && !h.isDueThisMonth) return false;
      if (horizonTimeFilter === 'quarter' && !h.isDueNextQuarter) return false;

      if (horizonSearch) {
        const q = horizonSearch.toLowerCase();
        const match =
          h.item.name.toLowerCase().includes(q) ||
          h.item.assetTag.toLowerCase().includes(q) ||
          h.item.brand.toLowerCase().includes(q) ||
          h.item.model.toLowerCase().includes(q) ||
          h.item.location.toLowerCase().includes(q) ||
          h.item.category.toLowerCase().includes(q) ||
          h.dateString.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [horizonItemsWithMeta, horizonTimeFilter, horizonSearch]);

  // Chronologically grouped by month
  const chronologicalMonthGroups = useMemo(() => {
    const map = new Map<string, typeof filteredHorizonItems>();
    filteredHorizonItems.forEach((h) => {
      const existing = map.get(h.monthKey) || [];
      existing.push(h);
      map.set(h.monthKey, existing);
    });
    return Array.from(map.entries()).map(([monthKey, items]) => ({
      monthKey,
      items,
      hasOverdue: items.some((i) => i.isOverdue),
    }));
  }, [filteredHorizonItems]);

  const handleBatchClear = () => {
    setShowBatchClearModal(true);
  };

  const confirmBatchClear = () => {
    if (onBatchClearHorizon) {
      onBatchClearHorizon();
    } else if (onUpdateGear) {
      rawHorizonItems.forEach((item) => {
        onUpdateGear({
          ...item,
          nextServiceDate: undefined,
        });
      });
    }
    setShowBatchClearModal(false);
  };

  const handleResolveItem = (item: GearItem) => {
    if (onResolveHorizonItem) {
      onResolveHorizonItem(item);
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      const interval = item.maintenanceIntervalDays || 90;
      const nextDue = new Date(Date.now() + 86400000 * interval).toISOString().split('T')[0];

      onAddMaintenance({
        gearId: item.id,
        date: todayStr,
        serviceType: 'Calibration',
        technician: currentUser.name,
        conditionAfter: 'Mint',
        notes: 'Routine service/calibration resolved from Service Horizon schedule.',
        nextServiceDueDate: nextDue,
        resolved: true,
      });

      if (onUpdateGear) {
        onUpdateGear({
          ...item,
          status: item.status === 'In Maintenance' ? 'Available' : item.status,
          condition: 'Mint',
          lastServiceDate: todayStr,
          nextServiceDate: nextDue,
        });
      }
    }
    setContextMenu({ isOpen: false, x: 0, y: 0, item: null });
  };

  const handleDeleteItem = (item: GearItem) => {
    if (onDeleteHorizonItem) {
      onDeleteHorizonItem(item);
    } else if (onUpdateGear) {
      onUpdateGear({
        ...item,
        nextServiceDate: undefined,
      });
    }
    setContextMenu({ isOpen: false, x: 0, y: 0, item: null });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              Fleet Reliability & Health
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Maintenance & Service Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track optical collimations, sensor cleanings, electronic repairs, and upcoming calibration dates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canLogMaintenance ? (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>{showAddForm ? 'Cancel Entry' : 'Log Service Record'}</span>
            </button>
          ) : (
            <span
              title={`Service logging is reserved for Admin and Equipment Managers. Current role: ${currentUser.role}`}
              className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium"
            >
              {currentUser.role === 'Auditor' ? 'Auditor (Read-Only Ledger)' : 'Read-Only Service View'}
            </span>
          )}
        </div>
      </div>

      {/* Service Horizon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overdue */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-rose-700 text-xs uppercase tracking-wider font-bold mb-1">
              Overdue Calibration
            </p>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">
            {overdueItems.length} <span className="text-xs font-medium text-slate-500">units</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Immediate service or bench check required
          </div>
        </div>

        {/* Due in 30 Days */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-amber-800 text-xs uppercase tracking-wider font-bold mb-1">
              Due Within 30 Days
            </p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">
            {upcomingItems.length} <span className="text-xs font-medium text-slate-500">units</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Scheduled routine inspections & firmware
          </div>
        </div>

        {/* Total Service Expenditure */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-emerald-800 text-xs uppercase tracking-wider font-bold mb-1">
              Total Service Spend
            </p>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            ${totalMaintenanceCost.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Across {maintenance.length} recorded service sessions
          </div>
        </div>
      </div>

      {/* Add Maintenance Form Modal / Accordion */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-500" />
              New Service & Maintenance Entry
            </h2>
            <span className="text-xs text-slate-500 font-medium">Logged by: {currentUser.name}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Gear Selector */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Equipment</label>
              <select
                value={selectedGearId}
                onChange={(e) => setSelectedGearId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer font-medium"
                required
              >
                {gear.map((g) => (
                  <option key={g.id} value={g.id}>
                    [{g.assetTag}] {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer font-medium"
              >
                <option value="Sensor Cleaning">Sensor Cleaning</option>
                <option value="Calibration">Optical / Flange Calibration</option>
                <option value="Firmware Update">Firmware Update</option>
                <option value="Optical Inspection">Optical Inspection</option>
                <option value="Shutter Repair">Shutter Repair</option>
                <option value="Cable Re-termination">Cable Re-termination</option>
                <option value="General Overhaul">General Overhaul</option>
              </select>
            </div>

            {/* Technician */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Technician</label>
              <input
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                placeholder="e.g. AbelCine / Duclos / Internal Tech"
                required
              />
            </div>

            {/* External Vendor */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Vendor / Service Facility</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                placeholder="e.g. ARRI Burbank, AbelCine LA"
              />
            </div>

            {/* Cost */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Service Cost ($ USD)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                min="0"
                step="0.01"
              />
            </div>

            {/* Condition After */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Condition Rating After Service</label>
              <select
                value={conditionAfter}
                onChange={(e) => setConditionAfter(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer font-medium"
              >
                <option value="Mint">Mint (Like New)</option>
                <option value="Good">Good (Field Ready)</option>
                <option value="Fair">Fair</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="Damaged">Damaged / Non-operational</option>
              </select>
            </div>

            {/* Next Service Date */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Next Service Due Date</label>
              <input
                type="date"
                value={nextServiceDueDate}
                onChange={(e) => setNextServiceDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
              />
            </div>

            {/* Resolved Checkbox */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="resolved-check"
                checked={resolved}
                onChange={(e) => setResolved(e.target.checked)}
                className="rounded bg-white border-slate-300 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="resolved-check" className="text-slate-700 font-semibold cursor-pointer">
                Issue Resolved (Return to Available status)
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-xs">Technical Notes & Findings</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Describe work performed, parts replaced, calibration tolerances, or warranty notes..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
            >
              Save Service Record
            </button>
          </div>
        </form>
      )}

      {/* Service & Calibration Horizon — Chronological Presentation */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        {/* Header with Title, Stats, and View Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <CalendarDays className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Service & Calibration Horizon
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {rawHorizonItems.length} {rawHorizonItems.length === 1 ? 'unit' : 'units'} scheduled
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Chronological schedule of bench inspections, firmware upgrades, and calibration deadlines. Right-click any item for instant actions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search within horizon */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter horizon..."
                value={horizonSearch}
                onChange={(e) => setHorizonSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all w-36 sm:w-44 font-medium"
              />
            </div>

            {/* View Switcher Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setHorizonViewMode('timeline')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  horizonViewMode === 'timeline'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View as Chronological Timeline Stream"
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Timeline</span>
              </button>
              <button
                type="button"
                onClick={() => setHorizonViewMode('swimlane')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  horizonViewMode === 'swimlane'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View as Monthly Swimlanes"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-blue-500" />
                <span>Monthly</span>
              </button>
              <button
                type="button"
                onClick={() => setHorizonViewMode('agenda')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  horizonViewMode === 'agenda'
                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View as Chronological Agenda Table"
              >
                <List className="w-3.5 h-3.5 text-emerald-500" />
                <span>Agenda</span>
              </button>
            </div>

            {/* Batch Clear Button */}
            {canLogMaintenance && rawHorizonItems.length > 0 && (
              <button
                type="button"
                onClick={handleBatchClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                title="Clear all scheduled calibration dates from the horizon"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Batch Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Chronological Milestones / Horizon Range Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1 pr-1 text-[11px] uppercase tracking-wider">
            <Filter className="w-3 h-3 text-amber-500" />
            <span>Time Horizon:</span>
          </span>

          <button
            type="button"
            onClick={() => setHorizonTimeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
              horizonTimeFilter === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            All Forecast ({rawHorizonItems.length})
          </button>

          <button
            type="button"
            onClick={() => setHorizonTimeFilter('overdue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
              horizonTimeFilter === 'overdue'
                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                : countOverdue > 0
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${countOverdue > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
            <span>Overdue ({countOverdue})</span>
          </button>

          <button
            type="button"
            onClick={() => setHorizonTimeFilter('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
              horizonTimeFilter === 'week'
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : countWeek > 0
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Next 7 Days ({countWeek})</span>
          </button>

          <button
            type="button"
            onClick={() => setHorizonTimeFilter('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
              horizonTimeFilter === 'month'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : countMonth > 0
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>8 – 30 Days ({countMonth})</span>
          </button>

          <button
            type="button"
            onClick={() => setHorizonTimeFilter('quarter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
              horizonTimeFilter === 'quarter'
                ? 'bg-slate-700 text-white border-slate-700 shadow-xs'
                : countQuarter > 0
                ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
          >
            <span>31 – 90 Days ({countQuarter})</span>
          </button>
        </div>

        {/* Content Area */}
        {filteredHorizonItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="font-semibold text-slate-700">No equipment matching this chronological horizon filter.</p>
            <p className="text-[11px] text-slate-400">Try selecting "All Forecast" or clearing your search term.</p>
          </div>
        ) : horizonViewMode === 'timeline' ? (
          /* View 1: Chronological Timeline Stream */
          <div className="space-y-6 pt-1">
            {chronologicalMonthGroups.map((group) => (
              <div key={group.monthKey} className="space-y-3">
                {/* Month Milestone Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{group.monthKey}</span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.2 rounded-full border border-slate-200">
                      {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Vertical Timeline Track */}
                <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-3.5">
                  {group.items.map(({ item, dayName, dayNumber, monthAbbr, isOverdue, isDueToday, urgencyLabel, diffDays }) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectGear(item)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const menuWidth = 200;
                        const menuHeight = 110;
                        const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
                        const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
                        setContextMenu({
                          isOpen: true,
                          x: Math.max(10, x),
                          y: Math.max(10, y),
                          item,
                        });
                      }}
                      className={`relative group p-4 rounded-2xl border transition-all cursor-pointer select-none shadow-2xs hover:shadow-xs ${
                        isOverdue
                          ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                          : isDueToday
                          ? 'bg-amber-50/40 border-amber-300 hover:bg-amber-50'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-amber-400'
                      }`}
                      title="Right-click for options: Resolve or Delete"
                    >
                      {/* Timeline Bullet Node */}
                      <div
                        className={`absolute -left-[31px] sm:-left-[39px] top-5 w-4 h-4 rounded-full border-2 border-white transition-transform group-hover:scale-125 shadow-xs ${
                          isOverdue
                            ? 'bg-rose-500 ring-4 ring-rose-100'
                            : isDueToday
                            ? 'bg-amber-500 ring-4 ring-amber-100 animate-pulse'
                            : diffDays <= 7
                            ? 'bg-amber-500 ring-4 ring-amber-100'
                            : diffDays <= 30
                            ? 'bg-blue-500 ring-4 ring-blue-100'
                            : 'bg-slate-400 ring-4 ring-slate-100'
                        }`}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Left: Date Block & Equipment Identity */}
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Calendar Date Block */}
                          <div
                            className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center shrink-0 shadow-2xs ${
                              isOverdue
                                ? 'bg-rose-100/80 border-rose-300 text-rose-800'
                                : isDueToday
                                ? 'bg-amber-100/80 border-amber-300 text-amber-900'
                                : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                              {dayName}
                            </span>
                            <span className="text-lg font-black tracking-tight leading-none mt-0.5">
                              {dayNumber}
                            </span>
                            <span className="text-[9px] font-semibold uppercase text-slate-500 leading-none mt-0.5">
                              {monthAbbr}
                            </span>
                          </div>

                          {/* Gear details */}
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                                {item.assetTag}
                              </span>
                              <span className="text-xs font-bold text-slate-900 hover:text-amber-600 transition-colors">
                                {item.name}
                              </span>
                              {item.brand && (
                                <span className="text-xs text-slate-500 font-medium">
                                  • {item.brand} {item.model}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 font-medium">
                              <span>Location: <strong className="text-slate-700">{item.location}</strong></span>
                              <span className="text-slate-300">•</span>
                              <span>Category: <strong className="text-slate-700">{item.category}</strong></span>
                              <span className="text-slate-300">•</span>
                              <span>Status: <strong className="text-slate-700">{item.status}</strong></span>
                              <span className="text-slate-300">•</span>
                              <span>Interval: <strong className="text-slate-700">{item.maintenanceIntervalDays || 90}d</strong></span>
                            </div>

                            {item.notes && (
                              <p className="text-[11px] text-slate-500 italic line-clamp-1 pt-0.5">
                                "{item.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Urgency Pill & Quick Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                          {/* Urgency Pill */}
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border whitespace-nowrap shadow-2xs ${
                              isOverdue
                                ? 'bg-rose-100 text-rose-700 border-rose-300'
                                : isDueToday
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : diffDays <= 7
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                            {isDueToday && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                            <span>{urgencyLabel}</span>
                          </div>

                          {/* Quick Actions */}
                          {canLogMaintenance && (
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleResolveItem(item)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                title="Resolve: records completed calibration log into historical ledger"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Resolve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item)}
                                className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer shadow-2xs"
                                title="Delete: removes scheduled horizon date"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : horizonViewMode === 'swimlane' ? (
          /* View 2: Monthly Milestone Swimlanes */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {chronologicalMonthGroups.map((group) => (
              <div
                key={group.monthKey}
                className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900">{group.monthKey}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {group.items.length} units
                  </span>
                </div>

                {/* Cards within this month, strictly chronological */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {group.items.map(({ item, formattedDate, isOverdue, urgencyLabel }) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectGear(item)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const menuWidth = 200;
                        const menuHeight = 110;
                        const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
                        const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
                        setContextMenu({
                          isOpen: true,
                          x: Math.max(10, x),
                          y: Math.max(10, y),
                          item,
                        });
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none shadow-2xs ${
                        isOverdue
                          ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-50 hover:border-rose-300'
                          : 'bg-white border-slate-200 hover:border-amber-400'
                      }`}
                      title="Right-click for options: Resolve or Delete"
                    >
                      <div className="flex items-center justify-between gap-1 text-xs">
                        <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                          {item.assetTag}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-700 border-rose-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {urgencyLabel}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900 truncate mt-1.5">
                        {item.name}
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <span>Due: <strong className="text-slate-800">{formattedDate}</strong></span>
                        <span>{item.location}</span>
                      </div>

                      {canLogMaintenance && (
                        <div className="flex items-center justify-end gap-1.5 pt-2 mt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleResolveItem(item)}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Resolve</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* View 3: Chronological Agenda Table */
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 whitespace-nowrap">Due Date</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Urgency</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Asset Tag</th>
                  <th className="py-2.5 px-3 min-w-[200px]">Equipment / Model</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Category</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Location</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Status</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Interval</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredHorizonItems.map(({ item, formattedDate, isOverdue, urgencyLabel }) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectGear(item)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const menuWidth = 200;
                      const menuHeight = 110;
                      const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
                      const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
                      setContextMenu({
                        isOpen: true,
                        x: Math.max(10, x),
                        y: Math.max(10, y),
                        item,
                      });
                    }}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer select-none ${
                      isOverdue ? 'bg-rose-50/30' : ''
                    }`}
                    title="Right-click for options: Resolve or Delete"
                  >
                    <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                      <span className="font-mono text-slate-800">{formattedDate}</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-700 border-rose-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {urgencyLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {item.assetTag}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900 truncate max-w-[260px]">{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{item.brand} {item.model}</div>
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-700 font-medium">
                      {item.category}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap text-slate-700 font-medium">
                      {item.location}
                    </td>
                    <td className="py-2.5 px-2.5 whitespace-nowrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 font-medium">
                      {item.maintenanceIntervalDays || 90}d
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      {canLogMaintenance && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleResolveItem(item)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <Check className="w-3 h-3" />
                            <span>Resolve</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove from Horizon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Maintenance History Log */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Historical Service Records</h2>
            <p className="text-xs text-slate-500 mt-0.5">Complete audit log of all repairs, calibrations, and cleanings</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search service logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => {
            const matchedGear = gear.find((g) => g.id === log.gearId);
            return (
              <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {matchedGear?.assetTag || 'GEAR-TAG'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {log.serviceType}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">• {matchedGear?.name}</span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">{log.notes}</p>

                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 pt-1 font-medium">
                    <span>Date: <strong className="text-slate-800">{log.date}</strong></span>
                    <span className="text-slate-300">•</span>
                    <span>Tech: <strong className="text-slate-800">{log.technician}</strong></span>
                    {log.vendor && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>Vendor: <strong className="text-slate-800">{log.vendor}</strong></span>
                      </>
                    )}
                    <span className="text-slate-300">•</span>
                    <span>Result: <strong className="text-emerald-600">{log.conditionAfter}</strong></span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xs font-bold text-slate-900">
                    {log.cost > 0 ? `$${log.cost.toLocaleString()}` : 'In-House'}
                  </div>
                  {log.nextServiceDueDate && (
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Next: {log.nextServiceDueDate}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Virtual Right-Click Context Menu for Horizon Items */}
      {contextMenu.isOpen && contextMenu.item && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 animate-in fade-in-0 zoom-in-95 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 truncate">
            <span className="font-mono text-amber-800 font-bold">[{contextMenu.item.assetTag}]</span> {contextMenu.item.name}
          </div>
          <button
            type="button"
            onClick={() => handleResolveItem(contextMenu.item!)}
            className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col">
              <span>Resolve</span>
              <span className="text-[10px] text-emerald-600/80 font-normal">Log repair to equipment records</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleDeleteItem(contextMenu.item!)}
            className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100"
          >
            <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
            <div className="flex flex-col">
              <span>Delete</span>
              <span className="text-[10px] text-rose-600/80 font-normal">Remove scheduled horizon entry</span>
            </div>
          </button>
        </div>
      )}

      {/* Batch Clear Confirmation Modal */}
      {showBatchClearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Batch Clear Horizon</h3>
                  <p className="text-xs text-slate-500">Reset scheduled dates for {horizonItems.length} items.</p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchClearModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              Are you sure you want to clear the calibration and service schedule for all <strong>{horizonItems.length}</strong> items in the horizon? The equipment will remain in the catalog, but their next service dates will be cleared.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchClearModal(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBatchClear}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white cursor-pointer shadow-xs"
              >
                Clear All ({horizonItems.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
