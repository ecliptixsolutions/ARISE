import { Link } from "@tanstack/react-router";
import { Wrench, ShieldCheck, Settings, ArrowRight } from "lucide-react";

const cards = [
  {
    Icon: Wrench,
    title: "Medical Equipment Repair",
    description:
      "Professional repair and servicing for endoscopy systems and critical medical equipment, helping healthcare facilities restore equipment performance and reduce downtime.",
    to: "/services" as const,
    accent: "bg-[#18b9bb]/12 ring-1 ring-[#18b9bb]/25",
    iconColor: "text-[#18b9bb]",
  },
  {
    Icon: ShieldCheck,
    title: "Technical Support & Servicing",
    description:
      "Reliable technical support, preventive maintenance and servicing solutions designed to keep medical equipment operating safely and efficiently.",
    to: "/services" as const,
    accent: "bg-blue-400/12 ring-1 ring-blue-400/25",
    iconColor: "text-blue-400",
  },
  {
    Icon: Settings,
    title: "Equipment Installation & Support",
    description:
      "Expert assistance with equipment installation, setup, technical guidance and ongoing support for healthcare facilities.",
    to: "/services" as const,
    accent: "bg-emerald-400/12 ring-1 ring-emerald-400/25",
    iconColor: "text-emerald-400",
  },
];

export function ServicesSection() {
  return (
    <section className="bg-[#071C2C]">
      <div className="container-x py-24 md:py-28">

        {/* Header */}
        <div className="mb-16 text-center">
          <div className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#18b9bb]">
            What We Do
          </div>
          <h2 className="font-display text-[2.4rem] font-bold leading-tight text-white md:text-[2.8rem]">
            Our Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[16px] leading-relaxed text-white/48 md:text-[18px]">
            Comprehensive medical equipment repair, servicing and technical support solutions
            for healthcare facilities.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ Icon, title, description, to, accent, iconColor }) => (
            <div
              key={title}
              className="group flex flex-col rounded-[18px] border border-white/8 bg-[#193247] p-8 shadow-md transition-all duration-250 hover:-translate-y-1 hover:border-white/16 hover:shadow-xl"
            >
              {/* Icon */}
              <div
                className={`mb-6 grid h-15 w-15 place-items-center rounded-2xl ${accent} transition-all duration-250 group-hover:brightness-125`}
                style={{ height: "60px", width: "60px" }}
              >
                <Icon className={`h-7 w-7 ${iconColor}`} />
              </div>

              {/* Title */}
              <h3 className="mb-4 font-display text-[22px] font-bold leading-snug text-white">
                {title}
              </h3>

              {/* Description */}
              <p className="flex-1 text-[15px] leading-[1.65] text-white/48">
                {description}
              </p>

              {/* Learn More */}
              <Link
                to={to}
                className={`mt-7 inline-flex items-center gap-1.5 text-[15px] font-semibold ${iconColor} transition-all duration-250`}
                aria-label={`Learn more about ${title}`}
              >
                Learn More
                <ArrowRight className="h-4 w-4 transition-transform duration-250 group-hover:translate-x-1" />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
