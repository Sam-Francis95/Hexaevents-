import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { buttonVariants } from '../components/common/buttonStyles';
import { ROUTES } from '../utils/constants';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-500">
        <ShieldAlert className="size-6" />
      </span>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-ink-900">You don't have access to this page</h1>
        <p className="text-sm text-ink-500">Your account role doesn't include this section of the platform.</p>
      </div>
      <Link to={ROUTES.LOGIN} className={buttonVariants({ size: 'sm' })}>
        Back to login
      </Link>
    </div>
  );
}
