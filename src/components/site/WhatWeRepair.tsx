import { Link } from "@tanstack/react-router";
import {
  Aperture,
  ArrowRight,
  Cable,
  Camera,
  CircuitBoard,
  Lightbulb,
  Microscope,
  ScanSearch,
  SearchCheck,
  Telescope,
} from "lucide-react";

const services = [
  {
    title: "Rigid Endoscope Repair",
    description: "Precision repair and refurbishment of rigid endoscopes with image and optical system issues.",
    Icon: Telescope,
    accent: "text-cyan-400",
    iconBg: "bg-cyan-400/10 border-cyan-400/20",
    glow: "hover:shadow-cyan-500/10",
  },
  {
    title: "Nephroscope Repair",
    description: "Repair of nephroscopes including image guide, light fiber, objective lens, field lens, and water leakage-related issues.",
    Icon: Microscope,
    accent: "text-sky-400",
    iconBg: "bg-sky-400/10 border-sky-400/20",
    glow: "hover:shadow-sky-500/10",
  },
  {
    title: "Ureteroscope Repair",
    description: "Specialized repair services for ureteroscopes, including optical and light transmission components.",
    Icon: SearchCheck,
    accent: "text-violet-400",
    iconBg: "bg-violet-400/10 border-violet-400/20",
    glow: "hover:shadow-violet-500/10",
  },
  {
    title: "Image Guide Replacement",
    description: "Replacement of damaged image guide systems to restore clear visualization.",
    Icon: ScanSearch,
    accent: "text-emerald-400",
    iconBg: "bg-emerald-400/10 border-emerald-400/20",
    glow: "hover:shadow-emerald-500/10",
  },
  {
    title: "Light Fiber Replacement",
    description: "Replacement of light fiber bundles for improved illumination during procedures.",
    Icon: Lightbulb,
    accent: "text-orange-400",
    iconBg: "bg-orange-400/10 border-orange-400/20",
    glow: "hover:shadow-orange-500/10",
  },
  {
    title: "Optical System Repair",
    description: "Repair and replacement of objective lenses, field lenses, rod lenses, and other optical components.",
    Icon: Aperture,
    accent: "text-pink-400",
    iconBg: "bg-pink-400/10 border-pink-400/20",
    glow: "hover:shadow-pink-500/10",
  },
  {
    title: "Camera Head Repair",
    description: "Diagnosis and repair of camera heads and related electronic components.",
    Icon: Camera,
    accent: "text-yellow-400",
    iconBg: "bg-yellow-400/10 border-yellow-400/20",
    glow: "hover:shadow-yellow-500/10",
  },
  {
    title: "Endoscopy Equipment Electronics Repair",
    description: "PCB-level troubleshooting and repair of camera, processor, and electronic control boards.",
    Icon: CircuitBoard,
    accent: "text-teal-400",
    iconBg: "bg-teal-400/10 border-teal-400/20",
    glow: "hover:shadow-teal-500/10",
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
        <div className="mt-10 grid grid-cols-2 gap-3 max-[359px]:grid-cols-1 sm:mt-16 sm:gap-4 lg:grid-cols-4">
          {services.map(({ title, description, Icon, accent, iconBg, glow }) => (
            <div
              key={title}
              className={`group flex min-w-0 flex-col items-center rounded-2xl border border-white/8 bg-white/5 p-4 text-center transition-all duration-250 hover:-translate-y-1 hover:border-white/18 hover:bg-white/8 hover:shadow-xl sm:p-6 ${glow}`}
            >
              {/* Icon container */}
              <div
                className={`mb-4 grid h-12 w-12 shrink-0 place-items-center rounded-2xl border sm:mb-5 sm:h-14 sm:w-14 ${iconBg} transition-transform duration-250 group-hover:scale-110`}
              >
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${accent}`} />
              </div>
              {/* Text */}
              <h3 className="text-[13px] font-bold leading-snug text-white sm:text-[15px]">{title}</h3>
              <p className="mt-2 text-[12px] leading-relaxed text-white/50 sm:text-sm">{description}</p>
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
