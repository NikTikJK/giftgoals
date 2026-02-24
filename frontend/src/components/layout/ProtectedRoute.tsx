import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.tsx";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p className="mt-12 text-center text-neutral-500">Загрузка...</p>;
  }

  if (!user) {
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
