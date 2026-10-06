"use client";

import { useState, useEffect } from "react";

interface Props {
  date: string;
  onClose: () => void;
  onCreated: () => void;
}

const COLORS = [
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#6366f1",
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

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
      setVisible(false);
      setTimeout(onCreated, 200);
    } catch {
      alert("Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-colors duration-200 ${
        visible ? "bg-black/60" : "bg-black/0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md rounded-t-3xl glass border-t border-white/10 p-6 space-y-5 transition-transform duration-200 ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-extrabold">Новое событие</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="text-xs text-slate-500 font-semibold mb-1.5 block uppercase tracking-wider">
              Название
            </label>
            <input
              type="text"
              placeholder="Встреча, дедлайн…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass border border-white/10 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600"
              autoFocus
            />
          </div>

          {/* Time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-semibold mb-1.5 block uppercase tracking-wider">
                Начало
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full glass border border-white/10 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-slate-500 font-semibold mb-1.5 block uppercase tracking-wider">
                Конец
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full glass border border-white/10 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="text-xs text-slate-500 font-semibold mb-2 block uppercase tracking-wider">
              Для кого
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "emil" as const, label: "Эмиль", icon: "👤" },
                { value: "yasya" as const, label: "Яся", icon: "👤" },
                { value: "both" as const, label: "Оба", icon: "👥" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOwner(opt.value)}
                  className={`py-2.5 rounded-2xl text-sm font-semibold transition-all flex flex-col items-center gap-1 ${
                    owner === opt.value
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "glass border border-white/5 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span className="text-base">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-slate-500 font-semibold mb-2 block uppercase tracking-wider">
              Цвет
            </label>
            <div className="flex gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-xl transition-all ${
                    color === c
                      ? "ring-2 ring-white/40 scale-110 ring-offset-2 ring-offset-slate-900"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:hover:from-indigo-600 rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] glow-indigo"
          >
            {saving ? "Сохраняю…" : "Добавить событие"}
          </button>
        </form>
      </div>
    </div>
  );
}