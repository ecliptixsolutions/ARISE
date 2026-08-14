import { useEffect, useState } from "react";
import { ArrowUp, Bot, Send, X } from "lucide-react";
import { whatsappHref } from "@/lib/site-data";
import { WhatsAppIcon } from "./WhatsAppIcon";

type ChatMessage = {
  role: "bot" | "user";
  text: string;
};

const firstMessage: ChatMessage = {
  role: "bot",
  text: "Hi, I am Arise AI Assistant. Tell me the equipment name and issue, and I will guide you.",
};

function getBotReply(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("endoscopy") || lower.includes("endoscope") || lower.includes("scope")) {
    return "Yes, we support endoscopy repair, refurbished sales, accessories, and after-sales service. Share the brand, model, and fault so our team can review it.";
  }
  if (lower.includes("repair") || lower.includes("service") || lower.includes("fault")) {
    return "Please share equipment type, brand/model, issue details, and your city. For faster help, you can also submit a repair request or WhatsApp our team.";
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("quote")) {
    return "Repair cost depends on inspection and parts. Send equipment details and fault symptoms, then our team can provide a quote.";
  }
  return "Thanks. Our team handles medical equipment repair, endoscopy support, refurbished sales, AMC, and maintenance. What equipment do you need help with?";
}

export function FloatingActions() {
  const [show, setShow] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([firstMessage]);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { role: "user", text },
      { role: "bot", text: getBotReply(text) },
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 flex flex-col items-end gap-3">
      {chatOpen && (
        <div className="w-[min(calc(100vw-2rem),360px)] overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-primary/20">
          <div className="flex items-center justify-between bg-[linear-gradient(135deg,#138bd2,#18b9bb)] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/18">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-bold">Arise AI Assistant</div>
                <div className="text-xs text-white/80">Online now</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="rounded-full p-2 transition hover:bg-white/16"
              aria-label="Close AI chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto bg-surface/60 p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-primary text-white"
                      : "border border-border bg-white text-navy"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendMessage();
                }}
                placeholder="Type your question..."
                className="min-w-0 flex-1 rounded-full border border-border px-4 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={sendMessage}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white transition hover:bg-primary/90"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex h-9 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-xs font-bold text-navy"
            >
              <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Continue on WhatsApp
            </a>
          </div>
        </div>
      )}
      {show && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="grid h-11 w-11 place-items-center rounded-full border border-primary/30 bg-white text-primary shadow-lg shadow-primary/15 hover:bg-surface"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
      <button
        type="button"
        onClick={() => setChatOpen((open) => !open)}
        title="Chat with Arise AI Assistant"
        className="grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-[linear-gradient(135deg,#138bd2,#18b9bb)] text-white shadow-xl shadow-primary/20 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:h-[60px] md:w-[60px]"
        aria-label="Open AI chatbot"
      >
        <Bot className="h-7 w-7" />
      </button>
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with us on WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full border-4 border-white text-white shadow-xl shadow-primary/20 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:h-[60px] md:w-[60px]"
        style={{ background: "#25D366" }}
        aria-label="Chat with us on WhatsApp"
      >
        <WhatsAppIcon className="h-8 w-8" />
      </a>
    </div>
  );
}
