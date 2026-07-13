import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { CertificateCard } from '../../components/CertificateCard';
import { Loader } from '../../../../shared/components/common/Loader';
import { EmptyState } from '../../../../shared/components/common/EmptyState';
import { buttonVariants } from '../../../../shared/components/common/buttonStyles';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getCertificates } from '../../services/certificateService';
import { ROUTES } from '../../../../shared/utils/constants';

export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCertificates(user.id).then((res) => {
      if (cancelled) return;
      setCertificates(res.data || []);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  if (isLoading) return <Loader fullHeight label="Loading your certificates…" />;

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} certificate={cert} />
          ))}
        </div>
      )}
    </div>
  );
}
