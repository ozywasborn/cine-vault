import React, { useState } from 'react';
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
} from 'lucide-react';
import { GearItem, MaintenanceRecord, UserAccount, ConditionRating } from '../types';

interface MaintenanceViewProps {
  gear: GearItem[];
  maintenance: MaintenanceRecord[];
  currentUser: UserAccount;
  onAddMaintenance: (record: Partial<MaintenanceRecord>) => void;
  onSelectGear: (item: GearItem) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  gear,
  maintenance,
  currentUser,
  onAddMaintenance,
  onSelectGear,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');

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

      {/* Service Schedule & Due Calendar List */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-500" />
          Service & Calibration Horizon (Next 90 Days)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gear
            .filter((g) => g.nextServiceDate)
            .sort((a, b) => new Date(a.nextServiceDate!).getTime() - new Date(b.nextServiceDate!).getTime())
            .map((item) => {
              const date = new Date(item.nextServiceDate!);
              const isOverdue = date < today;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectGear(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isOverdue
                      ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                      : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{item.assetTag}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isOverdue
                          ? 'bg-rose-100 text-rose-700 border-rose-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isOverdue ? 'OVERDUE' : `Due: ${item.nextServiceDate}`}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate mt-2">{item.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                    <span>Status: <strong className="text-slate-700">{item.status}</strong></span>
                    <span>Interval: <strong className="text-slate-700">{item.maintenanceIntervalDays || 90}d</strong></span>
                  </div>
                </div>
              );
            })}
        </div>
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
    </div>
  );
};
