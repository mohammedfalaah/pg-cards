export const getUserId = () => {
  const stored = localStorage.getItem("userData");
  if (!stored) return null;
  try {
    return JSON.parse(stored)._id;
  } catch {
    return null;
  }
};
