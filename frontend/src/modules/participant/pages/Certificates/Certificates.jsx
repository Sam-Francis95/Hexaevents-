import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Eye, Trophy, ArrowRight } from 'lucide-react';
import { Skeleton } from '../../../../shared/components/common/Skeleton';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { getCertificates } from '../../services/certificateService';
import { ROUTES } from '../../../../shared/utils/constants';
import { MOCK_CERTIFICATES, MOCK_EVENTS } from '../../../../shared/utils/mockData';
import { cn } from '../../../../shared/utils/cn';

function formatMonth(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const seenIdsRef = useRef(new Set());
  const [unlockedIds, setUnlockedIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    getCertificates(user.id).then((res) => {
      if (cancelled) return;
      const data = (res.data || []).length > 0 ? res.data : MOCK_CERTIFICATES;
      const fresh = data.filter((c) => !seenIdsRef.current.has(c.id)).map((c) => c.id);
      setUnlockedIds(new Set(fresh));
      seenIdsRef.current = new Set(data.map((c) => c.id));
      setCertificates(data);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [user.id]);

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Certificates</h1>
          <p className="mt-1 text-sm text-ink-400">Achievements you've earned from completed events.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-[18px] border border-border bg-surface">
              <Skeleton className="h-36 w-full rounded-none" />
              <div className="flex flex-col gap-3 p-5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="mt-1 h-9 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = certificates.length === 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Certificates</h1>
          <p className="mt-1 text-sm text-ink-400">Achievements you've earned from completed events.</p>
        </div>
        {certificates.length > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <Trophy className="size-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{certificates.length} Certificate{certificates.length !== 1 ? 's' : ''} Earned</span>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-surface py-12 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
            <Award className="size-8 text-amber-500" />
          </div>
          <h3 className="text-base font-bold text-ink-900">No certificates yet</h3>
          <p className="mt-1.5 text-sm text-ink-400">Attend and complete an event to earn your first certificate.</p>
          <Link to={ROUTES.PARTICIPANT.EVENTS} className="mt-5 flex items-center gap-1.5 rounded-xl bg-[#0056D2] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#0048B0]">
            Browse Events <ArrowRight className="size-4" />
          </Link>
          {/* Recommended events */}
          <div className="mt-10 w-full px-4">
            <p className="mb-4 text-left text-sm font-bold text-ink-700">Events to get started</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MOCK_EVENTS.slice(0, 3).map((event) => (
                <Link
                  key={event.id}
                  to={ROUTES.PARTICIPANT.EVENT_DETAILS(event.id)}
                  className="group flex items-center gap-3 rounded-[14px] border border-border bg-canvas p-3 text-left transition-all hover:border-[#0056D2]/30 hover:shadow-sm"
                >
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg">
                    {event.bannerUrl ? <img src={event.bannerUrl} alt={event.title} className="size-full object-cover" /> : <div className="size-full bg-[linear-gradient(135deg,#0056D2,#7C3AED)]" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-900 group-hover:text-[#0056D2]">{event.title}</p>
                    <p className="text-[10px] text-ink-400">{event.category}</p>
                  </div>
                  <ArrowRight className="size-3.5 shrink-0 text-ink-300 group-hover:text-[#0056D2]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className={cn(
                'group flex flex-col overflow-hidden rounded-[18px] border border-border bg-surface shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,86,210,0.1)]',
                unlockedIds.has(cert.id) && 'animate-badge-unlock'
              )}
            >
              {/* Preview */}
              <div className="relative h-36 w-full overflow-hidden bg-[linear-gradient(135deg,#0C2146_0%,#0E3175_40%,#1A1060_100%)]">
                {cert.previewUrl ? (
                  <img src={cert.previewUrl} alt={cert.title} className="size-full object-cover opacity-60" />
                ) : null}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                    <Award className="size-6 text-amber-300" />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">Certificate of Completion</p>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-1 flex items-center gap-1.5">
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700 dark:bg-green-500/10 dark:text-green-400">
                    ✓ Completed
                  </span>
                </div>
                <h3 className="mb-1 text-[15px] font-bold leading-snug text-ink-900">{cert.title || cert.eventTitle || 'Event Certificate'}</h3>
                <p className="mb-4 text-[12px] text-ink-400">{formatMonth(cert.issuedAt)}</p>

                <div className="mt-auto flex gap-2">
                  {cert.downloadUrl && (
                    <a
                      href={cert.downloadUrl}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0056D2] py-2.5 text-[12px] font-bold text-white transition-all hover:bg-[#0048B0] active:scale-[0.98]"
                    >
                      <Download className="size-4" /> Download
                    </a>
                  )}
                  <button className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-2.5 text-[12px] font-semibold text-ink-700 transition-all hover:bg-ink-900/5">
                    <Eye className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
