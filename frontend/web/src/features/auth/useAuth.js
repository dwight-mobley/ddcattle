// features/auth/useAuth.js

import { useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "./authApiSlice";

export function useAuth() {
    const accessToken = useSelector(
        (state) => state.auth.accessToken
    );

    const {
        data: user,
        isLoading,
        isFetching,
        isError,
    } = useGetCurrentUserQuery(undefined, {
        skip: !accessToken,
    });

    return {
        user,
        isAuthenticated: !!accessToken && !!user,
        isAdmin: !!user?.is_staff,
        isSuperuser: !!user?.is_superuser,
        isLoading: !!accessToken && (isLoading || isFetching),
        isError,
    };
}