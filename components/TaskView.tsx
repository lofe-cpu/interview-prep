"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import type { Task } from "@/data/tasks";
import type { Topic } from "@/data/topics";
import DifficultyBadge from "@/components/DifficultyBadge";
import { RATING_META, type Rating } from "@/lib/meta";
import { Icon } from "@/components/icons";

interface LastAttempt {
  answerText: string;
  answerCode: string;
  selfRating: Rating;
}

interface Sibling {
  id: string;
  title: string;
}

export default function TaskView({
  task,
  topicMeta,
  siblings,
  lastAttempt,
}: {
  task: Task;
  topicMeta: Topic;
  siblings: Sibling[];
  lastAttempt: LastAttempt | null;
}) {
  const router = useRouter();

  const [showMaterial, setShowMaterial] = useState(true);
  const [clarified, setClarified] = useState(0);
  const [answerText, setAnswerText] = useState(lastAttempt?.answerText ?? "");
  const [answerCode, setAnswerCode] = useState(lastAttempt?.answerCode ?? "");
  const [phase, setPhase] = useState<"writing" | "submitting" | "revealed">(
    "writing",
  );
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showMyAnswer, setShowMyAnswer] = useState(false);

  const nextTask = useMemo(() => {
    const others = siblings.filter((s) => s.id !== task.id);
    if (others.length === 0) return null;
    return others[Math.floor(Math.random() * others.length)];
  }, [siblings, task.id]);

  async function submit(skipContent = false) {
    setError("");
    setPhase("submitting");
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          answerText: skipContent ? "" : answerText,
          answerCode: skipContent ? "" : answerCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось сохранить попытку");
        setPhase("writing");
        return;
      }
      setAttemptId(data.attempt.id);
      setPhase("revealed");
    } catch {
      setError("Сетевая ошибка. Попробуйте ещё раз.");
      setPhase("writing");
    }
  }

  async function rate(value: Rating) {
    if (!attemptId) return;
    setRatingSaving(true);
    try {
      await fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: value }),
      });
      setRating(value);
      if (value === "solved") {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } else if (value === "with_material") {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } catch {
      setError("Не удалось сохранить оценку");
    } finally {
      setRatingSaving(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(task.modelCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  function goNext() {
    if (nextTask) router.push(`/task/${nextTask.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Шапка */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/practice?topic=${task.topic}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <Icon name={topicMeta.icon} className="h-4 w-4" />
            {topicMeta.name}
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {task.title}
          </h1>
        </div>
        <DifficultyBadge difficulty={task.difficulty} />
      </div>

      {/* Материал */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={() => setShowMaterial((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-left"
        >
          <span className="inline-flex items-center gap-2 font-semibold">
            <Icon name="guide" className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            Материал
          </span>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {showMaterial ? "Скрыть" : "Показать"}
          </span>
        </button>
        {showMaterial && (
          <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              {task.material}
            </p>
          </div>
        )}
      </section>

      {/* Задача */}
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Задача
        </h2>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed">
          {task.description}
        </p>

        {task.requirements.length > 0 && (
          <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            {task.requirements.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="mt-0.5 text-slate-300 dark:text-slate-600">—</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Уточнения */}
      {clarified < task.clarifyingQuestions.length && (
        <div className="mt-4">
          <button
            onClick={() => setClarified((c) => c + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
          >
            <Icon name="message" className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            Наводящий вопрос
          </button>
        </div>
      )}

      {clarified > 0 && (
        <div className="mt-3 space-y-2">
          {task.clarifyingQuestions.slice(0, clarified).map((q, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/50"
            >
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Вопрос:{" "}
              </span>
              {q}
            </div>
          ))}
        </div>
      )}

      {/* Форма ответа */}
      {phase !== "revealed" ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          {lastAttempt && (
            <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              Есть сохранённая попытка ({RATING_META[lastAttempt.selfRating].label})
              — она подставлена ниже.
            </p>
          )}

          <label className="mb-1 block text-sm font-medium" htmlFor="answer">
            Объясни свой подход
          </label>
          <textarea
            id="answer"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            rows={5}
            placeholder="Опиши, как ты рассуждаешь и какое решение предлагаешь…"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-slate-500"
          />

          <label className="mb-1 mt-4 block text-sm font-medium" htmlFor="code">
            Код
          </label>
          <textarea
            id="code"
            value={answerCode}
            onChange={(e) => setAnswerCode(e.target.value)}
            rows={10}
            spellCheck={false}
            placeholder="// напиши решение на любом языке"
            className="code-scroll w-full resize-y rounded-lg border border-slate-200 bg-slate-900 px-3 py-2.5 font-mono text-sm text-slate-100 outline-none focus:border-slate-500 dark:border-slate-700"
          />

          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => submit(false)}
              disabled={phase === "submitting"}
              className="btn btn-primary px-5 py-2.5 text-sm disabled:opacity-60"
            >
              {phase === "submitting" ? "Сохраняю…" : "Отправить решение"}
            </button>
            <button
              onClick={() => submit(true)}
              disabled={phase === "submitting"}
              className="btn btn-secondary px-4 py-2.5 text-sm disabled:opacity-60"
            >
              Не знаю — показать разбор
            </button>
          </div>
        </div>
      ) : (
        <RevealSection
          task={task}
          myText={answerText}
          myCode={answerCode}
          showMyAnswer={showMyAnswer}
          setShowMyAnswer={setShowMyAnswer}
          rating={rating}
          ratingSaving={ratingSaving}
          onRate={rate}
          copied={copied}
          onCopy={copyCode}
          onNext={goNext}
          nextTitle={nextTask?.title ?? null}
        />
      )}
    </div>
  );
}

function RevealSection({
  task,
  myText,
  myCode,
  showMyAnswer,
  setShowMyAnswer,
  rating,
  ratingSaving,
  onRate,
  copied,
  onCopy,
  onNext,
  nextTitle,
}: {
  task: Task;
  myText: string;
  myCode: string;
  showMyAnswer: boolean;
  setShowMyAnswer: (v: boolean) => void;
  rating: Rating | null;
  ratingSaving: boolean;
  onRate: (r: Rating) => void;
  copied: boolean;
  onCopy: () => void;
  onNext: () => void;
  nextTitle: string | null;
}) {
  return (
    <div className="animate-fade-up mt-4 space-y-4">
      {/* Твой ответ */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={() => setShowMyAnswer(!showMyAnswer)}
          className="flex w-full items-center justify-between px-5 py-3.5 text-left font-semibold"
        >
          Твой ответ
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            {showMyAnswer ? "Скрыть" : "Показать"}
          </span>
        </button>
        {showMyAnswer && (
          <div className="space-y-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            {myText.trim() ? (
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                {myText}
              </p>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                (без объяснения)
              </p>
            )}
            {myCode.trim() ? (
              <pre className="code-scroll overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-sm text-slate-100">
                {myCode}
              </pre>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">(без кода)</p>
            )}
          </div>
        )}
      </div>

      {/* Эталонный ответ */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 font-semibold">
            <Icon name="check" className="h-4 w-4 text-emerald-500" />
            Эталонный ответ
          </h2>
          <button
            onClick={onCopy}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {copied ? "Скопировано" : "Копировать код"}
          </button>
        </div>

        <p className="mt-3 whitespace-pre-wrap leading-relaxed">
          {task.modelAnswer}
        </p>

        {task.modelCode && (
          <pre className="code-scroll mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-sm leading-relaxed text-slate-100">
            {task.modelCode}
          </pre>
        )}
      </div>

      {/* Самопроверка */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold">Как оцениваешь свой результат?</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(RATING_META) as Rating[]).map((r) => (
            <button
              key={r}
              onClick={() => onRate(r)}
              disabled={ratingSaving}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
                rating === r
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              }`}
            >
              <Icon name={RATING_META[r].icon} className="h-4 w-4" />
              {RATING_META[r].label}
            </button>
          ))}
        </div>
        {rating && (
          <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Сохранено. Отличная работа!
          </p>
        )}
      </div>

      {/* Навигация */}
      <div className="flex flex-wrap items-center gap-3">
        {nextTitle && (
          <button
            onClick={onNext}
            className="btn btn-primary px-5 py-2.5 text-sm"
          >
            Следующая задача →
          </button>
        )}
        <Link
          href={`/practice?topic=${task.topic}`}
          className="btn btn-secondary px-5 py-2.5 text-sm"
        >
          К списку задач
        </Link>
      </div>
    </div>
  );
}
