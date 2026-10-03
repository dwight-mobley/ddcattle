import { baseApi } from './baseApi';


export const medicalApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getMedicalRecords: builder.query({
            query: ({ page = 1, animal = '' } = {}) => ({
                url: 'medical/records/',
                params: {
                    page,
                    ...(animal ? { animal } : {}),
                },
            }),
            providesTags: (result) => {
                const records = Array.isArray(result)
                    ? result
                    : result?.results || [];

                return [
                    { type: 'MedicalRecord', id: 'LIST' },
                    ...records.map((record) => ({
                        type: 'MedicalRecord',
                        id: record.id,
                    })),
                ];
            },
        }),

        getMedicalRecordById: builder.query({
            query: (id) => `medical/records/${id}/`,
            providesTags: (result, error, id) => [
                { type: 'MedicalRecord', id },
            ],
        }),

        addMedicalRecord: builder.mutation({
            query: (body) => ({
                url: 'medical/records/',
                method: 'POST',
                body,
            }),
            invalidatesTags: [
                { type: 'MedicalRecord', id: 'LIST' },
            ],
        }),

        updateMedicalRecord: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `medical/records/${id}/`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'MedicalRecord', id },
                { type: 'MedicalRecord', id: 'LIST' },
            ],
        }),

        deleteMedicalRecord: builder.mutation({
            query: (id) => ({
                url: `medical/records/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'MedicalRecord', id },
                { type: 'MedicalRecord', id: 'LIST' },
            ],
        }),

    }),
});


export const {
    useGetMedicalRecordsQuery,
    useGetMedicalRecordByIdQuery,
    useAddMedicalRecordMutation,
    useUpdateMedicalRecordMutation,
    useDeleteMedicalRecordMutation,
} = medicalApi;