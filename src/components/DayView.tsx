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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Загружаю расписание…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="glass rounded-3xl p-6 text-center max-w-sm border border-white/5">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-red-400 text-xl">!</span>
          </div>
          <p className="text-red-400 font-semibold mb-1">Ошибка загрузки</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!schedule) return null;

  const windows = findFreeWindows(schedule.emil, schedule.yasya, events);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-5 space-y-6 pb-24">

      {/* Свободные окна — главный блок */}
      {windows.length > 0 ? (
        <section>
          <SectionHeader
            icon="✦"
            title="Свободные окна"
            subtitle={`${windows.length} ${plural(windows.length, "окно", "окна", "окон")}`}
            accent="emerald"
          />
          <div className="space-y-3 mt-3">
            {windows.map((w, i) => (
              <div
                key={i}
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 glow-green"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                      <span className="text-emerald-400 text-lg">⏱</span>
                    </div>
                    <div>
                      <p className="text-emerald-300 font-bold text-base">
                        {w.startTime} – {w.endTime}
                      </p>
                      <p className="text-emerald-500/70 text-xs font-medium mt-0.5">
                        {formatDuration(w.durationMinutes)}
                      </p>
                    </div>
                  </div>
                  <div className="h-8 px-3 rounded-full bg-emerald-500/15 flex items-center">
                    <span className="text-emerald-400 text-xs font-bold">Free</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-2xl glass border border-white/5 p-5 text-center">
          <span className="text-2xl mb-2 block">😔</span>
          <p className="text-slate-400 text-sm font-medium">
            Нет свободных окон на этот день
          </p>
        </div>
      )}

      {/* Эмиль */}
      <section>
        <SectionHeader
          icon="🎓"
          title="Эмиль"
          subtitle={schedule.emil.length > 0 ? `${schedule.emil.length} ${plural(schedule.emil.length, "пара", "пары", "пар")}` : "Нет пар"}
          accent="indigo"
        />
        <div className="space-y-2.5 mt-3">
          {schedule.emil.length === 0 ? (
            <EmptyDay />
          ) : (
            schedule.emil.map((item) => (
              <ClassCard key={item.id} item={item} accent="indigo" />
            ))
          )}
        </div>
      </section>

      {/* Яся */}
      <section>
        <SectionHeader
          icon="🎓"
          title="Яся"
          subtitle={schedule.yasya.length > 0 ? `${schedule.yasya.length} ${plural(schedule.yasya.length, "пара", "пары", "пар")}` : "Нет пар"}
          accent="rose"
        />
        <div className="space-y-2.5 mt-3">
          {schedule.yasya.length === 0 ? (
            <EmptyDay />
          ) : (
            schedule.yasya.map((item) => (
              <ClassCard key={item.id} item={item} accent="rose" />
            ))
          )}
        </div>
      </section>

      {/* Свои события */}
      {events.length > 0 && (
        <section>
          <SectionHeader
            icon="📌"
            title="События"
            subtitle={`${events.length}`}
            accent="amber"
          />
          <div className="space-y-2.5 mt-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-2xl glass border border-white/5 p-4 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-10 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div>
                    <p className="font-semibold text-sm">{event.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {event.startTime} – {event.endTime}
                      {event.owner !== "both" && (
                        <span className="ml-2 text-slate-600">
                          · {event.owner === "emil" ? "Эмиль" : "Яся"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* --- Sub-components --- */

function SectionHeader({
  icon,
  title,
  subtitle,
  accent,
}: {
  icon: string;
  title: string;
  subtitle: string;
  accent: "emerald" | "indigo" | "rose" | "amber";
}) {
  const colors = {
    emerald: "text-emerald-400",
    indigo: "text-indigo-400",
    rose: "text-rose-400",
    amber: "text-amber-400",
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <h2 className={`text-sm font-bold ${colors[accent]}`}>{title}</h2>
      </div>
      <span className="text-xs text-slate-600 font-medium">{subtitle}</span>
    </div>
  );
}

function ClassCard({
  item,
  accent,
}: {
  item: UniversityClass;
  accent: "indigo" | "rose";
}) {
  const border =
    accent === "indigo" ? "border-l-indigo-500" : "border-l-rose-400";
  const timeBg =
    accent === "indigo" ? "bg-indigo-500/10 text-indigo-400" : "bg-rose-500/10 text-rose-400";
  const typeBg =
    accent === "indigo" ? "bg-indigo-500/10 text-indigo-300" : "bg-rose-500/10 text-rose-300";

  return (
    <div
      className={`rounded-2xl glass border border-white/5 border-l-[3px] ${border} p-4`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm leading-snug flex-1">{item.name}</p>
        <span className={`text-[10px] font-bold rounded-lg px-2 py-1 shrink-0 ${typeBg}`}>
          {item.type}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        <span className={`text-xs font-bold rounded-lg px-2 py-1 ${timeBg}`}>
          {item.startTime} – {item.endTime}
        </span>
        {item.room && (
          <span className="text-xs text-slate-500">
            {item.room}
            {item.building && ` · ${item.building}`}
          </span>
        )}
      </div>
      {item.lecturer && (
        <p className="text-xs text-slate-600 mt-2">{item.lecturer}</p>
      )}
    </div>
  );
}

function EmptyDay() {
  return (
    <div className="rounded-2xl glass border border-white/5 p-4 text-center">
      <span className="text-lg mb-1 block">🎉</span>
      <p className="text-slate-500 text-sm">Нет пар — свободный день</p>
    </div>
  );
}

/* --- Helpers --- */

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} ${plural(h, "час", "часа", "часов")}`;
  return `${h} ч ${m} мин`;
}

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}