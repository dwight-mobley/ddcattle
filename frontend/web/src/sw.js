/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  let data = {
    title: 'DD Cattle Company',
    body: 'You have a new notification.',
    url: '/',
  }

  if (event.data) {
    try {
      data = {
        ...data,
        ...event.data.json(),
      }
    } catch {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',

    data: {
      url: data.url || '/',
    },
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      options
    )
  )
})


self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {

      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }

      return clients.openWindow(url)
    })
  )
})