import { Link } from 'react-router-dom';
import { CompassIcon } from 'lucide-react';
import { buttonVariants } from '../components/common/buttonStyles';
import { ROUTES } from '../utils/constants';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-ink-900/5 text-ink-500">
        <CompassIcon className="size-6" />
      </span>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-ink-900">Page not found</h1>
        <p className="text-sm text-ink-500">The page you're looking for doesn't exist or may have moved.</p>
      </div>
      <Link to={ROUTES.PARTICIPANT.DASHBOARD} className={buttonVariants({ size: 'sm' })}>
        Go to dashboard
      </Link>
    </div>
  );
}
