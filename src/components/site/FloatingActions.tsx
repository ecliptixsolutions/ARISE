import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Bot, ExternalLink, Loader2, Send, Sparkles, X } from "lucide-react";
import { equipmentCategories, services, settings, whatsappHref } from "@/lib/site-data";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppIcon } from "./WhatsAppIcon";

type ChatMessage = {
  role: "bot" | "user";
  text: string;
  actions?: string[];
};

type Lead = {
  full_name: string;
  email: string;
  mobile: string;
  equipment_name: string;
  brand: string;
  model_no: string;
  problem_description: string;
  details: string;
};

type LeadField = keyof Lead;

const initialLead: Lead = {
  full_name: "",
  email: "",
  mobile: "",
  equipment_name: "",
  brand: "",
  model_no: "",
  problem_description: "",
  details: "",
};

const leadQuestions: Array<{ key: LeadField; question: string; optional?: boolean }> = [
  { key: "full_name", question: "Sure. What is your name?" },
  { key: "email", question: "What email should our team use?" },
  { key: "mobile", question: "Please share your phone number." },
  { key: "equipment_name", question: "What equipment type needs repair?" },
  { key: "brand", question: "Which brand is it?" },
  { key: "model_no", question: "What is the model number, if available? You can type 'skip'." , optional: true },
  { key: "problem_description", question: "Briefly describe the problem or fault." },
  { key: "details", question: "Any additional details, city, pickup requirement, or urgency? You can type 'skip'.", optional: true },
];

const quickActions = ["Repair Services", "Supported Brands", "Repair Process", "Get a Quote", "Contact Arise"];

const supportedBrands = [
  "Olympus",
  "KARL STORZ",
  "Richard Wolf",
  "PENTAX Medical",
  "Fujifilm",
  "Stryker",
  "Aesculap",
  "B. Braun",
  "SCHOLLY",
  "RZ Medizintechnik",
  "Ackermann",
  "GE HealthCare",
  "Philips",
  "Medtronic",
  "Drager",
  "Mindray",
  "Siemens Healthineers",
];

const firstMessage: ChatMessage = {
  role: "bot",
  text: "Hi 👋 I’m Arise AI Assistant. I can help you with equipment repairs, services, supported brands, repair processes, and quote requests. How can I help?",
  actions: quickActions,
};

function makeCode() {
  const y = new Date().getFullYear();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `AR-${y}-${rnd}`;
}

function servicesText() {
  const names = [
    "Endoscope Repair",
    "Nephroscope Repair",
    "Ureteroscope Repair",
    "Cystoscope Repair",
    "Arthroscope Repair",
    "Laparoscope Repair",
    "Camera Head & System Repair",
    "Light Cable / Light Fiber Repair",
    "Optical & Image Guide Repair",
    "Preventive Maintenance & Servicing",
  ];
  return `Arise supports ${names.join(", ")}. Share the equipment type, brand, model and issue, and I can guide you to the right next step.`;
}

function findServiceAnswer(lower: string) {
  const match = services.find((service) => {
    const haystack = `${service.name} ${service.category} ${service.short} ${service.aliases?.join(" ") ?? ""}`.toLowerCase();
    return service.name.toLowerCase().split(/\s+/).some((word) => word.length > 4 && lower.includes(word)) || haystack.includes(lower);
  });

  if (!match) return null;
  return `${match.name}: ${match.short} Common issues include ${match.commonProblems.slice(0, 4).join(", ")}. For a repair review, share brand, model, fault symptoms and any visible damage.`;
}

