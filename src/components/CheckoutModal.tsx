import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  MapPin,
  Calendar,
  User,
  Film,
  Layers,
} from 'lucide-react';
import { GearItem, UserAccount } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GearItem[];
  currentUser: UserAccount;
  onConfirmCheckout: (payload: {
    gearIds: string[];
    projectName: string;
    shootLocation: string;
    expectedReturnDate: string;
    assigneeName: string;
    assigneeEmail: string;
    notes?: string;
  }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onConfirmCheckout,
}) => {
  const [projectName, setProjectName] = useState('Apex Commercial - Day 2');
  const [shootLocation, setShootLocation] = useState('Mojave Desert Track, Unit B');
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [assigneeName, setAssigneeName] = useState('Devon Brooks');
  const [assigneeEmail, setAssigneeEmail] = useState('devon.dp@production.onmicrosoft.com');
  const [notes, setNotes] = useState('Desert package. Rain & dust covers packed.');

  if (!isOpen || items.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCheckout({
      gearIds: items.map((i) => i.id),
      projectName,
      shootLocation,
      expectedReturnDate: new Date(expectedReturnDate).toISOString(),
      assigneeName,
      assigneeEmail,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden my-8">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Check Out Equipment to Shoot
              </h2>
              <p className="text-xs text-slate-500">
                Dispatch {items.length} {items.length === 1 ? 'item' : 'items'} to production field crew.
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Items Summary Pill list */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 max-h-32 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Selected Equipment ({items.length}):
            </div>
            <div className="space-y-1.5">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-slate-800 font-medium">
                  <span className="font-mono text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px] font-bold">[{item.assetTag}]</span>
                  <span className="truncate flex-1 mx-2 text-slate-900">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Production Shoot / Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Apex Commercial, Ep. 4 Studio A"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Shoot Location / Set</label>
              <input
                type="text"
                value={shootLocation}
                onChange={(e) => setShootLocation(e.target.value)}
                placeholder="e.g. Stage 4, Downtown Soundstage, Olympic Park"
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Lead Operator / DP Name</label>
                <input
                  type="text"
                  value={assigneeName}
                  onChange={(e) => setAssigneeName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Work Email (M365 or Google)</label>
                <input
                  type="email"
                  value={assigneeEmail}
                  onChange={(e) => setAssigneeEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Expected Return Date</label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Checkout Notes / Accessories</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special notes, included cables, battery count, lens adapters..."
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Confirm Checkout ({items.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
