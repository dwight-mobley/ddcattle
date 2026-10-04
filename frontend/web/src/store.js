import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './features/api/baseApi';
import authReducer, { logOut } from './features/auth/authSlice';

// Remove cached private records when the account signs out.
const clearPrivateCache = ({ dispatch }) => next => action => {
  const result = next(action);
  if (action.type === logOut.type) dispatch(baseApi.util.resetApiState());
  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,

  },
  // Adding the api middleware enables caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, clearPrivateCache),
});