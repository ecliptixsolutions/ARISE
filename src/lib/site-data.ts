// Central static content for Arise Healthcare Solutions.
// Editable placeholders live under `settings` — swap them from admin later.

import endoscopeImg from "@/assets/eq-endoscope.jpg";
import cameraImg from "@/assets/eq-camera.jpg";
import processorImg from "@/assets/eq-processor.jpg";
import lightImg from "@/assets/eq-lightsource.jpg";
import monitorImg from "@/assets/eq-monitor.jpg";
import co2Img from "@/assets/eq-co2.jpg";
import serviceMicroscopeRepairImg from "@/assets/service-microscope-repair.jpg";
import servicePcbDiagnosisImg from "@/assets/service-pcb-diagnosis.jpg";
import serviceLabTestingImg from "@/assets/service-lab-testing.jpg";
import serviceOpticalInspectionImg from "@/assets/service-optical-inspection.jpg";
import serviceMedicalEquipmentImg from "@/assets/service-medical-equipment.jpg";
import serviceEndoscopyCardImg from "@/assets/service-endoscopy-card.png";
import serviceRigidScopeImg from "@/assets/image.png";
import serviceNephroscopeRepairImg from "@/assets/service-nephroscope-repair.png";
import serviceEndoscopyRepairImg from "@/assets/service-endoscopy-repair.png";
import serviceBoardLevelRepairImg from "@/assets/service-board-level-repair.png";
import serviceProcessorRepairImg from "@/assets/service-processor-repair.png";
import serviceMedicalMonitorRepairImg from "@/assets/service-medical-monitor-repair.png";
import arthroscopeRepairImg from "@/assets/service-card-backgrounds/arthroscope-repair.png";
import cameraHeadRepairImg from "@/assets/service-card-backgrounds/camera-head-repair.png";
import cystoscopeRepairImg from "@/assets/service-card-backgrounds/cystoscope-repair.png";
import diathermyRepairImg from "@/assets/service-card-backgrounds/diathermy-repair.png";
import laparoscopeRepairImg from "@/assets/service-card-backgrounds/laparoscope-repair.png";
import lightSourceRepairImg from "@/assets/service-card-backgrounds/light-source-repair.png";
import patientMonitorRepairImg from "@/assets/service-card-backgrounds/patient-monitor-repair.png";
import ultrasoundRepairImg from "@/assets/service-card-backgrounds/ultrasound-repair.png";
import ureteroscopeRepairImg from "@/assets/service-card-backgrounds/ureteroscope-repair.png";
import ventilatorRepairImg from "@/assets/service-card-backgrounds/ventilator-repair.png";

export const settings = {
  company: "Arise Healthcare Solutions",
  tagline: "Precision Endoscopy Repair. Trusted Healthcare Solutions.",
  phonePlaceholder: "+91 9974086447",
  secondaryPhonePlaceholder: "+91 8530100483",
  whatsappPlaceholder: "+91 9974086447",
  emailPlaceholder: "arisehealthcaresolutions1@gmail.com",
  address: "606/ SAHYOG SPACE NR PANCHAM PUSHPA VILLA NEW ALKAPURI, Vadodara, Gujarat, India",
  hoursPlaceholder: "Mon – Sat · 09:30 to 19:00 IST",
  mapsUrl: "",
  social: { linkedin: "", facebook: "", instagram: "", youtube: "" },
};

export function phoneHref(phone = settings.phonePlaceholder) {
  return `tel:+${phone.replace(/\D/g, "")}`;
}

export function whatsappHref(text?: string) {
  const num = settings.whatsappPlaceholder.replace(/\D/g, "");
  const msg = encodeURIComponent(
    text ?? "Hello Arise team, I would like to know about medical equipment repair.",
  );
  return `https://wa.me/${num || ""}?text=${msg}`;
}

export type Service = {
  slug: string;
  aliases?: string[];
  name: string;
  short: string;
  description: string;
  detailedDescription: string;
  commonProblems: string[];
  bullets: string[];
  category: string;
  featured: boolean;
  published?: boolean;
  primaryImageId?: string;
  carouselImageIds?: string[];
  heroImages?: ServiceImage[];
};

export type ServiceImage = {
  id: string;
  src: string;
  alt: string;
  order?: number;
  sourceLabel?: string;
  sourceUrl?: string;
  license?: string;
};

export const serviceImages: ServiceImage[] = [
  {
    id: "optical-inspection",
    src: serviceOpticalInspectionImg,
    alt: "Technician inspecting optical equipment at a technical service bench",
    sourceLabel: "Pexels / Bulat843",
    sourceUrl:
      "https://www.pexels.com/photo/technician-operating-optical-lens-machine-in-workshop-37492306/",
    license: "Pexels License",
  },
  {
    id: "camera-processor",
    src: serviceMedicalEquipmentImg,
    alt: "Medical camera processor and monitoring equipment prepared for servicing",
    sourceLabel: "Pexels / Jonathan Borba",
    sourceUrl: "https://www.pexels.com/photo/hospital-equipment-with-monitors-13697729/",
    license: "Pexels License",
  },
  {
    id: "pcb-diagnosis",
    src: servicePcbDiagnosisImg,
    alt: "Technician diagnosing a circuit board with microscope and test instruments",
    sourceLabel: "Pexels / Multitech Institute",
    sourceUrl: "https://www.pexels.com/photo/technician-repairing-pcb-with-microscope-35157345/",
    license: "Pexels License",
  },
  {
    id: "endoscope-inspection",
    src: serviceMicroscopeRepairImg,
    alt: "Technician repairing compact electronic components under a microscope",
    sourceLabel: "Pexels / Tima Miroshnichenko",
    sourceUrl:
      "https://www.pexels.com/photo/a-person-repairing-the-board-on-the-microscope-6755066/",
    license: "Pexels License",
  },
  {
    id: "lab-testing",
    src: serviceLabTestingImg,
    alt: "Laboratory technician operating medical testing equipment in a clean technical lab",
    sourceLabel: "Pexels / Tima Miroshnichenko",
    sourceUrl: "https://www.pexels.com/photo/man-technology-white-zoom-9574541/",
    license: "Pexels License",
  },
];

export const serviceImageIds = serviceImages.map((image) => image.id);

export function getDefaultPrimaryImageId(slug: string) {
  if (slug.includes("camera-head") || slug.includes("processor") || slug.includes("monitor"))
    return "camera-processor";
  if (slug.includes("pcb") || slug.includes("board") || slug.includes("diathermy"))
    return "pcb-diagnosis";
  if (slug.includes("light-source") || slug.includes("co2") || slug.includes("ventilator"))
    return "lab-testing";
  return "optical-inspection";
}

export function normaliseService(service: Service): Service {
  const primaryImageId = service.primaryImageId ?? getDefaultPrimaryImageId(service.slug);
  return {
    ...service,
    published: service.published !== false,
    primaryImageId,
    carouselImageIds: service.carouselImageIds?.length ? service.carouselImageIds : serviceImageIds,
  };
}

export function findStaticServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug || service.aliases?.includes(slug));
}

export function findServiceBySlug(list: Service[], slug: string) {
  return list.find((service) => service.slug === slug || service.aliases?.includes(slug));
}

