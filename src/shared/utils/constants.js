export const ROLES = {
  PARTICIPANT: 'participant',
  ORGANIZER: 'organizer',
  ADMIN: 'admin',
};

export const REGISTRATION_STATUS = {
  REGISTERED: 'registered',
  APPROVED: 'approved',
  WAITLISTED: 'waitlisted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};

export const REGISTRATION_STATUS_LABEL = {
  [REGISTRATION_STATUS.REGISTERED]: 'Registered',
  [REGISTRATION_STATUS.APPROVED]: 'Approved',
  [REGISTRATION_STATUS.WAITLISTED]: 'Waitlisted',
  [REGISTRATION_STATUS.REJECTED]: 'Rejected',
  [REGISTRATION_STATUS.COMPLETED]: 'Completed',
};

export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const EVENT_MODE = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  HYBRID: 'hybrid',
};

export const NOTIFICATION_TYPE = {
  REGISTRATION: 'registration',
  REMINDER: 'reminder',
  CERTIFICATE: 'certificate',
  EVENT_UPDATE: 'event_update',
  AI_RECOMMENDATION: 'ai_recommendation',
};

export const CERTIFICATE_STATUS = {
  ISSUED: 'issued',
  PENDING: 'pending',
};

export const ROUTES = {
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  PARTICIPANT: {
    DASHBOARD: '/participant/dashboard',
    EVENTS: '/participant/events',
    EVENT_DETAILS: (id = ':id') => `/participant/events/${id}`,
    REGISTER: (id = ':id') => `/participant/events/${id}/register`,
    MY_REGISTRATIONS: '/participant/my-registrations',
    NOTIFICATIONS: '/participant/notifications',
    CERTIFICATES: '/participant/certificates',
    FEEDBACK: (eventId = ':eventId') => `/participant/feedback/${eventId}`,
    PROFILE: '/participant/profile',
  },
};

export const MOCK_DELAY_MS = 300;

export const REGISTRATION_STATUS_TONE = {
  [REGISTRATION_STATUS.REGISTERED]: 'info',
  [REGISTRATION_STATUS.APPROVED]: 'success',
  [REGISTRATION_STATUS.WAITLISTED]: 'warning',
  [REGISTRATION_STATUS.REJECTED]: 'danger',
  [REGISTRATION_STATUS.COMPLETED]: 'neutral',
};

export const EVENT_STATUS_LABEL = {
  [EVENT_STATUS.DRAFT]: 'Draft',
  [EVENT_STATUS.PUBLISHED]: 'Open',
  [EVENT_STATUS.CLOSED]: 'Closed',
  [EVENT_STATUS.COMPLETED]: 'Completed',
  [EVENT_STATUS.CANCELLED]: 'Cancelled',
};

export const EVENT_STATUS_TONE = {
  [EVENT_STATUS.DRAFT]: 'neutral',
  [EVENT_STATUS.PUBLISHED]: 'success',
  [EVENT_STATUS.CLOSED]: 'warning',
  [EVENT_STATUS.COMPLETED]: 'neutral',
  [EVENT_STATUS.CANCELLED]: 'danger',
};

export const EXPERIENCE_OPTIONS = [
  { value: '0-1 years', label: '0–1 years' },
  { value: '1-3 years', label: '1–3 years' },
  { value: '3-5 years', label: '3–5 years' },
  { value: '5-10 years', label: '5–10 years' },
  { value: '10+ years', label: '10+ years' },
];
