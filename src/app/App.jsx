import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import { ToastProvider } from '../shared/context/ToastContext';
import { ToastHost } from '../shared/components/common/Toast';
import { AppRoutes } from './AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
          <ToastHost />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
