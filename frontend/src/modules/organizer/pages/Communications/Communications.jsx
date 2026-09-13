import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Users, ShieldAlert, FileText, Loader2 } from 'lucide-react';
import { useToast } from '../../../../shared/hooks/useToast';
import { sendAnnouncement } from '../../services/communicationService';
import { Button } from '../../../../shared/components/common/Button';
import { Input } from '../../../../shared/components/common/Input';

export default function Communications() {
  const { eventId } = useParams();
  const toast = useToast();
  
  const [isSending, setIsSending] = useState(false);
  const [values, setValues] = useState({
    title: '',
    message: '',
    audience: 'approved'
  });

  const handleChange = (field) => (e) => setValues(prev => ({ ...prev, [field]: e.target.value }));

  const handleSend = async (e) => {
    e.preventDefault();
    if (!values.title || !values.message) {
      toast.error("Title and message are required.");
      return;
    }
    
    setIsSending(true);
    try {
      const res = await sendAnnouncement(eventId, values);
      toast.success(`Announcement sent to ${res.data.sentCount} participants.`);
      setValues(prev => ({ ...prev, title: '', message: '' }));
    } catch (err) {
      toast.error(err.message || 'Failed to send announcement.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/organizer/events/${eventId}`} className="p-2 hover:bg-canvas-subtle rounded-full transition-colors text-ink-500">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Communications</h1>
          <p className="mt-1 text-sm text-ink-500">Send announcements to event participants.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSend} className="rounded-xl border border-border bg-canvas p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <Input
                label="Announcement Title"
                placeholder="e.g., Update: Venue Changed"
                value={values.title}
                onChange={handleChange('title')}
                required
              />
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink-700">Message</label>
                <textarea 
                  className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-sm text-ink-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 min-h-[160px]"
                  placeholder="Type your message here..."
                  value={values.message}
                  onChange={handleChange('message')}
                  required
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink-700">Target Audience</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${values.audience === 'approved' ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-900/20' : 'border-border hover:bg-canvas-subtle text-ink-700'}`}>
                    <input 
                      type="radio" 
                      name="audience" 
                      value="approved" 
                      checked={values.audience === 'approved'} 
                      onChange={handleChange('audience')}
                      className="hidden" 
                    />
                    <Users className="size-4" />
                    <span className="text-sm font-medium">Approved</span>
                  </label>
                  
                  <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${values.audience === 'all' ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-900/20' : 'border-border hover:bg-canvas-subtle text-ink-700'}`}>
                    <input 
                      type="radio" 
                      name="audience" 
                      value="all" 
                      checked={values.audience === 'all'} 
                      onChange={handleChange('audience')}
                      className="hidden" 
                    />
                    <Globe className="size-4 hidden" /> 
                    <span className="text-sm font-medium">All Registered</span>
                  </label>
                  
                  <label className={`flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${values.audience === 'waitlisted' ? 'border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-900/20' : 'border-border hover:bg-canvas-subtle text-ink-700'}`}>
                    <input 
                      type="radio" 
                      name="audience" 
                      value="waitlisted" 
                      checked={values.audience === 'waitlisted'} 
                      onChange={handleChange('audience')}
                      className="hidden" 
                    />
                    <ShieldAlert className="size-4" />
                    <span className="text-sm font-medium">Waitlisted</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border flex justify-end">
              <Button type="submit" isLoading={isSending} icon={<Send className="size-4" />}>
                Send Announcement
              </Button>
            </div>
          </form>
        </div>
        
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-canvas p-6 shadow-sm bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <h3 className="font-semibold text-ink-900 flex items-center gap-2 mb-3">
              <FileText className="size-5 text-accent-600" /> Tips for Announcements
            </h3>
            <ul className="space-y-3 text-sm text-ink-600">
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                Keep titles short and action-oriented.
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                Include any relevant links (like virtual meeting URLs) directly in the message.
              </li>
              <li className="flex items-start gap-2">
                <span className="size-1.5 rounded-full bg-accent-500 mt-1.5 shrink-0" />
                Announcements trigger in-app notifications immediately.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
