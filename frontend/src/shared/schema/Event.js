/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {'online'|'offline'|'hybrid'} mode
 * @property {string} venue
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} registrationDeadline
 * @property {number} capacity
 * @property {number} registeredCount
 * @property {string[]} speakers
 * @property {{time:string,title:string}[]} agenda
 * @property {'draft'|'published'|'closed'|'completed'|'cancelled'} status
 * @property {string} organizerId
 * @property {string} organizerName
 * @property {boolean} requiresSubmission
 * @property {{min:number,max:number}|null} teamSizeLimit
 * @property {string|null} submissionDeadline
 * @property {string} bannerColor
 * @property {string} createdAt
 * @property {string} updatedAt
 */
export const EventShape = {};
