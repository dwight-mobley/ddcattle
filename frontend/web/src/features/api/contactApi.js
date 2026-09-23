import { baseApi } from "../api/baseApi";

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendContactMessage: builder.mutation({
      query: (data) => ({
        url: 'contact/', // Points to a generic /api/contact/ route
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useSendContactMessageMutation } = contactApi;