export function tasksPendingMessage(count: number) {
  const title = `🐷 ${count} tarea${count === 1 ? "" : "s"} pendiente${count === 1 ? "" : "s"}`;
  const body = `Tienes ${count} tarea${count === 1 ? "" : "s"} pendiente${count === 1 ? "" : "s"} por atender.`;

  return { title, body };
}

export const NOTIFICATION_TAGS = {
  PENDIENTES: "pendiente-tareas",
};