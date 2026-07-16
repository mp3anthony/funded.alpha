const KEY = "authDebugLog";

export function debugLog(msg: string) {
  if (typeof window === "undefined") return;
  try {
    const existing: string[] = JSON.parse(sessionStorage.getItem(KEY) || "[]");
    const time = new Date().toISOString().slice(11, 23);
    existing.push(`${time} ${msg}`);
    sessionStorage.setItem(KEY, JSON.stringify(existing.slice(-40)));
  } catch {
    // sessionStorage unavailable — nothing to do
  }
}

export function getDebugLog(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
