export const formatMinutes = (minutes) => {
  const safe = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(safe / 60);
  const remainder = safe % 60;
  if (!hours) return `${remainder} minute${remainder === 1 ? "" : "s"}`;
  if (!remainder) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${hours} hour${hours === 1 ? "" : "s"} ${remainder} minute${remainder === 1 ? "" : "s"}`;
};
