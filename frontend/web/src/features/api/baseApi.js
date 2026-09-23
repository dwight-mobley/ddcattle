import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// TODO: Update these imports to match your actual file structure
import { setCredentials, logOut } from '../auth/authSlice';

const API_URL = import.meta.env.VITE_API_URL;

// 1. Create the standard baseQuery with token injection
const baseQuery = fetchBaseQuery({ 
  baseUrl: `${API_URL}/api/`,
  prepareHeaders: (headers, { getState }) => {
    // Access the token from your Redux state
    const token = getState().auth.accessToken;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// 2. Wrap the baseQuery to handle 401 Unauthorized errors
const baseQueryWithReauth = async (args, api, extraOptions) => {
  // Wait for the initial query
  let result = await baseQuery(args, api, extraOptions);

  // Extract the URL to check if this is an auth request
  const url = typeof args === 'string' ? args : args.url;

  // BYPASS: Do not intercept 401 errors for login or token refresh requests
  if (url === 'token/' || url === 'token/refresh/') {
    return result;
  }

  // If Django rejects it due to an expired token
  if (result.error && result.error.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;

    if (refreshToken) {
      // Attempt to get a new access token
      const refreshResult = await baseQuery(
        {
          url: 'token/refresh/', // Matches your Django url path
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Success: Store the new tokens
        api.dispatch(setCredentials({ 
          accessToken: refreshResult.data.access,
          refreshToken: refreshResult.data.refresh || refreshToken 
        }));
        
        // Retry the original query with the new access token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed (e.g., refresh token expired)
        api.dispatch(logOut());
      }
    } else {
      // No refresh token available
      api.dispatch(logOut());
    }
  }
  return result;
};

// 3. Use the wrapped query in your baseApi
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Animal','Horse', 'Dog', 'Cattle', 'MedicalRecord', 'Account'],
  endpoints: () => ({}), // Leave empty!
});