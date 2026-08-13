import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { CertificateCard } from '../../components/CertificateCard';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { buttonVariants } from '../../../../shared/components/common/buttonStyles';
import { Skeleton } from '../../../../shared/components/common/Skeleton';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getCertificates } from '../../services/certificateService';
import { ROUTES } from '../../../../shared/utils/constants';
import { cn } from '../../../../shared/utils/cn';

export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Certificate Wall "unlock" tracking (Part I.2): a certificate that
  // wasn't present on the previous fetch gets the badge-unlock entrance the
  // first time it appears, so newly earned certificates feel special
  // compared to ones already on the wall. seenIdsRef starts empty, so a
  // certificate's very first appearance on this page also counts as
  // "newly seen" here — the delta check against subsequent fetches is what
  // matters for repeat visits within the same session.
  const seenIdsRef = useRef(new Set());
  const [unlockedIds, setUnlockedIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    getCertificates(user.id).then((res) => {
      if (cancelled) return;
      const data = res.data || [];
      const fresh = data.filter((c) => !seenIdsRef.current.has(c.id)).map((c) => c.id);
      setUnlockedIds(new Set(fresh));
      seenIdsRef.current = new Set(data.map((c) => c.id));
      setCertificates(data);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Certificates</h1>
          <p className="mt-1 text-sm text-ink-500">Certificates you've earned from completed events.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface">
              <Skeleton className="h-28 w-full rounded-none" />
              <div className="flex flex-col gap-3 p-4">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="mt-1 h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Certificates</h1>
        <p className="mt-1 text-sm text-ink-500">Certificates you've earned from completed events.</p>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Attend and complete an event to earn your first certificate."
          action={
            <Link to={ROUTES.PARTICIPANT.EVENTS} className={buttonVariants({ size: 'sm' })}>
              Browse events
            </Link>
          }
          className="rounded-2xl border border-border bg-surface"
        />
      ) : (
        <div className="rounded-2xl bg-gradient-to-b from-accent-50/40 to-transparent p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <div key={cert.id} className={cn(unlockedIds.has(cert.id) && 'animate-badge-unlock')}>
                <CertificateCard certificate={cert} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
