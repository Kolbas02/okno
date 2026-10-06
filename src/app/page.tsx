"use client";

import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import DayView from "@/components/DayView";
import AddEventModal from "@/components/AddEventModal";

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const dateStr = format(currentDate, "yyyy-MM-dd");
  const displayDate = format(currentDate, "d MMMM, EEEE", { locale: ru });
  const isToday =
    format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 pt-2 pb-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-indigo-400">Окно</h1>
          <button
            onClick={() => setShowAddEvent(true)}
            className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-light leading-none"
          >
            +
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentDate((d) => subDays(d, 1))}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            {"<"}
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="flex flex-col items-center"
          >
            <span className="text-base font-semibold capitalize">
              {displayDate}
            </span>
            {!isToday && (
              <span className="text-xs text-indigo-400 mt-0.5">Сегодня</span>
            )}
          </button>
          <button
            onClick={() => setCurrentDate((d) => addDays(d, 1))}
            className="p-2 rounded-lg hover:bg-slate-800"
          >
            {">"}
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