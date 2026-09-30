/**
 * HB-2 R1: authoritative store lifecycle field for location payloads.
 *
 * The UI sends `status` ("draft" | "active" | "inactive") as the single
 * lifecycle input and never sends `isActive`: FormData stringifies booleans,
 * so isActive:"false" would arrive truthy and the BE must not interpret it.
 *
 * - saveAsDraft always resolves to "draft" (existing draft behavior).
 * - otherwise the lifecycle control must have been touched; an untouched
 *   control resolves to undefined so a configuration-only edit carries no
 *   lifecycle field (normalizePayload drops undefined in both JSON and
 *   FormData modes).
 */
export const resolveSubmitStatus = ({ saveAsDraft, lifecycleTouched, isActive } = {}) => {
  if (saveAsDraft) return "draft";
  if (!lifecycleTouched) return undefined;
  return isActive ? "active" : "inactive";
};