function getBotReply(text: string): ChatMessage {
  const lower = text.toLowerCase();

  if (lower.includes("quote") || lower.includes("estimate") || lower.includes("price") || lower.includes("cost")) {
    return {
      role: "bot",
      text: "I can help capture a repair/quote request. I’ll ask for name, email, phone, equipment type, brand, model if available, problem, and extra details.",
      actions: ["Start quote request", "Continue on WhatsApp"],
    };
  }

  if (lower.includes("brand") || supportedBrands.some((brand) => lower.includes(brand.toLowerCase()))) {
    const named = supportedBrands.find((brand) => lower.includes(brand.toLowerCase()));
    return {
      role: "bot",
      text: named
        ? `Yes, ${named} is listed among the brands Arise supports. Please share the equipment type, model and issue so the team can confirm repair scope after inspection.`
        : `Arise lists support for brands including ${supportedBrands.slice(0, 10).join(", ")} and other medical equipment brands. Specific repair feasibility depends on equipment condition and parts availability.`,
      actions: ["Get a Quote", "Contact Arise"],
    };
  }

  if (lower.includes("process") || lower.includes("send") || lower.includes("ship") || lower.includes("pickup")) {
    return {
      role: "bot",
      text: "The repair flow is: submit a repair request, arrange pickup or delivery, technical inspection, diagnosis and quotation, component-level repair after approval, quality testing, then dispatch. You can ship equipment to Arise or contact the team for next steps.",
      actions: ["Get a Quote", "Continue on WhatsApp"],
    };
  }

  if (lower.includes("location") || lower.includes("address") || lower.includes("where")) {
    return {
      role: "bot",
      text: `Arise Healthcare Solutions is located at ${settings.address}. You can call ${settings.phonePlaceholder} or continue on WhatsApp for directions and dispatch guidance.`,
      actions: ["Contact Arise", "Continue on WhatsApp"],
    };
  }

  if (lower.includes("poor image") || lower.includes("image quality") || lower.includes("leak") || lower.includes("visible damage")) {
    return {
      role: "bot",
      text: "For scope image or leakage issues, please share: brand, model, whether image is absent or degraded, whether there is visible damage, and whether leak testing was done. Arise can inspect and advise repair scope; please do not submit patient data.",
      actions: ["Get a Quote", "Continue on WhatsApp"],
    };
  }

  if (lower.includes("service") || lower.includes("repair") || lower.includes("endoscope") || lower.includes("camera head") || lower.includes("scope")) {
    const specific = findServiceAnswer(lower);
    return {
      role: "bot",
      text: specific ?? servicesText(),
      actions: ["Repair Services", "Get a Quote", "Supported Brands"],
    };
  }

  if (lower.includes("contact") || lower.includes("whatsapp") || lower.includes("call")) {
    return {
      role: "bot",
      text: `You can contact Arise at ${settings.phonePlaceholder}, ${settings.secondaryPhonePlaceholder}, or ${settings.emailPlaceholder}. WhatsApp is available from the button below.`,
      actions: ["Continue on WhatsApp", "Get a Quote"],
    };
  }

  return {
    role: "bot",
    text: "I can help with Arise repair services, supported brands, repair process, equipment issues and quote requests. If your question needs exact pricing or technical confirmation, the Arise team will review after inspection.",
    actions: quickActions,
  };
}

function questionFromAction(action: string) {
  if (action === "Repair Services") return "What repair services do you provide?";
  if (action === "Supported Brands") return "What brands do you support?";
  if (action === "Repair Process") return "What is the repair process?";
  if (action === "Get a Quote" || action === "Start quote request") return "I want to get a quote";
  if (action === "Contact Arise") return "How can I contact Arise?";
  if (action === "Continue on WhatsApp") return "Continue on WhatsApp";
  if (action === "Retry submission") return "Retry submission";
  return action;
}

