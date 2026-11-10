import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getLatestAttemptForTask,
  getTask,
  listTasks,
} from "@/lib/db";
import { getTopic } from "@/data/topics";
import TaskView from "@/components/TaskView";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const task = getTask(id);
  if (!task) notFound();

  const topicMeta = getTopic(task.topic);
  const siblings = listTasks(task.topic).map((t) => ({
    id: t.id,
    title: t.title,
  }));

  const lastAttempt = getLatestAttemptForTask(user.id, id);

  return (
    <TaskView
      task={task}
      topicMeta={topicMeta}
      siblings={siblings}
      lastAttempt={
        lastAttempt
          ? {
              answerText: lastAttempt.answerText,
              answerCode: lastAttempt.answerCode,
              selfRating: lastAttempt.selfRating,
            }
          : null
      }
    />
  );
}
