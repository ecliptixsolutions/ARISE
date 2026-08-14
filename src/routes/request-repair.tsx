import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Layout, PageHero } from "@/components/site/Layout";
import { equipmentCategories, equipments, findServiceBySlug, services } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Copy, ArrowLeft, ArrowRight } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2, "Name required").max(120),
  organisation: z.string().max(200).optional().or(z.literal("")),
  mobile: z.string().trim().min(7, "Mobile required").max(20),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("Valid email required").max(200),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  equipment_category: z.string().max(100).optional().or(z.literal("")),
  equipment_name: z.string().trim().min(2, "Equipment name required").max(200),
  brand: z.string().max(100).optional().or(z.literal("")),
  model_no: z.string().max(100).optional().or(z.literal("")),
  serial_no: z.string().max(100).optional().or(z.literal("")),
  problem_description: z.string().trim().min(10, "Please describe the problem").max(2000),
  urgency: z.enum(["low", "normal", "urgent"]).default("normal"),
  preferred_contact: z.enum(["phone", "whatsapp", "email"]).default("phone"),
  pickup_required: z.boolean().default(false),
  consent: z.literal(true, { errorMap: () => ({ message: "Consent required" }) }),
});

function makeCode() {
  const y = new Date().getFullYear();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `AR-${y}-${rnd}`;
}

export const Route = createFileRoute("/request-repair")({
  validateSearch: (s: Record<string, unknown>) =>
    z.object({ service: z.string().optional(), equipment: z.string().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Request a Repair — Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Submit a repair request for endoscopes, camera heads, processors, PCBs and medical equipment. Fast response, transparent process.",
      },
      { property: "og:title", content: "Request a Repair" },
      {
        property: "og:description",
        content: "Submit equipment details and receive a diagnostic response from our team.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const search = useSearch({ from: "/request-repair" });
  const prefillService = search.service
    ? (findServiceBySlug(services, search.service)?.name ?? search.service)
    : "";
  const prefillEquipment =
    prefillService ||
    (search.equipment ? (equipments.find((e) => e.slug === search.equipment)?.name ?? "") : "");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ code: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw: any = Object.fromEntries(fd);
    raw.pickup_required = raw.pickup_required === "on";
    raw.consent = raw.consent === "on";
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const request_code = makeCode();
    const { error } = await supabase
      .from("repair_requests")
      .insert({ request_code, ...parsed.data });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Please try again.");
      return;
    }
    setResult({ code: request_code });
    toast.success("Request submitted");
  }

  if (result) {
    return (
      <Layout>
        <PageHero
          eyebrow="Success"
          title="Repair request received"
          subtitle="Our team will contact you shortly."
        />
        <section className="container-x mx-auto max-w-2xl py-14">
          <div className="rounded-3xl blue-panel p-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              Your request ID
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className="rounded-lg bg-surface px-4 py-3 font-mono text-lg font-semibold text-navy">
                {result.code}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.code);
                  toast.success("Copied");
                }}
                className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
              >
                <Copy className="h-4 w-4" /> Copy
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Save this ID. You can track your request anytime using your ID plus registered mobile
              or email.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/track-repair"
                search={{ code: result.code } as any}
                className="inline-flex items-center gap-2 rounded-2xl btn-primary px-5 py-3 text-sm font-semibold"
              >
                Track Request <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/"
                className="rounded-2xl border border-primary/25 bg-white px-5 py-3 text-sm font-semibold text-primary hover:bg-surface"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHero
        eyebrow="Request repair"
        title="Submit a Repair Request"
        subtitle="Share equipment details and our team will respond with next steps. This form does not collect any patient medical information."
      />
      <section className="container-x mx-auto max-w-3xl py-14">
        <div className="mb-5">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-white px-3 py-1.5 text-sm font-semibold text-primary hover:bg-surface transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
        <form onSubmit={onSubmit} className="grid gap-5 rounded-3xl blue-panel p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Field name="full_name" label="Full name" required />
            <Field name="organisation" label="Hospital / Organisation" />
            <Field name="mobile" label="Mobile" required />
            <Field name="whatsapp" label="WhatsApp (optional)" />
            <Field name="email" label="Email" required type="email" />
            <Field name="city" label="City" />
            <Field name="state" label="State" />
            <Field
              name="equipment_category"
              label="Equipment category"
              as="select"
              options={["", ...equipmentCategories]}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              name="equipment_name"
              label="Equipment name"
              required
              defaultValue={prefillEquipment}
            />
            <Field name="brand" label="Brand (if known)" />
            <Field name="model_no" label="Model number" />
            <Field name="serial_no" label="Serial number" />
          </div>
          <Field name="problem_description" label="Problem description" required as="textarea" />
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              name="urgency"
              label="Urgency"
              as="select"
              options={["low", "normal", "urgent"]}
              defaultValue="normal"
            />
            <Field
              name="preferred_contact"
              label="Preferred contact"
              as="select"
              options={["phone", "whatsapp", "email"]}
              defaultValue="phone"
            />
            <label className="flex items-center gap-2 pt-6 text-sm">
              <input type="checkbox" name="pickup_required" className="h-4 w-4" />
              Pickup required
            </label>
          </div>
          <label className="flex items-start gap-2 text-sm text-foreground/75">
            <input type="checkbox" name="consent" required className="mt-1 h-4 w-4" />I confirm the
            equipment details above are accurate and consent to being contacted about this repair. I
            understand no patient medical data should be submitted.
          </label>
          <button
            disabled={submitting}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl btn-primary py-3 text-sm font-semibold disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit Repair Request"}
          </button>
        </form>
      </section>
    </Layout>
  );
}

function Field({
  name,
  label,
  required,
  type = "text",
  as,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  as?: "textarea" | "select";
  options?: string[];
  defaultValue?: string;
}) {
  const cls =
    "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15";
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-navy">
        {label}
        {required && <span className="text-orange"> *</span>}
      </span>
      {as === "textarea" ? (
        <textarea
          name={name}
          required={required}
          rows={4}
          defaultValue={defaultValue}
          className={cls}
        />
      ) : as === "select" ? (
        <select name={name} defaultValue={defaultValue} className={cls}>
          {options?.map((o) => (
            <option key={o} value={o}>
              {o || "—"}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          required={required}
          type={type}
          defaultValue={defaultValue}
          className={cls}
        />
      )}
    </label>
  );
}
