import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Wrench,
  Download,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Pencil,
  Camera,
  Aperture,
  Sun,
  Mic,
  Compass,
  BatteryCharging,
  HardDrive,
  Package,
  ArrowUpDown,
  FolderOpen,
  FolderClosed,
  Copy,
  Trash2,
  X,
} from 'lucide-react';
import { GearItem, GearCategory, GearStatus, ConditionRating, UserAccount } from '../types';

interface InventoryViewProps {
  gear: GearItem[];
  currentUser?: UserAccount;
  initialCategory?: string;
  onSelectGear: (item: GearItem) => void;
  onEditGear?: (item: GearItem) => void;
  onUpdateGear?: (item: GearItem) => void;
  onDuplicateGear?: (item: GearItem) => void;
  onDeleteGear?: (gearId: string) => void;
  onOpenAddModal?: () => void;
  onOpenCheckoutModal?: (items: GearItem[]) => void;
  onOpenCheckinModal?: (item: GearItem) => void;
  onOpenQrModal?: (item: GearItem) => void;
  onOpenBatchQrModal?: (items: GearItem[]) => void;
  onOpenMaintenanceModal?: (item: GearItem) => void;
  onExportCsv?: () => void;
  onCheckoutGear?: (item: GearItem) => void;
  onCheckinGear?: (item: GearItem) => void;
  onAddGearClick?: () => void;
  onBatchCheckout?: (items: GearItem[]) => void;
}

type EquipmentSortMode =
  | 'model-asc'
  | 'model-desc'
  | 'tag-asc'
  | 'valuation-desc'
  | 'serviced-desc'
  | 'default';

