import { baseApi } from './baseApi';

const rows = data => Array.isArray(data) ? data : data?.results || [];
export const mediaApiSlice = baseApi.injectEndpoints({
    endpoints: builder => ({
        uploadMedia: builder.mutation({
            query: body => ({ url: 'media/', method: 'POST', body }),
            invalidatesTags: (result, error) => error ? [] : ['Media', 'Animal'],
        }),
        getMedia: builder.query({
            // Retains support for existing useGetMediaQuery(animalId) callers.
            query: arg => ({
                url: 'media/',
                params: arg && typeof arg === 'object' ? arg : arg ? { animal: arg } : {},
            }),
            providesTags: result => [
                ...rows(result).map(({ id }) => ({ type: 'Media', id })),
                { type: 'Media', id: 'LIST' },
            ],
        }),
        deleteMedia: builder.mutation({
            query: id => ({ url: `media/${id}/`, method: 'DELETE' }),
            invalidatesTags: (result, error, id) => error ? [] : [
                { type: 'Media', id }, { type: 'Media', id: 'LIST' }, 'Animal',
            ],
        }),
    }),
});
export const { useUploadMediaMutation, useGetMediaQuery, useDeleteMediaMutation } = mediaApiSlice;
