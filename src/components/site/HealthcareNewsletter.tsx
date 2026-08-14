import { useState } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";

const features = [
  "Medical Equipment Insights",
  "Maintenance & Servicing Tips",
  "Equipment Care Guidance",
  "Healthcare Technology Updates",
];

export function HealthcareNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  }

  return (
    <section className="bg-[#071C2C]">
      <div className="container-x py-20 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

          {/* ── LEFT ── */}
          <div>
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#18b9bb]">
              Healthcare Insights
            </div>
            <h2 className="font-display text-[2.3rem] font-bold leading-tight text-white md:text-[2.6rem]">
              Stay Ahead in{" "}
              <span className="text-[#18b9bb]">Healthcare Technology</span>
            </h2>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-white/50">
              Get useful insights on medical equipment, maintenance, servicing, healthcare
              technology and equipment management from Arise Healthcare Solutions.
            </p>

            {/* Feature rows */}
            <ul className="mt-7 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#18b9bb]/15 ring-1 ring-[#18b9bb]/30">
                    <CheckCircle2 className="h-3 w-3 text-[#18b9bb]" />
                  </span>
                  <span className="text-[14px] text-white/60">{f}</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 text-[12px] text-white/28">
              No spam. Useful information only.
            </p>
          </div>

          {/* ── RIGHT — card ── */}
          <div className="rounded-[20px] border border-white/10 bg-[#0D2638] p-7 shadow-2xl md:p-9">
            {/* Card header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#18b9bb]/15 ring-1 ring-[#18b9bb]/25">
                <Mail className="h-5 w-5 text-[#18b9bb]" />
              </div>
              <div>
                <div className="text-[16px] font-bold text-white">Get Healthcare Insights</div>
                <div className="text-[13px] text-white/42">
                  Useful updates for healthcare professionals and facility teams.
                </div>
              </div>
            </div>

            {subscribed ? (
              <div className="flex flex-col items-center rounded-2xl bg-[#18b9bb]/10 py-10 text-center ring-1 ring-[#18b9bb]/20">
                <CheckCircle2 className="h-10 w-10 text-[#18b9bb]" />
                <div className="mt-3 text-base font-bold text-white">You&rsquo;re subscribed!</div>
                <div className="mt-1 text-sm text-white/45">
                  Thank you — we&rsquo;ll send useful updates your way.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <label className="mb-2 block text-[13px] font-semibold text-white/55">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#18b9bb]/50 focus:ring-2 focus:ring-[#18b9bb]/20 transition mb-3"
                  aria-label="Email address for healthcare insights newsletter"
                />
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#18b9bb] py-3.5 text-sm font-bold text-white transition hover:brightness-110"
                >
                  <Send className="h-4 w-4" />
                  Subscribe Now
                </button>
              </form>
            )}

            {/* Divider + trust row */}
            <div className="mt-6 border-t border-white/8 pt-5">
              <div className="flex items-center justify-center gap-6">
                {["Useful Updates", "Professional Insights", "No Spam"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-[12px] text-white/32">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#18b9bb]/60" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
