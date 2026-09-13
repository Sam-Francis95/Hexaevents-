import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, HelpCircle, Check, Loader2 } from 'lucide-react';
import { useToast } from '../../../../shared/hooks/useToast';
import { createEvent, getManagedEvent, updateEvent } from '../../services/organizerEventService';
import { Button } from '../../../../shared/components/common/Button';
import { Input } from '../../../../shared/components/common/Input';
import { validate, isRequired } from '../../../../shared/utils/validators';

export default function CreateEvent({ isEdit }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  
  const [values, setValues] = useState({
    title: '',
    category: 'hackathon',
    mode: 'online',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    capacity: 0,
    bannerColor: '#5B5FEE',
    status: 'draft',
    requiresSubmission: true,
  });
  
  const [isTeamEvent, setIsTeamEvent] = useState(false);
  const [teamSize, setTeamSize] = useState({ min: 1, max: 4 });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && eventId) {
      let active = true;
      getManagedEvent(eventId)
        .then((res) => {
          if (active && res.data) {
            setValues({
              title: res.data.title || '',
              category: res.data.category || 'hackathon',
              mode: res.data.mode || 'online',
              description: res.data.description || '',
              startDate: res.data.startDate?.split('T')[0] || '',
              endDate: res.data.endDate?.split('T')[0] || '',
              registrationDeadline: res.data.registrationDeadline?.split('T')[0] || '',
              capacity: res.data.capacity || 0,
              bannerColor: res.data.bannerColor || '#5B5FEE',
              status: res.data.status || 'draft',
              requiresSubmission: res.data.requiresSubmission ?? true,
            });
            
            if (res.data.teamSizeLimit) {
              setIsTeamEvent(true);
              setTeamSize({
                min: res.data.teamSizeLimit.min || 1,
                max: res.data.teamSizeLimit.max || 4,
              });
            }
          }
        })
        .catch(() => {
          toast.error("Failed to load event");
          navigate('/organizer/events');
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
      return () => (active = false);
    }
  }, [isEdit, eventId, navigate, toast]);

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSave = async (publish = false) => {
    const fieldErrors = validate(values, {
      title: (v) => (!isRequired(v) ? 'Title is required' : null),
      startDate: (v) => (!isRequired(v) ? 'Start date is required' : null),
      endDate: (v) => (!isRequired(v) ? 'End date is required' : null),
    });

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error('Please fix the errors before saving.');
      return;
    }

    setIsSaving(true);
    
    const payload = {
      ...values,
      status: publish ? 'published' : values.status,
      // Convert dates to ISO
      startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
      endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
      registrationDeadline: values.registrationDeadline ? new Date(values.registrationDeadline).toISOString() : null,
      teamSizeLimit: isTeamEvent ? { min: Number(teamSize.min) || 1, max: Number(teamSize.max) || 4 } : null,
    };

    try {
      if (isEdit) {
        await updateEvent(eventId, payload);
        toast.success(`Event ${publish ? 'published' : 'updated'} successfully`);
        navigate(`/organizer/events/${eventId}`);
      } else {
        const res = await createEvent(payload);
        const newId = res.data.id || res.data._id;
        toast.success(`Event ${publish ? 'published' : 'created'} successfully`);
        navigate(`/organizer/events/${newId}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 z-10 bg-canvas/80 backdrop-blur-md py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/organizer/events')}
            className="p-2 hover:bg-canvas-subtle rounded-full transition-colors text-ink-500"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-ink-900">{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
            <p className="text-xs text-ink-500">Provide the basic details to get started.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)} 
            disabled={isSaving}
            icon={<Save className="size-4" />}
          >
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave(true)} 
            disabled={isSaving || values.status === 'published'}
            isLoading={isSaving}
          >
            Publish
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Info Card */}
        <div className="rounded-xl border border-border bg-canvas p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-ink-900 border-b border-border pb-2">Basic Information</h2>
          
          <div className="grid gap-6">
            <Input
              label="Event Title"
              placeholder="e.g., Winter Hackathon 2026"
              value={values.title}
              onChange={handleChange('title')}
              error={errors.title}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink-700">Category</label>
                <select 
                  className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-ink-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all"
                  value={values.category}
                  onChange={handleChange('category')}
                >
                  <option value="hackathon">Hackathon</option>
                  <option value="ideathon">Ideathon</option>
                  <option value="competition">Competition</option>
                  <option value="workshop">Workshop</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink-700">Format</label>
                <select 
                  className="w-full rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm text-ink-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all"
                  value={values.mode}
                  onChange={handleChange('mode')}
                >
                  <option value="online">Online</option>
                  <option value="offline">In-person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink-700">Description</label>
              <textarea 
                className="w-full rounded-xl border border-border bg-canvas px-4 py-3 text-sm text-ink-900 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500 transition-all min-h-[120px]"
                placeholder="Describe what this event is about..."
                value={values.description}
                onChange={handleChange('description')}
              />
            </div>
          </div>
        </div>

        {/* Schedule Card */}
        <div className="rounded-xl border border-border bg-canvas p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-ink-900 border-b border-border pb-2">Schedule & Registration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="date"
              label="Start Date"
              value={values.startDate}
              onChange={handleChange('startDate')}
              error={errors.startDate}
              required
            />
            <Input
              type="date"
              label="End Date"
              value={values.endDate}
              onChange={handleChange('endDate')}
              error={errors.endDate}
              required
            />
            <Input
              type="date"
              label="Registration Deadline"
              value={values.registrationDeadline}
              onChange={handleChange('registrationDeadline')}
              hint="Leave blank if open until event ends"
            />
            <Input
              type="number"
              label="Capacity (Participants)"
              value={values.capacity}
              onChange={handleChange('capacity')}
              hint="0 means unlimited"
            />
          </div>
        </div>

        {/* Configuration */}
        <div className="rounded-xl border border-border bg-canvas p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-ink-900 border-b border-border pb-2">Configuration</h2>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border bg-canvas-subtle hover:bg-canvas transition-colors">
              <div className="flex h-5 items-center mt-0.5">
                <input 
                  type="checkbox" 
                  className="size-4 rounded border-border text-accent-600 focus:ring-accent-500"
                  checked={values.requiresSubmission}
                  onChange={(e) => setValues(prev => ({...prev, requiresSubmission: e.target.checked}))}
                />
              </div>
              <div>
                <p className="font-medium text-ink-900">Requires Submissions</p>
                <p className="text-sm text-ink-500">Participants will need to submit a project or file before the event ends. Ideal for Hackathons.</p>
              </div>
            </label>

            <div className="space-y-4 pt-4 border-t border-border">
              <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border bg-canvas-subtle hover:bg-canvas transition-colors">
                <div className="flex h-5 items-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="size-4 rounded border-border text-accent-600 focus:ring-accent-500"
                    checked={isTeamEvent}
                    onChange={(e) => setIsTeamEvent(e.target.checked)}
                  />
                </div>
                <div>
                  <p className="font-medium text-ink-900">Team Event</p>
                  <p className="text-sm text-ink-500">Allow participants to form teams for this event.</p>
                </div>
              </label>

              {isTeamEvent && (
                <div className="grid grid-cols-2 gap-4 pl-10">
                  <Input
                    type="number"
                    label="Minimum Team Size"
                    value={teamSize.min}
                    onChange={(e) => setTeamSize(prev => ({ ...prev, min: e.target.value }))}
                    min="1"
                  />
                  <Input
                    type="number"
                    label="Maximum Team Size"
                    value={teamSize.max}
                    onChange={(e) => setTeamSize(prev => ({ ...prev, max: e.target.value }))}
                    min="1"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink-700">Banner Brand Color</label>
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={values.bannerColor}
                  onChange={handleChange('bannerColor')}
                  className="h-10 w-20 cursor-pointer rounded border border-border bg-canvas p-1"
                />
                <span className="text-sm font-mono text-ink-500">{values.bannerColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
