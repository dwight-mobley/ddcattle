import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logOut } from '../auth/authSlice';

const API_URL = import.meta.env.MODE !== 'development' ? import.meta.env.VITE_API_URL : 'http://localhost:8000';
const baseQuery = fetchBaseQuery({
    baseUrl: `${API_URL}/api/`,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.accessToken;
        if (token) headers.set('authorization', `Bearer ${token}`);
        return headers;
    },
});
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    const url = typeof args === 'string' ? args : args.url;
    if (url === 'token/' || url === 'token/refresh/') return result;
    if (result.error && result.error.status === 401) {
        const refreshToken = api.getState().auth.refreshToken;
        if (refreshToken) {
            const refreshResult = await baseQuery({ url: 'token/refresh/', method: 'POST', body: { refresh: refreshToken } }, api, extraOptions);
            if (refreshResult.data) {
                api.dispatch(setCredentials({ accessToken: refreshResult.data.access, refreshToken: refreshResult.data.refresh || refreshToken }));
                result = await baseQuery(args, api, extraOptions);
            } else api.dispatch(logOut());
        } else api.dispatch(logOut());
    }
    return result;
};
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Animal', 'Horse', 'Dog', 'Cattle', 'MedicalRecord', 'Account', 'Reminder', 'Media', 'Training'],
    endpoints: () => ({}),
});

