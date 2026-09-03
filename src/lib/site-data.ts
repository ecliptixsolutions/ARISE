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

export const settings = {
  company: "Arise Healthcare Solutions",
  tagline: "Precision Endoscopy Repair. Trusted Healthcare Solutions.",
  phonePlaceholder: "+91 9989967036",
  secondaryPhonePlaceholder: "+91 8530100483",
  whatsappPlaceholder: "+91 9989967036",
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

export const blogs: Blog[] = [
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
