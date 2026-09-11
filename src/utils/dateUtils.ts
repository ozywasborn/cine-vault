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
 * Formats a date string (YYYY-MM-DD or ISO) into a clean display date
 */
export function formatDisplayDate(val?: string | null, fallback: string = 'Active'): string {
  const ymd = normalizeDateToYMD(val);
  return ymd || fallback;
}
