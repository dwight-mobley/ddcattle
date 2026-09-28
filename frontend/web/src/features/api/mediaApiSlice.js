import { baseApi } from './baseApi'; 

export const mediaApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadMedia: builder.mutation({
      query: (formData) => ({
        url: '/media/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Media', 'Animal'],
    }),
    getMedia: builder.query({
      query: (animalId) => `/media/${animalId ? `?animal=\${animalId}` : ''}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Media', id })),
              { type: 'Media', id: 'LIST' },
            ]
          : [{ type: 'Media', id: 'LIST' }],
    }),
    deleteMedia: builder.mutation({
      query: (id) => ({
        url: `/media/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Media', id }],
    }),
  }),
});

// Export the hooks exactly as BulkMediaUploader expects them
export const {
  useUploadMediaMutation,
  useGetMediaQuery,
  useDeleteMediaMutation,
} = mediaApiSlice;
