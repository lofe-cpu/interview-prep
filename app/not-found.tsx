import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500">
        <Icon name="target" className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Задача не найдена
      </h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Возможно, ссылка устарела или задача была удалена.
      </p>
      <Link
        href="/practice"
        className="btn btn-primary mt-6 px-5 py-2.5 text-sm"
      >
        ← К задачам
      </Link>
    </div>
  );
}
