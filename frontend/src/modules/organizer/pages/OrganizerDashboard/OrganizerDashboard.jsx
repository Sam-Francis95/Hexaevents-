import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar as CalendarIcon, CheckCircle, TrendingUp, PlusCircle, ExternalLink } from 'lucide-react';
import { getManagedEvents } from '../../services/organizerEventService';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { Button } from '../../../../shared/components/common/Button';
import { EVENT_STATUS_LABEL, EVENT_STATUS_TONE } from '../../../../shared/utils/constants';

function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div className="rounded-xl border border-border bg-canvas p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
          <Icon className="size-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink-500">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-ink-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getManagedEvents()
      .then((res) => {
        if (active) setEvents(res.data);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => (active = false);
  }, []);

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => ['published', 'closed'].includes(e.status)).length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.stats?.registrations || 0), 0);
  const totalApproved = events.reduce((sum, e) => sum + (e.stats?.approved || 0), 0);

  // Recent 3 events
  const recentEvents = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-border border-t-accent-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Welcome back, {user?.name.split(' ')[0]}. Here's what's happening with your events.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/organizer/events/create">
            <Button icon={<PlusCircle className="size-4" />}>Create Event</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={totalEvents} icon={CalendarIcon} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard title="Active Events" value={activeEvents} icon={TrendingUp} colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
        <StatCard title="Total Registrations" value={totalRegistrations} icon={Users} colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
        <StatCard title="Approved Participants" value={totalApproved} icon={CheckCircle} colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
      </div>

      <div className="rounded-xl border border-border bg-canvas overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-canvas-subtle px-6 py-4">
          <h2 className="font-semibold text-ink-900">Recent Events</h2>
          <Link to="/organizer/events" className="text-sm font-medium text-accent-600 hover:text-accent-700 flex items-center gap-1">
            View All <ExternalLink className="size-3.5" />
          </Link>
        </div>
        {recentEvents.length === 0 ? (
          <div className="p-12 text-center text-ink-500 flex flex-col items-center">
            <div className="bg-canvas-subtle p-4 rounded-full mb-4">
              <CalendarIcon className="size-8 text-ink-400" />
            </div>
            <p className="mb-4">You haven't created any events yet.</p>
            <Link to="/organizer/events/create">
              <Button size="sm" variant="outline">Create your first event</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentEvents.map((event) => (
              <div key={event._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 hover:bg-canvas-subtle/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600 font-bold shrink-0">
                    {event.title.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Link to={`/organizer/events/${event._id}`} className="font-medium text-ink-900 hover:text-accent-600 transition-colors">
                      {event.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-ink-500">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="size-3.5" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {event.stats?.registrations || 0} Registrations
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-${EVENT_STATUS_TONE[event.status]}-100 text-${EVENT_STATUS_TONE[event.status]}-800`}>
                        {EVENT_STATUS_LABEL[event.status]}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <Link to={`/organizer/events/${event._id}`}>
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
