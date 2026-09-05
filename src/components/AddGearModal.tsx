import React, { useState, useEffect } from 'react';
import { X, Plus, Tag, MapPin, DollarSign } from 'lucide-react';
import {
  GearCategory,
  ConditionRating,
  GearStatus,
  UserAccount,
  GearItem,
  AVAILABLE_LOCATIONS,
} from '../types';

interface AddGearModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onAddGear: (gear: Partial<GearItem>) => void;
}

export const AddGearModal: React.FC<AddGearModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddGear,
}) => {
  const [assetTag, setAssetTag] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<GearCategory>('Cameras');
  const [serialNumber, setSerialNumber] = useState('');
  const [status, setStatus] = useState<GearStatus>('Available');
  const [condition, setCondition] = useState<ConditionRating>('Mint');
  const [location, setLocation] = useState<string>(AVAILABLE_LOCATIONS[0]);
  const [kitName, setKitName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [purchasePrice, setPurchasePrice] = useState<number | string>('');
  const [lastServiceDate, setLastServiceDate] = useState<string>('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setAssetTag('');
    setName('');
    setBrand('');
    setModel('');
    setCategory('Cameras');
    setSerialNumber('');
    setStatus('Available');
    setCondition('Mint');
    setLocation(AVAILABLE_LOCATIONS[0] || 'Studio');
    setKitName('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchasePrice('');
    setLastServiceDate('');
    setNotes('');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !assetTag) return;

    onAddGear({
      assetTag: assetTag.toUpperCase().trim(),
      name: name.trim(),
      brand: brand.trim() || 'Custom',
      model: model.trim() || name.trim(),
      category,
      serialNumber: serialNumber.trim(),
      status,
      condition,
      location: location.trim() || AVAILABLE_LOCATIONS[0],
      kitName: kitName.trim() || undefined,
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      purchasePrice: Number(purchasePrice) || 0,
      replacementValue: Number(purchasePrice) || 0,
      lastServiceDate: lastServiceDate || undefined,
      notes: notes.trim(),
    });

    handleClose();
  };

  const statuses: GearStatus[] = [
    'Available',
    'Checked Out',
    'In Maintenance',
    'Out On Loan',
    'Reserved',
    'Missing',
    'Retired',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Equipment Asset</h2>
              <p className="text-xs text-slate-500">Register new camera, lens, audio, or lighting gear into CineVault.</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Core Identification & Classification Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              <span>Core Identification & Classification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Asset Tag (ID) *</label>
                <input
                  type="text"
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  placeholder="e.g. CAM-RED-02, LNS-35-01"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 uppercase font-mono focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GearCategory)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 font-medium cursor-pointer"
                >
                  <option value="Cameras">Cameras</option>
                  <option value="Lenses">Lenses</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Audio">Audio</option>
                  <option value="Grip & Support">Grip & Support</option>
                  <option value="Drones & Gimbals">Drones & Gimbals</option>
                  <option value="Power & Batteries">Power & Batteries</option>
                  <option value="Media & Storage">Media & Storage</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Equipment Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Canon C300 Mark III Cinema Body"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Brand / Manufacturer</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Canon, Sony, ARRI, Cooke"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. EOS C300 Mark III, FX9, Mini LF"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN-558291"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Initial Physical Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ConditionRating)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 font-medium cursor-pointer"
                >
                  <option value="Mint">Mint (Brand New)</option>
                  <option value="Good">Good (Field Ready)</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Damaged">Damaged / Non-functional</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Initial Movement Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as GearStatus)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 font-medium cursor-pointer"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location & Kit Assignment Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Location & Production Kit Assignment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Location Drop-down *</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 font-medium cursor-pointer"
                >
                  {AVAILABLE_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Kit Assignment (Optional)</label>
                <input
                  type="text"
                  value={kitName}
                  onChange={(e) => setKitName(e.target.value)}
                  placeholder="e.g. A-Cam Commercial Rig"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Valuation & Notes Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-1 border-b border-slate-100">
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span>Purchase, Service & Notes</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cost of Purchase ($ USD)</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="e.g. 8500"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Last Serviced Date</label>
                <input
                  type="date"
                  value={lastServiceDate}
                  onChange={(e) => setLastServiceDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-slate-700 font-semibold mb-1">Notes, Included Rigging & Accessories</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Includes baseplate, top handle, 15mm rods, case..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs transition-colors cursor-pointer"
            >
              Register Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
