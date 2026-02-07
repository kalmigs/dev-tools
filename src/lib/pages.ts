import {
  Braces,
  Clock,
  FileJson,
  Fingerprint,
  GitCompare,
  Home,
  ImageIcon,
  Keyboard,
  QrCodeIcon,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export interface PageInfo {
  route: string;
  title: string;
  description: string;
  keywords: string[];
  tags: string[];
  category: string;
  icon: LucideIcon;
  color?: string;
}

// Home page
export const homePage: PageInfo = {
  route: '/',
  title: 'Home',
  description: 'Your developer toolbox',
  keywords: ['dashboard', 'main', 'start', 'index'],
  tags: ['navigation'],
  category: 'Navigation',
  icon: Home,
};

// Generate pages
export const generatePages: PageInfo[] = [
  {
    route: '/generate/faker',
    title: 'Faker',
    description: 'Generate fake data for testing and prototyping',
    keywords: [
      'mock',
      'dummy',
      'test data',
      'random',
      'name',
      'email',
      'address',
      'phone',
      'company',
      'lorem ipsum',
    ],
    tags: ['generator', 'testing', 'mock', 'data'],
    category: 'Generate',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-600',
  },
  {
    route: '/generate/ids',
    title: 'IDs',
    description: 'UUIDs, CUIDs, NanoIDs and more',
    keywords: ['uuid', 'cuid', 'nanoid', 'guid', 'unique', 'identifier', 'random id', 'ulid'],
    tags: ['generator', 'identifiers', 'unique'],
    category: 'Generate',
    icon: Fingerprint,
    color: 'from-lime-500 to-green-600',
  },
  {
    route: '/generate/image',
    title: 'Image',
    description: 'Placeholders, colors, gradients, and patterns',
    keywords: [
      'placeholder',
      'color',
      'gradient',
      'pattern',
      'avatar',
      'thumbnail',
      'background',
      'svg',
    ],
    tags: ['generator', 'visual', 'design'],
    category: 'Generate',
    icon: ImageIcon,
    color: 'from-violet-500 to-purple-600',
  },
  {
    route: '/generate/json',
    title: 'JSON',
    description: 'Random JSON structures and schemas',
    keywords: ['json', 'object', 'array', 'schema', 'sample', 'structure', 'api', 'mock response'],
    tags: ['generator', 'data', 'json'],
    category: 'Generate',
    icon: Braces,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    route: '/generate/qr-code',
    title: 'QR Code',
    description: 'Generate QR codes with optional embedded logo',
    keywords: [
      'qr',
      'qr code',
      'quick response',
      'barcode',
      'logo',
      'customize',
      'download',
      'png',
    ],
    tags: ['generator', 'visual', 'qr'],
    category: 'Generate',
    icon: QrCodeIcon,
    color: 'from-blue-500 to-cyan-600',
  },
];

// String pages
export const stringPages: PageInfo[] = [
  {
    route: '/strings/compare',
    title: 'Compare',
    description: 'Compare and diff text side by side',
    keywords: [
      'diff',
      'difference',
      'compare',
      'merge',
      'text',
      'changes',
      'git diff',
      'side by side',
    ],
    tags: ['text', 'diff', 'comparison'],
    category: 'Strings',
    icon: GitCompare,
    color: 'from-sky-500 to-blue-600',
  },
  {
    route: '/strings/json-format',
    title: 'JSON Format',
    description: 'Format, prettify and validate JSON',
    keywords: ['json', 'format', 'prettify', 'beautify', 'minify', 'validate', 'parse', 'indent'],
    tags: ['text', 'json', 'formatter'],
    category: 'Strings',
    icon: FileJson,
    color: 'from-pink-500 to-rose-600',
  },
];

// Validate pages
export const validatePages: PageInfo[] = [
  {
    route: '/validate/ids',
    title: 'Validate IDs',
    description: 'Validate UUID, CUID, and other ID formats',
    keywords: ['validate', 'check', 'verify', 'uuid', 'cuid', 'nanoid', 'format', 'valid'],
    tags: ['validator', 'identifiers'],
    category: 'Validate',
    icon: ShieldCheck,
    color: 'from-yellow-400 to-orange-500',
  },
];

// Inspect pages
export const inspectPages: PageInfo[] = [
  {
    route: '/inspect/keyboard',
    title: 'Keyboard',
    description: 'View key codes, events, and modifiers in real-time',
    keywords: [
      'keyboard',
      'key',
      'keycode',
      'event',
      'modifier',
      'ctrl',
      'alt',
      'shift',
      'meta',
      'keydown',
      'keyup',
    ],
    tags: ['inspector', 'keyboard', 'events'],
    category: 'Inspect',
    icon: Keyboard,
    color: 'from-cyan-500 to-teal-600',
  },
];

// Convert pages
export const convertPages: PageInfo[] = [
  {
    route: '/convert/timestamp',
    title: 'Timestamp',
    description: 'Convert Unix timestamps to dates with timezone support',
    keywords: [
      'timestamp',
      'unix',
      'epoch',
      'date',
      'time',
      'timezone',
      'utc',
      'convert',
      'relative',
    ],
    tags: ['converter', 'time', 'date'],
    category: 'Convert',
    icon: Clock,
    color: 'from-indigo-500 to-violet-600',
  },
];

// All pages combined for search
export const allPages: PageInfo[] = [
  homePage,
  ...generatePages,
  ...stringPages,
  ...validatePages,
  ...inspectPages,
  ...convertPages,
];

// Get pages by category
export function getPagesByCategory(category: string): PageInfo[] {
  return allPages.filter(page => page.category === category);
}

// Get all unique tags
export function getAllTags(): string[] {
  const tags = new Set<string>();
  allPages.forEach(page => page.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}
