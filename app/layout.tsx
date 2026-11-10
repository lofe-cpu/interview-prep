import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Interview Trainer — тренажёр технических собеседований",
  description:
    "Тренируйтесь отвечать на вопросы техсобеседований: задачи, уточнения, подсказки, сохранение попыток и отслеживание прогресса.",
};

const themeScript = `(function () {
  try {
    var t = localStorage.getItem("theme");
    var dark = t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Nav
          user={
            user ? { id: user.id, name: user.name, email: user.email } : null
          }
        />
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
