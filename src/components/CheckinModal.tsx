import React, { useState } from 'react';
import { X, ArrowDownLeft, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';
import { GearItem, UserAccount, ConditionRating } from '../types';

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GearItem | null;
  currentUser: UserAccount;
  onConfirmCheckin: (
    id: string,
    conditionOnReturn: ConditionRating,
    returnNotes: string,
    location: string
  ) => void;
}

export const CheckinModal: React.FC<CheckinModalProps> = ({
  isOpen,
  onClose,
  item,
  currentUser,
  onConfirmCheckin,
}) => {
  const [condition, setCondition] = useState<ConditionRating>('Good');
  const [returnNotes, setReturnNotes] = useState('');
  const [location, setLocation] = useState(item?.location || 'Main Cage Shelf 1');

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCheckin(item.id, condition, returnNotes, location);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden my-8">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Check In Equipment to Cage</h2>
              <p className="text-xs text-slate-500">Verify returned condition and assign shelf locker.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-mono text-amber-800 font-bold text-xs bg-amber-50 border border-amber-200 px-2 py-0.5 rounded w-fit">[{item.assetTag}]</div>
            <div className="text-slate-900 font-bold text-sm mt-1.5">{item.name}</div>
            <div className="text-slate-500 text-[11px] mt-1 font-medium">
              Returning from: <strong className="text-slate-800">{item.currentCheckout?.projectName || 'Field Shoot'}</strong>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Inspected Condition on Return</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ConditionRating)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 font-medium cursor-pointer"
            >
              <option value="Mint">Mint (Flawless, clean optics & contacts)</option>
              <option value="Good">Good (Normal cosmetic use, fully functional)</option>
              <option value="Fair">Fair (Wear visible, operational)</option>
              <option value="Needs Attention">Needs Attention (Flag for Tech Inspection / Service)</option>
              <option value="Damaged">Damaged / Non-Functional (Auto send to Maintenance)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Return Shelf / Locker Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Return Notes / Observations</label>
            <textarea
              rows={2}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="e.g. Returned with all caps, batteries drained to 20%, sensor checked clean."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors cursor-pointer"
            >
              Confirm Return to Cage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
