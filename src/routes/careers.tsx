import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/site/Layout";
import { useState } from "react";
import {
  ArrowRight,
  Stethoscope,
  BookOpen,
  Users,
  TrendingUp,
  Heart,
  ShieldCheck,
  Lightbulb,
  Target,
  CheckCircle2,
  MapPin,
  Briefcase,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  Upload,
} from "lucide-react";
import { whatsappHref } from "@/lib/site-data";
import { WhatsAppIcon } from "@/components/site/WhatsAppIcon";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Arise Healthcare Solutions" },
      {
        name: "description",
        content:
          "Join the Arise Healthcare Solutions team. Build your career in healthcare technology, medical equipment servicing and endoscopy repair.",
      },
    ],
  }),
  component: CareersPage,
});

/* ─── Data ───────────────────────────────────────────────── */
const whyJoin = [
  {
    num: "01",
    Icon: Heart,
    title: "Meaningful Work",
    desc: "Support technology that helps healthcare teams operate reliably and keep critical medical equipment in service.",
    accent: "text-[#18b9bb] bg-[#18b9bb]/12 ring-[#18b9bb]/25",
  },
  {
    num: "02",
    Icon: BookOpen,
    title: "Technical Growth",
    desc: "Build practical expertise across medical equipment diagnostics, repair and servicing in a focused technical environment.",
    accent: "text-blue-400 bg-blue-400/12 ring-blue-400/25",
  },
  {
    num: "03",
    Icon: Users,
    title: "Collaborative Team",
    desc: "Work alongside experienced technical and healthcare-focused professionals in a structured, supportive environment.",
    accent: "text-emerald-400 bg-emerald-400/12 ring-emerald-400/25",
  },
  {
    num: "04",
    Icon: TrendingUp,
    title: "Long-Term Opportunity",
    desc: "Develop your skills and grow within a company serving the expanding healthcare technology and equipment servicing sector.",
    accent: "text-amber-400 bg-amber-400/12 ring-amber-400/25",
  },
];

const values = [
  { Icon: Target, title: "Precision", desc: "We approach technical work carefully and systematically." },
  { Icon: ShieldCheck, title: "Reliability", desc: "We focus on dependable service and consistent technical support." },
  { Icon: Lightbulb, title: "Learning", desc: "We continuously improve our technical knowledge and capabilities." },
  { Icon: Stethoscope, title: "Healthcare Focus", desc: "We understand the importance of reliable medical equipment." },
  { Icon: CheckCircle2, title: "Integrity", desc: "We communicate clearly and work responsibly with every client." },
];

const careerSteps = [
  { title: "Learn", desc: "Gain structured exposure to medical equipment diagnostics and repair." },
  { title: "Build Expertise", desc: "Develop hands-on technical skills across endoscopy and medical systems." },
  { title: "Take Responsibility", desc: "Lead service jobs independently and manage client interactions." },
  { title: "Lead", desc: "Mentor newer team members and lead complex repair projects." },
  { title: "Grow With Arise", desc: "Build a long-term career within a growing healthcare technology company." },
];

const jobOpenings = [
  {
    id: 1,
    title: "Endoscopy Service Engineer",
    department: "Technical Services",
    location: "Vadodara, Gujarat",
    experience: "2–5 Years",
    type: "Full-time",
    about: "Join our endoscopy repair team as a Service Engineer, diagnosing and repairing flexible and rigid endoscopes, camera heads and associated medical equipment.",
    responsibilities: [
      "Diagnose and repair flexible and rigid endoscopes",
      "Service camera heads, video processors and light sources",
      "Perform leakage testing and optical inspection",
      "Document repair procedures and quality checks",
      "Communicate repair status to the service team",
    ],
    skills: ["Endoscopy equipment knowledge", "Optical systems", "PCB diagnostics", "Technical documentation"],
    qualifications: "Diploma or degree in Biomedical Engineering, Electronics, or related field.",
  },
  {
    id: 2,
    title: "Biomedical Equipment Technician",
    department: "Technical Services",
    location: "Vadodara, Gujarat",
    experience: "1–3 Years",
    type: "Full-time",
    about: "Support the technical team in diagnosing, repairing and servicing biomedical equipment including patient monitors, ventilators and medical electronics.",
    responsibilities: [
      "Assist in diagnosis and repair of biomedical equipment",
      "Perform preventive maintenance checks",
      "Support quality testing and inspection",
      "Maintain service documentation",
      "Coordinate with the technical team on repair schedules",
    ],
    skills: ["Biomedical equipment", "Basic electronics", "Medical device handling", "Attention to detail"],
    qualifications: "Diploma or degree in Biomedical Engineering or Electronics.",
  },
  {
    id: 3,
    title: "Field Service Engineer",
    department: "Field Operations",
    location: "Pan-India",
    experience: "2–4 Years",
    type: "Full-time",
    about: "Provide on-site technical support, installation assistance and preventive maintenance for healthcare facilities using Arise-serviced equipment.",
    responsibilities: [
      "Travel to healthcare facilities for on-site service",
      "Perform equipment installation and commissioning",
      "Carry out preventive maintenance visits",
      "Provide technical guidance to facility staff",
      "Report service outcomes and recommendations",
    ],
    skills: ["Field service experience", "Medical equipment knowledge", "Communication skills", "Problem-solving"],
    qualifications: "Diploma or degree in Engineering with field service experience.",
  },
  {
    id: 4,
    title: "Service Coordinator",
    department: "Operations",
    location: "Vadodara, Gujarat",
    experience: "1–3 Years",
    type: "Full-time",
    about: "Coordinate between clients, the technical team and logistics to ensure smooth service operations and clear communication throughout the repair process.",
    responsibilities: [
      "Manage incoming service requests and job scheduling",
      "Communicate with clients on repair status and timelines",
      "Coordinate equipment pickup, dispatch and logistics",
      "Maintain service records and documentation",
      "Support the technical team with administrative tasks",
    ],
    skills: ["Coordination", "Communication", "Attention to detail", "Basic technical understanding"],
    qualifications: "Graduate with experience in coordination or operations.",
  },
];

