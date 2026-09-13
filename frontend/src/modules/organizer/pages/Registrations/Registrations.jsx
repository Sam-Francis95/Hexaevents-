import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Loader2, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useToast } from '../../../../shared/hooks/useToast';
import { getEventRegistrations, updateRegistrationStatus } from '../../services/organizerRegistrationService';
import { getManagedEvent } from '../../services/organizerEventService';
import { Button } from '../../../../shared/components/common/Button';
import { Input } from '../../../../shared/components/common/Input';
import { REGISTRATION_STATUS_LABEL, REGISTRATION_STATUS_TONE } from '../../../../shared/utils/constants';

function RegistrationRow({ reg, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);

  const hasHistory = reg.changeHistory && reg.changeHistory.length > 0;
  
  return (
    <>
      <tr className="hover:bg-canvas-subtle/50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="p-1 rounded-md hover:bg-canvas transition-colors text-ink-500"
            >
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            <div>
              <div className="font-medium text-ink-900 flex items-center gap-2">
                {reg.participant?.name || 'Unknown User'}
                {hasHistory && <AlertTriangle className="size-3.5 text-amber-500" title="Information Updated" />}
              </div>
              <div className="text-xs text-ink-500">{reg.participant?.email}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-ink-600">
          {reg.participant?.department || 'N/A'}
        </td>
        <td className="px-6 py-4 text-ink-600">
          {new Date(reg.createdAt || reg.registeredAt).toLocaleDateString()}
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-${REGISTRATION_STATUS_TONE[reg.status]}-100 text-${REGISTRATION_STATUS_TONE[reg.status]}-800`}>
            {REGISTRATION_STATUS_LABEL[reg.status] || reg.status}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-2">
            {reg.status !== 'approved' && (
              <button 
                onClick={() => onUpdateStatus(reg._id || reg.id, 'approved')}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                title="Approve"
              >
                <CheckCircle className="size-5" />
              </button>
            )}
            {reg.status !== 'waitlisted' && (
              <button 
                onClick={() => onUpdateStatus(reg._id || reg.id, 'waitlisted')}
                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                title="Waitlist"
              >
                <Clock className="size-5" />
              </button>
            )}
            {reg.status !== 'rejected' && (
              <button 
                onClick={() => onUpdateStatus(reg._id || reg.id, 'rejected')}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Reject"
              >
                <XCircle className="size-5" />
              </button>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan="5" className="px-6 py-6 bg-canvas-subtle/30 border-b border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Participant Details */}
              <div>
                <h4 className="text-sm font-semibold text-ink-900 mb-4 flex items-center gap-2">
                  Participant Details
                  <span className="text-[10px] uppercase tracking-wider font-bold text-ink-400 bg-canvas border border-border px-1.5 py-0.5 rounded">Read Only</span>
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-ink-500 font-medium">Department</span>
                    <span className="col-span-2 text-ink-900">{reg.participant?.department || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-ink-500 font-medium">College</span>
                    <span className="col-span-2 text-ink-900">{reg.participant?.college || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-ink-500 font-medium">Phone</span>
                    <span className="col-span-2 text-ink-900">{reg.participant?.phone || '-'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-ink-500 font-medium">Batch</span>
                    <span className="col-span-2 text-ink-900">{reg.participant?.batch || '-'}</span>
                  </div>
                </div>
                
                {reg.teamMembers && reg.teamMembers.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-ink-900 mb-3">Team Members</h4>
                    <ul className="space-y-2">
                      {reg.teamMembers.map((tm, idx) => (
                        <li key={idx} className="text-sm flex flex-col p-2 bg-canvas border border-border rounded-md">
                          <span className="font-medium text-ink-900">{tm.name}</span>
                          <span className="text-xs text-ink-500">{tm.email}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Change History */}
              <div>
                <h4 className="text-sm font-semibold text-ink-900 mb-4">Registration History</h4>
                {!hasHistory ? (
                  <p className="text-sm text-ink-500 italic">No information changes since registration.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
                      <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Information Updated</p>
                        <p className="text-xs opacity-80">The participant updated their profile after registering.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {reg.changeHistory.map((history) => (
                        <div key={history.id} className="relative pl-4 border-l-2 border-accent-200">
                          <p className="text-xs font-semibold text-ink-900 capitalize">{history.fieldName}</p>
                          <div className="flex items-center gap-2 text-sm mt-0.5">
                            <span className="text-ink-500 line-through">{history.oldValue || 'None'}</span>
                            <span className="text-ink-400">→</span>
                            <span className="text-ink-900 font-medium">{history.newValue || 'None'}</span>
                          </div>
                          <p className="text-[10px] text-ink-400 mt-1">
                            Updated: {new Date(history.changedAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Registrations() {
  const { eventId } = useParams();
  const toast = useToast();
  
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;
    Promise.all([
      getManagedEvent(eventId),
      getEventRegistrations(eventId)
    ])
      .then(([eventRes, regsRes]) => {
        if (active) {
          setEvent(eventRes.data);
          setRegistrations(regsRes.data);
        }
      })
      .catch(() => toast.error("Failed to load registrations."))
      .finally(() => { if (active) setIsLoading(false); });
      
    return () => (active = false);
  }, [eventId, toast]);

  const handleUpdateStatus = async (regId, newStatus) => {
    try {
      await updateRegistrationStatus(regId, newStatus);
      setRegistrations(prev => 
        prev.map(r => r._id === regId ? { ...r, status: newStatus } : r)
      );
      toast.success(`Registration ${newStatus} successfully.`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status.');
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchesSearch = r.participant?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          r.participant?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Registrations</h1>
          <p className="mt-1 text-sm text-ink-500">Manage applications for {event?.title}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-canvas p-4 rounded-xl border border-border">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <Input 
              icon={<Search className="size-4 text-ink-400" />} 
              placeholder="Search participants..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-ink-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="waitlisted">Waitlisted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="text-sm text-ink-500 font-medium">
          {filteredRegistrations.length} participant(s)
        </div>
      </div>

      <div className="rounded-xl border border-border bg-canvas overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas-subtle border-b border-border text-ink-500 font-medium">
              <tr>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Department / College</th>
                <th className="px-6 py-4">Applied On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-ink-500">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                filteredRegistrations.map((reg) => (
                  <RegistrationRow key={reg._id || reg.id} reg={reg} onUpdateStatus={handleUpdateStatus} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
