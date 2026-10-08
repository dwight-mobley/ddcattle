import { baseApi } from './baseApi';

const refresh = (result, error) => error ? [] : ['Training', 'Animal', 'Media'];
export const trainingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getTrainingAccess: builder.query({ query: slug => `animals/${slug}/training-access/`, providesTags: ['Training'] }),
    getTrainingRecords: builder.query({ query: ({ kind, ...params }) => ({ url: `training/${kind}/`, params }), providesTags: ['Training'] }),
    getTrainingLocations: builder.query({ query: () => 'training/locations/', providesTags: ['Training'] }),
    getTrainingSkills: builder.query({ query: () => 'training/skills/', providesTags: ['Training'] }),
    getTrainingProgress: builder.query({ query: params => ({ url: 'training/progress/', params }), providesTags: ['Training'] }),
    getTrainingChecklist: builder.query({ query: slug => `animals/${slug}/training-checklist/`, providesTags: ['Training'] }),
    getTrainingRating: builder.query({ query: slug => `animals/${slug}/training-rating/`, providesTags: ['Training'] }),
    saveTrainingRecord: builder.mutation({ query: ({ kind, id, body }) => ({ url: `training/${kind}/${id ? `${id}/` : ''}`, method: id ? 'PATCH' : 'POST', body }), invalidatesTags: refresh }),
    deleteTrainingRecord: builder.mutation({ query: ({ kind, id }) => ({ url: `training/${kind}/${id}/`, method: 'DELETE' }), invalidatesTags: refresh }),
    getActivityMedia: builder.query({ query: ({ kind, id }) => `training/${kind}/${id}/media/`, providesTags: result => [{ type: 'Media', id: 'LIST' }, ...(result || []).map(item => ({ type: 'Media', id: item.id }))] }),
    uploadActivityMedia: builder.mutation({ query: ({ kind, id, body }) => ({ url: `training/${kind}/${id}/media/`, method: 'POST', body }), invalidatesTags: refresh }),
  }),
});
export const { useGetTrainingAccessQuery, useGetTrainingRecordsQuery, useGetTrainingLocationsQuery, useGetTrainingSkillsQuery, useGetTrainingProgressQuery, useGetTrainingRatingQuery, useGetTrainingChecklistQuery, useSaveTrainingRecordMutation, useDeleteTrainingRecordMutation, useGetActivityMediaQuery, useUploadActivityMediaMutation } = trainingApi;
