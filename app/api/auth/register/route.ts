import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db";
import { hashPassword, issueSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  let body: { email?: string; name?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();
  const password = body.password ?? "";

  if (!email || !name || !password) {
    return NextResponse.json(
      { error: "Заполните все поля" },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json(
      { error: "Имя должно быть не короче 2 символов" },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Пароль должен быть не короче 6 символов" },
      { status: 400 },
    );
  }

  if (getUserByEmail(email)) {
    return NextResponse.json(
      { error: "Пользователь с таким email уже существует" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = createUser(email, name, passwordHash);
  const token = await issueSession(user.id);
  await setSessionCookie(token);

  return NextResponse.json(
    { user: { id: user.id, email: user.email, name: user.name } },
    { status: 201 },
  );
}
