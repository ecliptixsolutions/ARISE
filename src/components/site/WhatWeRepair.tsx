import { Link } from "@tanstack/react-router";
import {
  Activity,
  Battery,
  Settings,
  Monitor,
  Cpu,
  Power,
  RotateCw,
  Layers,
  Zap,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    title: "AC Drive Repair",
    description: "Expert repair for all AC variable speed drives",
    Icon: Activity,
    accent: "text-cyan-400",
    iconBg: "bg-cyan-400/10 border-cyan-400/20",
    glow: "hover:shadow-cyan-500/10",
  },
  {
    title: "DC Drive Repair",
    description: "Comprehensive DC drive diagnostics & repair",
    Icon: Battery,
    accent: "text-sky-400",
    iconBg: "bg-sky-400/10 border-sky-400/20",
    glow: "hover:shadow-sky-500/10",
  },
  {
    title: "Servo Drive Repair",
    description: "Precision servo drive repair and testing",
    Icon: Settings,
    accent: "text-violet-400",
    iconBg: "bg-violet-400/10 border-violet-400/20",
    glow: "hover:shadow-violet-500/10",
  },
  {
    title: "VFD Repair",
    description: "Variable frequency drive repair specialists",
    Icon: Monitor,
    accent: "text-emerald-400",
    iconBg: "bg-emerald-400/10 border-emerald-400/20",
    glow: "hover:shadow-emerald-500/10",
  },
  {
    title: "PLC Repair",
    description: "PLC module repair and reprogramming",
    Icon: Cpu,
    accent: "text-orange-400",
    iconBg: "bg-orange-400/10 border-orange-400/20",
    glow: "hover:shadow-orange-500/10",
  },
  {
    title: "HMI Panel Repair",
    description: "Touch panel and HMI display repair",
    Icon: Monitor,
    accent: "text-pink-400",
    iconBg: "bg-pink-400/10 border-pink-400/20",
    glow: "hover:shadow-pink-500/10",
  },
  {
    title: "Soft Starter Repair",
    description: "Soft starter troubleshooting and repair",
    Icon: Power,
    accent: "text-yellow-400",
    iconBg: "bg-yellow-400/10 border-yellow-400/20",
    glow: "hover:shadow-yellow-500/10",
  },
  {
    title: "Servo Motor Repair",
    description: "Servo motor rewinding and reconditioning",
    Icon: RotateCw,
    accent: "text-teal-400",
    iconBg: "bg-teal-400/10 border-teal-400/20",
    glow: "hover:shadow-teal-500/10",
  },
  {
    title: "CNC Controller Repair",
    description: "CNC control board level repair",
    Icon: Layers,
    accent: "text-indigo-400",
    iconBg: "bg-indigo-400/10 border-indigo-400/20",
    glow: "hover:shadow-indigo-500/10",
  },
  {
    title: "Power Supply Repair",
    description: "Industrial SMPS and UPS repair",
    Icon: Zap,
    accent: "text-amber-400",
    iconBg: "bg-amber-400/10 border-amber-400/20",
    glow: "hover:shadow-amber-500/10",
  },
];

export function WhatWeRepair() {
  return (
    <section className="bg-[#0b2233]">
      <div className="container-x py-20 md:py-24">
        {/* Header */}
        <div className="text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#18b9bb]">
            Our Specialty
          </div>
          <h2 className="font-display text-4xl font-bold text-white md:text-[2.75rem] leading-tight">
            What We Repair
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/55 md:text-xl">
            Specialized repair services across the full spectrum of industrial electronics
          </p>
        </div>

        {/* Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {services.map(({ title, description, Icon, accent, iconBg, glow }) => (
            <div
              key={title}
              className={`group flex flex-col items-center rounded-2xl border border-white/8 bg-white/5 p-6 text-center transition-all duration-250 hover:-translate-y-1 hover:border-white/18 hover:bg-white/8 hover:shadow-xl ${glow}`}
            >
              {/* Icon container */}
              <div
                className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl border ${iconBg} transition-transform duration-250 group-hover:scale-110`}
              >
                <Icon className={`h-6 w-6 ${accent}`} />
              </div>
              {/* Text */}
              <h3 className="text-[15px] font-bold text-white leading-snug">{title}</h3>
              <p className="mt-2 text-sm text-white/50 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#18b9bb] bg-transparent px-7 py-3 text-sm font-semibold text-[#18b9bb] transition-all duration-250 hover:bg-[#18b9bb] hover:text-white"
          >
            View All Services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
