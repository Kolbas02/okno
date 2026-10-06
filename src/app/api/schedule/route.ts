import { NextResponse } from "next/server";
import { USERS, SCHEDULE_API } from "@/lib/config";
import { fetchSchedule, filterBySubgroupAndDate } from "@/lib/schedule";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }

  if (!SCHEDULE_API) {
    return NextResponse.json({ error: "SCHEDULE_API not configured in src/lib/config.ts" }, { status: 500 });
  }

  try {
    const [emilAll, yasyaAll] = await Promise.all([
      fetchSchedule(USERS.emil.groupId),
      fetchSchedule(USERS.yasya.groupId),
    ]);

    const emil = filterBySubgroupAndDate(emilAll, USERS.emil.subgroup, date);
    const yasya = filterBySubgroupAndDate(yasyaAll, USERS.yasya.subgroup, date);

    return NextResponse.json({ emil, yasya });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Schedule fetch error:", message, { SCHEDULE_API, USERS });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}