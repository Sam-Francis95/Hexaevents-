import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Save, X, ClipboardList, Award, CalendarCheck, Mail, Badge as BadgeIcon } from 'lucide-react';
import { Avatar } from '../../../../shared/components/common/Avatar';
import { Badge } from '../../../../shared/components/common/Badge';
import { Input } from '../../../../shared/components/common/Input';
import { Button } from '../../../../shared/components/common/Button';
import { StatCard } from '../../../../shared/components/common/StatCard';
import { Loader } from '../../../../shared/components/common/Loader';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import { getMyRegistrations } from '../../services/registrationService';
import { getCertificates } from '../../services/certificateService';
import { formatDate } from '../../../../shared/utils/formatters';
import { ROUTES, REGISTRATION_STATUS } from '../../../../shared/utils/constants';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [certificateCount, setCertificateCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ department: '', phone: '', skills: '' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [profileRes, regsRes, certRes] = await Promise.all([
        getUserProfile(user.id),
        getMyRegistrations(user.id),
        getCertificates(user.id),
      ]);
      if (cancelled) return;
      setProfile(profileRes.data);
      setForm({
        department: profileRes.data.department || '',
        phone: profileRes.data.phone || '',
        skills: (profileRes.data.skills || []).join(', '),
      });
      setRegistrations(regsRes.data || []);
      setCertificateCount((certRes.data || []).length);
      setIsLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  async function handleSave() {
    setIsSaving(true);
    const updates = {
      department: form.department.trim(),
      phone: form.phone.trim(),
      skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
    };
    const res = await updateUserProfile(user.id, updates);
    setIsSaving(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    setProfile(res.data);
    updateUser(res.data);
    setIsEditing(false);
    toast.success('Profile updated.');
  }

  function handleCancelEdit() {
    setForm({
      department: profile.department || '',
      phone: profile.phone || '',
      skills: (profile.skills || []).join(', '),
    });
    setIsEditing(false);
  }

  if (isLoading) return <Loader fullHeight label="Loading your profile…" />;

  const completedCount = registrations.filter((r) => r.status === REGISTRATION_STATUS.COMPLETED).length;
  const recentEvents = [...registrations]
    .filter((r) => r.event)
    .sort((a, b) => new Date(b.event.startDate) - new Date(a.event.startDate))
    .slice(0, 5);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name} src={profile.avatarUrl} size="lg" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-ink-900">{profile.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-ink-500">
                <BadgeIcon className="size-3.5" /> {profile.employeeId}
                <span className="text-ink-300">·</span>
                <Mail className="size-3.5" /> {profile.email}
              </div>
            </div>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" leftIcon={<X className="size-3.5" />} onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button size="sm" leftIcon={<Save className="size-3.5" />} isLoading={isSaving} onClick={handleSave}>
                Save
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" leftIcon={<Pencil className="size-3.5" />} onClick={() => setIsEditing(true)}>
              Edit profile
            </Button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isEditing ? (
            <>
              <Input label="Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              <Input
                label="Skills"
                hint="Comma-separated"
                value={form.skills}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                containerClassName="sm:col-span-2"
              />
            </>
          ) : (
            <>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Department</p>
                <p className="mt-1 text-sm text-ink-900">{profile.department || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Phone</p>
                <p className="mt-1 text-sm text-ink-900">{profile.phone || '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-300">Skills</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(profile.skills || []).length === 0 && <p className="text-sm text-ink-500">No skills added yet.</p>}
                  {(profile.skills || []).map((skill) => (
                    <Badge key={skill} tone="accent" dot={false}>{skill}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total registrations" value={registrations.length} icon={ClipboardList} tone="info" />
        <StatCard label="Events completed" value={completedCount} icon={CalendarCheck} tone="accent" />
        <StatCard label="Certificates earned" value={certificateCount} icon={Award} tone="success" />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-500">Recent events</h2>
          <Link to={ROUTES.PARTICIPANT.MY_REGISTRATIONS} className="text-xs font-medium text-accent-600 hover:text-accent-700">
            View all
          </Link>
        </div>
        {recentEvents.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">No events yet — browse and register to get started.</p>
        ) : (
          <div className="mt-2 divide-y divide-border">
            {recentEvents.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <Link to={ROUTES.PARTICIPANT.EVENT_DETAILS(r.eventId)} className="text-sm font-medium text-ink-900 hover:text-accent-600 line-clamp-1">
                    {r.event.title}
                  </Link>
                  <p className="text-xs text-ink-300 font-mono">{formatDate(r.event.startDate)}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
