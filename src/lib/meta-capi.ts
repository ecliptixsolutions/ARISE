import { createHash, randomUUID } from "node:crypto";

const META_GRAPH_VERSION = "v23.0";
const DEFAULT_PIXEL_ID = "2627672500983550";

type MetaEnv = {
  META_PIXEL_ID?: string;
  META_CAPI_ACCESS_TOKEN?: string;
  META_TEST_EVENT_CODE?: string;
};

type MetaEvent = {
  event_name: string;
  event_id: string;
  event_source_url: string;
  action_source?: "website";
  user_data?: Record<string, unknown>;
  custom_data?: Record<string, unknown>;
};

export type LeadPayload = {
  eventId?: string;
  eventSourceUrl?: string;
  fbp?: string;
  fbc?: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  externalId?: string;
  contentName?: string;
  leadType?: string;
};

export function makeMetaEventId(prefix = "evt") {
  return `${prefix}-${randomUUID()}`;
}

export function hashMetaValue(value: unknown) {
  const normalized = normalizeMetaValue(value);
  return normalized ? createHash("sha256").update(normalized).digest("hex") : undefined;
}

export function normalizeMetaValue(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("True-Client-IP") ||
    request.headers.get("X-Real-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    undefined
  );
}

export function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("Cookie") ?? "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function getFbc(request: Request, url: URL) {
  return getCookie(request, "_fbc") || makeFbc(url.searchParams.get("fbclid"));
}

export function makeFbc(fbclid: string | null) {
  return fbclid ? `fb.1.${Math.floor(Date.now() / 1000)}.${fbclid}` : undefined;
}

export function buildUserData(request: Request, payload: LeadPayload = {}) {
  const [firstName, ...lastNameParts] = (payload.firstName ?? "").trim().split(/\s+/);
  const lastName = payload.lastName || lastNameParts.join(" ");
  const url = new URL(request.url);
  const userData: Record<string, unknown> = {
    client_ip_address: getClientIp(request),
    client_user_agent: request.headers.get("User-Agent") || undefined,
    fbp: payload.fbp || getCookie(request, "_fbp"),
    fbc: payload.fbc || getFbc(request, url),
    em: hashMetaValue(payload.email),
    ph: hashMetaValue(payload.phone),
    fn: hashMetaValue(firstName),
    ln: hashMetaValue(lastName),
    ct: hashMetaValue(payload.city),
    st: hashMetaValue(payload.state),
    external_id: hashMetaValue(payload.externalId),
  };

  return Object.fromEntries(Object.entries(userData).filter(([, value]) => Boolean(value)));
}

export async function sendMetaEvent(env: MetaEnv, event: MetaEvent) {
  if (!env.META_CAPI_ACCESS_TOKEN) return;

  const pixelId = env.META_PIXEL_ID || DEFAULT_PIXEL_ID;
  const body = {
    data: [
      {
        ...event,
        action_source: event.action_source || "website",
        event_time: Math.floor(Date.now() / 1000),
      },
    ],
    ...(env.META_TEST_EVENT_CODE ? { test_event_code: env.META_TEST_EVENT_CODE } : {}),
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(
        env.META_CAPI_ACCESS_TOKEN,
      )}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000),
      },
    );

    if (!response.ok) {
      const error = (await response.json().catch(() => undefined)) as
        | { error?: { code?: number; message?: string } }
        | undefined;
      console.error("[Meta CAPI failed]", {
        event_name: event.event_name,
        event_id: event.event_id,
        status: response.status,
        code: error?.error?.code,
        message: error?.error?.message,
      });
    }
  } catch (error) {
    console.error("[Meta CAPI request failed]", {
      event_name: event.event_name,
      event_id: event.event_id,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export function sendPageView(request: Request, env: MetaEnv, ctx?: { waitUntil?: (p: Promise<void>) => void }) {
  if (request.method !== "GET") return undefined;
  const accept = request.headers.get("Accept") ?? "";
  if (!accept.includes("text/html")) return undefined;

  const eventId = makeMetaEventId("pageview");
  const event = sendMetaEvent(env, {
    event_name: "PageView",
    event_id: eventId,
    event_source_url: request.url,
    user_data: buildUserData(request),
  });

  ctx?.waitUntil?.(event);
  if (!ctx?.waitUntil) void event;
  return eventId;
}

export async function handleMetaLead(request: Request, env: MetaEnv) {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const payload = (await request.json().catch(() => ({}))) as LeadPayload;
  const eventId = payload.eventId || makeMetaEventId("lead");

  await sendMetaEvent(env, {
    event_name: "Lead",
    event_id: eventId,
    event_source_url: payload.eventSourceUrl || request.headers.get("Referer") || request.url,
    user_data: buildUserData(request, payload),
    custom_data: {
      content_name: payload.contentName,
      lead_type: payload.leadType,
    },
  });

  return Response.json({ ok: true, eventId });
}
