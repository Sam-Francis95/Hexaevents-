export function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
