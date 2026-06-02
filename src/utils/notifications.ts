/**
 * Sistema de notificaciones: Toast + Push
 */

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

/**
 * Solicita permiso para notificaciones push del navegador
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error al solicitar permiso de notificación:', error);
      return false;
    }
  }

  return false;
}

/**
 * Envía notificación push del navegador
 */
export function sendPushNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192x192.png',
      ...options,
    });
  }
}

/**
 * Mapea tipo de alerta a configuración de notificación
 */
export function getNotificationConfig(prioridad: string) {
  const configs: Record<string, { bgColor: string; icon: string; sound: boolean }> = {
    critica: {
      bgColor: 'bg-red-600',
      icon: '🔴',
      sound: true,
    },
    alta: {
      bgColor: 'bg-orange-500',
      icon: '🟠',
      sound: true,
    },
    media: {
      bgColor: 'bg-yellow-500',
      icon: '🟡',
      sound: false,
    },
    baja: {
      bgColor: 'bg-blue-500',
      icon: '🔵',
      sound: false,
    },
  };

  return configs[prioridad] || configs.baja;
}
