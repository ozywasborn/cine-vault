import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { GearItem, ShootProject, UserAccount, ConditionRating } from '../types';

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
  const [newProjLocation, setNewProjLocation] = useState('Studio / Stage 1');
  const [newProjLeadDP, setNewProjLeadDP] = useState(currentUser?.name || 'Lead DP');
  const [newProjEmail, setNewProjEmail] = useState(currentUser?.email || 'crew@production.com');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjNotes, setNewProjNotes] = useState('');
  const [selectedInitialGearIds, setSelectedInitialGearIds] = useState<string[]>([]);

  // Drag & Drop State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragSourceProject, setDragSourceProject] = useState<string | null>(null);
  const [dragOverProject, setDragOverProject] = useState<string | null>(null);
  const [hoveredSwapItemId, setHoveredSwapItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available Gear Staging Drawer
  const [showStagingDrawer, setShowStagingDrawer] = useState(false);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
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
    setNewProjLocation('Studio / Stage 1');
    setNewProjClient('');
    setNewProjNotes('');
    setSelectedInitialGearIds([]);
    setIsAddDeploymentOpen(false);
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
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-600" />
                Active Shoot Deployments
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Live Gear Telemetry & Multi-Shoot Logistics
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                <ArrowLeftRight className="w-3 h-3 text-emerald-600" />
                Drag & Drop Swap Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Active Out-on-Shoot Deployments
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Currently tracking{' '}
              <strong className="text-amber-600 font-semibold">
                {checkedOutGear.length} assets
              </strong>{' '}
              deployed across {projectNames.length} production units. Drag equipment cards to swap
              or reassign units between deployments.
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

            {/* Toggle Available Gear Staging Drawer */}
            <button
              onClick={() => setShowStagingDrawer(!showStagingDrawer)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                showStagingDrawer
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
              }`}
              title="View and drag available cage equipment into any deployment"
            >
              <Box className="w-4 h-4 text-amber-500" />
              <span>Cage Staging Rack ({availableGear.length})</span>
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
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
          </div>
        </div>
      </div>

      {/* Available Gear Staging Rack (Collapsible Shelf) */}
      {showStagingDrawer && (
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Cage Staging Rack — Available Equipment ({availableGear.length})
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

      {/* Grouped by Shoot Project */}
      {projectNames
        .filter((projName) => selectedProjectId === 'all' || selectedProjectId === projName)
        .map((projName) => {
          let items = gearByProject[projName] || [];
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            items = items.filter(
              (i) =>
                i.name.toLowerCase().includes(q) ||
                i.assetTag.toLowerCase().includes(q) ||
                i.serialNumber.toLowerCase().includes(q) ||
                (i.kitName && i.kitName.toLowerCase().includes(q))
            );
          }

          const projectMeta = allDeploymentProjects.find((p) => p.name === projName);
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
            projectMeta?.location || firstCheckout?.shootLocation || 'On Location';
          const leadDP = projectMeta?.leadDP || firstCheckout?.userName || 'Lead DP';

          return (
            <div
              key={projName}
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
                  : 'border-slate-200'
              }`}
            >
              {/* Project Card Header */}
              <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {projName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                      {items.length} {items.length === 1 ? 'asset' : 'assets'} deployed
                    </span>
                    {projectMeta?.client && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
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

                    <span className="flex items-center gap-1 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {shootLoc}
                    </span>

                    <span className="flex items-center gap-1 text-slate-700">
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      Lead: <strong>{leadDP}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
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
                        Drag and drop equipment cards from other deployments or the Cage Staging
                        Rack to allocate gear!
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

      {/* ========================================================================= */}
      {/* MODAL: ADD A NEW DEPLOYMENT (WITH DATE OF DEPLOYMENT & GEAR SELECTION) */}
      {/* ========================================================================= */}
      {isAddDeploymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8">
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>Shoot Location / Set</span>
                  </label>
                  <input
                    type="text"
                    value={newProjLocation}
                    onChange={(e) => setNewProjLocation(e.target.value)}
                    placeholder="e.g. Stage 4, Warner Lot, Burbank"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:bg-white focus:border-amber-500 transition-colors"
                  />
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
    </div>
  );
};
