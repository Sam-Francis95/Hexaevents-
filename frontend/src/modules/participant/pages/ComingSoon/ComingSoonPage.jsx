import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ROUTES } from '../../../../shared/utils/constants';
import { cn } from '../../../../shared/utils/cn';

/** Generic "Coming Soon" page that looks premium rather than empty */
export default function ComingSoonPage({ icon: Icon, title, description }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-[linear-gradient(135deg,#0056D2,#7C3AED)] text-white shadow-[0_8px_32px_rgba(0,86,210,0.35)]">
        {Icon && <Icon className="size-10" />}
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
      <p className="mt-2 max-w-sm text-base text-ink-400">{description}</p>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#0056D2]/30 bg-blue-50 px-4 py-2 text-sm font-bold text-[#0056D2] dark:bg-blue-500/10 dark:text-blue-400">
        🚧 Coming Soon
      </div>
      <Link
        to={ROUTES.PARTICIPANT.DASHBOARD}
        className="mt-8 flex items-center gap-1.5 text-sm font-semibold text-[#0056D2] hover:text-[#0048B0] dark:text-blue-400"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