export function getServiceCarouselImages(service: Service) {
  if (service.heroImages?.length) {
    const orderedUploads = [...service.heroImages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const primaryUpload = orderedUploads.find((image) => image.id === service.primaryImageId);
    return primaryUpload
      ? [primaryUpload, ...orderedUploads.filter((image) => image.id !== primaryUpload.id)]
      : orderedUploads;
  }

  const ordered = (service.carouselImageIds?.length ? service.carouselImageIds : serviceImageIds)
    .map((id) => serviceImages.find((image) => image.id === id))
    .filter(Boolean) as ServiceImage[];
  const availableImages = ordered.length ? ordered : serviceImages;
  const primaryId = service.primaryImageId ?? getDefaultPrimaryImageId(service.slug);
  const primary = availableImages.find((image) => image.id === primaryId);
  return primary
    ? [primary, ...availableImages.filter((image) => image.id !== primary.id)]
    : availableImages;
}

export const services: Service[] = [
  {
    slug: "endoscopy-repair",
    name: "Endoscopy Repair",
    category: "Endoscopy",
    featured: true,
    primaryImageId: "endoscopy-repair",
    heroImages: [
      {
        id: "endoscopy-repair",
        src: serviceEndoscopyRepairImg,
        alt: "Flexible endoscope prepared for endoscopy repair",
      },
    ],
    short: "Precision repair for rigid and flexible endoscopes at component and board level.",
    description:
      "Comprehensive endoscopy repair covering optics, articulation, seals, working channels and control mechanisms. Every scope is fully tested before dispatch.",
    detailedDescription:
      "Arise Healthcare Solutions provides inspection, diagnosis and professional repair support for rigid and flexible endoscopes. The service may include optical alignment, lens inspection, articulation system repair, sheath restoration, leakage inspection, connector servicing and final image-quality testing.",
    commonProblems: [
      "Damaged optical system",
      "Poor or unclear image",
      "Light transmission failure",
      "Fluid leakage",
      "Damaged bending section",
      "Broken connectors",
      "Electronic board fault",
    ],
    bullets: [
      "Optical alignment & lens cleaning",
      "Leakage testing",
      "Articulation & bending section repair",
      "Distal tip & sheath restoration",
    ],
  },
  {
    slug: "rigid-scope-repair",
    name: "Rigid Scope Repair",
    category: "Endoscopy",
    featured: true,
    short: "Repair of laparoscopes, arthroscopes, cystoscopes and other rigid endoscopes.",
    description:
      "Complete rigid scope refurbishment including rod-lens replacement, sheath straightening and eyepiece restoration.",
    detailedDescription:
      "Arise Healthcare Solutions inspects rigid scope optics, sheaths, bridges, working channels, connectors and light-transmission components before completing functional testing and final quality verification.",
    commonProblems: [
      "Blurred image",
      "Cracked rod-lens",
      "Bent sheath tube",
      "Damaged eyepiece",
      "Poor light transmission",
      "Internal contamination",
      "Autoclave seal failure",
    ],
    bullets: [
      "Rod-lens system repair",
      "Autoclave seal replacement",
      "Sheath straightening",
      "Image clarity restoration",
    ],
  },
  {
    slug: "flexible-scope-repair",
    name: "Flexible Scope Repair",
    category: "Endoscopy",
    featured: true,
    primaryImageId: "flexible-scope-repair",
    heroImages: [
      {
        id: "flexible-scope-repair",
        src: endoscopeImg,
        alt: "Flexible scope prepared for repair",
      },
    ],
    short: "Full-service repair for flexible video and fibre endoscopes.",
    description:
      "Flexible scope repair covering CCD/CMOS, angulation wires, insertion tubes and working channels.",
    detailedDescription:
      "The service covers inspection and repair of optics, insertion components, working channels, connectors, deflection systems and image-transmission parts, depending on the equipment type and condition.",
    commonProblems: [
      "Poor image quality",
      "Damaged working channel",
      "Fluid leakage",
      "Deflection problem",
      "Broken fibre bundle",
      "Insertion-section damage",
      "Connector damage",
    ],
    bullets: [
      "Insertion tube replacement",
      "Angulation wire re-tension",
      "CCD/CMOS troubleshooting",
      "Channel integrity restoration",
    ],
  },
  {
    slug: "nephroscope-repair",
    name: "Nephroscope Repair",
    category: "Urology",
    featured: true,
    primaryImageId: "nephroscope-repair",
    heroImages: [
      {
        id: "nephroscope-repair",
        src: serviceNephroscopeRepairImg,
        alt: "Nephroscope instrument set for repair servicing",
      },
    ],
    short:
      "Specialised nephroscope servicing for damaged optics, sheaths, eyepieces, connectors and image-quality problems.",
    description:
      "Full nephroscope repair including irrigation channel checks and optical alignment.",
    detailedDescription:
      "Arise Healthcare Solutions provides inspection, diagnosis and professional repair support for rigid and flexible nephroscopes. The service may include optical alignment, lens inspection, sheath restoration, leakage inspection, connector servicing and final image-quality testing.",
    commonProblems: [
      "Blurred or dark image",
      "Damaged optical lenses",
      "Bent or damaged sheath",
      "Fluid leakage",
      "Loose eyepiece",
      "Light transmission problem",
      "Damaged connectors",
    ],
    bullets: [
      "Optical rod repair",
      "Sheath restoration",
      "Working channel integrity",
      "Post-repair testing",
    ],
  },
  {
    slug: "ureteroscope-repair",
    name: "Ureteroscope Repair",
    category: "Urology",
    featured: true,
    primaryImageId: "ureteroscope-repair",
    heroImages: [
      {
        id: "ureteroscope-repair",
        src: serviceRigidScopeImg,
        alt: "Ureteroscope prepared for repair",
      },
    ],
    short:
      "Professional repair support for semi-rigid and flexible ureteroscopes with careful handling of delicate internal components.",
    description:
      "Rigid and flexible ureteroscope repair carried out with specialised jigs and diagnostic tooling.",
    detailedDescription:
      "The service covers inspection and repair of optics, insertion components, working channels, connectors, deflection systems and image-transmission parts, depending on the equipment type.",
    commonProblems: [
      "Poor image quality",
      "Damaged working channel",
      "Fluid leakage",
      "Deflection problem",
      "Broken fibre bundle",
      "Connector damage",
      "Insertion-section damage",
    ],
    bullets: [
      "Flexible tip repair",
      "Deflection angle restoration",
      "Optical clarity checks",
      "Leakage validation",
    ],
  },
  {
    slug: "cystoscope-repair",
    name: "Cystoscope Repair",
    category: "Urology",
    featured: true,
    primaryImageId: "cystoscope-repair",
    heroImages: [
      {
        id: "cystoscope-repair",
        src: serviceEndoscopyCardImg,
        alt: "Cystoscope repair instruments on a service bench",
      },
    ],
    short:
      "Repair and servicing for rigid and flexible cystoscopes used in diagnostic and surgical procedures.",
    description: "Optical, sheath and mechanical repair for cystoscopes across major brands.",
    detailedDescription:
      "Arise Healthcare Solutions inspects cystoscope optics, sheaths, bridges, working channels, connectors and light-transmission components before completing functional testing.",
    commonProblems: [
      "Optical damage",
      "Distorted image",
      "Damaged sheath",
      "Leakage",
      "Light loss",
      "Connector failure",
      "Working-channel damage",
    ],
    bullets: [
      "Optical repair",
      "Working channel service",
      "Mechanical repair",
      "Full function verification",
    ],
  },
  {
    slug: "laparoscope-repair",
    name: "Laparoscope Repair",
    category: "Endoscopy",
    featured: true,
    primaryImageId: "laparoscope-repair",
    heroImages: [
      {
        id: "laparoscope-repair",
        src: serviceEndoscopyCardImg,
        alt: "Laparoscope repair instruments on a service bench",
      },
    ],
    short: "Rod-lens, sheath, eyepiece and image-quality repair for laparoscopic equipment.",
    description:
      "Laparoscopes brought back to sharp image quality and clean autoclavable condition.",
    detailedDescription:
      "The service includes inspection of optical components, rod-lens systems, light transmission, exterior tubes, eyepieces and connectors for laparoscopic equipment.",
    commonProblems: [
      "Blurred image",
      "Cracked lens",
      "Bent tube",
      "Damaged eyepiece",
      "Poor light transmission",
      "Internal contamination",
      "Connector damage",
    ],
    bullets: [
      "Rod-lens replacement",
      "Sheath straightening",
      "Eyepiece repair",
      "Autoclave seal replacement",
    ],
  },
  {
    slug: "arthroscope-repair",
    name: "Arthroscope Repair",
    category: "Endoscopy",
    featured: true,
    primaryImageId: "arthroscope-repair",
    heroImages: [
      {
        id: "arthroscope-repair",
        src: serviceEndoscopyCardImg,
        alt: "Arthroscope repair instruments on a service bench",
      },
    ],
    short:
      "Precision repair support for arthroscopes, including optical alignment, lens servicing and sheath restoration.",
    description:
      "Arthroscope repair including small-diameter rod-lens restoration and sheath work.",
    detailedDescription:
      "The equipment is carefully inspected for optical faults, tube damage, image distortion, light loss and connection issues before final quality testing.",
    commonProblems: [
      "Unclear image",
      "Damaged objective lens",
      "Bent sheath",
      "Light loss",
      "Internal moisture",
      "Loose eyepiece",
      "Connector fault",
    ],
    bullets: ["Optical alignment", "Sheath repair", "Distal window replacement", "Leakage tests"],
  },
  {
    slug: "camera-head-repair",
    name: "Camera Head Repair",
    category: "Imaging",
    featured: true,
    primaryImageId: "camera-head-repair",
    heroImages: [
      {
        id: "camera-head-repair",
        src: cameraImg,
        alt: "Medical camera head prepared for repair",
      },
    ],
    short: "Component-level repair support for HD, 4K and 3CCD medical camera heads.",
    description:
      "Camera head repair covering CCD/CMOS boards, cable moulds, connectors and buttons.",
    detailedDescription:
      "The service may include cable inspection, connector servicing, PCB diagnosis, image-signal testing, sensor-related diagnosis and control-button inspection for medical camera heads.",
    commonProblems: [
      "No video output",
      "Image flickering",
      "Colour distortion",
      "Cable damage",
      "Connector failure",
      "Button malfunction",
      "PCB fault",
      "Intermittent signal",
    ],
    bullets: [
      "CCD/CMOS component repair",
      "Cable & connector repair",
      "Button function restoration",
      "Image quality testing",
    ],
  },
  {
    slug: "pcb-board-level-repair",
    aliases: ["pcb-board-repair"],
    name: "PCB & Board-Level Repair",
    category: "Electronics",
    featured: true,
    primaryImageId: "pcb-board-level-repair",
    heroImages: [
      {
        id: "pcb-board-level-repair",
        src: serviceBoardLevelRepairImg,
        alt: "Medical imaging PCB undergoing board-level repair",
      },
    ],
    short:
      "Medical-equipment PCB diagnosis, micro-soldering and electronic component-level repair.",
    description:
      "Board-level repair for medical equipment PCBs including power sections, imaging boards and control boards.",
    detailedDescription:
      "Arise Healthcare Solutions provides component and board-level fault inspection for supported medical equipment using diagnostic tools and controlled repair procedures.",
    commonProblems: [
      "Equipment not powering on",
      "Burnt electronic components",
      "Power-supply fault",
      "Connector damage",
      "Short circuit",
      "Communication failure",
      "Control-board fault",
      "Intermittent operation",
    ],
    bullets: [
      "Micro-soldering",
      "Component-level diagnostics",
      "Power section repair",
      "Firmware / logic testing",
    ],
  },
  {
    slug: "processor-repair",
    name: "Processor Repair",
    category: "Imaging",
    featured: true,
    primaryImageId: "processor-repair",
    heroImages: [
      {
        id: "processor-repair",
        src: serviceProcessorRepairImg,
        alt: "Processor circuit board for repair",
      },
    ],
    short:
      "Repair support for endoscopy and imaging processors with complete functional and signal testing.",
    description: "Processor repair covering video output, connectors, cooling and internal PCBs.",
    detailedDescription:
      "The service may cover power supplies, video processing boards, ports, connectors, cooling systems, control panels and internal electronic faults for endoscopy and imaging processors.",
    commonProblems: [
      "No display output",
      "No camera signal",
      "Power failure",
      "Error messages",
      "Port damage",
      "Colour-processing problems",
      "Overheating",
      "PCB failure",
    ],
    bullets: [
      "Video output diagnosis",
      "Connector repair",
      "Cooling system checks",
      "Internal PCB service",
    ],
  },
  {
    slug: "light-source-repair",
    name: "Light Source Repair",
    category: "Imaging",
    featured: true,
    primaryImageId: "light-source-repair",
    heroImages: [
      {
        id: "light-source-repair",
        src: lightImg,
        alt: "Medical light source prepared for repair",
      },
    ],
    short: "LED and Xenon light source repair.",
    description:
      "Light source repair including lamp module replacement, fan and power supply repair.",
    detailedDescription:
      "The service includes inspection of lamps, LED modules, power systems, cooling fans, fibre connections, control panels and intensity-control components for medical light sources.",
    commonProblems: [
      "No light output",
      "Low light intensity",
      "Lamp failure",
      "LED module fault",
      "Overheating",
      "Fan failure",
      "Power-supply problem",
      "Intensity-control issue",
    ],
    bullets: [
      "Lamp module replacement",
      "Power supply repair",
      "Fan / thermal service",
      "Output calibration",
    ],
  },
  {
    slug: "co2-insufflator-repair",
    name: "CO₂ Insufflator Repair",
    category: "Surgical",
    featured: false,
    primaryImageId: "co2-insufflator-repair",
    heroImages: [
      {
        id: "co2-insufflator-repair",
        src: co2Img,
        alt: "CO2 insufflator prepared for repair",
      },
    ],
    short: "CO₂ insufflator repair with safety and performance checks.",
    description:
      "Insufflator repair covering pressure regulators, valves, sensors and safety alarms.",
    detailedDescription:
      "Inspection and repair support for CO₂ insufflators, including flow, pressure and control-related faults with complete safety verification.",
    commonProblems: [
      "Unstable pressure",
      "Gas-flow problem",
      "Sensor fault",
      "Error messages",
      "Control-panel problem",
      "Power failure",
      "Connector issue",
    ],
    bullets: [
      "Pressure sensor calibration",
      "Valve service",
      "Alarm testing",
      "Safety verification",
    ],
  },
  {
    slug: "medical-monitor-repair",
    name: "Medical Monitor Repair",
    category: "Displays",
    featured: false,
    primaryImageId: "medical-monitor-repair",
    heroImages: [
      {
        id: "medical-monitor-repair",
        src: serviceMedicalMonitorRepairImg,
        alt: "Medical monitor displaying patient vitals",
      },
    ],
    short:
      "Technical repair support for medical displays and monitors used in endoscopy, surgery and patient monitoring.",
    description: "Panel, power supply and control board repair for medical-grade displays.",
    detailedDescription:
      "Technical repair support for medical displays and monitors used in endoscopy, surgery and patient monitoring, including panel and board-level diagnosis.",
    commonProblems: [
      "Blank display",
      "Colour distortion",
      "Flickering",
      "Backlight failure",
      "Input-port damage",
      "Power problem",
      "Image-scaling issue",
    ],
    bullets: ["Panel service", "Power supply repair", "Board-level repair", "Colour calibration"],
  },
  {
    slug: "diathermy-electrosurgical-unit-repair",
    aliases: ["diathermy-unit-repair"],
    name: "Diathermy & Electrosurgical Unit Repair",
    category: "Surgical",
    featured: false,
    primaryImageId: "diathermy-electrosurgical-unit-repair",
    heroImages: [
      {
        id: "diathermy-electrosurgical-unit-repair",
        src: processorImg,
        alt: "Electrosurgical unit prepared for repair",
      },
    ],
    short:
      "Repair support for electrosurgical and diathermy equipment, including output and control-related faults.",
    description:
      "Technical repair support for electrosurgical units, diathermy systems, footswitches and control assemblies.",
    detailedDescription:
      "Arise Healthcare Solutions inspects supported diathermy and electrosurgical equipment for output faults, control-panel issues, connector damage, footswitch response and power-supply problems before functional testing.",
    commonProblems: [
      "No output",
      "Unstable output",
      "Error messages",
      "Control-panel fault",
      "Connector damage",
      "Footswitch problem",
      "Power-supply failure",
    ],
    bullets: [
      "Output-stage diagnosis",
      "Footswitch checks",
      "Control-panel service",
      "Functional testing",
    ],
  },
  {
    slug: "patient-monitor-repair",
    name: "Patient Monitor Repair",
    category: "Diagnostics",
    featured: false,
    primaryImageId: "patient-monitor-repair",
    heroImages: [
      {
        id: "patient-monitor-repair",
        src: monitorImg,
        alt: "Patient monitor prepared for repair",
      },
    ],
    short: "Repair and diagnostic support for multiparameter patient-monitoring systems.",
    description:
      "Patient monitor service covering display, sensor-port, alarm, battery, power and communication faults.",
    detailedDescription:
      "Arise Healthcare Solutions provides diagnostic and repair support for supported multiparameter patient monitors. The service may include display inspection, sensor-port checks, battery testing, power diagnosis, alarm verification and communication fault checks.",
    commonProblems: [
      "Display failure",
      "Parameter-reading error",
      "Sensor-port damage",
      "Battery problem",
      "Power failure",
      "Alarm malfunction",
      "Communication fault",
    ],
    bullets: [
      "Display checks",
      "Sensor-port service",
      "Battery and power diagnosis",
      "Alarm verification",
    ],
  },
  {
    slug: "ultrasound-equipment-service",
    aliases: ["ultrasound-system-repair"],
    name: "Ultrasound Equipment Service",
    category: "Diagnostics",
    featured: false,
    primaryImageId: "ultrasound-equipment-service",
    heroImages: [
      {
        id: "ultrasound-equipment-service",
        src: processorImg,
        alt: "Ultrasound equipment processor prepared for service",
      },
    ],
    short:
      "Inspection and technical service support for ultrasound equipment and associated components.",
    description:
      "Ultrasound system support covering image-quality, probe connection, display, control-panel and power issues.",
    detailedDescription:
      "Arise Healthcare Solutions provides inspection and technical service support for supported ultrasound equipment and associated components. The service may include display checks, probe-connection inspection, image-quality review, control-panel diagnosis, power checks and communication troubleshooting.",
    commonProblems: [
      "Display problem",
      "Probe connection fault",
      "Image-quality issue",
      "Control-panel fault",
      "Power failure",
      "Software or communication error",
    ],
    bullets: [
      "Probe connection checks",
      "Display and control-panel service",
      "Power diagnosis",
      "Image-quality review",
    ],
  },
  {
    slug: "ventilator-and-other-medical-equipment-repair",
    aliases: ["other-equipment-repair", "ventilator-repair"],
    name: "Ventilator & Other Medical Equipment Repair",
    category: "General",
    featured: false,
    primaryImageId: "ventilator-and-other-medical-equipment-repair",
    heroImages: [
      {
        id: "ventilator-and-other-medical-equipment-repair",
        src: co2Img,
        alt: "Ventilator and respiratory equipment prepared for repair",
      },
    ],
    short:
      "Technical inspection and repair support for supported respiratory, anaesthesia, suction and related medical equipment.",
    description:
      "Repair support for supported ventilators, anaesthesia equipment, suction units and related biomedical devices.",
    detailedDescription:
      "Arise Healthcare Solutions provides technical inspection and repair support for supported respiratory, anaesthesia, suction and related medical equipment. Service availability depends on the equipment type, brand, model, parts availability and inspection findings.",
    commonProblems: [
      "Sensor drift",
      "Valve leakage",
      "Display failure",
      "Power failure",
      "Alarm malfunction",
      "Communication fault",
      "Board failure",
    ],
    bullets: [
      "Diagnostic inspection",
      "Component-level repair",
      "Functional testing",
      "Service availability after inspection",
    ],
  },
  {
    slug: "other-equipment-repair",
    name: "Other Medical Equipment Repair",
    category: "General",
    featured: false,
    published: false,
    short: "Repair support for a wide range of biomedical devices.",
    description:
      "Repair support across ventilators, patient monitors, diathermy, defibrillators, suction and more.",
    detailedDescription:
      "Technical inspection and repair support for supported respiratory, anaesthesia, suction and related medical equipment. Service availability depends on equipment type, brand, model and inspection.",
    commonProblems: [
      "Sensor drift",
      "Valve leakage",
      "Display failure",
      "Power failure",
      "Alarm malfunction",
      "Communication fault",
      "Board failure",
    ],
    bullets: [
      "Diagnostic inspection",
      "Component-level repair",
      "Functional testing",
      "Safety verification",
    ],
  },
];

export type Equipment = {
  slug: string;
  name: string;
  category: string;
  short: string;
  image: string;
  faults: string[];
  capabilities: string[];
};

export const equipments: Equipment[] = [
  {
    slug: "endoscopes",
    name: "Endoscopes",
    category: "Endoscopy",
    image: endoscopeImg,
    short: "All rigid & flexible scopes: laparoscopes, arthroscopes, cystoscopes, nephroscopes.",
    faults: ["Blurred / dark image", "Broken rod-lens", "Fluid ingress", "Damaged sheath"],
    capabilities: ["Rod-lens replacement", "Optical alignment", "Sheath repair", "Leakage testing"],
  },
  {
    slug: "camera-heads",
    name: "Camera Heads",
    category: "Imaging",
    image: cameraImg,
    short: "HD / 4K / 3CCD camera heads from multiple brands.",
    faults: ["No image / no signal", "Colour issues", "Cable break", "Button not responding"],
    capabilities: [
      "CCD/CMOS repair",
      "Cable & connector service",
      "Button restoration",
      "Full image QC",
    ],
  },
  {
    slug: "video-processors",
    name: "Video Processors",
    category: "Imaging",
    image: processorImg,
    short: "Endoscopy & medical imaging processors.",
    faults: ["No output", "Overheating", "Connector damage", "Boot failure"],
    capabilities: [
      "Board-level diagnosis",
      "Cooling repair",
      "Connector repair",
      "Firmware validation",
    ],
  },
  {
    slug: "light-sources",
    name: "Light Sources",
    category: "Imaging",
    image: lightImg,
    short: "LED and Xenon light sources.",
    faults: ["Lamp not igniting", "Low output", "Fan failure", "Overheat shutdown"],
    capabilities: [
      "Lamp module replacement",
      "Power supply repair",
      "Thermal service",
      "Output calibration",
    ],
  },
  {
    slug: "co2-insufflators",
    name: "CO₂ Insufflators",
    category: "Surgical",
    image: co2Img,
    short: "Insufflator repair with safety & performance checks.",
    faults: ["Pressure not holding", "Alarm faults", "Valve leakage", "Sensor drift"],
    capabilities: [
      "Pressure sensor calibration",
      "Valve service",
      "Alarm test",
      "Safety validation",
    ],
  },
  {
    slug: "medical-monitors",
    name: "Medical Monitors",
    category: "Displays",
    image: monitorImg,
    short: "LED, LCD and HD medical displays.",
    faults: ["Dead panel", "No power", "Colour distortion", "Backlight failure"],
    capabilities: [
      "Panel replacement",
      "Power board repair",
      "Backlight repair",
      "Colour calibration",
    ],
  },
  {
    slug: "diathermy-units",
    name: "Diathermy Units",
    category: "Surgical",
    image: processorImg,
    short: "Electrosurgical / cautery unit repair.",
    faults: ["Output failure", "Foot switch issue", "Error alarms", "Power section fault"],
    capabilities: [
      "Output stage repair",
      "Foot pedal service",
      "Alarm diagnostics",
      "Safety testing",
    ],
  },
  {
    slug: "patient-monitors",
    name: "Patient Monitors",
    category: "Diagnostics",
    image: monitorImg,
    short: "Multiparameter & vital-sign monitors.",
    faults: ["No power", "Sensor errors", "Touch failure", "Battery issue"],
    capabilities: [
      "Board-level repair",
      "Sensor calibration",
      "Touch panel repair",
      "Battery service",
    ],
  },
  {
    slug: "ultrasound-systems",
    name: "Ultrasound Systems",
    category: "Diagnostics",
    image: processorImg,
    short: "Diagnostic ultrasound machines & systems.",
    faults: ["Probe not detected", "Image artefacts", "Panel not booting", "Power fault"],
    capabilities: ["Probe testing", "Board-level repair", "Panel repair", "Power section service"],
  },
  {
    slug: "ventilators-anaesthesia",
    name: "Ventilators & Anaesthesia",
    category: "Critical Care",
    image: co2Img,
    short: "Ventilators, anaesthesia machines, suction, defibrillators & more.",
    faults: ["Sensor drift", "Valve leakage", "Alarm faults", "Board failure"],
    capabilities: ["Sensor calibration", "Valve service", "Board-level repair", "Full safety test"],
  },
];

export const equipmentCategories = [
  "Endoscopes",
  "Rigid Scopes",
  "Flexible Scopes",
  "Nephroscopes",
  "Ureteroscopes",
  "Cystoscopes",
  "Laparoscopes",
  "Arthroscopes",
  "Camera Heads",
  "Video Processors",
  "Light Sources",
  "CO₂ Insufflators",
  "Medical Monitors",
  "Diathermy Units",
  "Patient Monitors",
  "Ultrasound Systems",
  "Ventilators",
  "Anaesthesia Equipment",
  "Suction Equipment",
  "Defibrillators",
  "Other Medical Equipment",
];

export const industries = [
  { name: "Hospitals", desc: "Small to large hospitals requiring dependable equipment uptime." },
  {
    name: "Multispeciality Hospitals",
    desc: "Complex environments with a wide equipment portfolio.",
  },
  { name: "Clinics", desc: "OPD and speciality clinics requiring quick equipment turnaround." },
  { name: "Endoscopy Centres", desc: "Dedicated endoscopy setups — our core specialisation." },
  { name: "Diagnostic Centres", desc: "Imaging and diagnostic device servicing at scale." },
  { name: "Medical Colleges", desc: "Teaching hospitals with academic equipment fleets." },
  { name: "Surgical Centres", desc: "Day-care and ambulatory surgical facilities." },
  { name: "Equipment Dealers", desc: "OEM dealers seeking board-level repair partners." },
  {
    name: "Healthcare Organisations",
    desc: "Multi-site groups needing centralised repair support.",
  },
];

export const process = [
  {
    step: "01",
    title: "Submit Repair Request",
    desc: "Share equipment details and the issue through our secure form or WhatsApp.",
  },
  {
    step: "02",
    title: "Pickup or Delivery",
    desc: "Ship the equipment to us or arrange assisted pickup where available.",
  },
  {
    step: "03",
    title: "Technical Inspection",
    desc: "Detailed diagnosis using calibrated instruments in our lab.",
  },
  {
    step: "04",
    title: "Diagnosis & Quotation",
    desc: "Clear repair scope, parts requirement and transparent quotation.",
  },
  {
    step: "05",
    title: "Component-Level Repair",
    desc: "Repair carried out by trained biomedical engineers with quality control.",
  },
  {
    step: "06",
    title: "Testing, Approval & Dispatch",
    desc: "Full functional and safety testing before dispatch back to you.",
  },
];

export const whyChoose = [
  {
    title: "Component & Board-Level Expertise",
    desc: "Micro-soldering and PCB-level repair capability in-house.",
  },
  {
    title: "Endoscopy Repair Specialists",
    desc: "Deep focus on rigid and flexible endoscopy systems.",
  },
  {
    title: "Advanced Diagnostic Equipment",
    desc: "Calibrated tools for accurate fault isolation.",
  },
  {
    title: "Experienced Technical Team",
    desc: "Biomedical engineers trained on multi-brand systems.",
  },
  {
    title: "Quick & Transparent Service",
    desc: "Clear updates, transparent quotations, no surprises.",
  },
  {
    title: "Quality Testing Before Delivery",
    desc: "Every unit goes through documented final QC.",
  },
];

export const trustBar = [
  "Endoscopy Repair Specialists",
  "Advanced Diagnostic Lab",
  "Component & Board-Level Repair",
  "Multi-Brand Equipment Support",
  "Quality-Controlled Testing",
  "Service Warranty Available",
];

export const qualityChecks = [
  "Micro-soldering",
  "PCB diagnosis",
  "Optical inspection",
  "Leakage testing",
  "Image quality testing",
  "Electrical safety checks",
  "Functional testing",
  "Final quality inspection",
];

export const faqs = [
  {
    q: "Which endoscope brands do you repair?",
    a: "We repair endoscopes and medical equipment from most major brands. Specific supported brand lists are added and updated through our admin panel. Original manufacturer trademarks belong to their respective owners; Arise Healthcare Solutions is an independent repair service.",
  },
  {
    q: "Do you offer a warranty on repairs?",
    a: "Warranty terms depend on the scope of the repair and equipment condition. Exact warranty duration is confirmed in your service quotation before repair begins.",
  },
  {
    q: "How long does a repair take?",
    a: "Turnaround depends on equipment type, parts availability and complexity. We share estimated turnaround time in the quotation.",
  },
  {
    q: "Do you provide equipment pickup?",
    a: "Assisted pickup is available in select locations. You can also ship the equipment directly to our lab.",
  },
  {
    q: "Can you repair PCBs at component level?",
    a: "Yes. Our lab performs micro-soldering and component-level PCB repair for many medical devices.",
  },
  {
    q: "Do you handle patient medical data?",
    a: "No. Our repair intake does not collect patient records. We only collect information required to identify and service the equipment.",
  },
];

export type Blog = {
  slug: string;
  title: string;
  category: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  readingTime?: number;
  date?: string;
  excerpt: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  equipment?: string[];
  body: string;
  takeaways?: string[];
  seoTitle?: string;
  seoDescription?: string;
};

const blogImages = {
  endoscopy: serviceEndoscopyRepairImg,
  rigid: serviceRigidScopeImg,
  nephroscope: serviceNephroscopeRepairImg,
  ureteroscope: ureteroscopeRepairImg,
  cystoscope: cystoscopeRepairImg,
  laparoscope: laparoscopeRepairImg,
  arthroscope: arthroscopeRepairImg,
  camera: cameraHeadRepairImg,
  processor: serviceProcessorRepairImg,
  pcb: serviceBoardLevelRepairImg,
  light: lightSourceRepairImg,
  co2: co2Img,
  monitor: serviceMedicalMonitorRepairImg,
  patientMonitor: patientMonitorRepairImg,
  ultrasound: ultrasoundRepairImg,
  diathermy: diathermyRepairImg,
  ventilator: ventilatorRepairImg,
  biomedical: serviceMedicalEquipmentImg,
} as const;

type BlogPlan = Omit<Blog, "body" | "takeaways" | "seoTitle" | "seoDescription"> & {
  primaryKeyword: string;
  servicePath: string;
  format: string;
  checks: string[];
};

function makeExpandedBlog(plan: BlogPlan): Blog {
  const secondary = plan.keywords?.filter((keyword) => keyword !== plan.primaryKeyword) ?? [];
  const checks = plan.checks.join(", ");

  return {
    ...plan,
    body: `${plan.title} is a ${plan.format.toLowerCase()} for biomedical teams that need a practical repair view before sending equipment for service. The focus is technical: reported symptoms, visible condition, safe handling, inspection sequence and repair feasibility. It does not replace the manufacturer's instructions for use, and it does not provide clinical treatment guidance.

For ${plan.equipment?.[0] ?? "medical equipment"}, the first step is to document the exact complaint, model, accessories used and when the fault appears. Useful intake notes include whether the issue is constant or intermittent, whether it follows a cable or accessory, and whether there was impact, fluid exposure, overheating, alarm history or recent service work. Clear symptom notes help reduce diagnosis time.

During inspection, technicians typically review ${checks}. The exact workflow depends on equipment type, model design and condition. A controlled assessment separates simple external issues from deeper optical, electronic, mechanical or power-section faults. This matters because two similar symptoms can come from different root causes.

Repair decisions should consider downtime, parts availability, service cost, equipment age and post-repair test results. Component-level work may be suitable when the failed section can be isolated and the unit can pass functional checks after repair. Replacement may be more practical when damage is extensive, repeated or unsupported.

Teams can support faster service by sharing photos, fault videos and previous repair history with the repair request. For related support, review /services, /equipments, /faq and /request-repair before dispatching the unit. For this topic, the most relevant service page is ${plan.servicePath}.

Need help with ${plan.primaryKeyword}? Share the equipment type, brand, model and observed fault with Arise Healthcare Solutions so the technical team can advise the next repair intake step.`,
    takeaways: [
      `${plan.primaryKeyword} should start with clear symptoms and equipment details.`,
      `Inspection commonly reviews ${checks}.`,
      "Repair feasibility depends on condition, parts availability and final testing.",
    ],
    seoTitle: `${plan.title} | Arise Healthcare Solutions`,
    seoDescription: `${plan.primaryKeyword} guide for technical inspection, repair decisions and biomedical service planning by Arise Healthcare Solutions.`,
    keywords: [plan.primaryKeyword, ...secondary],
  };
}

const expandedBlogPlans: BlogPlan[] = [
  {
    slug: "endoscope-leakage-diagnosis-before-repair",
    title: "Endoscope Leakage Diagnosis Before Repair",
    category: "Fault Analysis",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-11-30",
    image: blogImages.endoscopy,
    imageAlt: "Endoscope leakage inspection before repair",
    primaryKeyword: "endoscope leakage diagnosis",
    keywords: ["endoscope leakage diagnosis", "endoscopy repair", "leakage testing"],
    equipment: ["Endoscopes", "Flexible Scopes"],
    excerpt: "How leakage symptoms are documented and inspected before endoscope repair decisions.",
    servicePath: "/services/endoscopy-repair",
    format: "Diagnostic guide",
    checks: ["leakage test results", "insertion tube condition", "connector seals", "control body damage"],
  },
  {
    slug: "endoscopy-system-no-signal-troubleshooting",
    title: "Endoscopy System No-Signal Troubleshooting",
    category: "Fault Analysis",
    difficulty: "Advanced",
    readingTime: 7,
    date: "2026-11-28",
    image: blogImages.processor,
    imageAlt: "Endoscopy video system signal troubleshooting setup",
    primaryKeyword: "endoscopy system no signal",
    keywords: ["endoscopy system no signal", "processor signal troubleshooting", "camera cable fault"],
    equipment: ["Endoscopy Systems", "Video Processors", "Camera Heads"],
    excerpt: "A repair-focused path for separating camera, processor, cable and display signal faults.",
    servicePath: "/services/processor-repair",
    format: "Troubleshooting guide",
    checks: ["video outputs", "camera inputs", "cable continuity", "monitor source selection"],
  },
  {
    slug: "rigid-scope-light-transmission-loss",
    title: "Rigid Scope Light Transmission Loss: Service Checks",
    category: "Repair Guides",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-11-26",
    image: blogImages.rigid,
    imageAlt: "Rigid scope light transmission inspection",
    primaryKeyword: "rigid scope light transmission",
    keywords: ["rigid scope light transmission", "rigid scope repair", "endoscopy illumination"],
    equipment: ["Rigid Scopes", "Laparoscopes"],
    excerpt: "What technicians check when a rigid scope image is clear but illumination is weak.",
    servicePath: "/services/rigid-scope-repair",
    format: "Inspection guide",
    checks: ["light post condition", "fiber bundle output", "objective lens cleanliness", "sheath damage"],
  },
  {
    slug: "rigid-scope-sheath-damage-repair-assessment",
    title: "Rigid Scope Sheath Damage Repair Assessment",
    category: "Repair Guides",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-11-24",
    image: blogImages.rigid,
    imageAlt: "Rigid scope sheath inspected for dents and alignment issues",
    primaryKeyword: "rigid scope sheath damage",
    keywords: ["rigid scope sheath damage", "rod lens scope repair", "scope alignment"],
    equipment: ["Rigid Scopes", "Cystoscopes", "Arthroscopes"],
    excerpt: "How sheath dents, bending and seal concerns affect rigid scope service decisions.",
    servicePath: "/services/rigid-scope-repair",
    format: "Repair assessment",
    checks: ["external straightness", "distal tip condition", "seal integrity", "optical alignment"],
  },
  {
    slug: "nephroscope-image-quality-repair-checks",
    title: "Nephroscope Image Quality Repair Checks",
    category: "Fault Analysis",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-11-22",
    image: blogImages.nephroscope,
    imageAlt: "Nephroscope prepared for image quality inspection",
    primaryKeyword: "nephroscope image quality",
    keywords: ["nephroscope image quality", "nephroscope repair", "urology endoscope service"],
    equipment: ["Nephroscopes"],
    excerpt: "A technical look at dark, cloudy or distorted nephroscope image complaints.",
    servicePath: "/services/nephroscope-repair",
    format: "Fault analysis",
    checks: ["objective lens clarity", "light transmission", "sheath condition", "moisture signs"],
  },
  {
    slug: "nephroscope-leakage-inspection-guide",
    title: "Nephroscope Leakage Inspection Guide",
    category: "Equipment Care",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-11-20",
    image: blogImages.nephroscope,
    imageAlt: "Nephroscope leakage inspection at service bench",
    primaryKeyword: "nephroscope leakage inspection",
    keywords: ["nephroscope leakage inspection", "nephroscope servicing", "urology scope repair"],
    equipment: ["Nephroscopes"],
    excerpt: "Why leakage findings should be assessed before continued nephroscope use.",
    servicePath: "/services/nephroscope-repair",
    format: "Inspection guide",
    checks: ["seal condition", "shaft damage", "connector areas", "prior fluid exposure"],
  },
  {
    slug: "nephroscope-repair-vs-replacement",
    title: "Nephroscope Repair vs Replacement Decisions",
    category: "Cost & Repair Decisions",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-11-18",
    image: blogImages.nephroscope,
    imageAlt: "Nephroscope repair decision assessment",
    primaryKeyword: "nephroscope repair vs replacement",
    keywords: ["nephroscope repair vs replacement", "nephroscope repair", "repair feasibility"],
    equipment: ["Nephroscopes"],
    excerpt: "A practical framework for deciding whether nephroscope service is worthwhile.",
    servicePath: "/services/nephroscope-repair",
    format: "Decision guide",
    checks: ["damage extent", "optical condition", "parts availability", "expected downtime"],
  },
  {
    slug: "ureteroscope-deflection-problems-service",
    title: "Ureteroscope Deflection Problems and Service Options",
    category: "Fault Analysis",
    difficulty: "Advanced",
    readingTime: 7,
    date: "2026-11-16",
    image: blogImages.ureteroscope,
    imageAlt: "Flexible ureteroscope inspected for deflection issues",
    primaryKeyword: "ureteroscope deflection problems",
    keywords: ["ureteroscope deflection problems", "flexible ureteroscope repair", "scope angulation"],
    equipment: ["Ureteroscopes", "Flexible Scopes"],
    excerpt: "What poor angulation or stiff movement can indicate during ureteroscope repair review.",
    servicePath: "/services/ureteroscope-repair",
    format: "Troubleshooting guide",
    checks: ["angulation response", "control knob feel", "insertion section wear", "leakage status"],
  },
  {
    slug: "semi-rigid-ureteroscope-repair-considerations",
    title: "Semi-Rigid Ureteroscope Repair Considerations",
    category: "Repair Guides",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-11-14",
    image: blogImages.ureteroscope,
    imageAlt: "Semi-rigid ureteroscope service inspection",
    primaryKeyword: "semi-rigid ureteroscope repair",
    keywords: ["semi-rigid ureteroscope repair", "ureteroscope service", "urology scope repair"],
    equipment: ["Ureteroscopes"],
    excerpt: "A repair view of optical, sheath and light-path concerns in semi-rigid ureteroscopes.",
    servicePath: "/services/ureteroscope-repair",
    format: "Repair guide",
    checks: ["shaft straightness", "distal optics", "light transmission", "eyepiece condition"],
  },
  {
    slug: "cystoscope-optical-damage-inspection",
    title: "Cystoscope Optical Damage Inspection",
    category: "Repair Guides",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-11-12",
    image: blogImages.cystoscope,
    imageAlt: "Cystoscope optical inspection for repair",
    primaryKeyword: "cystoscope optical damage",
    keywords: ["cystoscope optical damage", "cystoscope repair", "rigid scope inspection"],
    equipment: ["Cystoscopes", "Rigid Scopes"],
    excerpt: "How cloudy images, cracks and light loss are reviewed during cystoscope repair intake.",
    servicePath: "/services/cystoscope-repair",
    format: "Inspection guide",
    checks: ["lens surface", "rod lens path", "light fibers", "sheath and tip condition"],
  },
  {
    slug: "laparoscope-fogging-and-moisture-diagnosis",
    title: "Laparoscope Fogging and Moisture Diagnosis",
    category: "Fault Analysis",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-11-10",
    image: blogImages.laparoscope,
    imageAlt: "Laparoscope inspected for fogging and moisture symptoms",
    primaryKeyword: "laparoscope fogging diagnosis",
    keywords: ["laparoscope fogging diagnosis", "laparoscope repair", "scope moisture ingress"],
    equipment: ["Laparoscopes"],
    excerpt: "Why fogging can point to contamination, seal failure or optical path concerns.",
    servicePath: "/services/laparoscope-repair",
    format: "Diagnostic guide",
    checks: ["distal window condition", "seal areas", "internal haze", "sterilization history"],
  },
  {
    slug: "laparoscope-repair-vs-replacement",
    title: "Laparoscope Repair vs Replacement: Practical Factors",
    category: "Cost & Repair Decisions",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-11-08",
    image: blogImages.laparoscope,
    imageAlt: "Laparoscope repair versus replacement evaluation",
    primaryKeyword: "laparoscope repair vs replacement",
    keywords: ["laparoscope repair vs replacement", "laparoscope repair", "surgical scope service"],
    equipment: ["Laparoscopes"],
    excerpt: "How condition, fault type and downtime shape laparoscope repair decisions.",
    servicePath: "/services/laparoscope-repair",
    format: "Decision guide",
    checks: ["optical clarity", "sheath damage", "repair history", "service cost"],
  },
  {
    slug: "arthroscope-light-transmission-service-checks",
    title: "Arthroscope Light Transmission Service Checks",
    category: "Repair Guides",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-11-06",
    image: blogImages.arthroscope,
    imageAlt: "Arthroscope light transmission repair inspection",
    primaryKeyword: "arthroscope light transmission",
    keywords: ["arthroscope light transmission", "arthroscope repair", "orthopedic scope service"],
    equipment: ["Arthroscopes"],
    excerpt: "Service checks for weak illumination in arthroscopes used in orthopedic workflows.",
    servicePath: "/services/arthroscope-repair",
    format: "Inspection guide",
    checks: ["light post fit", "fiber output", "tip wear", "scope compatibility"],
  },
  {
    slug: "arthroscope-sheath-problems-repair-guide",
    title: "Arthroscope Sheath Problems: Repair Guide",
    category: "Repair Guides",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-11-04",
    image: blogImages.arthroscope,
    imageAlt: "Arthroscope sheath checked for service problems",
    primaryKeyword: "arthroscope sheath problems",
    keywords: ["arthroscope sheath problems", "arthroscope repair", "rigid scope service"],
    equipment: ["Arthroscopes", "Rigid Scopes"],
    excerpt: "How bent, worn or damaged arthroscope sheaths influence service planning.",
    servicePath: "/services/arthroscope-repair",
    format: "Repair guide",
    checks: ["sheath surface", "tip geometry", "seal condition", "image alignment"],
  },
  {
    slug: "camera-head-intermittent-image-faults",
    title: "Camera Head Intermittent Image Faults",
    category: "Fault Analysis",
    difficulty: "Advanced",
    readingTime: 7,
    date: "2026-11-02",
    image: blogImages.camera,
    imageAlt: "Medical camera head inspected for intermittent image faults",
    primaryKeyword: "camera head intermittent faults",
    keywords: ["camera head intermittent faults", "camera head repair", "endoscopy imaging fault"],
    equipment: ["Camera Heads"],
    excerpt: "A technical guide to image dropouts that appear only during movement or warm-up.",
    servicePath: "/services/camera-head-repair",
    format: "Troubleshooting guide",
    checks: ["cable strain relief", "connector pins", "sensor output", "thermal behavior"],
  },
  {
    slug: "hd-camera-head-colour-problems",
    title: "HD Camera Head Colour Problems: Repair View",
    category: "Fault Analysis",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-10-31",
    image: blogImages.camera,
    imageAlt: "HD camera head evaluated for colour problems",
    primaryKeyword: "HD camera head colour problems",
    keywords: ["HD camera head colour problems", "camera head repair", "endoscopy colour issue"],
    equipment: ["Camera Heads", "Endoscopy Systems"],
    excerpt: "What colour shifts, noise and tint changes may indicate in a medical camera head.",
    servicePath: "/services/camera-head-repair",
    format: "Fault analysis",
    checks: ["sensor behavior", "processor settings", "connector condition", "cable movement"],
  },
  {
    slug: "four-k-camera-head-troubleshooting",
    title: "4K Camera Head Troubleshooting for Endoscopy Systems",
    category: "Tech Explained",
    difficulty: "Expert",
    readingTime: 7,
    date: "2026-10-29",
    image: blogImages.camera,
    imageAlt: "4K endoscopy camera head troubleshooting equipment",
    primaryKeyword: "4K camera head troubleshooting",
    keywords: ["4K camera head troubleshooting", "camera head electronics repair", "endoscopy camera repair"],
    equipment: ["Camera Heads", "Video Processors"],
    excerpt: "How high-resolution camera faults are isolated from processor, cable and display issues.",
    servicePath: "/services/camera-head-repair",
    format: "Technical explainer",
    checks: ["processor compatibility", "signal stability", "connector fit", "image noise"],
  },
  {
    slug: "processor-overheating-service-checklist",
    title: "Video Processor Overheating Service Checklist",
    category: "Preventive Maintenance",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-10-27",
    image: blogImages.processor,
    imageAlt: "Video processor ventilation and overheating inspection",
    primaryKeyword: "video processor overheating",
    keywords: ["video processor overheating", "processor preventive servicing", "endoscopy processor repair"],
    equipment: ["Video Processors"],
    excerpt: "Service checks for processors that shut down, run hot or show heat-related faults.",
    servicePath: "/services/processor-repair",
    format: "Maintenance checklist",
    checks: ["cooling fan operation", "vent blockage", "power board condition", "thermal shutdown history"],
  },
  {
    slug: "processor-port-faults-endoscopy-stack",
    title: "Processor Port Faults in an Endoscopy Stack",
    category: "Repair Guides",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-10-25",
    image: blogImages.processor,
    imageAlt: "Endoscopy processor ports checked during repair",
    primaryKeyword: "processor port faults",
    keywords: ["processor port faults", "endoscopy processor inspection", "video processor repair"],
    equipment: ["Video Processors"],
    excerpt: "How loose, damaged or unreliable processor ports are evaluated before repair.",
    servicePath: "/services/processor-repair",
    format: "Repair guide",
    checks: ["input sockets", "output ports", "board solder joints", "cable fit"],
  },
  {
    slug: "processor-repair-vs-replacement-guide",
    title: "Endoscopy Processor Repair vs Replacement Guide",
    category: "Cost & Repair Decisions",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-10-23",
    image: blogImages.processor,
    imageAlt: "Endoscopy processor repair decision evaluation",
    primaryKeyword: "processor repair vs replacement",
    keywords: ["processor repair vs replacement", "endoscopy processor inspection", "video processor service"],
    equipment: ["Video Processors"],
    excerpt: "A practical decision guide for processor faults, downtime and service feasibility.",
    servicePath: "/services/processor-repair",
    format: "Decision guide",
    checks: ["fault repeatability", "board condition", "parts availability", "compatibility needs"],
  },
  {
    slug: "medical-equipment-pcb-power-supply-faults",
    title: "Medical Equipment PCB Power Supply Faults",
    category: "Tech Explained",
    difficulty: "Advanced",
    readingTime: 7,
    date: "2026-10-21",
    image: blogImages.pcb,
    imageAlt: "Medical equipment PCB power supply fault diagnosis",
    primaryKeyword: "medical equipment PCB power supply faults",
    keywords: ["medical equipment PCB power supply faults", "component-level repair", "PCB diagnostics"],
    equipment: ["Medical Equipment PCBs"],
    excerpt: "How power-section failures are approached during medical equipment PCB diagnosis.",
    servicePath: "/services/pcb-board-level-repair",
    format: "Technical explainer",
    checks: ["input protection", "regulator sections", "burn marks", "short circuits"],
  },
  {
    slug: "intermittent-pcb-fault-diagnosis",
    title: "Intermittent PCB Fault Diagnosis in Medical Equipment",
    category: "Fault Analysis",
    difficulty: "Expert",
    readingTime: 7,
    date: "2026-10-19",
    image: blogImages.pcb,
    imageAlt: "Medical PCB inspected for intermittent faults",
    primaryKeyword: "intermittent PCB fault diagnosis",
    keywords: ["intermittent PCB fault diagnosis", "medical equipment PCB diagnostics", "board-level repair"],
    equipment: ["Medical Equipment PCBs"],
    excerpt: "Why intermittent faults need careful reproduction, signal tracing and controlled testing.",
    servicePath: "/services/pcb-board-level-repair",
    format: "Diagnostic guide",
    checks: ["thermal behavior", "connector movement", "dry joints", "signal stability"],
  },
  {
    slug: "pcb-connector-level-faults",
    title: "Connector-Level PCB Faults in Medical Devices",
    category: "Repair Guides",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-10-17",
    image: blogImages.pcb,
    imageAlt: "PCB connector inspected for medical equipment repair",
    primaryKeyword: "connector-level PCB faults",
    keywords: ["connector-level PCB faults", "micro-soldering", "medical device board repair"],
    equipment: ["Medical Equipment PCBs", "Camera Heads"],
    excerpt: "How damaged connectors, cracked solder joints and loose sockets affect repair work.",
    servicePath: "/services/pcb-board-level-repair",
    format: "Repair guide",
    checks: ["connector pins", "solder pads", "mechanical stress", "continuity readings"],
  },
  {
    slug: "led-light-source-troubleshooting",
    title: "LED Light Source Troubleshooting",
    category: "Repair Guides",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-10-15",
    image: blogImages.light,
    imageAlt: "LED endoscopy light source troubleshooting",
    primaryKeyword: "LED light source troubleshooting",
    keywords: ["LED light source troubleshooting", "light source repair", "endoscopy illumination"],
    equipment: ["Light Sources"],
    excerpt: "A service view of low output, no output, fan and power issues in LED light sources.",
    servicePath: "/services/light-source-repair",
    format: "Troubleshooting guide",
    checks: ["LED module output", "cooling fan", "power section", "fiber port condition"],
  },
  {
    slug: "xenon-light-source-servicing",
    title: "Xenon Light Source Servicing: Technical Checks",
    category: "Preventive Maintenance",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-10-13",
    image: blogImages.light,
    imageAlt: "Xenon light source servicing for endoscopy system",
    primaryKeyword: "Xenon light source servicing",
    keywords: ["Xenon light source servicing", "light source overheating", "endoscopy light output"],
    equipment: ["Light Sources"],
    excerpt: "What technicians review when Xenon light sources show lamp, output or heat complaints.",
    servicePath: "/services/light-source-repair",
    format: "Service planning guide",
    checks: ["lamp condition", "ignition behavior", "cooling airflow", "error messages"],
  },
  {
    slug: "light-source-fibre-connection-problems",
    title: "Light Source Fibre Connection Problems",
    category: "Fault Analysis",
    difficulty: "Intermediate",
    readingTime: 5,
    date: "2026-10-11",
    image: blogImages.light,
    imageAlt: "Fibre connection checked on endoscopy light source",
    primaryKeyword: "light source fibre connection problems",
    keywords: ["light source fibre connection problems", "endoscopy light source repair", "fiber port fault"],
    equipment: ["Light Sources", "Endoscopy Systems"],
    excerpt: "How fibre port fit, cable condition and light output are checked during service.",
    servicePath: "/services/light-source-repair",
    format: "Fault analysis",
    checks: ["fiber port wear", "cable fit", "output consistency", "heat discoloration"],
  },
  {
    slug: "co2-insufflator-pressure-problems",
    title: "CO2 Insufflator Pressure Problems",
    category: "Fault Analysis",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-10-09",
    image: blogImages.co2,
    imageAlt: "CO2 insufflator pressure problem inspection",
    primaryKeyword: "CO2 insufflator pressure problems",
    keywords: ["CO2 insufflator pressure problems", "insufflator sensor faults", "surgical equipment service"],
    equipment: ["CO2 Insufflators"],
    excerpt: "A technical guide to unstable pressure, sensor concerns and control behavior.",
    servicePath: "/services/co2-insufflator-repair",
    format: "Troubleshooting guide",
    checks: ["pressure readings", "sensor response", "tubing path", "control panel inputs"],
  },
  {
    slug: "insufflator-flow-problems-service-guide",
    title: "Insufflator Flow Problems: Service Guide",
    category: "Repair Guides",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-10-07",
    image: blogImages.co2,
    imageAlt: "CO2 insufflator flow problem service assessment",
    primaryKeyword: "insufflator flow problems",
    keywords: ["insufflator flow problems", "CO2 insufflator repair", "flow alarm troubleshooting"],
    equipment: ["CO2 Insufflators"],
    excerpt: "How flow complaints are reviewed before deciding an insufflator repair path.",
    servicePath: "/services/co2-insufflator-repair",
    format: "Repair guide",
    checks: ["flow output", "filter condition", "valve operation", "alarm logs"],
  },
  {
    slug: "insufflator-alarm-troubleshooting",
    title: "Insufflator Alarm Troubleshooting",
    category: "Tech Explained",
    difficulty: "Intermediate",
    readingTime: 5,
    date: "2026-10-05",
    image: blogImages.co2,
    imageAlt: "Insufflator alarm troubleshooting and control panel review",
    primaryKeyword: "insufflator alarm troubleshooting",
    keywords: ["insufflator alarm troubleshooting", "insufflator inspection", "CO2 equipment service"],
    equipment: ["CO2 Insufflators"],
    excerpt: "What alarm patterns can tell technicians during controlled insufflator testing.",
    servicePath: "/services/co2-insufflator-repair",
    format: "Technical explainer",
    checks: ["alarm messages", "sensor status", "front panel buttons", "power stability"],
  },
  {
    slug: "medical-monitor-signal-issues",
    title: "Medical Monitor Signal Issues: Repair Checks",
    category: "Fault Analysis",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-10-03",
    image: blogImages.monitor,
    imageAlt: "Medical monitor signal input inspection",
    primaryKeyword: "medical monitor signal issues",
    keywords: ["medical monitor signal issues", "medical monitor repair", "display input fault"],
    equipment: ["Medical Monitors"],
    excerpt: "How no-signal, flicker and unstable display complaints are isolated during service.",
    servicePath: "/services/medical-monitor-repair",
    format: "Troubleshooting guide",
    checks: ["input ports", "source cables", "display board behavior", "power stability"],
  },
  {
    slug: "medical-display-backlight-and-panel-service",
    title: "Medical Display Backlight and Panel Service",
    category: "Repair Guides",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-10-01",
    image: blogImages.monitor,
    imageAlt: "Medical display panel and backlight service inspection",
    primaryKeyword: "medical display backlight service",
    keywords: ["medical display backlight service", "LCD medical display servicing", "medical monitor repair"],
    equipment: ["Medical Monitors"],
    excerpt: "A repair view of dim screens, flicker, panel faults and backlight issues.",
    servicePath: "/services/medical-monitor-repair",
    format: "Repair guide",
    checks: ["panel behavior", "backlight output", "inverter or driver section", "control board signals"],
  },
  {
    slug: "medical-monitor-repair-vs-replacement",
    title: "Medical Monitor Repair vs Replacement",
    category: "Cost & Repair Decisions",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-09-29",
    image: blogImages.monitor,
    imageAlt: "Medical monitor repair versus replacement assessment",
    primaryKeyword: "medical monitor repair vs replacement",
    keywords: ["medical monitor repair vs replacement", "medical monitor repair", "display service decision"],
    equipment: ["Medical Monitors"],
    excerpt: "How teams can weigh display condition, input faults, downtime and repair feasibility.",
    servicePath: "/services/medical-monitor-repair",
    format: "Decision guide",
    checks: ["panel condition", "port damage", "power fault history", "replacement cost"],
  },
  {
    slug: "patient-monitor-display-problems",
    title: "Patient Monitor Display Problems",
    category: "Fault Analysis",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-09-27",
    image: blogImages.patientMonitor,
    imageAlt: "Patient monitor display problem inspection",
    primaryKeyword: "patient monitor display problems",
    keywords: ["patient monitor display problems", "patient monitor troubleshooting", "monitor repair"],
    equipment: ["Patient Monitors"],
    excerpt: "Technical causes to inspect when patient monitors show blank, dim or unstable screens.",
    servicePath: "/services/patient-monitor-repair",
    format: "Fault analysis",
    checks: ["display panel", "power input", "control board", "button response"],
  },
  {
    slug: "patient-monitor-communication-problems",
    title: "Patient Monitor Communication Problems",
    category: "Tech Explained",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-09-25",
    image: blogImages.patientMonitor,
    imageAlt: "Patient monitor communication port inspection",
    primaryKeyword: "patient monitor communication problems",
    keywords: ["patient monitor communication problems", "patient monitor servicing", "medical equipment troubleshooting"],
    equipment: ["Patient Monitors"],
    excerpt: "A service perspective on communication ports, accessories and intermittent connectivity.",
    servicePath: "/services/patient-monitor-repair",
    format: "Technical explainer",
    checks: ["communication ports", "accessory connectors", "settings history", "board-level condition"],
  },
  {
    slug: "patient-monitor-preventive-maintenance",
    title: "Patient Monitor Preventive Maintenance",
    category: "Preventive Maintenance",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-09-23",
    image: blogImages.patientMonitor,
    imageAlt: "Patient monitoring equipment preventive maintenance",
    primaryKeyword: "patient monitor preventive maintenance",
    keywords: ["patient monitor preventive maintenance", "patient monitor inspection", "biomedical equipment servicing"],
    equipment: ["Patient Monitors"],
    excerpt: "Practical inspection habits that help reduce avoidable patient monitor downtime.",
    servicePath: "/services/patient-monitor-repair",
    format: "Maintenance checklist",
    checks: ["external condition", "display readability", "connector wear", "power adapter condition"],
  },
  {
    slug: "ultrasound-image-quality-problems",
    title: "Ultrasound Image Quality Problems",
    category: "Fault Analysis",
    difficulty: "Advanced",
    readingTime: 7,
    date: "2026-09-21",
    image: blogImages.ultrasound,
    imageAlt: "Ultrasound system image quality service inspection",
    primaryKeyword: "ultrasound image quality problems",
    keywords: ["ultrasound image quality problems", "ultrasound equipment servicing", "ultrasound repair decisions"],
    equipment: ["Ultrasound Systems"],
    excerpt: "How image noise, dropouts and weak output are approached during ultrasound service review.",
    servicePath: "/services/ultrasound-equipment-service",
    format: "Diagnostic guide",
    checks: ["probe connection", "console settings", "display output", "system error history"],
  },
  {
    slug: "ultrasound-console-faults-service",
    title: "Ultrasound Console Faults and Service Planning",
    category: "Repair Guides",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-09-19",
    image: blogImages.ultrasound,
    imageAlt: "Ultrasound console fault diagnosis",
    primaryKeyword: "ultrasound console faults",
    keywords: ["ultrasound console faults", "ultrasound equipment inspection", "ultrasound power problems"],
    equipment: ["Ultrasound Systems"],
    excerpt: "A technical guide to console power, display, input and startup complaints.",
    servicePath: "/services/ultrasound-equipment-service",
    format: "Repair guide",
    checks: ["startup behavior", "control panel response", "power supply", "ventilation"],
  },
  {
    slug: "ultrasound-preventive-maintenance-planning",
    title: "Ultrasound Preventive Maintenance Planning",
    category: "Preventive Maintenance",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-09-17",
    image: blogImages.ultrasound,
    imageAlt: "Ultrasound equipment preventive maintenance planning",
    primaryKeyword: "ultrasound preventive maintenance",
    keywords: ["ultrasound preventive maintenance", "ultrasound equipment servicing", "biomedical maintenance"],
    equipment: ["Ultrasound Systems"],
    excerpt: "How biomedical teams can plan basic ultrasound equipment checks and service intake.",
    servicePath: "/services/ultrasound-equipment-service",
    format: "Service planning guide",
    checks: ["probe handling", "cable wear", "system cleaning", "error reporting"],
  },
  {
    slug: "esu-output-problems-diagnosis",
    title: "ESU Output Problems: Diagnosis and Repair View",
    category: "Fault Analysis",
    difficulty: "Expert",
    readingTime: 7,
    date: "2026-09-15",
    image: blogImages.diathermy,
    imageAlt: "Electrosurgical unit output problem inspection",
    primaryKeyword: "ESU output problems",
    keywords: ["ESU output problems", "electrosurgical unit repair", "diathermy equipment servicing"],
    equipment: ["Diathermy Units", "Electrosurgical Units"],
    excerpt: "A repair-focused overview of ESU output complaints and controlled technical checks.",
    servicePath: "/services/diathermy-electrosurgical-unit-repair",
    format: "Diagnostic guide",
    checks: ["output behavior", "control settings", "connector condition", "internal board condition"],
  },
  {
    slug: "diathermy-control-panel-faults",
    title: "Diathermy Control Panel Faults",
    category: "Repair Guides",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-09-13",
    image: blogImages.diathermy,
    imageAlt: "Diathermy control panel fault service inspection",
    primaryKeyword: "diathermy control panel faults",
    keywords: ["diathermy control panel faults", "ESU control faults", "electrosurgical equipment inspection"],
    equipment: ["Diathermy Units"],
    excerpt: "How button, display and setting-control issues are reviewed during diathermy service.",
    servicePath: "/services/diathermy-electrosurgical-unit-repair",
    format: "Repair guide",
    checks: ["button response", "display behavior", "encoder controls", "front panel connectors"],
  },
  {
    slug: "electrosurgical-unit-preventive-maintenance",
    title: "Electrosurgical Unit Preventive Maintenance",
    category: "Preventive Maintenance",
    difficulty: "Intermediate",
    readingTime: 5,
    date: "2026-09-11",
    image: blogImages.diathermy,
    imageAlt: "Electrosurgical unit preventive service checklist",
    primaryKeyword: "electrosurgical unit preventive maintenance",
    keywords: ["electrosurgical unit preventive maintenance", "ESU inspection", "diathermy servicing"],
    equipment: ["Electrosurgical Units"],
    excerpt: "Preventive checks that help identify ESU connector, control and power concerns early.",
    servicePath: "/services/diathermy-electrosurgical-unit-repair",
    format: "Maintenance checklist",
    checks: ["accessory sockets", "power cord condition", "alarm behavior", "case damage"],
  },
  {
    slug: "ventilator-alarm-technical-issues",
    title: "Ventilator Alarm-Related Technical Issues",
    category: "Tech Explained",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-09-09",
    image: blogImages.ventilator,
    imageAlt: "Ventilator alarm technical issue inspection",
    primaryKeyword: "ventilator alarm technical issues",
    keywords: ["ventilator alarm technical issues", "ventilator fault diagnosis", "respiratory equipment maintenance"],
    equipment: ["Ventilators"],
    excerpt: "A biomedical service view of recurring alarm complaints and equipment inspection.",
    servicePath: "/services/ventilator-and-other-medical-equipment-repair",
    format: "Technical explainer",
    checks: ["alarm history", "sensor condition", "power stability", "external connections"],
  },
  {
    slug: "ventilator-power-problems-service",
    title: "Ventilator Power Problems and Service Checks",
    category: "Fault Analysis",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-09-07",
    image: blogImages.ventilator,
    imageAlt: "Ventilator power section service inspection",
    primaryKeyword: "ventilator power problems",
    keywords: ["ventilator power problems", "ventilator equipment servicing", "medical equipment inspection"],
    equipment: ["Ventilators"],
    excerpt: "How startup, battery and power-section concerns are documented for technical assessment.",
    servicePath: "/services/ventilator-and-other-medical-equipment-repair",
    format: "Troubleshooting guide",
    checks: ["power inlet", "battery condition", "startup sequence", "error indicators"],
  },
  {
    slug: "respiratory-equipment-repair-decisions",
    title: "Respiratory Equipment Repair Decisions",
    category: "Cost & Repair Decisions",
    difficulty: "Intermediate",
    readingTime: 5,
    date: "2026-09-05",
    image: blogImages.ventilator,
    imageAlt: "Respiratory equipment repair decision assessment",
    primaryKeyword: "respiratory equipment repair decisions",
    keywords: ["respiratory equipment repair decisions", "ventilator servicing", "medical equipment lifecycle"],
    equipment: ["Ventilators", "Respiratory Equipment"],
    excerpt: "How inspection findings, condition and downtime influence respiratory equipment service choices.",
    servicePath: "/services/ventilator-and-other-medical-equipment-repair",
    format: "Decision guide",
    checks: ["fault severity", "service history", "parts availability", "functional test needs"],
  },
  {
    slug: "hospital-equipment-maintenance-planning",
    title: "Hospital Equipment Maintenance Planning",
    category: "Preventive Maintenance",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-09-03",
    image: blogImages.biomedical,
    imageAlt: "Hospital equipment maintenance planning for biomedical teams",
    primaryKeyword: "hospital equipment maintenance planning",
    keywords: ["hospital equipment maintenance planning", "biomedical equipment servicing", "downtime reduction"],
    equipment: ["Medical Equipment"],
    excerpt: "A simple planning model for organizing medical equipment checks and repair intake.",
    servicePath: "/services",
    format: "Service planning guide",
    checks: ["asset priority", "failure history", "inspection intervals", "repair documentation"],
  },
  {
    slug: "biomedical-equipment-service-documentation",
    title: "Biomedical Equipment Service Documentation",
    category: "Repair Insights",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-09-01",
    image: blogImages.biomedical,
    imageAlt: "Biomedical equipment service documentation and repair records",
    primaryKeyword: "biomedical equipment service documentation",
    keywords: ["biomedical equipment service documentation", "medical equipment service", "repair records"],
    equipment: ["Medical Equipment"],
    excerpt: "What useful service records include and why they speed up future repair decisions.",
    servicePath: "/services",
    format: "Technical explainer",
    checks: ["fault notes", "model details", "repair history", "test results"],
  },
  {
    slug: "multi-brand-medical-equipment-servicing",
    title: "Multi-Brand Medical Equipment Servicing",
    category: "Repair Insights",
    difficulty: "Intermediate",
    readingTime: 5,
    date: "2026-08-30",
    image: blogImages.biomedical,
    imageAlt: "Multi-brand medical equipment prepared for service",
    primaryKeyword: "multi-brand medical equipment servicing",
    keywords: ["multi-brand medical equipment servicing", "biomedical engineering support", "medical equipment repair"],
    equipment: ["Medical Equipment"],
    excerpt: "How multi-brand repair support depends on equipment condition, parts and inspection results.",
    servicePath: "/services",
    format: "Service planning guide",
    checks: ["brand and model details", "fault repeatability", "parts options", "test compatibility"],
  },
  {
    slug: "medical-equipment-downtime-reduction",
    title: "Medical Equipment Downtime Reduction",
    category: "Repair Insights",
    difficulty: "Intermediate",
    readingTime: 5,
    date: "2026-08-28",
    image: blogImages.biomedical,
    imageAlt: "Medical equipment organized to reduce repair downtime",
    primaryKeyword: "medical equipment downtime reduction",
    keywords: ["medical equipment downtime reduction", "repair turnaround", "biomedical maintenance"],
    equipment: ["Medical Equipment"],
    excerpt: "Practical intake and maintenance habits that help reduce avoidable equipment downtime.",
    servicePath: "/repair-process",
    format: "Engineering checklist",
    checks: ["fault reporting quality", "spare planning", "pickup readiness", "approval workflow"],
  },
  {
    slug: "endoscope-connector-problems",
    title: "Endoscope Connector Problems: What to Inspect",
    category: "Fault Analysis",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-08-26",
    image: blogImages.endoscopy,
    imageAlt: "Endoscope connector inspected for service faults",
    primaryKeyword: "endoscope connector problems",
    keywords: ["endoscope connector problems", "endoscope repair decisions", "endoscopy diagnostics"],
    equipment: ["Endoscopes"],
    excerpt: "A focused look at connector damage, poor fit and intermittent endoscopy system faults.",
    servicePath: "/services/endoscopy-repair",
    format: "Inspection guide",
    checks: ["connector pins", "locking fit", "moisture signs", "cable strain"],
  },
  {
    slug: "endoscope-bending-section-service",
    title: "Endoscope Bending Section Service Considerations",
    category: "Repair Guides",
    difficulty: "Advanced",
    readingTime: 7,
    date: "2026-08-24",
    image: blogImages.endoscopy,
    imageAlt: "Flexible endoscope bending section inspection",
    primaryKeyword: "endoscope bending section service",
    keywords: ["endoscope bending section service", "scope deflection issues", "flexible scope servicing"],
    equipment: ["Flexible Scopes", "Endoscopes"],
    excerpt: "How bending-section wear and deflection complaints are reviewed during flexible scope service.",
    servicePath: "/services/flexible-scope-repair",
    format: "Repair guide",
    checks: ["deflection range", "bending rubber condition", "control response", "leakage findings"],
  },
  {
    slug: "medical-equipment-short-circuit-diagnosis",
    title: "Medical Equipment Short Circuit Diagnosis",
    category: "Tech Explained",
    difficulty: "Expert",
    readingTime: 7,
    date: "2026-08-22",
    image: blogImages.pcb,
    imageAlt: "Medical equipment circuit board short circuit diagnosis",
    primaryKeyword: "medical equipment short circuit diagnosis",
    keywords: ["medical equipment short circuit diagnosis", "PCB diagnostics", "component-level repair"],
    equipment: ["Medical Equipment PCBs"],
    excerpt: "How short circuits are isolated before board-level repair is attempted.",
    servicePath: "/services/pcb-board-level-repair",
    format: "Diagnostic guide",
    checks: ["resistance paths", "heat signatures", "damaged components", "power rail behavior"],
  },
  {
    slug: "camera-head-connector-faults",
    title: "Camera Head Connector Faults",
    category: "Repair Guides",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-08-20",
    image: blogImages.camera,
    imageAlt: "Camera head connector fault inspection",
    primaryKeyword: "camera head connector faults",
    keywords: ["camera head connector faults", "camera head electronics repair", "endoscopy imaging repair"],
    equipment: ["Camera Heads"],
    excerpt: "Why connector wear and cable movement can create repeat image and signal complaints.",
    servicePath: "/services/camera-head-repair",
    format: "Repair guide",
    checks: ["connector pins", "strain relief", "cable flex points", "signal stability"],
  },
  {
    slug: "medical-equipment-lifecycle-repair-planning",
    title: "Medical Equipment Lifecycle Repair Planning",
    category: "Cost & Repair Decisions",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-08-18",
    image: blogImages.biomedical,
    imageAlt: "Medical equipment lifecycle repair planning",
    primaryKeyword: "medical equipment lifecycle repair planning",
    keywords: ["medical equipment lifecycle repair planning", "repair vs replacement decisions", "biomedical support"],
    equipment: ["Medical Equipment"],
    excerpt: "How repair history, serviceability and criticality shape lifecycle decisions.",
    servicePath: "/services",
    format: "Decision guide",
    checks: ["equipment age", "failure pattern", "critical use", "parts availability"],
  },
  {
    slug: "endoscopy-service-planning-for-hospitals",
    title: "Endoscopy Service Planning for Hospitals",
    category: "Repair Insights",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-08-16",
    image: blogImages.endoscopy,
    imageAlt: "Endoscopy equipment service planning for hospital teams",
    primaryKeyword: "endoscopy service planning",
    keywords: ["endoscopy service planning", "endoscopy equipment maintenance", "repair turnaround"],
    equipment: ["Endoscopy Systems"],
    excerpt: "A planning guide for organizing endoscopy repair intake, inspection and turnaround.",
    servicePath: "/services/endoscopy-repair",
    format: "Service planning guide",
    checks: ["asset list", "fault priority", "backup equipment", "repair request details"],
  },
  {
    slug: "nephroscope-preventive-care-checklist",
    title: "Nephroscope Preventive Care Checklist",
    category: "Preventive Maintenance",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-08-14",
    image: blogImages.nephroscope,
    imageAlt: "Nephroscope preventive care and inspection checklist",
    primaryKeyword: "nephroscope preventive care",
    keywords: ["nephroscope preventive care", "nephroscope servicing", "urology endoscope maintenance"],
    equipment: ["Nephroscopes"],
    excerpt: "Simple handling and inspection practices that help protect nephroscopes before service is needed.",
    servicePath: "/services/nephroscope-repair",
    format: "Maintenance checklist",
    checks: ["visual condition", "light transmission", "tip protection", "storage handling"],
  },
];

const expandedBlogs = expandedBlogPlans.map(makeExpandedBlog);

export const blogs: Blog[] = [
  ...expandedBlogs,
  {
    slug: "endoscope-maintenance-basics",
    title: "Endoscope Maintenance: A Practical Care Guide",
    category: "Preventive Maintenance",
    difficulty: "Beginner",
    readingTime: 5,
    date: "2026-08-12",
    image: endoscopeImg,
    imageAlt: "Endoscopy equipment prepared for inspection and service",
    keywords: ["endoscope maintenance", "endoscopy repair", "equipment care"],
    equipment: ["Endoscopes", "Rigid Scopes", "Flexible Scopes"],
    excerpt:
      "Simple daily practices that extend the working life of your rigid and flexible endoscopes.",
    body: "Endoscopes are precision instruments. Daily cleaning discipline, careful storage, correct leakage testing and a strong bio-cleaning protocol are the four practices that most influence scope life. This guide walks through each of them in the context of an average endoscopy centre.\n\nSection 1 — Cleaning discipline. Follow the manufacturer's IFU and never skip pre-cleaning at the point of use.\n\nSection 2 — Storage. Store scopes vertically in a dedicated cabinet.\n\nSection 3 — Leakage testing. Perform a leakage test after every procedure and before reprocessing.\n\nSection 4 — Handling. Train every staff member on scope handling to reduce accidental damage.",
  },
  {
    slug: "pcb-repair-what-to-expect",
    title: "Board-Level PCB Repair: What To Expect",
    category: "Tech Explained",
    difficulty: "Advanced",
    readingTime: 6,
    date: "2026-08-10",
    image: servicePcbDiagnosisImg,
    imageAlt: "Technician diagnosing a medical equipment circuit board",
    keywords: ["PCB repair", "board-level repair", "component-level repair"],
    equipment: ["Medical Equipment PCBs", "Video Processors", "Camera Heads"],
    excerpt: "Understanding component-level diagnosis for medical equipment PCBs.",
    body: "Board-level repair replaces individual failed components rather than swapping the entire assembly. This article walks through the workflow: visual inspection, powered testing, thermal imaging, signal tracing, component-level repair, and post-repair verification.",
  },
  {
    slug: "camera-head-care",
    title: "Camera Head Care: Small Habits, Big Savings",
    category: "Equipment Care",
    difficulty: "Beginner",
    readingTime: 4,
    date: "2026-08-08",
    image: cameraImg,
    imageAlt: "Medical camera head equipment for endoscopy imaging",
    keywords: ["camera head repair", "camera head care", "endoscopy imaging"],
    equipment: ["Camera Heads", "Endoscopy Systems"],
    excerpt: "Small day-to-day habits that keep camera heads image-perfect.",
    body: "Camera heads are one of the most repair-prone parts of any endoscopy stack. This piece covers cable strain relief, cleaning discipline, connector care and how to spot early failure signs before an image drops out mid-case.",
  },
  {
    slug: "common-endoscope-problems",
    title: "Common Endoscope Problems and What They May Indicate",
    category: "Fault Analysis",
    difficulty: "Intermediate",
    readingTime: 7,
    date: "2026-08-06",
    image: serviceOpticalInspectionImg,
    imageAlt: "Optical inspection setup for precision equipment service",
    keywords: ["endoscope problems", "endoscope fault analysis", "endoscopy diagnostics"],
    equipment: ["Endoscopes", "Laparoscopes", "Arthroscopes", "Cystoscopes"],
    excerpt:
      "A repair-focused overview of blurred images, light loss, leakage, stiffness and connector faults.",
    body: "Endoscope faults often show up as changes in image quality, light transmission, handling or leakage checks. These symptoms do not always identify the exact failed part, but they help technicians decide what to inspect first.\n\nA blurred, dark or distorted image can point toward lens damage, contamination, optical misalignment or light-transmission issues. Physical inspection and image testing are needed before repair feasibility can be confirmed.\n\nLeakage, stiffness, poor angulation or damaged connectors should be treated seriously. Continued use can worsen internal damage. A professional technical assessment helps decide whether servicing, component repair or broader refurbishment is required.",
    takeaways: [
      "Symptoms guide inspection, but they do not replace diagnosis.",
      "Image, light and leakage issues should be assessed before further use.",
      "Repair scope depends on condition, equipment type and technical feasibility.",
    ],
    seoTitle: "Common Endoscope Problems | Fault Analysis Guide",
    seoDescription:
      "Repair-focused guide to common endoscope faults including image problems, leakage, light loss and connector damage.",
  },
  {
    slug: "rigid-scope-optical-problems",
    title: "Rigid Scope Optical Problems: What Technicians Check",
    category: "Repair Guides",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-08-04",
    image: endoscopeImg,
    imageAlt: "Rigid endoscope equipment for optical repair assessment",
    keywords: ["rigid scope repair", "laparoscope repair", "optical inspection"],
    equipment: ["Rigid Scopes", "Laparoscopes", "Arthroscopes", "Cystoscopes"],
    excerpt:
      "How optical clarity, rod-lens condition, sheath damage and light transmission are reviewed during rigid scope repair.",
    body: "Rigid scopes rely on clean alignment, intact lenses and stable light transmission. When the image becomes cloudy, dark or distorted, the repair assessment usually starts with optical inspection and external damage checks.\n\nTechnicians check the objective lens, eyepiece, sheath, light post and internal optical path where possible. A bent sheath, cracked lens, moisture ingress or failed seal can all affect image quality.\n\nRepair may involve optical alignment, lens work, sheath restoration or seal replacement depending on condition. Final image and functional checks are needed before the scope is returned to service use.",
    takeaways: [
      "Rigid scope image problems can come from optics, seals, sheath damage or light loss.",
      "Inspection determines whether repair or refurbishment is appropriate.",
      "Final image-quality testing is part of a responsible repair workflow.",
    ],
    seoTitle: "Rigid Scope Repair Guide | Optical Problems",
    seoDescription:
      "Repair guide for rigid scope optical problems, including blurred images, damaged lenses, sheath issues and light transmission checks.",
  },
  {
    slug: "flexible-scope-repair-signs",
    title: "When a Flexible Scope Needs Professional Repair",
    category: "Repair Guides",
    difficulty: "Intermediate",
    readingTime: 6,
    date: "2026-08-02",
    image: endoscopeImg,
    imageAlt: "Flexible endoscope equipment under technical review",
    keywords: ["flexible scope repair", "endoscope leakage", "scope diagnostics"],
    equipment: ["Flexible Scopes", "Ureteroscopes", "Nephroscopes"],
    excerpt:
      "Warning signs such as leakage, deflection issues, working-channel damage and intermittent image problems.",
    body: "Flexible scopes combine optics, electronics, insertion components, channels and deflection systems. Because the structure is delicate, small faults should be inspected before they become deeper internal damage.\n\nCommon warning signs include failed leakage checks, poor deflection, working-channel resistance, intermittent image loss, connector damage and visible insertion-tube wear. These signs should not be ignored or handled as routine cleaning issues.\n\nA professional repair assessment reviews the likely fault area and whether service is feasible. The repair path can vary from connector work to insertion-section repair, angulation service or image-system diagnosis.",
    takeaways: [
      "Leakage, deflection and image issues are repair-assessment signals.",
      "Flexible scope faults can worsen if the unit remains in use.",
      "Inspection findings determine the repair scope.",
    ],
    seoTitle: "Flexible Scope Repair Signs | Arise Healthcare Solutions",
    seoDescription:
      "Learn when a flexible scope should be sent for professional inspection, including leakage, deflection and image-quality issues.",
  },
  {
    slug: "endoscopy-processor-image-problems",
    title: "Endoscopy Processor Image Problems: A Repair View",
    category: "Fault Analysis",
    difficulty: "Advanced",
    readingTime: 7,
    date: "2026-07-30",
    image: processorImg,
    imageAlt: "Endoscopy video processor equipment for servicing",
    keywords: ["processor repair", "video processor faults", "endoscopy signal problems"],
    equipment: ["Video Processors", "Camera Heads", "Medical Monitors"],
    excerpt:
      "How no-signal, colour, port, power and overheating issues are approached during processor diagnosis.",
    body: "Image faults in an endoscopy stack can originate from the camera head, processor, cable, monitor or connector path. Processor diagnosis starts by separating signal issues from display, power and external cable problems.\n\nCommon processor concerns include no output, error messages, overheating, port damage and colour-processing issues. Inspection may involve connector checks, internal board review, cooling assessment and controlled functional testing.\n\nRepair feasibility depends on the fault, board condition and available parts. After repair, the unit should be tested with compatible equipment to verify signal stability and image behaviour.",
    takeaways: [
      "Processor image faults should be isolated from camera and monitor issues.",
      "Ports, cooling, power and internal boards are common inspection areas.",
      "Functional signal testing is needed after repair.",
    ],
    seoTitle: "Endoscopy Processor Repair | Image Problem Diagnosis",
    seoDescription:
      "Repair-focused explanation of endoscopy processor image problems, no-signal faults, connector damage and board-level diagnosis.",
  },
  {
    slug: "light-source-repair-guide",
    title: "Light Source Repair Guide for Endoscopy Systems",
    category: "Repair Guides",
    difficulty: "Intermediate",
    readingTime: 5,
    date: "2026-07-28",
    image: lightImg,
    imageAlt: "Medical light source equipment for endoscopy service",
    keywords: ["light source repair", "LED light source", "Xenon light source"],
    equipment: ["Light Sources", "Endoscopy Systems"],
    excerpt:
      "A service overview for low output, no light, overheating, fan faults and power-section issues.",
    body: "A light source fault can affect the entire endoscopy image chain. Low light, no output, overheating or repeated lamp errors should be inspected before assuming the scope is the cause.\n\nService checks may include the lamp or LED module, cooling fan, power supply, fibre connection and control panel. The exact repair path depends on equipment design and the fault observed during inspection.\n\nAfter repair, output and functional behaviour should be checked in a controlled setup. Equipment should not be returned to use solely because a lamp or module was replaced.",
    takeaways: [
      "Low illumination can come from the light source, cable or scope path.",
      "Cooling and power faults need proper technical diagnosis.",
      "Final output checks help confirm service quality.",
    ],
    seoTitle: "Endoscopy Light Source Repair Guide",
    seoDescription:
      "Guide to common LED and Xenon light source issues including low output, overheating, lamp faults and power-section repair.",
  },
  {
    slug: "co2-insufflator-inspection",
    title: "CO2 Insufflator Inspection and Repair Considerations",
    category: "Equipment Care",
    difficulty: "Advanced",
    readingTime: 5,
    date: "2026-07-25",
    image: co2Img,
    imageAlt: "CO2 insufflator equipment for surgical service assessment",
    keywords: ["CO2 insufflator repair", "insufflator inspection", "surgical equipment service"],
    equipment: ["CO2 Insufflators", "Surgical Equipment"],
    excerpt:
      "Repair considerations for pressure instability, flow issues, alarms, sensors and control-panel faults.",
    body: "CO2 insufflators require careful inspection because pressure, flow, alarms and controls all affect equipment function. A repair assessment should focus on the reported symptom and the unit's observed behaviour during testing.\n\nCommon issues include unstable pressure, flow problems, error messages, sensor faults, valve concerns and control-panel problems. Service availability depends on model, condition, parts and inspection results.\n\nAny repaired insufflator should go through functional and safety checks appropriate to the equipment before it is returned to the customer's workflow.",
    takeaways: [
      "Pressure, flow and alarm complaints need controlled technical assessment.",
      "Repair feasibility depends on model, condition and parts availability.",
      "Functional checks are a required part of the service process.",
    ],
    seoTitle: "CO2 Insufflator Repair and Inspection Guide",
    seoDescription:
      "Repair considerations for CO2 insufflators, including pressure, flow, alarm, sensor and control-panel faults.",
  },
  {
    slug: "medical-equipment-repair-vs-replacement",
    title: "Medical Equipment Repair vs Replacement: How to Decide",
    category: "Cost & Repair Decisions",
    difficulty: "Beginner",
    readingTime: 6,
    date: "2026-07-22",
    image: serviceMedicalEquipmentImg,
    imageAlt: "Medical equipment arranged for repair decision assessment",
    keywords: ["medical equipment repair", "repair vs replacement", "repair feasibility"],
    equipment: ["Endoscopy Systems", "Medical Equipment", "PCBs"],
    excerpt:
      "A practical decision framework based on condition, fault type, parts availability and service feasibility.",
    body: "Repair versus replacement should be decided after technical inspection, not guesswork. The right choice depends on equipment condition, fault type, age, parts availability and the importance of the equipment in the facility's workflow.\n\nRepair may be sensible when the fault is isolated, parts are available and the equipment can pass functional checks after service. Replacement may be more appropriate when damage is extensive, parts are unavailable or repair would not restore dependable function.\n\nArise Healthcare Solutions assesses supported equipment and provides a repair scope where feasible. The final decision should consider technical findings, quotation details and the customer's operational needs.",
    takeaways: [
      "Inspection findings should drive the repair-or-replace decision.",
      "Parts availability and equipment condition matter as much as the visible fault.",
      "A clear quotation helps teams make a practical service decision.",
    ],
    seoTitle: "Medical Equipment Repair vs Replacement Guide",
    seoDescription:
      "How to evaluate medical equipment repair versus replacement based on fault type, equipment condition, parts availability and repair feasibility.",
  },
  {
    slug: "medical-monitor-repair-guide",
    title: "Medical Monitor Repair Guide: Display and Power Faults",
    category: "Fault Analysis",
    difficulty: "Intermediate",
    readingTime: 5,
    date: "2026-07-20",
    image: monitorImg,
    imageAlt: "Medical monitor equipment used in clinical imaging setups",
    keywords: ["medical monitor repair", "display repair", "monitor power fault"],
    equipment: ["Medical Monitors", "Patient Monitors"],
    excerpt:
      "What blank displays, flicker, colour distortion, backlight failure and input-port damage may indicate.",
    body: "Medical display faults can come from the panel, backlight, power section, input ports or control board. The first repair step is to confirm whether the fault follows the monitor or comes from the connected equipment.\n\nBlank screens, flicker, colour distortion and input problems each point to different inspection paths. Physical port damage and intermittent power issues should be checked before deeper board-level diagnosis.\n\nAfter repair, the display should be tested with suitable inputs and observed for stable operation. Colour or image behaviour should be reviewed according to the equipment's intended use.",
    takeaways: [
      "Monitor faults should be isolated from cable and source-equipment issues.",
      "Power, ports, panel and backlight are common inspection areas.",
      "Stable display testing is needed after repair.",
    ],
    seoTitle: "Medical Monitor Repair Guide | Display Faults",
    seoDescription:
      "Repair guide for medical monitor display, backlight, power, flicker, colour and input-port faults.",
  },
  {
    slug: "repair-intake-process",
    title: "What Happens During a Medical Equipment Repair Intake?",
    category: "Repair Insights",
    difficulty: "Beginner",
    readingTime: 4,
    date: "2026-07-18",
    image: serviceLabTestingImg,
    imageAlt: "Technical lab equipment used for service intake and testing",
    keywords: ["repair request", "equipment inspection", "medical equipment service"],
    equipment: ["Medical Equipment", "Endoscopy Systems", "PCBs"],
    excerpt:
      "A clear look at request submission, equipment receipt, diagnosis, quotation, repair and final testing.",
    body: "A good repair process starts with clear equipment details and a useful fault description. The repair request should include equipment type, brand, model and the issue observed by the team.\n\nAfter the equipment is received, technicians inspect the condition, diagnose the reported fault and identify whether repair is feasible. The quotation should describe the repair scope, parts requirement and service limitations where relevant.\n\nOnce approved, repair or servicing is completed and the unit moves through functional checks before dispatch. Warranty coverage, where available, should be confirmed through the final quotation, invoice or service report.",
    takeaways: [
      "Accurate intake details help speed up diagnosis.",
      "Inspection comes before quotation and repair approval.",
      "Final testing and clear service documentation complete the repair workflow.",
    ],
    seoTitle: "Medical Equipment Repair Intake Process | Arise",
    seoDescription:
      "Understand the Arise repair process from request submission and equipment inspection to quotation, repair, testing and dispatch.",
  },
];

export const galleryImages = [
  { title: "Component-level PCB repair", cat: "Laboratory", src: servicePcbDiagnosisImg },
  { title: "Optical inspection bench", cat: "Laboratory", src: serviceOpticalInspectionImg },
  { title: "Endoscope QC", cat: "Repair", src: serviceMicroscopeRepairImg },
  { title: "Precision soldering", cat: "Laboratory", src: servicePcbDiagnosisImg },
  { title: "Medical monitor testing", cat: "Repair", src: serviceMedicalEquipmentImg },
  { title: "Camera head service", cat: "Repair", src: serviceLabTestingImg },
];

export const repairStatusLabels: Record<string, string> = {
  request_received: "Request Received",
  awaiting_equipment: "Awaiting Equipment",
  equipment_received: "Equipment Received",
  under_inspection: "Under Inspection",
  quotation_sent: "Quotation Sent",
  approval_pending: "Approval Pending",
  repair_in_progress: "Repair in Progress",
  quality_testing: "Quality Testing",
  ready_for_dispatch: "Ready for Dispatch",
  dispatched: "Dispatched",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

export const allRoutes = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About Us" },
  { path: "/services", label: "Services" },
  { path: "/equipments", label: "All Equipments" },
  { path: "/repair-process", label: "Repair Process" },
  { path: "/quality", label: "Quality" },
  { path: "/industries", label: "Industries" },
  { path: "/gallery", label: "Gallery" },
  { path: "/testimonials", label: "Testimonials" },
  { path: "/blogs", label: "Blogs" },
  { path: "/faq", label: "FAQ" },
  { path: "/request-repair", label: "Request a Repair" },
  { path: "/track-repair", label: "Track Repair" },
  { path: "/contact", label: "Contact" },
  { path: "/privacy", label: "Privacy Policy" },
  { path: "/terms", label: "Terms" },
  { path: "/warranty", label: "Warranty" },
];
