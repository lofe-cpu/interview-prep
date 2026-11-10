import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createAttempt, getTask, touchStreak } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  let body: { taskId?: string; answerText?: string; answerCode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса" }, { status: 400 });
  }

  const taskId = (body.taskId ?? "").trim();
  if (!taskId) {
    return NextResponse.json({ error: "Не указана задача" }, { status: 400 });
  }
  if (!getTask(taskId)) {
    return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
  }

  const attempt = createAttempt(
    user.id,
    taskId,
    (body.answerText ?? "").slice(0, 20000),
    (body.answerCode ?? "").slice(0, 50000),
  );
  touchStreak(user.id);

  return NextResponse.json({ attempt }, { status: 201 });
}
