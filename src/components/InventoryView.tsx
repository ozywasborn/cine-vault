import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { GearItem, GearCategory, GearStatus, ConditionRating, UserAccount } from '../types';

interface InventoryViewProps {
  gear: GearItem[];
  currentUser?: UserAccount;
  initialCategory?: string;
  onSelectGear: (item: GearItem) => void;
  onEditGear?: (item: GearItem) => void;
  onUpdateGear?: (item: GearItem) => void;
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

type SortCategoryMode = 'grouped' | 'category-asc' | 'category-desc' | 'tag-asc' | 'valuation-desc';

export const InventoryView: React.FC<InventoryViewProps> = ({
  gear,
  currentUser,
  initialCategory,
  onSelectGear,
  onEditGear,
  onUpdateGear,
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
  const [sortMode, setSortMode] = useState<SortCategoryMode>('grouped');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

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
    const headers = ['Asset Tag', 'Name', 'Brand', 'Model', 'Category', 'Status', 'Condition', 'Location', 'Purchase Date', 'Serial Number', 'Purchase Cost'];
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
      g.purchasePrice || g.replacementValue || 0,
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
          item.name.toLowerCase().includes(q) ||
          item.assetTag.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q) ||
          item.serialNumber.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          (item.kitName && item.kitName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [gear, selectedCategory, selectedStatus, selectedKit, searchQuery]);

  // Sorted items for flat view
  const sortedGear = useMemo(() => {
    const list = [...filteredGear];
    if (sortMode === 'category-asc') {
      return list.sort((a, b) => a.category.localeCompare(b.category) || a.assetTag.localeCompare(b.assetTag));
    }
    if (sortMode === 'category-desc') {
      return list.sort((a, b) => b.category.localeCompare(a.category) || a.assetTag.localeCompare(b.assetTag));
    }
    if (sortMode === 'tag-asc') {
      return list.sort((a, b) => a.assetTag.localeCompare(b.assetTag));
    }
    if (sortMode === 'valuation-desc') {
      return list.sort((a, b) => ((b.purchasePrice || b.replacementValue || 0) - (a.purchasePrice || a.replacementValue || 0)));
    }
    return list;
  }, [filteredGear, sortMode]);

  // Grouped items by category for grouped dropdown view
  const groupedCategories = useMemo(() => {
    // Collect all categories that have items in filteredGear, or maintain standard order
    const map = new Map<string, GearItem[]>();

    // If a specific category is selected in the filter, only group that
    const targetCats = selectedCategory === 'All' ? categories : [selectedCategory];

    targetCats.forEach((cat) => {
      const items = filteredGear.filter((g) => g.category === cat);
      if (items.length > 0) {
        map.set(cat, items);
      }
    });

    // Also catch any items that have custom category names not in the default list
    filteredGear.forEach((g) => {
      if (!map.has(g.category)) {
        const existing = map.get(g.category) || [];
        existing.push(g);
        map.set(g.category, existing);
      }
    });

    return Array.from(map.entries()).map(([catName, items]) => ({
      name: catName,
      items,
      totalValuation: items.reduce((sum, it) => sum + (it.replacementValue || 0), 0),
      availableCount: items.filter((it) => it.status === 'Available').length,
      checkedOutCount: items.filter((it) => it.status === 'Checked Out').length,
      maintenanceCount: items.filter((it) => it.status === 'In Maintenance').length,
    }));
  }, [filteredGear, selectedCategory, categories]);

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
        className={`hover:bg-slate-50 transition-colors ${
          isSelected ? 'bg-amber-50/40' : ''
        }`}
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

        {/* Equipment Name - Clean single-line layout */}
        <td className="py-2.5 px-3 min-w-[220px]">
          <div
            onClick={() => onSelectGear(item)}
            className="font-bold text-slate-900 hover:text-amber-600 transition-colors cursor-pointer text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[380px]"
            title={item.name}
          >
            {item.name}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[380px]">
            {item.brand && (
              <span>
                <strong className="text-slate-700">{item.brand} {item.model}</strong>
              </span>
            )}
            {item.brand && <span className="text-slate-300">•</span>}
            <span>
              SN: <strong className="text-slate-800 font-mono">{item.serialNumber}</strong>
            </span>
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
        <td className="py-2.5 px-2.5 text-slate-700 font-medium whitespace-nowrap">
          <div className="relative inline-flex items-center">
            <select
              value={item.category}
              disabled={isAuditor}
              onChange={(e) => handleFieldChange(item, 'category', e.target.value as GearCategory)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-lg pl-2 pr-6 py-1 focus:outline-none focus:border-amber-500 cursor-pointer disabled:cursor-not-allowed appearance-none transition-colors"
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
        <td className="py-2.5 px-2.5 whitespace-nowrap">
          <div className="flex flex-col gap-0.5">
            <div className="relative inline-flex items-center">
              <select
                value={item.status}
                disabled={isAuditor}
                onChange={(e) => handleFieldChange(item, 'status', e.target.value as GearStatus)}
                className={`text-[11px] font-bold uppercase tracking-wider rounded-lg pl-2.5 pr-6 py-1 border cursor-pointer appearance-none transition-colors focus:outline-none focus:bg-white focus:text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 active:bg-white active:text-slate-900 disabled:cursor-not-allowed ${
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
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-1.5 pointer-events-none" />
            </div>
            {item.currentCheckout && (item.status === 'Checked Out' || item.status === 'Out On Loan') && (
              <div className="text-[10px] text-slate-500 truncate max-w-[140px]">
                {item.status === 'Out On Loan' ? 'Loan: ' : 'On: '}
                <strong className="text-slate-800">{item.currentCheckout.projectName}</strong>
              </div>
            )}
          </div>
        </td>

        {/* Condition Drop-down */}
        <td className="py-2.5 px-2.5 whitespace-nowrap">
          <div className="relative inline-flex items-center">
            <select
              value={item.condition}
              disabled={isAuditor}
              onChange={(e) => handleFieldChange(item, 'condition', e.target.value as ConditionRating)}
              className={`text-xs font-semibold rounded-lg pl-2 pr-6 py-1 border cursor-pointer appearance-none transition-colors focus:outline-none focus:bg-white focus:text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 active:bg-white active:text-slate-900 disabled:cursor-not-allowed ${
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
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>
        </td>

        {/* Location Drop-down - Studio, Gripvan, Charging Bay */}
        <td className="py-2.5 px-2.5 whitespace-nowrap">
          <div className="relative inline-flex items-center min-w-[110px]">
            <select
              value={allLocations.includes(item.location) ? item.location : 'Studio'}
              disabled={isAuditor}
              onChange={(e) => handleFieldChange(item, 'location', e.target.value)}
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-lg pl-2.5 pr-6 py-1 focus:outline-none focus:bg-white focus:text-slate-900 focus:border-amber-500 cursor-pointer disabled:cursor-not-allowed appearance-none transition-colors"
              title={isAuditor ? 'Auditor role is read-only' : 'Location options (Studio, Gripvan, Charging Bay)'}
            >
              {allLocations.map((loc) => (
                <option key={loc} value={loc} className="bg-white text-slate-800">
                  {loc}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>
        </td>

        {/* Cost of Purchase */}
        <td className="py-2.5 px-3 text-slate-900 font-mono font-medium whitespace-nowrap text-xs sm:text-sm">
          ${(item.purchasePrice || item.replacementValue || 0).toLocaleString()}
        </td>

        {/* Actions Column with Edit Button */}
        <td className="py-2.5 px-3 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-1.5">
            {/* Edit Button for individual gear details */}
            <button
              onClick={() => handleOpenEdit(item)}
              disabled={isAuditor}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-amber-300 text-slate-700 hover:text-amber-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
              title={isAuditor ? 'Auditor role is in read-only mode' : 'Edit details for this gear'}
            >
              <Pencil className="w-3.5 h-3.5 text-amber-600" />
              <span>Edit</span>
            </button>

            {/* QR Tag Button */}
            <button
              onClick={() => handleOpenQr(item)}
              className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-amber-600 transition-colors cursor-pointer shadow-2xs"
              title="View & Print Smart QR Tag"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>

            {/* Operational Actions */}
            {isAuditor ? (
              <button
                onClick={() => onSelectGear(item)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 cursor-pointer shadow-2xs"
                title="Inspect item specifications and financial valuation"
              >
                Inspect
              </button>
            ) : item.status === 'Available' ? (
              <button
                onClick={() => handleOpenCheckout([item])}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                title="Check out gear to shoot"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                <span>Check Out</span>
              </button>
            ) : item.status === 'Checked Out' ? (
              <button
                onClick={() => handleOpenCheckin(item)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title="Check in gear back to cage"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
                <span>Check In</span>
              </button>
            ) : (
              <button
                onClick={() => (canMaintain ? handleOpenMaintenance(item) : onSelectGear(item))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
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
            {/* Category Sort & Organization Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs">
              <span className="text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
                <span>View:</span>
              </span>
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortCategoryMode)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="grouped">Category Drop-down Accordion</option>
                <option value="category-asc">Sort by Category (A → Z)</option>
                <option value="category-desc">Sort by Category (Z → A)</option>
                <option value="tag-asc">Sort by Asset Tag</option>
                <option value="valuation-desc">Sort by Purchase Cost (High → Low)</option>
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
            {sortMode === 'grouped' && groupedCategories.length > 0 && (
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
      ) : sortMode === 'grouped' ? (
        /* Category Drop-Down Accordion Sections */
        <div className="space-y-4">
          {groupedCategories.map((group) => {
            const isCollapsed = !!collapsedCategories[group.name];
            const allInCatSelected =
              group.items.length > 0 && group.items.every((it) => selectedGearIds.includes(it.id));
            const catStyle = getCategoryHeaderStyle(group.name);

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
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                          <th className="py-2.5 px-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={allInCatSelected}
                              onChange={() => selectAllInCategory(group.items)}
                              className="rounded bg-white border-slate-300 text-amber-500 focus:ring-0 cursor-pointer"
                            />
                          </th>
                          <th className="py-2.5 px-3 w-28 whitespace-nowrap">Asset Tag</th>
                          <th className="py-2.5 px-3 min-w-[220px]">Equipment / Model</th>
                          <th className="py-2.5 px-2.5 whitespace-nowrap">Category</th>
                          <th className="py-2.5 px-2.5 whitespace-nowrap">Movement Status</th>
                          <th className="py-2.5 px-2.5 whitespace-nowrap">Condition</th>
                          <th className="py-2.5 px-2.5 whitespace-nowrap">Location</th>
                          <th className="py-2.5 px-3 whitespace-nowrap">Cost of Purchase</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Actions</th>
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
      ) : (
        /* Flat Sorted Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={filteredGear.length > 0 && selectedGearIds.length === filteredGear.length}
                      onChange={selectAllFiltered}
                      className="rounded bg-white border-slate-300 text-amber-500 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-2.5 px-3 w-28 whitespace-nowrap">Asset Tag</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Equipment / Model</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Category</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Movement Status</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Condition</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Location</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Cost of Purchase</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedGear.map((item) => renderGearRow(item))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
