import { DIFFICULTY_META } from "@/lib/meta";
import type { Difficulty } from "@/data/tasks";

export default function DifficultyBadge({
  difficulty,
}: {
  difficulty: Difficulty;
}) {
  const m = DIFFICULTY_META[difficulty];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${m.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}