export const InventoryView: React.FC<InventoryViewProps> = ({
  gear,
  currentUser,
  initialCategory,
  onSelectGear,
  onEditGear,
  onUpdateGear,
  onDuplicateGear,
  onDeleteGear,
  onOpenAddModal,
  onOpenCheckoutModal,
  onOpenCheckinModal,
  onOpenQrModal,
  onOpenBatchQrModal,
  onOpenMaintenanceModal,
  onExportCsv,
  onCheckoutGear,
  onCheckinGear,
  onAddGearClick,
  onBatchCheckout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedKit, setSelectedKit] = useState<string>('All');
  const [selectedGearIds, setSelectedGearIds] = useState<string[]>([]);
  const [equipmentSortMode, setEquipmentSortMode] = useState<EquipmentSortMode>('model-asc');
  const [categorySorts, setCategorySorts] = useState<Record<string, EquipmentSortMode>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Context menu state for virtual right-click on gear table row
  const [rowContextMenu, setRowContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    item: GearItem | null;
  }>({
    isOpen: false,
    x: 0,
    y: 0,
    item: null,
  });

  // Delete confirmation dialog state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<GearItem | null>(null);

  // Close context menu on outside click, scroll, or Esc
  useEffect(() => {
    const handleDismiss = () => {
      if (rowContextMenu.isOpen) {
        setRowContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('click', handleDismiss);
    window.addEventListener('scroll', handleDismiss, true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setRowContextMenu((prev) => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [rowContextMenu.isOpen]);

  // Role permissions
  const userRole = currentUser?.role || 'Admin';
  const canAddGear = userRole === 'Admin' || userRole === 'Equipment Manager';
  const canCheckout = userRole === 'Admin' || userRole === 'Equipment Manager' || userRole === 'Cinematographer';
  const canCheckin = userRole === 'Admin' || userRole === 'Equipment Manager' || userRole === 'Cinematographer';
  const canMaintain = userRole === 'Admin' || userRole === 'Equipment Manager';
  const isAuditor = userRole === 'Auditor';

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
    'In Maintenance',
    'Out On Loan',
    'Reserved',
    'Missing',
    'Retired',
  ];

  const conditions: ConditionRating[] = ['Mint', 'Good', 'Fair', 'Needs Attention', 'Damaged'];

  // User requested strictly: Studio, Gripvan, Charging Bay
  const allLocations: string[] = ['Studio', 'Gripvan', 'Charging Bay'];

  const handleFieldChange = (item: GearItem, field: keyof GearItem, value: any) => {
    if (isAuditor) return;

    let updated: GearItem = {
      ...item,
      [field]: value,
      updatedAt: new Date().toISOString(),
    };

    if (field === 'lastServiceDate') {
      const dateVal = value || undefined;
      let nextDue = item.nextServiceDate;
      if (dateVal && item.maintenanceIntervalDays) {
        const d = new Date(dateVal);
        d.setDate(d.getDate() + item.maintenanceIntervalDays);
        nextDue = d.toISOString().split('T')[0];
      }
      updated = {
        ...updated,
        lastServiceDate: dateVal,
        nextServiceDate: nextDue,
      };
    }

    if (field === 'status') {
      if (value === 'Available') {
        updated = {
          ...updated,
          currentCheckout: undefined,
        };
      } else if (value === 'Checked Out' && !updated.currentCheckout) {
        updated = {
          ...updated,
          currentCheckout: {
            id: `chk-${Date.now()}`,
            gearId: item.id,
            gearName: item.name,
            assetTag: item.assetTag,
            userId: currentUser?.id || 'usr-1',
            userName: currentUser?.name || 'Staff Member',
            userEmail: currentUser?.email || 'cinematographer@cinevault.studio',
            projectName: 'Field Production',
            shootLocation: 'Location Set',
            checkoutDate: new Date().toISOString().split('T')[0],
            expectedReturnDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            status: 'Active',
            notes: 'Status changed directly in inventory table',
            conditionOnCheckout: item.condition,
          },
        };
      } else if (value === 'Out On Loan' && !updated.currentCheckout) {
        updated = {
          ...updated,
          currentCheckout: {
            id: `chk-loan-${Date.now()}`,
            gearId: item.id,
            gearName: item.name,
            assetTag: item.assetTag,
            userId: currentUser?.id || 'usr-1',
            userName: 'External Production Partner',
            userEmail: 'partner@production.work',
            projectName: 'External Loan Production',
            shootLocation: 'External Studio / Stage',
            checkoutDate: new Date().toISOString().split('T')[0],
            expectedReturnDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
            status: 'Active',
            notes: 'Out on loan to external production',
            conditionOnCheckout: item.condition,
          },
        };
      }
    }

    if (onUpdateGear) {
      onUpdateGear(updated);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Cameras':
        return <Camera className="w-4 h-4 text-amber-600" />;
      case 'Lenses':
        return <Aperture className="w-4 h-4 text-blue-600" />;
      case 'Lighting':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Audio':
        return <Mic className="w-4 h-4 text-emerald-600" />;
      case 'Grip & Support':
        return <SlidersHorizontal className="w-4 h-4 text-indigo-600" />;
      case 'Drones & Gimbals':
        return <Compass className="w-4 h-4 text-sky-600" />;
      case 'Power & Batteries':
        return <BatteryCharging className="w-4 h-4 text-rose-500" />;
      case 'Media & Storage':
        return <HardDrive className="w-4 h-4 text-violet-600" />;
      default:
        return <Package className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryHeaderStyle = (cat: string) => {
    switch (cat) {
      case 'Cameras':
        return {
          headerBg: 'bg-amber-50/80 hover:bg-amber-100/70 border-b border-amber-200/90',
          badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-300',
          iconBox: 'bg-white border-amber-200/90 text-amber-600 shadow-2xs',
          containerBorder: 'border-amber-200/90',
        };
      case 'Lenses':
        return {
          headerBg: 'bg-blue-50/80 hover:bg-blue-100/70 border-b border-blue-200/90',
          badgeBg: 'bg-blue-100/90 text-blue-900 border-blue-300',
          iconBox: 'bg-white border-blue-200/90 text-blue-600 shadow-2xs',
          containerBorder: 'border-blue-200/90',
        };
      case 'Lighting':
        return {
          headerBg: 'bg-yellow-50/80 hover:bg-yellow-100/70 border-b border-yellow-200/90',
          badgeBg: 'bg-yellow-100/90 text-yellow-900 border-yellow-300',
          iconBox: 'bg-white border-yellow-200/90 text-amber-500 shadow-2xs',
          containerBorder: 'border-yellow-200/90',
        };
      case 'Audio':
        return {
          headerBg: 'bg-emerald-50/80 hover:bg-emerald-100/70 border-b border-emerald-200/90',
          badgeBg: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
          iconBox: 'bg-white border-emerald-200/90 text-emerald-600 shadow-2xs',
          containerBorder: 'border-emerald-200/90',
        };
      case 'Grip & Support':
        return {
          headerBg: 'bg-indigo-50/80 hover:bg-indigo-100/70 border-b border-indigo-200/90',
          badgeBg: 'bg-indigo-100/90 text-indigo-900 border-indigo-300',
          iconBox: 'bg-white border-indigo-200/90 text-indigo-600 shadow-2xs',
          containerBorder: 'border-indigo-200/90',
        };
      case 'Drones & Gimbals':
        return {
          headerBg: 'bg-sky-50/80 hover:bg-sky-100/70 border-b border-sky-200/90',
          badgeBg: 'bg-sky-100/90 text-sky-900 border-sky-300',
          iconBox: 'bg-white border-sky-200/90 text-sky-600 shadow-2xs',
          containerBorder: 'border-sky-200/90',
        };
      case 'Power & Batteries':
        return {
          headerBg: 'bg-rose-50/80 hover:bg-rose-100/70 border-b border-rose-200/90',
          badgeBg: 'bg-rose-100/90 text-rose-900 border-rose-300',
          iconBox: 'bg-white border-rose-200/90 text-rose-500 shadow-2xs',
          containerBorder: 'border-rose-200/90',
        };
      case 'Media & Storage':
        return {
          headerBg: 'bg-violet-50/80 hover:bg-violet-100/70 border-b border-violet-200/90',
          badgeBg: 'bg-violet-100/90 text-violet-900 border-violet-300',
          iconBox: 'bg-white border-violet-200/90 text-violet-600 shadow-2xs',
          containerBorder: 'border-violet-200/90',
        };
      default:
        return {
          headerBg: 'bg-slate-100/80 hover:bg-slate-200/70 border-b border-slate-200',
          badgeBg: 'bg-slate-200/90 text-slate-800 border-slate-300',
          iconBox: 'bg-white border-slate-200 text-slate-600 shadow-2xs',
          containerBorder: 'border-slate-200',
        };
    }
  };

  // Safe callback handlers
  const handleOpenAdd = () => {
    if (!canAddGear) {
      alert(`Adding new equipment assets requires Admin or Equipment Manager permissions. Current role: ${userRole}`);
      return;
    }
    if (onOpenAddModal) onOpenAddModal();
    else if (onAddGearClick) onAddGearClick();
  };

  const handleOpenCheckout = (items: GearItem[]) => {
    if (onOpenCheckoutModal) onOpenCheckoutModal(items);
    else if (onBatchCheckout) onBatchCheckout(items);
    else if (onCheckoutGear && items[0]) onCheckoutGear(items[0]);
  };

  const handleOpenCheckin = (item: GearItem) => {
    if (onOpenCheckinModal) onOpenCheckinModal(item);
    else if (onCheckinGear) onCheckinGear(item);
  };

  const handleOpenQr = (item: GearItem) => {
    if (onOpenQrModal) onOpenQrModal(item);
    else onSelectGear(item);
  };

  const handleOpenBatchQr = (items: GearItem[]) => {
    if (onOpenBatchQrModal) onOpenBatchQrModal(items);
    else if (items[0]) handleOpenQr(items[0]);
  };

  const handleOpenMaintenance = (item: GearItem) => {
    if (onOpenMaintenanceModal) onOpenMaintenanceModal(item);
    else onSelectGear(item);
  };

  const handleOpenEdit = (item: GearItem) => {
    if (onEditGear) {
      onEditGear(item);
    } else {
      onSelectGear(item);
    }
  };

  const handleExport = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }
    const headers = ['Asset Tag', 'Name', 'Brand', 'Model', 'Category', 'Status', 'Condition', 'Location', 'Purchase Date', 'Serial Number', 'Last Serviced Date', 'Purchase Cost'];
    const rows = gear.map((g) => [
      g.assetTag,
      `"${(g.name || '').replace(/"/g, '""')}"`,
      `"${(g.brand || '').replace(/"/g, '""')}"`,
      `"${(g.model || '').replace(/"/g, '""')}"`,
      g.category,
      g.status,
      g.condition,
      `"${(g.location || '').replace(/"/g, '""')}"`,
      g.purchaseDate || '2024-01-15',
      g.serialNumber,
      g.lastServiceDate || 'Never',
      g.purchasePrice || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cinevault-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Unique kits
  const kits = Array.from(new Set(gear.filter((g) => g.kitName).map((g) => g.kitName as string)));

  // Filtered items
  const filteredGear = useMemo(() => {
    return gear.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
      if (selectedKit !== 'All' && item.kitName !== selectedKit) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          String(item.name || '').toLowerCase().includes(q) ||
          String(item.assetTag || '').toLowerCase().includes(q) ||
          String(item.brand || '').toLowerCase().includes(q) ||
          String(item.model || '').toLowerCase().includes(q) ||
          String(item.serialNumber || '').toLowerCase().includes(q) ||
          String(item.location || '').toLowerCase().includes(q) ||
          (item.kitName && String(item.kitName).toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [gear, selectedCategory, selectedStatus, selectedKit, searchQuery]);

  // Helper to sort equipment list based on mode
  const sortItemList = (items: GearItem[], sort: EquipmentSortMode) => {
    const list = [...items];
    if (sort === 'model-asc') {
      return list.sort(
        (a, b) =>
          String(a.name || '').localeCompare(String(b.name || '')) ||
          String(a.model || '').localeCompare(String(b.model || ''))
      );
    }
    if (sort === 'model-desc') {
      return list.sort(
        (a, b) =>
          String(b.name || '').localeCompare(String(a.name || '')) ||
          String(b.model || '').localeCompare(String(a.model || ''))
      );
    }
    if (sort === 'tag-asc') {
      return list.sort((a, b) => String(a.assetTag || '').localeCompare(String(b.assetTag || '')));
    }
    if (sort === 'valuation-desc') {
      return list.sort(
        (a, b) =>
          (b.purchasePrice || 0) -
          (a.purchasePrice || 0)
      );
    }
    if (sort === 'serviced-desc') {
      return list.sort((a, b) =>
        (b.lastServiceDate || '').localeCompare(a.lastServiceDate || '')
      );
    }
    return list;
  };

  // Grouped items by category with equipment sorted within each specific category
  const groupedCategories = useMemo(() => {
    const map = new Map<string, GearItem[]>();
    const targetCats = selectedCategory === 'All' ? categories : [selectedCategory];

    targetCats.forEach((cat) => {
      const items = filteredGear.filter((g) => g.category === cat);
      const activeSort = categorySorts[cat] || equipmentSortMode;
      const sorted = sortItemList(items, activeSort);
      if (sorted.length > 0) {
        map.set(cat, sorted);
      }
    });

    // Also catch any items that have custom category names not in the default list
    filteredGear.forEach((g) => {
      if (!map.has(g.category)) {
        const existing = map.get(g.category) || [];
        existing.push(g);
        const activeSort = categorySorts[g.category] || equipmentSortMode;
        map.set(g.category, sortItemList(existing, activeSort));
      }
    });

    return Array.from(map.entries()).map(([catName, items]) => ({
      name: catName,
      items,
      totalValuation: items.reduce((sum, it) => sum + (it.purchasePrice || 0), 0),
      availableCount: items.filter((it) => it.status === 'Available').length,
      checkedOutCount: items.filter((it) => it.status === 'Checked Out').length,
      maintenanceCount: items.filter((it) => it.status === 'In Maintenance').length,
    }));
  }, [filteredGear, selectedCategory, categories, equipmentSortMode, categorySorts]);

  // Toggle Equipment / Model sorting within a specific category
  const toggleCategoryModelSort = (categoryName: string) => {
    setCategorySorts((prev) => {
      const current = prev[categoryName] || equipmentSortMode;
      const nextSort: EquipmentSortMode = current === 'model-asc' ? 'model-desc' : 'model-asc';
      return {
        ...prev,
        [categoryName]: nextSort,
      };
    });
  };

  // Row right-click context menu handler
  const handleRowContextMenu = (e: React.MouseEvent, item: GearItem) => {
    e.preventDefault();
    e.stopPropagation();
    const menuWidth = 200;
    const menuHeight = 150;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
    setRowContextMenu({
      isOpen: true,
      x: Math.max(10, x),
      y: Math.max(10, y),
      item,
    });
  };

  const handleDuplicate = (item: GearItem) => {
    setRowContextMenu({ isOpen: false, x: 0, y: 0, item: null });
    if (onDuplicateGear) {
      onDuplicateGear(item);
    }
  };

  const handleDeletePrompt = (item: GearItem) => {
    setRowContextMenu({ isOpen: false, x: 0, y: 0, item: null });
    setDeleteConfirmItem(item);
  };

  const confirmDelete = () => {
    if (deleteConfirmItem && onDeleteGear) {
      onDeleteGear(deleteConfirmItem.id);
    }
    setDeleteConfirmItem(null);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedGearIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedGearIds.length === filteredGear.length) {
      setSelectedGearIds([]);
    } else {
      setSelectedGearIds(filteredGear.map((g) => g.id));
    }
  };

  const toggleCategoryCollapse = (categoryName: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  const expandAllCategories = () => {
    setCollapsedCategories({});
  };

  const collapseAllCategories = () => {
    const allCollapsed: Record<string, boolean> = {};
    groupedCategories.forEach((group) => {
      allCollapsed[group.name] = true;
    });
    setCollapsedCategories(allCollapsed);
  };

  const isAllCollapsed = groupedCategories.length > 0 && groupedCategories.every((g) => !!collapsedCategories[g.name]);

  const selectAllInCategory = (items: GearItem[]) => {
    const ids = items.map((i) => i.id);
    const allAlready = ids.every((id) => selectedGearIds.includes(id));
    if (allAlready) {
      setSelectedGearIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedGearIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  const selectedItems = gear.filter((g) => selectedGearIds.includes(g.id));

  // Render a gear row
  const renderGearRow = (item: GearItem) => {
    const isSelected = selectedGearIds.includes(item.id);
    return (
      <tr
        key={item.id}
        onContextMenu={(e) => handleRowContextMenu(e, item)}
        className={`hover:bg-slate-50 transition-colors select-none ${
          isSelected ? 'bg-amber-50/40' : ''
        }`}
        title="Right-click for actions: Edit, Duplicate item, Delete"
      >
        {/* Checkbox */}
        <td className="py-2.5 px-3 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelectItem(item.id)}
            className="rounded bg-white border-slate-300 text-amber-500 focus:ring-0 cursor-pointer"
          />
        </td>

        {/* Tag - Guaranteed Single Line */}
        <td className="py-2.5 px-3 whitespace-nowrap">
          <button
            onClick={() => onSelectGear(item)}
            className="font-mono font-bold text-xs text-amber-900 hover:text-amber-950 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer whitespace-nowrap inline-flex items-center shadow-2xs transition-colors"
            title="Inspect gear asset details"
          >
            {item.assetTag}
          </button>
        </td>

        {/* Equipment Name - Clean layout */}
        <td className="py-2.5 px-3 overflow-hidden">
          <div className="flex items-center gap-1.5 group/name">
            <div
              onClick={() => onSelectGear(item)}
              className="font-bold text-slate-900 hover:text-amber-600 transition-colors cursor-pointer text-xs sm:text-sm truncate"
              title="Click to view details"
            >
              {item.name}
            </div>
            {onEditGear && !isAuditor && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(item);
                }}
                className="opacity-0 group-hover/name:opacity-100 p-0.5 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-all cursor-pointer shrink-0"
                title="Edit equipment name and details"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 font-medium truncate">
            {item.brand && (
              <span>
                <strong className="text-slate-700">{item.brand} {item.model}</strong>
              </span>
            )}
            {item.brand && item.serialNumber && <span className="text-slate-300">•</span>}
            {item.serialNumber && (
              <span>
                SN: <strong className="text-slate-800 font-mono">{item.serialNumber}</strong>
              </span>
            )}
            {item.kitName && (
              <>
                <span className="text-slate-300">•</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px]">
                  {item.kitName}
                </span>
              </>
            )}
          </div>
        </td>

        {/* Category Drop-down */}
        <td className="py-2.5 px-2 text-slate-700 font-medium whitespace-nowrap">
          <div className="relative inline-flex items-center w-[118px]">
            <select
              value={item.category}
              disabled={isAuditor}
              onChange={(e) => handleFieldChange(item, 'category', e.target.value as GearCategory)}
              className="w-full text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-lg pl-2 pr-5 py-1 focus:outline-none focus:border-amber-500 cursor-pointer disabled:cursor-not-allowed appearance-none transition-colors truncate"
              title={isAuditor ? 'Auditor role is read-only' : 'Quickly reassign category'}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>
        </td>

        {/* Movement Status Drop-down */}
        <td className="py-2.5 px-2 whitespace-nowrap">
          <div className="flex flex-col gap-0.5">
            <div className="relative inline-flex items-center w-[124px]">
              <select
                value={item.status}
                disabled={isAuditor}
                onChange={(e) => handleFieldChange(item, 'status', e.target.value as GearStatus)}
                className={`w-full text-[11px] font-bold uppercase tracking-wider rounded-lg pl-2 pr-4 py-1 border cursor-pointer appearance-none transition-colors focus:outline-none focus:bg-white focus:text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 active:bg-white active:text-slate-900 disabled:cursor-not-allowed truncate ${
                  item.status === 'Available'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/80'
                    : item.status === 'Checked Out'
                    ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100/80'
                    : item.status === 'In Maintenance'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100/80'
                    : item.status === 'Out On Loan'
                    ? 'bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100/80'
                    : item.status === 'Reserved'
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100/80'
                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                }`}
                title={isAuditor ? 'Auditor role is read-only' : 'Quickly change movement status without opening modal'}
              >
                {statuses.map((st) => (
                  <option key={st} value={st} className="bg-white text-slate-800 py-1 font-medium normal-case">
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1 pointer-events-none" />
            </div>
            {item.currentCheckout && (item.status === 'Checked Out' || item.status === 'Out On Loan') && (
              <div className="text-[10px] text-slate-500 truncate w-[124px]">
                {item.status === 'Out On Loan' ? 'Loan: ' : 'On: '}
                <strong className="text-slate-800">{item.currentCheckout.projectName}</strong>
              </div>
            )}
          </div>
        </td>

        {/* Condition Drop-down */}
        <td className="py-2.5 px-2 whitespace-nowrap">
          <div className="relative inline-flex items-center w-[98px]">
            <select
              value={item.condition}
              disabled={isAuditor}
              onChange={(e) => handleFieldChange(item, 'condition', e.target.value as ConditionRating)}
              className={`w-full text-xs font-semibold rounded-lg pl-2 pr-4 py-1 border cursor-pointer appearance-none transition-colors focus:outline-none focus:bg-white focus:text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 active:bg-white active:text-slate-900 disabled:cursor-not-allowed truncate ${
                item.condition === 'Mint'
                  ? 'bg-emerald-50/70 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80'
                  : item.condition === 'Good'
                  ? 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100/80'
                  : item.condition === 'Needs Attention'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100/80'
              }`}
              title={isAuditor ? 'Auditor role is read-only' : 'Quickly change condition'}
            >
              {conditions.map((cond) => (
                <option key={cond} value={cond} className="bg-white text-slate-800 py-1 font-normal">
                  {cond}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1 pointer-events-none" />
          </div>
        </td>

        {/* Location Drop-down - Studio, Gripvan, Charging Bay */}
        <td className="py-2.5 px-2 whitespace-nowrap">
          <div className="relative inline-flex items-center w-[98px]">
            <select
              value={allLocations.includes(item.location) ? item.location : 'Studio'}
              disabled={isAuditor}
              onChange={(e) => handleFieldChange(item, 'location', e.target.value)}
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-lg pl-2 pr-4 py-1 focus:outline-none focus:bg-white focus:text-slate-900 focus:border-amber-500 cursor-pointer disabled:cursor-not-allowed appearance-none transition-colors truncate"
              title={isAuditor ? 'Auditor role is read-only' : 'Location options (Studio, Gripvan, Charging Bay)'}
            >
              {allLocations.map((loc) => (
                <option key={loc} value={loc} className="bg-white text-slate-800">
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1 pointer-events-none" />
          </div>
        </td>

        {/* Last Serviced Date - Key-in input */}
        <td className="py-2 px-2 whitespace-nowrap">
          <input
            type="date"
            disabled={isAuditor}
            value={item.lastServiceDate || ''}
            onChange={(e) => handleFieldChange(item, 'lastServiceDate', e.target.value)}
            className="w-[116px] text-xs font-mono font-medium text-slate-800 bg-slate-50 hover:bg-slate-100/90 focus:bg-white focus:text-slate-900 border border-slate-200 rounded-lg px-1.5 py-1 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            title={isAuditor ? 'Auditor role is read-only' : 'Key in or select Last Serviced Date'}
          />
        </td>

        {/* Cost of Purchase */}
        <td className="py-2.5 px-2 text-slate-900 font-mono font-medium whitespace-nowrap text-xs sm:text-sm">
          ${(item.purchasePrice || 0).toLocaleString()}
        </td>

        {/* Actions Column */}
        <td className="py-2.5 pl-2 pr-5 text-right whitespace-nowrap">
          <div className="inline-flex items-center justify-end gap-1.5">
            {/* Quick Edit Gear Button - Standardized square 32x32px */}
            {onEditGear && (
              <button
                type="button"
                onClick={() => handleOpenEdit(item)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-amber-50 hover:border-amber-300 text-slate-600 hover:text-amber-700 transition-colors cursor-pointer shadow-2xs shrink-0"
                title={isAuditor ? 'Inspect equipment details' : 'Edit Equipment Details'}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}

            {/* QR Tag Button - Standardized square 32x32px */}
            <button
              onClick={() => handleOpenQr(item)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-amber-600 transition-colors cursor-pointer shadow-2xs shrink-0"
              title="View & Print Smart QR Tag"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>

            {/* Operational Action - Standardized 96x32px */}
            {isAuditor ? (
              <button
                onClick={() => onSelectGear(item)}
                className="w-24 h-8 flex items-center justify-center px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 cursor-pointer shadow-2xs transition-colors shrink-0"
                title="Inspect item specifications and details"
              >
                <span>Inspect</span>
              </button>
            ) : item.status === 'Available' ? (
              <button
                onClick={() => handleOpenCheckout([item])}
                className="w-24 h-8 flex items-center justify-center gap-1 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                title="Check out gear to shoot"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                <span>Check Out</span>
              </button>
            ) : item.status === 'Checked Out' ? (
              <button
                onClick={() => handleOpenCheckin(item)}
                className="w-24 h-8 flex items-center justify-center gap-1 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
                title="Check in gear back to cage"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                <span>Check In</span>
              </button>
            ) : (
              <button
                onClick={() => (canMaintain ? handleOpenMaintenance(item) : onSelectGear(item))}
                className="w-24 h-8 flex items-center justify-center gap-1 px-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer shrink-0"
                title={canMaintain ? 'Manage Service' : 'Inspect Service Record'}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-500" />
                <span>{canMaintain ? 'Service' : 'Inspect'}</span>
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipment Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full studio fleet registry with category grouping, drop-down sorting, and individual gear editing.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          {selectedGearIds.length > 0 && (
            <>
              <button
                onClick={() => handleOpenBatchQr(selectedItems)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 border border-amber-200 transition-colors cursor-pointer shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-600" />
                <span>Print QR Sheet ({selectedGearIds.length})</span>
              </button>

              {canCheckout ? (
                <button
                  onClick={() => handleOpenCheckout(selectedItems)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Batch Checkout ({selectedGearIds.length})</span>
                </button>
              ) : (
                <span
                  title="Auditor account is restricted to read-only reporting"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200"
                >
                  <span>Auditor (Read-Only)</span>
                </span>
              )}
            </>
          )}

          {canAddGear ? (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Add Equipment</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAdd}
              title={`Registration restricted to Admin / Equipment Manager (Current role: ${userRole})`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed border border-slate-200"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>Add Equipment (Locked)</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Sort Controls Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by asset tag, gear name, serial number, kit, locker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Equipment Sorting Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
                <span>Sort Items:</span>
              </span>
              <select
                value={equipmentSortMode}
                onChange={(e) => {
                  const newSort = e.target.value as EquipmentSortMode;
                  setEquipmentSortMode(newSort);
                  setCategorySorts({});
                }}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="model-asc">Equipment / Model (A → Z)</option>
                <option value="model-desc">Equipment / Model (Z → A)</option>
                <option value="tag-asc">Asset Tag (A → Z)</option>
                <option value="valuation-desc">Purchase Cost (High → Low)</option>
                <option value="serviced-desc">Last Serviced Date</option>
                <option value="default">Default Asset Order</option>
              </select>
            </div>

            {/* Category Filter Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 px-3.5 py-2 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer font-medium"
            >
              <option value="All">All Categories ({gear.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c} ({gear.filter((g) => g.category === c).length})
                </option>
              ))}
            </select>

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 px-3.5 py-2 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer font-medium"
            >
              <option value="All">All Movement Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s} ({gear.filter((g) => g.status === s).length})
                </option>
              ))}
            </select>

            {/* Kit Select */}
            {kits.length > 0 && (
              <select
                value={selectedKit}
                onChange={(e) => setSelectedKit(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 px-3.5 py-2 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer font-medium"
              >
                <option value="All">All Production Kits</option>
                {kits.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Filter Quick Info & Category Expand/Collapse Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-900">{filteredGear.length}</strong> of {gear.length} items
            </span>
            {selectedCategory !== 'All' && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-medium">
                Category: {selectedCategory}
              </span>
            )}
            {selectedGearIds.length > 0 && (
              <span className="text-amber-600 font-bold">
                • {selectedGearIds.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {groupedCategories.length > 0 && (
              <button
                type="button"
                onClick={isAllCollapsed ? expandAllCategories : collapseAllCategories}
                className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-200"
              >
                {isAllCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Expand All Categories</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Collapse All Categories</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={selectAllFiltered}
              className="text-xs font-semibold text-slate-600 hover:text-amber-600 transition-colors cursor-pointer"
            >
              {selectedGearIds.length === filteredGear.length ? 'Deselect All' : 'Select Filtered'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Inventory Content */}
      {filteredGear.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No equipment found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, movement status, or category filter to locate matching assets.
          </p>
        </div>
      ) : (
        /* Category Drop-Down Accordion Sections (Retained As Only View) */
        <div className="space-y-4">
          {groupedCategories.map((group) => {
            const isCollapsed = !!collapsedCategories[group.name];
            const allInCatSelected =
              group.items.length > 0 && group.items.every((it) => selectedGearIds.includes(it.id));
            const catStyle = getCategoryHeaderStyle(group.name);
            const activeCatSort = categorySorts[group.name] || equipmentSortMode;

            return (
              <div
                key={group.name}
                className={`bg-white rounded-2xl border ${catStyle.containerBorder} overflow-hidden shadow-xs transition-all`}
              >
                {/* Category Drop-down Header */}
                <div
                  onClick={() => toggleCategoryCollapse(group.name)}
                  className={`p-3.5 sm:p-4 ${catStyle.headerBg} flex items-center justify-between cursor-pointer select-none transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded-lg bg-white/90 border border-slate-200 text-slate-600 shadow-2xs">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-700" />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${catStyle.iconBox}`}>
                        {getCategoryIcon(group.name)}
                      </div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        {group.name}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${catStyle.badgeBg}`}>
                          {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                        </span>
                        {categorySorts[group.name] && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300">
                            {categorySorts[group.name] === 'model-asc' ? 'A → Z' : 'Z → A'}
                          </span>
                        )}
                      </h2>
                    </div>
                  </div>

                  {/* Category summary stats & quick actions */}
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <div className="hidden sm:flex items-center gap-2 text-[11px]">
                      {group.availableCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          {group.availableCount} Available
                        </span>
                      )}
                      {group.checkedOutCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                          {group.checkedOutCount} On Shoot
                        </span>
                      )}
                      {group.maintenanceCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                          {group.maintenanceCount} Service
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => selectAllInCategory(group.items)}
                      className="hidden md:inline-flex text-[11px] font-semibold text-slate-600 hover:text-amber-600 px-2 py-1 rounded bg-white border border-slate-200 cursor-pointer shadow-2xs"
                    >
                      {allInCatSelected ? 'Deselect Cat' : 'Select Cat'}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleCategoryCollapse(group.name)}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={isCollapsed ? 'Open category drop-down' : 'Close category drop-down'}
                    >
                      {isCollapsed ? (
                        <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                          Show <ChevronDown className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          Hide <ChevronUp className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Drop-down Table Content */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs table-fixed min-w-[1320px]">
                      <colgroup>
                        <col style={{ width: '2.8%' }} />
                        <col style={{ width: '8.0%' }} />
                        <col style={{ width: '28.5%' }} />
                        <col style={{ width: '9.8%' }} />
                        <col style={{ width: '10.8%' }} />
                        <col style={{ width: '8.8%' }} />
                        <col style={{ width: '8.8%' }} />
                        <col style={{ width: '9.8%' }} />
                        <col style={{ width: '7.2%' }} />
                        <col style={{ width: '15.5%' }} />
                      </colgroup>
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                          <th className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={allInCatSelected}
                              onChange={() => selectAllInCategory(group.items)}
                              className="rounded bg-white border-slate-300 text-amber-500 focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Asset Tag</th>
                          <th
                            onClick={() => toggleCategoryModelSort(group.name)}
                            className="py-2.5 px-3 cursor-pointer hover:text-slate-900 transition-colors select-none"
                            title={`Click to sort ${group.name} by Equipment / Model (A → Z or Z → A)`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>Equipment / Model</span>
                              {activeCatSort === 'model-asc' ? (
                                <ChevronUp className="w-3.5 h-3.5 text-amber-600" />
                              ) : activeCatSort === 'model-desc' ? (
                                <ChevronDown className="w-3.5 h-3.5 text-amber-600" />
                              ) : (
                                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          </th>
                          <th className="py-2.5 px-2 whitespace-nowrap">Category</th>
                          <th className="py-2.5 px-2 whitespace-nowrap">Movement Status</th>
                          <th className="py-2.5 px-2 whitespace-nowrap">Condition</th>
                          <th className="py-2.5 px-2 whitespace-nowrap">Location</th>
                          <th className="py-2.5 px-2 whitespace-nowrap">Last Serviced Date</th>
                          <th className="py-2.5 px-2 whitespace-nowrap">Cost of Purchase</th>
                          <th className="py-2.5 pl-2 pr-5 text-right whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {group.items.map((item) => renderGearRow(item))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Virtual Right-Click Context Menu for Gear Row */}
      {rowContextMenu.isOpen && rowContextMenu.item && (
        <div
          style={{ top: `${rowContextMenu.y}px`, left: `${rowContextMenu.x}px` }}
          className="fixed z-50 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 animate-in fade-in-0 zoom-in-95 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 truncate">
            <span className="font-mono text-amber-800 font-bold">[{rowContextMenu.item.assetTag}]</span> {rowContextMenu.item.name}
          </div>

          {/* Edit Option */}
          <button
            type="button"
            disabled={isAuditor}
            onClick={() => {
              const item = rowContextMenu.item!;
              setRowContextMenu({ isOpen: false, x: 0, y: 0, item: null });
              handleOpenEdit(item);
            }}
            className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div className="flex flex-col">
              <span>Edit</span>
              <span className="text-[10px] text-slate-400 font-normal">Open Equipment edit modal</span>
            </div>
          </button>

          {/* Duplicate Item Option */}
          <button
            type="button"
            disabled={isAuditor}
            onClick={() => handleDuplicate(rowContextMenu.item!)}
            className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <div className="flex flex-col">
              <span>Duplicate item</span>
              <span className="text-[10px] text-slate-400 font-normal">Create duplicate entry</span>
            </div>
          </button>

          {/* Delete Option */}
          <button
            type="button"
            disabled={isAuditor}
            onClick={() => handleDeletePrompt(rowContextMenu.item!)}
            className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer border-t border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <div className="flex flex-col">
              <span>Delete</span>
              <span className="text-[10px] text-rose-600/80 font-normal">Remove equipment from inventory</span>
            </div>
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialogue */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Delete Equipment Asset</h3>
                  <p className="text-xs text-slate-500">Confirm permanent deletion</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <div>Are you sure you want to delete this equipment item?</div>
              <div className="font-semibold text-slate-900 pt-1">
                <span className="font-mono text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  [{deleteConfirmItem.assetTag}]
                </span>{' '}
                {deleteConfirmItem.name}
              </div>
              <div className="text-slate-500 text-[11px] pt-1">
                Serial Number: {deleteConfirmItem.serialNumber} • Location: {deleteConfirmItem.location}
              </div>
            </div>

            <p className="text-xs text-rose-600 font-medium">
              This action cannot be undone and will remove the item from all inventory lists.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white cursor-pointer shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
