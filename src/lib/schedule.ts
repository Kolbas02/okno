import { SCHEDULE_API } from "./config";
import type { UniversityClass, FreeWindow } from "./types";

/**
 * Формат даты для API Губкина: DD-MM-YYYY
 */
function toGubkinDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  return `${d}-${m}-${y}`;
}

/**
 * Номер дня недели из ISO-даты (0=Пн, 6=Вс) — как в API
 */
function getWeekDayNumber(isoDate: string): number {
  const d = new Date(isoDate);
  return (d.getDay() + 6) % 7; // JS: 0=Вс → нам: 0=Пн
}

/**
 * Из массива timeChunks индексов + массива слотов → startTime, endTime
 * Пример: chunks=[4,5], slots=["8:30-9:15","9:15-10:00","10:15-11:00","11:00-11:45","12:00-12:45","12:45-13:30"]
 * → startTime="12:00", endTime="13:30"
 */
function resolveTime(
  chunks: number[],
  timeSlots: string[]
): { startTime: string; endTime: string } {
  if (!chunks.length || !timeSlots.length) {
    return { startTime: "", endTime: "" };
  }

  const firstChunk = Math.min(...chunks);
  const lastChunk = Math.max(...chunks);

  const firstSlot = timeSlots[firstChunk];
  const lastSlot = timeSlots[lastChunk];

  if (!firstSlot || !lastSlot) {
    return { startTime: "", endTime: "" };
  }

  const startTime = firstSlot.split("-")[0].trim();
  const endTime = lastSlot.split("-")[1].trim();

  // нормализация "8:30" → "08:30"
  const pad = (t: string) => {
    const [h, m] = t.split(":");
    return `${h.padStart(2, "0")}:${m}`;
  };

  return { startTime: pad(startTime), endTime: pad(endTime) };
}

/**
 * Получить расписание группы на неделю с API Губкина
 */
export async function fetchSchedule(
  groupId: string,
  isoDate: string
): Promise<{ lessons: any[]; timeSlots: string[] }> {
  const url = `${SCHEDULE_API}?act=schedule&date=${toGubkinDate(isoDate)}&groupId=${groupId}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gubkin API ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();

  if (!data.state) {
    throw new Error("API вернул state=false");
  }

  // Москва — organizations[0]
  const moscow = data.rows?.organizations?.find((o: any) => o.id === 0);
  if (!moscow) {
    throw new Error("Организация Москва не найдена");
  }

  return {
    lessons: moscow.lessons || [],
    timeSlots: moscow.lessonsTimeChunks || [],
  };
}

/**
 * Фильтр пар по дню недели, подгруппе, отмене/переносу → UniversityClass[]
 */
export function parseLessons(
  lessons: any[],
  timeSlots: string[],
  subgroup: 1 | 2,
  isoDate: string
): UniversityClass[] {
  const targetDay = getWeekDayNumber(isoDate);

  return lessons
    .filter((lesson) => {
      // только нужный день
      if (lesson.weekDayNumber !== targetDay) return false;
      // отменённые — не показываем
      if (lesson.isCanceled) return false;
      // перенесённые — не показываем в исходный день
      if (lesson.isMoved) return false;
      // подгруппа: 0 = общая, иначе только своя
      if (lesson.subgroup !== 0 && lesson.subgroup !== subgroup) return false;
      return true;
    })
    .map((lesson) => {
      const { startTime, endTime } = resolveTime(
        lesson.timeChunks || [],
        timeSlots
      );

      // преподаватель: если есть замена — берём из changes
      const teachers =
        lesson.changes?.teachers?.length > 0
          ? lesson.changes.teachers
          : lesson.teachers || [];

      const lecturer = teachers
        .map(
          (t: any) =>
            `${t.lastName || ""} ${t.firstName?.[0] || ""}.${t.patronymic?.[0] || ""}.`
        )
        .join(", ");

      // аудитория: если есть замена — берём из changes
      const rooms =
        lesson.changes?.rooms?.length > 0
          ? lesson.changes.rooms
          : lesson.rooms || [];

      const room = rooms.map((r: any) => r.number).join(", ");

      return {
        id: String(lesson.id || Math.random()),
        name: lesson.course?.name || "",
        type: lesson.type || "",
        startTime,
        endTime,
        room,
        building: "",
        lecturer,
        subgroup: lesson.subgroup ?? 0,
        isCanceled: !!lesson.isCanceled,
        isMoved: !!lesson.isMoved,
        movedTo: lesson.movedTo || undefined,
      };
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/**
 * Свободные окна между парами двух людей
 */
export function findFreeWindows(
  emil: UniversityClass[],
  yasya: UniversityClass[],
  events: { startTime: string; endTime: string }[]
): FreeWindow[] {
  const all = [...emil, ...yasya, ...events]
    .map((c) => ({ start: c.startTime, end: c.endTime }))
    .filter((c) => c.start && c.end)
    .sort((a, b) => a.start.localeCompare(b.start));

  const DAY_START = "08:00";
  const DAY_END = "22:00";
  const windows: FreeWindow[] = [];
  let cursor = DAY_START;

  for (const slot of all) {
    if (cursor < slot.start) {
      windows.push({
        startTime: cursor,
        endTime: slot.start,
        durationMinutes: diffMinutes(cursor, slot.start),
      });
    }
    if (slot.end > cursor) cursor = slot.end;
  }

  if (cursor < DAY_END) {
    windows.push({
      startTime: cursor,
      endTime: DAY_END,
      durationMinutes: diffMinutes(cursor, DAY_END),
    });
  }

  return windows.filter((w) => w.durationMinutes >= 30);
}

function diffMinutes(a: string, b: string): number {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return bh * 60 + bm - (ah * 60 + am);
}