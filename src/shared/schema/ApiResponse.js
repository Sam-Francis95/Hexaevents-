/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success
 * @property {*} data
 * @property {string} message
 * @property {{code:string,details:any[]}|null} error
 */
export function ok(data, message = '') {
  return { success: true, data, message, error: null };
}

export function fail(message, code = 'ERROR', details = []) {
  return { success: false, data: null, message, error: { code, details } };
}
