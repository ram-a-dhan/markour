// src/lib/clientId.ts
function generateClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback for insecure contexts (http://) e.g. during local dev server
  // where crypto.randomUUID isn't exposed. Not cryptographically strong, but
  // this id only needs to be unique per tab session, not secure.
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

let clientId: string | null = null;

export function getClientId(): string {
  if (!clientId) {
    clientId = generateClientId();
  }
  return clientId;
}
