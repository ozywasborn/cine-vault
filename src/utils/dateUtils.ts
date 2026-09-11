/**
 * Normalizes any date string (ISO timestamp, UTC, or YYYY-MM-DD) into standard YYYY-MM-DD format
 * suitable for HTML5 <input type="date"> and clean UI display.
 * Accurately prevents timezone shifts and browser input rejection when loading from Google Sheets or API.
 */
export function normalizeDateToYMD(val?: string | null): string {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';

  // Already standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle double-stamped corruption like "2026-09-04T16:00:00.000ZT08:00:00Z"
  let cleanInput = trimmed;
  if (trimmed.includes('ZT') || trimmed.split('T').length > 2) {
    const parts = trimmed.split('T');
    cleanInput = parts[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanInput)) {
      return cleanInput;
    }
  }

  // Parse using Date object to extract local year, month, and date
  const d = new Date(cleanInput);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fallback: take substring before 'T' if valid
  if (cleanInput.includes('T')) {
    const firstPart = cleanInput.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(firstPart)) {
      return firstPart;
    }
  }

  return cleanInput;
}

/**
 * Formats any date string (YYYY-MM-DD or ISO timestamp) into standard DD-MM-YYYY format
 * suitable for clean UI presentation across all tables, cards, and modals.
 */
export function formatDateDDMMYYYY(val?: string | null | Date | number, fallback: string = ''): string {
  if (val === undefined || val === null || val === '') return fallback;

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return fallback;
    const day = String(val.getDate()).padStart(2, '0');
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const year = val.getFullYear();
    return `${day}-${month}-${year}`;
  }

  if (typeof val === 'number') {
    const d = new Date(val);
    if (isNaN(d.getTime())) return fallback;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const str = String(val).trim();
  if (!str) return fallback;

  // Already standard DD-MM-YYYY (e.g. 18-04-2026)
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    return str;
  }

  // Handle standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [y, m, d] = str.split('-');
    return `${d}-${m}-${y}`;
  }

  // Handle ISO string with timestamp (e.g. 2026-04-18T16:00:00.000Z)
  const ymdPart = str.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymdPart)) {
    const [y, m, d] = ymdPart.split('-');
    return `${d}-${m}-${y}`;
  }

  // Handle slash formats YYYY/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) {
    const [y, m, d] = str.split('/');
    return `${d}-${m}-${y}`;
  }

  // Handle slash formats DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    return `${d}-${m}-${y}`;
  }

  // Parse using Date object
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return fallback;
}

/**
 * Formats a date string into DD-MM-YYYY display format (with customizable fallback)
 */
export function formatDisplayDate(val?: string | null | Date | number, fallback: string = 'Active'): string {
  return formatDateDDMMYYYY(val, fallback);
}

/**
 * Formats a monetary value into Singapore Dollar (SGD) currency format, e.g. S$5,000
 */
export function formatCurrencySGD(val?: number | string | null): string {
  if (val === undefined || val === null || val === '') return 'S$0';
  const num = typeof val === 'number' ? val : Number(val);
  if (isNaN(num)) return 'S$0';
  return `S$${num.toLocaleString()}`;
}
