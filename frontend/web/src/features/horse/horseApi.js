import { baseApi } from '../api/baseApi';

export const horsesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHorses: builder.query({
      query: () => 'horses/',
      providesTags: ['Horse'],
    }),
    getHorseBySlug: builder.query({
      query: (slug) => `horses/${slug}/`,
      providesTags: ['Horse'],
    }),
    addHorse: builder.mutation({
      query: (initialHorse) => ({
        url: 'horses/',
        method: 'POST',
        body: initialHorse,
      }),
      invalidatesTags: ['Horse'],
    }),
  }),
  overrideExisting: false,
});

// Export hooks specifically for this feature
export const { useGetHorsesQuery, useGetHorseBySlugQuery, useAddHorseMutation } = horsesApi;