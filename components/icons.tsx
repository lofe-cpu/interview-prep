import {
  Braces,
  Server,
  Binary,
  Database,
  Layers,
  Sparkles,
  Check,
  BookOpen,
  RotateCcw,
  Flame,
  Trophy,
  Target,
  MessageCircle,
  BookOpenText,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  // темы
  code: Braces,
  server: Server,
  binary: Binary,
  database: Database,
  layers: Layers,
  sparkles: Sparkles,
  // оценки
  check: Check,
  book: BookOpen,
  rotate: RotateCcw,
  // разное
  flame: Flame,
  trophy: Trophy,
  target: Target,
  message: MessageCircle,
  guide: BookOpenText,
  sun: Sun,
  moon: Moon,
};

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? Braces;
  return <Cmp className={className} aria-hidden="true" />;
}
