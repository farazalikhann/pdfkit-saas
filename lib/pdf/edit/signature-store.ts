export interface SavedSignature {
  id: string;
  dataUrl: string;
  mimeType: "image/png" | "image/jpeg";
  createdAt: number;
}

const KEY = "pdfkit:saved-signatures";
const MAX_SAVED = 8;

export function loadSavedSignatures(): SavedSignature[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSignature(sig: Omit<SavedSignature, "id" | "createdAt">): SavedSignature[] {
  const existing = loadSavedSignatures();
  const next: SavedSignature = { ...sig, id: crypto.randomUUID(), createdAt: Date.now() };
  const updated = [next, ...existing].slice(0, MAX_SAVED);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // Storage full or unavailable — the signature still works for this session, just won't persist.
  }
  return updated;
}

export function deleteSignature(id: string): SavedSignature[] {
  const updated = loadSavedSignatures().filter((s) => s.id !== id);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}
