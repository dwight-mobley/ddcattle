import { baseApi } from './baseApi';

// Same authenticated baseQuery, reducer and middleware as the animal endpoints.
export const reminderApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReminderOptions: builder.query({
            query: () => ({ url: 'reminders/', method: 'OPTIONS' }),
        }),
        getReminders: builder.query({
            query: (params = {}) => ({ url: 'reminders/', params }),
            providesTags: ['Reminder'],
        }),
        getReminderById: builder.query({
            query: (id) => `reminders/${id}/`,
            providesTags: (result, error, id) => [{ type: 'Reminder', id }],
        }),
        addReminder: builder.mutation({
            query: (body) => ({ url: 'reminders/', method: 'POST', body }),
            invalidatesTags: (result, error) => error ? [] : ['Reminder'],
        }),
        bulkAddReminders: builder.mutation({
            query: (body) => ({
                url: 'reminders/bulk-create/',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error) => error ? [] : ['Reminder'],
        }),
        updateReminder: builder.mutation({
            query: ({ id, ...body }) => ({ url: `reminders/${id}/`, method: 'PATCH', body }),
            invalidatesTags: (result, error) => error ? [] : ['Reminder'],
        }),
        deleteReminder: builder.mutation({
            query: (id) => ({ url: `reminders/${id}/`, method: 'DELETE' }),
            invalidatesTags: (result, error) => error ? [] : ['Reminder'],
        }),
        completeReminder: builder.mutation({
            query: ({ id, ...body }) => ({ url: `reminders/${id}/complete/`, method: 'POST', body }),
            invalidatesTags: (result, error) => error ? [] : ['Reminder', 'MedicalRecord'],
        }),
    }),
});

export const {
    useGetReminderOptionsQuery, useGetRemindersQuery, useGetReminderByIdQuery, useAddReminderMutation,
     useBulkAddRemindersMutation, useUpdateReminderMutation, useDeleteReminderMutation, useCompleteReminderMutation,
} = reminderApi;
