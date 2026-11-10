import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { rateAttempt } from "@/lib/db";

const RATINGS = ["solved", "with_material", "unsolved"] as const;
type Rating = (typeof RATINGS)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const attemptId = Number(id);
  if (!Number.isInteger(attemptId)) {
    return NextResponse.json({ error: "Неверный id" }, { status: 400 });
  }

  let body: { rating?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса" }, { status: 400 });
  }

  if (!RATINGS.includes(body.rating as Rating)) {
    return NextResponse.json({ error: "Неверная оценка" }, { status: 400 });
  }

  rateAttempt(attemptId, user.id, body.rating as Rating);
  return NextResponse.json({ ok: true, rating: body.rating });
}
