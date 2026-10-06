import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { CustomEvent } from "@/lib/types";

const DATA_FILE = path.join(process.cwd(), "data", "events.json");

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, "[]");
  }
}

async function readEvents(): Promise<CustomEvent[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}

async function writeEvents(events: CustomEvent[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(events, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const events = await readEvents();
  if (date) {
    return NextResponse.json(events.filter((e) => e.date === date));
  }
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const body = await request.json();
  const event: CustomEvent = {
    id: crypto.randomUUID(),
    title: body.title,
    date: body.date,
    startTime: body.startTime,
    endTime: body.endTime,
    owner: body.owner || "both",
    color: body.color || "#f59e0b",
  };
  const events = await readEvents();
  events.push(event);
  await writeEvents(events);
  return NextResponse.json(event, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  let events = await readEvents();
  events = events.filter((e) => e.id !== id);
  await writeEvents(events);
  return NextResponse.json({ ok: true });
}