/* ─── Job card ───────────────────────────────────────────── */
function JobCard({ job }: { job: (typeof jobOpenings)[0] }) {
  const [open, setOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#193247] shadow-md transition-all duration-250 hover:border-white/18 hover:shadow-xl">
      {/* Summary */}
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#18b9bb]">
              {job.department}
            </div>
            <h3 className="text-[18px] font-bold text-white">{job.title}</h3>
          </div>
          <span className="shrink-0 rounded-full border border-[#18b9bb]/30 bg-[#18b9bb]/10 px-3 py-1 text-[11px] font-semibold text-[#18b9bb]">
            {job.type}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-[13px] text-white/50">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#18b9bb]" /> {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-[#18b9bb]" /> {job.experience}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#18b9bb]" /> {job.type}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => { setOpen((v) => !v); setApplying(false); }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/6 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-white/10"
          >
            {open ? "Hide Details" : "View Details →"}
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => { setApplying(true); setOpen(true); }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#18b9bb] px-4 py-2.5 text-[13px] font-bold text-white transition hover:brightness-110"
          >
            Apply Now <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable details */}
      {open && (
        <div className="border-t border-white/8 px-6 pb-6 pt-5">
          {!applying ? (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/40">About the Role</div>
                <p className="text-[14px] leading-relaxed text-white/60">{job.about}</p>
              </div>
              <div>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/40">Key Responsibilities</div>
                <ul className="space-y-1.5">
                  {job.responsibilities.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-[14px] text-white/60">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#18b9bb]" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/40">Required Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s) => (
                      <span key={s} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] text-white/55">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-white/40">Qualifications</div>
                  <p className="text-[13px] text-white/55">{job.qualifications}</p>
                </div>
              </div>
              <button
                onClick={() => setApplying(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#18b9bb] px-5 py-3 text-[14px] font-bold text-white transition hover:brightness-110"
              >
                Apply for This Role <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <ApplicationForm jobTitle={job.title} onCancel={() => setApplying(false)} />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Application form ───────────────────────────────────── */
function ApplicationForm({ jobTitle, onCancel }: { jobTitle: string; onCancel: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => { setBusy(false); setSubmitted(true); }, 900);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-[#18b9bb]/10 py-10 text-center ring-1 ring-[#18b9bb]/20">
        <CheckCircle2 className="h-12 w-12 text-[#18b9bb]" />
        <div className="mt-3 text-lg font-bold text-white">Application Submitted</div>
        <p className="mt-2 max-w-sm text-sm text-white/50">
          Thank you for your interest in joining Arise Healthcare Solutions. We will review your application and be in touch.
        </p>
        <button onClick={onCancel} className="mt-5 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/8 transition">
          Back to Job Details
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 text-[11px] font-bold uppercase tracking-wider text-[#18b9bb]">
        Apply — {jobTitle}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <DarkField name="name" label="Full Name" required placeholder="Your Name" />
          <DarkField name="email" label="Email" required type="email" placeholder="your@email.com" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DarkField name="phone" label="Phone" required placeholder="+91 XXXXX XXXXX" type="tel" />
          <DarkField name="experience" label="Years of Experience" placeholder="e.g. 2 years" />
        </div>
        <div>
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="font-semibold text-white/70">Message / Cover Note</span>
            <textarea
              name="message"
              rows={4}
              placeholder="Tell us about yourself and why you'd like to join Arise Healthcare Solutions..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#18b9bb]/50 focus:ring-2 focus:ring-[#18b9bb]/20 transition"
            />
          </label>
        </div>
        <div>
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="font-semibold text-white/70">Upload CV <span className="text-white/35">(optional — PDF/DOC)</span></span>
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/40 cursor-pointer hover:bg-white/8 transition">
              <Upload className="h-4 w-4 text-[#18b9bb]" />
              <span>Click to upload or drag your CV here</span>
            </div>
          </label>
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-[#18b9bb] px-6 py-3 text-[14px] font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {busy ? "Submitting…" : "Submit Application →"}
          </button>
          <button type="button" onClick={onCancel}
            className="rounded-xl border border-white/15 px-5 py-3 text-[13px] font-semibold text-white/55 transition hover:bg-white/8">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function DarkField({ name, label, required, type = "text", placeholder }: {
  name: string; label: string; required?: boolean; type?: string; placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px]">
      <span className="font-semibold text-white/70">
        {label}{required && <span className="text-red-400"> *</span>}
      </span>
      <input name={name} required={required} type={type} placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#18b9bb]/50 focus:ring-2 focus:ring-[#18b9bb]/20 transition" />
    </label>
  );
}

/* ─── Send CV standalone form ────────────────────────────── */
function SendCVForm() {
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }
  if (submitted) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-[#18b9bb]/10 py-10 text-center ring-1 ring-[#18b9bb]/20">
        <CheckCircle2 className="h-10 w-10 text-[#18b9bb]" />
        <div className="mt-3 text-base font-bold text-white">CV Received</div>
        <p className="mt-2 text-sm text-white/50">We'll keep your details on file for suitable opportunities.</p>
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <DarkField name="name" label="Full Name" required placeholder="Your Name" />
        <DarkField name="email" label="Email" required type="email" placeholder="your@email.com" />
      </div>
      <DarkField name="phone" label="Phone" placeholder="+91 XXXXX XXXXX" type="tel" />
      <div>
        <label className="flex flex-col gap-1.5 text-[13px]">
          <span className="font-semibold text-white/70">Area of Interest</span>
          <select name="interest" className="w-full rounded-xl border border-white/10 bg-[#162F42] px-3 py-2.5 text-sm text-white outline-none focus:border-[#18b9bb]/50 focus:ring-2 focus:ring-[#18b9bb]/20 transition" style={{ colorScheme: "dark" }}>
            <option value="">Select area</option>
            <option>Endoscopy Repair</option>
            <option>Biomedical Engineering</option>
            <option>Field Service</option>
            <option>Operations / Coordination</option>
            <option>Other</option>
          </select>
        </label>
      </div>
      <div>
        <label className="flex flex-col gap-1.5 text-[13px]">
          <span className="font-semibold text-white/70">Upload CV <span className="text-white/35">(PDF/DOC)</span></span>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/40 cursor-pointer hover:bg-white/8 transition">
            <Upload className="h-4 w-4 text-[#18b9bb]" />
            <span>Click to upload your CV</span>
          </div>
        </label>
      </div>
      <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#18b9bb] px-6 py-3 text-[14px] font-bold text-white transition hover:brightness-110">
        <Send className="h-4 w-4" /> Send Your CV →
      </button>
    </form>
  );
}

/* ─── Main page ──────────────────────────────────────────── */
function CareersPage() {
  const [showCV, setShowCV] = useState(false);

  return (
    <Layout>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#071C2C]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-32 top-0 h-80 w-80 rounded-full bg-[#18b9bb]/8 blur-[100px]" />
          <div className="absolute left-0 bottom-0 h-64 w-64 rounded-full bg-blue-500/6 blur-[80px]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>
        <div className="container-x relative py-20 md:py-28">
          <div className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-[#18b9bb]">
            Careers at Arise
          </div>
          <h1 className="font-display max-w-3xl text-[2.5rem] font-extrabold leading-tight text-white md:text-[3.4rem]">
            Build Your Career in<br />
            <span className="text-[#18b9bb]">Healthcare Technology</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/55">
            Join Arise Healthcare Solutions and be part of a team supporting medical equipment reliability, endoscopy technology and healthcare facilities across India.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#openings" className="inline-flex items-center gap-2 rounded-2xl bg-[#18b9bb] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110">
              View Open Positions <ArrowRight className="h-4 w-4" />
            </a>
            <button onClick={() => setShowCV(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/22 bg-white/8 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/14">
              Send Your CV →
            </button>
          </div>
          {/* Stats strip */}
          <div className="mt-12 flex flex-wrap gap-8">
            {[["8+", "Years in Healthcare"], ["10+", "Team Members"], ["2,000+", "Equipment Serviced"], ["Vadodara", "Head Office"]].map(([v, l]) => (
              <div key={l}>
                <div className="font-display text-2xl font-extrabold text-[#18b9bb]">{v}</div>
                <div className="text-[12px] text-white/40">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY JOIN ── */}
      <section className="bg-[#0B2437]">
        <div className="container-x py-16 md:py-20">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#18b9bb]">Why Join Arise</div>
          <h2 className="font-display mb-10 text-3xl font-bold text-white md:text-4xl">
            Grow With a Team That Supports Better Healthcare
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyJoin.map(({ num, Icon, title, desc, accent }) => (
              <div key={title} className="group rounded-2xl border border-white/8 bg-[#193247] p-6 transition-all duration-250 hover:-translate-y-1 hover:border-white/18 hover:shadow-xl">
                <div className={`mb-4 grid h-11 w-11 place-items-center rounded-xl ring-1 ${accent} transition-transform duration-250 group-hover:scale-105`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mb-1 text-[10px] font-bold text-white/25">{num}</div>
                <h3 className="text-[16px] font-bold text-white">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/48">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="bg-[#071C2C]">
        <div className="container-x py-16 md:py-20">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#18b9bb]">What We Value</div>
          <h2 className="font-display mb-10 text-3xl font-bold text-white md:text-4xl">How We Work at Arise</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {values.map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-[#193247] p-5 transition hover:-translate-y-0.5 hover:border-white/16">
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-[#18b9bb]/12 ring-1 ring-[#18b9bb]/25 text-[#18b9bb]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-bold text-white">{title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAREER GROWTH TIMELINE ── */}
      <section className="bg-[#0B2437]">
        <div className="container-x py-16 md:py-20">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#18b9bb]">Your Growth Journey</div>
          <h2 className="font-display mb-12 text-3xl font-bold text-white md:text-4xl">Your Path at Arise</h2>
          {/* Desktop horizontal timeline */}
          <div className="hidden lg:block">
            <div className="relative flex items-start justify-between gap-4">
              <div className="absolute left-0 right-0 top-5 h-px bg-gradient-to-r from-[#18b9bb]/60 via-[#18b9bb]/30 to-[#18b9bb]/10" aria-hidden />
              {careerSteps.map((step, i) => (
                <div key={step.title} className="relative flex-1 text-center">
                  <div className="relative z-10 mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#18b9bb] text-[13px] font-extrabold text-white shadow-[0_0_18px_rgba(24,185,187,0.4)]">
                    {i + 1}
                  </div>
                  <div className="text-[15px] font-bold text-white">{step.title}</div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-white/45">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Mobile vertical timeline */}
          <div className="space-y-6 lg:hidden">
            {careerSteps.map((step, i) => (
              <div key={step.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#18b9bb] text-[13px] font-extrabold text-white">
                    {i + 1}
                  </div>
                  {i < careerSteps.length - 1 && <div className="mt-2 w-px flex-1 bg-[#18b9bb]/30" />}
                </div>
                <div className="pb-4">
                  <div className="text-[15px] font-bold text-white">{step.title}</div>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/45">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CURRENT OPENINGS ── */}
      <section id="openings" className="bg-[#071C2C]">
        <div className="container-x py-16 md:py-20">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#18b9bb]">Current Openings</div>
          <h2 className="font-display mb-2 text-3xl font-bold text-white md:text-4xl">Open Positions</h2>
          <p className="mb-10 text-[15px] text-white/45">
            Explore current opportunities at Arise Healthcare Solutions.
          </p>
          <div className="space-y-5">
            {jobOpenings.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* ── SEND CV ── */}
      {showCV && (
        <section id="send-cv" className="bg-[#0B2437]">
          <div className="container-x py-14 md:py-16">
            <div className="mx-auto max-w-2xl">
              <div className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-[#18b9bb]">Send Your CV</div>
              <h2 className="font-display mb-2 text-2xl font-bold text-white">Don't See a Suitable Role?</h2>
              <p className="mb-8 text-[15px] text-white/45">
                Send us your CV and we'll keep your details on file for upcoming opportunities.
              </p>
              <SendCVForm />
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#126d8d] via-[#0e5c7a] to-[#0a4a62]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/6" />
          <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-white/4" />
          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-white/5 blur-[60px]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle,white 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        </div>
        <div className="container-x relative py-20 text-center md:py-24">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#18b9bb]" />
            Ready to Grow With Arise?
          </div>
          <h2 className="font-display mx-auto mb-4 max-w-2xl text-[2.2rem] font-extrabold text-white md:text-[2.8rem]">
            Let's Build Better Healthcare Support Together.
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-[16px] text-white/60">
            If you are passionate about healthcare technology, technical service and meaningful engineering work, we'd love to hear from you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="#openings" className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-[#0e5c7a] transition hover:brightness-105">
              View Open Positions <ArrowRight className="h-4 w-4" />
            </a>
            <button onClick={() => setShowCV(true)}
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/28 bg-transparent px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
              Send Your CV →
            </button>
          </div>
        </div>
      </section>

    </Layout>
  );
}
