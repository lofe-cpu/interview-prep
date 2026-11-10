import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getSolvedTaskIds,
  getTopicProgress,
  listTasks,
} from "@/lib/db";
import { TOPICS, getTopic } from "@/data/topics";
import TopicCard from "@/components/TopicCard";
import DifficultyBadge from "@/components/DifficultyBadge";
import { Icon } from "@/components/icons";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { topic } = await searchParams;
  const activeTopic = topic && TOPICS.some((t) => t.slug === topic) ? topic : null;

  const solvedIds = getSolvedTaskIds(user.id);
  const topicProgress = new Map(
    getTopicProgress(user.id).map((p) => [p.topic, { solved: p.solved, total: p.total }]),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Практика</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Выбирай тему и решай задачи — как на настоящем собеседовании.
        </p>
      </div>

      {/* Чипы тем */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/practice"
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            !activeTopic
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
          }`}
        >
          Все темы
        </Link>
        {TOPICS.map((t) => (
          <Link
            key={t.slug}
            href={`/practice?topic=${t.slug}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeTopic === t.slug
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
            }`}
          >
            {t.name}
          </Link>
        ))}
      </div>

      {activeTopic ? (
        <TopicTaskList topic={activeTopic} solvedIds={solvedIds} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => {
            const p = topicProgress.get(t.slug);
            return (
              <TopicCard
                key={t.slug}
                slug={t.slug}
                solved={p?.solved}
                total={p?.total}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TopicTaskList({
  topic,
  solvedIds,
}: {
  topic: string;
  solvedIds: Set<string>;
}) {
  const meta = getTopic(topic);
  const tasks = listTasks(topic);
  const solved = tasks.filter((t) => solvedIds.has(t.id)).length;

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <Icon name={meta.icon} className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold">{meta.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Решено {solved} из {tasks.length}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {tasks.map((t) => {
            const isSolved = solvedIds.has(t.id);
            return (
              <li key={t.id}>
                <Link
                  href={`/task/${t.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                        isSolved
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      }`}
                    >
                      {isSolved ? "✓" : "·"}
                    </span>
                    <span className="truncate font-medium">{t.title}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <DifficultyBadge difficulty={t.difficulty} />
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {isSolved ? "Повторить" : "Решить"} →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
