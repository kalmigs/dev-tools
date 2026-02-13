import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import JSZip from 'jszip';
import {
  Aperture,
  AudioLines,
  BadgeAlert,
  BatteryCharging,
  Bell,
  Bird,
  BookOpen,
  Box,
  Brain,
  Briefcase,
  Brush,
  Bug,
  Calendar,
  Camera,
  Car,
  ChevronDown,
  Chrome,
  Cloud,
  Code,
  Compass,
  Cpu,
  Crown,
  Database,
  Diamond,
  DownloadIcon,
  Droplet,
  Eye,
  Feather,
  Film,
  Fish,
  Flag,
  Flame,
  FlaskConical,
  Flower2,
  Folder,
  Gamepad2,
  Gauge,
  Gem,
  Ghost,
  Gift,
  Globe,
  Globe2,
  Grape,
  GraduationCap,
  Grid3X3,
  Guitar,
  Hammer,
  HandHeart,
  Heart,
  Hexagon,
  ImageIcon,
  Laptop,
  Leaf,
  Lightbulb,
  Lock,
  Magnet,
  Mail,
  Map,
  MapPin,
  Medal,
  Moon,
  Mountain,
  Music,
  Newspaper,
  Package,
  Palette,
  PartyPopper,
  PawPrint,
  PenLine,
  Phone,
  PieChart,
  Pin,
  PlusIcon,
  Puzzle,
  Rabbit,
  Radio,
  Rocket,
  Router,
  Rss,
  SearchIcon,
  Shield,
  Ship,
  Sparkles,
  Star,
  Store,
  Sun,
  Sword,
  Target,
  Ticket,
  Train,
  Trees,
  Trophy,
  Umbrella,
  UploadCloudIcon,
  User,
  WandSparkles,
  Wallet,
  Watch,
  Wind,
  Wrench,
  XIcon,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';

// Types
type SourceType = 'lucide' | 'text' | 'upload';

interface IconOption {
  Icon: LucideIcon;
  name: string;
}

interface SearchParams {
  bg?: string;
  bgEnabled?: boolean;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
  icon?: string;
  includeIco?: boolean;
  includeSvg?: boolean;
  letterSpacing?: number;
  padding?: number;
  radius?: number;
  sizes?: string;
  source?: SourceType;
  text?: string;
}

// Constants
const DEFAULT_ICON = 'Sparkles';
const DEFAULT_ICON_COLOR = '#0f172a';
const DEFAULT_PADDING = 12;
const DEFAULT_RADIUS = 0;
const DEFAULT_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512];
const DEFAULT_TEXT = 'AB';
const DEFAULT_TEXT_FAMILY = 'ui-sans-serif, system-ui, sans-serif';
const DEFAULT_TEXT_WEIGHT = '700';
const DEFAULT_TEXT_SPACING = -4;
const MAX_SIZE = 1024;
const PREVIEW_SIZES = [32, 64, 180, 512];
const STANDARD_SIZES = [16, 32, 48, 64, 96, 128, 180, 192, 256, 512];

const ICO_SIZES = [16, 32, 48, 64, 128, 256];

