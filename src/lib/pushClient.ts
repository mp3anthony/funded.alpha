// Helper utility for client-side push notification subscription management

export function isStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || 
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         (window.navigator as any).standalone === true;
}

export function isPushSupported() {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export function getPushPermissionState(): NotificationPermission {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';
  return await Notification.requestPermission();
}

/**
 * Helper function to convert a Base64-URL string to a Uint8Array.
 * Used for converting the VAPID public key.
 */
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush() {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  const permission = await requestPushPermission();
  if (permission !== 'granted') {
    throw new Error('Push notification permission denied.');
  }

  const registration = await navigator.serviceWorker.ready;
  
  // Check if we already have a subscription
  let subscription = await registration.pushManager.getSubscription();

  // If we don't, subscribe with the public key
  if (!subscription) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      throw new Error('VAPID public key is missing.');
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  // Send the subscription to our backend API route
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error('Failed to save push subscription to the server.');
  }

  return subscription;
}
