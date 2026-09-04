import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { GearItem, MaintenanceRecord, ShootProject, GearCategory } from '../types';

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
  // State for expanded gear manifests in shoots
  const [expandedShootManifests, setExpandedShootManifests] = useState<Record<string, boolean>>({});

  const toggleShootManifest = (shootId: string) => {
    setExpandedShootManifests((prev) => ({
      ...prev,
      [shootId]: !prev[shootId],
    }));
  };

  // Calculations
  const totalFleetValue = gear.reduce((sum, g) => sum + g.replacementValue, 0);
  const checkedOutCount = gear.filter((g) => g.status === 'Checked Out').length;
  const availableCount = gear.filter((g) => g.status === 'Available').length;
  const inMaintenanceCount = gear.filter((g) => g.status === 'In Maintenance').length;
  const utilizationRate = gear.length > 0 ? Math.round((checkedOutCount / gear.length) * 100) : 0;

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

            {/* Quick Movement Telemetry Summary Bar */}
            <div className="grid grid-cols-3 gap-3 py-3 my-3 bg-slate-50/80 rounded-xl px-4 border border-slate-100 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Units in Movement</p>
                <p className="text-base font-bold text-slate-900">{checkedOutCount} assets</p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-[10px] uppercase font-bold text-slate-400">Active Field Locations</p>
                <p className="text-base font-bold text-slate-900">{activeShoots.length} sites</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Field Movement Status</p>
                <p className="text-base font-bold text-emerald-600">Active Deployed</p>
              </div>
            </div>

            {/* Shoots List with Comprehensive Equipment Movement Manifests */}
            <div className="space-y-4 mt-4">
              {activeShoots.map((proj) => {
                const countdown = getReturnCountdown(proj.endDate);
                const isExpanded = !!expandedShootManifests[proj.id];

                // Group assigned gear by category for clean scannability
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
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs"
                  >
                    {/* Shoot Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
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

                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {proj.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {countdown && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${countdown.badgeClass}`}
                          >
                            {countdown.label}
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-mono font-medium">
                          {proj.startDate} → {proj.endDate}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 mt-2.5 py-2 px-3 bg-slate-50 rounded-lg border border-slate-150">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate text-slate-700">{proj.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500">Lead DP:</span>
                        <strong className="text-slate-800 truncate">{proj.leadDP}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 sm:justify-end">
                        <Package className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-slate-500">Kit Size:</span>
                        <span className="font-bold text-slate-900">{proj.assignedGear.length} units</span>
                      </div>
                    </div>

                    {/* Kits in this shoot */}
                    {kitNames.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2.5 text-xs">
                        <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-slate-500 font-medium">Kit Bundles:</span>
                        <div className="flex flex-wrap gap-1">
                          {kitNames.map((k) => (
                            <span
                              key={k}
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Equipment Movement Manifest (Primary user objective) */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">
                            Deployed Movement Manifest ({proj.assignedGear.length} units):
                          </span>
                          <div className="hidden sm:flex items-center gap-1.5">
                            {Object.entries(catGrouped).map(([cat, count]) => (
                              <span
                                key={cat}
                                className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                              >
                                {cat}: <strong>{count}</strong>
                              </span>
                            ))}
                          </div>
                        </div>

                        {proj.assignedGear.length > 4 && (
                          <button
                            onClick={() => toggleShootManifest(proj.id)}
                            className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 cursor-pointer"
                          >
                            {isExpanded
                              ? 'Collapse List'
                              : `Show all ${proj.assignedGear.length} items`}
                          </button>
                        )}
                      </div>

                      {/* Equipment items pills */}
                      <div className="flex flex-wrap gap-1.5">
                        {(isExpanded ? proj.assignedGear : proj.assignedGear.slice(0, 4)).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => onSelectGearItem(item)}
                            title={`Inspect ${item.name} (${item.assetTag})`}
                            className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-xs text-slate-700 hover:text-amber-900 transition-all cursor-pointer shadow-2xs"
                          >
                            <span className="font-mono font-bold text-amber-600 group-hover:text-amber-700 text-[10px]">
                              {item.assetTag}
                            </span>
                            <span className="truncate max-w-[170px] sm:max-w-[220px] font-medium">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 group-hover:text-amber-600">
                              • {item.category}
                            </span>
                          </button>
                        ))}

                        {!isExpanded && proj.assignedGear.length > 4 && (
                          <button
                            onClick={() => toggleShootManifest(proj.id)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            +{proj.assignedGear.length - 4} more units
                          </button>
                        )}

                        {proj.assignedGear.length === 0 && (
                          <span className="text-xs text-slate-400 italic">
                            No equipment currently recorded for this shoot manifest.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Shoot card footer with action */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Client: <strong className="text-slate-600">{proj.client}</strong>
                      </span>
                      <button
                        onClick={onNavigateToField}
                        className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        Inspect in Field View <ChevronRight className="w-3.5 h-3.5" />
                      </button>
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
          </div>
        </div>

        {/* SIDE 1-COL SECTION: Fleet Utilization & Maintenance (Swapped into side column) */}
        <div className="space-y-6">
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
                      title={`${stat.checkedOut} Checked Out`}
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
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">Calibration check needed • Due {item.nextServiceDate}</p>
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
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">Scheduled inspection ({item.nextServiceDate})</p>
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

