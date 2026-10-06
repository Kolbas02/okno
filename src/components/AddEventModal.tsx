"use client";

import { useState } from "react";

interface Props {
  date: string;
  onClose: () => void;
  onCreated: () => void;
}

const COLORS = [
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function AddEventModal({ date, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [owner, setOwner] = useState<"emil" | "yasya" | "both">("both");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date, startTime, endTime, owner, color }),
      });
      onCreated();
    } catch {
      alert("Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 w-full max-w-md rounded-t-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Новое событие</h2>
          <button onClick={onClose} className="text-slate-500 text-xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Название"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500"
            autoFocus
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">
                Начало
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-400 mb-1 block">
                Конец
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Чьё</label>
            <div className="flex gap-2">
              {[
                { value: "emil" as const, label: "Эмиль" },
                { value: "yasya" as const, label: "Яся" },
                { value: "both" as const, label: "Оба" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOwner(opt.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    owner === opt.value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Цвет</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition ${
                    color === c ? "ring-2 ring-white scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl py-3 text-sm font-semibold transition"
          >
            {saving ? "Сохраняю..." : "Добавить"}
          </button>
        </form>
      </div>
    </div>
  );
}