import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Tag,
  DollarSign,
  Layers,
  MapPin,
  Wrench,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import {
  GearItem,
  GearCategory,
  GearStatus,
  ConditionRating,
  UserAccount,
  AVAILABLE_LOCATIONS,
  MaintenanceRecord,
} from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface EditGearModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GearItem | null;
  currentUser: UserAccount;
  onSaveGear: (updatedItem: GearItem) => void;
  maintenanceRecords?: MaintenanceRecord[];
  onSaveMaintenanceRecords?: (gearId: string, updatedRecords: MaintenanceRecord[], shouldSyncGear?: boolean) => void;
  onSwitchUser?: (user: UserAccount) => void;
}

type EditModalTab = 'general' | 'location-finance' | 'specs-notes' | 'maintenance';

export const EditGearModal: React.FC<EditGearModalProps> = ({
  isOpen,
  onClose,
  item,
  currentUser,
  onSaveGear,
  maintenanceRecords = [],
  onSaveMaintenanceRecords,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<EditModalTab>('general');
  const [assetTag, setAssetTag] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<GearCategory>('Cameras');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<GearStatus>('Available');
  const [condition, setCondition] = useState<ConditionRating>('Good');
  const [location, setLocation] = useState('Cage Shelf A-1');
  const [kitName, setKitName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [lastServiceDate, setLastServiceDate] = useState('');
  const [maintenanceIntervalDays, setMaintenanceIntervalDays] = useState('120');
  const [notes, setNotes] = useState('');
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);

  const userRole = currentUser.role;
  const isAuditor = userRole === 'Auditor';
  const canEdit = !isAuditor;

  useEffect(() => {
    if (isOpen && item) {
      setAssetTag(item.assetTag ? String(item.assetTag) : '');
      setName(item.name ? String(item.name) : '');
      setBrand(item.brand ? String(item.brand) : '');
      setModel(item.model ? String(item.model) : '');
      setCategory(item.category || 'Cameras');
      setSerialNumber(item.serialNumber !== undefined && item.serialNumber !== null ? String(item.serialNumber) : '');
      setStatus(item.status || 'Available');
      setCondition(item.condition || 'Good');
      setLocation(item.location ? String(item.location) : 'Cage Shelf A-1');
      setKitName(item.kitName ? String(item.kitName) : '');
      setPurchaseDate(item.purchaseDate ? String(item.purchaseDate).split('T')[0] : '');
      setPurchasePrice(item.purchasePrice !== undefined && item.purchasePrice !== null ? String(item.purchasePrice) : '');
      setLastServiceDate(item.lastServiceDate ? String(item.lastServiceDate).split('T')[0] : '');
      const rawInterval = item.maintenanceIntervalDays;
      const parsedInterval = isNaN(Number(rawInterval)) ? '120' : String(rawInterval);
      setMaintenanceIntervalDays(parsedInterval);
      setNotes(item.notes ? String(item.notes) : '');

      if (item.specs && typeof item.specs === 'object') {
        const parsed = Object.entries(item.specs).map(([key, value]) => ({
          key,
          value: String(value),
        }));
        setSpecsList(parsed);
      } else {
        setSpecsList([]);
      }

      let initialLastService = item.lastServiceDate || '';
      if (maintenanceRecords && item) {
        const itemRecs = maintenanceRecords
          .filter((r) => r.gearId === item.id)
          .map((r) => ({ ...r }))
          .sort((a, b) => {
            const timeA = a.date ? new Date(a.date).getTime() : 0;
            const timeB = b.date ? new Date(b.date).getTime() : 0;
            return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
          });
        setRecords(itemRecs);
        if (itemRecs[0]?.date) {
          initialLastService = itemRecs[0].date;
        }
      } else {
        setRecords([]);
      }
      setLastServiceDate(initialLastService);

      setActiveTab('general');
      setSaveSuccess(false);
    }
  }, [isOpen, item?.id]);

  if (!isOpen || !item) return null;

  const handleAddSpec = () => {
    if (!newSpecKey.trim()) return;
    setSpecsList((prev) => [...prev, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const handleRemoveSpec = (index: number) => {
    setSpecsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSpec = (index: number, field: 'key' | 'value', val: string) => {
    setSpecsList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleAddRecord = () => {
    if (!item) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const newRec: MaintenanceRecord = {
      id: `maint-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      gearId: item.id,
      date: todayStr,
      serviceType: 'Sensor Cleaning',
      technician: currentUser.name || 'Field Tech',
      vendor: '',
      cost: 0,
      conditionAfter: condition || 'Good',
      notes: '',
      nextServiceDueDate: '',
      resolved: true,
    };
    setRecords((prev) => {
      const nextRecs = [newRec, ...prev];
      const latest = nextRecs
        .filter((r) => r.date && String(r.date).trim())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (latest?.date) setLastServiceDate(latest.date);
      return nextRecs;
    });
  };

  const handleUpdateRecord = (id: string, field: keyof MaintenanceRecord, val: any) => {
    setRecords((prev) => {
      const nextRecs = prev.map((r) => (r.id === id ? { ...r, [field]: val } : r));
      const latest = nextRecs
        .filter((r) => r.date && String(r.date).trim())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      if (latest?.date) {
        setLastServiceDate(latest.date);
        if (latest.conditionAfter) setCondition(latest.conditionAfter);
      }
      return nextRecs;
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => {
      const nextRecs = prev.filter((r) => r.id !== id);
      const latest = nextRecs
        .filter((r) => r.date && String(r.date).trim())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      setLastServiceDate(latest?.date || '');
      return nextRecs;
    });
  };

  const handleLastServiceDateChange = (newDate: string) => {
    setLastServiceDate(newDate);
    if (!newDate || !item) return;
    setRecords((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: `maint-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            gearId: item.id,
            date: newDate,
            serviceType: 'Routine Service',
            technician: currentUser.name || 'Field Tech',
            vendor: '',
            cost: 0,
            conditionAfter: condition || 'Good',
            notes: 'Service logged from equipment details',
            nextServiceDueDate: '',
            resolved: true,
          },
        ];
      }
      const sorted = [...prev].sort(
        (a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
      );
      const latestId = sorted[0].id;
      return prev.map((r) => (r.id === latestId ? { ...r, date: newDate } : r));
    });
  };

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!canEdit) {
      alert('Auditor role is restricted to read-only mode.');
      return;
    }
    const cleanName = String(name || '').trim();
    const cleanAssetTag = String(assetTag || '').toUpperCase().trim();
    if (!cleanName || !cleanAssetTag) {
      alert('Equipment name and asset tag are required.');
      return;
    }

    try {
      const convertedSpecs: Record<string, string> = {};
      specsList.forEach((s) => {
        if (s && s.key && String(s.key).trim()) {
          convertedSpecs[String(s.key).trim()] = String(s.value || '').trim();
        }
      });

      // All equipment service dates follow the latest date input under Individual Maintenance records
      const validRecords = [...records]
        .filter((r) => r.date && String(r.date).trim())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latestMaint = validRecords[0];

      let finalLastService = latestMaint ? latestMaint.date : (lastServiceDate ? String(lastServiceDate).split('T')[0] : undefined);
      let finalNextService = latestMaint?.nextServiceDueDate ? String(latestMaint.nextServiceDueDate).trim() : undefined;

      if (!finalNextService && finalLastService) {
        try {
          const d = new Date(finalLastService);
          if (!isNaN(d.getTime())) {
            const interval = Number(maintenanceIntervalDays) || 120;
            d.setDate(d.getDate() + interval);
            finalNextService = d.toISOString().split('T')[0];
          }
        } catch {
          finalNextService = undefined;
        }
      }

      const updated: GearItem = {
        ...item,
        assetTag: cleanAssetTag,
        name: cleanName,
        brand: String(brand || '').trim() || 'Custom',
        model: String(model || '').trim() || cleanName,
        category,
        serialNumber: String(serialNumber !== undefined && serialNumber !== null ? serialNumber : '').trim(),
        status,
        condition,
        location: String(location || '').trim() || item.location,
        kitName: kitName ? String(kitName).trim() : undefined,
        purchaseDate: purchaseDate ? String(purchaseDate).split('T')[0] : undefined,
        purchasePrice: Number(purchasePrice) || 0,
        replacementValue: Number(purchasePrice) || Number(item.replacementValue) || 0,
        lastServiceDate: finalLastService,
        nextServiceDate: finalNextService,
        maintenanceIntervalDays: Number(maintenanceIntervalDays) || 120,
        notes: String(notes || '').trim(),
        specs: convertedSpecs,
        updatedAt: new Date().toISOString(),
      };

      onSaveGear(updated);
      if (onSaveMaintenanceRecords) {
        onSaveMaintenanceRecords(item.id, records, false);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 400);
    } catch (err: any) {
      console.error('Error in EditGearModal handleSubmit:', err);
      alert(`Could not save changes: ${err?.message || 'Unknown error'}`);
    }
  };

  const serviceTypes: MaintenanceRecord['serviceType'][] = [
    'Sensor Cleaning',
    'Firmware Update',
    'Calibration',
    'Optical Inspection',
    'Shutter Repair',
    'Cable Re-termination',
    'General Overhaul',
  ];

  const categories: GearCategory[] = [
    'Cameras',
    'Lenses',
    'Lighting',
    'Audio',
    'Grip & Support',
    'Drones & Gimbals',
    'Power & Batteries',
    'Media & Storage',
    'Accessories',
  ];

  const statuses: GearStatus[] = [
    'Available',
    'Checked Out',
    'Out On Loan',
    'In Maintenance',
    'Reserved',
    'Missing',
    'Retired',
  ];

  const conditions: ConditionRating[] = ['Mint', 'Good', 'Fair', 'Needs Attention', 'Damaged'];

  const tabs: { id: EditModalTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'general', label: 'General & Status', icon: <Tag className="w-3.5 h-3.5" /> },
    { id: 'location-finance', label: 'Location & Finance', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'specs-notes', label: 'Specs & Inclusions', icon: <Layers className="w-3.5 h-3.5" /> },
    {
      id: 'maintenance',
      label: 'Maintenance Log',
      icon: <Wrench className="w-3.5 h-3.5" />,
      badge: records.length,
    },
  ];

  const renderMaintenanceSection = () => (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-xs">Individual Maintenance & Service Records</h4>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                {records.length} {records.length === 1 ? 'record' : 'records'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Directly edit service tickets, costs, technician notes, or add new records.
            </p>
          </div>
        </div>
        {!isAuditor && (
          <button
            type="button"
            onClick={handleAddRecord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="py-7 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <Wrench className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-slate-700">No service records for this equipment yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Log sensor cleanings, optical overhauls, and repairs directly here.</p>
          {!isAuditor && (
            <button
              type="button"
              onClick={handleAddRecord}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>Add First Service Record</span>
            </button>
          )}
        </div>
      ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2.5 transition-colors hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {rec.serviceType || 'Service Record'}
                    </span>
                    <button
                      type="button"
                      disabled={isAuditor}
                      onClick={() => handleUpdateRecord(rec.id, 'resolved', !rec.resolved)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        rec.resolved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {rec.resolved ? 'Resolved' : 'In Progress'}
                    </button>
                  </div>

                  {!isAuditor && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord(rec.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete service record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Service Type
                    </label>
                    <select
                      value={rec.serviceType || 'Sensor Cleaning'}
                      disabled={isAuditor}
                      onChange={(e) =>
                        handleUpdateRecord(rec.id, 'serviceType', e.target.value as MaintenanceRecord['serviceType'])
                      }
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      {serviceTypes.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={rec.date || ''}
                      disabled={isAuditor}
                      onChange={(e) => handleUpdateRecord(rec.id, 'date', e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Technician
                    </label>
                    <input
                      type="text"
                      value={rec.technician || ''}
                      disabled={isAuditor}
                      onChange={(e) => handleUpdateRecord(rec.id, 'technician', e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Vendor
                    </label>
                    <input
                      type="text"
                      value={rec.vendor || ''}
                      disabled={isAuditor}
                      onChange={(e) => handleUpdateRecord(rec.id, 'vendor', e.target.value)}
                      placeholder="e.g. ARRI Burbank"
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Cost ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={rec.cost !== undefined ? rec.cost : 0}
                      disabled={isAuditor}
                      onChange={(e) =>
                        handleUpdateRecord(
                          rec.id,
                          'cost',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Condition After
                    </label>
                    <select
                      value={rec.conditionAfter || 'Good'}
                      disabled={isAuditor}
                      onChange={(e) =>
                        handleUpdateRecord(
                          rec.id,
                          'conditionAfter',
                          e.target.value as ConditionRating
                        )
                      }
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      {conditions.map((cond) => (
                        <option key={cond} value={cond}>
                          {cond}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Next Due
                    </label>
                    <input
                      type="date"
                      value={rec.nextServiceDueDate || ''}
                      disabled={isAuditor}
                      onChange={(e) =>
                        handleUpdateRecord(rec.id, 'nextServiceDueDate', e.target.value)
                      }
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Notes
                    </label>
                    <input
                      type="text"
                      value={rec.notes || ''}
                      disabled={isAuditor}
                      onChange={(e) => handleUpdateRecord(rec.id, 'notes', e.target.value)}
                      placeholder="e.g. Low-pass filter cleaned, firmware updated"
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Edit Equipment Details</h2>
                <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {item.assetTag}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    status === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : status === 'Checked Out'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {brand ? `${brand} • ` : item.brand ? `${item.brand} • ` : ''}{name || item.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auditor Read-only banner */}
        {isAuditor && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Auditor mode active: Inputs are locked for audit assurance.</span>
            </div>
            {onSwitchUser && (
              <button
                type="button"
                onClick={() => onSwitchUser(INITIAL_USERS[0])}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                Switch to Admin to Edit
              </button>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-amber-700 shadow-2xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-amber-600' : 'text-slate-400'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === tab.id
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Tab Content Body */}
          <div className="p-6 flex-1 overflow-y-auto min-h-0 text-xs">
            {/* Tab 1: General & Status */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Asset Tag</label>
                    <input
                      type="text"
                      value={assetTag}
                      disabled={isAuditor}
                      onChange={(e) => setAssetTag(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                      placeholder="e.g. CAM-001"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-700 font-semibold">Equipment Name *</label>
                      {isAuditor && (
                        <span className="text-[10px] text-amber-700 font-medium bg-amber-100 px-1.5 py-0.5 rounded">
                          Auditor Read-only
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={name}
                      disabled={isAuditor}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60 transition-colors"
                      placeholder="e.g. ARRI Alexa Mini LF Cinema Camera"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Category</label>
                    <select
                      value={category}
                      disabled={isAuditor}
                      onChange={(e) => setCategory(e.target.value as GearCategory)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer disabled:opacity-60"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Brand / Manufacturer</label>
                    <input
                      type="text"
                      value={brand}
                      disabled={isAuditor}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. ARRI, Sony, RED"
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Model Name</label>
                    <input
                      type="text"
                      value={model}
                      disabled={isAuditor}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Mini LF"
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Serial Number</label>
                    <input
                      type="text"
                      value={serialNumber}
                      disabled={isAuditor}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="e.g. SN-894211"
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Movement Status</label>
                    <select
                      value={status}
                      disabled={isAuditor}
                      onChange={(e) => setStatus(e.target.value as GearStatus)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer disabled:opacity-60"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Physical Condition</label>
                    <select
                      value={condition}
                      disabled={isAuditor}
                      onChange={(e) => setCondition(e.target.value as ConditionRating)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer disabled:opacity-60"
                    >
                      {conditions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Status info bar */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-slate-600 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        status === 'Available'
                          ? 'bg-emerald-500'
                          : status === 'In Maintenance'
                          ? 'bg-rose-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <span>
                      Current Status: <strong className="text-slate-900">{status}</strong> • Condition:{' '}
                      <strong className="text-slate-900">{condition}</strong>
                    </span>
                  </div>
                  {item.currentCheckout && (
                    <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                      Checked out to: {item.currentCheckout.projectName}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Location & Finance */}
            {activeTab === 'location-finance' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Cage Locker / Shelf Location</label>
                    <select
                      value={AVAILABLE_LOCATIONS.includes(location as any) ? location : AVAILABLE_LOCATIONS[0]}
                      disabled={isAuditor}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer disabled:opacity-60"
                    >
                      {AVAILABLE_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Production Kit Allocation (Optional)</label>
                    <input
                      type="text"
                      value={kitName}
                      disabled={isAuditor}
                      onChange={(e) => setKitName(e.target.value)}
                      placeholder="e.g. A-Cam Commercial Rig, B-Cam Run & Gun"
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Purchase Date</label>
                    <input
                      type="date"
                      value={purchaseDate}
                      disabled={isAuditor}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Purchase Price ($ USD)</label>
                    <input
                      type="number"
                      step="any"
                      value={purchasePrice}
                      disabled={isAuditor}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Last Serviced Date</label>
                    <input
                      type="date"
                      value={lastServiceDate}
                      disabled={isAuditor}
                      onChange={(e) => handleLastServiceDateChange(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Service Interval (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={maintenanceIntervalDays}
                      disabled={isAuditor}
                      onChange={(e) => setMaintenanceIntervalDays(e.target.value)}
                      placeholder="120"
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                    />
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Projected Calibration Due
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-800 mt-0.5">
                      {(() => {
                        if (!lastServiceDate) return item.nextServiceDate || 'Not Scheduled';
                        try {
                          const d = new Date(lastServiceDate);
                          if (!isNaN(d.getTime())) {
                            d.setDate(d.getDate() + (Number(maintenanceIntervalDays) || 120));
                            return d.toISOString().split('T')[0];
                          }
                        } catch {}
                        return item.nextServiceDate || 'Not Scheduled';
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Specs & Notes */}
            {activeTab === 'specs-notes' && (
              <div className="space-y-4">
                {/* Technical Specifications */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-semibold">
                      Technical Specifications ({specsList.length})
                    </label>
                    <span className="text-[11px] text-slate-400">Custom key-value parameters for camera crew</span>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {specsList.length === 0 ? (
                      <p className="text-slate-400 text-xs italic py-1">No custom specifications added yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {specsList.map((spec, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={spec.key}
                              disabled={isAuditor}
                              onChange={(e) => handleUpdateSpec(index, 'key', e.target.value)}
                              placeholder="e.g. Lens Mount"
                              className="w-1/3 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                            />
                            <input
                              type="text"
                              value={spec.value}
                              disabled={isAuditor}
                              onChange={(e) => handleUpdateSpec(index, 'value', e.target.value)}
                              placeholder="e.g. LPL / PL"
                              className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-amber-500"
                            />
                            {!isAuditor && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSpec(index)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove spec"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {!isAuditor && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200/70">
                        <input
                          type="text"
                          value={newSpecKey}
                          onChange={(e) => setNewSpecKey(e.target.value)}
                          placeholder="New Spec (e.g. Sensor Size)"
                          className="w-1/3 p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                        />
                        <input
                          type="text"
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                          placeholder="Value (e.g. Large Format 36.7 x 25.54 mm)"
                          className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSpec();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddSpec}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-colors cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes and Inclusions */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="block text-slate-700 font-semibold">
                    Notes, Included Rigging & Accessories
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    disabled={isAuditor}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Includes ARRI dovetail plate, EF mount adapter, top handle, 2x Anton Bauer plates..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium disabled:opacity-60 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Tab 4: Maintenance Log */}
            {activeTab === 'maintenance' && (
              <div className="space-y-3">
                {renderMaintenanceSection()}
              </div>
            )}
          </div>

          {/* Sticky Action Bar (Footer) */}
          <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
            <div className="text-[11px] text-slate-500">
              {lastServiceDate || item.lastServiceDate ? (
                <span>Last serviced: <strong className="text-slate-700">{lastServiceDate || item.lastServiceDate}</strong></span>
              ) : (
                <span>Created: {new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>

              {canEdit && (
                <button
                  type="submit"
                  disabled={saveSuccess}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold shadow-xs transition-all cursor-pointer disabled:opacity-80"
                >
                  {saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-white" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
