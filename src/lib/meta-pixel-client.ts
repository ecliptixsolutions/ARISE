export function makeBrowserEventId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function readCookie(name: string) {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function trackLead(payload: {
  eventId: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  externalId?: string;
  contentName?: string;
  leadType?: string;
}) {
  window.fbq?.("track", "Lead", {}, { eventID: payload.eventId });

  await fetch("/api/meta-capi/lead", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...payload,
      eventSourceUrl: window.location.href,
      fbp: readCookie("_fbp"),
      fbc: readCookie("_fbc"),
    }),
  }).catch(() => undefined);
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}
