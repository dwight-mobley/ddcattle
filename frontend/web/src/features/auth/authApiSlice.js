import { baseApi } from '../api/baseApi'; // Adjust the import path

export const authApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'token/', // Appends to 'http://localhost:8000/api/' from your baseApi
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

// RTK Query automatically generates a React hook based on the endpoint name
export const { useLoginMutation } = authApiSlice;