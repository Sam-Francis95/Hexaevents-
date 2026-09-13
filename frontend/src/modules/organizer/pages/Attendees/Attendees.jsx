import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Loader2, QrCode, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../../../shared/hooks/useToast';
import { getEventAttendance, checkInAttendee } from '../../services/attendanceService';
import { getManagedEvent } from '../../services/organizerEventService';
import { Button } from '../../../../shared/components/common/Button';
import { Input } from '../../../../shared/components/common/Input';

export default function Attendees() {
  const { eventId } = useParams();
  const toast = useToast();
  
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      getManagedEvent(eventId),
      getEventAttendance(eventId)
    ])
      .then(([eventRes, attRes]) => {
        if (active) {
          setEvent(eventRes.data);
          setAttendees(attRes.data.attendees || []);
        }
      })
      .catch(() => toast.error("Failed to load attendees."))
      .finally(() => { if (active) setIsLoading(false); });
      
    return () => (active = false);
  }, [eventId, toast]);

  const handleCheckIn = async (participantId) => {
    setIsCheckingIn(participantId);
    try {
      await checkInAttendee(eventId, participantId);
      setAttendees(prev => 
        prev.map(a => a.participantId === participantId ? { ...a, checkedIn: true, checkedInAt: new Date().toISOString() } : a)
      );
      toast.success("Checked in successfully.");
    } catch (err) {
      toast.error(err.message || 'Failed to check in.');
    } finally {
      setIsCheckingIn(null);
    }
  };

  const filteredAttendees = attendees.filter(a => 
    a.name?.toLowerCase().includes(search.toLowerCase()) || 
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  const checkedInCount = attendees.filter(a => a.checkedIn).length;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/organizer/events/${eventId}`} className="p-2 hover:bg-canvas-subtle rounded-full transition-colors text-ink-500">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Attendees & Check-in</h1>
          <p className="mt-1 text-sm text-ink-500">Only approved participants are shown here.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-xl border border-border bg-canvas overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-border bg-canvas-subtle">
            <Input 
              icon={<Search className="size-4 text-ink-400" />} 
              placeholder="Search by name or email to check in..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-canvas sticky top-0 border-b border-border text-ink-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Participant</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-ink-500">
                      No attendees found.
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((att) => (
                    <tr key={att.participantId} className={`hover:bg-canvas-subtle/50 transition-colors ${att.checkedIn ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-ink-900">{att.name || 'Unknown User'}</div>
                        <div className="text-xs text-ink-500">{att.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {att.checkedIn ? (
                          <div className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                            <CheckCircle2 className="size-4" />
                            Checked In
                            <span className="text-ink-400 font-normal ml-1">
                              ({new Date(att.checkedInAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                            </span>
                          </div>
                        ) : (
                          <span className="text-ink-400 text-xs">Not Checked In</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!att.checkedIn ? (
                          <Button 
                            size="sm" 
                            onClick={() => handleCheckIn(att.participantId)}
                            isLoading={isCheckingIn === att.participantId}
                            disabled={isCheckingIn !== null}
                          >
                            Check In
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>Checked In</Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-canvas p-6 shadow-sm">
            <h3 className="font-semibold text-ink-900 mb-6">Attendance Summary</h3>
            <div className="relative size-40 mx-auto mb-6 flex items-center justify-center">
              <svg className="size-40 -rotate-90 transform">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-border" />
                <circle 
                  cx="80" cy="80" r="70" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={440} 
                  strokeDashoffset={attendees.length > 0 ? 440 - (440 * checkedInCount) / attendees.length : 440} 
                  className="text-accent-500 transition-all duration-1000 ease-out" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-ink-900">{attendees.length > 0 ? Math.round((checkedInCount / attendees.length) * 100) : 0}%</span>
              </div>
            </div>
            
            <div className="flex justify-between border-t border-border pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-ink-900">{checkedInCount}</p>
                <p className="text-xs text-ink-500">Checked In</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-ink-900">{attendees.length - checkedInCount}</p>
                <p className="text-xs text-ink-500">Remaining</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-canvas p-6 shadow-sm text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-100 text-accent-600 mb-4">
              <QrCode className="size-6" />
            </div>
            <h3 className="font-semibold text-ink-900 mb-2">QR Scanner</h3>
            <p className="text-sm text-ink-500 mb-4">Scan participant QR codes for rapid check-in.</p>
            <Button className="w-full" variant="outline">Open Scanner</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
