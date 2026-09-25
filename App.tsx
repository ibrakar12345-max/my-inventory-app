import { useApp } from '@/context/AppContext';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import ToastContainer from '@/components/ToastContainer';

export default function App() {
  const { user } = useApp();

  return (
    <>
      {user ? <Dashboard /> : <LoginPage />}
      <ToastContainer />
    </>
  );
}
