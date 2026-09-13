import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Users, CheckCircle, Clock, XCircle, FileCode } from 'lucide-react';
import { useToast } from '../../../../shared/hooks/useToast';
import { getEventAnalytics } from '../../services/analyticsService';
import { getManagedEvent } from '../../services/organizerEventService';

function MetricBox({ label, value, icon: Icon, colorClass }) {
  return (
    <div className={`rounded-xl border border-border bg-canvas p-5 shadow-sm ${colorClass}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-ink-600">{label}</p>
        <Icon className="size-5 opacity-70" />
      </div>
      <p className="text-3xl font-bold text-ink-900">{value}</p>
    </div>
  );
}

export default function Analytics() {
  const { eventId } = useParams();
  const toast = useToast();
  
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      getManagedEvent(eventId),
      getEventAnalytics(eventId)
    ])
      .then(([eventRes, statRes]) => {
        if (active) {
          setEvent(eventRes.data);
          setAnalytics(statRes.data);
        }
      })
      .catch(() => toast.error("Failed to load analytics."))
      .finally(() => { if (active) setIsLoading(false); });
      
    return () => (active = false);
  }, [eventId, toast]);

  if (isLoading || !analytics) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent-500" />
      </div>
    );
  }

  const r = analytics.registrations;
  const a = analytics.attendance;
  const s = analytics.submissions;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link to={`/organizer/events/${eventId}`} className="p-2 hover:bg-canvas-subtle rounded-full transition-colors text-ink-500">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Analytics</h1>
          <p className="mt-1 text-sm text-ink-500">Performance metrics for {event?.title}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-ink-900">Registration Funnel</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricBox label="Total Applied" value={r.total} icon={Users} colorClass="border-blue-100" />
          <MetricBox label="Approved" value={r.approved} icon={CheckCircle} colorClass="border-green-100" />
          <MetricBox label="Waitlisted" value={r.waitlisted} icon={Clock} colorClass="border-amber-100" />
          <MetricBox label="Rejected" value={r.rejected} icon={XCircle} colorClass="border-red-100" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-ink-900">Attendance</h2>
          <div className="rounded-xl border border-border bg-canvas p-6 shadow-sm flex flex-col items-center justify-center min-h-[240px]">
            <div className="relative size-40 mb-4 flex items-center justify-center">
              <svg className="size-40 -rotate-90 transform">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-border" />
                <circle 
                  cx="80" cy="80" r="70" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={440} 
                  strokeDashoffset={a.expected > 0 ? 440 - (440 * a.checkedIn) / a.expected : 440} 
                  className="text-green-500 transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-ink-900">{Math.round(a.rate)}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-ink-600 text-center">
              {a.checkedIn} checked in out of {a.expected} expected
            </p>
          </div>
        </div>
        
        {event?.requiresSubmission && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-ink-900">Submissions</h2>
            <div className="rounded-xl border border-border bg-canvas p-6 shadow-sm flex flex-col items-center justify-center min-h-[240px]">
              <div className="relative size-40 mb-4 flex items-center justify-center">
                <svg className="size-40 -rotate-90 transform">
                  <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-border" />
                  <circle 
                    cx="80" cy="80" r="70" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={440} 
                    strokeDashoffset={r.approved > 0 ? 440 - (440 * s.total) / r.approved : 440} 
                    className="text-purple-500 transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-600">
                  <FileCode className="size-10" />
                </div>
              </div>
              <p className="text-3xl font-bold text-ink-900 mb-1">{s.total}</p>
              <p className="text-sm font-medium text-ink-600 text-center">
                Projects Submitted (Rate: {Math.round(s.rate)}%)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
