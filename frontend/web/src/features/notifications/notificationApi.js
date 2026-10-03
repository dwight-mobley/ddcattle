import { baseApi } from '../api/baseApi'

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerPushSubscription: builder.mutation({
      query: (subscription) => ({
        url: 'notifications/subscriptions/',
        method: 'POST',
        body: subscription,
      }),
    }),

    getPushSubscriptions: builder.query({
      query: () => 'notifications/subscriptions/',
    }),

    deletePushSubscription: builder.mutation({
      query: (id) => ({
        url: `notifications/subscriptions/${id}/`,
        method: 'DELETE',
      }),
    }),
  }),
})

export const {
  useRegisterPushSubscriptionMutation,
  useGetPushSubscriptionsQuery,
  useDeletePushSubscriptionMutation,
} = notificationApi