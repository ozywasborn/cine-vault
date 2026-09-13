import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Film,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ArrowDownLeft,
  ChevronDown,
  ChevronUp,
  QrCode,
  PackageCheck,
  Search,
  Plus,
  GripVertical,
  ArrowLeftRight,
  X,
  Sparkles,
  Layers,
  Box,
  Check,
  Pencil,
  ExternalLink,
  CalendarRange,
  LayoutList,
  CalendarDays,
  Palette,
  Trash2,
  Building2,
  Handshake,
  Phone,
  FileText,
} from 'lucide-react';
import { GearItem, ShootProject, UserAccount, ConditionRating, LoanRecord } from '../types';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';
import { normalizeDateToYMD, formatDateDDMMYYYY, formatCurrencySGD } from '../utils/dateUtils';

interface DeploymentColorTheme {
  id: string;
  name: string;
  containerBorder: string;
  headerBg: string;
  badgeBg: string;
  dot: string;
  accentText: string;
  ganttBar: string;
  ganttTrack: string;
  tagBg: string;
}

const DEPLOYMENT_THEMES: DeploymentColorTheme[] = [
  {
    id: 'amber',
    name: 'Amber Cinema',
    containerBorder: 'border-amber-200 hover:border-amber-300',
    headerBg: 'bg-amber-50/70 border-b border-amber-200/80',
    badgeBg: 'bg-amber-100 text-amber-900 border border-amber-300',
    dot: 'bg-amber-500',
    accentText: 'text-amber-700',
    ganttBar: 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 shadow-sm',
    ganttTrack: 'bg-amber-50/50',
    tagBg: 'bg-amber-500 text-white',
  },
  {
    id: 'blue',
    name: 'Blue Horizon',
    containerBorder: 'border-blue-200 hover:border-blue-300',
    headerBg: 'bg-blue-50/70 border-b border-blue-200/80',
    badgeBg: 'bg-blue-100 text-blue-900 border border-blue-300',
    dot: 'bg-blue-500',
    accentText: 'text-blue-700',
    ganttBar: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 shadow-sm',
    ganttTrack: 'bg-blue-50/50',
    tagBg: 'bg-blue-600 text-white',
  },
  {
    id: 'emerald',
    name: 'Emerald Studio',
    containerBorder: 'border-emerald-200 hover:border-emerald-300',
    headerBg: 'bg-emerald-50/70 border-b border-emerald-200/80',
    badgeBg: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    dot: 'bg-emerald-500',
    accentText: 'text-emerald-700',
    ganttBar: 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 shadow-sm',
    ganttTrack: 'bg-emerald-50/50',
    tagBg: 'bg-emerald-600 text-white',
  },
  {
    id: 'purple',
    name: 'Violet Stage',
    containerBorder: 'border-purple-200 hover:border-purple-300',
    headerBg: 'bg-purple-50/70 border-b border-purple-200/80',
    badgeBg: 'bg-purple-100 text-purple-900 border border-purple-300',
    dot: 'bg-purple-500',
    accentText: 'text-purple-700',
    ganttBar: 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-700 shadow-sm',
    ganttTrack: 'bg-purple-50/50',
    tagBg: 'bg-purple-600 text-white',
  },
  {
    id: 'rose',
    name: 'Rose Sunset',
    containerBorder: 'border-rose-200 hover:border-rose-300',
    headerBg: 'bg-rose-50/70 border-b border-rose-200/80',
    badgeBg: 'bg-rose-100 text-rose-900 border border-rose-300',
    dot: 'bg-rose-500',
    accentText: 'text-rose-700',
    ganttBar: 'bg-rose-500 hover:bg-rose-600 text-white border border-rose-600 shadow-sm',
    ganttTrack: 'bg-rose-50/50',
    tagBg: 'bg-rose-500 text-white',
  },
  {
    id: 'indigo',
    name: 'Indigo Prime',
    containerBorder: 'border-indigo-200 hover:border-indigo-300',
    headerBg: 'bg-indigo-50/70 border-b border-indigo-200/80',
    badgeBg: 'bg-indigo-100 text-indigo-900 border border-indigo-300',
    dot: 'bg-indigo-500',
    accentText: 'text-indigo-700',
    ganttBar: 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 shadow-sm',
    ganttTrack: 'bg-indigo-50/50',
    tagBg: 'bg-indigo-600 text-white',
  },
  {
    id: 'teal',
    name: 'Teal Flare',
    containerBorder: 'border-teal-200 hover:border-teal-300',
    headerBg: 'bg-teal-50/70 border-b border-teal-200/80',
    badgeBg: 'bg-teal-100 text-teal-900 border border-teal-300',
    dot: 'bg-teal-500',
    accentText: 'text-teal-700',
    ganttBar: 'bg-teal-600 hover:bg-teal-700 text-white border border-teal-700 shadow-sm',
    ganttTrack: 'bg-teal-50/50',
    tagBg: 'bg-teal-600 text-white',
  },
  {
    id: 'orange',
    name: 'Tungsten Gold',
    containerBorder: 'border-orange-200 hover:border-orange-300',
    headerBg: 'bg-orange-50/70 border-b border-orange-200/80',
    badgeBg: 'bg-orange-100 text-orange-900 border border-orange-300',
    dot: 'bg-orange-500',
    accentText: 'text-orange-700',
    ganttBar: 'bg-orange-500 hover:bg-orange-600 text-white border border-orange-600 shadow-sm',
    ganttTrack: 'bg-orange-50/50',
    tagBg: 'bg-orange-500 text-white',
  },
  {
    id: 'red',
    name: 'Crimson Rig',
    containerBorder: 'border-red-200 hover:border-red-300',
    headerBg: 'bg-red-50/70 border-b border-red-200/80',
    badgeBg: 'bg-red-100 text-red-900 border border-red-300',
    dot: 'bg-red-500',
    accentText: 'text-red-700',
    ganttBar: 'bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-sm',
    ganttTrack: 'bg-red-50/50',
    tagBg: 'bg-red-600 text-white',
  },
  {
    id: 'cyan',
    name: 'Cyan Flare',
    containerBorder: 'border-cyan-200 hover:border-cyan-300',
    headerBg: 'bg-cyan-50/70 border-b border-cyan-200/80',
    badgeBg: 'bg-cyan-100 text-cyan-900 border border-cyan-300',
    dot: 'bg-cyan-500',
    accentText: 'text-cyan-700',
    ganttBar: 'bg-cyan-600 hover:bg-cyan-700 text-white border border-cyan-700 shadow-sm',
    ganttTrack: 'bg-cyan-50/50',
    tagBg: 'bg-cyan-600 text-white',
  },
  {
    id: 'lime',
    name: 'Lime Matrix',
    containerBorder: 'border-lime-200 hover:border-lime-300',
    headerBg: 'bg-lime-50/70 border-b border-lime-200/80',
    badgeBg: 'bg-lime-100 text-lime-900 border border-lime-300',
    dot: 'bg-lime-500',
    accentText: 'text-lime-700',
    ganttBar: 'bg-lime-600 hover:bg-lime-700 text-white border border-lime-700 shadow-sm',
    ganttTrack: 'bg-lime-50/50',
    tagBg: 'bg-lime-600 text-white',
  },
  {
    id: 'fuchsia',
    name: 'Fuchsia Neon',
    containerBorder: 'border-fuchsia-200 hover:border-fuchsia-300',
    headerBg: 'bg-fuchsia-50/70 border-b border-fuchsia-200/80',
    badgeBg: 'bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-300',
    dot: 'bg-fuchsia-500',
    accentText: 'text-fuchsia-700',
    ganttBar: 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white border border-fuchsia-700 shadow-sm',
    ganttTrack: 'bg-fuchsia-50/50',
    tagBg: 'bg-fuchsia-600 text-white',
  },
];

const LOAN_THEME: DeploymentColorTheme = {
  id: 'loan-purple',
  name: 'External Loan',
  containerBorder: 'border-purple-200 hover:border-purple-300',
  headerBg: 'bg-purple-50/70 border-b border-purple-200/80',
  badgeBg: 'bg-purple-100 text-purple-900 border border-purple-300',
  dot: 'bg-purple-500',
  accentText: 'text-purple-700',
  ganttBar: 'bg-purple-600 hover:bg-purple-700 text-white border border-purple-700 shadow-sm',
  ganttTrack: 'bg-purple-50/50',
  tagBg: 'bg-purple-600 text-white',
};

