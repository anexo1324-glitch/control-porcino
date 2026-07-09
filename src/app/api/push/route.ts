import { NextResponse } from 'next/server';
import webpush from 'web-push';

const VAPID_PUBLIC_KEY =
  'BM4cvz2BsuC6j1TPtUU49uDNL2bBe0n0tNuNQ2_IilZ4wMtR_NSLV8gCeCSF90_xRLWaRnwDcgT1RDB_jznclfg';
const VAPID_PRIVATE_KEY =
  'fxx_HDgLZeE_rZpDaRmtdbdZZggTivQtSvgVOlfebqk';
const VAPID_SUBJECT = 'mailto:admin@example.com';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

interface StoredPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

const subscriptions: StoredPushSubscription[] = [];

function isSameSubscription(
  a: StoredPushSubscription,
  b: StoredPushSubscription
) {
  return a.endpoint === b.endpoint;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const action = payload?.action;

  if (action === 'subscribe') {
    const subscription = payload.subscription;
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ success: false, error: 'Invalid subscription' }, { status: 400 });
    }

    if (!subscriptions.some((item) => isSameSubscription(item, subscription))) {
      subscriptions.push(subscription);
    }

    return NextResponse.json({ success: true, publicKey: VAPID_PUBLIC_KEY });
  }

  if (action === 'notify') {
    const title = payload?.title || 'Notificación';
    const body = payload?.body || '';
    const url = payload?.url || '/tareas';
    const tag = payload?.tag || 'pendiente-tareas';

    const results = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            subscription,
            JSON.stringify({ title, body, url, tag }),
            { vapidDetails: { subject: VAPID_SUBJECT, publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY } }
          );
          return { endpoint: subscription.endpoint, success: true };
        } catch (error: any) {
          if (error?.statusCode === 410 || error?.statusCode === 404) {
            return { endpoint: subscription.endpoint, success: false, remove: true };
          }
          return { endpoint: subscription.endpoint, success: false, error: error?.message || String(error) };
        }
      })
    );

    const activeSubscriptions = results
      .filter((result) => !result.remove)
      .map((result) => result.endpoint);

    if (activeSubscriptions.length !== subscriptions.length) {
      const remaining = subscriptions.filter((subscription) =>
        activeSubscriptions.includes(subscription.endpoint)
      );
      subscriptions.length = 0;
      subscriptions.push(...remaining);
    }

    return NextResponse.json({ success: true, results });
  }

  return NextResponse.json({ success: false, error: 'Action not supported' }, { status: 400 });
}
