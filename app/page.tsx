import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  getOverallProgress,
  getStreak,
  getTopicProgress,
  listAttemptsByUser,
} from "@/lib/db";
import { TOPICS } from "@/data/topics";
import TopicCard from "@/components/TopicCard";
import DifficultyBadge from "@/components/DifficultyBadge";
import { RATING_META, type Rating } from "@/lib/meta";
import { Icon } from "@/components/icons";

export default async function HomePage() {
  const user = await getCurrentUser();

  let overall = { solved: 0, total: 0 };
  let streak = { current: 0, longest: 0, lastActivityDate: null as string | null };
  let topicProgressMap = new Map<string, { solved: number; total: number }>();
  let recent: {
    id: number;
    taskId: string;
    taskTitle: string;
    topic: string;
    difficulty: "easy" | "medium" | "hard";
    selfRating: Rating;
    createdAt: string;
  }[] = [];

  if (user) {
    overall = getOverallProgress(user.id);
    streak = getStreak(user.id);
    for (const p of getTopicProgress(user.id)) {
      topicProgressMap.set(p.topic, { solved: p.solved, total: p.total });
    }
    recent = listAttemptsByUser(user.id, 5).map((a) => ({
      id: a.id,
      taskId: a.taskId,
      taskTitle: a.taskTitle,
      topic: a.topic,
      difficulty: a.difficulty,
      selfRating: a.selfRating,
      createdAt: a.createdAt,
    }));
  }

  return (
    <div>
      {/* Hero */}
      <section className="py-10 sm:py-14">
        <h1 className="mx-auto max-w-2xl text-center text-4xl font-bold tracking-tight sm:text-5xl">
          Тренажёр технических собеседований
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-lg text-slate-500 dark:text-slate-400">
          Изучай материал, решай задачи, получай уточнения и следи за прогрессом.
        </p>

        {user ? (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/practice"
              className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Продолжить тренировку
            </Link>
            <Link
              href="/progress"
              className="rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Мой прогресс
            </Link>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Начать бесплатно
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              У меня есть аккаунт
            </Link>
          </div>
        )}

        {user && (
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
                <Icon name="flame" className="h-5 w-5 text-orange-500" />
                {streak.current}
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                дней подряд
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="text-2xl font-bold">
                {overall.solved}
                <span className="text-base font-medium text-slate-400 dark:text-slate-500">
                  /{overall.total}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                задач решено
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold">
                <Icon name="trophy" className="h-5 w-5 text-amber-500" />
                {streak.longest}
              </div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                рекорд стрика
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Темы */}
      <section className="mt-2">
        <h2 className="text-xl font-bold tracking-tight">Темы</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => {
            const p = topicProgressMap.get(t.slug);
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
      </section>

      {/* Последние попытки */}
      {user && recent.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-tight">Последние попытки</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/task/${a.taskId}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{a.taskTitle}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        {a.createdAt.replace("T", " ").slice(0, 16)}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <Icon
                          name={RATING_META[a.selfRating].icon}
                          className="h-4 w-4"
                        />
                        {RATING_META[a.selfRating].label}
                      </span>
                      <DifficultyBadge difficulty={a.difficulty} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
