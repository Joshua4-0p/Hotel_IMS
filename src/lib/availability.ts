/**
 * Deterministic room availability — seeded from room ID, no backend required.
 * The same algorithm is used by BookingCalendar and the Rooms search filter
 * so both always agree on which dates are blocked.
 */

export function toKey(d: Date): string {
  return (
    `${d.getFullYear()}-` +
    `${String(d.getMonth() + 1).padStart(2, '0')}-` +
    `${String(d.getDate()).padStart(2, '0')}`
  );
}

/** Parse a YYYY-MM-DD string as local midnight (avoids UTC-offset date shift). */
export function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Returns the Set of YYYY-MM-DD keys that are blocked for the given room.
 * Deterministic: same roomId always produces the same set for any given run-day
 * (re-anchored to today so the calendar never shows stale past blocks).
 */
export function generateUnavailableDates(roomId: string): Set<string> {
  let hash = 0;
  for (let i = 0; i < roomId.length; i++) {
    hash = (hash * 31 + roomId.charCodeAt(i)) & 0xffffffff;
  }

  const out = new Set<string>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let seed = Math.abs(hash);
  for (let i = 0; i < 14; i++) {
    seed = ((seed * 1664525 + 1013904223) >>> 0);
    const offset = (seed % 85) + 3;   // 3–87 days from today
    seed = ((seed * 1664525 + 1013904223) >>> 0);
    const length = (seed % 4) + 1;    // 1–4 consecutive days

    for (let d = 0; d < length; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset + d);
      out.add(toKey(date));
    }
  }
  return out;
}

/**
 * Returns true when every night of the stay [checkIn, checkOut) is available.
 * The check-out day itself is not a night, so it is excluded from the check.
 */
export function isRoomAvailableForRange(
  roomId: string,
  checkIn: Date,
  checkOut: Date,
): boolean {
  const blocked = generateUnavailableDates(roomId);
  const cur = new Date(checkIn);
  while (cur < checkOut) {
    if (blocked.has(toKey(cur))) return false;
    cur.setDate(cur.getDate() + 1);
  }
  return true;
}

export function nightsBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** YYYY-MM-DD string for a date offset from today by `days`. */
export function todayPlusDays(days: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return toKey(d);
}
