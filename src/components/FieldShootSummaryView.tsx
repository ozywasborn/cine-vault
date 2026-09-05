import React, { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import { GearItem, ShootProject, UserAccount, ConditionRating } from '../types';

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

export const getDeploymentTheme = (
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
  onProjectsChange?: (projects: ShootProject[]) => void;
}

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

  // Modal State for Adding a New Deployment
  const [isAddDeploymentOpen, setIsAddDeploymentOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
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

  // Modal State for Editing an Existing Deployment
  const [editingDeploymentName, setEditingDeploymentName] = useState<string | null>(null);
  const [editProjName, setEditProjName] = useState('');
  const [editProjDeploymentDate, setEditProjDeploymentDate] = useState('');
  const [editProjReturnDate, setEditProjReturnDate] = useState('');
  const [editProjLocation, setEditProjLocation] = useState<string>('');
  const [editProjLeadDP, setEditProjLeadDP] = useState('');
  const [editProjEmail, setEditProjEmail] = useState('');
  const [editProjClient, setEditProjClient] = useState('');
  const [editProjNotes, setEditProjNotes] = useState('');

  // Close modals on Escape key
  useEffect(() => {
    if (!editingDeploymentName && !isAddDeploymentOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingDeploymentName) setEditingDeploymentName(null);
        if (isAddDeploymentOpen) setIsAddDeploymentOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingDeploymentName, isAddDeploymentOpen]);

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

  // Filter checked out gear
  const checkedOutGear = useMemo(() => gear.filter((g) => g.status === 'Checked Out'), [gear]);
  const availableGear = useMemo(() => gear.filter((g) => g.status === 'Available'), [gear]);

  // Compile all known deployment projects (from projects prop + any active checkouts)
  const allDeploymentProjects = useMemo(() => {
    const list: {
      name: string;
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
        projectObj: p,
        location: p.location,
        leadDP: p.leadDP,
        deploymentDate: p.startDate,
        expectedReturnDate: p.endDate,
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
          location: item.currentCheckout?.shootLocation,
          leadDP: item.currentCheckout?.userName,
          deploymentDate: item.currentCheckout?.checkoutDate?.split('T')[0],
          expectedReturnDate: item.currentCheckout?.expectedReturnDate?.split('T')[0],
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

  // Compute Gantt Timeline Data
  const ganttData = useMemo(() => {
    const activeProjects = allDeploymentProjects.filter(
      (p) => selectedProjectId === 'all' || p.name === selectedProjectId
    );

    if (activeProjects.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parsed = activeProjects.map((p, idx) => {
      const assignedItems = gearByProject[p.name] || [];
      const firstCheckout = assignedItems[0]?.currentCheckout;
      const startStr =
        p.deploymentDate ||
        firstCheckout?.checkoutDate?.split('T')[0] ||
        new Date().toISOString().split('T')[0];
      const endStr =
        p.expectedReturnDate ||
        firstCheckout?.expectedReturnDate?.split('T')[0] ||
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
        name: p.name,
        client: p.client,
        leadDP: p.leadDP || firstCheckout?.userName || 'Lead DP',
        location: p.location || firstCheckout?.shootLocation || 'On Location',
        startStr,
        endStr,
        startDate: safeStartDate,
        endDate: safeEndDate,
        itemCount: assignedItems.length,
        theme,
      };
    });

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

      days.push({
        date: new Date(curr),
        dateStr: curr.toISOString().split('T')[0],
        dayOfWeek,
        dayNum,
        monthName,
        isToday,
        isWeekend,
      });

      curr.setDate(curr.getDate() + 1);
    }

    const totalDays = Math.max(1, days.length);
    const timelineStartTime = timelineStart.getTime();
    const dayMs = 86400000;

    // Detect Overlaps
    const overlaps: { projA: string; projB: string; range: string }[] = [];
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
            range: `${overlapStart.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })} – ${overlapEnd.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}`,
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
      const widthPercent = Math.max(2.5, rightPercent - leftPercent);

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
  }, [allDeploymentProjects, gearByProject, selectedProjectId, deploymentColors]);

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
        const updated = projects.map((p) => (p.name === projName ? { ...p, color: colorId } : p));
        onProjectsChange(updated);
      } else {
        const projectMeta = allDeploymentProjects.find((p) => p.name === projName);
        const newProj: ShootProject = {
          id: `proj-${Date.now()}`,
          name: projName,
          client: projectMeta?.client || '',
          leadDP: projectMeta?.leadDP || currentUser?.name || 'Lead DP',
          location: projectMeta?.location || 'Studio',
          startDate: projectMeta?.deploymentDate || new Date().toISOString().split('T')[0],
          endDate: projectMeta?.expectedReturnDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
          assignedGearIds: (gearByProject[projName] || []).map((g) => g.id),
          status: 'On Shoot',
          color: colorId,
        };
        onProjectsChange([newProj, ...projects]);
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
      [projName]: !prev[projName],
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

    const newProject: ShootProject = {
      id: `proj-${Date.now()}`,
      name: trimmedName,
      client: newProjClient.trim() || 'Internal Production',
      leadDP: newProjLeadDP.trim() || currentUser?.name || 'Production Lead',
      location: newProjLocation.trim() || 'Field Location',
      startDate: newProjDeploymentDate,
      endDate: newProjReturnDate,
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
              shootLocation: newProjLocation.trim() || 'Field Location',
              checkoutDate: `${newProjDeploymentDate}T08:00:00Z`,
              expectedReturnDate: `${newProjReturnDate}T18:00:00Z`,
              status: 'Active',
              conditionOnCheckout: item.condition,
              notes: newProjNotes.trim() || `Deployed on ${newProjDeploymentDate}`,
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
    setNewProjLocation('');
    setNewProjClient('');
    setNewProjNotes('');
    setSelectedInitialGearIds([]);
    setIsAddDeploymentOpen(false);
  };

  // Open Edit Deployment Modal
  const handleOpenEditDeployment = (projName: string) => {
    const projectMeta = allDeploymentProjects.find((p) => p.name === projName);
    const assignedItems = gearByProject[projName] || [];
    const firstCheckout = assignedItems[0]?.currentCheckout;

    const initialLocation = projectMeta?.location || firstCheckout?.shootLocation || '';

    setEditingDeploymentName(projName);
    setEditProjName(projName);
    setEditProjDeploymentDate(
      projectMeta?.deploymentDate ||
        firstCheckout?.checkoutDate?.split('T')[0] ||
        new Date().toISOString().split('T')[0]
    );
    setEditProjReturnDate(
      projectMeta?.expectedReturnDate ||
        firstCheckout?.expectedReturnDate?.split('T')[0] ||
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
    const oldName = editingDeploymentName;

    // 1. Update ShootProject[] list if callback available
    if (onProjectsChange) {
      const existingProjIndex = (projects || []).findIndex((p) => p.name === oldName);
      if (existingProjIndex >= 0) {
        const updatedProjects = [...(projects || [])];
        updatedProjects[existingProjIndex] = {
          ...updatedProjects[existingProjIndex],
          name: trimmedNewName,
          client: editProjClient.trim() || 'Internal Production',
          leadDP: editProjLeadDP.trim() || currentUser?.name || 'Production Lead',
          location: editProjLocation.trim() || 'Field Location',
          startDate: editProjDeploymentDate,
          endDate: editProjReturnDate,
        };
        onProjectsChange(updatedProjects);
      } else {
        const newProjObj: ShootProject = {
          id: `proj-${Date.now()}`,
          name: trimmedNewName,
          client: editProjClient.trim() || 'Internal Production',
          leadDP: editProjLeadDP.trim() || currentUser?.name || 'Production Lead',
          location: editProjLocation.trim() || 'Field Location',
          startDate: editProjDeploymentDate,
          endDate: editProjReturnDate,
          assignedGearIds: (gearByProject[oldName] || []).map((g) => g.id),
          status: 'On Shoot',
        };
        onProjectsChange([...(projects || []), newProjObj]);
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
              shootLocation: editProjLocation.trim(),
              userName: editProjLeadDP.trim() || item.currentCheckout.userName,
              userEmail: editProjEmail.trim() || item.currentCheckout.userEmail,
              checkoutDate: editProjDeploymentDate
                ? `${editProjDeploymentDate}T08:00:00Z`
                : item.currentCheckout.checkoutDate,
              expectedReturnDate: editProjReturnDate
                ? `${editProjReturnDate}T18:00:00Z`
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
        notes: `Transferred to ${targetProjName} on ${new Date().toLocaleDateString()}`,
      },
      updatedAt: new Date().toISOString(),
    };

    onUpdateGear(updatedItem);
    showToast(`Transferred ${item.assetTag} (${item.name}) to "${targetProjName}".`);

    // Ensure target project is expanded so user sees the dropped item
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

      {/* Field Mode Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Active Shoot Deployments
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Currently tracking{' '}
              <strong className="text-amber-600 font-semibold">
                {checkedOutGear.length} assets
              </strong>{' '}
              deployed across {projectNames.length} production units.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Add New Deployment Button */}
            <button
              onClick={() => setIsAddDeploymentOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-sm"
              title="Add a new production shoot deployment with date and details"
            >
              <Plus className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Add New Deployment</span>
            </button>

            {/* Toggle Available Equipment Drawer */}
            <button
              onClick={() => setShowStagingDrawer(!showStagingDrawer)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                showStagingDrawer
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
              }`}
              title="View and allocate available equipment into any deployment"
            >
              <Box className="w-4 h-4 text-amber-500" />
              <span>Available Equipment ({availableGear.length})</span>
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400">Deployed</div>
                <div className="text-base font-bold text-slate-900 font-mono">
                  {checkedOutGear.length} Units
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <div className="text-[10px] uppercase font-bold text-slate-400">Verified</div>
                <div className="text-base font-bold text-amber-600 font-mono">
                  {Object.values(packChecklist).filter(Boolean).length} / {checkedOutGear.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search field assets by tag, camera model, kit, or serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 px-3.5 py-2 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer font-medium"
            >
              <option value="all">All Active Shoots ({projectNames.length})</option>
              {projectNames.map((name) => (
                <option key={name} value={name}>
                  {name} ({gearByProject[name]?.length || 0} items)
                </option>
              ))}
            </select>

            {/* View Mode Switcher (Combined / Gantt / Cards) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('combined')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'combined'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="View Gantt schedule and deployment cards together"
              >
                <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Combined</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('gantt')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="View deployment cards and gear checklists"
              >
                <LayoutList className="w-3.5 h-3.5 text-slate-600" />
                <span>Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Equipment (Collapsible Shelf) */}
      {showStagingDrawer && (
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Available Equipment ({availableGear.length})
              </h3>
              <span className="text-xs text-slate-500">
                Drag any unit directly into a deployment card below to dispatch
              </span>
            </div>
            <button
              onClick={() => setShowStagingDrawer(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-1">
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
                    Deployment Schedule & Overlap Timeline
                  </h2>
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {ganttData.bars.length} {ganttData.bars.length === 1 ? 'Shoot' : 'Shoots'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visual timeline showing shoot dates, equipment deployment durations, and concurrent overlaps.
                </p>
              </div>
            </div>

            {/* Overlap Indicator Pill */}
            <div className="flex items-center gap-2">
              {ganttData.overlaps.length > 0 ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {ganttData.overlaps.length} Schedule Overlap{ganttData.overlaps.length > 1 ? 's' : ''} Detected
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>No Date Overlaps</span>
                </div>
              )}
            </div>
          </div>

          {/* Overlap Summary Alert Banner (if any) */}
          {ganttData.overlaps.length > 0 && (
            <div className="px-5 py-2.5 bg-amber-50/60 border-b border-amber-200/80 text-xs text-amber-900 flex flex-wrap items-center gap-2">
              <span className="font-bold text-amber-800 uppercase text-[10px] tracking-wider bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                Concurrent
              </span>
              <span>
                Simultaneous field operations:{' '}
                {ganttData.overlaps.map((o, idx) => (
                  <strong key={idx} className="font-semibold text-amber-950">
                    "{o.projA}" & "{o.projB}" ({o.range})
                    {idx < ganttData.overlaps.length - 1 ? ' • ' : ''}
                  </strong>
                ))}
              </span>
            </div>
          )}

          {/* Scrollable Gantt Canvas */}
          <div className="overflow-x-auto p-5">
            <div className="min-w-[850px] select-none">
              {/* Month / Day Header Grid */}
              <div className="flex border-b border-slate-200 pb-2 mb-3">
                {/* Left Label Column */}
                <div className="w-56 shrink-0 font-bold text-xs uppercase tracking-wider text-slate-400 pl-2">
                  Shoot Deployment
                </div>

                {/* Days Grid Header */}
                <div
                  className="flex-1 grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${ganttData.days.length}, minmax(0, 1fr))`,
                  }}
                >
                  {ganttData.days.map((day) => (
                    <div
                      key={day.dateStr}
                      className={`text-center py-1 rounded transition-colors ${
                        day.isToday
                          ? 'bg-amber-500 text-white font-bold shadow-xs'
                          : day.isWeekend
                          ? 'bg-slate-100/70 text-slate-400'
                          : 'text-slate-600'
                      }`}
                      title={`${day.monthName} ${day.dayNum} (${day.dateStr})`}
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
                    left: `calc(14rem + (100% - 14rem) * ${ganttData.todayPercent / 100})`,
                  }}
                >
                  <div className="w-0.5 h-full bg-amber-500 shadow-sm" />
                </div>

                {ganttData.bars.map((bar) => {
                  return (
                    <div
                      key={bar.name}
                      className="flex items-center group/row rounded-xl hover:bg-slate-50/70 p-1.5 transition-colors"
                    >
                      {/* Left Info Column */}
                      <div className="w-56 shrink-0 pr-3 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${bar.theme.dot}`}
                          />
                          <button
                            type="button"
                            onClick={() => handleOpenEditDeployment(bar.name)}
                            className="font-bold text-xs text-slate-900 hover:text-amber-600 truncate text-left cursor-pointer transition-colors"
                            title={`Click to edit ${bar.name}`}
                          >
                            {bar.name}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5 pl-3.5">
                          <span className="font-semibold text-slate-700">
                            {bar.itemCount} assets
                          </span>{' '}
                          • {bar.leadDP}
                        </div>
                      </div>

                      {/* Right Timeline Lane */}
                      <div className="flex-1 relative h-10 bg-slate-100/60 rounded-xl overflow-hidden border border-slate-200/80 p-1">
                        {/* Day Grid Lines in Background */}
                        <div
                          className="absolute inset-0 grid pointer-events-none"
                          style={{
                            gridTemplateColumns: `repeat(${ganttData.days.length}, minmax(0, 1fr))`,
                          }}
                        >
                          {ganttData.days.map((d, i) => (
                            <div
                              key={i}
                              className={`border-r border-slate-200/40 h-full ${
                                d.isToday ? 'bg-amber-50/50' : d.isWeekend ? 'bg-slate-200/20' : ''
                              }`}
                            />
                          ))}
                        </div>

                        {/* Interactive Gantt Bar */}
                        <div
                          onClick={() => handleOpenEditDeployment(bar.name)}
                          style={{
                            left: `${bar.leftPercent}%`,
                            width: `${bar.widthPercent}%`,
                          }}
                          className={`absolute top-1 bottom-1 rounded-lg ${bar.theme.ganttBar} flex items-center justify-between px-2.5 shadow-xs cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all z-20 overflow-hidden`}
                          title={`${bar.name}\nDates: ${bar.startStr} to ${bar.endStr} (${bar.durationDays} days)\nLocation: ${bar.location}\nLead DP: ${bar.leadDP}\nAssets: ${bar.itemCount} deployed\nClick to edit deployment`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-[11px] font-bold truncate tracking-tight">
                              {bar.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-90 shrink-0 ml-2">
                            <span>{bar.durationDays}d</span>
                            <span>•</span>
                            <span>{bar.itemCount} units</span>
                          </div>
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
                    <div key={bar.name} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${bar.theme.dot}`} />
                      <span className="text-slate-700 font-medium truncate max-w-[130px]">
                        {bar.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Current Day ("Today")</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Click bar to edit details</span>
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
          {/* No gear checked out state */}
          {projectNames.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">All Equipment Is In the Cage</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                There are no active deployments. Click "+ Add New Deployment" above or use the Inventory
                catalog to dispatch equipment.
              </p>
            </div>
          )}

          {projectNames
            .filter((projName) => selectedProjectId === 'all' || selectedProjectId === projName)
            .map((projName, projectIndex) => {
              const projectMeta = allDeploymentProjects.find((p) => p.name === projName);
              const customColor = deploymentColors[projName] || projectMeta?.projectObj?.color;
              const theme = getDeploymentTheme(projName, projectIndex, customColor);
              let items = gearByProject[projName] || [];
              if (searchQuery) {
                const q = searchQuery.toLowerCase();
                items = items.filter(
                  (i) =>
                    String(i.name || '').toLowerCase().includes(q) ||
                    String(i.assetTag || '').toLowerCase().includes(q) ||
                    String(i.serialNumber || '').toLowerCase().includes(q) ||
                    (i.kitName && String(i.kitName).toLowerCase().includes(q))
                );
              }

              const firstCheckout = items[0]?.currentCheckout;
              const isExpanded = expandedProjects[projName] !== false;
              const verifiedCount = items.filter((i) => packChecklist[i.id]).length;
              const isFullyVerified = items.length > 0 && verifiedCount === items.length;

              // Drag target state for this project
              const isDragTarget =
                dragOverProject === projName && dragSourceProject !== projName;

              const deploymentDate =
                projectMeta?.deploymentDate ||
                firstCheckout?.checkoutDate?.split('T')[0] ||
                'Active';
              const returnDate =
                projectMeta?.expectedReturnDate ||
                firstCheckout?.expectedReturnDate?.split('T')[0] ||
                'TBD';
              const shootLoc =
                projectMeta?.location || firstCheckout?.shootLocation || '';
              const leadDP = projectMeta?.leadDP || firstCheckout?.userName || 'Lead DP';

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
                  {/* Project Card Header */}
                  <div className={`p-5 ${theme.headerBg} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Interactive Deployment Coloured Dot */}
                        <div className="relative inline-flex items-center">
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
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                          {projName}
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full ${theme.badgeBg} text-xs font-bold`}>
                          {items.length} {items.length === 1 ? 'asset' : 'assets'} deployed
                        </span>
                        {projectMeta?.client && (
                          <span className="px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700 text-xs font-medium">
                            Client: {projectMeta.client}
                          </span>
                        )}
                    {isFullyVerified && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Pack Verified
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2.5 font-medium">
                    {/* Date of deployment */}
                    <span className="flex items-center gap-1.5 text-slate-800 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      Deployment Date:{' '}
                      <span className="text-amber-700 font-bold">{deploymentDate}</span>
                    </span>

                    <span className="flex items-center gap-1 text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ETA Return: {returnDate}
                    </span>

                    {shootLoc ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shootLoc)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-slate-700 hover:text-amber-600 transition-colors group cursor-pointer"
                        title="Click to view address on Google Maps"
                      >
                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="group-hover:underline">{shootLoc}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </a>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400 italic">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                        No location set
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-slate-700">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      Lead: <strong>{leadDP}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                  {/* Edit button placed to the left of Verify All */}
                  <button
                    onClick={() => handleOpenEditDeployment(projName)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    title="Edit deployment details"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit</span>
                  </button>

                  {items.length > 0 && (
                    <>
                      <button
                        onClick={() => markAllVerified(items)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                        title="Mark all items verified for strike"
                      >
                        <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Verify All ({verifiedCount}/{items.length})
                        </span>
                      </button>

                      <button
                        onClick={() => {
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
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5 text-white" />
                        <span>Return Full Kit</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => toggleProjectExpand(projName)}
                    className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer shadow-2xs"
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
                        Drag and drop equipment cards from other deployments or Available
                        Equipment to allocate gear!
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
                          <div className="flex items-start gap-3">
                            {/* Grip Drag Handle */}
                            <div
                              className="mt-0.5 p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded cursor-grab active:cursor-grabbing transition-colors"
                              title="Drag to swap or transfer between shoot deployments"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <button
                              onClick={() => toggleChecklistItem(item.id)}
                              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
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

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => onSelectGear(item)}
                                  className="font-mono text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 cursor-pointer transition-colors"
                                  title="Click to view equipment details"
                                >
                                  {item.assetTag}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onSelectGear(item)}
                                  className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 transition-colors text-left cursor-pointer hover:underline"
                                  title="Click to open equipment details"
                                >
                                  {item.name}
                                </button>
                                {item.kitName && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                                    {item.kitName}
                                  </span>
                                )}

                                {isHoveredSwap && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold flex items-center gap-1 shadow-2xs">
                                    <ArrowLeftRight className="w-3 h-3" /> Drop to Swap
                                  </span>
                                )}
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
                                className="text-[11px] font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg pl-2 pr-5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer shadow-2xs appearance-none"
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
                              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                            </div>

                            <button
                              onClick={() =>
                                onOpenQrModal ? onOpenQrModal(item) : onSelectGear(item)
                              }
                              className="p-1.5 px-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              title="Scan / Print QR Tag"
                            >
                              <QrCode className="w-3.5 h-3.5 text-amber-600" />
                              <span className="hidden sm:inline">Tag</span>
                            </button>

                            <button
                              onClick={() =>
                                onReportIssue ? onReportIssue(item) : onSelectGear(item)
                              }
                              className="p-1.5 px-2.5 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              title="Flag field damage or maintenance issue"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span className="hidden sm:inline">Report Issue</span>
                            </button>

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
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                              title="Return single item back to cage"
                            >
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Check-in</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD A NEW DEPLOYMENT (WITH DATE OF DEPLOYMENT & GEAR SELECTION) */}
      {/* ========================================================================= */}
      {isAddDeploymentOpen && (
        <div
          onClick={() => setIsAddDeploymentOpen(false)}
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
            <form onSubmit={handleCreateDeployment} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Deployment / Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. Commercial Day 3 - Mojave Exterior"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                />
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
                  <input
                    type="text"
                    value={newProjLocation}
                    onChange={(e) => setNewProjLocation(e.target.value)}
                    placeholder="e.g. 1438 N Gower St, Hollywood, CA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter street address, studio stage, or landmark for Google Maps lookup
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Client / Production Company
                  </label>
                  <input
                    type="text"
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
          onClick={() => setEditingDeploymentName(null)}
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
            <form onSubmit={handleSaveEditDeployment} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Deployment / Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={editProjName}
                  onChange={(e) => setEditProjName(e.target.value)}
                  placeholder="e.g. Commercial Day 3 - Mojave Exterior"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                />
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
                  <input
                    type="text"
                    value={editProjLocation}
                    onChange={(e) => setEditProjLocation(e.target.value)}
                    placeholder="e.g. 1438 N Gower St, Hollywood, CA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter street address, studio stage, or landmark for Google Maps lookup
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Client / Production Company
                  </label>
                  <input
                    type="text"
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
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingDeploymentName(null)}
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
            </form>
          </div>
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
    </div>
  );
};
