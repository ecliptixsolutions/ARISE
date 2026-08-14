import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingActions } from "./FloatingActions";
import { BackButton } from "./BackButton";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingActions />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  showBack,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  showBack?: boolean;
}) {
  return (
    <section className="relative overflow-hidden grad-navy">
      <div
        className="absolute -right-24 top-8 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute left-10 top-16 h-36 w-36 rounded-full bg-gold-soft/80 blur-3xl"
        aria-hidden
      />
      <div className="container-x relative py-14 md:py-20">
        {showBack && (
          <div className="mb-6">
            <BackButton />
          </div>
        )}
        {eyebrow && (
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </div>
        )}
        <h1 className="page-title max-w-3xl font-display text-3xl font-bold leading-tight text-navy md:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base text-foreground md:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
