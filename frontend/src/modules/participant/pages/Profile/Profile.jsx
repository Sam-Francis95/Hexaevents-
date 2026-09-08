import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pencil, Save, X, ClipboardList, Award, CalendarCheck, Mail, CalendarDays,
  Star, Trophy, Shield, Target, Code2, Globe, Zap, ArrowRight,
  BadgeCheck, Lock
} from 'lucide-react';
import { Input } from '../../../../shared/components/common/Input';
import { Button } from '../../../../shared/components/common/Button';
import { Skeleton, SkeletonText } from '../../../../shared/components/common/Skeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useToast } from '../../../../shared/hooks/useToast';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import { getMyRegistrations } from '../../services/registrationService';
import { getCertificates } from '../../services/certificateService';
import { getMyFeedback } from '../../services/feedbackService';
import { getMyAchievements } from '../../services/reputationService';
import { useReputation } from '../../contexts/ReputationContext';
import { formatDate } from '../../../../shared/utils/formatters';
import { ROUTES, REGISTRATION_STATUS } from '../../../../shared/utils/constants';
import { cn } from '../../../../shared/utils/cn';

const DEFAULT_SKILLS = ['Python', 'React', 'AI/ML', 'Figma', 'Node.js', 'Web3'];

function UserAvatar({ name, src, size = 96 }) {
  const seed = encodeURIComponent((name || 'user').toLowerCase().replace(/\s+/g, '-'));
  const avatarUrl = src || `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc&scale=90`;
  return (
    <img
      src={avatarUrl}
      alt={name || 'Profile'}
      style={{ width: size, height: size }}
      className="rounded-full object-cover border-4 border-white dark:border-surface shadow-[0_4px_20px_rgba(0,86,210,0.25)] bg-accent-100 dark:bg-accent-900/30"
    />
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { reputation } = useReputation();
  const toast = useToast();

  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [certificateCount, setCertificateCount] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ department: '', phone: '', skills: '' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [profileRes, regsRes, certRes, achRes] = await Promise.all([
        getUserProfile(user.id),
        getMyRegistrations(user.id),
        getCertificates(user.id),
        getMyAchievements(),
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
      
      // Get top 4 achievements (prioritizing unlocked ones)
      if (achRes.success && achRes.data.collection) {
        const sorted = achRes.data.collection.sort((a, b) => {
          if (a.status === 'UNLOCKED' && b.status !== 'UNLOCKED') return -1;
          if (b.status === 'UNLOCKED' && a.status !== 'UNLOCKED') return 1;
          return 0;
        }).slice(0, 4);
        setAchievements(sorted);
      }
      
      setIsLoading(false);
    }
    load();
    return () => { cancelled = true; };
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
    if (!res.success) { toast.error(res.message); return; }
    setProfile(res.data);
    updateUser(res.data);
    setIsEditing(false);
    toast.success('Profile updated.');
  }

  if (isLoading) return <ProfileSkeleton />;

  const completedCount = registrations.filter((r) => r.status === REGISTRATION_STATUS.COMPLETED).length;
  const attendedCount = registrations.filter((r) => r.attended).length;
  const wins = 0; // placeholder
  
  // Use Reputation Context for XP
  const xp = reputation?.totalXP || 0;
  const maxXp = reputation?.nextLevelXP || 1;
  const xpPercent = reputation?.nextLevelXP ? Math.min(100, Math.max(0, ((xp - (maxXp - reputation.xpToNextLevel)) / (reputation.xpToNextLevel + (xp - (maxXp - reputation.xpToNextLevel)))) * 100)) : 100;

  const skills = (profile?.skills || []).length > 0 ? profile.skills : DEFAULT_SKILLS;
  const recentEvents = [...registrations]
    .filter((r) => r.event)
    .sort((a, b) => new Date(b.event.startDate) - new Date(a.event.startDate))
    .slice(0, 5);

  const stats = [
    { label: 'Events Joined', value: registrations.length, icon: ClipboardList, color: 'text-[#0056D2] bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Completed', value: completedCount, icon: CalendarCheck, color: 'text-green-600 bg-green-50 dark:bg-green-500/10' },
    { label: 'Certificates', value: certificateCount, icon: Award, color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Wins', value: wins, icon: Trophy, color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10' },
  ];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10">
      {/* Profile Hero Card */}
      <div className="relative overflow-hidden rounded-[20px] border border-border bg-surface shadow-sm">
        {/* Cover band */}
        <div className="h-28 bg-[linear-gradient(135deg,#0C2146_0%,#0E3175_40%,#1A1060_100%)]">
          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute left-1/3 top-0 size-24 rounded-full bg-purple-500/15 blur-2xl" />
        </div>

        {/* Avatar + info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="-mt-12">
                <UserAvatar name={profile?.name} src={profile?.avatarUrl} size={96} />
              </div>
              <div className="sm:pb-2 pt-2 sm:pt-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-ink-900">{profile?.name}</h1>
                  <BadgeCheck className="size-6 text-[#0056D2]" />
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-500 mt-1">
                  <Mail className="size-4" />
                  <span>{profile?.email}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:pb-2 mt-2 sm:mt-0">
              {isEditing ? (
                <>
                  <Button variant="secondary" size="sm" leftIcon={<X className="size-3.5" />} onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button size="sm" leftIcon={<Save className="size-3.5" />} isLoading={isSaving} onClick={handleSave}>Save</Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" leftIcon={<Pencil className="size-3.5" />} onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </div>

          {/* Department + skills */}
          <div className="mt-4">
            {isEditing ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Department" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} />
                <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                <Input label="Skills (comma-separated)" hint="e.g. Python, React, AI/ML" value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} containerClassName="sm:col-span-2" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2 text-sm text-ink-500">
                  {profile?.department && <span className="rounded-full border border-border bg-canvas px-3 py-1 font-medium">{profile.department}</span>}
                  {profile?.phone && <span className="rounded-full border border-border bg-canvas px-3 py-1 font-medium">{profile.phone}</span>}
                </div>
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-400">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className="flex items-center gap-1.5 rounded-full border border-[#0056D2]/20 bg-blue-50 px-3 py-1 text-[12px] font-semibold text-[#0056D2] dark:bg-blue-500/10 dark:text-blue-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-[16px] border border-border bg-surface p-4 shadow-sm text-center">
            <div className={cn('flex size-11 items-center justify-center rounded-xl', color.split(' ').slice(1).join(' '))}>
              <Icon className={cn('size-5', color.split(' ')[0])} />
            </div>
            <p className="text-2xl font-black text-ink-900">{value}</p>
            <p className="text-[11px] font-semibold text-ink-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress + Achievements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Progress */}
        <div className="rounded-[18px] border border-border bg-surface p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-ink-900">Participation Level</h2>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#0056D2] dark:bg-blue-500/10 dark:text-blue-400">
              Level {reputation?.currentLevel || 1}
            </span>
          </div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0056D2_0%,#7C3AED_100%)] text-white shadow-lg text-2xl">
              {reputation?.levelBadge || '🌱'}
            </div>
            <div>
              <p className="text-lg font-black text-ink-900">{reputation?.levelName || 'Explorer'}</p>
              <p className="text-sm text-ink-400">
                {reputation?.nextLevelXP ? `${xp.toLocaleString()} / ${maxXp.toLocaleString()} XP to next level` : 'Max Level'}
              </p>
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-canvas">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#0056D2_0%,#7C3AED_100%)] transition-all" style={{ width: `${xpPercent}%` }} />
          </div>
          <p className="mt-2 text-[12px] text-ink-400">
            {reputation?.nextLevelXP ? 'Participate in more events to level up!' : 'You have reached the highest level!'}
          </p>
        </div>

        {/* Achievements */}
        <div className="rounded-[18px] border border-border bg-surface p-5 shadow-sm flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-ink-900">Top Achievements</h2>
            <Link to="/participant/achievements" className="text-[12px] font-semibold text-[#0056D2] hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            {achievements.map((ach) => {
              const earned = ach.status === 'UNLOCKED';
              return (
                <div
                  key={ach.id}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-[14px] border p-3 text-center transition-all',
                    earned ? 'border-blue-100 bg-blue-50/50 shadow-sm dark:border-blue-900/30 dark:bg-blue-900/10' : 'border-dashed border-border opacity-50 bg-canvas/30 grayscale-[0.5]'
                  )}
                >
                  <div className={cn('flex size-10 items-center justify-center rounded-xl text-xl', earned ? 'bg-white shadow-sm dark:bg-surface' : 'bg-canvas')}>
                    {earned ? ach.icon : <Lock className="size-4 text-ink-300" />}
                  </div>
                  <p className={cn('text-[11px] font-bold line-clamp-1', earned ? 'text-ink-900' : 'text-ink-400')}>{ach.name}</p>
                  {earned && <BadgeCheck className="size-3.5 text-blue-500 mt-auto" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* My Journey */}
      <div className="rounded-[18px] border border-border bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-ink-900">My Journey</h2>
          <Link to={ROUTES.PARTICIPANT.MY_REGISTRATIONS} className="flex items-center gap-1 text-[12px] font-semibold text-[#0056D2] dark:text-blue-400">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-ink-400">No events yet — browse and register to start your journey.</p>
        ) : (
          <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
            {recentEvents.map((r) => (
              <li key={r.id} className="relative">
                <span className="absolute -left-[24px] top-0 flex size-5 items-center justify-center rounded-full bg-[#0056D2] text-white ring-4 ring-surface">
                  <Zap className="size-2.5" />
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={ROUTES.PARTICIPANT.EVENT_DETAILS(r.eventId)} className="text-sm font-bold text-ink-900 hover:text-[#0056D2] line-clamp-1">
                      {r.event.title}
                    </Link>
                    <p className="flex items-center gap-1 text-xs text-ink-400 font-mono">
                      <CalendarDays className="size-3" /> {formatDate(r.event.startDate)}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10">
      <div className="overflow-hidden rounded-[20px] border border-border bg-surface">
        <div className="h-28 animate-pulse bg-ink-900/10" />
        <div className="px-6 pb-6 pt-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 shrink-0 rounded-full" />
            <div><Skeleton className="h-5 w-40" /><Skeleton className="mt-2 h-3.5 w-56" /></div>
          </div>
          <Skeleton className="mt-4 h-3.5 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-[16px] border border-border bg-surface" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-40 animate-pulse rounded-[18px] border border-border bg-surface" />
        <div className="h-40 animate-pulse rounded-[18px] border border-border bg-surface" />
      </div>
      <div className="rounded-[18px] border border-border bg-surface p-4">
        <Skeleton className="h-4 w-28" /><SkeletonText lines={4} className="mt-3" />
      </div>
    </div>
  );
}