const getDeploymentTheme = (
  name: string,
  index = 0,
  customColorId?: string
): DeploymentColorTheme => {
  if (customColorId) {
    const match = DEPLOYMENT_THEMES.find(
      (t) =>
        t.id.toLowerCase() === customColorId.toLowerCase() ||
        t.name.toLowerCase() === customColorId.toLowerCase()
    );
    if (match) return match;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const themeIndex = Math.abs(hash + index) % DEPLOYMENT_THEMES.length;
  return DEPLOYMENT_THEMES[themeIndex];
};

interface FieldShootSummaryProps {
  gear: GearItem[];
  projects?: ShootProject[];
  currentUser?: UserAccount;
  onCheckinGear?: (id: string, condition: ConditionRating, notes: string) => void;
  onBatchCheckin?: (ids: string[]) => void;
  onSelectGear: (item: GearItem) => void;
  onOpenQrModal?: (item: GearItem) => void;
  onReportIssue?: (item: GearItem) => void;
  onUpdateGear?: (item: GearItem) => void;
  onAddProject?: (project: ShootProject) => void;
  onProjectsChange?: (projects: ShootProject[], changedProject?: ShootProject) => void;
}

interface InlineAddGearRowProps {
  projectName: string;
  theme: DeploymentColorTheme;
  availableGear: GearItem[];
  onAddGear: (item: GearItem, targetProject: string) => void;
}

const InlineAddGearRow: React.FC<InlineAddGearRowProps> = ({
  projectName,
  availableGear,
  onAddGear,
}) => {
  const [inlineQuery, setInlineQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dropdownCoords, setDropdownCoords] = useState<{
    top: number;
    left: number;
    width: number;
    placement: 'bottom' | 'top';
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!inputContainerRef.current) return;
    const rect = inputContainerRef.current.getBoundingClientRect();
    if (rect.bottom < 50 || rect.top > window.innerHeight - 30) {
      setIsOpen(false);
      return;
    }
    const dropdownHeight = 280;
    const spaceBelow = window.innerHeight - rect.bottom;
    const showAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    const width = Math.max(320, rect.width);
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));

    setDropdownCoords({
      top: showAbove ? rect.top - 6 : rect.bottom + 6,
      left,
      width,
      placement: showAbove ? 'top' : 'bottom',
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleScroll = () => updatePosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filteredGear = useMemo(() => {
    const q = inlineQuery.trim().toLowerCase();
    if (!q) {
      return availableGear.slice(0, 10);
    }
    return availableGear
      .filter((g) => {
        return (
          String(g.assetTag || '').toLowerCase().includes(q) ||
          String(g.name || '').toLowerCase().includes(q) ||
          String(g.category || '').toLowerCase().includes(q) ||
          String(g.serialNumber || '').toLowerCase().includes(q) ||
          String(g.model || '').toLowerCase().includes(q) ||
          String(g.brand || '').toLowerCase().includes(q)
        );
      })
      .slice(0, 20);
  }, [availableGear, inlineQuery]);

  const handleSelect = (item: GearItem) => {
    onAddGear(item, projectName);
    setInlineQuery('');
    setIsOpen(false);
    setSelectedIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      updatePosition();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredGear.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % filteredGear.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredGear.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + filteredGear.length) % filteredGear.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredGear.length > 0) {
        const targetIndex =
          selectedIndex >= 0 && selectedIndex < filteredGear.length ? selectedIndex : 0;
        handleSelect(filteredGear[targetIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div
      ref={containerRef}
      className="p-3 sm:px-4 sm:py-3 bg-slate-50/50 hover:bg-slate-50/90 transition-colors border-t border-dashed border-slate-200"
    >
      <div className="flex items-center gap-3">
        {/* Plus / Add Icon Pill */}
        <div
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(true);
            updatePosition();
          }}
          className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 hover:bg-amber-500 hover:text-white flex items-center justify-center shrink-0 cursor-pointer transition-all shadow-2xs group"
          title="Add new equipment to this deployment"
        >
          <Plus className="w-4 h-4 stroke-[2.5] group-hover:scale-110 transition-transform" />
        </div>

        {/* Input container */}
        <div className="relative flex-1 min-w-0" ref={inputContainerRef}>
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={inlineQuery}
              onChange={(e) => {
                setInlineQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
                setSelectedIndex(0);
                updatePosition();
              }}
              onFocus={() => {
                setIsOpen(true);
                updatePosition();
              }}
              onKeyDown={handleKeyDown}
              placeholder="+ Add equipment to this deployment (type asset tag, name, or model)..."
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              autoCorrect="off"
              spellCheck={false}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200/90 hover:border-slate-300 focus:border-amber-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-xs text-slate-900 placeholder:text-slate-400 transition-all font-medium shadow-2xs"
            />
            {inlineQuery && (
              <button
                type="button"
                onClick={() => {
                  setInlineQuery('');
                  setIsOpen(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Available Equipment Counter Badge */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg shadow-2xs">
          <Box className="w-3 h-3 text-amber-500" />
          <span>{availableGear.length} available</span>
        </div>
      </div>

      {/* Floating Suggestions Portal */}
      {isOpen && dropdownCoords && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownCoords.placement === 'top' ? undefined : `${dropdownCoords.top}px`,
            bottom: dropdownCoords.placement === 'top' ? `${window.innerHeight - dropdownCoords.top}px` : undefined,
            left: `${dropdownCoords.left}px`,
            width: `${dropdownCoords.width}px`,
            zIndex: 99999,
          }}
          className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-98 duration-150"
        >
          {/* Header of suggestions */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>
                {inlineQuery.trim()
                  ? `Matching Available Gear (${filteredGear.length})`
                  : `Available Inventory in Cage (${availableGear.length})`}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Use ↑↓ to navigate • ↵ Enter to add
            </span>
          </div>

          {/* List of items */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-50 p-1">
            {filteredGear.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500 font-medium">
                  {inlineQuery.trim()
                    ? `No available inventory items match "${inlineQuery}".`
                    : 'All inventory equipment is currently deployed.'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Check-in equipment from other shoots or inspect inventory status.
                </p>
              </div>
            ) : (
              filteredGear.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-3 py-2 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-50/90 text-amber-950 ring-1 ring-amber-300'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {/* Left: Asset tag pill + Name & info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Standardised Tag Column */}
                      <span className="w-[100px] shrink-0 font-mono font-bold text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-center shadow-2xs">
                        {item.assetTag}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>Loc: {item.location}</span>
                          {item.serialNumber && (
                            <>
                              <span>•</span>
                              <span>SN: {item.serialNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Add Button / Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {item.condition || 'Available'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(item);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const FieldShootSummaryView: React.FC<FieldShootSummaryProps> = ({
  gear,
  projects = [],
  currentUser,
  onCheckinGear,
  onBatchCheckin,
  onSelectGear,
  onOpenQrModal,
  onReportIssue,
  onUpdateGear,
  onAddProject,
  onProjectsChange,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'combined' | 'gantt' | 'cards'>('combined');
  const [searchQuery, setSearchQuery] = useState('');
  const [packChecklist, setPackChecklist] = useState<Record<string, boolean>>({});
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({
    'Apex Commercial - Day 2': true,
    'Wilderness Echoes Documentary': true,
  });

  const [activeSegment, setActiveSegment] = useState<'all' | 'deployments' | 'loans'>('all');
  const [expandedLoans, setExpandedLoans] = useState<Record<string, boolean>>({});

  // Modal State for Adding a New Deployment
  const [isAddDeploymentOpen, setIsAddDeploymentOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjJobNo, setNewProjJobNo] = useState('');
  const [newProjDeploymentDate, setNewProjDeploymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newProjReturnDate, setNewProjReturnDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [newProjLocation, setNewProjLocation] = useState<string>('');
  const [newProjLeadDP, setNewProjLeadDP] = useState(currentUser?.name || 'Lead DP');
  const [newProjEmail, setNewProjEmail] = useState(currentUser?.email || 'crew@production.com');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjNotes, setNewProjNotes] = useState('');
  const [selectedInitialGearIds, setSelectedInitialGearIds] = useState<string[]>([]);

  // Modal State for Adding a New Loan
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [newLoanBorrowerName, setNewLoanBorrowerName] = useState('');
  const [newLoanBorrowerCompany, setNewLoanBorrowerCompany] = useState('');
  const [newLoanBorrowerContact, setNewLoanBorrowerContact] = useState('');
  const [newLoanStartDate, setNewLoanStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newLoanReturnDate, setNewLoanReturnDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [newLoanPurpose, setNewLoanPurpose] = useState('');
  const [newLoanNotes, setNewLoanNotes] = useState('');
  const [selectedLoanGearIds, setSelectedLoanGearIds] = useState<string[]>([]);

  // Modal State for Editing an Existing Deployment
  const [editingDeploymentName, setEditingDeploymentName] = useState<string | null>(null);
  const [editProjName, setEditProjName] = useState('');
  const [editProjJobNo, setEditProjJobNo] = useState('');
  const [editProjDeploymentDate, setEditProjDeploymentDate] = useState('');
  const [editProjReturnDate, setEditProjReturnDate] = useState('');
  const [editProjLocation, setEditProjLocation] = useState<string>('');
  const [editProjLeadDP, setEditProjLeadDP] = useState('');
  const [editProjEmail, setEditProjEmail] = useState('');
  const [editProjClient, setEditProjClient] = useState('');
  const [editProjNotes, setEditProjNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Modal State for Editing an Existing Loan
  const [editingLoan, setEditingLoan] = useState<{ id: string; loan: LoanRecord; items: GearItem[] } | null>(null);
  const [editLoanBorrowerName, setEditLoanBorrowerName] = useState('');
  const [editLoanBorrowerCompany, setEditLoanBorrowerCompany] = useState('');
  const [editLoanBorrowerContact, setEditLoanBorrowerContact] = useState('');
  const [editLoanStartDate, setEditLoanStartDate] = useState('');
  const [editLoanReturnDate, setEditLoanReturnDate] = useState('');
  const [editLoanPurpose, setEditLoanPurpose] = useState('');
  const [editLoanNotes, setEditLoanNotes] = useState('');
  const [showDeleteLoanConfirm, setShowDeleteLoanConfirm] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    if (
      !editingDeploymentName &&
      !isAddDeploymentOpen &&
      !showDeleteConfirm &&
      !isAddLoanOpen &&
      !editingLoan &&
      !showDeleteLoanConfirm
    )
      return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
          return;
        }
        if (showDeleteLoanConfirm) {
          setShowDeleteLoanConfirm(false);
          return;
        }
        if (editingDeploymentName) {
          setEditingDeploymentName(null);
          setShowDeleteConfirm(false);
        }
        if (editingLoan) {
          setEditingLoan(null);
          setShowDeleteLoanConfirm(false);
        }
        if (isAddDeploymentOpen) setIsAddDeploymentOpen(false);
        if (isAddLoanOpen) setIsAddLoanOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    editingDeploymentName,
    isAddDeploymentOpen,
    showDeleteConfirm,
    isAddLoanOpen,
    editingLoan,
    showDeleteLoanConfirm,
  ]);

  // Drag & Drop State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragSourceProject, setDragSourceProject] = useState<string | null>(null);
  const [dragOverProject, setDragOverProject] = useState<string | null>(null);
  const [hoveredSwapItemId, setHoveredSwapItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available Gear Staging Drawer
  const [showStagingDrawer, setShowStagingDrawer] = useState(false);

  // Deployment Color Palette Picker State
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [colorPickerPos, setColorPickerPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [deploymentColors, setDeploymentColors] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('cinevault_deployment_colors');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Keep colors synchronized with incoming projects
  useEffect(() => {
    if (projects && projects.length > 0) {
      setDeploymentColors((prev) => {
        let changed = false;
        const next = { ...prev };
        projects.forEach((p) => {
          if (p.color && next[p.name] !== p.color) {
            next[p.name] = p.color;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [projects]);

  // Close color picker on outside click, scroll, or resize
  useEffect(() => {
    if (!activeColorPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.deployment-color-picker-popover') && !target.closest('.deployment-color-dot-btn')) {
        setActiveColorPicker(null);
      }
    };
    const handleDismiss = () => {
      setActiveColorPicker(null);
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [activeColorPicker]);

  // Right-Click Context Menu for Equipment in Deployment Window
  const [equipmentContextMenu, setEquipmentContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    item: GearItem;
    projectName: string;
  } | null>(null);

  // Close context menu on click outside, scroll, resize, or Escape
  useEffect(() => {
    if (!equipmentContextMenu) return;
    const handleDismiss = () => {
      setEquipmentContextMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEquipmentContextMenu(null);
      }
    };
    window.addEventListener('mousedown', handleDismiss);
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleDismiss);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [equipmentContextMenu]);

  // Filter checked out gear and loaned gear
  const checkedOutGear = useMemo(() => gear.filter((g) => g.status === 'Checked Out'), [gear]);
  const loanedGear = useMemo(() => gear.filter((g) => g.status === 'Out On Loan'), [gear]);
  const availableGear = useMemo(() => gear.filter((g) => g.status === 'Available'), [gear]);

  // Group loaned gear by loan ID or borrower name
  const loanGroups = useMemo(() => {
    const map: Record<string, { id: string; loan: LoanRecord; items: GearItem[] }> = {};
    loanedGear.forEach((item) => {
      const loan = item.currentLoan || {
        id: item.currentCheckout?.id || `loan-fallback-${item.id}`,
        borrowerName: item.currentCheckout?.userName || 'External Partner',
        borrowerCompany: item.currentCheckout?.projectName,
        borrowerContact: item.currentCheckout?.userEmail,
        loanDate: normalizeDateToYMD(item.currentCheckout?.checkoutDate) || new Date().toISOString().split('T')[0],
        expectedReturnDate:
          normalizeDateToYMD(item.currentCheckout?.expectedReturnDate) ||
          new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        purpose: item.currentCheckout?.notes,
      };
      const key = loan.id || loan.borrowerName;
      if (!map[key]) {
        map[key] = { id: key, loan, items: [] };
      }
      map[key].items.push(item);
    });
    return Object.values(map);
  }, [loanedGear]);

  // Compile all known deployment projects (from projects prop + any active checkouts)
  const allDeploymentProjects = useMemo(() => {
    const list: {
      name: string;
      jobNo?: string;
      projectObj?: ShootProject;
      location?: string;
      leadDP?: string;
      deploymentDate?: string;
      expectedReturnDate?: string;
      client?: string;
      notes?: string;
    }[] = [];

    const knownNames = new Set<string>();

    // Add from ShootProject[] prop
    projects.forEach((p) => {
      knownNames.add(p.name);
      list.push({
        name: p.name,
        jobNo: p.jobNo,
        projectObj: p,
        location: p.location,
        leadDP: p.leadDP,
        deploymentDate: normalizeDateToYMD(p.startDate) || p.startDate,
        expectedReturnDate: normalizeDateToYMD(p.endDate) || p.endDate,
        client: p.client,
      });
    });

    // Add any projects that exist on checked out gear but aren't in ShootProject list
    checkedOutGear.forEach((item) => {
      const pName = item.currentCheckout?.projectName;
      if (pName && !knownNames.has(pName)) {
        knownNames.add(pName);
        list.push({
          name: pName,
          jobNo: item.currentCheckout?.jobNo,
          location: item.currentCheckout?.shootLocation,
          leadDP: item.currentCheckout?.userName,
          deploymentDate: normalizeDateToYMD(item.currentCheckout?.checkoutDate),
          expectedReturnDate: normalizeDateToYMD(item.currentCheckout?.expectedReturnDate),
          notes: item.currentCheckout?.notes,
        });
      }
    });

    return list;
  }, [projects, checkedOutGear]);

  // Group checked out gear by Project Name
  const gearByProject = useMemo(() => {
    const map: Record<string, GearItem[]> = {};

    // Initialize all known projects with empty array so newly created empty projects show up!
    allDeploymentProjects.forEach((p) => {
      map[p.name] = [];
    });

    checkedOutGear.forEach((item) => {
      const projName = item.currentCheckout?.projectName || 'Unassigned Field Shoot';
      if (!map[projName]) {
        map[projName] = [];
      }
      map[projName].push(item);
    });

    return map;
  }, [allDeploymentProjects, checkedOutGear]);

  const projectNames = Object.keys(gearByProject);

  // Visible projects based on active project filter and search query
  const visibleProjectNames = useMemo(() => {
    return projectNames.filter((projName) => {
      if (selectedProjectId !== 'all' && selectedProjectId !== projName) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      const meta = allDeploymentProjects.find((p) => p.name === projName);
      if (projName.toLowerCase().includes(q)) return true;
      if (meta?.jobNo && meta.jobNo.toLowerCase().includes(q)) return true;
      if (meta?.client && meta.client.toLowerCase().includes(q)) return true;
      const items = gearByProject[projName] || [];
      return items.some(
        (i) =>
          String(i.name || '').toLowerCase().includes(q) ||
          String(i.assetTag || '').toLowerCase().includes(q) ||
          String(i.serialNumber || '').toLowerCase().includes(q) ||
          (i.kitName && String(i.kitName).toLowerCase().includes(q)) ||
          (i.currentCheckout?.jobNo && String(i.currentCheckout.jobNo).toLowerCase().includes(q))
      );
    });
  }, [projectNames, selectedProjectId, searchQuery, allDeploymentProjects, gearByProject]);

  // Visible loan groups based on search query
  const visibleLoanGroups = useMemo(() => {
    if (!searchQuery.trim()) return loanGroups;
    const q = searchQuery.trim().toLowerCase();
    return loanGroups.filter((grp) => {
      if (grp.loan.borrowerName.toLowerCase().includes(q)) return true;
      if (grp.loan.borrowerCompany?.toLowerCase().includes(q)) return true;
      if (grp.loan.purpose?.toLowerCase().includes(q)) return true;
      if (grp.loan.notes?.toLowerCase().includes(q)) return true;
      return grp.items.some(
        (i) =>
          String(i.name || '').toLowerCase().includes(q) ||
          String(i.assetTag || '').toLowerCase().includes(q) ||
          String(i.serialNumber || '').toLowerCase().includes(q)
      );
    });
  }, [loanGroups, searchQuery]);

  const isAllLoansCollapsed = useMemo(() => {
    if (visibleLoanGroups.length === 0) return false;
    return visibleLoanGroups.every((grp) => expandedLoans[grp.id] === false);
  }, [visibleLoanGroups, expandedLoans]);

  const handleExpandAllLoans = () => {
    setExpandedLoans((prev) => {
      const next = { ...prev };
      visibleLoanGroups.forEach((grp) => {
        next[grp.id] = true;
      });
      return next;
    });
  };

  const handleCollapseAllLoans = () => {
    setExpandedLoans((prev) => {
      const next = { ...prev };
      visibleLoanGroups.forEach((grp) => {
        next[grp.id] = false;
      });
      return next;
    });
  };

  // Check if all visible projects are collapsed
  const isAllProjectsCollapsed = useMemo(() => {
    if (visibleProjectNames.length === 0) return false;
    return visibleProjectNames.every((pName) => expandedProjects[pName] === false);
  }, [visibleProjectNames, expandedProjects]);

  // Expand all visible deployments
  const handleExpandAllProjects = () => {
    setExpandedProjects((prev) => {
      const next = { ...prev };
      visibleProjectNames.forEach((pName) => {
        next[pName] = true;
      });
      return next;
    });
  };

  // Collapse all visible deployments
  const handleCollapseAllProjects = () => {
    setExpandedProjects((prev) => {
      const next = { ...prev };
      visibleProjectNames.forEach((pName) => {
        next[pName] = false;
      });
      return next;
    });
  };

  // Compute Gantt Timeline Data
  const ganttData = useMemo(() => {
    const activeProjects = allDeploymentProjects.filter(
      (p) => selectedProjectId === 'all' || p.name === selectedProjectId
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parsedDeployments = (activeSegment === 'loans' ? [] : activeProjects).map((p, idx) => {
      const assignedItems = gearByProject[p.name] || [];
      const firstCheckout = assignedItems[0]?.currentCheckout;
      const startStr =
        normalizeDateToYMD(p.deploymentDate) ||
        normalizeDateToYMD(firstCheckout?.checkoutDate) ||
        new Date().toISOString().split('T')[0];
      const endStr =
        normalizeDateToYMD(p.expectedReturnDate) ||
        normalizeDateToYMD(firstCheckout?.expectedReturnDate) ||
        new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

      const startDate = new Date(startStr + 'T00:00:00');
      const endDate = new Date(endStr + 'T00:00:00');
      const safeStartDate = isNaN(startDate.getTime()) ? today : startDate;
      const safeEndDate =
        isNaN(endDate.getTime()) || endDate < safeStartDate
          ? new Date(safeStartDate.getTime() + 86400000 * 2)
          : endDate;

      const customColor = deploymentColors[p.name] || p.projectObj?.color;
      const theme = getDeploymentTheme(p.name, idx, customColor);

      return {
        type: 'deployment' as const,
        id: p.name,
        name: p.name,
        jobNo: p.jobNo || firstCheckout?.jobNo,
        client: p.client,
        leadDP: p.leadDP || firstCheckout?.userName || 'Lead DP',
        location: p.location || firstCheckout?.shootLocation || 'On Location',
        borrowerName: undefined as string | undefined,
        borrowerCompany: undefined as string | undefined,
        purpose: undefined as string | undefined,
        notes: undefined as string | undefined,
        contact: undefined as string | undefined,
        loanGroup: undefined as { id: string; loan: LoanRecord; items: GearItem[] } | undefined,
        startStr,
        endStr,
        startDate: safeStartDate,
        endDate: safeEndDate,
        itemCount: assignedItems.length,
        theme,
      };
    });

    const parsedLoans = (activeSegment === 'deployments' ? [] : loanGroups).map((grp) => {
      const startStr =
        normalizeDateToYMD(grp.loan.loanDate) ||
        new Date().toISOString().split('T')[0];
      const endStr =
        normalizeDateToYMD(grp.loan.expectedReturnDate) ||
        new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

      const startDate = new Date(startStr + 'T00:00:00');
      const endDate = new Date(endStr + 'T00:00:00');
      const safeStartDate = isNaN(startDate.getTime()) ? today : startDate;
      const safeEndDate =
        isNaN(endDate.getTime()) || endDate < safeStartDate
          ? new Date(safeStartDate.getTime() + 86400000 * 3)
          : endDate;

      return {
        type: 'loan' as const,
        id: grp.id,
        name: grp.loan.borrowerCompany
          ? `${grp.loan.borrowerName} (${grp.loan.borrowerCompany})`
          : grp.loan.borrowerName,
        jobNo: undefined as string | undefined,
        client: grp.loan.borrowerCompany,
        leadDP: grp.loan.borrowerName,
        location: 'External Loan',
        borrowerName: grp.loan.borrowerName,
        borrowerCompany: grp.loan.borrowerCompany,
        purpose: grp.loan.purpose,
        notes: grp.loan.notes,
        contact: grp.loan.borrowerContact,
        loanGroup: grp,
        startStr,
        endStr,
        startDate: safeStartDate,
        endDate: safeEndDate,
        itemCount: grp.items.length,
        theme: LOAN_THEME,
      };
    });

    const parsed = [...parsedDeployments, ...parsedLoans];

    if (parsed.length === 0) return null;

    const allStarts = parsed.map((p) => p.startDate.getTime());
    const allEnds = parsed.map((p) => p.endDate.getTime());
    const minStart = Math.min(...allStarts, today.getTime() - 86400000 * 2);
    const maxEnd = Math.max(...allEnds, today.getTime() + 86400000 * 7);

    // Timeline window with lead and trailing buffers
    const timelineStart = new Date(minStart - 86400000 * 2);
    timelineStart.setHours(0, 0, 0, 0);
    const timelineEnd = new Date(maxEnd + 86400000 * 3);
    timelineEnd.setHours(0, 0, 0, 0);

    const days: {
      date: Date;
      dateStr: string;
      dayOfWeek: string;
      dayNum: number;
      monthName: string;
      isToday: boolean;
      isWeekend: boolean;
      isMonday: boolean;
    }[] = [];

    const curr = new Date(timelineStart);
    while (curr <= timelineEnd) {
      const isToday =
        curr.getFullYear() === today.getFullYear() &&
        curr.getMonth() === today.getMonth() &&
        curr.getDate() === today.getDate();
      const dayOfWeek = curr.toLocaleDateString('en-US', { weekday: 'narrow' });
      const monthName = curr.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = curr.getDate();
      const isWeekend = curr.getDay() === 0 || curr.getDay() === 6;
      const isMonday = curr.getDay() === 1;

      days.push({
        date: new Date(curr),
        dateStr: curr.toISOString().split('T')[0],
        dayOfWeek,
        dayNum,
        monthName,
        isToday,
        isWeekend,
        isMonday,
      });

      curr.setDate(curr.getDate() + 1);
    }

    const totalDays = Math.max(1, days.length);
    const timelineStartTime = timelineStart.getTime();
    const dayMs = 86400000;

    // Detect Overlaps
    const overlaps: {
      projA: string;
      projB: string;
      typeA: 'deployment' | 'loan';
      typeB: 'deployment' | 'loan';
      range: string;
    }[] = [];
    for (let i = 0; i < parsed.length; i++) {
      for (let j = i + 1; j < parsed.length; j++) {
        const a = parsed[i];
        const b = parsed[j];
        if (a.startDate <= b.endDate && a.endDate >= b.startDate) {
          const overlapStart = new Date(Math.max(a.startDate.getTime(), b.startDate.getTime()));
          const overlapEnd = new Date(Math.min(a.endDate.getTime(), b.endDate.getTime()));
          overlaps.push({
            projA: a.name,
            projB: b.name,
            typeA: a.type,
            typeB: b.type,
            range: `${formatDateDDMMYYYY(overlapStart)} – ${formatDateDDMMYYYY(overlapEnd)}`,
          });
        }
      }
    }

    // Bars
    const bars = parsed.map((p) => {
      const startDiff = (p.startDate.getTime() - timelineStartTime) / dayMs;
      const endDiff = (p.endDate.getTime() - timelineStartTime) / dayMs + 1;

      const leftPercent = Math.max(0, Math.min(100, (startDiff / totalDays) * 100));
      const rightPercent = Math.max(0, Math.min(100, (endDiff / totalDays) * 100));
      const widthPercent = Math.max(3.8, rightPercent - leftPercent);

      const durationDays = Math.max(
        1,
        Math.round((p.endDate.getTime() - p.startDate.getTime()) / dayMs) + 1
      );

      return {
        ...p,
        leftPercent,
        widthPercent,
        durationDays,
      };
    });

    const todayDiff = (today.getTime() - timelineStartTime) / dayMs;
    const todayPercent = Math.max(0, Math.min(100, (todayDiff / totalDays) * 100));

    return {
      days,
      bars,
      overlaps,
      todayPercent,
      totalDays,
    };
  }, [allDeploymentProjects, gearByProject, selectedProjectId, deploymentColors, loanGroups, activeSegment]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Set custom colour code for a deployment project
  const handleSetDeploymentColor = (projName: string, colorId: string) => {
    setDeploymentColors((prev) => {
      const next = { ...prev, [projName]: colorId };
      try {
        localStorage.setItem('cinevault_deployment_colors', JSON.stringify(next));
      } catch {}
      return next;
    });

    const themeObj = DEPLOYMENT_THEMES.find((t) => t.id === colorId);
    showToast(`Assigned ${themeObj?.name || colorId} colour to "${projName}"`);

    if (onProjectsChange && projects) {
      const existing = projects.find((p) => p.name === projName);
      if (existing) {
        const updatedObj = { ...existing, color: colorId };
        const updated = projects.map((p) => (p.name === projName ? updatedObj : p));
        onProjectsChange(updated, updatedObj);
      } else {
        const projectMeta = allDeploymentProjects.find((p) => p.name === projName);
        const cleanStart = normalizeDateToYMD(projectMeta?.deploymentDate) || new Date().toISOString().split('T')[0];
        const cleanEnd = normalizeDateToYMD(projectMeta?.expectedReturnDate) || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
        const newProj: ShootProject = {
          id: `proj-${Date.now()}`,
          name: projName,
          client: projectMeta?.client || '',
          leadDP: projectMeta?.leadDP || currentUser?.name || 'Lead DP',
          location: projectMeta?.location || 'Studio',
          startDate: cleanStart,
          endDate: cleanEnd,
          assignedGearIds: (gearByProject[projName] || []).map((g) => g.id),
          status: 'On Shoot',
          color: colorId,
        };
        onProjectsChange([newProj, ...projects], newProj);
      }
    }
  };

  const handleResetDeploymentColor = (projName: string) => {
    setDeploymentColors((prev) => {
      const next = { ...prev };
      delete next[projName];
      try {
        localStorage.setItem('cinevault_deployment_colors', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Reset colour for "${projName}" to default`);
  };

  const toggleChecklistItem = (id: string) => {
    setPackChecklist((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleProjectExpand = (projName: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [projName]: prev[projName] === false ? true : false,
    }));
  };

  // Mark all verified for a project
  const markAllVerified = (items: GearItem[]) => {
    const updates: Record<string, boolean> = {};
    items.forEach((item) => {
      updates[item.id] = true;
    });
    setPackChecklist((prev) => ({ ...prev, ...updates }));
    showToast(`All ${items.length} items verified for strike.`);
  };

  // Handle Form Submit: Add New Deployment
  const handleCreateDeployment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;

    const trimmedName = newProjName.trim();
    const cleanJobNo = newProjJobNo.trim() || undefined;
    const cleanStartDate = normalizeDateToYMD(newProjDeploymentDate) || newProjDeploymentDate || new Date().toISOString().split('T')[0];
    const cleanEndDate = normalizeDateToYMD(newProjReturnDate) || newProjReturnDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

    const newProject: ShootProject = {
      id: `proj-${Date.now()}`,
      name: trimmedName,
      jobNo: cleanJobNo,
      client: newProjClient.trim() || 'Internal Production',
      leadDP: newProjLeadDP.trim() || currentUser?.name || 'Production Lead',
      location: newProjLocation.trim() || 'Field Location',
      startDate: cleanStartDate,
      endDate: cleanEndDate,
      assignedGearIds: selectedInitialGearIds,
      status: 'On Shoot',
    };

    if (onAddProject) {
      onAddProject(newProject);
    }

    // If initial gear items were selected from available gear, check them out now
    if (selectedInitialGearIds.length > 0 && onUpdateGear) {
      selectedInitialGearIds.forEach((gearId) => {
        const item = gear.find((g) => g.id === gearId);
        if (item) {
          const updated: GearItem = {
            ...item,
            status: 'Checked Out',
            currentCheckout: {
              id: `chk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              gearId: item.id,
              gearName: item.name,
              assetTag: item.assetTag,
              userId: currentUser?.id || 'user-field',
              userName: newProjLeadDP.trim() || currentUser?.name || 'Field Crew',
              userEmail: newProjEmail.trim() || currentUser?.email || 'crew@production.com',
              projectName: trimmedName,
              jobNo: cleanJobNo,
              shootLocation: newProjLocation.trim() || 'Field Location',
              checkoutDate: `${cleanStartDate}T08:00:00Z`,
              expectedReturnDate: `${cleanEndDate}T18:00:00Z`,
              status: 'Active',
              conditionOnCheckout: item.condition,
              notes: newProjNotes.trim() || `Deployed on ${cleanStartDate}`,
            },
            updatedAt: new Date().toISOString(),
          };
          onUpdateGear(updated);
        }
      });
    }

    // Auto expand the new deployment
    setExpandedProjects((prev) => ({
      ...prev,
      [trimmedName]: true,
    }));

    showToast(
      `Deployment "${trimmedName}" created for ${newProjDeploymentDate}${
        selectedInitialGearIds.length > 0 ? ` with ${selectedInitialGearIds.length} assets allocated` : ''
      }.`
    );

    // Reset Form
    setNewProjName('');
    setNewProjJobNo('');
    setNewProjLocation('');
    setNewProjClient('');
    setNewProjNotes('');
    setSelectedInitialGearIds([]);
    setIsAddDeploymentOpen(false);
  };

  // Open Edit Deployment Modal
  const handleOpenEditDeployment = (projName: string) => {
    setShowDeleteConfirm(false);
    const projectMeta = allDeploymentProjects.find((p) => p.name === projName);
    const assignedItems = gearByProject[projName] || [];
    const firstCheckout = assignedItems[0]?.currentCheckout;

    const initialLocation = projectMeta?.location || firstCheckout?.shootLocation || '';

    setEditingDeploymentName(projName);
    setEditProjName(projName);
    setEditProjJobNo(projectMeta?.jobNo || firstCheckout?.jobNo || '');
    setEditProjDeploymentDate(
      normalizeDateToYMD(projectMeta?.deploymentDate) ||
        normalizeDateToYMD(firstCheckout?.checkoutDate) ||
        new Date().toISOString().split('T')[0]
    );
    setEditProjReturnDate(
      normalizeDateToYMD(projectMeta?.expectedReturnDate) ||
        normalizeDateToYMD(firstCheckout?.expectedReturnDate) ||
        new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    );
    setEditProjLocation(initialLocation);
    setEditProjLeadDP(
      projectMeta?.leadDP || firstCheckout?.userName || currentUser?.name || 'Lead DP'
    );
    setEditProjEmail(firstCheckout?.userEmail || currentUser?.email || 'crew@production.com');
    setEditProjClient(projectMeta?.client || '');
    setEditProjNotes(projectMeta?.notes || firstCheckout?.notes || '');
  };

  // Save Edit Deployment
  const handleSaveEditDeployment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeploymentName) return;
    const trimmedNewName = editProjName.trim();
    if (!trimmedNewName) return;
    const cleanJobNo = editProjJobNo.trim() || undefined;
    const oldName = editingDeploymentName;

    const cleanStartDate = normalizeDateToYMD(editProjDeploymentDate) || editProjDeploymentDate;
    const cleanEndDate = normalizeDateToYMD(editProjReturnDate) || editProjReturnDate;

    // 1. Update ShootProject[] list if callback available
    if (onProjectsChange) {
      const existingProjIndex = (projects || []).findIndex(
        (p) => p.name === oldName || (editingDeploymentName && p.name === editingDeploymentName)
      );
      if (existingProjIndex >= 0) {
        const updatedProjects = [...(projects || [])];
        const updatedObj: ShootProject = {
          ...updatedProjects[existingProjIndex],
          name: trimmedNewName,
          jobNo: cleanJobNo,
          client: editProjClient.trim() || updatedProjects[existingProjIndex].client || 'Internal Production',
          leadDP: editProjLeadDP.trim() || updatedProjects[existingProjIndex].leadDP || currentUser?.name || 'Production Lead',
          location: editProjLocation.trim() || updatedProjects[existingProjIndex].location || 'Field Location',
          startDate: cleanStartDate,
          endDate: cleanEndDate,
        };
        updatedProjects[existingProjIndex] = updatedObj;
        onProjectsChange(updatedProjects, updatedObj);
      } else {
        const newProjObj: ShootProject = {
          id: `proj-${Date.now()}`,
          name: trimmedNewName,
          jobNo: cleanJobNo,
          client: editProjClient.trim() || 'Internal Production',
          leadDP: editProjLeadDP.trim() || currentUser?.name || 'Production Lead',
          location: editProjLocation.trim() || 'Field Location',
          startDate: cleanStartDate,
          endDate: cleanEndDate,
          assignedGearIds: (gearByProject[oldName] || []).map((g) => g.id),
          status: 'On Shoot',
        };
        const updatedProjects = [...(projects || []), newProjObj];
        onProjectsChange(updatedProjects, newProjObj);
      }
    }

    // 2. Update all checked out gear currently assigned to this deployment
    const assignedItems = gearByProject[oldName] || [];
    if (assignedItems.length > 0 && onUpdateGear) {
      assignedItems.forEach((item) => {
        if (item.currentCheckout) {
          const updated: GearItem = {
            ...item,
            currentCheckout: {
              ...item.currentCheckout,
              projectName: trimmedNewName,
              jobNo: cleanJobNo,
              shootLocation: editProjLocation.trim(),
              userName: editProjLeadDP.trim() || item.currentCheckout.userName,
              userEmail: editProjEmail.trim() || item.currentCheckout.userEmail,
              checkoutDate: cleanStartDate
                ? `${cleanStartDate}T08:00:00Z`
                : item.currentCheckout.checkoutDate,
              expectedReturnDate: cleanEndDate
                ? `${cleanEndDate}T18:00:00Z`
                : item.currentCheckout.expectedReturnDate,
              notes: editProjNotes.trim() || item.currentCheckout.notes,
            },
            updatedAt: new Date().toISOString(),
          };
          onUpdateGear(updated);
        }
      });
    }

    // 3. Keep selected & expanded state synced if name changed
    if (oldName !== trimmedNewName) {
      if (selectedProjectId === oldName) {
        setSelectedProjectId(trimmedNewName);
      }
      setExpandedProjects((prev) => {
        const next = { ...prev };
        next[trimmedNewName] = prev[oldName] !== false;
        delete next[oldName];
        return next;
      });
    }

    setEditingDeploymentName(null);
    showToast(`Deployment "${trimmedNewName}" details updated successfully.`);
  };

  // Delete Deployment
  const handleDeleteDeployment = () => {
    if (!editingDeploymentName) return;
    const projNameToDelete = editingDeploymentName;
    const projectMeta = allDeploymentProjects.find((p) => p.name === projNameToDelete);
    const assignedItems = gearByProject[projNameToDelete] || [];

    // 1. Return gear assigned to this shoot back to cage
    if (assignedItems.length > 0) {
      if (onBatchCheckin) {
        onBatchCheckin(assignedItems.map((i) => i.id));
      } else if (onUpdateGear) {
        assignedItems.forEach((item) => {
          onUpdateGear({
            ...item,
            status: 'Available',
            currentCheckout: undefined,
            updatedAt: new Date().toISOString(),
          });
        });
      }
    }

    // 2. Remove project from ShootProject list
    if (onProjectsChange) {
      const updatedProjects = (projects || []).filter(
        (p) => p.name !== projNameToDelete && p.id !== projectMeta?.projectObj?.id
      );
      onProjectsChange(updatedProjects);
    }

    // 3. Clear selected and expanded states
    if (selectedProjectId === projNameToDelete) {
      setSelectedProjectId('all');
    }
    setExpandedProjects((prev) => {
      const next = { ...prev };
      delete next[projNameToDelete];
      return next;
    });

    // 4. Remove custom deployment color if set
    setDeploymentColors((prev) => {
      const next = { ...prev };
      delete next[projNameToDelete];
      try {
        localStorage.setItem('cinevault_deployment_colors', JSON.stringify(next));
      } catch {}
      return next;
    });

    setShowDeleteConfirm(false);
    setEditingDeploymentName(null);
    showToast(
      `Deployment "${projNameToDelete}" deleted${
        assignedItems.length > 0 ? ` and ${assignedItems.length} item(s) returned to the cage` : ''
      }.`
    );
  };

  // Handle Form Submit: Add New Loan
  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoanBorrowerName.trim()) {
      showToast('Please provide the borrower name.');
      return;
    }
    if (selectedLoanGearIds.length === 0) {
      showToast('Please select at least one piece of equipment to loan out.');
      return;
    }

    const loanId = `loan-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cleanStartDate = newLoanStartDate || new Date().toISOString().split('T')[0];
    const cleanReturnDate =
      newLoanReturnDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

    const loanRecord: LoanRecord = {
      id: loanId,
      borrowerName: newLoanBorrowerName.trim(),
      borrowerCompany: newLoanBorrowerCompany.trim() || undefined,
      borrowerContact: newLoanBorrowerContact.trim() || undefined,
      loanDate: new Date(cleanStartDate).toISOString(),
      expectedReturnDate: new Date(cleanReturnDate).toISOString(),
      purpose: newLoanPurpose.trim() || undefined,
      notes: newLoanNotes.trim() || undefined,
    };

    const now = new Date().toISOString();
    selectedLoanGearIds.forEach((id) => {
      const item = gear.find((g) => g.id === id);
      if (item && onUpdateGear) {
        const updated: GearItem = {
          ...item,
          status: 'Out On Loan',
          currentLoan: loanRecord,
          currentCheckout: {
            id: `chk-loan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            gearId: item.id,
            gearName: item.name,
            assetTag: item.assetTag,
            userId: currentUser?.id || 'usr-loan',
            userName: loanRecord.borrowerName,
            userEmail: loanRecord.borrowerContact || '',
            projectName: `Loan: ${loanRecord.borrowerCompany || loanRecord.borrowerName}`,
            shootLocation: loanRecord.borrowerCompany || 'External Loan',
            checkoutDate: loanRecord.loanDate,
            expectedReturnDate: loanRecord.expectedReturnDate,
            status: 'Active',
            notes: loanRecord.purpose || 'Out on external loan',
            conditionOnCheckout: item.condition,
          },
          updatedAt: now,
        };
        onUpdateGear(updated);
      }
    });

    setExpandedLoans((prev) => ({
      ...prev,
      [loanId]: true,
    }));

    showToast(
      `Loan registered for "${loanRecord.borrowerName}" with ${selectedLoanGearIds.length} assets.`
    );

    // Reset form
    setNewLoanBorrowerName('');
    setNewLoanBorrowerCompany('');
    setNewLoanBorrowerContact('');
    setNewLoanPurpose('');
    setNewLoanNotes('');
    setSelectedLoanGearIds([]);
    setIsAddLoanOpen(false);
  };

  // Open Edit Loan Modal
  const handleOpenEditLoan = (grp: { id: string; loan: LoanRecord; items: GearItem[] }) => {
    setShowDeleteLoanConfirm(false);
    setEditingLoan(grp);
    setEditLoanBorrowerName(grp.loan.borrowerName || '');
    setEditLoanBorrowerCompany(grp.loan.borrowerCompany || '');
    setEditLoanBorrowerContact(grp.loan.borrowerContact || '');
    setEditLoanStartDate(
      normalizeDateToYMD(grp.loan.loanDate) || new Date().toISOString().split('T')[0]
    );
    setEditLoanReturnDate(
      normalizeDateToYMD(grp.loan.expectedReturnDate) ||
        new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
    );
    setEditLoanPurpose(grp.loan.purpose || '');
    setEditLoanNotes(grp.loan.notes || '');
  };

  // Handle Form Submit: Save Edited Loan
  const handleSaveEditLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoan) return;

    const updatedLoan: LoanRecord = {
      ...editingLoan.loan,
      borrowerName: editLoanBorrowerName.trim() || editingLoan.loan.borrowerName,
      borrowerCompany: editLoanBorrowerCompany.trim() || undefined,
      borrowerContact: editLoanBorrowerContact.trim() || undefined,
      loanDate: new Date(editLoanStartDate).toISOString(),
      expectedReturnDate: new Date(editLoanReturnDate).toISOString(),
      purpose: editLoanPurpose.trim() || undefined,
      notes: editLoanNotes.trim() || undefined,
    };

    const now = new Date().toISOString();
    editingLoan.items.forEach((item) => {
      if (onUpdateGear) {
        const updated: GearItem = {
          ...item,
          currentLoan: updatedLoan,
          currentCheckout: item.currentCheckout
            ? {
                ...item.currentCheckout,
                userName: updatedLoan.borrowerName,
                userEmail: updatedLoan.borrowerContact || '',
                projectName: `Loan: ${updatedLoan.borrowerCompany || updatedLoan.borrowerName}`,
                checkoutDate: updatedLoan.loanDate,
                expectedReturnDate: updatedLoan.expectedReturnDate,
                notes: updatedLoan.purpose || item.currentCheckout.notes,
              }
            : undefined,
          updatedAt: now,
        };
        onUpdateGear(updated);
      }
    });

    showToast(`Saved changes to loan for "${updatedLoan.borrowerName}".`);
    setEditingLoan(null);
  };

  // Return All Gear on a Loan
  const handleReturnAllLoanGear = async (grp: { id: string; loan: LoanRecord; items: GearItem[] }) => {
    const ids = grp.items.map((it) => it.id);
    if (onBatchCheckin && ids.length > 0) {
      await onBatchCheckin(ids);
    } else if (onCheckinGear) {
      for (const it of grp.items) {
        onCheckinGear(it.id, it.condition, 'Returned from external loan');
      }
    }
    showToast(`Checked in all ${grp.items.length} items from "${grp.loan.borrowerName}".`);
    setEditingLoan(null);
    setShowDeleteLoanConfirm(false);
  };

  // Open right-click context menu on equipment in deployment window
  const handleEquipmentContextMenu = (e: React.MouseEvent, item: GearItem, projName: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent menu going off-screen (compact delete-only context menu)
    const menuWidth = 130;
    const menuHeight = 46;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8);

    setEquipmentContextMenu({
      isOpen: true,
      x: Math.max(8, x),
      y: Math.max(8, y),
      item,
      projectName: projName,
    });
  };

  // Delete / unassign equipment item from shoot deployment (returns to available cage inventory)
  const handleDeleteGearFromDeployment = (item: GearItem, projName: string) => {
    // 1. Check in / return item back to available inventory
    if (onCheckinGear) {
      onCheckinGear(item.id, item.condition, `Removed from deployment "${projName}"`);
    } else if (onUpdateGear) {
      onUpdateGear({
        ...item,
        status: 'Available',
        currentCheckout: undefined,
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Remove gearId from ShootProject.assignedGearIds
    if (onProjectsChange && projects) {
      const updatedProjects = projects.map((p) => {
        if (p.name === projName && Array.isArray(p.assignedGearIds)) {
          return {
            ...p,
            assignedGearIds: p.assignedGearIds.filter((id) => id !== item.id),
          };
        }
        return p;
      });
      onProjectsChange(updatedProjects);
    }

    showToast(`Removed "${item.name}" from "${projName}" (returned to cage).`);
  };

  // Drag and drop: Move gear item to a target deployment project
  const handleTransferGearToProject = (item: GearItem, targetProjName: string) => {
    if (!onUpdateGear) return;
    if (item.currentCheckout?.projectName === targetProjName) return;

    const targetMeta = allDeploymentProjects.find((p) => p.name === targetProjName);

    const updatedItem: GearItem = {
      ...item,
      status: 'Checked Out',
      currentCheckout: {
        id: item.currentCheckout?.id || `chk-${Date.now()}`,
        gearId: item.id,
        gearName: item.name,
        assetTag: item.assetTag,
        userId: item.currentCheckout?.userId || currentUser?.id || 'user-field',
        userName: targetMeta?.leadDP || item.currentCheckout?.userName || 'Field Crew',
        userEmail: item.currentCheckout?.userEmail || currentUser?.email || 'crew@production.com',
        projectName: targetProjName,
        shootLocation: targetMeta?.location || item.currentCheckout?.shootLocation || 'On Location',
        checkoutDate: targetMeta?.deploymentDate
          ? `${targetMeta.deploymentDate}T08:00:00Z`
          : item.currentCheckout?.checkoutDate || new Date().toISOString(),
        expectedReturnDate: targetMeta?.expectedReturnDate
          ? `${targetMeta.expectedReturnDate}T18:00:00Z`
          : item.currentCheckout?.expectedReturnDate ||
            new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'Active',
        conditionOnCheckout: item.condition,
        notes: `Transferred to ${targetProjName} on ${formatDateDDMMYYYY(new Date())}`,
      },
      updatedAt: new Date().toISOString(),
    };

    onUpdateGear(updatedItem);

    // Sync target project's assignedGearIds if project exists in ShootProject[]
    if (onProjectsChange && projects) {
      const updatedProjects = projects.map((p) => {
        if (p.name === targetProjName) {
          const prevIds = Array.isArray(p.assignedGearIds) ? p.assignedGearIds : [];
          if (!prevIds.includes(item.id)) {
            return {
              ...p,
              assignedGearIds: [...prevIds, item.id],
            };
          }
        }
        return p;
      });
      onProjectsChange(updatedProjects);
    }

    const actionWord = item.status === 'Available' ? 'Added' : 'Transferred';
    showToast(`${actionWord} ${item.assetTag} (${item.name}) to "${targetProjName}".`);

    // Ensure target project is expanded so user sees the added item
    setExpandedProjects((prev) => ({ ...prev, [targetProjName]: true }));
  };

  // Drag and drop: Direct Swap between two equipment items
  const handleSwapGearItems = (sourceItem: GearItem, targetItem: GearItem) => {
    if (!onUpdateGear) return;
    if (sourceItem.id === targetItem.id) return;

    const sourceProjectName = sourceItem.currentCheckout?.projectName;
    const targetProjectName = targetItem.currentCheckout?.projectName;

    if (!sourceProjectName || !targetProjectName || sourceProjectName === targetProjectName) {
      return;
    }

    const sourceCheckout = sourceItem.currentCheckout;
    const targetCheckout = targetItem.currentCheckout;

    // Swap checkout metadata between source and target
    const updatedSource: GearItem = {
      ...sourceItem,
      currentCheckout: {
        ...targetCheckout,
        id: sourceCheckout.id,
        gearId: sourceItem.id,
        gearName: sourceItem.name,
        assetTag: sourceItem.assetTag,
        notes: `Swapped with ${targetItem.assetTag} into ${targetProjectName}`,
      },
      updatedAt: new Date().toISOString(),
    };

    const updatedTarget: GearItem = {
      ...targetItem,
      currentCheckout: {
        ...sourceCheckout,
        id: targetCheckout.id,
        gearId: targetItem.id,
        gearName: targetItem.name,
        assetTag: targetItem.assetTag,
        notes: `Swapped with ${sourceItem.assetTag} into ${sourceProjectName}`,
      },
      updatedAt: new Date().toISOString(),
    };

    onUpdateGear(updatedSource);
    onUpdateGear(updatedTarget);

    showToast(
      `Swapped ${sourceItem.assetTag} (${sourceProjectName}) ⇄ ${targetItem.assetTag} (${targetProjectName})!`
    );
  };

  // Drop Handler on a Project Container
  const handleDropOnProject = (e: React.DragEvent, targetProjName: string) => {
    e.preventDefault();
    setDragOverProject(null);
    setHoveredSwapItemId(null);

    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!itemId) return;

    const item = gear.find((g) => g.id === itemId);
    if (!item) return;

    handleTransferGearToProject(item, targetProjName);
    setDraggedItemId(null);
    setDragSourceProject(null);
  };

  // Drop Handler directly onto another Gear Item to trigger an exact Swap
  const handleDropOnGearItem = (e: React.DragEvent, targetItem: GearItem) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverProject(null);
    setHoveredSwapItemId(null);

    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!itemId || itemId === targetItem.id) return;

    const sourceItem = gear.find((g) => g.id === itemId);
    if (!sourceItem) return;

    handleSwapGearItems(sourceItem, targetItem);
    setDraggedItemId(null);
    setDragSourceProject(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Condensed Active Shoots & Loans Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Left: Title & Live Summary */}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Film className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Deployments & Equipment Loans
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 pl-10.5">
              Currently tracking{' '}
              <strong className="text-amber-600 font-semibold">
                {checkedOutGear.length} assets
              </strong>{' '}
              deployed across{' '}
              <strong className="text-slate-700 font-semibold">
                {projectNames.length} {projectNames.length === 1 ? 'shoot' : 'shoots'}
              </strong>
              {loanedGear.length > 0 && (
                <>
                  {' '}•{' '}
                  <strong className="text-purple-600 font-semibold">
                    {loanedGear.length} assets
                  </strong>{' '}
                  on loan across{' '}
                  <strong className="text-slate-700 font-semibold">
                    {loanGroups.length} {loanGroups.length === 1 ? 'external loan' : 'external loans'}
                  </strong>
                </>
              )}.
            </p>
          </div>

          {/* Right: Segment Switcher, Metrics & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Segment Switcher (All / Deployments / Loans) */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveSegment('all')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSegment === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="View both Deployments and Loans"
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">All</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-mono">
                  {visibleProjectNames.length + visibleLoanGroups.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSegment('deployments')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSegment === 'deployments'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Focus on production shoot deployments"
              >
                <Film className="w-3.5 h-3.5 text-amber-600" />
                <span>Shoots</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono">
                  {visibleProjectNames.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSegment('loans')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSegment === 'loans'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Focus on external equipment loans"
              >
                <Handshake className="w-3.5 h-3.5 text-purple-600" />
                <span>Loans</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 text-[10px] font-mono">
                  {visibleLoanGroups.length}
                </span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Deployed</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  {checkedOutGear.length}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-purple-600">On Loan</span>
                <span className="text-xs font-bold text-purple-900 font-mono">
                  {loanedGear.length}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block" />

            {/* Project Filter Select (visible when not on loans tab) */}
            {activeSegment !== 'loans' && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-800 px-3 py-1.5 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer font-medium transition-colors shadow-2xs"
                title="Filter by production project"
              >
                <option value="all">All Active Shoots ({projectNames.length})</option>
                {projectNames.map((name) => {
                  const meta = allDeploymentProjects.find((p) => p.name === name);
                  return (
                    <option key={name} value={name}>
                      {name} {meta?.jobNo ? `[${meta.jobNo}]` : ''} ({gearByProject[name]?.length || 0} items)
                    </option>
                  );
                })}
              </select>
            )}

            {/* View Mode Switcher (Combined / Gantt / Cards) */}
            <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('combined')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'combined'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="View Gantt schedule and cards together"
              >
                <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Combined</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('gantt')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'gantt'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Focus on the Gantt overlap schedule"
              >
                <CalendarRange className="w-3.5 h-3.5 text-indigo-600" />
                <span>Gantt</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="View operational cards and gear lists"
              >
                <LayoutList className="w-3.5 h-3.5 text-slate-600" />
                <span>Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* ========================================================================= */}
      {/* GANTT TIMELINE & OVERLAP SCHEDULE VIEW */}
      {/* ========================================================================= */}
      {(viewMode === 'combined' || viewMode === 'gantt') && ganttData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Gantt Header */}
          <div className="p-5 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shadow-2xs">
                <CalendarRange className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Operations Schedule & Overlap Timeline
                  </h2>
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {ganttData.bars.length} {ganttData.bars.length === 1 ? 'Operation' : 'Operations'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual timeline showing shoot dates, equipment loan durations, and weekly schedule progression.
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable Gantt Canvas */}
          <div className="overflow-x-auto p-5">
            <div className="min-w-[960px] select-none">
              {/* Month / Day Header Grid */}
              <div className="flex border-b border-slate-200 pb-2 mb-3">
                {/* Left Label Column */}
                <div className="w-72 shrink-0 font-bold text-xs uppercase tracking-wider text-slate-400 pl-2">
                  Shoots & Loans
                </div>

                {/* Days Grid Header */}
                <div
                  className="flex-1 grid"
                  style={{
                    gridTemplateColumns: `repeat(${ganttData.days.length}, minmax(0, 1fr))`,
                  }}
                >
                  {ganttData.days.map((day, idx) => (
                    <div
                      key={day.dateStr}
                      className={`text-center py-1 transition-colors relative ${
                        day.isMonday && idx > 0
                          ? 'border-l border-slate-300'
                          : ''
                      } ${
                        day.isToday
                          ? 'bg-amber-500 text-white font-bold shadow-xs rounded'
                          : day.isWeekend
                          ? 'bg-slate-100/70 text-slate-400'
                          : 'text-slate-600'
                      }`}
                      title={`${day.monthName} ${day.dayNum} (${day.dateStr})${day.isMonday ? ' • Week start (Mon)' : ''}`}
                    >
                      <div className="text-[10px] leading-tight font-medium uppercase">
                        {day.dayOfWeek}
                      </div>
                      <div className="text-xs font-bold leading-tight mt-0.5">
                        {day.dayNum}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Lanes */}
              <div className="space-y-3 relative">
                {/* Vertical "Today" Marker Line spanning all lanes */}
                <div
                  className="absolute top-0 bottom-0 pointer-events-none z-10 flex flex-col items-center"
                  style={{
                    left: `calc(18rem + (100% - 18rem) * ${ganttData.todayPercent / 100})`,
                  }}
                >
                  <div className="w-0.5 h-full bg-amber-500 shadow-sm" />
                </div>

                {ganttData.bars.map((bar) => {
                  const isLoan = bar.type === 'loan';
                  return (
                    <div
                      key={bar.id || bar.name}
                      className="flex items-center group/row rounded-xl hover:bg-slate-50/70 p-1.5 transition-colors"
                    >
                      {/* Left Info Column - Standardized Width and Structured Alignment */}
                      <div className="w-72 shrink-0 pr-4 min-w-0">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {/* Fixed-width Icon Slot (20px width, centered) */}
                          <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                            {isLoan ? (
                              <Handshake className="w-4 h-4 text-purple-600" />
                            ) : (
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${bar.theme.dot} ring-2 ring-white shadow-2xs`}
                              />
                            )}
                          </div>

                          {/* Content Area: Title + Badge on top row, metadata on second row */}
                          <div className="flex-1 min-w-0">
                            {/* Title & Badge Row: Title flexes and truncates, Badge stays pinned to the right */}
                            <div className="flex items-center justify-between gap-1.5 min-h-[20px]">
                              <button
                                type="button"
                                onClick={() =>
                                  isLoan && bar.loanGroup
                                    ? handleOpenEditLoan(bar.loanGroup)
                                    : handleOpenEditDeployment(bar.name)
                                }
                                className={`font-bold text-xs truncate text-left cursor-pointer transition-colors ${
                                  isLoan
                                    ? 'text-purple-900 hover:text-purple-700'
                                    : 'text-slate-900 hover:text-amber-600'
                                }`}
                                title={`Click to edit ${bar.name}`}
                              >
                                {bar.name}
                              </button>

                              {/* Standardized Badge Slot */}
                              <div className="shrink-0 flex items-center justify-end">
                                {isLoan ? (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 text-[10px] font-mono font-bold leading-none">
                                    LOAN
                                  </span>
                                ) : bar.jobNo ? (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold leading-none">
                                    {bar.jobNo}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            {/* Metadata Subline: Clean, neat bulleted info aligned exactly with the title */}
                            <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1.5 leading-tight">
                              <span className="font-semibold text-slate-700 shrink-0">
                                {bar.itemCount} {bar.itemCount === 1 ? 'asset' : 'assets'}
                              </span>
                              <span className="text-slate-300 font-bold">•</span>
                              <span className="font-medium text-slate-600 shrink-0">
                                {bar.durationDays}d
                              </span>
                              <span className="text-slate-300 font-bold">•</span>
                              <span className="truncate text-slate-600 font-medium">
                                {isLoan ? bar.borrowerCompany || 'External' : bar.leadDP}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Timeline Lane */}
                      <div className="flex-1 relative h-10 bg-slate-100/60 rounded-xl overflow-hidden border border-slate-200/80 p-1">
                        {/* Day Grid Lines in Background (subtly behind bubbles) */}
                        <div
                          className="absolute inset-0 grid pointer-events-none"
                          style={{
                            gridTemplateColumns: `repeat(${ganttData.days.length}, minmax(0, 1fr))`,
                          }}
                        >
                          {ganttData.days.map((d, i) => {
                            const isNextMonday = ganttData.days[i + 1]?.isMonday;
                            return (
                              <div
                                key={i}
                                className={`h-full ${
                                  d.isMonday && i > 0
                                    ? 'border-l border-slate-300'
                                    : ''
                                } ${
                                  isNextMonday
                                    ? ''
                                    : 'border-r border-slate-200/40'
                                } ${
                                  d.isToday ? 'bg-amber-50/50' : d.isWeekend ? 'bg-slate-200/20' : ''
                                }`}
                              />
                            );
                          })}
                        </div>

                        {/* Interactive Gantt Bar */}
                        <div
                          onClick={() =>
                            isLoan && bar.loanGroup
                              ? handleOpenEditLoan(bar.loanGroup)
                              : handleOpenEditDeployment(bar.name)
                          }
                          style={{
                            left: `${bar.leftPercent}%`,
                            width: `${bar.widthPercent}%`,
                            minWidth: '56px',
                          }}
                          className={`absolute top-1 bottom-1 rounded-lg ${bar.theme.ganttBar} flex items-center justify-between px-2 shadow-xs cursor-pointer ${
                            isLoan ? 'hover:ring-2 hover:ring-purple-400' : 'hover:ring-2 hover:ring-amber-400'
                          } transition-all z-20 overflow-hidden select-none`}
                          title={
                            isLoan
                              ? `${bar.name} [EXTERNAL LOAN]\nDates: ${bar.startStr} to ${bar.endStr} (${bar.durationDays} days)\nBorrower: ${bar.borrowerName}${bar.borrowerCompany ? ` (${bar.borrowerCompany})` : ''}\nPurpose: ${bar.purpose || 'N/A'}\nAssets: ${bar.itemCount} on loan\nClick to edit loan details`
                              : `${bar.name}${bar.jobNo ? ` [Job: ${bar.jobNo}]` : ''}\nDates: ${bar.startStr} to ${bar.endStr} (${bar.durationDays} days)\nLocation: ${bar.location}\nLead DP: ${bar.leadDP}\nAssets: ${bar.itemCount} deployed\nClick to edit deployment`
                          }
                        >
                          {/* Priority 1: Title & Tag */}
                          <div className="flex items-center gap-1 min-w-0 flex-1 mr-1">
                            {isLoan && <Handshake className="w-3 h-3 shrink-0 opacity-90" />}
                            <span className="text-[11px] font-bold truncate tracking-tight">
                              {bar.name}
                            </span>
                            {isLoan ? (
                              bar.widthPercent >= 12 && (
                                <span className="px-1.5 py-0.2 rounded bg-black/20 text-white/95 text-[9px] font-mono font-bold shrink-0">
                                  LOAN
                                </span>
                              )
                            ) : (
                              bar.jobNo && bar.widthPercent >= 12 && (
                                <span className="px-1.5 py-0.2 rounded bg-black/20 text-white/95 text-[9px] font-mono font-bold shrink-0">
                                  {bar.jobNo}
                                </span>
                              )
                            )}
                          </div>

                          {/* Priority 2: Days & Units Badge */}
                          {bar.widthPercent >= 14 ? (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-90 shrink-0 ml-1.5 whitespace-nowrap">
                              <span>{bar.durationDays}d</span>
                              <span>•</span>
                              <span>{bar.itemCount} units</span>
                            </div>
                          ) : bar.widthPercent >= 8 ? (
                            <div className="flex items-center gap-1 text-[10px] font-bold opacity-90 shrink-0 ml-1 whitespace-nowrap">
                              <span>{bar.durationDays}d</span>
                              <span>•</span>
                              <span>{bar.itemCount}u</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-[10px] font-bold opacity-90 shrink-0 ml-1 whitespace-nowrap">
                              <span>{bar.durationDays}d</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Gantt Legend & Guide */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-700">Themes:</span>
                  {ganttData.bars.map((bar) => (
                    <div key={bar.id || bar.name} className="flex items-center gap-1.5">
                      {bar.type === 'loan' ? (
                        <Handshake className="w-3 h-3 text-purple-600" />
                      ) : (
                        <span className={`w-2.5 h-2.5 rounded-full ${bar.theme.dot}`} />
                      )}
                      <span className="text-slate-700 font-medium truncate max-w-[130px]">
                        {bar.name}
                      </span>
                    </div>
                  ))}
                  {loanGroups.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-800 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>External Loans</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 border-t border-slate-400 inline-block" />
                    <span>Week boundary (Mon)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Current Day ("Today")</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Click bar to view/edit details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grouped by Shoot Project Cards */}
      {(viewMode === 'combined' || viewMode === 'cards') && (
        <div className="space-y-6">
          {/* Sticky Deployment Controls Header Bar & In-Viewport Available Equipment Shelf */}
          <div className="sticky top-16 z-30 space-y-3">
            <div className="bg-slate-50/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Left: Section Title, Count & Expand all / Collapse all switch */}
              <div className="flex items-center gap-3 flex-wrap shrink-0">
                <div className="flex items-center gap-2">
                  {activeSegment === 'loans' ? (
                    <Handshake className="w-4 h-4 text-purple-600" />
                  ) : (
                    <LayoutList className="w-4 h-4 text-slate-700" />
                  )}
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    {activeSegment === 'loans'
                      ? 'External Loans'
                      : activeSegment === 'deployments'
                      ? 'Deployments'
                      : 'Operations'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-xs font-bold font-mono">
                    {activeSegment === 'loans'
                      ? visibleLoanGroups.length
                      : activeSegment === 'deployments'
                      ? visibleProjectNames.length
                      : visibleProjectNames.length + visibleLoanGroups.length}
                  </span>
                </div>

                {/* Expand all / Collapse all button switch */}
                {activeSegment === 'loans' ? (
                  visibleLoanGroups.length > 0 && (
                    <button
                      type="button"
                      onClick={isAllLoansCollapsed ? handleExpandAllLoans : handleCollapseAllLoans}
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:text-purple-800 transition-colors cursor-pointer px-2.5 py-1 rounded-xl bg-purple-50/90 hover:bg-purple-100/80 border border-purple-200 shadow-2xs"
                      title={isAllLoansCollapsed ? 'Expand all visible loans' : 'Collapse all visible loans'}
                    >
                      {isAllLoansCollapsed ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 text-purple-700" />
                          <span>Expand All</span>
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 text-purple-700" />
                          <span>Collapse All</span>
                        </>
                      )}
                    </button>
                  )
                ) : (
                  visibleProjectNames.length > 0 && (
                    <button
                      type="button"
                      onClick={isAllProjectsCollapsed ? handleExpandAllProjects : handleCollapseAllProjects}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer px-2.5 py-1 rounded-xl bg-amber-50/90 hover:bg-amber-100/80 border border-amber-200 shadow-2xs"
                      title={isAllProjectsCollapsed ? 'Expand all visible deployments' : 'Collapse all visible deployments'}
                    >
                      {isAllProjectsCollapsed ? (
                        <>
                          <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                          <span>Expand All</span>
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3.5 h-3.5 text-amber-700" />
                          <span>Collapse All</span>
                        </>
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Center: Relocated Search Field in Empty Space */}
              <div className="relative flex-1 min-w-[200px] max-w-sm sm:max-w-md w-full md:w-auto">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    activeSegment === 'loans'
                      ? 'Search loans by borrower, company, tag, model...'
                      : 'Search deployments by name, job no, tag, model...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  spellCheck={false}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right: Add New Deployment / Loan & Available Equipment toggle */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                {(activeSegment === 'all' || activeSegment === 'loans') && (
                  <button
                    type="button"
                    onClick={() => setIsAddLoanOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-sm"
                    title="Register a new external equipment loan"
                  >
                    <Handshake className="w-3.5 h-3.5 text-white" />
                    <span>New Loan</span>
                  </button>
                )}

                {(activeSegment === 'all' || activeSegment === 'deployments') && (
                  <button
                    type="button"
                    onClick={() => setIsAddDeploymentOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-sm"
                    title="Add a new production shoot deployment with date and details"
                  >
                    <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    <span>Add New Deployment</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowStagingDrawer(!showStagingDrawer)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    showStagingDrawer
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                  }`}
                  title="View and allocate available equipment into any deployment"
                >
                  <Box className="w-3.5 h-3.5 text-amber-500" />
                  <span>Available Equipment ({availableGear.length})</span>
                </button>
              </div>
            </div>

            {/* Available Equipment (Collapsible Shelf Docked in Sticky Viewport) */}
            {showStagingDrawer && (
              <div className="bg-white/98 backdrop-blur-md rounded-2xl border border-amber-300 p-4 shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Available Equipment ({availableGear.length})
                    </h3>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      Drag any unit directly into a deployment card below to dispatch
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowStagingDrawer(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                    title="Close available equipment shelf"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {availableGear.length === 0 ? (
                    <p className="text-xs text-slate-400 italic col-span-full py-4 text-center">
                      All equipment is currently deployed on shoot.
                    </p>
                  ) : (
                    availableGear.map((item) => (
                      <div
                        key={item.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', item.id);
                          setDraggedItemId(item.id);
                          setDragSourceProject('Cage');
                        }}
                        onDragEnd={() => {
                          setDraggedItemId(null);
                          setDragSourceProject(null);
                        }}
                        className={`p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-400 transition-all cursor-grab active:cursor-grabbing flex items-center justify-between gap-2 shadow-2xs ${
                          draggedItemId === item.id ? 'opacity-40 ring-2 ring-amber-500' : ''
                        }`}
                        title="Drag this available item into any deployment below to dispatch"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono text-[11px] font-bold text-amber-800 truncate">
                              {item.assetTag}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {item.category} • {item.location}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          Available
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Production Deployments Segment */}
          {(activeSegment === 'all' || activeSegment === 'deployments') && (
            <div className="space-y-6">
              {activeSegment === 'all' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-2xs">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                          Production Deployments
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                          {visibleProjectNames.length} {visibleProjectNames.length === 1 ? 'Shoot' : 'Shoots'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Active film and commercial shoots with crew allocations and checklists.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* No gear checked out state */}
              {visibleProjectNames.length === 0 && (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900">All Equipment Is In the Cage</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    There are no active deployments matching the filter. Click "+ Add New Deployment" above or use the Inventory
                    catalog to dispatch equipment.
                  </p>
                </div>
              )}

              {visibleProjectNames
                .map((projName, projectIndex) => {
              const projectMeta = allDeploymentProjects.find((p) => p.name === projName);
              const customColor = deploymentColors[projName] || projectMeta?.projectObj?.color;
              const theme = getDeploymentTheme(projName, projectIndex, customColor);
              let items = gearByProject[projName] || [];
              if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesProject =
                  projName.toLowerCase().includes(q) ||
                  (projectMeta?.jobNo && projectMeta.jobNo.toLowerCase().includes(q)) ||
                  (projectMeta?.client && projectMeta.client.toLowerCase().includes(q));

                if (!matchesProject) {
                  items = items.filter(
                    (i) =>
                      String(i.name || '').toLowerCase().includes(q) ||
                      String(i.assetTag || '').toLowerCase().includes(q) ||
                      String(i.serialNumber || '').toLowerCase().includes(q) ||
                      (i.kitName && String(i.kitName).toLowerCase().includes(q)) ||
                      (i.currentCheckout?.jobNo && String(i.currentCheckout.jobNo).toLowerCase().includes(q))
                  );
                }
              }

              const firstCheckout = items[0]?.currentCheckout;
              const isExpanded = expandedProjects[projName] !== false;
              const verifiedCount = items.filter((i) => packChecklist[i.id]).length;
              const isFullyVerified = items.length > 0 && verifiedCount === items.length;

              // Drag target state for this project
              const isDragTarget =
                dragOverProject === projName && dragSourceProject !== projName;

              const deploymentDate =
                formatDateDDMMYYYY(
                  projectMeta?.deploymentDate || firstCheckout?.checkoutDate,
                  'Active'
                );
              const returnDate =
                formatDateDDMMYYYY(
                  projectMeta?.expectedReturnDate || firstCheckout?.expectedReturnDate,
                  'TBD'
                );
              const shootLoc =
                projectMeta?.location || firstCheckout?.shootLocation || '';
              const leadDP = projectMeta?.leadDP || firstCheckout?.userName || 'Lead DP';

              const rawStartDate = projectMeta?.deploymentDate || firstCheckout?.checkoutDate;
              const rawEndDate = projectMeta?.expectedReturnDate || firstCheckout?.expectedReturnDate;
              let durationDays = 1;
              if (rawStartDate) {
                const start = new Date(rawStartDate).getTime();
                const end = rawEndDate ? new Date(rawEndDate).getTime() : start;
                if (!isNaN(start) && !isNaN(end)) {
                  const diff = Math.round((end - start) / 86400000);
                  durationDays = Math.max(1, diff === 0 ? 1 : diff + 1);
                }
              }
              const isSameDate = deploymentDate === returnDate || !returnDate || returnDate === 'TBD';
              const jobNo = projectMeta?.jobNo || firstCheckout?.jobNo;

              return (
                <div
                  key={projName}
                  id={`deployment-${projName.replace(/\s+/g, '-').toLowerCase()}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverProject !== projName) {
                      setDragOverProject(projName);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    if (dragOverProject === projName) {
                      setDragOverProject(null);
                    }
                  }}
                  onDrop={(e) => handleDropOnProject(e, projName)}
                  className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                    isDragTarget
                      ? 'border-2 border-dashed border-amber-500 bg-amber-50/20 ring-4 ring-amber-500/10'
                      : theme.containerBorder
                  }`}
                >
                  {/* Project Card Header (Clickable anywhere to Expand/Collapse) */}
                  <div
                    onClick={() => toggleProjectExpand(projName)}
                    className={`p-5 ${theme.headerBg} flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none transition-colors hover:brightness-[0.98]`}
                    title={isExpanded ? 'Click to collapse deployment' : 'Click to expand deployment'}
                  >
                    {/* Left Zone: Deployment Title & Job No, Dates, Client beneath */}
                    <div className="flex-1 min-w-0 pr-2">
                      {/* Title Row */}
                      <div className="flex items-center gap-2.5">
                        {/* Interactive Deployment Coloured Dot */}
                        <div className="relative inline-flex items-center shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (activeColorPicker === projName) {
                                setActiveColorPicker(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const popoverWidth = 288;
                                const left = Math.max(16, Math.min(rect.left, window.innerWidth - popoverWidth - 16));
                                const top = rect.bottom + 6;
                                setColorPickerPos({ top, left });
                                setActiveColorPicker(projName);
                              }
                            }}
                            className="deployment-color-dot-btn group p-1 -m-1 rounded-full hover:bg-black/10 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                            title="Click to assign colour code to this deployment"
                            aria-label="Assign deployment colour"
                          >
                            <span
                              className={`block w-3.5 h-3.5 rounded-full ${theme.dot} shadow-xs ring-2 ring-white group-hover:scale-125 transition-transform`}
                            />
                          </button>
                        </div>

                        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                          {projName}
                        </h2>
                      </div>

                      {/* Beneath Title: Job No, Dates, Client */}
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {/* Job No. */}
                        {jobNo && (
                          <span
                            className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300/80 text-xs font-mono font-bold tracking-tight shadow-2xs inline-flex items-center gap-1 shrink-0"
                            title={`Job Number: ${jobNo}`}
                          >
                            <span className="text-[9px] uppercase font-sans font-bold text-amber-700/80 tracking-wider">JOB</span>
                            <span>{jobNo}</span>
                          </span>
                        )}

                        {/* Deployment Date */}
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white border border-slate-200/90 text-xs font-semibold text-slate-800 shadow-2xs shrink-0"
                          title={
                            isSameDate
                              ? `Deployment Date: ${deploymentDate}`
                              : `Deployment Date: ${deploymentDate} | Expected Return: ${returnDate}`
                          }
                        >
                          <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{deploymentDate}</span>
                          {!isSameDate && (
                            <>
                              <span className="text-slate-400 font-normal">→</span>
                              <span className="text-slate-700">{returnDate}</span>
                            </>
                          )}
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded-md">
                            {durationDays === 1 ? '1d' : `${durationDays}d`}
                          </span>
                        </span>

                        {/* Client */}
                        {projectMeta?.client && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/90 border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs shrink-0"
                            title={`Client: ${projectMeta.client}`}
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800">{projectMeta.client}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Zone: Address, Project Lead, Assets Deployed on the same line */}
                    <div className="flex items-center gap-2.5 text-xs text-slate-600 md:border-l md:border-slate-200/70 md:pl-4 xl:pl-5 shrink-0 min-w-0 flex-wrap">
                      {/* Location / Address */}
                      <div className="inline-flex items-center gap-1.5 max-w-[200px] lg:max-w-[240px] xl:max-w-[300px]">
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        {shootLoc ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shootLoc)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-amber-600 transition-colors group cursor-pointer truncate font-medium text-slate-700"
                            title="Click to view address on Google Maps"
                          >
                            <span className="group-hover:underline">{shootLoc}</span>
                            <ExternalLink className="w-3 h-3 inline-block ml-1 text-slate-400 group-hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No location set</span>
                        )}
                      </div>

                      <span className="text-slate-300 select-none">•</span>

                      {/* Project Lead */}
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <User className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="text-slate-400">Lead:</span>
                        <strong className="text-slate-700 font-semibold">{leadDP}</strong>
                      </span>

                      <span className="text-slate-300 select-none">•</span>

                      {/* Assets Deployed */}
                      <span className="inline-flex items-center gap-1 font-medium text-slate-600 shrink-0">
                        <Box className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <strong className="text-slate-700 font-semibold">{items.length}</strong>
                        <span>{items.length === 1 ? 'asset' : 'assets'}</span>
                      </span>

                      {/* Pack Verified */}
                      {isFullyVerified && (
                        <>
                          <span className="text-slate-300 select-none">•</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Verified</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Right Zone: Action Buttons styled to match Inventory page */}
                    <div className="flex items-center gap-1.5 shrink-0 self-start md:self-center">
                      {/* Edit Button - Matching Inventory's 32x32px square */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditDeployment(projName);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-600 hover:text-amber-700 transition-colors cursor-pointer shadow-2xs shrink-0"
                        title="Edit deployment details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {items.length > 0 && (
                        <>
                          {/* Verify All Button - Standardized 32px height */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAllVerified(items);
                            }}
                            className={`h-8 flex items-center justify-center gap-1.5 px-3 rounded-xl border text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0 ${
                              isFullyVerified
                                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                            title="Mark all items verified for strike"
                          >
                            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verify ({verifiedCount}/{items.length})</span>
                          </button>

                          {/* Return Kit Button - Matching Inventory's Check In 32px style */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                confirm(
                                  `Check in all ${items.length} items from "${projName}" back to the cage?`
                                )
                              ) {
                                if (onBatchCheckin) {
                                  onBatchCheckin(items.map((i) => i.id));
                                }
                              }
                            }}
                            className="h-8 flex items-center justify-center gap-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
                            title={`Check in all ${items.length} items from shoot back to cage`}
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Return Kit</span>
                          </button>
                        </>
                      )}

                      {/* Chevron Expand/Collapse - Standardized 32x32px square */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProjectExpand(projName);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer shadow-2xs hover:bg-slate-50 transition-colors shrink-0"
                        title={isExpanded ? 'Collapse deployment' : 'Expand deployment'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

              {/* Drag Target Banner Indicator */}
              {isDragTarget && (
                <div className="p-3 bg-amber-100/90 text-amber-900 border-b border-amber-300 text-center text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
                  <ArrowLeftRight className="w-4 h-4 text-amber-700" />
                  <span>Release to transfer equipment into "{projName}"</span>
                </div>
              )}

              {/* Items List */}
              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {items.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50/50">
                      <p className="text-xs text-slate-500">
                        No equipment currently assigned to this deployment.
                      </p>
                      <p className="text-[11px] text-amber-700 font-semibold mt-1">
                        Use the row below to type-search and allocate gear, or drag from Available Equipment!
                      </p>
                    </div>
                  ) : (
                    items.map((item) => {
                      const isChecked = !!packChecklist[item.id];
                      const isDragging = draggedItemId === item.id;
                      const isHoveredSwap = hoveredSwapItemId === item.id;

                      return (
                        <div
                          key={item.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', item.id);
                            setDraggedItemId(item.id);
                            setDragSourceProject(projName);
                          }}
                          onDragEnd={() => {
                            setDraggedItemId(null);
                            setDragSourceProject(null);
                            setDragOverProject(null);
                            setHoveredSwapItemId(null);
                          }}
                          onDragOver={(e) => {
                            if (draggedItemId && draggedItemId !== item.id) {
                              e.preventDefault();
                              e.stopPropagation();
                              if (hoveredSwapItemId !== item.id) {
                                setHoveredSwapItemId(item.id);
                              }
                            }
                          }}
                          onDragLeave={() => {
                            if (hoveredSwapItemId === item.id) {
                              setHoveredSwapItemId(null);
                            }
                          }}
                          onDrop={(e) => handleDropOnGearItem(e, item)}
                          onContextMenu={(e) => handleEquipmentContextMenu(e, item, projName)}
                          className={`p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isHoveredSwap
                              ? 'bg-amber-100/80 border-2 border-amber-500 shadow-md ring-2 ring-amber-400/50'
                              : isDragging
                              ? 'opacity-30 bg-amber-50 border border-dashed border-amber-400'
                              : isChecked
                              ? 'bg-amber-50/20 hover:bg-amber-50/40'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          {/* Checkbox, Drag Handle & Item info */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Grip Drag Handle */}
                            <div
                              className="mt-0.5 p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing transition-colors shrink-0"
                              title="Drag to swap or transfer between shoot deployments"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <button
                              onClick={() => toggleChecklistItem(item.id)}
                              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                                isChecked
                                  ? 'bg-amber-500 border-amber-500 text-white'
                                  : 'border-slate-300 hover:border-amber-500 bg-white'
                              }`}
                              title="Pack verification check"
                            >
                              {isChecked && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[3]" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                {/* Standardised Asset Tag Column (matching Inventory page tag size & uniform column alignment) */}
                                <div className="w-[125px] sm:w-[130px] shrink-0 flex items-center">
                                  <button
                                    type="button"
                                    onClick={() => onSelectGear(item)}
                                    className="font-mono font-bold text-xs text-amber-900 hover:text-amber-950 px-2.5 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer whitespace-nowrap inline-flex items-center shadow-2xs transition-colors"
                                    title="Click to view equipment details"
                                  >
                                    {item.assetTag}
                                  </button>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => onSelectGear(item)}
                                    className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors text-left cursor-pointer hover:underline truncate"
                                    title="Click to open equipment details"
                                  >
                                    {item.name}
                                  </button>
                                  {item.kitName && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium shrink-0">
                                      {item.kitName}
                                    </span>
                                  )}

                                  {isHoveredSwap && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold flex items-center gap-1 shadow-2xs shrink-0">
                                      <ArrowLeftRight className="w-3 h-3" /> Drop to Swap
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 mt-1.5 font-medium">
                                <span>
                                  SN:{' '}
                                  <strong className="text-slate-800 font-mono">
                                    {item.serialNumber}
                                  </strong>
                                </span>
                                <span className="text-slate-300">•</span>
                                <span>Category: {item.category}</span>
                                <span className="text-slate-300">•</span>
                                <span>
                                  Condition: <strong className="text-slate-800">{item.condition}</strong>
                                </span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-600">Location: {item.location}</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions & Quick Transfer Menu */}
                          <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                            {/* Reassign / Move Select Dropdown for non-drag users */}
                            <div className="relative inline-flex items-center">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleTransferGearToProject(item, e.target.value);
                                  }
                                }}
                                className="h-8 text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl pl-2.5 pr-6 py-1 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs appearance-none transition-colors"
                                title="Quick swap/transfer to another deployment"
                              >
                                <option value="" disabled>
                                  Move to shoot...
                                </option>
                                {projectNames
                                  .filter((pn) => pn !== projName)
                                  .map((pn) => (
                                    <option key={pn} value={pn}>
                                      {pn}
                                    </option>
                                  ))}
                              </select>
                              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
                            </div>

                            {/* QR Tag Button - Standardized square 32x32px like Inventory */}
                            <button
                              onClick={() =>
                                onOpenQrModal ? onOpenQrModal(item) : onSelectGear(item)
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-amber-600 transition-colors cursor-pointer shadow-2xs shrink-0"
                              title="View & Print Smart QR Tag"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Report Issue Button - Standardized 32px height */}
                            <button
                              onClick={() =>
                                onReportIssue ? onReportIssue(item) : onSelectGear(item)
                              }
                              className="h-8 flex items-center justify-center gap-1 px-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
                              title="Flag field damage or maintenance issue"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span className="hidden sm:inline">Report Issue</span>
                            </button>

                            {/* Check In Button - Standardized 96x32px like Inventory */}
                            <button
                              onClick={() => {
                                if (onCheckinGear) {
                                  onCheckinGear(
                                    item.id,
                                    item.condition,
                                    'Returned individually from field shoot'
                                  );
                                } else {
                                  onSelectGear(item);
                                }
                              }}
                              className="w-24 h-8 flex items-center justify-center gap-1 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
                              title="Check in gear back to cage"
                            >
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Check In</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Empty line under the last item of each deployment */}
                  <InlineAddGearRow
                    projectName={projName}
                    theme={theme}
                    availableGear={availableGear}
                    onAddGear={handleTransferGearToProject}
                  />
                </div>
              )}
            </div>
          );
        })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* EXTERNAL EQUIPMENT LOANS SEGMENT */}
          {/* ========================================================================= */}
          {(activeSegment === 'all' || activeSegment === 'loans') && (
            <div
              className={`space-y-6 ${
                activeSegment === 'all' ? 'pt-8 border-t border-slate-200' : ''
              }`}
            >
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
                    <Handshake className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                        External Equipment Loans
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold font-mono">
                        {visibleLoanGroups.length}{' '}
                        {visibleLoanGroups.length === 1 ? 'Loan' : 'Loans'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Equipment loaned out to partner studios, external productions, or crew members.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddLoanOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:shadow-sm"
                    title="Loan out available equipment"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>New Loan</span>
                  </button>
                </div>
              </div>

              {/* Empty State for Loans */}
              {visibleLoanGroups.length === 0 && (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
                    <Handshake className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No Active Equipment Loans</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    There are no active equipment loans matching your filter. Click "+ New Loan" to loan gear to an external partner or borrower.
                  </p>
                </div>
              )}

              {/* Loan Cards List */}
              {visibleLoanGroups.map((grp) => {
                const isExpanded = expandedLoans[grp.id] !== false; // Default open
                const loan = grp.loan;
                const isOverdue = loan.expectedReturnDate
                  ? new Date(loan.expectedReturnDate) < new Date()
                  : false;

                const durationDays = Math.max(
                  1,
                  Math.round(
                    (new Date(loan.expectedReturnDate).getTime() -
                      new Date(loan.loanDate).getTime()) /
                      86400000
                  ) + 1
                );

                return (
                  <div
                    key={grp.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-purple-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Loan Card Header (3-zone layout) */}
                    <div className="p-4 sm:p-5 bg-purple-50/70 border-b border-purple-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                      {/* Left Zone: Borrower Name & Dates */}
                      <div className="min-w-0 max-w-xl xl:max-w-md shrink-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                            <Handshake className="w-4 h-4" />
                          </div>
                          <h3 className="text-base font-bold text-slate-900 tracking-tight truncate">
                            {loan.borrowerName}
                          </h3>
                          {loan.borrowerCompany && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-xs font-semibold border border-purple-200 flex items-center gap-1 shrink-0">
                              <Building2 className="w-3 h-3 text-purple-600" />
                              <span>{loan.borrowerCompany}</span>
                            </span>
                          )}
                          <span className="px-1.5 py-0.2 rounded bg-purple-200 text-purple-900 text-[10px] font-mono font-bold shrink-0">
                            LOAN
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span>{formatDateDDMMYYYY(loan.loanDate)}</span>
                            <span className="text-slate-300">→</span>
                            <span
                              className={
                                isOverdue ? 'text-red-600 font-bold' : 'text-slate-700 font-medium'
                              }
                            >
                              {formatDateDDMMYYYY(loan.expectedReturnDate)}
                            </span>
                          </div>
                          <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                            {durationDays}d
                          </span>
                          {isOverdue && (
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200 font-bold text-[10px] animate-pulse">
                              OVERDUE
                            </span>
                          )}
                          {loan.borrowerContact && (
                            <span className="text-slate-400 text-[11px] truncate flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{loan.borrowerContact}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Zone: Purpose & Assets count */}
                      <div className="flex-1 min-w-0 flex items-center gap-4 text-xs text-slate-600">
                        {loan.purpose && (
                          <div className="min-w-0">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Purpose</div>
                            <div className="truncate font-medium text-slate-800">{loan.purpose}</div>
                          </div>
                        )}
                        {loan.notes && (
                          <div className="min-w-0 hidden md:block">
                            <div className="text-[10px] uppercase font-bold text-slate-400">Notes</div>
                            <div className="truncate text-slate-500 text-[11px]">{loan.notes}</div>
                          </div>
                        )}
                        <div className="shrink-0">
                          <div className="text-[10px] uppercase font-bold text-slate-400">On Loan</div>
                          <div className="flex items-center gap-1 font-bold text-purple-700">
                            <Box className="w-3.5 h-3.5" />
                            <span>
                              {grp.items.length} {grp.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Zone: Action Buttons (Standardized 32px height) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditLoan(grp)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                          title="Edit loan details or dates"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReturnAllLoanGear(grp)}
                          className="h-8 flex items-center justify-center gap-1 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                          title="Check in all gear on this loan back to cage"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Check In All</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedLoans((prev) => ({
                              ...prev,
                              [grp.id]: !isExpanded,
                            }))
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                          title={isExpanded ? 'Collapse equipment list' : 'Expand equipment list'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Loan Card Body (Expanded Equipment List) */}
                    {isExpanded && (
                      <div className="p-4 sm:p-5 divide-y divide-slate-100 bg-white">
                        {grp.items.map((item) => (
                          <div
                            key={item.id}
                            className="py-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="font-mono text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md text-xs font-bold shrink-0">
                                {item.assetTag}
                              </span>
                              <span className="font-bold text-slate-900 truncate">{item.name}</span>
                              <span className="text-slate-400 font-mono text-[11px] truncate hidden sm:inline">
                                SN: {item.serialNumber || '—'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200 shrink-0">
                                {item.condition}
                              </span>
                            </div>

                            {/* Individual Item Check In button */}
                            <button
                              type="button"
                              onClick={() =>
                                onCheckinGear
                                  ? onCheckinGear(
                                      item.id,
                                      item.condition,
                                      'Returned from external loan'
                                    )
                                  : undefined
                              }
                              className="w-24 h-8 flex items-center justify-center gap-1 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
                              title="Check in this item back to cage"
                            >
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Check In</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD A NEW DEPLOYMENT (WITH DATE OF DEPLOYMENT & GEAR SELECTION) */}
      {/* ========================================================================= */}
      {isAddDeploymentOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8"
          >
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Add New Deployment</h2>
                  <p className="text-xs text-slate-500">
                    Schedule a shoot unit, assign crew, set deployment date, and allocate gear
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddDeploymentOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleCreateDeployment}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Deployment / Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={newProjName}
                    onChange={(e) => setNewProjName(e.target.value)}
                    placeholder="e.g. Commercial Day 3 - Mojave Exterior"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Job No.
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={newProjJobNo}
                    onChange={(e) => setNewProjJobNo(e.target.value)}
                    placeholder="e.g. JN-2026-042"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono font-semibold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Date of Deployment (Crucial User Requirement) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Date of Deployment *</span>
                  </label>
                  <input
                    type="date"
                    required
                    autoComplete="off"
                    value={newProjDeploymentDate}
                    onChange={(e) => setNewProjDeploymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Date equipment rolls out on location</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expected Wrap / Return Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    autoComplete="off"
                    value={newProjReturnDate}
                    onChange={(e) => setNewProjReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Estimated wrap return to cage</p>
                </div>
              </div>

              {/* Location & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>Shoot Location / Address</span>
                    </label>
                    {newProjLocation.trim() && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newProjLocation)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 hover:underline"
                        title="Preview location on Google Maps"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <AddressAutocompleteInput
                    value={newProjLocation}
                    onChange={setNewProjLocation}
                    placeholder="e.g. 1438 N Gower St, Hollywood, CA"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter street address, studio stage, or landmark for Google Maps suggestions
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Client / Production Company
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={newProjClient}
                    onChange={(e) => setNewProjClient(e.target.value)}
                    placeholder="e.g. Apex Automotive Studios"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Lead DP & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Lead DP / Crew Assignee</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={newProjLeadDP}
                    onChange={(e) => setNewProjLeadDP(e.target.value)}
                    placeholder="e.g. Devon Brooks"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={newProjEmail}
                    onChange={(e) => setNewProjEmail(e.target.value)}
                    placeholder="devon.dp@production.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Deployment Notes / Call Sheet Instructions
                </label>
                <textarea
                  rows={2}
                  value={newProjNotes}
                  onChange={(e) => setNewProjNotes(e.target.value)}
                  placeholder="Special instructions, weather seals required, high-speed recording config..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Optional Equipment Selection */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>Allocate Equipment from Cage ({availableGear.length} Available)</span>
                  </label>
                  <span className="text-xs text-amber-700 font-bold">
                    {selectedInitialGearIds.length} items selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  You can select equipment now or use the drag-and-drop feature after creating this
                  deployment.
                </p>

                <div className="border border-slate-200 rounded-xl p-2 max-h-44 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                  {availableGear.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No available gear in cage.
                    </div>
                  ) : (
                    availableGear.map((item) => {
                      const isSelected = selectedInitialGearIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedInitialGearIds((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id]
                            );
                          }}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer text-xs transition-colors ${
                            isSelected ? 'bg-amber-100/70 text-slate-900 font-semibold' : 'hover:bg-slate-100/80 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-500 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                            <span className="font-mono text-amber-800 font-bold">
                              {item.assetTag}
                            </span>
                            <span className="truncate">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                            {item.category}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddDeploymentOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                  <span>Create Deployment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT DEPLOYMENT DETAILS */}
      {/* ========================================================================= */}
      {editingDeploymentName && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8"
          >
            {/* Modal Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Edit Deployment Details</h2>
                  <p className="text-xs text-slate-500">
                    Update shoot schedule, location, crew, and instructions for {editingDeploymentName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDeploymentName(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSaveEditDeployment}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Deployment / Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={editProjName}
                    onChange={(e) => setEditProjName(e.target.value)}
                    placeholder="e.g. Commercial Day 3 - Mojave Exterior"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Job No.
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={editProjJobNo}
                    onChange={(e) => setEditProjJobNo(e.target.value)}
                    placeholder="e.g. JN-2026-042"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono font-semibold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Date of Deployment & Expected Return Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Date of Deployment *</span>
                  </label>
                  <input
                    type="date"
                    required
                    autoComplete="off"
                    value={editProjDeploymentDate}
                    onChange={(e) => setEditProjDeploymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Date equipment rolls out on location</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expected Wrap / Return Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    autoComplete="off"
                    value={editProjReturnDate}
                    onChange={(e) => setEditProjReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Estimated wrap return to cage</p>
                </div>
              </div>

              {/* Location & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      <span>Shoot Location / Address</span>
                    </label>
                    {editProjLocation.trim() && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(editProjLocation)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 hover:underline"
                        title="Preview location on Google Maps"
                      >
                        <span>Google Maps</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <AddressAutocompleteInput
                    value={editProjLocation}
                    onChange={setEditProjLocation}
                    placeholder="e.g. 1438 N Gower St, Hollywood, CA"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter street address, studio stage, or landmark for Google Maps suggestions
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Client / Production Company
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={editProjClient}
                    onChange={(e) => setEditProjClient(e.target.value)}
                    placeholder="e.g. Apex Automotive Studios"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Lead DP & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>Lead DP / Crew Assignee</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={editProjLeadDP}
                    onChange={(e) => setEditProjLeadDP(e.target.value)}
                    placeholder="e.g. Devon Brooks"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={editProjEmail}
                    onChange={(e) => setEditProjEmail(e.target.value)}
                    placeholder="devon.dp@production.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Deployment Notes / Call Sheet Instructions
                </label>
                <textarea
                  rows={3}
                  value={editProjNotes}
                  onChange={(e) => setEditProjNotes(e.target.value)}
                  placeholder="Special instructions, weather seals required, high-speed recording config..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
                {/* Delete Button (Far left, positioned away from Cancel and Save Changes) */}
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs"
                  title="Delete this deployment"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Deployment</span>
                </button>

                {/* Right: Cancel & Save Changes */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setEditingDeploymentName(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Delete Confirmation Dialog Overlay */}
          {showDeleteConfirm && (
            <div
              className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-0 duration-150"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowDeleteConfirm(false);
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900">
                      Delete Deployment?
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Are you sure you want to delete <strong className="text-slate-900">"{editingDeploymentName}"</strong>?
                    </p>
                    {editingDeploymentName && (gearByProject[editingDeploymentName]?.length || 0) > 0 && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-normal flex items-start gap-2">
                        <PackageCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span>
                          <strong>{gearByProject[editingDeploymentName].length} {gearByProject[editingDeploymentName].length === 1 ? 'item' : 'items'}</strong> currently assigned to this shoot will be checked back in to the cage as available.
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 mt-2">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteDeployment}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                    <span>Confirm Delete</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD A NEW LOAN (WITH EQUIPMENT ALLOCATION) */}
      {/* ========================================================================= */}
      {isAddLoanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in-0 zoom-in-95"
          >
            {/* Modal Header */}
            <div className="p-6 bg-purple-50/80 border-b border-purple-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Handshake className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Register External Loan</h2>
                  <p className="text-xs text-slate-500">
                    Loan equipment to external partner studios, productions, or crew members
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddLoanOpen(false)}
                className="p-1.5 rounded-xl hover:bg-purple-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleCreateLoan}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              {/* Borrower & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Borrower Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={newLoanBorrowerName}
                    onChange={(e) => setNewLoanBorrowerName(e.target.value)}
                    placeholder="e.g. Marcus Tan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Company / Production House
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={newLoanBorrowerCompany}
                    onChange={(e) => setNewLoanBorrowerCompany(e.target.value)}
                    placeholder="e.g. Moonlight Productions"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Contact & Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Contact (Phone / Email)
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={newLoanBorrowerContact}
                    onChange={(e) => setNewLoanBorrowerContact(e.target.value)}
                    placeholder="e.g. +65 9123 4567 / marcus@prod.sg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Purpose of Loan
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={newLoanPurpose}
                    onChange={(e) => setNewLoanPurpose(e.target.value)}
                    placeholder="e.g. Commercial video shoot"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Loan Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Loan Start Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    autoComplete="off"
                    value={newLoanStartDate}
                    onChange={(e) => setNewLoanStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-purple-500 transition-colors cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Expected Return Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    autoComplete="off"
                    value={newLoanReturnDate}
                    onChange={(e) => setNewLoanReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-purple-500 transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Additional Notes / Handling Instructions
                </label>
                <textarea
                  rows={2}
                  value={newLoanNotes}
                  onChange={(e) => setNewLoanNotes(e.target.value)}
                  placeholder="e.g. Premium lens set - return cleaned and capped..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Equipment Selection from Cage */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>Select Equipment from Cage ({availableGear.length} Available) *</span>
                  </label>
                  <span className="text-xs text-purple-700 font-bold">
                    {selectedLoanGearIds.length} items selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Click on available items to attach them to this loan record.
                </p>

                <div className="border border-slate-200 rounded-xl p-2 max-h-48 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                  {availableGear.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No available gear in cage to loan out.
                    </div>
                  ) : (
                    availableGear.map((item) => {
                      const isSelected = selectedLoanGearIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedLoanGearIds((prev) =>
                              prev.includes(item.id)
                                ? prev.filter((id) => id !== item.id)
                                : [...prev, item.id]
                            );
                          }}
                          className={`p-2 rounded-lg flex items-center justify-between cursor-pointer text-xs transition-colors ${
                            isSelected
                              ? 'bg-purple-100 text-purple-950 font-semibold'
                              : 'hover:bg-slate-100/80 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate min-w-0">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                isSelected
                                  ? 'bg-purple-600 border-purple-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                            <span className="font-mono text-purple-800 font-bold">
                              {item.assetTag}
                            </span>
                            <span className="truncate">{item.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                            {item.category}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddLoanOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedLoanGearIds.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-sm flex items-center gap-1.5"
                >
                  <Handshake className="w-4 h-4 text-white" />
                  <span>Confirm Loan ({selectedLoanGearIds.length})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT LOAN DETAILS */}
      {/* ========================================================================= */}
      {editingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8 animate-in fade-in-0 zoom-in-95"
          >
            {/* Modal Header */}
            <div className="p-6 bg-purple-50/80 border-b border-purple-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Edit Loan: {editingLoan.loan.borrowerName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update borrower information, duration dates, and notes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLoan(null)}
                className="p-1.5 rounded-xl hover:bg-purple-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSaveEditLoan}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              className="p-6 space-y-4 max-h-[75vh] overflow-y-auto"
            >
              {/* Borrower & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Borrower Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={editLoanBorrowerName}
                    onChange={(e) => setEditLoanBorrowerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Company / Production House
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={editLoanBorrowerCompany}
                    onChange={(e) => setEditLoanBorrowerCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Contact & Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Contact (Phone / Email)
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={editLoanBorrowerContact}
                    onChange={(e) => setEditLoanBorrowerContact(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Purpose of Loan
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={editLoanPurpose}
                    onChange={(e) => setEditLoanPurpose(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Loan Start Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    autoComplete="off"
                    value={editLoanStartDate}
                    onChange={(e) => setEditLoanStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-purple-500 transition-colors cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Expected Return Date *</span>
                  </label>
                  <input
                    type="date"
                    required
                    autoComplete="off"
                    value={editLoanReturnDate}
                    onChange={(e) => setEditLoanReturnDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-purple-500 transition-colors cursor-pointer"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Additional Notes / Handling Instructions
                </label>
                <textarea
                  rows={2}
                  value={editLoanNotes}
                  onChange={(e) => setEditLoanNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Equipment on this loan list */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-purple-600" />
                    <span>Assigned Equipment ({editingLoan.items.length})</span>
                  </label>
                </div>
                <div className="border border-slate-200 rounded-xl p-2 max-h-40 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                  {editingLoan.items.map((item) => (
                    <div key={item.id} className="p-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-purple-800 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {item.assetTag}
                        </span>
                        <span className="font-semibold text-slate-800 truncate">{item.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        SN: {item.serialNumber || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowDeleteLoanConfirm(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Check in all equipment on this loan"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600" />
                  <span>Return All Equipment</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingLoan(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Delete / Return Loan Confirmation Dialog */}
          {showDeleteLoanConfirm && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900">
                      Check In All Equipment?
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      All <strong className="text-slate-900">{editingLoan.items.length} items</strong> on loan to <strong className="text-slate-900">"{editingLoan.loan.borrowerName}"</strong> will be checked back in to the cage as Available.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowDeleteLoanConfirm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReturnAllLoanGear(editingLoan)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    <span>Confirm Check In</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deployment Color Palette Picker Portal (renders directly to document.body to avoid accordion/overflow clipping) */}
      {activeColorPicker && typeof document !== 'undefined' && createPortal(
        (() => {
          const projName = activeColorPicker;
          const projectMeta = allDeploymentProjects.find((p) => p.name === projName);
          const customColor = deploymentColors[projName] || projectMeta?.projectObj?.color;
          const projectIndex = projectNames.indexOf(projName);
          const currentTheme = getDeploymentTheme(projName, projectIndex >= 0 ? projectIndex : 0, customColor);

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                top: `${colorPickerPos.top}px`,
                left: `${colorPickerPos.left}px`,
              }}
              className="deployment-color-picker-popover fixed z-[9999] w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 animate-in fade-in-0 zoom-in-95 text-left select-none"
            >
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>Deployment Colour Code</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveColorPicker(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mb-2.5 font-normal">
                Select a colour theme for <strong className="text-slate-800">{projName}</strong>:
              </p>

              <div className="grid grid-cols-4 gap-2">
                {DEPLOYMENT_THEMES.map((th) => {
                  const isSelected = currentTheme.id === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDeploymentColor(projName, th.id);
                        setActiveColorPicker(null);
                      }}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-slate-800 bg-slate-100/80 ring-2 ring-slate-900/10 shadow-xs'
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                      title={th.name}
                    >
                      <span
                        className={`w-6 h-6 rounded-full ${th.dot} shadow-xs flex items-center justify-center text-white ring-2 ring-white`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-700 truncate max-w-full">
                        {th.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {customColor && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Custom theme active</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetDeploymentColor(projName);
                      setActiveColorPicker(null);
                    }}
                    className="text-[10px] text-amber-600 hover:text-amber-800 font-semibold hover:underline cursor-pointer"
                  >
                    Reset to default
                  </button>
                </div>
              )}
            </div>
          );
        })(),
        document.body
      )}

      {/* Equipment Right-Click Context Menu Portal */}
      {equipmentContextMenu && equipmentContextMenu.isOpen && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            top: `${equipmentContextMenu.y}px`,
            left: `${equipmentContextMenu.x}px`,
          }}
          className="equipment-context-menu fixed z-[99999] min-w-[120px] bg-white rounded-xl shadow-xl border border-slate-200 p-1 text-xs animate-in fade-in-0 zoom-in-95 select-none"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteGearFromDeployment(
                equipmentContextMenu.item,
                equipmentContextMenu.projectName
              );
              setEquipmentContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold transition-colors text-left cursor-pointer group"
          >
            <Trash2 className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            <span>Delete</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};