const LUCIDE_ICON_OPTIONS: IconOption[] = [
  { Icon: Aperture, name: 'Aperture' },
  { Icon: AudioLines, name: 'AudioLines' },
  { Icon: BadgeAlert, name: 'BadgeAlert' },
  { Icon: BatteryCharging, name: 'BatteryCharging' },
  { Icon: Bell, name: 'Bell' },
  { Icon: Bird, name: 'Bird' },
  { Icon: BookOpen, name: 'BookOpen' },
  { Icon: Box, name: 'Box' },
  { Icon: Brain, name: 'Brain' },
  { Icon: Briefcase, name: 'Briefcase' },
  { Icon: Brush, name: 'Brush' },
  { Icon: Bug, name: 'Bug' },
  { Icon: Calendar, name: 'Calendar' },
  { Icon: Camera, name: 'Camera' },
  { Icon: Car, name: 'Car' },
  { Icon: Chrome, name: 'Chrome' },
  { Icon: Cloud, name: 'Cloud' },
  { Icon: Code, name: 'Code' },
  { Icon: Compass, name: 'Compass' },
  { Icon: Cpu, name: 'Cpu' },
  { Icon: Crown, name: 'Crown' },
  { Icon: Database, name: 'Database' },
  { Icon: Diamond, name: 'Diamond' },
  { Icon: Droplet, name: 'Droplet' },
  { Icon: Eye, name: 'Eye' },
  { Icon: Feather, name: 'Feather' },
  { Icon: Film, name: 'Film' },
  { Icon: Fish, name: 'Fish' },
  { Icon: Flag, name: 'Flag' },
  { Icon: Flame, name: 'Flame' },
  { Icon: FlaskConical, name: 'FlaskConical' },
  { Icon: Flower2, name: 'Flower2' },
  { Icon: Folder, name: 'Folder' },
  { Icon: Gamepad2, name: 'Gamepad2' },
  { Icon: Gauge, name: 'Gauge' },
  { Icon: Gem, name: 'Gem' },
  { Icon: Ghost, name: 'Ghost' },
  { Icon: Gift, name: 'Gift' },
  { Icon: Globe, name: 'Globe' },
  { Icon: Globe2, name: 'Globe2' },
  { Icon: Grape, name: 'Grape' },
  { Icon: GraduationCap, name: 'GraduationCap' },
  { Icon: Grid3X3, name: 'Grid3X3' },
  { Icon: Guitar, name: 'Guitar' },
  { Icon: Hammer, name: 'Hammer' },
  { Icon: HandHeart, name: 'HandHeart' },
  { Icon: Heart, name: 'Heart' },
  { Icon: Hexagon, name: 'Hexagon' },
  { Icon: ImageIcon, name: 'Image' },
  { Icon: Laptop, name: 'Laptop' },
  { Icon: Leaf, name: 'Leaf' },
  { Icon: Lightbulb, name: 'Lightbulb' },
  { Icon: Lock, name: 'Lock' },
  { Icon: Magnet, name: 'Magnet' },
  { Icon: Mail, name: 'Mail' },
  { Icon: Map, name: 'Map' },
  { Icon: MapPin, name: 'MapPin' },
  { Icon: Medal, name: 'Medal' },
  { Icon: Moon, name: 'Moon' },
  { Icon: Mountain, name: 'Mountain' },
  { Icon: Music, name: 'Music' },
  { Icon: Newspaper, name: 'Newspaper' },
  { Icon: Package, name: 'Package' },
  { Icon: PartyPopper, name: 'PartyPopper' },
  { Icon: PawPrint, name: 'PawPrint' },
  { Icon: PenLine, name: 'PenLine' },
  { Icon: Phone, name: 'Phone' },
  { Icon: PieChart, name: 'PieChart' },
  { Icon: Pin, name: 'Pin' },
  { Icon: Puzzle, name: 'Puzzle' },
  { Icon: Rabbit, name: 'Rabbit' },
  { Icon: Radio, name: 'Radio' },
  { Icon: Rocket, name: 'Rocket' },
  { Icon: Router, name: 'Router' },
  { Icon: Rss, name: 'Rss' },
  { Icon: Shield, name: 'Shield' },
  { Icon: Ship, name: 'Ship' },
  { Icon: Sparkles, name: 'Sparkles' },
  { Icon: Star, name: 'Star' },
  { Icon: Store, name: 'Store' },
  { Icon: Sun, name: 'Sun' },
  { Icon: Sword, name: 'Sword' },
  { Icon: Target, name: 'Target' },
  { Icon: Ticket, name: 'Ticket' },
  { Icon: Train, name: 'Train' },
  { Icon: Trees, name: 'Trees' },
  { Icon: Trophy, name: 'Trophy' },
  { Icon: Umbrella, name: 'Umbrella' },
  { Icon: User, name: 'User' },
  { Icon: WandSparkles, name: 'WandSparkles' },
  { Icon: Wallet, name: 'Wallet' },
  { Icon: Watch, name: 'Watch' },
  { Icon: Wind, name: 'Wind' },
  { Icon: Wrench, name: 'Wrench' },
  { Icon: Zap, name: 'Zap' },
];

