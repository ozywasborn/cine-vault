import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Trash2,
} from 'lucide-react';
import { InventoryNotification } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InventoryNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onSelectGearById?: (gearId: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onClearAll,
  onSelectGearById,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white border-l border-slate-200 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Notifications & Alerts</h2>
              <p className="text-xs text-slate-500 font-medium">Real-time equipment alerts and service reminders</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold">
              {notifications.filter((n) => !n.read).length} Unread
            </span>
            <button
              onClick={onClearAll}
              title="Clear all"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium">
              No notifications at this time. All equipment status and service dates are nominal.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onMarkRead(notif.id);
                  if (notif.gearId && onSelectGearById) {
                    onSelectGearById(notif.gearId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl transition-all cursor-pointer ${
                  !notif.read
                    ? 'bg-amber-50/70 border border-amber-200 shadow-2xs'
                    : 'bg-white border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'SERVICE_REMINDER' && (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                    {notif.type === 'OVERDUE_RETURN' && (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    )}
                    {notif.type === 'STATUS_ALERT' && (
                      <Info className="w-4 h-4 text-blue-600" />
                    )}
                    {notif.type === 'SYNC_EVENT' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {notif.title}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between font-medium">
                      <span>{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.gearId && (
                        <span className="text-amber-700 font-bold hover:underline">
                          Inspect Gear &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
