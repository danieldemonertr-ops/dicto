import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { processDailyCheckin } from "@/lib/gamification";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await processDailyCheckin(session.user.id);
  return NextResponse.json({ ok: true, ...result });
}
