import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          window.history.back();
        } else {
          void navigate({ to: "/" });
        }
      }}
      aria-label="Go back to the previous page"
      className="group inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-md transition hover:border-primary hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
      Back
    </button>
  );
}