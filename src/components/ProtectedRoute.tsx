// ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
const ProtectedRoute = ({ adminOnly }: { adminOnly?: boolean }) => {
 const user = (() => {
    try {
      const data = localStorage.getItem('user');
      return data && data !== "undefined" ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  })();

  const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/" />;

    if (adminOnly && user.role !== 'Admin') {
        console.warn("❌ Access Denied: User is not an Admin");
        return <Navigate to="/home" />;
    }

    return <Outlet />; 
};

export default ProtectedRoute;