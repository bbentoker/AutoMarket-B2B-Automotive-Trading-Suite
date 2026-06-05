import { useAuth } from '../context/AuthContext';

export const ProtectedAction = ({ children, onAction }) => {
  const { isAuthenticated, user } = useAuth();

  const handleAction = () => {
    if (!isAuthenticated) {
      // Redirect to landing URL with current URL as return path
      window.location.href = `${import.meta.env.VITE_LANDING_URL}/login`;
      return;
    }
    onAction(user);
  };

  return (
    <div onClick={handleAction}>
      {children}
    </div>
  );
}; 