import Link from "next/link";
import { getTopic } from "@/data/topics";
import { Icon } from "@/components/icons";

export default function TopicCard({
  slug,
  solved,
  total,
}: {
  slug: string;
  solved?: number;
  total?: number;
}) {
  const t = getTopic(slug);
  const hasProgress = typeof total === "number" && total > 0;
  const pct = hasProgress ? Math.round(((solved ?? 0) / total) * 100) : 0;

  return (
    <Link
      href={`/practice?topic=${slug}`}
      className="group card-hover block rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-violet-500 group-hover:text-white dark:border-slate-700 dark:text-slate-300">
        <Icon name={t.icon} className="h-5 w-5" />
      </div>

      <h3 className="mt-4 font-semibold leading-snug">{t.name}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {t.description}
      </p>

      {hasProgress ? (
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              {solved}/{total} решено
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {pct}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-5 text-sm font-medium text-indigo-600 group-hover:underline dark:text-indigo-400">
          Начать →
        </p>
      )}
    </Link>
  );
}
