"use client";

import { useEffect, useRef, useState } from "react";

export default function ProgressBar({
  percent,
  className = "bg-gradient-to-r from-indigo-500 to-violet-500",
  height = "h-2",
}: {
  percent: number;
  className?: string;
  height?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // небольшая задержка, чтобы transition успел примениться
          requestAnimationFrame(() =>
            requestAnimationFrame(() => setWidth(percent)),
          );
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [percent]);

  return (
    <div
      ref={ref}
      className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${height}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-1000 ease-out ${className}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
