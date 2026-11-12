import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import Nav from "@/components/Nav";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

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
      <body
        className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
      >
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>

        {/* Анимированный фон */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
          <div className="blob -left-24 -top-24 h-[28rem] w-[28rem] bg-indigo-300/40 dark:bg-indigo-600/15" />
          <div className="blob -right-24 top-1/4 h-[26rem] w-[26rem] bg-fuchsia-300/30 [animation-delay:6s] dark:bg-fuchsia-600/10" />
          <div className="blob bottom-0 left-1/3 h-[28rem] w-[28rem] bg-sky-300/30 [animation-delay:12s] dark:bg-sky-600/10" />
        </div>

        {/* Зернистость «бумаги» */}
        <div aria-hidden className="grain" />

        <Nav
          user={
            user ? { id: user.id, name: user.name, email: user.email } : null
          }
        />
        <main className="relative mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