const TEXT_FAMILY_OPTIONS = [
  { label: 'Sans', value: 'ui-sans-serif, system-ui, sans-serif' },
  { label: 'System', value: 'system-ui, -apple-system, Segoe UI, sans-serif' },
  { label: 'Serif', value: 'ui-serif, Georgia, serif' },
  { label: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  { label: 'Rounded', value: '"SF Pro Rounded", "Avenir Next Rounded", ui-sans-serif' },
  { label: 'Display', value: '"Bebas Neue", "Oswald", ui-sans-serif' },
  { label: 'Condensed', value: '"Arial Narrow", "Roboto Condensed", sans-serif' },
  { label: 'Geometric', value: '"Futura", "Century Gothic", ui-sans-serif' },
  { label: 'Grotesk', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Humanist', value: '"Gill Sans", "Trebuchet MS", ui-sans-serif' },
  { label: 'Slab', value: '"Rockwell", "Roboto Slab", ui-serif' },
  { label: 'Tech', value: '"SF Pro Display", "Segoe UI", ui-sans-serif' },
  { label: 'Classic', value: '"Times New Roman", Times, serif' },
];

const TEXT_WEIGHT_OPTIONS = [
  { label: '400', value: '400' },
  { label: '500', value: '500' },
  { label: '600', value: '600' },
  { label: '700', value: '700' },
  { label: '800', value: '800' },
];

// Helper functions
function clampSize(value: number) {
  return Math.max(8, Math.min(MAX_SIZE, value));
}

function randomHexColor() {
  const value = Math.floor(Math.random() * 0xffffff);
  return `#${value.toString(16).padStart(6, '0')}`;
}

function pickRandomIconName() {
  const index = Math.floor(Math.random() * LUCIDE_ICON_OPTIONS.length);
  return LUCIDE_ICON_OPTIONS[index]?.name ?? DEFAULT_ICON;
}

function formatSize(size: number) {
  return `${size}x${size}`;
}

function normalizeSizes(sizes: number[]) {
  const normalized = sizes
    .map(size => clampSize(Math.round(size)))
    .filter(size => Number.isFinite(size) && size > 0);
  return Array.from(new Set(normalized)).sort((a, b) => a - b);
}

function parseSizes(value?: string) {
  if (!value) return undefined;
  const parsed = value
    .split(',')
    .map(size => Number(size))
    .filter(size => Number.isFinite(size));
  return normalizeSizes(parsed);
}

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function createTextSvg({
  color,
  family,
  spacing,
  text,
  weight,
}: {
  color: string;
  family: string;
  spacing: number;
  text: string;
  weight: string;
}) {
  const safeText = escapeXml(text.slice(0, 2));
  const safeFamily = escapeXml(family);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="none" />
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" fill="${color}" font-family='${safeFamily}' font-size="220" font-weight="${weight}" letter-spacing="${spacing}">
    ${safeText}
  </text>
</svg>`;
}

async function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = source;
  });
}

function drawImageToCanvas({
  bgColor,
  bgEnabled,
  image,
  padding,
  radius,
  size,
}: {
  bgColor: string;
  bgEnabled: boolean;
  image: HTMLImageElement;
  padding: number;
  radius: number;
  size: number;
}) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const radiusPx = Math.max(0, Math.min(size / 2, (radius / 100) * size));
  if (radiusPx > 0) {
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(0, 0, size, size, radiusPx);
      ctx.clip();
    } else {
      const r = radiusPx;
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(size - r, 0);
      ctx.quadraticCurveTo(size, 0, size, r);
      ctx.lineTo(size, size - r);
      ctx.quadraticCurveTo(size, size, size - r, size);
      ctx.lineTo(r, size);
      ctx.quadraticCurveTo(0, size, 0, size - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.clip();
    }
  }

  if (bgEnabled) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.clearRect(0, 0, size, size);
  }

  const available = size - padding * 2;
  const scale = Math.min(available / image.width, available / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const dx = (size - drawWidth) / 2;
  const dy = (size - drawHeight) / 2;
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  return canvas;
}

async function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png') {
  return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type));
}

async function createPngBlob({
  bgColor,
  bgEnabled,
  padding,
  radius,
  size,
  source,
}: {
  bgColor: string;
  bgEnabled: boolean;
  padding: number;
  radius: number;
  size: number;
  source: string;
}) {
  const image = await loadImage(source);
  const canvas = drawImageToCanvas({
    bgColor,
    bgEnabled,
    image,
    padding,
    radius,
    size,
  });
  if (!canvas) return null;
  return canvasToBlob(canvas);
}

async function createPngDataUrl({
  bgColor,
  bgEnabled,
  padding,
  radius,
  size,
  source,
}: {
  bgColor: string;
  bgEnabled: boolean;
  padding: number;
  radius: number;
  size: number;
  source: string;
}) {
  const image = await loadImage(source);
  const canvas = drawImageToCanvas({
    bgColor,
    bgEnabled,
    image,
    padding,
    radius,
    size,
  });
  if (!canvas) return null;
  return canvas.toDataURL('image/png');
}

// ICO builder adapted from https://github.com/steambap/png-to-ico (thanks!)
async function createIcoBlob({
  bgColor,
  bgEnabled,
  padding,
  radius,
  source,
}: {
  bgColor: string;
  bgEnabled: boolean;
  padding: number;
  radius: number;
  source: string;
}) {
  const icoSizes = ICO_SIZES;
  if (!icoSizes.length) return null;

  const pngBuffers = await Promise.all(
    icoSizes.map(async size => {
      const blob = await createPngBlob({
        bgColor,
        bgEnabled,
        padding: Math.round((padding / 100) * size),
        radius,
        size,
        source,
      });
      if (!blob) return null;
      return { buffer: await blob.arrayBuffer(), size };
    }),
  );

  const filteredBuffers = pngBuffers.filter(Boolean) as Array<{
    buffer: ArrayBuffer;
    size: number;
  }>;
  if (!filteredBuffers.length) return null;

  const headerSize = 6 + filteredBuffers.length * 16;
  const header = new ArrayBuffer(headerSize);
  const view = new DataView(header);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, filteredBuffers.length, true);

  let offset = headerSize;
  filteredBuffers.forEach(({ buffer, size }, index) => {
    const entryOffset = 6 + index * 16;
    view.setUint8(entryOffset, size === 256 ? 0 : size);
    view.setUint8(entryOffset + 1, size === 256 ? 0 : size);
    view.setUint8(entryOffset + 2, 0);
    view.setUint8(entryOffset + 3, 0);
    view.setUint16(entryOffset + 4, 1, true);
    view.setUint16(entryOffset + 6, 32, true);
    view.setUint32(entryOffset + 8, buffer.byteLength, true);
    view.setUint32(entryOffset + 12, offset, true);
    offset += buffer.byteLength;
  });

  return new Blob([header, ...filteredBuffers.map(entry => entry.buffer)], {
    type: 'image/x-icon',
  });
}

// Subcomponents
function ColorPicker({
  color,
  label,
  onChange,
}: {
  color: string;
  label?: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <label
        className="size-10 overflow-hidden rounded-md border border-input shadow-sm cursor-pointer"
        style={{ backgroundColor: color }}
      >
        <input
          type="color"
          value={color}
          onChange={event => onChange(event.target.value)}
          className="size-0 opacity-0"
        />
      </label>
      <Input
        value={color.toUpperCase()}
        onChange={event => onChange(event.target.value)}
        className="w-28 font-mono text-sm"
      />
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
    </div>
  );
}

// Main component
function FaviconPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate({ from: '/generate/favicon' });
  const search = Route.useSearch();

  const [bgColor, setBgColor] = useState(() => search.bg ?? randomHexColor());
  const [bgEnabled, setBgEnabled] = useState(search.bgEnabled ?? true);
  const [includeIco, setIncludeIco] = useState(search.includeIco ?? true);
  const [includeSvg, setIncludeSvg] = useState(search.includeSvg ?? true);
  const [iconColor, setIconColor] = useState(search.color ?? DEFAULT_ICON_COLOR);
  const [padding, setPadding] = useState(search.padding ?? DEFAULT_PADDING);
  const [radius, setRadius] = useState(search.radius ?? DEFAULT_RADIUS);
  const [sizes, setSizes] = useState(() => parseSizes(search.sizes) ?? DEFAULT_SIZES);
  const [sourceType, setSourceType] = useState<SourceType>(search.source ?? 'lucide');
  const [textValue, setTextValue] = useState(search.text ?? DEFAULT_TEXT);
  const [textFamily, setTextFamily] = useState(search.fontFamily ?? DEFAULT_TEXT_FAMILY);
  const [textSpacing, setTextSpacing] = useState(search.letterSpacing ?? DEFAULT_TEXT_SPACING);
  const [textWeight, setTextWeight] = useState(search.fontWeight ?? DEFAULT_TEXT_WEIGHT);

  const [customSize, setCustomSize] = useState<number | null>(null);
  const [iconSearch, setIconSearch] = useState('');
  const [lucideIcon, setLucideIcon] = useState(() => search.icon ?? pickRandomIconName());
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({});
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [sourceDataUrl, setSourceDataUrl] = useState<string | null>(null);
  const [sourceIsSvg, setSourceIsSvg] = useState(false);
  const [sourceSvgText, setSourceSvgText] = useState<string | null>(null);

  const lucideSvgRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const selectedSizes = useMemo(() => {
    const normalized = normalizeSizes(sizes);
    return normalized.length ? normalized : DEFAULT_SIZES;
  }, [sizes]);

  const customSizes = useMemo(() => {
    return selectedSizes.filter(size => !STANDARD_SIZES.includes(size));
  }, [selectedSizes]);

  const filteredIcons = useMemo(() => {
    const query = iconSearch.trim().toLowerCase();
    if (!query) return LUCIDE_ICON_OPTIONS;
    return LUCIDE_ICON_OPTIONS.filter(option => option.name.toLowerCase().includes(query));
  }, [iconSearch]);

  const selectedIconOption = useMemo(() => {
    return LUCIDE_ICON_OPTIONS.find(option => option.name === lucideIcon) ?? LUCIDE_ICON_OPTIONS[0];
  }, [lucideIcon]);

  const svgAvailable = sourceType === 'lucide' || sourceIsSvg;

  const updateSearchParams = useCallback(
    (updates: Partial<SearchParams>) => {
      navigate({
        replace: true,
        search: prev => ({ ...prev, ...updates }),
      });
    },
    [navigate],
  );

  useEffect(() => {
    updateSearchParams({
      bg: bgColor,
      bgEnabled,
      color: iconColor,
      fontFamily: textFamily,
      fontWeight: textWeight,
      icon: lucideIcon,
      includeIco,
      includeSvg,
      letterSpacing: textSpacing,
      padding,
      radius,
      sizes: selectedSizes.join(','),
      source: sourceType,
      text: textValue,
    });
  }, [
    bgColor,
    bgEnabled,
    iconColor,
    includeIco,
    includeSvg,
    lucideIcon,
    padding,
    radius,
    selectedSizes,
    sourceType,
    textFamily,
    textSpacing,
    textWeight,
    textValue,
    updateSearchParams,
  ]);

  useEffect(() => {
    if (sourceType !== 'lucide') return;
    const svgElement = lucideSvgRef.current?.querySelector('svg');
    if (!svgElement) return;
    const cloned = svgElement.cloneNode(true) as SVGSVGElement;
    cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    cloned.setAttribute('width', '512');
    cloned.setAttribute('height', '512');
    const serializer = new XMLSerializer();
    const svgText = serializer.serializeToString(cloned);
    setSourceDataUrl(svgToDataUrl(svgText));
    setSourceIsSvg(true);
    setSourceSvgText(svgText);
  }, [iconColor, lucideIcon, sourceType]);

  useEffect(() => {
    if (sourceType !== 'text') return;
    const svgText = createTextSvg({
      color: iconColor,
      family: textFamily,
      spacing: textSpacing,
      text: textValue,
      weight: textWeight,
    });
    setSourceDataUrl(svgToDataUrl(svgText));
    setSourceIsSvg(true);
    setSourceSvgText(svgText);
  }, [iconColor, sourceType, textFamily, textSpacing, textValue, textWeight]);

  useEffect(() => {
    if (sourceType !== 'upload') return;
    if (!sourceDataUrl) return;
    setSourceIsSvg(Boolean(sourceSvgText));
  }, [sourceDataUrl, sourceSvgText, sourceType]);

  useEffect(() => {
    const source = sourceDataUrl;
    if (!source) {
      setPreviewUrls({});
      return;
    }

    let active = true;
    Promise.all(
      PREVIEW_SIZES.map(async size => {
        const dataUrl = await createPngDataUrl({
          bgColor,
          bgEnabled,
          padding: Math.round((padding / 100) * size),
          radius,
          size,
          source,
        });
        return { dataUrl, size };
      }),
    )
      .then(results => {
        if (!active) return;
        const next: Record<number, string> = {};
        results.forEach(result => {
          if (result.dataUrl) {
            next[result.size] = result.dataUrl;
          }
        });
        setPreviewUrls(next);
      })
      .catch(() => {
        if (!active) return;
        setPreviewUrls({});
      });

    return () => {
      active = false;
    };
  }, [bgColor, bgEnabled, padding, radius, sourceDataUrl]);

  const handleToggleSize = (size: number) => {
    const normalized = normalizeSizes(sizes);
    const next = normalized.includes(size)
      ? normalized.filter(value => value !== size)
      : [...normalized, size];
    setSizes(next.length ? next : DEFAULT_SIZES);
  };

  const handleAddCustomSize = () => {
    if (!customSize || customSize <= 0) return;
    const next = normalizeSizes([...selectedSizes, customSize]);
    setSizes(next);
    setCustomSize(null);
  };

  const handleRemoveCustomSize = (size: number) => {
    const next = selectedSizes.filter(value => value !== size);
    setSizes(next.length ? next : DEFAULT_SIZES);
  };

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Unsupported file type', {
        description: 'Please upload a PNG or SVG file.',
      });
      return;
    }

    setSelectedFileName(file.name);
    setSourceType('upload');

    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = e => {
        const svgText = String(e.target?.result ?? '');
        if (/<script[\s>]|<\s*foreignObject[\s>]/i.test(svgText)) {
          toast.error('SVG contains disallowed tags', {
            description: 'Please remove <script> or <foreignObject> from the SVG.',
          });
          return;
        }
        const svgUrl = svgToDataUrl(svgText);
        setSourceDataUrl(svgUrl);
        setSourceSvgText(svgText);
        setSourceIsSvg(true);
      };
      reader.readAsText(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = String(e.target?.result ?? '');
      setSourceDataUrl(dataUrl);
      setSourceSvgText(null);
      setSourceIsSvg(false);
    };
    reader.readAsDataURL(file);
  };

  const handleClearUpload = () => {
    setSelectedFileName(null);
    setSourceDataUrl(null);
    setSourceIsSvg(false);
    setSourceSvgText(null);
    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
    }
  };

  const handleDownload = async () => {
    if (!sourceDataUrl) {
      toast.error('Select an image source', {
        description: 'Upload a PNG/SVG or choose a Lucide icon first.',
      });
      return;
    }

    const zip = new JSZip();
    const sortedSizes = selectedSizes;

    const pngBlobs = await Promise.all(
      sortedSizes.map(async size => {
        const blob = await createPngBlob({
          bgColor,
          bgEnabled,
          padding: Math.round((padding / 100) * size),
          radius,
          size,
          source: sourceDataUrl,
        });
        return { blob, size };
      }),
    );

    pngBlobs.forEach(({ blob, size }) => {
      if (!blob) return;
      zip.file(`favicon-${formatSize(size)}.png`, blob);
    });

    if (includeSvg && svgAvailable && sourceSvgText) {
      zip.file('favicon.svg', sourceSvgText);
    }

    if (includeIco) {
      const icoBlob = await createIcoBlob({
        bgColor,
        bgEnabled,
        padding,
        radius,
        source: sourceDataUrl,
      });
      if (icoBlob) {
        zip.file('favicon.ico', icoBlob);
      }
    }

    const output = await zip.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const url = URL.createObjectURL(output);
    const link = document.createElement('a');
    link.href = url;
    link.download = `favicons-${timestamp}.zip`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Favicon bundle generated');
  };

  const renderInputPanel = (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Source</div>
            <div className="text-xs text-muted-foreground">Upload or pick an icon</div>
          </div>
          <div className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
            {sourceType === 'upload' ? 'Upload' : 'Lucide'}
          </div>
        </div>

        <Tabs
          value={sourceType}
          onValueChange={value => {
            const next = value as SourceType;
            setSourceType(next);
            if (next === 'upload' && !selectedFileName) {
              setSourceDataUrl(null);
              setSourceIsSvg(false);
              setSourceSvgText(null);
            }
          }}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="lucide">Lucide</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4 space-y-4">
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/png,image/svg+xml"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-foreground">PNG or SVG</div>
                  <div className="text-xs text-muted-foreground">
                    Best results with square images
                  </div>
                </div>
                <Button variant="secondary" onClick={handleUploadClick}>
                  <UploadCloudIcon className="mr-2 size-4" />
                  Choose file
                </Button>
              </div>
              {selectedFileName ? (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-border/70 bg-background px-3 py-2 text-xs">
                  <span className="truncate">{selectedFileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleClearUpload}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </TabsContent>
          <TabsContent value="lucide" className="mt-4 space-y-4">
            <div>
              <Label>Icon</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="mt-2 w-full justify-between">
                    <span className="flex items-center gap-2 text-sm">
                      <selectedIconOption.Icon className="size-4" />
                      {selectedIconOption.name}
                    </span>
                    <ChevronDown className="size-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-3">
                  <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <SearchIcon className="size-3.5" />
                    <Input
                      value={iconSearch}
                      onChange={event => setIconSearch(event.target.value)}
                      placeholder="Search icons..."
                      className="h-7 border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
                    />
                  </div>
                  <div className="mt-3 max-h-64 overflow-auto">
                    <div className="grid grid-cols-4 gap-2">
                      {filteredIcons.map(option => (
                        <button
                          key={option.name}
                          type="button"
                          onClick={() => {
                            setLucideIcon(option.name);
                            setIconSearch('');
                          }}
                          className="group flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-background px-2 py-2 text-[10px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                        >
                          <option.Icon className="size-5 text-foreground/80 transition group-hover:text-foreground" />
                          <span className="truncate">{option.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Icon Color</Label>
              <div className="mt-2">
                <ColorPicker color={iconColor} onChange={setIconColor} />
              </div>
            </div>

            <div ref={lucideSvgRef} className="sr-only">
              <selectedIconOption.Icon color={iconColor} size={24} />
            </div>
          </TabsContent>
          <TabsContent value="text" className="mt-4 space-y-4">
            <div>
              <Label>Characters (2 max)</Label>
              <Input
                value={textValue}
                onChange={event => setTextValue(event.target.value.slice(0, 2))}
                placeholder="AB"
                className="mt-2 text-center text-lg font-semibold tracking-wide"
                maxLength={2}
              />
              <p className="mt-2 text-xs text-muted-foreground">Emoji and symbols are supported.</p>
            </div>
            <div>
              <Label>Font Family</Label>
              <Select value={textFamily} onValueChange={setTextFamily}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select family" />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_FAMILY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Font Weight</Label>
              <Select value={textWeight} onValueChange={setTextWeight}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_WEIGHT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Letter Spacing</Label>
              <div className="mt-3 flex items-center gap-3">
                <Slider
                  value={[textSpacing]}
                  onValueChange={value => setTextSpacing(value[0] ?? DEFAULT_TEXT_SPACING)}
                  min={-20}
                  max={20}
                  step={1}
                  className="flex-1"
                />
                <div className="w-10 text-right text-xs font-medium text-muted-foreground">
                  {textSpacing}
                </div>
              </div>
            </div>
            <div>
              <Label>Text Color</Label>
              <div className="mt-2">
                <ColorPicker color={iconColor} onChange={setIconColor} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-foreground">Output</div>
            <div className="text-xs text-muted-foreground">PNG set with optional SVG and ICO</div>
          </div>
          <Palette className="size-4 text-muted-foreground" />
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
            <div>
              <div className="text-sm font-medium text-foreground">Include SVG</div>
              <div className="text-xs text-muted-foreground">Only available when source is SVG</div>
            </div>
            <Switch checked={includeSvg} onCheckedChange={setIncludeSvg} disabled={!svgAvailable} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
            <div>
              <div className="text-sm font-medium text-foreground">Include ICO</div>
              <div className="text-xs text-muted-foreground">Generates standard ICO sizes</div>
            </div>
            <Switch checked={includeIco} onCheckedChange={setIncludeIco} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Canvas</div>
            <div className="text-xs text-muted-foreground">Background color and safe padding</div>
          </div>
          <ImageIcon className="size-4 text-muted-foreground" />
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
            <div>
              <div className="text-sm font-medium text-foreground">Background</div>
              <div className="text-xs text-muted-foreground">Fill transparent area</div>
            </div>
            <Switch checked={bgEnabled} onCheckedChange={setBgEnabled} />
          </div>

          {bgEnabled ? (
            <div>
              <Label>Background Color</Label>
              <div className="mt-2">
                <ColorPicker color={bgColor} onChange={setBgColor} />
              </div>
            </div>
          ) : null}

          <div>
            <Label>Corner Radius</Label>
            <div className="mt-3 flex items-center gap-3">
              <Slider
                value={[radius]}
                onValueChange={value => setRadius(value[0] ?? DEFAULT_RADIUS)}
                min={0}
                max={50}
                step={1}
                className="flex-1"
              />
              <div className="w-12 text-right text-xs font-medium text-muted-foreground">
                {radius}%
              </div>
            </div>
          </div>

          <div>
            <Label>Padding</Label>
            <div className="mt-3 flex items-center gap-3">
              <Slider
                value={[padding]}
                onValueChange={value => setPadding(value[0] ?? DEFAULT_PADDING)}
                min={0}
                max={30}
                step={1}
                className="flex-1"
              />
              <div className="w-12 text-right text-xs font-medium text-muted-foreground">
                {padding}%
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Adds safe-area space for maskable icons
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Sizes</div>
            <div className="text-xs text-muted-foreground">Select outputs to include</div>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {selectedSizes.length} selected
                <ChevronDown className="size-3.5 opacity-70" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="end">
              <Command>
                <CommandInput placeholder="Filter sizes..." />
                <CommandList>
                  <CommandEmpty>No sizes found.</CommandEmpty>
                  <CommandGroup heading="Standard">
                    {STANDARD_SIZES.map(size => (
                      <CommandItem
                        key={size}
                        value={String(size)}
                        onSelect={() => handleToggleSize(size)}
                      >
                        <Checkbox checked={selectedSizes.includes(size)} />
                        <span className="text-sm">{formatSize(size)}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  {customSizes.length ? (
                    <>
                      <CommandSeparator />
                      <CommandGroup heading="Custom">
                        {customSizes.map(size => (
                          <CommandItem
                            key={size}
                            value={String(size)}
                            onSelect={() => handleToggleSize(size)}
                          >
                            <Checkbox checked={selectedSizes.includes(size)} />
                            <span className="text-sm">{formatSize(size)}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="ml-auto h-6 w-6"
                              onClick={event => {
                                event.stopPropagation();
                                handleRemoveCustomSize(size);
                              }}
                            >
                              <XIcon className="size-3.5" />
                            </Button>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  ) : null}
                </CommandList>
                <div className="border-t border-border px-3 py-3">
                  <Label className="text-xs">Add custom size</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <NumberInput
                      value={customSize ?? undefined}
                      onValueChange={value => setCustomSize(value ?? null)}
                      min={8}
                      max={MAX_SIZE}
                      className="w-full"
                    />
                    <Button type="button" variant="secondary" onClick={handleAddCustomSize}>
                      <PlusIcon className="mr-2 size-3.5" />
                      Add
                    </Button>
                  </div>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {selectedSizes.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => handleToggleSize(size)}
              className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
            >
              {formatSize(size)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreviewPanel = (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Live Preview</div>
            <div className="text-xs text-muted-foreground">Updated with background and padding</div>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <DownloadIcon className="size-4" />
            Download ZIP
          </Button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-muted/60 via-background to-muted/30 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Primary
              </div>
              <div className="text-xs text-muted-foreground">{formatSize(512)}</div>
            </div>
            <div className="mt-4 flex items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/60 p-6">
              {previewUrls[512] ? (
                <img src={previewUrls[512]} alt="Large preview" className="h-48 w-48 rounded-2xl" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <UploadCloudIcon className="size-6" />
                  <span className="text-xs">Add a source to preview</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Maskable Preview
            </div>
            <div className="flex flex-1 items-center justify-center">
              {previewUrls[512] ? (
                <div className="relative size-44">
                  <div className="absolute inset-0 rounded-[28%] border border-dashed border-border/70" />
                  <div className="absolute inset-5 rounded-full border border-dashed border-border/70" />
                  <img
                    src={previewUrls[512]}
                    alt="Maskable preview"
                    className="absolute inset-0 rounded-[28%]"
                  />
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">Maskable preview</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Surface Preview
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/70 bg-background p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Light
              </div>
              <div className="mt-3 flex items-center justify-center">
                {previewUrls[180] ? (
                  <img src={previewUrls[180]} alt="Light surface preview" className="size-20" />
                ) : null}
              </div>
            </div>
            <div className="rounded-xl border border-border/70 bg-foreground/90 p-4">
              <div className="text-[10px] uppercase tracking-wider text-background/70">Dark</div>
              <div className="mt-3 flex items-center justify-center">
                {previewUrls[180] ? (
                  <img src={previewUrls[180]} alt="Dark surface preview" className="size-20" />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Size Grid
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PREVIEW_SIZES.map(size => (
              <div
                key={size}
                className="flex flex-col items-center gap-2 rounded-xl border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground"
              >
                <div className="size-16 rounded-lg border border-border/70 bg-muted/30 p-2">
                  {previewUrls[size] ? (
                    <img src={previewUrls[size]} alt={`${size} preview`} />
                  ) : null}
                </div>
                {formatSize(size)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Download Summary</div>
            <div className="text-xs text-muted-foreground">
              {selectedSizes.length} PNG sizes selected
            </div>
          </div>
          <div className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            {selectedSizes.length + (includeSvg && svgAvailable ? 1 : 0) + (includeIco ? 1 : 0)}{' '}
            files
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
            <span>PNG outputs</span>
            <span>{selectedSizes.length}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
            <span>SVG source</span>
            <span>{includeSvg && svgAvailable ? 'Included' : 'Skipped'}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
            <span>ICO output</span>
            <span>{includeIco ? 'Included' : 'Skipped'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Tabs defaultValue="input">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="input" className="mt-4">
            {renderInputPanel}
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            {renderPreviewPanel}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid min-h-[720px] gap-6 rounded-3xl border border-border/70 bg-gradient-to-br from-muted/40 via-background to-muted/20 p-4 lg:grid-cols-[1fr_1.15fr]">
        <div className="h-full overflow-y-auto pr-2">{renderInputPanel}</div>
        <div className="h-full overflow-y-auto pr-2">{renderPreviewPanel}</div>
      </div>
    </div>
  );
}

// Route export
export const Route = createFileRoute('/generate/favicon')({
  component: FaviconPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    bg: typeof search.bg === 'string' ? search.bg : undefined,
    bgEnabled: typeof search.bgEnabled === 'boolean' ? search.bgEnabled : undefined,
    color: typeof search.color === 'string' ? search.color : undefined,
    fontFamily: typeof search.fontFamily === 'string' ? search.fontFamily : undefined,
    fontWeight: typeof search.fontWeight === 'string' ? search.fontWeight : undefined,
    icon: typeof search.icon === 'string' ? search.icon : undefined,
    includeIco: typeof search.includeIco === 'boolean' ? search.includeIco : undefined,
    includeSvg: typeof search.includeSvg === 'boolean' ? search.includeSvg : undefined,
    letterSpacing: typeof search.letterSpacing === 'number' ? search.letterSpacing : undefined,
    padding: typeof search.padding === 'number' ? search.padding : undefined,
    radius: typeof search.radius === 'number' ? search.radius : undefined,
    sizes: typeof search.sizes === 'string' ? search.sizes : undefined,
    source:
      search.source === 'lucide' || search.source === 'text' || search.source === 'upload'
        ? search.source
        : undefined,
    text: typeof search.text === 'string' ? search.text : undefined,
  }),
});
