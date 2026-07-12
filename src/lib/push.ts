import webpush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_CONTACT_EMAIL = process.env.VAPID_CONTACT_EMAIL || 'mailto:admin@example.com';

let isConfigured = false;

function configureWebPush() {
  if (!isConfigured) {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.warn('VAPID keys are missing. Web push notifications will not work.');
      return false;
    }
    webpush.setVapidDetails(
      VAPID_CONTACT_EMAIL,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );
    isConfigured = true;
  }
  return true;
}

export async function sendPushToSubscriptions(
  subscriptions: { id: string; endpoint: string; p256dh: string; auth: string }[],
  payload: { title: string; body: string; icon?: string; url?: string }
): Promise<{ successCount: number; failureCount: number; expiredIds: string[] }> {
  if (!configureWebPush()) {
    return { successCount: 0, failureCount: subscriptions.length, expiredIds: [] };
  }

  const payloadString = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png?v=2',
    data: {
      url: payload.url || '/',
    },
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payloadString
      ).then(() => sub.id) // Return the subscription ID on success
    )
  );

  let successCount = 0;
  let failureCount = 0;
  const expiredIds: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successCount++;
    } else {
      failureCount++;
      const error = result.reason;
      // 404 or 410 means the subscription is expired or invalid
      if (error && (error.statusCode === 404 || error.statusCode === 410)) {
        expiredIds.push(subscriptions[index].id);
      } else {
        console.error('Error sending push notification:', error);
      }
    }
  });

  return { successCount, failureCount, expiredIds };
}
