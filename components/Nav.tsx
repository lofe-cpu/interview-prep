"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons";
import ThemeToggle from "@/components/ThemeToggle";

interface NavUser {
  id: number;
  name: string;
  email: string;
}

export default function Nav({ user }: { user: NavUser | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.refresh();
      router.push("/");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            <Icon name="target" className="h-4 w-4" />
          </span>
          Interview<span className="text-slate-400 dark:text-slate-500">Trainer</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/practice"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Практика
          </Link>
          <Link
            href="/progress"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Прогресс
          </Link>

          <div className="mx-1">
            <ThemeToggle />
          </div>

          {user ? (
            <div className="ml-2 flex items-center gap-2">
              <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
                {user.name}
              </span>
              <button
                onClick={logout}
                disabled={busy}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Выйти
              </button>
            </div>
          ) : (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-slate-900 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Начать
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
