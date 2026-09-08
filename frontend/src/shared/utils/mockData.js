import { EVENT_STATUS, EVENT_MODE } from './constants';

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS (Exact matches from the target design specifications)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_EVENTS = [
  {
    id: 'mock-1',
    title: 'AI Innovators Hack 2026',
    description: 'Build AI solutions for real-world challenges.',
    category: 'HACKATHON',
    startDate: '2026-08-24T09:00:00Z',
    endDate: '2026-08-26T18:00:00Z',
    dateDisplay: '24 - 26 Aug 2026',
    registrationDeadline: '2026-08-20T23:59:59Z',
    location: 'Online',
    mode: EVENT_MODE.ONLINE,
    status: EVENT_STATUS.PUBLISHED,
    bannerUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    prizeInfo: '₹2,00,000 Prize Pool',
    capacity: 500,
    registeredCount: 342,
    badgeColor: 'bg-[#7C3AED] text-white',
    btnColor: 'bg-[#7C3AED] hover:bg-[#6D28D9]',
    iconType: 'ai',
    requiresTicket: true,
  },
  {
    id: 'mock-2',
    title: 'Smart India Ideathon',
    description: 'Solve real-world problems through innovation.',
    category: 'IDEATHON',
    startDate: '2026-08-28T09:00:00Z',
    endDate: '2026-08-30T18:00:00Z',
    dateDisplay: '28 - 30 Aug 2026',
    registrationDeadline: '2026-08-25T23:59:59Z',
    location: 'Bengaluru',
    mode: EVENT_MODE.OFFLINE,
    status: EVENT_STATUS.PUBLISHED,
    bannerUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800',
    prizeInfo: 'Team Size: 2 - 4',
    capacity: 200,
    registeredCount: 150,
    badgeColor: 'bg-[#16A34A] text-white',
    btnColor: 'bg-[#16A34A] hover:bg-[#15803D]',
    iconType: 'ideathon',
    requiresTicket: true,
  },
  {
    id: 'mock-3',
    title: 'CodeFest Web3',
    description: 'Build the next generation of Web3 applications.',
    category: 'HACKATHON',
    startDate: '2026-09-01T09:00:00Z',
    endDate: '2026-09-03T18:00:00Z',
    dateDisplay: '1 - 3 Sep 2026',
    registrationDeadline: '2026-08-28T23:59:59Z',
    location: 'Online',
    mode: EVENT_MODE.ONLINE,
    status: EVENT_STATUS.PUBLISHED,
    bannerUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800',
    prizeInfo: '₹1,50,000 Prize Pool',
    capacity: 1000,
    registeredCount: 800,
    badgeColor: 'bg-[#3B82F6] text-white',
    btnColor: 'bg-[#2563EB] hover:bg-[#1D4ED8]',
    iconType: 'web3',
    requiresTicket: false,
  },
  {
    id: 'mock-4',
    title: 'DesignSprint Challenge',
    description: 'Solve problems. Design solutions. Create impact.',
    category: 'WORKSHOP',
    startDate: '2026-09-05T09:00:00Z',
    endDate: '2026-09-05T18:00:00Z',
    dateDisplay: '5 Sep 2026',
    registrationDeadline: '2026-09-01T23:59:59Z',
    location: 'Mumbai',
    mode: EVENT_MODE.OFFLINE,
    status: EVENT_STATUS.PUBLISHED,
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
    prizeInfo: 'Participation Certificate',
    capacity: 300,
    registeredCount: 290,
    badgeColor: 'bg-[#EA580C] text-white',
    btnColor: 'bg-[#EA580C] hover:bg-[#C2410C]',
    iconType: 'design',
    requiresTicket: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRATIONS (Matches Image 2 left column)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_REGISTRATIONS = [
  {
    id: 'reg-1',
    eventId: 'mock-1',
    event: MOCK_EVENTS[0],
    title: 'AI Innovators Hack 2026',
    dateDisplay: '24 - 26 Aug 2026',
    status: 'Approved',
    statusPillClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
    iconType: 'ai',
  },
  {
    id: 'reg-2',
    eventId: 'mock-2',
    event: MOCK_EVENTS[1],
    title: 'Smart India Ideathon',
    dateDisplay: '28 - 30 Aug 2026',
    status: 'Registered',
    statusPillClass: 'bg-teal-500/10 text-teal-600 border border-teal-500/20 dark:bg-teal-500/20 dark:text-teal-400',
    iconType: 'ideathon',
  },
  {
    id: 'reg-3',
    eventId: 'mock-3',
    event: MOCK_EVENTS[2],
    title: 'CodeFest Web3 Hackathon',
    dateDisplay: '1 - 3 Sep 2026',
    status: 'Waitlisted',
    statusPillClass: 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    iconType: 'web3',
  },
  {
    id: 'reg-4',
    eventId: 'mock-4',
    event: MOCK_EVENTS[3],
    title: 'DesignSprint Challenge',
    dateDisplay: '5 Sep 2026',
    status: 'Pending',
    statusPillClass: 'bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400',
    iconType: 'design',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MY TICKETS
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_TICKETS = [
  {
    id: 'ticket-1',
    ticketNumber: 'HEX-AIH-48291',
    participantId: 'user-123',
    participantName: 'Priya',
    participantRole: 'Participant',
    registrationId: 'reg-1',
    eventId: 'mock-1',
    event: MOCK_EVENTS[0], // AI Innovators Hack 2026 (requiresTicket: true)
    status: 'CONFIRMED', // CONFIRMED, CANCELLED, EXPIRED
    checkInStatus: 'NOT_CHECKED_IN', // NOT_CHECKED_IN, CHECKED_IN
    qrToken: 'verify-token-aih-48291',
    createdAt: '2026-08-20T10:00:00Z',
    accessLevel: 'General Participant',
    checkedInAt: null,
    checkedInBy: null,
    checkInLocation: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RECOMMENDED FOR YOU (Matches Image 2 right sub-column)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_RECOMMENDED = [
  {
    id: 'rec-1',
    title: 'Security Awareness Challenge',
    dateDisplay: '5 - 7 Jun 2026 • Online',
    category: 'Competition',
    categoryClass: 'text-purple-600 bg-purple-500/10 border border-purple-500/20',
    iconType: 'security',
  },
  {
    id: 'rec-2',
    title: 'Product Analytics with SQL',
    dateDisplay: '10 - 12 Jun 2026 • Online',
    category: 'Workshop',
    categoryClass: 'text-pink-600 bg-pink-500/10 border border-pink-500/20',
    iconType: 'analytics',
  },
  {
    id: 'rec-3',
    title: 'AI Builders Challenge',
    dateDisplay: '15 - 17 Jun 2026 • Online',
    category: 'Hackathon',
    categoryClass: 'text-blue-600 bg-blue-500/10 border border-blue-500/20',
    iconType: 'ai_build',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MY TEAMS
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_TEAMS = [
  {
    id: 'team-1',
    name: 'Neural Ninjas',
    event: 'AI Innovators Hack 2026',
    members: '4 / 5',
    iconBg: 'bg-blue-500/10 text-blue-600',
  },
  {
    id: 'team-2',
    name: 'ChainBreakers',
    event: 'CodeFest Web3 Hackathon',
    members: '3 / 5',
    iconBg: 'bg-amber-500/10 text-amber-600',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS & CERTIFICATES
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'registration',
    title: 'Registration Confirmed',
    message: 'Your registration for AI Innovators Hack 2026 has been confirmed.',
    read: false,
    createdAt: '2026-08-24T10:05:00Z',
  },
  {
    id: 'notif-2',
    type: 'reminder',
    title: 'Deadline Reminder',
    message: 'AI Innovators Hack 2026 registration closes in 3 days. Don\'t miss out!',
    read: false,
    createdAt: '2026-08-21T09:00:00Z',
  },
  {
    id: 'notif-3',
    type: 'ai_recommendation',
    title: 'Team Invitation',
    message: 'You have been invited to join Neural Ninjas for CodeFest Web3 Hackathon.',
    read: false,
    createdAt: '2026-08-20T15:30:00Z',
  },
];

export const MOCK_CERTIFICATES = [
  {
    id: 'cert-1',
    eventId: 'mock-4',
    title: 'DesignSprint 2025',
    issuedAt: '2025-11-20T00:00:00Z',
    downloadUrl: '#',
    previewUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=400',
    status: 'issued',
  },
];
