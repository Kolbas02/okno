import { SCHEDULE_API } from "./config";
import type { UniversityClass, CustomEvent, FreeWindow } from "./types";

export async function fetchSchedule(groupId: number): Promise<UniversityClass[]> {
  const res = await fetch(`${SCHEDULE_API}?groupId=${groupId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'application/json',
      'Referer': 'https://lk.gubkin.ru/'
    },
    next: { revalidate: 21600 }, // Кэшируем на 6 часов, чтобы не спамить API вуза
  });

  if (!res.ok) {
    // Читаем текст ошибки, чтобы понять, что именно вернул сервер (часто это HTML с капчей)
    const errorText = await res.text().catch(() => 'No response body');
    throw new Error(`Schedule API error: ${res.status} ${res.statusText}. Body: ${errorText.slice(0, 150)}`);
  }
  
  const json = await res.json();
  return json.data as UniversityClass[];
}


export function filterBySubgroupAndDate(
  classes: UniversityClass[],
  subgroup: string,
  date: string
): UniversityClass[] {
  return classes
    .filter((c) => c.date === date)
    .filter((c) => c.subgroup === "" || c.subgroup === subgroup)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function findFreeWindows(
  emilClasses: UniversityClass[],
  yasyaClasses: UniversityClass[],
  customEvents: CustomEvent[],
  dayStart = "08:00",
  dayEnd = "22:00",
  minDuration = 30
): FreeWindow[] {
  const busy: { start: number; end: number }[] = [];
  for (const c of [...emilClasses, ...yasyaClasses]) {
    busy.push({ start: timeToMinutes(c.startTime), end: timeToMinutes(c.endTime) });
  }
  for (const e of customEvents) {
    busy.push({ start: timeToMinutes(e.startTime), end: timeToMinutes(e.endTime) });
  }
  busy.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const b of busy) {
    if (merged.length === 0 || merged[merged.length - 1].end < b.start) {
      merged.push({ ...b });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, b.end);
    }
  }
  const windows: FreeWindow[] = [];
  let cursor = timeToMinutes(dayStart);
  const end = timeToMinutes(dayEnd);
  for (const b of merged) {
    if (b.start > cursor) {
      const duration = b.start - cursor;
      if (duration >= minDuration) {
        windows.push({ startTime: minutesToTime(cursor), endTime: minutesToTime(b.start), durationMinutes: duration });
      }
    }
    cursor = Math.max(cursor, b.end);
  }
  if (end > cursor) {
    const duration = end - cursor;
    if (duration >= minDuration) {
      windows.push({ startTime: minutesToTime(cursor), endTime: minutesToTime(end), durationMinutes: duration });
    }
  }
  return windows;
}