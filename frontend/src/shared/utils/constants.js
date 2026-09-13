export const ROLES = {
  PARTICIPANT: 'participant',
  ORGANIZER: 'event_manager',
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

export const SUBMISSION_STATUS = {
  NOT_SUBMITTED: 'not_submitted',
  SUBMITTED: 'submitted',
  PAST_DEADLINE: 'past_deadline',
};

export const SUBMISSION_STATUS_LABEL = {
  [SUBMISSION_STATUS.NOT_SUBMITTED]: 'Not submitted',
  [SUBMISSION_STATUS.SUBMITTED]: 'Submitted',
  [SUBMISSION_STATUS.PAST_DEADLINE]: 'Past deadline',
};

export const SUBMISSION_STATUS_TONE = {
  [SUBMISSION_STATUS.NOT_SUBMITTED]: 'neutral',
  [SUBMISSION_STATUS.SUBMITTED]: 'success',
  [SUBMISSION_STATUS.PAST_DEADLINE]: 'danger',
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
    CALENDAR: '/participant/calendar',
    SUBMISSION: (registrationId = ':registrationId') => `/participant/submissions/${registrationId}`,
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

// A reasonable fixed list for the Registration form's Department selection
// control (Part H.3) — "Other" reveals a follow-up free-text field rather
// than forcing every real department into this list.
export const DEPARTMENT_OPTIONS = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Product', label: 'Product' },
  { value: 'Design', label: 'Design' },
  { value: 'Data & Analytics', label: 'Data & Analytics' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Customer Success', label: 'Customer Success' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Other', label: 'Other' },
];
