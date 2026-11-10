import type { Difficulty } from "@/data/tasks";

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; badge: string; dot: string }
> = {
  easy: {
    label: "Лёгкая",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-emerald-500",
  },
  medium: {
    label: "Средняя",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-amber-500",
  },
  hard: {
    label: "Сложная",
    badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    dot: "bg-rose-500",
  },
};

export type Rating = "solved" | "with_material" | "unsolved";

export const RATING_META: Record<Rating, { label: string; icon: string }> = {
  solved: { label: "Решил сам", icon: "check" },
  with_material: { label: "С материалом", icon: "book" },
  unsolved: { label: "Не решил", icon: "rotate" },
};
