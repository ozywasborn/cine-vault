import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Printer,
  Camera,
  Search,
  CheckCircle2,
  Copy,
  Download,
  Scan,
  RefreshCw,
  Sliders,
  ExternalLink,
  Info,
} from 'lucide-react';
import { GearItem } from '../types';
import { generateQrDataUrl } from '../services/qr';

interface QrTagManagerProps {
  gear: GearItem[];
  onSelectGear: (item: GearItem) => void;
  onQuickCheckout: (item: GearItem) => void;
  onQuickCheckin: (item: GearItem) => void;
}

export const QrTagManager: React.FC<QrTagManagerProps> = ({
  gear,
  onSelectGear,
  onQuickCheckout,
  onQuickCheckin,
}) => {
  const [selectedGearIds, setSelectedGearIds] = useState<string[]>(gear.slice(0, 8).map((g) => g.id));
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const [labelFormat, setLabelFormat] = useState<'pelican-large' | 'lens-cap' | 'barcode-strip'>('pelican-large');
  const [scannerActive, setScannerActive] = useState(false);
  const [scanInputText, setScanInputText] = useState('');
  const [scannedItem, setScannedItem] = useState<GearItem | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Generate QR codes for selected gear
  useEffect(() => {
    let isMounted = true;
    async function loadQrs() {
      const results: Record<string, string> = {};
      for (const item of gear) {
        if (selectedGearIds.includes(item.id)) {
          const url = await generateQrDataUrl(item);
          results[item.id] = url;
        }
      }
      if (isMounted) {
        setQrImages((prev) => ({ ...prev, ...results }));
      }
    }
    loadQrs();
    return () => {
      isMounted = false;
    };
  }, [gear, selectedGearIds]);

  const toggleSelectGear = (id: string) => {
    setSelectedGearIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedGearIds.length === gear.length) {
      setSelectedGearIds([]);
    } else {
      setSelectedGearIds(gear.map((g) => g.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Mock / Manual QR scanner processor
  const handleSimulateScan = (tagOrPayload: string) => {
    const clean = tagOrPayload.trim().toUpperCase();
    const found = gear.find(
      (g) =>
        g.assetTag.toUpperCase() === clean ||
        g.serialNumber.toUpperCase() === clean ||
        g.id.toUpperCase() === clean
    );

    if (found) {
      setScannedItem(found);
    } else {
      // Check if it's a JSON payload
      try {
        const parsed = JSON.parse(tagOrPayload);
        const match = gear.find((g) => g.assetTag === parsed.tag || g.id === parsed.id);
        if (match) setScannedItem(match);
      } catch {
        alert(`No equipment found matching asset tag or serial: "${tagOrPayload}"`);
      }
    }
  };

  const filteredGearList = gear.filter((g) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.assetTag.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.location.toLowerCase().includes(q)
    );
  });

  const selectedItems = gear.filter((g) => selectedGearIds.includes(g.id));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <QrCode className="w-4 h-4 text-amber-600" />
            <span className="text-xs uppercase tracking-widest font-bold text-amber-700">
              Smart Asset Identification
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Smart QR Tagging & Barcode Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Generate industrial QR code labels for physical gear cases, calibrate optical tags, and scan in field.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setScannerActive(!scannerActive)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
              scannerActive
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            <Scan className="w-4 h-4 text-amber-600" />
            <span>{scannerActive ? 'Close Scanner' : 'Open QR Scanner'}</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={selectedGearIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Print {selectedGearIds.length} QR Labels</span>
          </button>
        </div>
      </div>

      {/* Interactive QR Scanner Simulator */}
      {scannerActive && (
        <div className="no-print p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan className="w-5 h-5 text-amber-600 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">Live Asset Scanner Terminal</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Fast Check-In / Out by Camera or Gun</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Viewfinder simulator */}
            <div className="relative aspect-video rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
              <div className="w-44 h-44 border-2 border-amber-400/80 rounded-xl relative flex items-center justify-center">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                <div className="w-full h-0.5 bg-amber-400/70 animate-bounce" />
                <Camera className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-xs text-slate-400 mt-4 font-medium">
                Point camera at physical QR label or test barcode below
              </p>
            </div>

            {/* Manual / Barcode input */}
            <div className="space-y-4 flex flex-col justify-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scan Input / Asset Tag Simulator
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter tag (e.g. CAM-ALEXA-01, CAM-FX6-02)..."
                    value={scanInputText}
                    onChange={(e) => setScanInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSimulateScan(scanInputText)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-mono font-medium"
                  />
                  <button
                    onClick={() => handleSimulateScan(scanInputText)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Scan
                  </button>
                </div>
              </div>

              {/* Quick test buttons */}
              <div>
                <div className="text-[11px] text-slate-500 font-semibold mb-2">Tap to simulate rapid tag scan:</div>
                <div className="flex flex-wrap gap-1.5">
                  {gear.slice(0, 6).map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleSimulateScan(g.assetTag)}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-[11px] font-mono font-bold text-slate-700 border border-slate-200 cursor-pointer transition-colors"
                    >
                      {g.assetTag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scanned Result Banner */}
              {scannedItem && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Item Identified!
                    </span>
                    <span className="font-mono text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {scannedItem.assetTag}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900">{scannedItem.name}</div>
                  <div className="text-[11px] text-slate-600 flex items-center justify-between font-medium">
                    <span>Status: <strong className="text-slate-800">{scannedItem.status}</strong></span>
                    <span>Loc: {scannedItem.location}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onSelectGear(scannedItem)}
                      className="flex-1 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 font-semibold cursor-pointer shadow-2xs hover:bg-slate-50"
                    >
                      View Specs
                    </button>
                    {scannedItem.status === 'Available' ? (
                      <button
                        onClick={() => onQuickCheckout(scannedItem)}
                        className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs text-white font-bold cursor-pointer shadow-xs"
                      >
                        Check Out
                      </button>
                    ) : (
                      <button
                        onClick={() => onQuickCheckin(scannedItem)}
                        className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-bold cursor-pointer shadow-xs"
                      >
                        Quick Return
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Label Format & Selection Controls */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Label Style:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setLabelFormat('pelican-large')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  labelFormat === 'pelican-large'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pelican Case (3" x 2")
              </button>
              <button
                onClick={() => setLabelFormat('lens-cap')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  labelFormat === 'lens-cap'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lens / Body Badge (2" x 1")
              </button>
              <button
                onClick={() => setLabelFormat('barcode-strip')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  labelFormat === 'barcode-strip'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Strip Tape (1" x 0.5")
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <button
              onClick={selectAll}
              className="text-xs text-amber-700 font-bold hover:underline cursor-pointer"
            >
              {selectedGearIds.length === gear.length ? 'Deselect All' : 'Select All Fleet'}
            </button>
            <span className="text-xs text-slate-300">•</span>
            <span className="text-xs text-slate-500">
              {selectedGearIds.length} of {gear.length} queued for print
            </span>
          </div>
        </div>
      </div>

      {/* Equipment Checkbox Grid (for choosing which labels to print) */}
      <div className="no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Equipment to Include on Label Sheet
          </h3>
          <input
            type="text"
            placeholder="Quick search gear..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 font-medium"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
          {filteredGearList.map((item) => {
            const isSelected = selectedGearIds.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-amber-50/80 border-amber-300 text-slate-900 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectGear(item.id)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-mono font-bold text-amber-800">[{item.assetTag}]</span>
                <span className="truncate">{item.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Printable Sheet View - Designed for high contrast physical thermal / laser label printing */}
      <div className="space-y-4">
        <div className="no-print flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-600" />
            Physical Print Preview (Avery / Brother / Dymo Label Sheet)
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Formatted for 300 DPI high-contrast adhesive vinyl tags
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2 print:gap-2">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-white text-zinc-950 border-2 border-zinc-900 shadow-md flex items-center gap-3 relative overflow-hidden"
              style={{ pageBreakInside: 'avoid' }}
            >
              {/* QR Image */}
              <div className="shrink-0 w-24 h-24 bg-white p-1 rounded-lg border border-zinc-300 flex items-center justify-center">
                {qrImages[item.id] ? (
                  <img
                    src={qrImages[item.id]}
                    alt={`QR tag for ${item.assetTag}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <QrCode className="w-16 h-16 text-zinc-400 animate-pulse" />
                )}
              </div>

              {/* Tag text details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-black tracking-tight">
                    {item.assetTag}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-zinc-100 border border-zinc-300 text-zinc-800">
                    {item.category}
                  </span>
                </div>

                <div className="text-xs font-bold text-zinc-900 truncate mt-0.5" title={item.name}>
                  {item.name}
                </div>

                <div className="text-[10px] text-zinc-700 font-mono mt-1">
                  SN: {item.serialNumber}
                </div>

                <div className="text-[9px] text-zinc-600 flex items-center justify-between mt-1 pt-1 border-t border-zinc-200">
                  <span className="truncate">LOC: {item.location}</span>
                  {item.kitName && <span className="font-semibold text-zinc-800">KIT</span>}
                </div>
              </div>

              {/* Subtle brand tag */}
              <div className="absolute right-1 bottom-0.5 text-[7px] font-bold text-zinc-400 uppercase tracking-widest">
                CineVault
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
