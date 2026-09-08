import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../shared/context/AuthContext';
import { ToastProvider } from '../shared/context/ToastContext';
import { ToastHost } from '../shared/components/common/Toast';
import { ReputationProvider } from '../modules/participant/contexts/ReputationContext';
import { AppRoutes } from './AppRoutes';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function App() {
  const content = (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ReputationProvider>
            <AppRoutes />
            <ToastHost />
          </ReputationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );

  // Only mount the Google provider once a real client ID exists -- avoids a
  // console error from the library when VITE_GOOGLE_CLIENT_ID is still blank
  // (e.g. before it's been created in Google Cloud Console).
  if (!GOOGLE_CLIENT_ID) return content;

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{content}</GoogleOAuthProvider>;
}
