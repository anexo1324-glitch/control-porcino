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
    const registration = await registerServiceWorker();
    if (registration) await subscribeUserToPush(registration);
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await registerServiceWorker();
        if (registration) await subscribeUserToPush(registration);
      }
      return permission === 'granted';
    } catch (error) {
      console.error('Error al solicitar permiso de notificación:', error);
      return false;
    }
  }

  return false;
}

/**
 * Registra el service worker PWA si está disponible.
 */
export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.error('Error al registrar el service worker:', error);
    return null;
  }
}

/**
 * Envía notificación push del navegador
 */
import { NOTIFICATION_TAGS } from './messages';

const VAPID_PUBLIC_KEY =
  'BM4cvz2BsuC6j1TPtUU49uDNL2bBe0n0tNuNQ2_IilZ4wMtR_NSLV8gCeCSF90_xRLWaRnwDcgT1RDB_jznclfg';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function savePushSubscription(subscription: PushSubscription) {
  try {
    await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'subscribe', subscription }),
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
  }
}

export async function subscribeUserToPush(registration: ServiceWorkerRegistration) {
  if (typeof window === 'undefined' || !registration.pushManager) {
    return null;
  }

  try {
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    await savePushSubscription(subscription);
    return subscription;
  } catch (error) {
    console.error('Error subcribing to push notifications:', error);
    return null;
  }
}

export async function sendServerPushNotification(
  title: string,
  body?: string,
  url = '/tareas',
  tag = NOTIFICATION_TAGS.PENDIENTES
) {
  try {
    await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'notify', title, body, url, tag }),
    });
  } catch (error) {
    console.error('Error sending server push notification:', error);
  }
}

export async function sendPushNotification(
  title: string,
  options?: NotificationOptions
) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/sw.js');
    if (registration?.showNotification) {
      await registration.showNotification(title, {
        icon: '/icon-192x192.png',
        data: { url: '/tareas', ...(options && (options as any).data) },
        tag: NOTIFICATION_TAGS.PENDIENTES,
        ...options,
      });
      return;
    }
  } catch (error) {
    console.error('Error usando service worker para notificación:', error);
  }

  new Notification(title, {
    icon: '/icon-192x192.png',
    data: { url: '/tareas', ...(options && (options as any).data) },
    tag: NOTIFICATION_TAGS.PENDIENTES,
    ...options,
  });
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
