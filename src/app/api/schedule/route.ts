import { NextResponse } from "next/server";
import { USERS } from "@/lib/config";
import { fetchSchedule, filterBySubgroupAndDate } from "@/lib/schedule";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date param required" }, { status: 400 });
  }

  try {
    const [emilAll, yasyaAll] = await Promise.all([
      fetchSchedule(USERS.emil.groupId),
      fetchSchedule(USERS.yasya.groupId),
    ]);

    const emil = filterBySubgroupAndDate(emilAll, USERS.emil.subgroup, date);
    const yasya = filterBySubgroupAndDate(yasyaAll, USERS.yasya.subgroup, date);

    return NextResponse.json({ emil, yasya });
  } catch (err) {
    console.error("Schedule fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 502 });
  }
}