import EnableNotifications from '../../features/notifications/EnableNotifications'


export default function AdminSettings() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-saddle-brown">
          Settings
        </h1>

        <p className="mt-1 text-sm text-charcoal/70">
          Manage DD Cattle Company preferences for this device.
        </p>
      </div>

      <section
        className="
          rounded-xl
          border
          border-charcoal/10
          bg-white
          p-5
          shadow-sm
        "
      >
        <h2 className="font-serif text-xl font-semibold text-saddle-brown">
          Notifications
        </h2>

        <p className="mb-5 mt-1 text-sm text-charcoal/60">
          Manage reminder notifications for this device.
        </p>

        <EnableNotifications />
      </section>
    </div>
  )
}