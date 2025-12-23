export const getUserId = () => {
  const stored = localStorage.getItem("userId");
  if (!stored) return null;

  // Try to parse JSON; if it fails, treat as plain string
  try {
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object' && parsed._id) return parsed._id;
  } catch (_) {
    // fall through to plain string
  }

  // Plain string id
  return stored;
};