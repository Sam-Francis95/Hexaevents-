import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, CalendarIcon, Settings, BarChart3, 
  MessageSquare, Loader2, CheckCircle, ExternalLink, 
  MapPin, Globe, Edit
} from 'lucide-react';
import { useToast } from '../../../../shared/hooks/useToast';
import { getManagedEvent } from '../../services/organizerEventService';
import { Button } from '../../../../shared/components/common/Button';
import { EVENT_STATUS_LABEL, EVENT_STATUS_TONE } from '../../../../shared/utils/constants';

function NavCard({ title, description, icon: Icon, to, metric, metricLabel }) {
  return (
    <Link to={to} className="group block h-full rounded-xl border border-border bg-canvas p-6 shadow-sm transition-all hover:shadow-md hover:border-accent-300">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-accent-100 text-accent-600 group-hover:bg-accent-600 group-hover:text-white transition-colors">
            <Icon className="size-5" />
          </div>
          <h3 className="font-semibold text-ink-900">{title}</h3>
        </div>
        <p className="text-sm text-ink-500 mb-6 flex-1">{description}</p>
        
        {metric !== undefined && (
          <div className="border-t border-border pt-4 mt-auto">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wider">{metricLabel}</p>
                <p className="text-2xl font-bold text-ink-900 leading-none mt-1">{metric}</p>
              </div>
              <ExternalLink className="size-4 text-ink-300 group-hover:text-accent-500 transition-colors" />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function EventOverview() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getManagedEvent(eventId)
      .then(res => {
        if (active) setEvent(res.data);
      })
      .catch(() => {
        toast.error("Failed to load event.");
        navigate('/organizer/events');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => (active = false);
  }, [eventId, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header Area */}
      <div className="relative overflow-hidden rounded-2xl bg-ink-900 text-white shadow-lg">
        <div 
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{ backgroundColor: event.bannerColor || '#5B5FEE' }}
        />
        <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full blur-3xl" />
        
        <div className="relative p-6 sm:p-10 flex flex-col md:flex-row gap-6 md:items-end justify-between">
          <div className="space-y-4 max-w-3xl">
            <Link to="/organizer/events" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="size-4" /> Back to Events
            </Link>
            
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-${EVENT_STATUS_TONE[event.status]}-500/20 text-${EVENT_STATUS_TONE[event.status]}-300 border border-${EVENT_STATUS_TONE[event.status]}-500/30`}>
                  {EVENT_STATUS_LABEL[event.status]}
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-white/50">{event.category}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{event.title}</h1>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="size-4 text-white/50" />
                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1.5">
                {event.mode === 'online' ? <Globe className="size-4 text-white/50" /> : <MapPin className="size-4 text-white/50" />}
                <span className="capitalize">{event.mode}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="size-4 text-white/50" />
                {event.capacity === 0 ? 'Unlimited Capacity' : `${event.capacity} Capacity`}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Link to={`/organizer/events/${event.id || event._id}/edit`}>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white" icon={<Edit className="size-4" />}>
                Edit Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div>
        <h2 className="text-xl font-bold text-ink-900 mb-4">Management Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavCard 
            title="Registrations"
            description="Review, approve, or reject participant applications."
            icon={Users}
            to={`/organizer/events/${event.id || event._id}/registrations`}
            metric={event.stats?.pending || 0}
            metricLabel="Pending Approvals"
          />
          
          <NavCard 
            title="Attendees & Check-in"
            description="Manage on-site check-ins and attendance records."
            icon={CheckCircle}
            to={`/organizer/events/${event.id || event._id}/attendees`}
            metric={event.stats?.approved || 0}
            metricLabel="Approved Participants"
          />
          
          <NavCard 
            title="Communications"
            description="Send announcements and reminders to participants."
            icon={MessageSquare}
            to={`/organizer/events/${event.id || event._id}/communications`}
          />
          
          <NavCard 
            title="Analytics & Reports"
            description="View deep metrics about engagement and attendance."
            icon={BarChart3}
            to={`/organizer/events/${event.id || event._id}/analytics`}
            metric={event.stats?.registrations || 0}
            metricLabel="Total Registrations"
          />
          
          <NavCard 
            title="Event Configuration"
            description="Advanced settings, rules, and submission requirements."
            icon={Settings}
            to={`/organizer/events/${event.id || event._id}/edit`}
          />
        </div>
      </div>
    </div>
  );
}
