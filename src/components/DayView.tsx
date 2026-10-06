"use client";

import { useEffect, useState } from "react";
import type { UniversityClass, CustomEvent, FreeWindow } from "@/lib/types";
import { findFreeWindows } from "@/lib/schedule";

interface Props {
  date: string;
  refreshKey: number;
}

interface ScheduleData {
  emil: UniversityClass[];
  yasya: UniversityClass[];
}

export default function DayView({ date, refreshKey }: Props) {
  const [schedule, setSchedule] = useState<ScheduleData | null>(null);
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`/api/schedule?date=${date}`).then((r) => r.json()),
      fetch(`/api/events?date=${date}`).then((r) => r.json()),
    ])
      .then(([sched, evts]) => {
        if (cancelled) return;
        if (sched.error) throw new Error(sched.error);
        setSchedule(sched);
        setEvents(evts);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date, refreshKey]);

  async function deleteEvent(id: string) {
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-red-400 mb-2">Ошибка загрузки</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!schedule) return null;

  const windows = findFreeWindows(schedule.emil, schedule.yasya, events);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4 pb-20">
      {/* Эмиль */}
      <Section title="Эмиль" color="bg-blue-500" items={schedule.emil} />

      {/* Яся */}
      <Section title="Яся" color="bg-pink-500" items={schedule.yasya} />

      {/* Свои события */}
      {events.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-400 mb-2">
            Свои события
          </h2>
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-xl p-3 flex items-center justify-between"
                style={{ backgroundColor: event.color + "22", borderLeft: `3px solid ${event.color}` }}
              >
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-slate-400">
                    {event.startTime} – {event.endTime}
                  </p>
                </div>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="text-slate-500 hover:text-red-400 text-lg px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Окна */}
      {windows.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-emerald-400 mb-2">
            🟢 Свободные окна
          </h2>
          <div className="space-y-2">
            {windows.map((w, i) => (
              <div
                key={i}
                className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3"
              >
                <p className="font-medium text-emerald-300 text-sm">
                  {w.startTime} – {w.endTime}
                </p>
                <p className="text-xs text-slate-400">
                  {w.durationMinutes} минут свободно
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-slate-800/50 p-4 text-center">
          <p className="text-slate-400 text-sm">Нет свободных окон на этот день</p>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  color,
  items,
}: {
  title: string;
  color: string;
  items: UniversityClass[];
}) {
  if (items.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-semibold text-slate-400 mb-2">{title}</h2>
        <p className="text-slate-600 text-sm pl-1">Нет пар</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 mb-2">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl bg-slate-800/60 p-3 border-l-[3px] ${
              color === "bg-blue-500"
                ? "border-l-blue-500"
                : "border-l-pink-500"
            }`}
          >
            <div className="flex justify-between items-start">
              <p className="font-medium text-sm leading-tight flex-1">
                {item.name}
              </p>
              <span className="text-[10px] bg-slate-700 rounded px-1.5 py-0.5 ml-2 shrink-0">
                {item.type}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {item.startTime} – {item.endTime} · {item.room}{" "}
              {item.building && `(${item.building})`}
            </p>
            {item.lecturer && (
              <p className="text-xs text-slate-500 mt-0.5">{item.lecturer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}