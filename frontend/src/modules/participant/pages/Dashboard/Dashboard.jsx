import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ClipboardList,
  Ticket,
  Trophy,
  Bookmark,
  ArrowRight,
  MapPin,
  Megaphone,
  Gamepad2,
  Users,
  Compass,
  Plus,
  Shield,
  Layers,
  GraduationCap,
  Video,
  Code,
  Lightbulb,
  Database,
  Palette,
} from 'lucide-react';
import { useAuth } from '../../../../shared/hooks/useAuth';
import { useReputation } from '../../contexts/ReputationContext';
import { getMyRegistrations } from '../../services/registrationService';
import { getEvents } from '../../services/eventService';
import { getCertificates } from '../../services/certificateService';
import { ROUTES } from '../../../../shared/utils/constants';
import { cn } from '../../../../shared/utils/cn';
import {
  MOCK_EVENTS,
  MOCK_REGISTRATIONS,
  MOCK_RECOMMENDED,
  MOCK_TEAMS,
  MOCK_TICKETS,
} from '../../../../shared/utils/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// EXACT TARGET DESIGN EVENT STYLES & METADATA (Guaranteed 100% visibility)
// ─────────────────────────────────────────────────────────────────────────────
const FEATURED_CONFIGS = [
  {
    title: 'AI Innovators Hack 2026',
    description: 'Build AI solutions for real-world challenges.',
    category: 'HACKATHON',
    dateDisplay: '24 - 26 Aug 2026',
    location: 'Online',
    prizeInfo: '₹2,00,000 Prize Pool',
    badgeColor: 'bg-[#7C3AED] text-white',
    btnColor: 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white',
  },
  {
    title: 'Smart India Ideathon',
    description: 'Solve real-world problems through innovation.',
    category: 'IDEATHON',
    dateDisplay: '28 - 30 Aug 2026',
    location: 'Bengaluru',
    prizeInfo: 'Team Size: 2 - 4',
    badgeColor: 'bg-[#16A34A] text-white',
    btnColor: 'bg-[#16A34A] hover:bg-[#15803D] text-white',
  },
  {
    title: 'CodeFest Web3',
    description: 'Build the next generation of Web3 applications.',
    category: 'HACKATHON',
    dateDisplay: '1 - 3 Sep 2026',
    location: 'Online',
    prizeInfo: '₹1,50,000 Prize Pool',
    badgeColor: 'bg-[#3B82F6] text-white',
    btnColor: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white',
  },
  {
    title: 'DesignSprint Challenge',
    description: 'Solve problems. Design solutions. Create impact.',
    category: 'WORKSHOP',
    dateDisplay: '5 Sep 2026',
    location: 'Mumbai',
    prizeInfo: 'Participation Certificate',
    badgeColor: 'bg-[#EA580C] text-white',
    btnColor: 'bg-[#EA580C] hover:bg-[#C2410C] text-white',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HIGH-FIDELITY VECTOR EVENT BANNERS (Matching Target Design Image 2 exactly)
// ─────────────────────────────────────────────────────────────────────────────

function AiHackathonBanner() {
  return (
    <svg className="size-full" viewBox="0 0 320 180" fill="none" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill="#0A0F24" />
      <circle cx="160" cy="90" r="100" fill="url(#aiGlow)" opacity="0.4" />
      <g stroke="#38BDF8" strokeWidth="1" opacity="0.3">
        <line x1="20" y1="40" x2="80" y2="70" />
        <line x1="80" y1="70" x2="160" y2="50" />
        <line x1="160" y1="50" x2="240" y2="70" />
        <line x1="240" y1="70" x2="300" y2="30" />
        <line x1="80" y1="70" x2="120" y2="120" />
        <line x1="240" y1="70" x2="200" y2="120" />
        <line x1="120" y1="120" x2="200" y2="120" />
      </g>
      <g fill="#0284C7">
        <circle cx="80" cy="70" r="3" />
        <circle cx="160" cy="50" r="4" fill="#38BDF8" />
        <circle cx="240" cy="70" r="3" />
        <circle cx="120" cy="120" r="3" />
        <circle cx="200" cy="120" r="3" />
      </g>
      <rect x="105" y="55" width="110" height="70" rx="16" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" opacity="0.85" />
      <text x="160" y="103" textAnchor="middle" fill="#38BDF8" fontSize="36" fontWeight="900" fontFamily="sans-serif" letterSpacing="4" filter="drop-shadow(0 0 10px rgba(56,189,248,0.8))">
        AI
      </text>
      <defs>
        <radialGradient id="aiGlow" cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#0284C7" />
          <stop offset="1" stopColor="#0A0F24" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function IdeathonBanner() {
  return (
    <svg className="size-full" viewBox="0 0 320 180" fill="none" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill="#0C131F" />
      <circle cx="160" cy="75" r="65" fill="#F59E0B" opacity="0.25" filter="blur(16px)" />
      <path d="M142 60 C142 45 150 35 160 35 C170 35 178 45 178 60 C178 70 172 78 168 84 L168 94 L152 94 L152 84 C148 78 142 70 142 60 Z" fill="#FDE68A" />
      <path d="M152 97 L168 97 L165 104 L155 104 Z" fill="#D97706" />
      <path d="M155 58 L160 46 L165 58" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
      <line x1="160" y1="20" x2="160" y2="28" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="125" y1="40" x2="132" y2="45" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="195" y1="40" x2="188" y2="45" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="115" y1="70" x2="123" y2="70" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="205" y1="70" x2="197" y2="70" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="90" cy="145" r="14" fill="#1E293B" />
      <path d="M70 180 C70 162 80 158 90 158 C100 158 110 162 110 180 Z" fill="#1E293B" />
      <circle cx="230" cy="145" r="14" fill="#1E293B" />
      <path d="M210 180 C210 162 220 158 230 158 C240 158 250 162 250 180 Z" fill="#1E293B" />
      <circle cx="160" cy="138" r="16" fill="#334155" />
      <path d="M136 180 C136 155 146 150 160 150 C174 150 184 155 184 180 Z" fill="#334155" />
    </svg>
  );
}

function Web3Banner() {
  return (
    <svg className="size-full" viewBox="0 0 320 180" fill="none" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill="#0A0E27" />
      <circle cx="160" cy="90" r="90" fill="#2563EB" opacity="0.25" filter="blur(20px)" />
      <g opacity="0.6">
        <path d="M50 40 L70 30 L90 40 L70 50 Z" fill="#3B82F6" />
        <path d="M50 40 L70 50 L70 70 L50 60 Z" fill="#1D4ED8" />
        <path d="M90 40 L70 50 L70 70 L90 60 Z" fill="#2563EB" />
        
        <path d="M230 40 L250 30 L270 40 L250 50 Z" fill="#8B5CF6" />
        <path d="M230 40 L250 50 L250 70 L230 60 Z" fill="#6D28D9" />
        <path d="M270 40 L250 50 L250 70 L270 60 Z" fill="#7C3AED" />
      </g>
      <rect x="90" y="55" width="140" height="70" rx="16" fill="#0F172A" stroke="#60A5FA" strokeWidth="1.5" opacity="0.9" />
      <text x="160" y="102" textAnchor="middle" fill="#60A5FA" fontSize="30" fontWeight="900" fontFamily="sans-serif" letterSpacing="3" filter="drop-shadow(0 0 10px rgba(96,165,250,0.8))">
        WEB3
      </text>
    </svg>
  );
}

function DesignSprintBanner() {
  return (
    <svg className="size-full" viewBox="0 0 320 180" fill="none" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill="#18132A" />
      <circle cx="160" cy="80" r="80" fill="#EA580C" opacity="0.25" filter="blur(20px)" />
      <rect x="70" y="35" width="180" height="100" rx="8" fill="#0F172A" stroke="#EA580C" strokeWidth="2" />
      <rect x="150" y="135" width="20" height="18" fill="#334155" />
      <rect x="135" y="152" width="50" height="5" rx="2" fill="#475569" />
      <rect x="82" y="46" width="40" height="78" rx="4" fill="#1E293B" />
      <rect x="86" y="52" width="32" height="12" rx="2" fill="#EC4899" opacity="0.8" />
      <rect x="86" y="68" width="32" height="24" rx="2" fill="#3B82F6" opacity="0.8" />
      <rect x="86" y="96" width="32" height="18" rx="2" fill="#10B981" opacity="0.8" />
      
      <rect x="130" y="46" width="108" height="78" rx="4" fill="#1E293B" />
      <rect x="138" y="54" width="92" height="10" rx="2" fill="#6366F1" opacity="0.8" />
      <circle cx="146" cy="76" r="8" fill="#F59E0B" />
      <rect x="160" y="70" width="65" height="5" rx="2" fill="#94A3B8" />
      <rect x="160" y="79" width="45" height="4" rx="2" fill="#64748B" />
      <rect x="138" y="94" width="92" height="20" rx="3" fill="#EA580C" opacity="0.8" />
    </svg>
  );
}

// 3D Trophy Graphic for Hero Banner
function HeroTrophyGraphic() {
  return (
    <div className="relative flex items-center justify-center select-none">
      <div className="absolute size-44 rounded-full bg-amber-400/25 blur-2xl" />
      <svg className="relative size-36 drop-shadow-[0_12px_24px_rgba(0,0,0,0.3)]" viewBox="0 0 200 200" fill="none">
        <path d="M40 30L45 42L57 44L48 53L51 65L40 59L29 65L32 53L23 44L35 42L40 30Z" fill="#FBBF24" opacity="0.9" />
        <path d="M165 45L168 53L176 54L170 60L172 68L165 64L158 68L160 60L154 54L162 53L165 45Z" fill="#FDE68A" opacity="0.8" />
        <circle cx="30" cy="80" r="3" fill="#60A5FA" />
        <circle cx="175" cy="90" r="3.5" fill="#C084FC" />
        <ellipse cx="100" cy="165" rx="55" ry="16" fill="#1E1B4B" />
        <path d="M45 165 C45 165 45 150 100 150 C155 150 155 165 155 165 L150 178 C150 178 140 185 100 185 C60 185 50 178 50 178 Z" fill="#312E81" />
        <ellipse cx="100" cy="150" rx="46" ry="12" fill="#4338CA" />
        <path d="M82 142 L118 142 L112 125 L88 125 Z" fill="#D97706" />
        <ellipse cx="100" cy="125" rx="14" ry="4" fill="#F59E0B" />
        <path d="M93 125 L93 105 L107 105 L107 125 Z" fill="#FBBF24" />
        <path d="M68 55 C68 95 90 108 100 108 C110 108 132 95 132 55 Z" fill="url(#goldGrad)" />
        <ellipse cx="100" cy="55" rx="32" ry="10" fill="#FDE68A" />
        <ellipse cx="100" cy="55" rx="28" ry="8" fill="#D97706" />
        <path d="M68 62 C50 62 48 85 72 90" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M132 62 C150 62 152 85 128 90" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M100 70 L103 76 L109 77 L105 81 L106 87 L100 84 L94 87 L95 81 L91 77 L97 76 Z" fill="#FFFFFF" opacity="0.95" />
        <defs>
          <linearGradient id="goldGrad" x1="68" y1="55" x2="132" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE68A" />
            <stop offset="0.4" stopColor="#F59E0B" />
            <stop offset="0.8" stopColor="#D97706" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Small icon thumbnails for list items
function ItemThumbnail({ type, className }) {
  if (type === 'ai') {
    return (
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0F172A] text-cyan-400 font-bold text-xs border border-cyan-500/30', className)}>
        AI
      </div>
    );
  }
  if (type === 'ideathon') {
    return (
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1C1917] text-amber-400 border border-amber-500/30', className)}>
        <Lightbulb className="size-4.5" />
      </div>
    );
  }
  if (type === 'web3') {
    return (
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0C1322] text-blue-400 border border-blue-500/30', className)}>
        <Code className="size-4.5" />
      </div>
    );
  }
  if (type === 'security') {
    return (
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/30', className)}>
        <Shield className="size-4.5" />
      </div>
    );
  }
  if (type === 'analytics') {
    return (
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600 border border-pink-500/30', className)}>
        <Database className="size-4.5" />
      </div>
    );
  }
  return (
    <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 border border-orange-500/30', className)}>
      <Palette className="size-4.5" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { reputation } = useReputation();
  const navigate = useNavigate();
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [registrations, setRegistrations] = useState(MOCK_REGISTRATIONS);
  const [certificateCount, setCertificateCount] = useState(3);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [eventsRes, regsRes, certRes] = await Promise.all([
        getEvents(),
        getMyRegistrations(user?.id),
        getCertificates(user?.id),
      ]);
      if (cancelled) return;
      if (eventsRes.success && (eventsRes.data || []).length > 0) {
        setEvents(eventsRes.data);
      }
      if (regsRes.success && (regsRes.data || []).length > 0) {
        setRegistrations(MOCK_REGISTRATIONS);
      }
      if (certRes.success && (certRes.data || []).length > 0) {
        setCertificateCount(certRes.data.length || 3);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const toggleBookmark = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Priya';

  return (
    <div className="mx-auto w-full max-w-[1520px] pb-8">
      {/* 2-Column Desktop Grid Layout Matching Image 2 */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_310px] 2xl:grid-cols-[1fr_330px]">
        {/* ============================================================ */}
        {/* LEFT / MAIN CONTENT AREA                                     */}
        {/* ============================================================ */}
        <div className="flex min-w-0 flex-col gap-5">
          {/* 1. Welcome Hero Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#4F46E5] px-7 py-6 text-white shadow-sm sm:px-9 sm:py-7">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-1/4 size-44 rounded-full bg-purple-500/20 blur-2xl" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-xl">
                <h1 className="text-2xl font-bold tracking-tight sm:text-[26px]">
                  Welcome back, {firstName}! 👋
                </h1>
                <p className="mt-1 text-sm font-semibold text-white/95">
                  Ready to build, compete and win?
                </p>
                <p className="mt-1 text-xs text-blue-100/80">
                  Discover hackathons, ideathons and challenges curated for you.
                </p>

                {/* Hero Action Buttons */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={ROUTES.PARTICIPANT.EVENTS}
                    className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#172B4D] shadow-sm transition-all hover:bg-slate-50 active:scale-95"
                  >
                    Explore Events <ArrowRight className="size-3.5" />
                  </Link>
                  <Link
                    to={ROUTES.PARTICIPANT.MY_REGISTRATIONS}
                    className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95"
                  >
                    My Registrations
                  </Link>
                </div>
              </div>

              {/* 3D Trophy Illustration on Right */}
              <div className="hidden shrink-0 items-center justify-center md:flex">
                <HeroTrophyGraphic />
              </div>
            </div>
          </div>

          {/* 2. Four Compact Stat Cards (1 Row) */}
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {/* Upcoming Events */}
            <Link
              to={ROUTES.PARTICIPANT.EVENTS}
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-[#0056D2]/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <Calendar className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink-500">Upcoming Events</p>
                  <p className="text-xl font-bold text-ink-900">12</p>
                </div>
              </div>
              <span className="mt-3 text-[11px] font-semibold text-blue-600 group-hover:underline dark:text-blue-400">
                View all →
              </span>
            </Link>

            {/* My Registrations */}
            <Link
              to={ROUTES.PARTICIPANT.MY_REGISTRATIONS}
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-[#0056D2]/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                  <ClipboardList className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink-500">My Registrations</p>
                  <p className="text-xl font-bold text-ink-900">4</p>
                </div>
              </div>
              <span className="mt-3 text-[11px] font-semibold text-purple-600 group-hover:underline dark:text-purple-400">
                View all →
              </span>
            </Link>

            {/* My Tickets */}
            <Link
              to="/participant/tickets"
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-[#0056D2]/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Ticket className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink-500">My Tickets</p>
                  <p className="text-xl font-bold text-ink-900">{MOCK_TICKETS.length}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-ink-500 truncate pr-2">
                  {MOCK_TICKETS.length > 0 ? `Next: ${MOCK_TICKETS[0].event.title}` : 'No upcoming tickets'}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 group-hover:underline dark:text-emerald-400 shrink-0">
                  View all →
                </span>
              </div>
            </Link>

            {/* Certificates Earned */}
            <Link
              to={ROUTES.PARTICIPANT.CERTIFICATES}
              className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-[#0056D2]/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <Trophy className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink-500">Certificates Earned</p>
                  <p className="text-xl font-bold text-ink-900">{certificateCount}</p>
                </div>
              </div>
              <span className="mt-3 text-[11px] font-semibold text-amber-600 group-hover:underline dark:text-amber-400">
                View all →
              </span>
            </Link>
          </div>

          {/* 3. Featured Events (4 Cards in a Row) */}
          <div className="relative">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold tracking-tight text-ink-900">
                Featured Events
              </h2>
              <Link
                to={ROUTES.PARTICIPANT.EVENTS}
                className="flex items-center gap-1 text-xs font-semibold text-[#0056D2] hover:underline dark:text-blue-400"
              >
                View all events <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURED_CONFIGS.map((item, index) => {
                const eventId = events[index]?.id || `mock-${index + 1}`;
                const isBookmarked = bookmarkedIds.has(eventId);

                return (
                  <div
                    key={eventId}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Event Banner Image */}
                    <div className="relative h-32 w-full shrink-0 overflow-hidden bg-canvas">
                      {index === 0 ? (
                        <AiHackathonBanner />
                      ) : index === 1 ? (
                        <IdeathonBanner />
                      ) : index === 2 ? (
                        <Web3Banner />
                      ) : (
                        <DesignSprintBanner />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

                      {/* Category Badge */}
                      <span
                        className={cn(
                          'absolute left-2.5 top-2.5 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-sm',
                          item.badgeColor
                        )}
                      >
                        {item.category}
                      </span>

                      {/* Bookmark Icon */}
                      <button
                        onClick={(e) => toggleBookmark(eventId, e)}
                        className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                      >
                        <Bookmark
                          className={cn(
                            'size-3.5',
                            isBookmarked && 'fill-white text-white'
                          )}
                        />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col justify-between p-3.5">
                      <div>
                        <h3 className="line-clamp-1 text-sm font-bold text-ink-900 group-hover:text-[#0056D2] transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-500">
                          {item.description}
                        </p>

                        <div className="mt-2.5 flex flex-col gap-1 text-[11px] text-ink-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 shrink-0 text-ink-400" />
                            <span>{item.dateDisplay}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0 text-ink-400" />
                            <span>{item.location}</span>
                          </div>
                        </div>

                        {/* Prize or Highlight */}
                        <p className="mt-2 text-[11px] font-bold text-ink-900">
                          {item.prizeInfo}
                        </p>
                      </div>

                      {/* Register Now Button with Guaranteed Solid Background */}
                      <Link
                        to={ROUTES.PARTICIPANT.REGISTER(eventId)}
                        className={cn(
                          'mt-3.5 flex w-full items-center justify-center rounded-lg py-2.5 text-xs font-bold shadow-sm transition-all active:scale-[0.98]',
                          item.btnColor
                        )}
                      >
                        Register Now
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Split Section: My Registrations & Recommended For You */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Left Box: My Registrations */}
            <div className="flex flex-col rounded-2xl border border-border bg-surface p-4.5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink-900">
                  My Registrations
                </h2>
                <Link
                  to={ROUTES.PARTICIPANT.MY_REGISTRATIONS}
                  className="text-[11px] font-semibold text-[#0056D2] hover:underline dark:text-blue-400"
                >
                  View all →
                </Link>
              </div>

              <div className="flex flex-col divide-y divide-border">
                {registrations.slice(0, 4).map((reg) => (
                  <div
                    key={reg.id}
                    onClick={() =>
                      navigate(ROUTES.PARTICIPANT.EVENT_DETAILS(reg.eventId))
                    }
                    className="group flex cursor-pointer items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-canvas/50 rounded-lg px-1 transition-colors"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3 pr-2">
                      <ItemThumbnail type={reg.iconType} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-ink-900 group-hover:text-[#0056D2] transition-colors">
                          {reg.title}
                        </p>
                        <p className="truncate text-[10px] text-ink-400">
                          {reg.dateDisplay}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                          reg.statusPillClass
                        )}
                      >
                        {reg.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Recommended For You */}
            <div className="flex flex-col rounded-2xl border border-border bg-surface p-4.5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink-900">
                  Recommended For You
                </h2>
                <Link
                  to={ROUTES.PARTICIPANT.EVENTS}
                  className="text-[11px] font-semibold text-[#0056D2] hover:underline dark:text-blue-400"
                >
                  View all →
                </Link>
              </div>

              <div className="flex flex-col divide-y divide-border">
                {MOCK_RECOMMENDED.map((rec) => {
                  const isBookmarked = bookmarkedIds.has(rec.id);

                  return (
                    <div
                      key={rec.id}
                      onClick={() => navigate(ROUTES.PARTICIPANT.EVENTS)}
                      className="group flex cursor-pointer items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-canvas/50 rounded-lg px-1 transition-colors"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3 pr-2">
                        <ItemThumbnail type={rec.iconType} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-ink-900 group-hover:text-[#0056D2] transition-colors">
                            {rec.title}
                          </p>
                          <p className="truncate text-[10px] text-ink-400">
                            {rec.dateDisplay}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            'rounded px-1.5 py-0.5 text-[10px] font-bold',
                            rec.categoryClass
                          )}
                        >
                          {rec.category}
                        </span>
                        <button
                          onClick={(e) => toggleBookmark(rec.id, e)}
                          className="text-ink-400 hover:text-ink-700"
                        >
                          <Bookmark
                            className={cn(
                              'size-3.5',
                              isBookmarked && 'fill-[#0056D2] text-[#0056D2]'
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Explore by Category — Full Labels Without Truncation */}
          <div className="rounded-2xl border border-border bg-surface p-4.5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-900">
                Explore by Category
              </h2>
              <Link
                to={ROUTES.PARTICIPANT.EVENTS}
                className="text-[11px] font-semibold text-[#0056D2] hover:underline dark:text-blue-400"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
              {[
                { label: 'Hackathons', icon: Code, color: 'text-blue-600 bg-blue-500/10' },
                { label: 'Ideathons', icon: Lightbulb, color: 'text-amber-600 bg-amber-500/10' },
                { label: 'Competitions', icon: Trophy, color: 'text-purple-600 bg-purple-500/10' },
                { label: 'Workshops', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-500/10' },
                { label: 'Challenges', icon: Shield, color: 'text-pink-600 bg-pink-500/10' },
                { label: 'Webinars', icon: Video, color: 'text-cyan-600 bg-cyan-500/10' },
                { label: 'Bootcamps', icon: Layers, color: 'text-orange-600 bg-orange-500/10' },
                { label: 'Conferences', icon: Users, color: 'text-indigo-600 bg-indigo-500/10' },
              ].map((cat) => (
                <Link
                  key={cat.label}
                  to={`${ROUTES.PARTICIPANT.EVENTS}?category=${encodeURIComponent(cat.label)}`}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-canvas/60 p-2.5 text-center transition-all hover:-translate-y-0.5 hover:border-[#0056D2]/40 hover:bg-surface"
                >
                  <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', cat.color)}>
                    <cat.icon className="size-4" />
                  </div>
                  <span className="text-[11px] font-bold text-ink-900 text-center leading-tight whitespace-normal break-words">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN / RIGHT INFORMATION RAIL                        */}
        {/* ============================================================ */}
        <div className="flex flex-col gap-4">
          {/* 1. Your Progress Card */}
          <div className="rounded-2xl border border-border bg-surface p-4.5 shadow-sm">
            <h3 className="mb-3 text-xs font-bold text-ink-900">Your Progress</h3>

            {reputation ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0056D2] text-white shadow-sm text-lg">
                      {reputation.levelBadge}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-ink-900">{reputation.levelName}</p>
                      <p className="truncate text-[10px] font-semibold text-ink-400">
                        {reputation.totalXP.toLocaleString()} {reputation.nextLevelXP ? `/ ${reputation.nextLevelXP.toLocaleString()} XP` : 'XP'}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-border bg-canvas px-2.5 py-0.5 text-[10px] font-bold text-ink-600">
                    Level {reputation.currentLevel}
                  </span>
                </div>

                {/* Blue Progress Bar */}
                {reputation.nextLevelXP && (
                  <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-border">
                    <div 
                      className="h-full rounded-full bg-[#0056D2] transition-all duration-1000" 
                      style={{ width: `${Math.min(100, Math.max(0, ((reputation.totalXP - (reputation.nextLevelXP - reputation.xpToNextLevel)) / (reputation.xpToNextLevel + (reputation.totalXP - (reputation.nextLevelXP - reputation.xpToNextLevel)))) * 100))}%` }}
                    />
                  </div>
                )}
                
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[10px] text-ink-400">
                    {reputation.nextLevelXP ? `${reputation.xpToNextLevel.toLocaleString()} XP to ${reputation.currentLevel + 1}` : 'Max level reached!'}
                  </p>
                  <Link to="/participant/achievements" className="text-[10px] font-semibold text-[#0056D2] hover:underline">
                    View achievements →
                  </Link>
                </div>
              </>
            ) : (
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-2 bg-slate-200 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Upcoming Deadlines Card */}
          <div className="rounded-2xl border border-border bg-surface p-4.5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink-900">
                Upcoming Deadlines
              </h3>
              <Link
                to={ROUTES.PARTICIPANT.CALENDAR}
                className="text-[11px] font-semibold text-[#0056D2] hover:underline dark:text-blue-400"
              >
                View all →
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between rounded-lg bg-canvas/70 p-2.5 text-left">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="truncate text-xs font-bold text-ink-900">
                    AI Innovators Hack 2026
                  </p>
                  <p className="text-[10px] text-ink-400">
                    Registration closes in
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  3 Days
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-canvas/70 p-2.5 text-left">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="truncate text-xs font-bold text-ink-900">
                    CodeFest Web3
                  </p>
                  <p className="text-[10px] text-ink-400">
                    Team formation ends in
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  5 Days
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-canvas/70 p-2.5 text-left">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="truncate text-xs font-bold text-ink-900">
                    DesignSprint Challenge
                  </p>
                  <p className="text-[10px] text-ink-400">Submission opens in</p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  7 Days
                </span>
              </div>
            </div>
          </div>

          {/* 3. Quick Actions Card */}
          <div className="rounded-2xl border border-border bg-surface p-4.5 shadow-sm">
            <h3 className="mb-3 text-xs font-bold text-ink-900">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to={ROUTES.PARTICIPANT.EVENTS}
                className="flex items-center gap-2 rounded-xl border border-border bg-canvas/60 p-2.5 transition-colors hover:bg-canvas"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Compass className="size-4" />
                </div>
                <span className="truncate text-[11px] font-bold text-ink-900">
                  Browse Events
                </span>
              </Link>

              <Link
                to={ROUTES.PARTICIPANT.MY_REGISTRATIONS}
                className="flex items-center gap-2 rounded-xl border border-border bg-canvas/60 p-2.5 transition-colors hover:bg-canvas"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <ClipboardList className="size-4" />
                </div>
                <span className="truncate text-[11px] font-bold text-ink-900">
                  My Registrations
                </span>
              </Link>

              <Link
                to="/participant/teams"
                className="flex items-center gap-2 rounded-xl border border-border bg-canvas/60 p-2.5 transition-colors hover:bg-canvas"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Users className="size-4" />
                </div>
                <span className="truncate text-[11px] font-bold text-ink-900">
                  My Teams
                </span>
              </Link>

              <Link
                to="/participant/tickets"
                className="flex items-center gap-2 rounded-xl border border-border bg-canvas/60 p-2.5 transition-colors hover:bg-canvas"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white">
                  <Ticket className="size-4" />
                </div>
                <span className="truncate text-[11px] font-bold text-ink-900">
                  My Tickets
                </span>
              </Link>
            </div>
          </div>

          {/* 4. My Teams Card */}
          <div className="rounded-2xl border border-border bg-surface p-4.5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink-900">My Teams</h3>
              <Link
                to="/participant/teams"
                className="flex items-center gap-0.5 text-[11px] font-semibold text-[#0056D2] hover:underline dark:text-blue-400"
              >
                <Plus className="size-3" /> Create Team
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {MOCK_TEAMS.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-xl bg-canvas/70 p-2.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-lg',
                        team.iconBg
                      )}
                    >
                      <Users className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-ink-900">
                        {team.name}
                      </p>
                      <p className="truncate text-[10px] text-ink-400">
                        {team.event}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 text-[10px] font-bold text-emerald-600">
                    {team.members} <span className="font-normal text-ink-400">members</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 5. Announcements Card */}
          <div className="rounded-2xl border border-border bg-surface p-4.5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-ink-900">Announcements</h3>
              <Link
                to={ROUTES.PARTICIPANT.NOTIFICATIONS}
                className="text-[11px] font-semibold text-[#0056D2] hover:underline dark:text-blue-400"
              >
                View all →
              </Link>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-canvas/70 p-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                <Megaphone className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink-900">
                  New opportunities are live!
                </p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-ink-500">
                  New hackathons and challenges have been added this week. Explore and register now!
                </p>
                <p className="mt-1 text-[9px] font-medium text-blue-600 dark:text-blue-400">
                  Today • 2:00 PM
                </p>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#0056D2]" />
              <span className="size-1.5 rounded-full bg-border" />
              <span className="size-1.5 rounded-full bg-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
