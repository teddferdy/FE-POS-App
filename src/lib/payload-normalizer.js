/**
 * Utility to normalize form payloads before sending to API services.
 * Handles store context, JSON serialization, and optional field cleanup.
 */

export const normalizePayload = (data, options = {}) => {
  const { isFormData = true, jsonFields = [], storeField = 'store' } = options;

  if (isFormData) {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      // Handle store fields specifically
      if (key === storeField || key === 'stores') {
        if (Array.isArray(value)) {
          formData.append(key, value.length > 0 ? JSON.stringify(value) : '');
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
        return;
      }

      // Handle JSON fields
      if (jsonFields.includes(key)) {
        formData.append(key, JSON.stringify(value));
        return;
      }

      // Handle standard fields
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });
    return formData;
  }

  // Handle JSON payload
  const normalized = { ...data };
  Object.keys(normalized).forEach(key => {
    if (normalized[key] === undefined || normalized[key] === null || normalized[key] === '') {
      delete normalized[key];
    }
  });
  return normalized;
};
