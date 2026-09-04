import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Pencil,
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
import { GearItem, GearCategory, GearStatus, ConditionRating, UserAccount, AVAILABLE_LOCATIONS } from '../types';

interface EditGearModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GearItem | null;
  currentUser: UserAccount;
  onSaveGear: (updatedItem: GearItem) => void;
}

export const EditGearModal: React.FC<EditGearModalProps> = ({
  isOpen,
  onClose,
  item,
  currentUser,
  onSaveGear,
}) => {
  const [assetTag, setAssetTag] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<GearCategory>('Cameras');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<GearStatus>('Available');
  const [condition, setCondition] = useState<ConditionRating>('Mint');
  const [location, setLocation] = useState('');
  const [kitName, setKitName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | string>('');
  const [lastServiceDate, setLastServiceDate] = useState<string>('');
  const [maintenanceIntervalDays, setMaintenanceIntervalDays] = useState<number | string>(120);
  const [notes, setNotes] = useState('');
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([]);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const userRole = currentUser.role;
  const isAuditor = userRole === 'Auditor';
  const canEdit = !isAuditor;

  useEffect(() => {
    if (item) {
      setAssetTag(item.assetTag || '');
      setName(item.name || '');
      setBrand(item.brand || '');
      setModel(item.model || '');
      setCategory(item.category || 'Cameras');
      setSerialNumber(item.serialNumber || '');
      setStatus(item.status || 'Available');
      setCondition(item.condition || 'Good');
      setLocation(item.location || '');
      setKitName(item.kitName || '');
      setPurchaseDate(item.purchaseDate || '');
      setPurchasePrice(item.purchasePrice !== undefined ? item.purchasePrice : '');
      setLastServiceDate(item.lastServiceDate || '');
      setMaintenanceIntervalDays(item.maintenanceIntervalDays || 120);
      setNotes(item.notes || '');

      if (item.specs && typeof item.specs === 'object') {
        const specsArr = Object.entries(item.specs).map(([k, v]) => ({
          key: k,
          value: String(v),
        }));
        setSpecsList(specsArr);
      } else {
        setSpecsList([]);
      }
      setSaveSuccess(false);
    }
  }, [item]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('Auditor role is restricted to read-only mode.');
      return;
    }
    if (!name.trim() || !assetTag.trim()) {
      alert('Equipment name and asset tag are required.');
      return;
    }

    const convertedSpecs: Record<string, string> = {};
    specsList.forEach((s) => {
      if (s.key.trim()) {
        convertedSpecs[s.key.trim()] = s.value.trim();
      }
    });

    const updated: GearItem = {
      ...item,
      assetTag: assetTag.toUpperCase().trim(),
      name: name.trim(),
      brand: brand.trim() || 'Custom',
      model: model.trim() || name.trim(),
      category,
      serialNumber: serialNumber.trim() || item.serialNumber,
      status,
      condition,
      location: location.trim() || item.location,
      kitName: kitName.trim() || undefined,
      purchaseDate: purchaseDate || undefined,
      purchasePrice: Number(purchasePrice) || 0,
      replacementValue: item.replacementValue || Number(purchasePrice) || 0,
      lastServiceDate: lastServiceDate || undefined,
      nextServiceDate: (() => {
        if (!lastServiceDate) return item.nextServiceDate;
        if (lastServiceDate !== item.lastServiceDate) {
          const interval = Number(maintenanceIntervalDays) || 120;
          const d = new Date(lastServiceDate);
          d.setDate(d.getDate() + interval);
          return d.toISOString().split('T')[0];
        }
        return item.nextServiceDate;
      })(),
      maintenanceIntervalDays: Number(maintenanceIntervalDays) || 120,
      notes: notes.trim(),
      specs: convertedSpecs,
      updatedAt: new Date().toISOString(),
    };

    onSaveGear(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Edit Equipment Details</h2>
                <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {item.assetTag}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Update technical specifications, locker location, valuation, and maintenance intervals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auditor Read-only banner */}
        {isAuditor && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Auditor account detected: You can inspect equipment fields, but changes cannot be saved.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Primary Identification Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Core Identification & Classification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Asset Tag</label>
                <input
                  type="text"
                  value={assetTag}
                  disabled={isAuditor}
                  onChange={(e) => setAssetTag(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={name}
                  disabled={isAuditor}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <select
                  value={category}
                  disabled={isAuditor}
                  onChange={(e) => setCategory(e.target.value as GearCategory)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer disabled:opacity-60"
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
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  disabled={isAuditor}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  disabled={isAuditor}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Movement Status</label>
                <select
                  value={status}
                  disabled={isAuditor}
                  onChange={(e) => setStatus(e.target.value as GearStatus)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer disabled:opacity-60"
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
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer disabled:opacity-60"
                >
                  {conditions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location & Kits Section */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Location & Production Kit Allocation</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location Drop-down</label>
                <select
                  value={AVAILABLE_LOCATIONS.includes(location as any) ? location : AVAILABLE_LOCATIONS[0]}
                  disabled={isAuditor}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer disabled:opacity-60"
                >
                  {AVAILABLE_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Production Kit Name (Optional)</label>
                <input
                  type="text"
                  value={kitName}
                  disabled={isAuditor}
                  onChange={(e) => setKitName(e.target.value)}
                  placeholder="e.g. A-Cam Commercial Rig, B-Cam Run & Gun"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Financials & Maintenance Schedule */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Purchase & Maintenance Schedule</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  disabled={isAuditor}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Purchase Price ($)</label>
                <input
                  type="number"
                  value={purchasePrice}
                  disabled={isAuditor}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Last Serviced Date</label>
                <input
                  type="date"
                  value={lastServiceDate}
                  disabled={isAuditor}
                  onChange={(e) => setLastServiceDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Service Interval (Days)</label>
                <input
                  type="number"
                  value={maintenanceIntervalDays}
                  disabled={isAuditor}
                  onChange={(e) => setMaintenanceIntervalDays(e.target.value)}
                  placeholder="120"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-amber-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications Key-Value Editor */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Technical Specifications ({specsList.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">Custom key-value parameters for camera crew</span>
            </div>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {specsList.length === 0 ? (
                <p className="text-slate-400 text-xs italic py-1">No custom specifications added yet.</p>
              ) : (
                specsList.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      disabled={isAuditor}
                      value={spec.key}
                      onChange={(e) => handleUpdateSpec(index, 'key', e.target.value)}
                      placeholder="Spec Name (e.g. Mount)"
                      className="w-1/3 p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500 disabled:opacity-60"
                    />
                    <input
                      type="text"
                      disabled={isAuditor}
                      value={spec.value}
                      onChange={(e) => handleUpdateSpec(index, 'value', e.target.value)}
                      placeholder="Spec Value (e.g. PL Mount)"
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500 disabled:opacity-60"
                    />
                    {!isAuditor && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(index)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title="Remove Spec"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}

              {!isAuditor && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 mt-2">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={(e) => setNewSpecKey(e.target.value)}
                    placeholder="New Spec (e.g. Sensor / Max ISO)"
                    className="w-1/3 p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    placeholder="New Value (e.g. Super 35 / 409600)"
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes and Inclusions */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            <label className="block text-slate-700 font-semibold">Notes, Included Rigging & Accessories</label>
            <textarea
              rows={3}
              value={notes}
              disabled={isAuditor}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Includes ARRI dovetail plate, EF mount adapter, top handle, 2x Anton Bauer plates..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium disabled:opacity-60"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-[11px] text-slate-500">
              {item.lastServiceDate ? (
                <span>Last serviced: <strong className="text-slate-700">{item.lastServiceDate}</strong></span>
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
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs transition-colors cursor-pointer"
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
