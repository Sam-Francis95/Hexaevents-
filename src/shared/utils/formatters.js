const DATE_FMT = { year: 'numeric', month: 'short', day: 'numeric' };
const TIME_FMT = { hour: 'numeric', minute: '2-digit' };

export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-US', DATE_FMT);
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return `${d.toLocaleDateString('en-US', DATE_FMT)} · ${d.toLocaleTimeString('en-US', TIME_FMT)}`;
}

export function formatRelativeTime(isoString) {
  if (!isoString) return '—';
  const diffMs = new Date(isoString).getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  const abs = Math.abs(diffMin);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (abs < 60) return rtf.format(diffMin, 'minute');
  if (abs < 1440) return rtf.format(Math.round(diffMin / 60), 'hour');
  return rtf.format(Math.round(diffMin / 1440), 'day');
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function seatsLabel(capacity, registeredCount) {
  const left = Math.max(capacity - registeredCount, 0);
  if (left === 0) return 'Full';
  if (left <= 5) return `${left} seats left`;
  return `${left} seats open`;
}

export function formatTimeRange(startIso, endIso) {
  if (!startIso || !endIso) return '—';
  const start = new Date(startIso).toLocaleTimeString('en-US', TIME_FMT);
  const end = new Date(endIso).toLocaleTimeString('en-US', TIME_FMT);
  return `${start} – ${end}`;
}
