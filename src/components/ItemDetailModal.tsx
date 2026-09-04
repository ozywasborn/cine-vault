import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  QrCode,
  Calendar,
  Wrench,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Pencil,
  ChevronDown,
  ChevronUp,
  Package,
  Check,
} from 'lucide-react';
import { GearItem, UserAccount, MaintenanceRecord } from '../types';
import { generateQrDataUrl } from '../services/qr';

interface ItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GearItem | null;
  currentUser: UserAccount;
  maintenanceRecords?: MaintenanceRecord[];
  onCheckout: (item: GearItem) => void;
  onCheckin: (item: GearItem) => void;
  onOpenMaintenance: (item: GearItem) => void;
  onEditGear?: (item: GearItem) => void;
  onUpdateGear?: (item: GearItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  currentUser,
  maintenanceRecords = [],
  onCheckout,
  onCheckin,
  onOpenMaintenance,
  onEditGear,
  onUpdateGear,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isMaintenanceExpanded, setIsMaintenanceExpanded] = useState<boolean>(true);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [notesDraft, setNotesDraft] = useState<string>(item?.notes || '');

  const itemMaintenanceRecords = useMemo(() => {
    if (!maintenanceRecords || !item) return [];
    return maintenanceRecords.filter((r) => r.gearId === item.id);
  }, [maintenanceRecords, item]);

  const userRole = currentUser.role;
  const canMaintain = userRole === 'Admin' || userRole === 'Equipment Manager';
  const canCheckout = userRole === 'Admin' || userRole === 'Equipment Manager' || userRole === 'Cinematographer';
  const canCheckin = userRole === 'Admin' || userRole === 'Equipment Manager' || userRole === 'Cinematographer';
  const isAuditor = userRole === 'Auditor';

  useEffect(() => {
    if (item) {
      generateQrDataUrl(item).then(setQrUrl);
      setNotesDraft(item.notes || '');
      setIsEditingNotes(false);
    }
  }, [item?.id, item?.notes]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSaveNotes = () => {
    if (onUpdateGear && item) {
      onUpdateGear({
        ...item,
        notes: notesDraft.trim(),
      });
    }
    setIsEditingNotes(false);
  };

  if (!isOpen || !item) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              {item.assetTag}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{item.name}</h2>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                <span>{item.brand}</span>
                <span>•</span>
                <span>{item.category}</span>
                {item.kitName && (
                  <>
                    <span>•</span>
                    <span className="text-amber-700 font-semibold">{item.kitName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Main Status & QR Row */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {/* QR preview */}
            <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-xs border border-slate-200">
              {qrUrl ? (
                <img src={qrUrl} alt={item.assetTag} className="w-full h-full object-contain" />
              ) : (
                <QrCode className="w-16 h-16 text-slate-400 animate-pulse" />
              )}
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    item.status === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : item.status === 'Checked Out'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.status === 'Available'
                        ? 'bg-emerald-500'
                        : item.status === 'Checked Out'
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-rose-500'
                    }`}
                  />
                  {item.status}
                </span>

                <span className="text-slate-500 text-xs">
                  Condition: <strong className="text-slate-800 font-semibold">{item.condition}</strong>
                </span>
              </div>

              <div className="text-slate-700 font-mono text-[11px]">
                Serial Number: <strong className="text-amber-800 font-semibold">{item.serialNumber}</strong>
              </div>

              <div className="text-slate-500 text-xs font-medium">
                Permanent Cage Location: <strong className="text-slate-800 font-semibold">{item.location}</strong>
              </div>

              <div className="text-slate-500 text-xs font-medium">
                Purchase Date:{' '}
                <strong className="text-slate-900 font-mono font-bold">
                  {item.purchaseDate || '2024-03-15'}
                </strong>
              </div>

              <div className="text-slate-500 text-xs font-medium">
                Cost of Purchase:{' '}
                <strong className="text-slate-900 font-mono font-bold">${(item.purchasePrice || 0).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Active Checkout info if checked out */}
          {item.currentCheckout && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-800 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" /> Active Shoot Deployment
                </span>
                <span className="text-blue-600 font-medium">
                  ETA Return: {new Date(item.currentCheckout.expectedReturnDate).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-slate-800 font-bold">
                Project: {item.currentCheckout.projectName}
              </div>
              <div className="text-[11px] text-slate-600 flex flex-wrap gap-3 font-medium">
                <span>Location: {item.currentCheckout.shootLocation}</span>
                <span>•</span>
                <span>Assignee: {item.currentCheckout.userName}</span>
              </div>
            </div>
          )}

          {/* Specifications */}
          {item.specs && Object.keys(item.specs).length > 0 && (
            <div>
              <h3 className="font-bold text-slate-800 mb-2">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {Object.entries(item.specs).map(([key, value]) => (
                  <div key={key} className="text-[11px]">
                    <span className="text-slate-500 font-medium">{key}:</span>{' '}
                    <span className="text-slate-800 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  Last Serviced Date
                </span>
                {!isAuditor && onUpdateGear && (
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    Key in Date
                  </span>
                )}
              </div>
              {!isAuditor && onUpdateGear ? (
                <input
                  type="date"
                  value={item.lastServiceDate || ''}
                  onChange={(e) => {
                    const newDate = e.target.value || undefined;
                    let nextDue = item.nextServiceDate;
                    if (newDate && item.maintenanceIntervalDays) {
                      const d = new Date(newDate);
                      d.setDate(d.getDate() + item.maintenanceIntervalDays);
                      nextDue = d.toISOString().split('T')[0];
                    }
                    onUpdateGear({
                      ...item,
                      lastServiceDate: newDate,
                      nextServiceDate: nextDue,
                    });
                  }}
                  className="w-full text-xs font-mono font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-2xs"
                  title="Key in or update Last Serviced Date"
                />
              ) : (
                <div className="text-slate-800 font-semibold font-mono text-xs">
                  {item.lastServiceDate || 'Never / Factory Calibrated'}
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                Next Calibration Due
              </div>
              <div className="text-amber-800 font-semibold font-mono text-xs pt-1">
                {item.nextServiceDate || 'Not Scheduled'}
              </div>
              <div className="text-[10px] text-slate-400">
                Interval: {item.maintenanceIntervalDays || 90} days
              </div>
            </div>
          </div>

          {/* Notes, Included Rigging & Accessories */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Notes, Included Rigging & Accessories
                </h3>
              </div>
              {!isAuditor && onUpdateGear && !isEditingNotes && (
                <button
                  type="button"
                  onClick={() => {
                    setNotesDraft(item.notes || '');
                    setIsEditingNotes(true);
                  }}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer bg-white hover:bg-amber-50 px-2 py-1 rounded-lg border border-slate-200 hover:border-amber-300 transition-colors shadow-2xs"
                  title="Quick edit notes & accessories"
                >
                  <Pencil className="w-3 h-3 text-amber-600" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-2 pt-1">
                <textarea
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="e.g. Includes ARRI dovetail plate, EF mount adapter, top handle, 2x Anton Bauer plates..."
                  className="w-full p-2.5 rounded-xl bg-white border border-amber-400 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 leading-relaxed font-medium"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNotesDraft(item.notes || '');
                      setIsEditingNotes(false);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : item.notes ? (
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed shadow-2xs">
                {item.notes}
              </div>
            ) : (
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-400 italic flex items-center justify-between shadow-2xs">
                <span>No rigging, accessories, or operational notes specified.</span>
                {!isAuditor && onUpdateGear && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotesDraft('');
                      setIsEditingNotes(true);
                    }}
                    className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                  >
                    + Add Inclusions
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Individual Maintenance / Service Records (Expand/Collapse) */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setIsMaintenanceExpanded((prev) => !prev)}
              className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors cursor-pointer border-b border-slate-200/70"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Wrench className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-xs">Individual Maintenance & Service Records</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {itemMaintenanceRecords.length} {itemMaintenanceRecords.length === 1 ? 'Record' : 'Records'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
                <span className="text-[11px] font-medium">
                  {isMaintenanceExpanded ? 'Collapse' : 'Expand'}
                </span>
                {isMaintenanceExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </button>

            {isMaintenanceExpanded && (
              <div className="p-4 space-y-3 bg-white">
                {itemMaintenanceRecords.length === 0 ? (
                  <div className="py-3 text-center">
                    <p className="text-slate-500 text-xs">No logged service or calibration tickets for this equipment yet.</p>
                    {canMaintain && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenMaintenance(item);
                        }}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5 text-amber-600" />
                        <span>Log First Service Record</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 space-y-3">
                    {itemMaintenanceRecords.map((record, idx) => (
                      <div key={record.id || idx} className="pt-3 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {record.date}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {record.serviceType}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                record.resolved
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {record.resolved ? 'Resolved' : 'Active Issue'}
                            </span>
                          </div>
                          <div className="text-xs font-mono font-bold text-slate-800">
                            Service Cost: ${record.cost.toLocaleString()}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 flex items-center gap-3 flex-wrap font-medium">
                          <span>Technician: <strong className="text-slate-800">{record.technician}</strong></span>
                          {record.vendor && (
                            <>
                              <span>•</span>
                              <span>Service Vendor: <strong className="text-slate-800">{record.vendor}</strong></span>
                            </>
                          )}
                          <span>•</span>
                          <span>Condition Post-Service: <strong className="text-slate-800">{record.conditionAfter}</strong></span>
                        </div>

                        <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                          {record.notes}
                        </p>

                        {record.nextServiceDueDate && (
                          <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Scheduled Calibration Target: {record.nextServiceDueDate}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200">
            {isAuditor ? (
              <div className="flex items-center justify-start w-full">
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  Auditor Account: Read-only inspection mode
                </span>
              </div>
            ) : (
              <>
                <div>
                  {canMaintain && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenMaintenance(item);
                      }}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Wrench className="w-3.5 h-3.5 text-amber-600" />
                      <span>Log Maintenance</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isAuditor && onEditGear && (
                    <button
                      onClick={() => {
                        onClose();
                        onEditGear(item);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Pencil className="w-3.5 h-3.5 text-amber-600" />
                      <span>Edit Gear</span>
                    </button>
                  )}

                  {item.status === 'Available' && canCheckout && (
                    <button
                      onClick={() => {
                        onClose();
                        onCheckout(item);
                      }}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                      <span>Check Out to Shoot</span>
                    </button>
                  )}

                  {item.status !== 'Available' && canCheckin && (
                    <button
                      onClick={() => {
                        onClose();
                        onCheckin(item);
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5 text-white" />
                      <span>Check In to Cage</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
