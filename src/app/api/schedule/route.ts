import { NextResponse } from "next/server";
import { USERS } from "@/lib/config";
import { fetchSchedule, parseLessons } from "@/lib/schedule";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // YYYY-MM-DD

  if (!date) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }

  try {
    const [emilData, yasyaData] = await Promise.all([
      fetchSchedule(USERS.emil.groupId, date),
      fetchSchedule(USERS.yasya.groupId, date),
    ]);

    const emil = parseLessons(
      emilData.lessons,
      emilData.timeSlots,
      USERS.emil.subgroup,
      date
    );

    const yasya = parseLessons(
      yasyaData.lessons,
      yasyaData.timeSlots,
      USERS.yasya.subgroup,
      date
    );

    return NextResponse.json({ emil, yasya });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Schedule error:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}