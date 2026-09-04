import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  History,
  Key,
  Shield,
  Check,
} from 'lucide-react';
import { UserAccount, UserRole, AuditLog } from '../types';
import { INITIAL_USERS } from '../data/mockData';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSwitchUser: (user: UserAccount) => void;
  auditLogs: AuditLog[];
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
  auditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'audit'>('roles');

  if (!isOpen) return null;

  const roleDefinitions: Record<UserRole, {
    role: UserRole;
    title: string;
    description: string;
    permissions: string[];
    color: string;
  }> = {
    Admin: {
      role: 'Admin',
      title: 'System Administrator',
      description: 'Full unconstrained fleet control, registration, and system settings.',
      permissions: [
        'Add, edit, & retire camera gear',
        'Direct check-out & check-in',
        'Service logs & maintenance overrides',
        'Export CSV reports & inspect logs',
      ],
      color: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    'Equipment Manager': {
      role: 'Equipment Manager',
      title: 'Equipment & Cage Manager',
      description: 'Daily cage logistics, barcode tagging, and fleet dispatch.',
      permissions: [
        'Add & update equipment specifications',
        'Perform check-outs to projects & crews',
        'Receive & inspect returns',
        'Log maintenance requests & print QR tags',
      ],
      color: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    Cinematographer: {
      role: 'Cinematographer',
      title: 'Cinematographer / Field Crew',
      description: 'Active field shoot access, pack-list inspection, and issue reporting.',
      permissions: [
        'View checked-out items for active shoots',
        'Scan QR tags on production location',
        'Flag equipment damage & report defects',
        'Perform quick self check-in upon shoot wrap',
      ],
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    Auditor: {
      role: 'Auditor',
      title: 'Finance & Asset Auditor',
      description: 'Read-only financial valuation and regulatory inspection.',
      permissions: [
        'Read-only equipment catalog inspection',
        'Track replacement values & depreciation',
        'Review complete timestamped audit ledger',
        'Download CSV inventory reports',
      ],
      color: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                User Access & Role Permissions
              </h2>
              <p className="text-xs text-slate-500">
                Select a user profile to switch permission levels and see access capabilities.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-5 pt-2 gap-3 text-xs">
          <button
            onClick={() => setActiveTab('roles')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'roles'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Active Role Switcher
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Activity Audit Trail ({auditLogs.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'roles' && (
            <div className="space-y-6">
              {/* Current Active Role Highlight */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-xs">
                    {currentUser.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{currentUser.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                        ACTIVE USER
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{currentUser.email}</div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-2">
                      <span>Role: <strong className="text-slate-900">{currentUser.role}</strong></span>
                      <span>•</span>
                      <span>{currentUser.department}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profiles Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Switch Active User & Permission Level
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INITIAL_USERS.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    const def = roleDefinitions[user.role];
                    return (
                      <div
                        key={user.id}
                        onClick={() => onSwitchUser(user)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{user.name}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${def.color}`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{user.email}</div>
                        <div className="text-[11px] text-slate-600 mt-2 font-medium">
                          {def.title}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                          {def.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Role Permission Level Details */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Permission Matrix by Role Level
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(Object.keys(roleDefinitions) as UserRole[]).map((roleKey) => {
                    const r = roleDefinitions[roleKey];
                    const isCurrent = currentUser.role === roleKey;
                    return (
                      <div
                        key={roleKey}
                        className={`p-3.5 rounded-xl border text-xs ${
                          isCurrent
                            ? 'bg-slate-50 border-amber-300'
                            : 'bg-slate-50/50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-slate-900">{r.role}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${r.color}`}>
                            {isCurrent ? 'Current Role' : r.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mb-2">{r.description}</p>
                        <ul className="space-y-1 text-[11px] text-slate-700">
                          {r.permissions.map((p, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500">
                Immutable activity log recording user actions, inventory status changes, and maintenance updates:
              </p>

              <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            log.action === 'CHECKOUT'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : log.action === 'CHECKIN'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : log.action === 'MAINTENANCE_LOG'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="font-bold text-slate-900">
                          {log.userName} ({log.userRole})
                        </span>
                      </div>

                      <div className="text-slate-700 text-xs">{log.details}</div>

                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>Target: <strong className="text-slate-800 font-mono">{log.targetAssetTag}</strong></span>
                        {log.ipOrDevice && (
                          <>
                            <span>•</span>
                            <span>Client: {log.ipOrDevice}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

