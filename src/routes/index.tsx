import { Link } from '@tanstack/react-router';
import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowRight,
  Braces,
  FileJson,
  Fingerprint,
  GitCompare,
  ImageIcon,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: HomePage,
});

// Tool data
const generateTools = [
  {
    title: 'Faker',
    description: 'Generate fake data for testing and prototyping',
    icon: Sparkles,
    url: '/generate/faker',
    color: 'from-amber-500 to-orange-600',
  },
  {
    title: 'IDs',
    description: 'UUIDs, CUIDs, NanoIDs and more',
    icon: Fingerprint,
    url: '/generate/ids',
    color: 'from-lime-500 to-green-600',
  },
  {
    title: 'Image',
    description: 'Colors, gradients, and patterns',
    icon: ImageIcon,
    url: '/generate/image',
    color: 'from-violet-500 to-purple-600',
  },
  {
    title: 'JSON',
    description: 'Random JSON structures and schemas',
    icon: Braces,
    url: '/generate/json',
    color: 'from-emerald-500 to-teal-600',
  },
];

const stringTools = [
  {
    title: 'Compare',
    description: 'Compare and diff text side by side',
    icon: GitCompare,
    url: '/strings/compare',
    color: 'from-sky-500 to-blue-600',
  },
  {
    title: 'JSON Format',
    description: 'Format, prettify and validate JSON',
    icon: FileJson,
    url: '/strings/json-format',
    color: 'from-pink-500 to-rose-600',
  },
];

const validateTools = [
  {
    title: 'IDs',
    description: 'Validate UUID, CUID, and other ID formats',
    icon: ShieldCheck,
    url: '/validate/ids',
    color: 'from-yellow-400 to-orange-500',
  },
];

// Components
function ToolCard({
  title,
  description,
  icon: Icon,
  url,
  color,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  color: string;
}) {
  return (
    <Link
      to={url}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.03]`}
      />
      <div className="relative">
        <div
          className={`mb-3 inline-flex rounded-lg bg-gradient-to-br ${color} p-2.5 text-white shadow-sm`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mb-1.5 font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Open tool
          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function HomePage() {
  return (
    <div className="mx-auto max-w-5xl">
      {/* Hero */}
      <header className="mb-12 text-center">
        <h1 className="mb-3 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
          Your Developer Toolbox
        </h1>
        <p className="text-lg text-muted-foreground">
          Essential utilities for everyday development tasks
        </p>
      </header>

      {/* Generate Section */}
      <Section title="Generate" icon={Sparkles}>
        {generateTools.map(tool => (
          <ToolCard key={tool.url} {...tool} />
        ))}
      </Section>

      {/* Strings Section */}
      <Section title="Strings" icon={FileJson}>
        {stringTools.map(tool => (
          <ToolCard key={tool.url} {...tool} />
        ))}
      </Section>

      {/* Validate Section */}
      <Section title="Validate" icon={ShieldCheck}>
        {validateTools.map(tool => (
          <ToolCard key={tool.url} {...tool} />
        ))}
      </Section>
    </div>
  );
}
