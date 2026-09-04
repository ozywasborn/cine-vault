import React from 'react';
import {
  Camera,
  LayoutDashboard,
  Boxes,
  Film,
  Wrench,
  QrCode,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { UserAccount, AppNotification } from '../types';

interface NavbarProps {
  currentTab?: 'dashboard' | 'inventory' | 'field' | 'maintenance' | 'qr';
  activeTab?: 'dashboard' | 'inventory' | 'field' | 'maintenance' | 'qr';
  onSelectTab?: (tab: 'dashboard' | 'inventory' | 'field' | 'maintenance' | 'qr') => void;
  setActiveTab?: (tab: 'dashboard' | 'inventory' | 'field' | 'maintenance' | 'qr') => void;
  currentUser: UserAccount;
  onOpenUserModal?: () => void;
  onOpenAuthModal?: () => void;
  onOpenNotifications: () => void;
  isOnline?: boolean;
  unreadNotifications?: AppNotification[];
  unreadNotificationsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  const currentTab = props.activeTab || props.currentTab || 'dashboard';
  const onSelectTab = (tab: 'dashboard' | 'inventory' | 'field' | 'maintenance' | 'qr') => {
    if (props.setActiveTab) props.setActiveTab(tab);
    if (props.onSelectTab) props.onSelectTab(tab);
  };
  const onOpenUserModal = props.onOpenAuthModal || props.onOpenUserModal || (() => {});
  const unreadCount = props.unreadNotificationsCount !== undefined
    ? props.unreadNotificationsCount
    : (props.unreadNotifications ? props.unreadNotifications.filter(n => !n.read).length : 0);

  // Role pill color styling for light theme
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Equipment Manager':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Cinematographer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Auditor':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-[2000px] xl:max-w-[2100px] 2xl:max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-extrabold shadow-xs">
              <Camera className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-slate-900 font-sans">
                  CineVault
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Inventory
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight hidden sm:block">
                Professional Camera & Equipment Manager
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              id="nav-dashboard-tab"
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-inventory-tab"
              onClick={() => onSelectTab('inventory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'inventory'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Inventory</span>
            </button>

            <button
              id="nav-field-tab"
              onClick={() => onSelectTab('field')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'field'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Active Shoots</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            </button>

            <button
              id="nav-maintenance-tab"
              onClick={() => onSelectTab('maintenance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'maintenance'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Maintenance</span>
            </button>

            <button
              id="nav-qr-tab"
              onClick={() => onSelectTab('qr')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentTab === 'qr'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QR Tagging</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2.5">
            {/* Real-time Continuous Sync Status */}
            <div
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs bg-emerald-50 border border-emerald-200 text-emerald-800"
              title="Continuous Real-Time Sync Active - All changes are saved automatically"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-[11px] hidden sm:inline">Live Real-Time Sync</span>
            </div>

            {/* Notifications / Service Alerts */}
            <button
              id="btn-notifications"
              onClick={props.onOpenNotifications}
              className="relative p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer shadow-xs"
              title="Notifications & Service Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 min-w-4 h-4 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Role Access Level & Switcher */}
            <button
              id="btn-user-account"
              onClick={onOpenUserModal}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
              title="Click to switch user role and view permission access levels"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {props.currentUser.name[0]}
              </div>
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">
                    {props.currentUser.name}
                  </span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadge(props.currentUser.role)}`}>
                    {props.currentUser.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-slate-400" />
                  <span>Access Permissions</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 overflow-x-auto gap-1 bg-white">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[11px] font-medium transition-colors ${
              currentTab === 'dashboard' ? 'text-amber-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => onSelectTab('inventory')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[11px] font-medium transition-colors ${
              currentTab === 'inventory' ? 'text-amber-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventory</span>
          </button>
          <button
            onClick={() => onSelectTab('field')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[11px] font-medium transition-colors ${
              currentTab === 'field' ? 'text-amber-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Shoots</span>
          </button>
          <button
            onClick={() => onSelectTab('maintenance')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[11px] font-medium transition-colors ${
              currentTab === 'maintenance' ? 'text-amber-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Maintenance</span>
          </button>
          <button
            onClick={() => onSelectTab('qr')}
            className={`flex flex-col items-center py-1 px-2 rounded text-[11px] font-medium transition-colors ${
              currentTab === 'qr' ? 'text-amber-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Tags</span>
          </button>
        </div>
      </div>
    </header>
  );
};

