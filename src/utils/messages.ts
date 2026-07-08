export const APP_NAME = 'El Mirador';

export function tasksPendingMessage(count: number) {
  const title = `📌 ${count} tarea${count === 1 ? '' : 's'} pendientes — ${APP_NAME}`;
  const body = `Tienes ${count} tarea${count === 1 ? '' : 's'} pendientes por atender en ${APP_NAME}.`;
  return { title, body };
}

export const NOTIFICATION_TAGS = {
  PENDIENTES: 'pendiente-tareas',
};
