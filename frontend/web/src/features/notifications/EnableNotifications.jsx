import { useEffect, useState } from 'react'

import { useRegisterPushSubscriptionMutation } from './notificationApi'
import { urlBase64ToUint8Array } from './utils'


export default function EnableNotifications() {
  const [permission, setPermission] = useState(
    'Notification' in window
      ? Notification.permission
      : 'unsupported'
  )

  const [isSubscribed, setIsSubscribed] = useState(false)
  const [message, setMessage] = useState('')

  const [
    registerPushSubscription,
    { isLoading }
  ] = useRegisterPushSubscriptionMutation()


  async function syncSubscription(subscription) {
    const subscriptionJson = subscription.toJSON()

    await registerPushSubscription({
      endpoint: subscription.endpoint,
      p256dh: subscriptionJson.keys?.p256dh,
      auth: subscriptionJson.keys?.auth,
      device_name: getDeviceName(),
    }).unwrap()
  }


  useEffect(() => {
    async function checkSubscription() {
      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window)
      ) {
        return
      }

      try {
        const registration =
          await navigator.serviceWorker.ready

        const subscription =
          await registration.pushManager.getSubscription()

        if (subscription) {
          // Browser already has a subscription.
          // Make sure Django has the same subscription.
          await syncSubscription(subscription)

          setIsSubscribed(true)
        } else {
          setIsSubscribed(false)
        }
      } catch (error) {
        console.error(
          'Unable to check push subscription:',
          error
        )

        setIsSubscribed(false)
      }
    }

    checkSubscription()
  }, [])


  async function enableNotifications() {
    setMessage('')

    try {
      if (
        !('Notification' in window) ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window)
      ) {
        setMessage(
          'Push notifications are not supported by this browser.'
        )
        return
      }

      const result =
        await Notification.requestPermission()

      setPermission(result)

      if (result !== 'granted') {
        setMessage(
          'Notification permission was not granted.'
        )
        return
      }

      const registration =
        await navigator.serviceWorker.ready

      let subscription =
        await registration.pushManager.getSubscription()

      if (!subscription) {
        const vapidPublicKey =
          import.meta.env.VITE_VAPID_PUBLIC_KEY

        if (!vapidPublicKey) {
          throw new Error(
            'VITE_VAPID_PUBLIC_KEY is not configured.'
          )
        }

        subscription =
          await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey:
              urlBase64ToUint8Array(vapidPublicKey),
          })
      }

      await syncSubscription(subscription)

      setIsSubscribed(true)

      setMessage(
        'Notifications are enabled on this device.'
      )
    } catch (error) {
      console.error(
        'Unable to enable notifications:',
        error
      )

      setMessage(
        'Unable to enable notifications on this device.'
      )
    }
  }


  if (permission === 'unsupported') {
    return (
      <p className="text-sm text-charcoal/70">
        Device notifications are not supported by this browser.
      </p>
    )
  }


  if (permission === 'denied') {
    return (
      <div>
        <p className="font-medium text-rust">
          Notifications are blocked
        </p>

        <p className="mt-1 text-sm text-charcoal/70">
          Enable notifications for DD Cattle Company in your
          browser's site settings to receive device reminders.
        </p>
      </div>
    )
  }


  if (isSubscribed) {
    return (
      <div>
        <p className="font-medium text-sage">
          Notifications enabled
        </p>

        <p className="mt-1 text-sm text-charcoal/70">
          This device can receive DD Cattle Company reminders.
        </p>
      </div>
    )
  }


  return (
    <div>
      <button
        type="button"
        onClick={enableNotifications}
        disabled={isLoading}
        className="
          rounded-lg
          bg-saddle-brown
          px-4
          py-2
          font-medium
          text-white
          transition
          hover:opacity-90
          disabled:opacity-50
        "
      >
        {isLoading
          ? 'Enabling...'
          : 'Enable Notifications'}
      </button>

      {message && (
        <p className="mt-2 text-sm text-charcoal/70">
          {message}
        </p>
      )}
    </div>
  )
}


function getDeviceName() {
  const platform =
    navigator.userAgentData?.platform ||
    navigator.platform ||
    'Unknown device'

  return `${platform} browser`
}