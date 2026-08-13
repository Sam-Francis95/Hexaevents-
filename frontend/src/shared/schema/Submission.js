/**
 * @typedef {Object} Submission
 * @property {string|null} id - null when nothing has been submitted yet
 * @property {string} registrationId
 * @property {string} eventId
 * @property {string} userId
 * @property {string|null} githubLink
 * @property {string|null} driveVideoLink
 * @property {string|null} pdfUrl
 * @property {string|null} submittedAt
 * @property {string|null} submissionDeadline
 * @property {'not_submitted'|'submitted'|'past_deadline'} status
 */
export const SubmissionShape = {};
