import { useEffect, useState } from 'react'

import {
  useDeletePushSubscriptionMutation,
  useGetPushSubscriptionsQuery,
  useRegisterPushSubscriptionMutation,
} from './notificationApi'

import { urlBase64ToUint8Array } from './utils'


export default function EnableNotifications() {
  const supported =
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window

  const [permission, setPermission] = useState(
    supported
      ? Notification.permission
      : 'unsupported'
  )

  const [browserSubscription, setBrowserSubscription] =
    useState(null)

  const [message, setMessage] = useState('')

  const {
    data: serverSubscriptions = [],
    refetch: refetchSubscriptions,
  } = useGetPushSubscriptionsQuery(undefined, {
    skip: !supported,
  })

  const [
    registerPushSubscription,
    { isLoading: isEnabling },
  ] = useRegisterPushSubscriptionMutation()

  const [
    deletePushSubscription,
    { isLoading: isDisabling },
  ] = useDeletePushSubscriptionMutation()


  async function syncSubscription(subscription) {
    const subscriptionJson = subscription.toJSON()

    await registerPushSubscription({
      endpoint: subscription.endpoint,
      p256dh: subscriptionJson.keys?.p256dh,
      auth: subscriptionJson.keys?.auth,
      device_name: getDeviceName(),
    }).unwrap()

    await refetchSubscriptions()
  }


  useEffect(() => {
    if (!supported) {
      return
    }

    async function checkSubscription() {
      try {
        const registration =
          await navigator.serviceWorker.ready

        const subscription =
          await registration.pushManager.getSubscription()

        setBrowserSubscription(subscription)

        if (subscription) {
          // Browser already has a subscription.
          // Make sure Django has the same subscription.
          await syncSubscription(subscription)
        }
      } catch (error) {
        console.error(
          'Unable to check push subscription:',
          error
        )
      }
    }

    checkSubscription()
  }, [])


  async function enableNotifications() {
    setMessage('')

    try {
      if (!supported) {
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

      setBrowserSubscription(subscription)

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


  async function disableNotifications() {
    setMessage('')

    try {
      if (!browserSubscription) {
        return
      }

      // Find the Django record that belongs to this
      // browser's push subscription.
      const serverSubscription =
        serverSubscriptions.find(
          (subscription) =>
            subscription.endpoint ===
            browserSubscription.endpoint
        )

      // Remove the Django subscription first.
      if (serverSubscription) {
        await deletePushSubscription(
          serverSubscription.id
        ).unwrap()
      }

      // Then unsubscribe this browser/device.
      await browserSubscription.unsubscribe()

      setBrowserSubscription(null)

      await refetchSubscriptions()

      setMessage(
        'Notifications are disabled on this device.'
      )
    } catch (error) {
      console.error(
        'Unable to disable notifications:',
        error
      )

      setMessage(
        'Unable to disable notifications on this device.'
      )
    }
  }


  if (!supported || permission === 'unsupported') {
    return (
      <div>
        <p className="font-medium text-charcoal">
          Push Notifications
        </p>

        <p className="mt-1 text-sm text-charcoal/70">
          Push notifications are not supported by this browser.
        </p>
      </div>
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


  if (browserSubscription) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <span
            className="
              h-2.5
              w-2.5
              rounded-full
              bg-sage
            "
          />

          <p className="font-medium text-charcoal">
            Notifications enabled
          </p>
        </div>

        <p className="mt-2 text-sm text-charcoal/70">
          This device can receive DD Cattle Company reminders.
        </p>

        <p className="mt-1 text-xs text-charcoal/50">
          {getDeviceName()}
        </p>

        <button
          type="button"
          onClick={disableNotifications}
          disabled={isDisabling}
          className="
            mt-4
            rounded-lg
            border
            border-rust
            px-4
            py-2
            text-sm
            font-medium
            text-rust
            transition
            hover:bg-rust
            hover:text-white
            disabled:opacity-50
          "
        >
          {isDisabling
            ? 'Disabling...'
            : 'Disable Notifications'}
        </button>

        {message && (
          <p className="mt-2 text-sm text-charcoal/70">
            {message}
          </p>
        )}
      </div>
    )
  }


  return (
    <div>
      <p className="font-medium text-charcoal">
        Notifications are not enabled
      </p>

      <p className="mt-1 text-sm text-charcoal/70">
        Enable push notifications to receive upcoming, due,
        and overdue reminder notifications on this device.
      </p>

      <button
        type="button"
        onClick={enableNotifications}
        disabled={isEnabling}
        className="
          mt-4
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
        {isEnabling
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