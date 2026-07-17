/**
 * Validate values against a zod schema and return deduplicated list of missing field labels.
 * @param {object} values - form values
 * @param {z.ZodObject} schema - zod schema to validate against
 * @param {Record<string, string>} fieldLabels - map of field names to display labels
 * @param {Array<{name: string, message: string}>} [extraErrors] - additional manual errors (e.g. photo)
 * @returns {string[]} array of missing field labels
 */
export function getMissingFields(values, schema, fieldLabels = {}, extraErrors = []) {
  const result = schema.safeParse(values);
  const fields = [];

  if (!result.success) {
    const seen = new Set();
    result.error.errors.forEach((err) => {
      const name = err.path[0];
      if (!seen.has(name)) {
        seen.add(name);
        fields.push(fieldLabels[name] || name);
      }
    });
  }

  extraErrors.forEach(({ name }) => {
    if (!fields.includes(fieldLabels[name] || name)) {
      fields.push(fieldLabels[name] || name);
    }
  });

  return fields;
}
