import { Navigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import Loader from "../Loader";

export default function RequireAdmin({ children }) {
    const {
        isAuthenticated,
        isAdmin,
        isLoading,
    } = useAuth();

    if (isLoading) {
        return (
            <Loader />
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}