export function FloatingActions() {
  const [show, setShow] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([firstMessage]);
  const [typing, setTyping] = useState(false);
  const [lead, setLead] = useState<Lead>(initialLead);
  const [leadStep, setLeadStep] = useState<number | null>(null);
  const [lastLead, setLastLead] = useState<Lead | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const whatsappUrl = useMemo(() => whatsappHref(), []);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  async function submitLead(data: Lead) {
    const request_code = makeCode();
    const problem = `${data.problem_description}${data.details ? `\n\nAdditional details: ${data.details}` : ""}`;
    const { error } = await supabase.from("repair_requests").insert({
      request_code,
      full_name: data.full_name,
      email: data.email,
      mobile: data.mobile,
      whatsapp: data.mobile,
      equipment_name: data.equipment_name,
      equipment_category: equipmentCategories.find((category) =>
        data.equipment_name.toLowerCase().includes(category.toLowerCase()),
      ) ?? null,
      brand: data.brand,
      model_no: data.model_no,
      problem_description: problem,
      urgency: "normal",
      preferred_contact: "phone",
      pickup_required: false,
      consent: true,
    });

    if (error) {
      setLastLead(data);
      return {
        role: "bot" as const,
        text: "I could not submit the request right now. Please retry, use the repair request page, or continue on WhatsApp.",
        actions: ["Retry submission", "Continue on WhatsApp"],
      };
    }

    setLastLead(null);
    return {
      role: "bot" as const,
      text: `Thank you. Your repair/quote request has been captured. Our team will review the details and contact you. Request ID: ${request_code}`,
      actions: ["Continue on WhatsApp", "Contact Arise"],
    };
  }

  async function handleLeadAnswer(text: string): Promise<ChatMessage> {
    if (text.toLowerCase() === "retry submission" && lastLead) return submitLead(lastLead);
    if (leadStep === null) {
      setLead(initialLead);
      setLeadStep(0);
      return { role: "bot", text: leadQuestions[0].question };
    }

    const field = leadQuestions[leadStep];
    const value = field.optional && text.trim().toLowerCase() === "skip" ? "" : text.trim();
    const nextLead = { ...lead, [field.key]: value };
    setLead(nextLead);

    const nextStep = leadStep + 1;
    if (nextStep < leadQuestions.length) {
      setLeadStep(nextStep);
      return { role: "bot", text: leadQuestions[nextStep].question };
    }

    setLeadStep(null);
    return submitLead(nextLead);
  }

  async function makeReply(text: string): Promise<ChatMessage> {
    const lower = text.toLowerCase();
    if (lower === "continue on whatsapp") {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return { role: "bot", text: "Opening WhatsApp so you can continue with the Arise team." };
    }
    if (leadStep !== null || lower.includes("quote") || lower.includes("estimate") || lower === "start quote request" || lower === "retry submission") {
      return handleLeadAnswer(text);
    }
    return getBotReply(text);
  }

  const sendMessage = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || typing) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const reply = await makeReply(text);
      window.setTimeout(() => {
        setMessages((current) => [...current, reply]);
        setTyping(false);
      }, 450);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "bot",
          text: "Something went wrong while preparing a response. Please try again or contact Arise on WhatsApp.",
          actions: ["Retry submission", "Continue on WhatsApp"],
        },
      ]);
      setTyping(false);
    }
  };

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-3 z-[60] flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3 sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:right-5">
      {chatOpen && (
        <div className="flex max-h-[calc(100dvh-8.5rem)] w-[calc(100vw-24px)] animate-in flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-2xl shadow-primary/25 duration-200 fade-in slide-in-from-bottom-4 sm:max-h-none sm:w-[390px]">
          <div className="flex items-center justify-between bg-[linear-gradient(135deg,#071C2C,#138bd2_58%,#18b9bb)] px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/18 bg-white/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <Bot className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold">Arise AI Assistant</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/78">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Online now
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-white/16"
              aria-label="Close AI chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="min-h-[220px] flex-1 space-y-3 overflow-y-auto bg-[#f7fbfd] p-4 sm:h-[min(58vh,430px)] sm:flex-none">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[86%] ${message.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-6 shadow-sm ${
                      message.role === "user"
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md border border-border bg-white text-navy"
                    }`}
                  >
                    {message.text}
                  </div>
                  {message.actions && (
                    <div className="flex flex-wrap gap-1.5">
                      {message.actions.map((action) => (
                        <button
                          key={action}
                          onClick={() => sendMessage(questionFromAction(action))}
                          className="rounded-full border border-primary/20 bg-white px-3 py-1 text-[11px] font-bold text-primary shadow-sm transition hover:bg-surface"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-white px-3.5 py-2.5 text-sm text-navy shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Arise AI is typing
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="Ask about repairs, brands, quote..."
                disabled={typing}
                className="min-w-0 flex-1 rounded-2xl border border-border bg-white px-4 py-2.5 text-sm text-navy outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:opacity-70"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim() || typing}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-xs font-bold text-navy transition hover:bg-emerald-100"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp
              </a>
              <a
                href="/request-repair"
                className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-primary/20 bg-surface text-xs font-bold text-primary transition hover:bg-primary/8"
              >
                Repair Form <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {show && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="grid h-11 w-11 place-items-center rounded-full border border-primary/30 bg-white text-primary shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-surface"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <button
        type="button"
        onClick={() => setChatOpen((open) => !open)}
        title="Chat with Arise AI Assistant"
        className="relative grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-[linear-gradient(135deg,#138bd2,#18b9bb)] text-white shadow-xl shadow-primary/25 transition hover:-translate-y-1 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:h-[60px] md:w-[60px]"
        aria-label="Open AI chatbot"
      >
        <span className="absolute inset-0 rounded-full bg-cyan/20 blur-md" aria-hidden />
        {chatOpen ? <X className="relative h-6 w-6" /> : <Sparkles className="relative h-7 w-7" />}
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full border-4 border-white text-white shadow-xl shadow-primary/20 transition hover:-translate-y-1 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:h-[60px] md:w-[60px]"
        style={{ background: "#25D366" }}
        aria-label="Chat with us on WhatsApp"
      >
        <WhatsAppIcon className="h-8 w-8" />
      </a>
    </div>
  );
}
