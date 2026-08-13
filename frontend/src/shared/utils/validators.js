export function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Only meant to gate genuinely optional URL fields (GitHub link, Drive video
 * link) -- an empty value is not this function's concern, callers decide
 * whether blank is acceptable. When non-empty, requires an http(s) URL.
 */
export function isValidUrl(value = '') {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isRequired(value) {
  return value !== undefined && value !== null && String(value).trim().length > 0;
}

export function minLength(value = '', length) {
  return String(value).trim().length >= length;
}

/**
 * Validate a values object against a rules object.
 * rules: { fieldName: (value, allValues) => string | null }
 * returns: { fieldName: string } of only failing fields
 */
export function validate(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const message = rule(values[field], values);
    if (message) errors[field] = message;
  }
  return errors;
}
