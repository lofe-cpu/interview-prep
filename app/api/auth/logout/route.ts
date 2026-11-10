import { NextResponse } from "next/server";
import { clearSessionCookie, destroyCurrentSession } from "@/lib/auth";

export async function POST() {
  await destroyCurrentSession();
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
