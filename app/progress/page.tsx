import Link from "next/link";
import { redirect } from "next/navigation";
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
      <h1 className="text-2xl font-bold tracking-tight">Твой прогресс</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Привет, {user.name}. Так держать.
      </p>

      {/* Статистика */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon="flame"
          iconClass="text-orange-500"
          value={String(streak.current)}
          label="дней подряд"
        />
        <StatCard
          icon="trophy"
          iconClass="text-amber-500"
          value={String(streak.longest)}
          label="рекорд стрика"
        />
        <StatCard
          value={`${overall.solved}/${overall.total}`}
          label="задач решено"
        />
        <StatCard value={`${overallPct}%`} label="общий прогресс" />
      </div>

      {/* Общий прогресс-бар */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">Общий прогресс</span>
          <span className="text-slate-500 dark:text-slate-400">
            {overall.solved} из {overall.total}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-slate-900 transition-all dark:bg-white"
            style={{ width: `${overallPct}%` }}
          />
        </div>
      </div>

      {/* По темам */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
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
                    <Icon name={t.icon} className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    {t.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {solved}/{total}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all dark:bg-white"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* История попыток */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
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
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
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
    </div>
  );
}

function StatCard({
  value,
  label,
  icon,
  iconClass,
}: {
  value: string;
  label: string;
  icon?: string;
  iconClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
        {icon && <Icon name={icon} className={`h-5 w-5 ${iconClass ?? ""}`} />}
        {value}
      </div>
      <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {label}
      </div>
    </div>
  );
}
