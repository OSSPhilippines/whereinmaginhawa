import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Plus,
  Search,
  MessageSquarePlus,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contributing Guide',
  description:
    'Learn how to contribute to Where In Maginhawa. Add new restaurants, suggest edits, claim your business, and help keep our food directory accurate.',
};

const steps = [
  {
    number: '01',
    icon: Plus,
    title: 'Submit a new place',
    description:
      'Know a restaurant, cafe, or food spot on Maginhawa that\'s not listed yet? Use the Add Place form to submit it. Fill in the details you know — name, address, cuisine, hours — and upload a photo if you have one.',
    link: '/add-place',
    linkLabel: 'Add a Place',
  },
  {
    number: '02',
    icon: Clock,
    title: 'Wait for review',
    description:
      'Every submission goes through a quick review by our team to check accuracy and prevent duplicates. Most submissions are reviewed within 24-48 hours.',
    link: null,
    linkLabel: null,
  },
  {
    number: '03',
    icon: Eye,
    title: 'It goes live',
    description:
      'Once approved, the place appears in the directory and becomes searchable. You\'ll be credited as a contributor on the place\'s page.',
    link: null,
    linkLabel: null,
  },
];

const ways = [
  {
    icon: Plus,
    title: 'Add a new place',
    description:
      'Submit a restaurant, cafe, or food spot that isn\'t in our directory yet. You\'ll need at least the name, address, a short description, and one cuisine type.',
    href: '/add-place',
    cta: 'Add a Place',
  },
  {
    icon: MessageSquarePlus,
    title: 'Suggest an edit',
    description:
      'See outdated hours, a wrong address, or missing details? Visit any place\'s page and use the "Suggest Edit" button to propose corrections.',
    href: '/places',
    cta: 'Browse Places',
  },
  {
    icon: ShieldCheck,
    title: 'Claim your business',
    description:
      'If you own or manage a place listed here, you can claim it to manage your own listing — update details, upload photos, and respond to the community.',
    href: '/places',
    cta: 'Find Your Place',
  },
  {
    icon: Search,
    title: 'Report issues',
    description:
      'Found a place that\'s permanently closed, has incorrect information, or shouldn\'t be listed? Use the report option on any place page to let us know.',
    href: 'https://github.com/OSSPhilippines/whereinmaginhawa/issues',
    cta: 'Report on GitHub',
    external: true,
  },
];

const guidelines = [
  'Only submit places located on or near Maginhawa Street and Teacher\'s Village, Quezon City.',
  'Provide accurate, up-to-date information. Double-check addresses and operating hours.',
  'Write descriptions that are helpful and factual, not promotional or exaggerated.',
  'Upload clear, well-lit photos that represent the place honestly.',
  'One submission per place. Check the directory first to avoid duplicates.',
  'Be respectful. This is a community resource — keep it useful for everyone.',
];

export default function ContributingPage() {
  return (
    <main className="min-h-screen pt-20 pb-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
            Contributing Guide
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-5 leading-tight tracking-tight">
            Help build the best food
            <br />
            guide on Maginhawa
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Where In Maginhawa is community-driven. Anyone can add places, suggest
            corrections, and help keep our directory accurate. No GitHub account
            or technical skills needed.
          </p>
        </div>

        {/* How it works */}
        <section className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative p-6 rounded-2xl border border-border/50 bg-card/50"
                >
                  <span className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                    Step {step.number}
                  </span>
                  <div className="mt-3 mb-3 w-10 h-10 rounded-xl bg-primary/[0.07] flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  {step.link && (
                    <Link
                      href={step.link}
                      className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary hover:underline"
                    >
                      {step.linkLabel}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Ways to contribute */}
        <section className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-3 text-center">
            Ways to contribute
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-lg mx-auto">
            There are several ways you can help improve the directory.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ways.map((way) => {
              const Icon = way.icon;
              const isExternal = 'external' in way && way.external;
              return (
                <div
                  key={way.title}
                  className="group p-6 rounded-2xl border border-border/50 bg-card/50 hover:border-border hover:bg-card/80 transition-colors duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/[0.07] flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-200">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {way.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {way.description}
                  </p>
                  {isExternal ? (
                    <a
                      href={way.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      {way.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <Link
                      href={way.href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      {way.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Guidelines */}
        <section className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground mb-3 text-center">
            Contribution guidelines
          </h2>
          <p className="text-muted-foreground text-center mb-8 max-w-lg mx-auto">
            A few simple rules to keep the directory high quality.
          </p>
          <div className="space-y-3">
            {guidelines.map((guideline, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card/30"
              >
                <CheckCircle2 className="w-5 h-5 text-[#006c4b] mt-0.5 shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">
                  {guideline}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* For developers */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="p-8 rounded-2xl border border-border/50 bg-card/50 text-center">
            <h2 className="text-xl font-bold text-foreground mb-3">
              For developers
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto mb-5">
              Where In Maginhawa is open source. If you want to contribute to the
              codebase itself — fix bugs, add features, or improve the platform —
              check out the repository on GitHub.
            </p>
            <a
              href="https://github.com/OSSPhilippines/whereinmaginhawa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors duration-200"
            >
              View on GitHub
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Ready to contribute?
          </h2>
          <p className="text-muted-foreground mb-6">
            The easiest way to get started is to add a place you know and love.
          </p>
          <Link
            href="/add-place"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            Add a Place
          </Link>
        </section>
      </div>
    </main>
  );
}
