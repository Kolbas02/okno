"use client";

import { useState } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { ru } from "date-fns/locale";
import DayView from "@/components/DayView";
import AddEventModal from "@/components/AddEventModal";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const dateStr = format(currentDate, "yyyy-MM-dd");
  const dayName = format(currentDate, "EEEE", { locale: ru });
  const dayNum = format(currentDate, "d");
  const monthName = format(currentDate, "MMMM", { locale: ru });
  const today = isToday(currentDate);

  return (
    <main className="flex min-h-dvh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 glass border-b border-white/5 px-5 pt-4 pb-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center">
              <span className="text-sm font-extrabold">О</span>
            </div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Окно
            </span>
          </div>
          <button
            onClick={() => setShowAddEvent(true)}
            className="h-9 px-4 rounded-full bg-white/10 hover:bg-white/15 text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span className="text-indigo-400 text-lg leading-none">+</span>
            Событие
          </button>
        </div>

        {/* Date nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate((d) => subDays(d, 1))}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentDate(new Date())}
            className="flex flex-col items-center group"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{dayNum}</span>
              <span className="text-lg font-semibold text-slate-400 capitalize">
                {monthName}
              </span>
            </div>
            <span
              className={`text-xs font-semibold mt-0.5 capitalize ${
                today
                  ? "text-emerald-400"
                  : "text-indigo-400 group-hover:underline"
              }`}
            >
              {today ? "Сегодня" : dayName}
            </span>
          </button>

          <button
            onClick={() => setCurrentDate((d) => addDays(d, 1))}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </header>

      <DayView date={dateStr} refreshKey={refreshKey} />

      {showAddEvent && (
        <AddEventModal
          date={dateStr}
          onClose={() => setShowAddEvent(false)}
          onCreated={() => {
            setShowAddEvent(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}
    </main>
  );
}