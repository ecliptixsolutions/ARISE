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

export const blogs = [
  {
    slug: "endoscope-maintenance-basics",
    title: "Endoscope Maintenance: A Practical Care Guide",
    category: "Endoscopy Maintenance",
    excerpt:
      "Simple daily practices that extend the working life of your rigid and flexible endoscopes.",
    body: "Endoscopes are precision instruments. Daily cleaning discipline, careful storage, correct leakage testing and a strong bio-cleaning protocol are the four practices that most influence scope life. This guide walks through each of them in the context of an average endoscopy centre.\n\nSection 1 — Cleaning discipline. Follow the manufacturer's IFU and never skip pre-cleaning at the point of use.\n\nSection 2 — Storage. Store scopes vertically in a dedicated cabinet.\n\nSection 3 — Leakage testing. Perform a leakage test after every procedure and before reprocessing.\n\nSection 4 — Handling. Train every staff member on scope handling to reduce accidental damage.",
  },
  {
    slug: "pcb-repair-what-to-expect",
    title: "Board-Level PCB Repair: What To Expect",
    category: "PCB Repair",
    excerpt: "Understanding component-level diagnosis for medical equipment PCBs.",
    body: "Board-level repair replaces individual failed components rather than swapping the entire assembly. This article walks through the workflow: visual inspection, powered testing, thermal imaging, signal tracing, component-level repair, and post-repair verification.",
  },
  {
    slug: "camera-head-care",
    title: "Camera Head Care: Small Habits, Big Savings",
    category: "Camera Head Care",
    excerpt: "Small day-to-day habits that keep camera heads image-perfect.",
    body: "Camera heads are one of the most repair-prone parts of any endoscopy stack. This piece covers cable strain relief, cleaning discipline, connector care and how to spot early failure signs before an image drops out mid-case.",
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
