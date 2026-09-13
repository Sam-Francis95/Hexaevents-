import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, PlusCircle, Search, Filter, Users, MoreVertical, Edit, ExternalLink, Settings } from 'lucide-react';
import { getManagedEvents } from '../../services/organizerEventService';
import { Button } from '../../../../shared/components/common/Button';
import { Input } from '../../../../shared/components/common/Input';
import { EVENT_STATUS_LABEL, EVENT_STATUS_TONE } from '../../../../shared/utils/constants';

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

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

  const filteredEvents = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">My Events</h1>
          <p className="mt-1 text-sm text-ink-500">Manage all your created hackathons and competitions.</p>
        </div>
        <Link to="/organizer/events/create">
          <Button icon={<PlusCircle className="size-4" />}>Create Event</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:max-w-xs">
          <Input 
            icon={<Search className="size-4 text-ink-400" />} 
            placeholder="Search events..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" icon={<Filter className="size-4" />} className="sm:w-auto">
          Filter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-border border-t-accent-500" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-canvas-subtle p-12 text-center flex flex-col items-center">
          <div className="bg-canvas p-4 rounded-full shadow-sm mb-4">
            <CalendarIcon className="size-8 text-ink-400" />
          </div>
          <h3 className="text-lg font-medium text-ink-900">No events found</h3>
          <p className="mt-1 text-ink-500 mb-6">You haven't created any events matching your criteria.</p>
          <Link to="/organizer/events/create">
            <Button>Create New Event</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const eventId = event.id || event._id;
            return (
            <div key={eventId} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-canvas shadow-sm transition-all hover:shadow-md hover:border-accent-200">
              <div 
                className="h-24 w-full relative p-4 flex items-start justify-between" 
                style={{ backgroundColor: event.bannerColor || '#5B5FEE' }}
              >
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-white/90 shadow-sm text-${EVENT_STATUS_TONE[event.status]}-700`}>
                  {EVENT_STATUS_LABEL[event.status]}
                </span>
                
                <button className="text-white/80 hover:text-white transition-colors bg-black/10 hover:bg-black/20 p-1.5 rounded-md backdrop-blur-sm">
                  <MoreVertical className="size-4" />
                </button>
              </div>
              
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold text-lg text-ink-900 line-clamp-1 mb-1" title={event.title}>{event.title}</h3>
                <p className="text-sm text-ink-500 flex items-center gap-1.5 mb-4">
                  <CalendarIcon className="size-3.5" />
                  {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                </p>
                
                <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <div>
                    <p className="text-xs text-ink-500 mb-0.5">Registrations</p>
                    <p className="font-semibold text-ink-900 flex items-center gap-1.5">
                      <Users className="size-3.5 text-blue-500" />
                      {event.stats?.registrations || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500 mb-0.5">Approved</p>
                    <p className="font-semibold text-ink-900 text-green-600">
                      {event.stats?.approved || 0}
                    </p>
                  </div>
                </div>
                
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs" 
                    icon={<Settings className="size-3.5" />}
                    onClick={() => navigate(`/organizer/events/${eventId}`)}
                  >
                    Manage
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs" 
                    icon={<Edit className="size-3.5" />}
                    onClick={() => navigate(`/organizer/events/${eventId}/edit`)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
