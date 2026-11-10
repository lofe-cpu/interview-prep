export interface Topic {
  slug: string;
  name: string;
  description: string;
  icon: string; // ключ для сопоставления с иконкой в components/icons.tsx
}

export const TOPICS: Topic[] = [
  {
    slug: "frontend",
    name: "JavaScript / Frontend",
    description: "Замыкания, асинхронность, React, TypeScript",
    icon: "code",
  },
  {
    slug: "backend",
    name: "Python / Backend",
    description: "API, асинхронность, FastAPI, Django",
    icon: "server",
  },
  {
    slug: "algorithms",
    name: "Алгоритмы и структуры данных",
    description: "Массивы, строки, деревья, графы",
    icon: "binary",
  },
  {
    slug: "sql",
    name: "SQL и базы данных",
    description: "Запросы, индексы, JOIN, нормализация",
    icon: "database",
  },
  {
    slug: "system-design",
    name: "System Design",
    description: "Масштабирование, кэш, очереди, архитектура",
    icon: "layers",
  },
  {
    slug: "ai",
    name: "AI / LLM-инженерия",
    description: "RAG, промпты, агенты, векторы",
    icon: "sparkles",
  },
];

export function getTopic(slug: string): Topic {
  return (
    TOPICS.find((t) => t.slug === slug) ?? {
      slug,
      name: slug,
      description: "",
      icon: "code",
    }
  );
}
