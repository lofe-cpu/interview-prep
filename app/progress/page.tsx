import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import {
  getOverallProgress,
  getStreak,
  getTopicProgress,
  listAttemptsByUser,
} from "@/lib/db";
import { TOPICS } from "@/data/topics";
import DifficultyBadge from "@/components/DifficultyBadge";
import { RATING_META, type Rating } from "@/lib/meta";
import { Icon } from "@/components/icons";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import ProgressBar from "@/components/ProgressBar";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const overall = getOverallProgress(user.id);
  const streak = getStreak(user.id);
  const topicProgress = getTopicProgress(user.id);
  const attempts = listAttemptsByUser(user.id, 100);

  const progressMap = new Map(
    topicProgress.map((p) => [p.topic, { solved: p.solved, total: p.total }]),
  );
  const overallPct =
    overall.total > 0 ? Math.round((overall.solved / overall.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <Reveal>
        <h1 className="text-2xl font-bold tracking-tight">Твой прогресс</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Привет, {user.name}. Так держать.
        </p>
      </Reveal>

      {/* Статистика */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Reveal delay={0}>
          <StatCard
            icon="flame"
            iconClass="text-orange-500"
            value={<CountUp to={streak.current} />}
            label="дней подряд"
          />
        </Reveal>
        <Reveal delay={60}>
          <StatCard
            icon="trophy"
            iconClass="text-amber-500"
            value={<CountUp to={streak.longest} />}
            label="рекорд стрика"
          />
        </Reveal>
        <Reveal delay={120}>
          <StatCard
            value={
              <>
                <CountUp to={overall.solved} />/{overall.total}
              </>
            }
            label="задач решено"
          />
        </Reveal>
        <Reveal delay={180}>
          <StatCard value={<CountUp to={overallPct} />} label="общий прогресс" suffix="%" />
        </Reveal>
      </div>

      {/* Общий прогресс-бар */}
      <Reveal delay={120}>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">Общий прогресс</span>
            <span className="text-slate-500 dark:text-slate-400">
              {overall.solved} из {overall.total}
            </span>
          </div>
          <ProgressBar percent={overallPct} height="h-2" />
        </div>
      </Reveal>

      {/* По темам */}
      <Reveal delay={160}>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="mb-4 font-semibold">По темам</h2>
          <div className="space-y-4">
            {TOPICS.map((t) => {
              const p = progressMap.get(t.slug);
              const solved = p?.solved ?? 0;
              const total = p?.total ?? 0;
              const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
              return (
                <div key={t.slug}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2 font-medium">
                      <Icon
                        name={t.icon}
                        className="h-4 w-4 text-slate-400 dark:text-slate-500"
                      />
                      {t.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {solved}/{total}
                    </span>
                  </div>
                  <ProgressBar percent={pct} height="h-1.5" />
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* История попыток */}
      <Reveal delay={200}>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="border-b border-slate-100 px-5 py-4 font-semibold dark:border-slate-800">
            История попыток
          </h2>
          {attempts.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">
              Пока нет попыток.{" "}
              <Link
                href="/practice"
                className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Начни решать задачи →
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {attempts.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/task/${a.taskId}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {a.taskTitle}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {a.createdAt.replace("T", " ").slice(0, 16)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <Icon
                          name={RATING_META[a.selfRating as Rating].icon}
                          className="h-4 w-4"
                        />
                        {RATING_META[a.selfRating as Rating].label}
                      </span>
                      <DifficultyBadge difficulty={a.difficulty} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon,
  iconClass,
  suffix,
}: {
  value: ReactNode;
  label: string;
  icon?: string;
  iconClass?: string;
  suffix?: string;
}) {
  return (
    <div className="card-hover rounded-2xl border border-slate-200 bg-white/70 p-4 text-center backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
        {icon && <Icon name={icon} className={`h-5 w-5 ${iconClass ?? ""}`} />}
        {value}
        {suffix}
      </div>
      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}
