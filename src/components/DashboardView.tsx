import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  Activity,
  Film,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Wrench,
  Boxes,
  MapPin,
  Calendar,
  Layers,
  User,
  Package,
  ChevronRight,
  ExternalLink,
  Handshake,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { GearItem, MaintenanceRecord, ShootProject, GearCategory } from '../types';
import { formatDateDDMMYYYY, normalizeDateToYMD, formatCurrencySGD } from '../utils/dateUtils';
import { getCategoryTheme } from './InventoryView';

interface DashboardViewProps {
  gear: GearItem[];
  maintenance?: MaintenanceRecord[];
  projects?: ShootProject[];
  onNavigateToField: () => void;
  onNavigateToInventory: (categoryFilter?: string) => void;
  onNavigateToMaintenance?: () => void;
  onSelectGearItem?: (item: GearItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  gear,
  maintenance = [],
  projects = [],
  onNavigateToField,
  onNavigateToInventory,
  onNavigateToMaintenance = () => {},
  onSelectGearItem = (_item: GearItem) => {},
}) => {
  // Category custom colour codes stored in localStorage
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('cinevault_category_colors');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const syncColors = () => {
      try {
        const stored = localStorage.getItem('cinevault_category_colors');
        setCategoryColors(stored ? JSON.parse(stored) : {});
      } catch {}
    };
    window.addEventListener('storage', syncColors);
    window.addEventListener('cinevault-category-colors-changed', syncColors);
    return () => {
      window.removeEventListener('storage', syncColors);
      window.removeEventListener('cinevault-category-colors-changed', syncColors);
    };
  }, []);

  // Macro view controls for Active Shoots & Deployed Equipment
  const [macroViewMode, setMacroViewMode] = useState<'by-project' | 'fleet-roster'>('by-project');
  const [macroCategoryFilter, setMacroCategoryFilter] = useState<string>('ALL');
  const [macroSearchQuery, setMacroSearchQuery] = useState<string>('');

  // Calculations
  const totalFleetValue = gear.reduce((sum, g) => sum + g.replacementValue, 0);
  const checkedOutCount = gear.filter((g) => g.status === 'Checked Out').length;
  const availableCount = gear.filter((g) => g.status === 'Available').length;
  const inMaintenanceCount = gear.filter((g) => g.status === 'In Maintenance').length;
  const utilizationRate = gear.length > 0 ? Math.round((checkedOutCount / gear.length) * 100) : 0;

  // Loan tracking
  const loanedItems = useMemo(() => gear.filter((g) => g.status === 'Out On Loan'), [gear]);

  // Overdue and upcoming maintenance
  const today = new Date();
  const overdueMaintenanceGear = gear.filter((g) => {
    if (!g.nextServiceDate) return false;
    return new Date(g.nextServiceDate) < today;
  });

  const upcomingMaintenanceGear = gear.filter((g) => {
    if (!g.nextServiceDate) return false;
    const nextDate = new Date(g.nextServiceDate);
    const diffDays = (nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 14;
  });

  // Category stats
  const categories: GearCategory[] = [
    'Cameras',
    'Lenses',
    'Lighting',
    'Audio',
    'Grip & Support',
    'Power & Batteries',
    'Media & Storage',
    'Accessories',
  ];

  const categoryStats = categories.map((cat) => {
    const items = gear.filter((g) => g.category === cat);
    const out = items.filter((g) => g.status === 'Checked Out').length;
    const rate = items.length > 0 ? Math.round((out / items.length) * 100) : 0;
    return {
      category: cat,
      total: items.length,
      checkedOut: out,
      available: items.filter((g) => g.status === 'Available').length,
      maintenance: items.filter((g) => g.status === 'In Maintenance').length,
      utilizationRate: rate,
    };
  });

  // Kits analysis
  const kits = Array.from(new Set(gear.filter((g) => g.kitName).map((g) => g.kitName as string)));
  const kitAnalysis = kits.map((kitName) => {
    const kitItems = gear.filter((g) => g.kitName === kitName);
    const checkedOut = kitItems.filter((g) => g.status === 'Checked Out').length;
    const allAvailable = kitItems.every((g) => g.status === 'Available');
    const allOnShoot = kitItems.every((g) => g.status === 'Checked Out');
    return {
      name: kitName,
      totalItems: kitItems.length,
      checkedOut,
      allAvailable,
      allOnShoot,
      status: allOnShoot ? 'In Field' : allAvailable ? 'Cage Ready' : 'Partial / Mixed',
    };
  });

  // Active Shoots & Equipment Movement Tracking
  const activeShoots = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      jobNo?: string;
      client: string;
      leadDP: string;
      location: string;
      startDate: string;
      endDate: string;
      status: 'On Shoot' | 'Prep' | 'Wrapped' | 'Cancelled';
      assignedGear: GearItem[];
      totalValue: number;
    }> = [];

    const projectNamesSeen = new Set<string>();

    // 1. Configured projects
    projects.forEach((proj) => {
      const assigned = gear.filter((g) => {
        if (g.status !== 'Checked Out') return false;
        const matchesName =
          g.currentCheckout?.projectName?.trim().toLowerCase() ===
          proj.name.trim().toLowerCase();
        const matchesId = proj.assignedGearIds?.includes(g.id);
        return matchesName || matchesId;
      });

      projectNamesSeen.add(proj.name.trim().toLowerCase());
      const totalVal = assigned.reduce((sum, g) => sum + g.replacementValue, 0);

      list.push({
        id: proj.id,
        name: proj.name,
        jobNo: proj.jobNo || assigned[0]?.currentCheckout?.jobNo,
        client: proj.client || 'Client Production',
        leadDP: proj.leadDP || 'Lead DP',
        location: proj.location || 'Field Location',
        startDate: proj.startDate,
        endDate: proj.endDate,
        status: proj.status,
        assignedGear: assigned,
        totalValue: totalVal,
      });
    });

    // 2. Discover dynamically from any active checkouts with unlisted projects
    gear.forEach((g) => {
      if (g.status === 'Checked Out' && g.currentCheckout?.projectName) {
        const pName = g.currentCheckout.projectName.trim();
        const pKey = pName.toLowerCase();
        if (!projectNamesSeen.has(pKey)) {
          projectNamesSeen.add(pKey);
          const relatedGear = gear.filter(
            (item) =>
              item.status === 'Checked Out' &&
              item.currentCheckout?.projectName?.trim().toLowerCase() === pKey
          );
          list.push({
            id: `dyn-proj-${g.currentCheckout.id}`,
            name: pName,
            jobNo: g.currentCheckout.jobNo,
            client: 'Field Production',
            leadDP: g.currentCheckout.userName || 'Lead Cinematographer',
            location: g.currentCheckout.shootLocation || 'Field Location',
            startDate: g.currentCheckout.checkoutDate.split('T')[0],
            endDate: g.currentCheckout.expectedReturnDate.split('T')[0],
            status: 'On Shoot',
            assignedGear: relatedGear,
            totalValue: relatedGear.reduce((sum, item) => sum + item.replacementValue, 0),
          });
        }
      }
    });

    // Show active shoots (On Shoot or Prep or with gear deployed)
    return list
      .filter((p) => p.status === 'On Shoot' || p.status === 'Prep' || p.assignedGear.length > 0)
      .sort((a, b) => {
        if (a.status === 'On Shoot' && b.status !== 'On Shoot') return -1;
        if (b.status === 'On Shoot' && a.status !== 'On Shoot') return 1;
        return b.assignedGear.length - a.assignedGear.length;
      });
  }, [projects, gear]);

  const totalValueOnLocation = activeShoots.reduce((sum, p) => sum + p.totalValue, 0);

  // Macro all deployed gear across all projects/checkouts
  const allDeployedGear = useMemo(() => {
    return gear.filter((g) => g.status === 'Checked Out');
  }, [gear]);

  const totalMacroDeployedValue = useMemo(() => {
    return allDeployedGear.reduce((sum, g) => sum + (g.replacementValue || 0), 0);
  }, [allDeployedGear]);

  // Macro category counts across all deployed equipment
  const macroCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allDeployedGear.forEach((item) => {
      const cat = item.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [allDeployedGear]);

  const macroDeployedCategories = useMemo(() => {
    return Object.keys(macroCategoryCounts).sort(
      (a, b) => macroCategoryCounts[b] - macroCategoryCounts[a]
    );
  }, [macroCategoryCounts]);

  // Enriched deployed gear for fleet roster
  const enrichedDeployedGear = useMemo(() => {
    return allDeployedGear.map((item) => {
      const matchedProject = activeShoots.find(
        (p) =>
          p.assignedGear.some((g) => g.id === item.id) ||
          p.name.trim().toLowerCase() === item.currentCheckout?.projectName?.trim().toLowerCase()
      );
      return {
        item,
        projectName: matchedProject?.name || item.currentCheckout?.projectName || 'Field Deployment',
        jobNo: matchedProject?.jobNo || item.currentCheckout?.jobNo,
        leadDP: matchedProject?.leadDP || item.currentCheckout?.userName || 'Lead DP',
        location: matchedProject?.location || item.currentCheckout?.shootLocation || 'On Location',
        returnDate: matchedProject?.endDate || item.currentCheckout?.expectedReturnDate?.split('T')[0],
      };
    });
  }, [allDeployedGear, activeShoots]);

  const filteredMacroGear = useMemo(() => {
    return enrichedDeployedGear.filter(({ item, projectName, leadDP }) => {
      if (macroCategoryFilter !== 'ALL' && item.category !== macroCategoryFilter) {
        return false;
      }
      if (macroSearchQuery.trim()) {
        const q = macroSearchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchTag = item.assetTag.toLowerCase().includes(q);
        const matchProj = projectName.toLowerCase().includes(q);
        const matchDP = leadDP.toLowerCase().includes(q);
        return matchName || matchTag || matchProj || matchDP;
      }
      return true;
    });
  }, [enrichedDeployedGear, macroCategoryFilter, macroSearchQuery]);

  // Return countdown helper
  const getReturnCountdown = (endDateStr?: string) => {
    if (!endDateStr) return null;
    const target = new Date(endDateStr);
    const curr = new Date();
    curr.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `${Math.abs(diffDays)}d Overdue`,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (diffDays === 0) {
      return {
        label: 'Returns Today',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    }
    if (diffDays === 1) {
      return {
        label: 'Returns Tomorrow',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    }
    return {
      label: `Returns in ${diffDays} days`,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-bold text-amber-600">
              Fleet Operations & Field Movement Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Asset Operations Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tracking movement of {gear.length} production assets across {activeShoots.length} active shoots and studio locker bays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-nav-field-summary"
            onClick={onNavigateToField}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
          >
            <Film className="w-4 h-4 text-white" />
            <span>Field Shoot Summary</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
              {checkedOutCount}
            </span>
          </button>
        </div>
      </div>

      {/* 4 High-Impact Metric Cards (Swapped: Card 2 is now Active Shoots in Field, Card 3 is Fleet Utilization) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Registered Fleet Units (Replaced Fleet Valuation) */}
        <div id="metric-fleet-assets" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Registered Fleet Assets
            </p>
            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {gear.length} <span className="text-sm font-normal text-slate-500">Units</span>
            </h3>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span className="text-emerald-600 font-semibold">{gear.filter(g => g.status === 'Available').length} cage ready</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-600 font-semibold">{checkedOutCount} deployed</span>
            </div>
          </div>
        </div>

        {/* 2. SWAPPED: Active Shoots in Field */}
        <div id="metric-active-shoots" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Active Shoots in Field
            </p>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {String(activeShoots.length).padStart(2, '0')}
              </h3>
              <span className="text-xs font-semibold text-emerald-600">Productions Active</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
              <span className="text-slate-700 font-medium">
                <strong className="text-amber-600">{checkedOutCount}</strong> units deployed
              </span>
              <button
                id="btn-inspect-field-kpi"
                onClick={onNavigateToField}
                className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-0.5 cursor-pointer text-xs"
              >
                Inspect <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. SWAPPED: Fleet Utilization Rate */}
        <div id="metric-fleet-utilization" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Asset Utilization
            </p>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {utilizationRate}%
              </h3>
              <span className="text-xs font-semibold text-slate-500">of fleet deployed</span>
            </div>
            <div className="w-full bg-slate-100 h-2 mt-3 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-500 rounded-full"
                style={{ width: `${utilizationRate}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-2 flex justify-between font-medium">
              <span>{checkedOutCount} in field</span>
              <span>{availableCount} available</span>
            </div>
          </div>
        </div>

        {/* 4. Maintenance & Service Due */}
        <div id="metric-pending-maintenance" className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
              Pending Maintenance
            </p>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              overdueMaintenanceGear.length > 0
                ? 'bg-rose-50 border border-rose-100 text-rose-600'
                : 'bg-amber-50 border border-amber-100 text-amber-600'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <h3 className={`text-2xl font-bold tracking-tight ${
                overdueMaintenanceGear.length > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {String(overdueMaintenanceGear.length + upcomingMaintenanceGear.length).padStart(2, '0')}
              </h3>
              <span className="text-xs text-slate-500 font-medium">actions queued</span>
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              {overdueMaintenanceGear.length > 0 ? (
                <span className="text-rose-600 font-semibold">
                  {overdueMaintenanceGear.length} overdue calibration
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold">All service dates current</span>
              )}
              <span className="text-slate-300">•</span>
              <button
                onClick={onNavigateToMaintenance}
                className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                Logs <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Swapped! Active Shoots in Field takes the 2-column primary position, Utilization moves to the right 1-column position */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRIMARY 2-COL SECTION: Active Shoots in Field (Equipment Movement Tracker) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Film className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Active Shoots in Field</h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {activeShoots.length} Ongoing
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Live movement tracking of camera packages, lenses, lighting rigs, and crew deployments
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-view-field-management"
                  onClick={onNavigateToField}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Field Operations Console</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Macro Deployed Equipment Telemetry & Fleet Footprint */}
            <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-4 my-4 shadow-2xs">
              {/* Macro Summary Telemetry & View Selector */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3.5 border-b border-slate-200/80">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 divide-x divide-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Total Units Deployed
                    </span>
                    <span className="text-xl font-black text-slate-900 font-mono flex items-baseline gap-1.5">
                      {allDeployedGear.length}
                      <span className="text-xs font-semibold text-amber-600 font-sans">
                        active in field
                      </span>
                    </span>
                  </div>
                  <div className="pl-4 sm:pl-6">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Active Deployments
                    </span>
                    <span className="text-xl font-black text-slate-900 font-mono flex items-baseline gap-1.5">
                      {activeShoots.length}
                      <span className="text-xs font-semibold text-slate-500 font-sans">
                        productions
                      </span>
                    </span>
                  </div>
                  <div className="pl-4 sm:pl-6">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Deployed Fleet Valuation
                    </span>
                    <span className="text-xl font-black text-slate-900 font-mono">
                      {formatCurrencySGD(totalMacroDeployedValue)}
                    </span>
                  </div>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/90 self-start md:self-auto shadow-2xs">
                  <button
                    id="btn-view-by-project"
                    onClick={() => setMacroViewMode('by-project')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      macroViewMode === 'by-project'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>By Project ({activeShoots.length})</span>
                  </button>
                  <button
                    id="btn-view-fleet-roster"
                    onClick={() => setMacroViewMode('fleet-roster')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      macroViewMode === 'fleet-roster'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Macro Fleet Roster ({allDeployedGear.length})</span>
                  </button>
                </div>
              </div>

              {/* Macro Category Distribution Roster Across ALL Deployments */}
              <div className="pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    Macro Equipment Distribution (Across All Deployments)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {macroDeployedCategories.length} categories currently active in field
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center">
                  <button
                    onClick={() => {
                      setMacroCategoryFilter('ALL');
                      if (macroViewMode !== 'fleet-roster') setMacroViewMode('fleet-roster');
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      macroCategoryFilter === 'ALL' && macroViewMode === 'fleet-roster'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>All Fleet</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                        macroCategoryFilter === 'ALL' && macroViewMode === 'fleet-roster'
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {allDeployedGear.length}
                    </span>
                  </button>

                  {macroDeployedCategories.map((cat) => {
                    const count = macroCategoryCounts[cat];
                    const theme = getCategoryTheme(cat, categoryColors[cat]);
                    const isSelected = macroCategoryFilter === cat && macroViewMode === 'fleet-roster';

                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          if (macroCategoryFilter === cat && macroViewMode === 'fleet-roster') {
                            setMacroCategoryFilter('ALL');
                          } else {
                            setMacroCategoryFilter(cat);
                            setMacroViewMode('fleet-roster');
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : `${theme.badgeBg} hover:opacity-90`
                        }`}
                        title={`View ${cat} deployed units (${count})`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${theme.dot}`} />
                        <span>{cat}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                            isSelected ? 'bg-slate-800 text-white' : 'bg-white/90 text-slate-800'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}

                  {macroDeployedCategories.length === 0 && (
                    <span className="text-xs text-slate-400 italic">
                      No equipment currently deployed in the field.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* MODE 1: BY PROJECT VIEW (Focused on Project Title & Complete Manifest) */}
            {macroViewMode === 'by-project' && (
              <div className="space-y-4 mt-4">
                {activeShoots.map((proj) => {
                  const countdown = getReturnCountdown(proj.endDate);

                  // Group assigned gear by category
                  const catGrouped = proj.assignedGear.reduce((acc, item) => {
                    acc[item.category] = (acc[item.category] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  const kitNames = Array.from(
                    new Set(proj.assignedGear.filter((g) => g.kitName).map((g) => g.kitName as string))
                  );

                  return (
                    <div
                      key={proj.id}
                      id={`shoot-card-${proj.id}`}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs"
                    >
                      {/* Top Bar: Primary Focus on Deployment Title */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                              proj.status === 'On Shoot'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                proj.status === 'On Shoot' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                              }`}
                            />
                            {proj.status}
                          </span>

                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {proj.name}
                          </h3>

                          {proj.jobNo && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-900 border border-amber-300 text-[11px] font-mono font-bold tracking-wide shadow-2xs">
                              Job: {proj.jobNo}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                          {countdown && (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${countdown.badgeClass}`}
                            >
                              {countdown.label}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-700 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                            {formatCurrencySGD(proj.totalValue)}
                          </span>
                        </div>
                      </div>

                      {/* De-emphasized Secondary Metadata Bar (Location, DP, Client, Dates) */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 py-2 border-b border-slate-100">
                        <div className="flex items-center gap-1 text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-400">Lead DP:</span>
                          <span className="font-semibold text-slate-800">{proj.leadDP}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[240px]">{proj.location}</span>
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="text-slate-500">
                          <span className="text-slate-400">Client:</span> {proj.client}
                        </div>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {formatDateDDMMYYYY(proj.startDate)} → {formatDateDDMMYYYY(proj.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Kit Bundles (if any) */}
                      {kitNames.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-2 text-xs">
                          <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-slate-400 font-medium">Bundles:</span>
                          <div className="flex flex-wrap gap-1">
                            {kitNames.map((k) => (
                              <span
                                key={k}
                                className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10.5px] font-semibold"
                              >
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Equipment Movement Manifest (PRIMARY FOCUS - One-Glance Complete Visibility) */}
                      <div className="mt-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-amber-500" />
                              Equipment Manifest ({proj.assignedGear.length} units):
                            </span>
                            {/* Category badges for this shoot */}
                            <div className="flex items-center gap-1 flex-wrap">
                              {Object.entries(catGrouped).map(([cat, count]) => {
                                const theme = getCategoryTheme(cat, categoryColors[cat]);
                                return (
                                  <span
                                    key={cat}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${theme.badgeBg}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
                                    <span>{cat}:</span>
                                    <strong className="font-mono">{count}</strong>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          <button
                            onClick={onNavigateToField}
                            className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                          >
                            <span>Inspect in Field Console</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* All Equipment Items Grid (No 4-item truncation cutoff!) */}
                        {proj.assignedGear.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                            {proj.assignedGear.map((item) => {
                              const theme = getCategoryTheme(item.category, categoryColors[item.category]);
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => onSelectGearItem(item)}
                                  title={`Inspect ${item.name} (${item.assetTag})`}
                                  className={`group flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50/90 hover:bg-white border ${theme.containerBorder} hover:shadow-xs transition-all cursor-pointer`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span
                                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-tight shrink-0 border ${theme.badgeBg}`}
                                    >
                                      {item.assetTag}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors truncate">
                                        {item.name}
                                      </p>
                                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                        <span>{item.category}</span>
                                        {item.kitName && (
                                          <>
                                            <span>•</span>
                                            <span className="text-amber-600 font-medium truncate">
                                              {item.kitName}
                                            </span>
                                          </>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
                            No equipment currently recorded for this shoot manifest.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {activeShoots.length === 0 && (
                  <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-800">All Equipment in Cage</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      There are no active field shoots underway. All cameras, lenses, and lighting packages are accounted for in studio storage.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: MACRO FLEET ROSTER (All Deployed Equipment Across All Projects) */}
            {macroViewMode === 'fleet-roster' && (
              <div className="space-y-3 mt-4">
                {/* Search & Counter Bar for Macro Fleet */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={macroSearchQuery}
                      onChange={(e) => setMacroSearchQuery(e.target.value)}
                      placeholder="Search deployed gear, tag, project, or DP..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>Showing</span>
                    <strong className="text-slate-900 font-mono">{filteredMacroGear.length}</strong>
                    <span>of {allDeployedGear.length} deployed units</span>
                  </div>
                </div>

                {/* Macro Gear Cards Grid */}
                {filteredMacroGear.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                    {filteredMacroGear.map(({ item, projectName, jobNo, leadDP, returnDate }) => {
                      const theme = getCategoryTheme(item.category, categoryColors[item.category]);
                      const countdown = getReturnCountdown(returnDate);

                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectGearItem(item)}
                          title={`Inspect ${item.name} (${item.assetTag})`}
                          className={`group p-3 rounded-xl bg-white border ${theme.containerBorder} hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-2`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <span
                                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-tight shrink-0 border ${theme.badgeBg}`}
                              >
                                {item.assetTag}
                              </span>
                              <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors truncate">
                                {item.name}
                              </span>
                            </div>
                            {countdown && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${countdown.badgeClass}`}
                              >
                                {countdown.label}
                              </span>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <div className="truncate min-w-0 flex-1 flex items-center gap-1">
                              <Film className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="font-semibold text-slate-700 truncate">{projectName}</span>
                              {jobNo && (
                                <span className="font-mono text-[10px] text-slate-400">({jobNo})</span>
                              )}
                            </div>
                            <div className="shrink-0 flex items-center gap-1 text-slate-500">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[100px]">{leadDP}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <Boxes className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-800">No Matching Deployed Equipment</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {macroSearchQuery
                        ? `No deployed items matched "${macroSearchQuery}".`
                        : `No equipment in "${macroCategoryFilter}" is currently deployed.`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SIDE 1-COL SECTION: Fleet Utilization & Maintenance (Swapped into side column) */}
        <div className="space-y-6">
          {/* Active Loans Summary */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-purple-500" />
                  <h2 className="text-base font-bold text-slate-900">Active Loans</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Equipment currently on loan</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                loanedItems.length > 0
                  ? 'text-purple-600 bg-purple-50 border-purple-200'
                  : 'text-slate-500 bg-slate-50 border-slate-200'
              }`}>
                {loanedItems.length} {loanedItems.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {loanedItems.length === 0 ? (
              <div className="text-center py-5">
                <Handshake className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400 font-medium">No items currently on loan</p>
              </div>
            ) : (
              <div className="space-y-2">
                {loanedItems.map((item) => {
                  const loan = item.currentLoan;
                  const startYMD = normalizeDateToYMD(loan?.loanDate);
                  const endYMD = normalizeDateToYMD(loan?.expectedReturnDate);
                  const isOverdue = endYMD
                    ? new Date(endYMD + 'T23:59:59') < new Date()
                    : false;
                  const durationDays = (startYMD && endYMD)
                    ? Math.max(
                        1,
                        Math.round(
                          (new Date(endYMD + 'T00:00:00').getTime() -
                            new Date(startYMD + 'T00:00:00').getTime()) /
                            86400000
                        ) + 1
                      )
                    : null;

                  return (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer group"
                      onClick={() => onSelectGearItem?.(item)}
                      title="Click to view item details"
                    >
                      {/* Top Horizontal Row: Asset Tag + Name on Left, Full Loan Duration / Overdue Badge on Right */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-100/80 border border-purple-200 px-1.5 py-0.5 rounded-md shrink-0">
                            {item.assetTag}
                          </span>
                          <span className="text-xs font-bold text-slate-900 group-hover:text-purple-900 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5">
                          {loan && (
                            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-purple-400 shrink-0" />
                              <span className="font-mono text-[10.5px]">
                                {loan.loanDate ? formatDateDDMMYYYY(loan.loanDate) : '—'}
                              </span>
                              <span className="text-slate-500 font-medium text-[10.5px]">to</span>
                              <span
                                className={`font-mono text-[10.5px] ${
                                  isOverdue ? 'text-red-600 font-bold' : 'text-slate-700 font-medium'
                                }`}
                              >
                                {loan.expectedReturnDate
                                  ? formatDateDDMMYYYY(loan.expectedReturnDate)
                                  : '—'}
                              </span>
                            </span>
                          )}
                          {durationDays !== null && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-100/90 text-purple-800 font-bold text-[10px] shrink-0">
                              {durationDays}d
                            </span>
                          )}
                          {isOverdue && (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-md animate-pulse shrink-0">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Horizontal Row: Borrower (Left) and Purpose / Notes (Right) */}
                      {loan && (
                        <div className="flex items-center justify-between gap-2 mt-1.5 pt-1.5 border-t border-slate-100 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-600 truncate min-w-0 flex-1">
                            <User className="w-3 h-3 text-purple-400 shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">
                              {loan.borrowerName}
                            </span>
                            {loan.borrowerCompany && (
                              <span className="text-slate-400 truncate">· {loan.borrowerCompany}</span>
                            )}
                          </div>
                          {loan.purpose ? (
                            <span className="text-[10px] text-slate-400 truncate shrink-0 max-w-[170px] text-right" title={loan.purpose}>
                              {loan.purpose}
                            </span>
                          ) : loan.notes ? (
                            <span className="text-[10px] text-slate-400 truncate shrink-0 max-w-[170px] text-right" title={loan.notes}>
                              {loan.notes}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Utilization by Category */}
          <div id="utilization-category-box" className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-900">Utilization by Category</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Fleet deployment breakdown</p>
              </div>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                {utilizationRate}% Fleet
              </span>
            </div>

            <div className="space-y-3">
              {categoryStats.map((stat) => (
                <div
                  key={stat.category}
                  onClick={() => onNavigateToInventory(stat.category)}
                  className="group p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                      {stat.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">
                        <strong className="text-slate-900">{stat.checkedOut}</strong>/{stat.total}
                      </span>
                      <span className="font-bold text-amber-600 text-xs w-8 text-right">
                        {stat.utilizationRate}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                    <div
                      className="bg-amber-500 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${stat.utilizationRate}%` }}
                      title={`${stat.checkedOut} Deployed`}
                    />
                    {stat.maintenance > 0 && (
                      <div
                        className="bg-rose-500 h-full transition-all duration-500"
                        style={{ width: `${(stat.maintenance / stat.total) * 100}%` }}
                        title={`${stat.maintenance} In Maintenance`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Link to Catalog */}
            <button
              onClick={() => onNavigateToInventory()}
              className="w-full mt-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs transition-colors cursor-pointer font-semibold flex items-center justify-center gap-1 shadow-2xs"
            >
              <span>Browse Full Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Kit Readiness Overview */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                Production Kits
              </h3>
              <div className="space-y-2">
                {kitAnalysis.map((kit) => (
                  <div
                    key={kit.name}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{kit.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {kit.totalItems} components bundled
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        kit.status === 'In Field'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : kit.status === 'Cage Ready'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {kit.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Date Reminders / Maintenance Queue */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">Maintenance Queue</h2>
              </div>
              <button
                onClick={onNavigateToMaintenance}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {overdueMaintenanceGear.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectGearItem(item)}
                  className="flex gap-3 items-start p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-1.5 bg-rose-500 h-10 rounded-full shrink-0 mt-0.5"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <span className="text-[10px] font-mono font-bold text-rose-600">OVERDUE</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">Calibration check needed • Due {formatDateDDMMYYYY(item.nextServiceDate)}</p>
                  </div>
                </div>
              ))}

              {upcomingMaintenanceGear.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectGearItem(item)}
                  className="flex gap-3 items-start p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="w-1.5 bg-amber-500 h-10 rounded-full shrink-0 mt-0.5"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <span className="text-[10px] font-mono text-slate-400">{item.assetTag}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">Scheduled inspection ({formatDateDDMMYYYY(item.nextServiceDate)})</p>
                  </div>
                </div>
              ))}

              {overdueMaintenanceGear.length === 0 && upcomingMaintenanceGear.length === 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  All equipment service dates are up to date!
                </div>
              )}
            </div>

            <button
              onClick={onNavigateToMaintenance}
              className="w-full mt-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs transition-colors cursor-pointer font-semibold shadow-2xs"
            >
              View Detailed Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

