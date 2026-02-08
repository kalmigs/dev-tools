import { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import QRCode from 'react-qrcode-logo';
import {
  ArrowLeftIcon,
  CheckIcon,
  ClipboardIcon,
  DownloadIcon,
  ImageIcon,
  QrCodeIcon,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';

// Types
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface SearchParams {
  value?: string;
  size?: number;
  fg?: string;
  bg?: string;
  ec?: ErrorCorrectionLevel;
}

interface ColorPickerProps {
  color: string;
  label?: string;
  onChange: (color: string) => void;
}

function ColorPicker({ color, label, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        className="size-9 rounded-md border border-input cursor-pointer overflow-hidden shrink-0"
        style={{ backgroundColor: color }}
      >
        <input
          type="color"
          value={color}
          onChange={e => onChange(e.target.value)}
          className="opacity-0 size-0"
        />
      </label>
      <Input
        value={color.toUpperCase()}
        onChange={e => {
          const val = e.target.value;
          if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
            onChange(val);
          }
        }}
        className="w-24 font-mono text-sm h-9"
        maxLength={7}
      />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

interface InputControlsProps {
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  ecLevel: ErrorCorrectionLevel;
  logoDataUrl: string | null;
  logoSize: number;
  logoOpacity: number;
  logoPadding: number;
  onValueChange: (value: string) => void;
  onSizeChange: (size: number) => void;
  onFgColorChange: (color: string) => void;
  onBgColorChange: (color: string) => void;
  onEcLevelChange: (level: ErrorCorrectionLevel) => void;
  onLogoUpload: (dataUrl: string) => void;
  onLogoRemove: () => void;
  onLogoSizeChange: (size: number) => void;
  onLogoOpacityChange: (opacity: number) => void;
  onLogoPaddingChange: (padding: number) => void;
}

function InputControls({
  value,
  size,
  fgColor,
  bgColor,
  ecLevel,
  logoDataUrl,
  logoSize,
  logoOpacity,
  logoPadding,
  onValueChange,
  onSizeChange,
  onFgColorChange,
  onBgColorChange,
  onEcLevelChange,
  onLogoUpload,
  onLogoRemove,
  onLogoSizeChange,
  onLogoOpacityChange,
  onLogoPaddingChange,
}: InputControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const dataUrl = e.target?.result as string;
      onLogoUpload(dataUrl);
    };
    reader.onerror = () => {
      toast.error('Failed to read file', {
        description: 'Please try again.',
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Content */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="qr-content">Content</Label>
        <Textarea
          id="qr-content"
          value={value}
          onChange={e => onValueChange(e.target.value)}
          placeholder="Enter text or URL..."
          rows={4}
          className="font-mono text-sm"
        />
      </div>

      {/* Size */}
      <div className="flex flex-col gap-2">
        <Label>Size (pixels)</Label>
        <NumberInput
          value={size}
          onValueChange={v => onSizeChange(v ?? 256)}
          min={100}
          max={2000}
        />
      </div>

      {/* Error Correction Level */}
      <div className="flex flex-col gap-2">
        <Label>Error Correction</Label>
        <Select value={ecLevel} onValueChange={v => onEcLevelChange(v as ErrorCorrectionLevel)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">L - Low (~7% recovery)</SelectItem>
            <SelectItem value="M">M - Medium (~15% recovery)</SelectItem>
            <SelectItem value="Q">Q - Quartile (~25% recovery)</SelectItem>
            <SelectItem value="H">H - High (~30% recovery)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Higher levels allow more data recovery when logo covers QR code
        </p>
      </div>

      {/* Colors */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Foreground Color</Label>
          <ColorPicker color={fgColor} onChange={onFgColorChange} />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Background Color</Label>
          <ColorPicker color={bgColor} onChange={onBgColorChange} />
        </div>
      </div>

      {/* Logo */}
      <div className="flex flex-col gap-2">
        <Label>Logo</Label>
        {logoDataUrl ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img
                src={logoDataUrl}
                alt="Logo preview"
                className="size-16 rounded-md border border-input object-contain"
              />
              <Button variant="outline" size="sm" onClick={onLogoRemove}>
                <XIcon className="size-4 mr-2" />
                Remove Logo
              </Button>
            </div>
            <div className="flex flex-col gap-3 pl-3 pr-1 border-l-2 border-border">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Logo Size</Label>
                  <span className="text-xs text-muted-foreground">{logoSize}%</span>
                </div>
                <Slider
                  value={[logoSize]}
                  onValueChange={([v]) => onLogoSizeChange(v)}
                  min={10}
                  max={40}
                  step={1}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Opacity</Label>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(logoOpacity * 100)}%
                  </span>
                </div>
                <Slider
                  value={[logoOpacity * 100]}
                  onValueChange={([v]) => onLogoOpacityChange(v / 100)}
                  min={50}
                  max={100}
                  step={5}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Padding</Label>
                  <span className="text-xs text-muted-foreground">{logoPadding}px</span>
                </div>
                <Slider
                  value={[logoPadding]}
                  onValueChange={([v]) => onLogoPaddingChange(v)}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <ImageIcon className="size-4 mr-2" />
              Upload Logo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface QrPreviewProps {
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  ecLevel: ErrorCorrectionLevel;
  logoDataUrl: string | null;
  logoWidth: number;
  logoHeight: number;
  logoOpacity: number;
  logoPadding: number;
}

function QrPreview({
  value,
  size,
  fgColor,
  bgColor,
  ecLevel,
  logoDataUrl,
  logoWidth,
  logoHeight,
  logoOpacity,
  logoPadding,
}: QrPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState(size);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const availableWidth = entry.contentRect.width - 64; // subtract p-8 (32px each side)
        const maxDisplay = Math.min(availableWidth, size);
        setDisplaySize(Math.max(100, Math.floor(maxDisplay)));
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [size]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center p-8 bg-muted/30 rounded-lg border border-border"
    >
      <QRCode
        id="qr-code-preview"
        value={value}
        size={displaySize}
        fgColor={fgColor}
        bgColor={bgColor}
        ecLevel={ecLevel}
        logoImage={logoDataUrl || undefined}
        logoWidth={logoDataUrl ? Math.round((displaySize * logoWidth) / size) : undefined}
        logoHeight={logoDataUrl ? Math.round((displaySize * logoHeight) / size) : undefined}
        logoOpacity={logoDataUrl ? logoOpacity : undefined}
        logoPadding={logoDataUrl ? Math.round((displaySize * logoPadding) / size) : undefined}
        enableCORS={!!logoDataUrl}
        removeQrCodeBehindLogo={!!logoDataUrl}
      />
    </div>
  );
}

interface OutputSectionProps {
  value: string;
  size: number;
  fgColor: string;
  bgColor: string;
  ecLevel: ErrorCorrectionLevel;
  logoDataUrl: string | null;
  logoSize: number;
  logoOpacity: number;
  logoPadding: number;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}

function OutputSection({
  value,
  size,
  fgColor,
  bgColor,
  ecLevel,
  logoDataUrl,
  logoSize,
  logoOpacity,
  logoPadding,
  copied,
  onCopy,
  onDownload,
}: OutputSectionProps) {
  if (!value.trim()) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] border border-dashed border-border rounded-lg">
        <div className="text-center text-muted-foreground">
          <QrCodeIcon className="size-12 mx-auto mb-2 opacity-50" />
          <p>Enter content above to generate QR code</p>
        </div>
      </div>
    );
  }

  const logoWidth = Math.round((size * logoSize) / 100);
  const logoHeight = logoWidth; // Keep square

  return (
    <div className="flex flex-col gap-4">
      <QrPreview
        value={value}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        ecLevel={ecLevel}
        logoDataUrl={logoDataUrl}
        logoWidth={logoWidth}
        logoHeight={logoHeight}
        logoOpacity={logoOpacity}
        logoPadding={logoPadding}
      />
      {/* Hidden full-resolution QR for download/copy */}
      <div className="absolute -left-[9999px] pointer-events-none" aria-hidden>
        <QRCode
          id="qr-code-canvas"
          value={value}
          size={size}
          fgColor={fgColor}
          bgColor={bgColor}
          ecLevel={ecLevel}
          logoImage={logoDataUrl || undefined}
          logoWidth={logoDataUrl ? logoWidth : undefined}
          logoHeight={logoDataUrl ? logoHeight : undefined}
          logoOpacity={logoDataUrl ? logoOpacity : undefined}
          logoPadding={logoDataUrl ? logoPadding : undefined}
          enableCORS={!!logoDataUrl}
          removeQrCodeBehindLogo={!!logoDataUrl}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={onDownload} className="flex-1">
          <DownloadIcon className="size-4 mr-2" />
          Download PNG
        </Button>
        <Button onClick={onCopy} variant="outline" className="flex-1">
          {copied ? (
            <>
              <CheckIcon className="size-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <ClipboardIcon className="size-4 mr-2" />
              Copy Image
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Main component
function QrCodePage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate({ from: '/generate/qr-code' });
  const search = Route.useSearch();

  // Initialize from search params or defaults
  const initialValue = search.value ?? 'https://example.com';
  const initialSize = search.size ?? 256;
  const initialFgColor = search.fg ? `#${search.fg.replace('#', '')}` : '#000000';
  const initialBgColor = search.bg ? `#${search.bg.replace('#', '')}` : '#FFFFFF';
  const initialEcLevel = search.ec ?? 'H';

  // State
  const [activeTab, setActiveTab] = useState('input');
  const [value, setValue] = useState(initialValue);
  const [size, setSize] = useState(initialSize);
  const [fgColor, setFgColor] = useState(initialFgColor);
  const [bgColor, setBgColor] = useState(initialBgColor);
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>(initialEcLevel);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20); // percentage
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [logoPadding, setLogoPadding] = useState(0);
  const [copied, setCopied] = useState(false);

  // Update URL when values change (debounced or on blur)
  const updateSearch = useCallback(
    (updates: Partial<SearchParams>) => {
      navigate({
        search: prev => ({
          ...prev,
          ...updates,
        }),
        replace: true,
      });
    },
    [navigate],
  );

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    updateSearch({ value: newValue || undefined });
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    updateSearch({ size: newSize });
  };

  const handleFgColorChange = (color: string) => {
    setFgColor(color);
    updateSearch({ fg: color.replace('#', '') });
  };

  const handleBgColorChange = (color: string) => {
    setBgColor(color);
    updateSearch({ bg: color.replace('#', '') });
  };

  const handleEcLevelChange = (level: ErrorCorrectionLevel) => {
    setEcLevel(level);
    updateSearch({ ec: level });
  };

  const handleDownload = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) {
      toast.error('QR code not found', {
        description: 'Please wait for the QR code to generate.',
      });
      return;
    }

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${size}x${size}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('QR code downloaded');
    }, 'image/png');
  };

  const handleCopy = async () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) {
      toast.error('QR code not found', {
        description: 'Please wait for the QR code to generate.',
      });
      return;
    }

    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      toast.error('Copying images is not supported in this browser', {
        description: 'Please use the Download button instead.',
      });
      return;
    }

    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('QR code copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy image', {
        description:
          'This feature may not be supported in your browser. Please use the Download button instead.',
      });
    }
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeftIcon className="size-5" />
          </Link>
          <h1 className="text-lg font-semibold">QR Code</h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full">
            <TabsTrigger value="input" className="flex-1">
              Input
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="input"
            forceMount
            className="flex-1 pt-4 overflow-y-auto pb-4 data-[state=inactive]:hidden"
          >
            <div className="px-4">
              <InputControls
                value={value}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                ecLevel={ecLevel}
                logoDataUrl={logoDataUrl}
                logoSize={logoSize}
                logoOpacity={logoOpacity}
                logoPadding={logoPadding}
                onValueChange={handleValueChange}
                onSizeChange={handleSizeChange}
                onFgColorChange={handleFgColorChange}
                onBgColorChange={handleBgColorChange}
                onEcLevelChange={handleEcLevelChange}
                onLogoUpload={setLogoDataUrl}
                onLogoRemove={() => setLogoDataUrl(null)}
                onLogoSizeChange={setLogoSize}
                onLogoOpacityChange={setLogoOpacity}
                onLogoPaddingChange={setLogoPadding}
              />
            </div>
          </TabsContent>
          <TabsContent
            value="preview"
            forceMount
            className="flex-1 pt-4 overflow-y-auto pb-4 data-[state=inactive]:hidden"
          >
            <div className="px-4">
              <OutputSection
                value={value}
                size={size}
                fgColor={fgColor}
                bgColor={bgColor}
                ecLevel={ecLevel}
                logoDataUrl={logoDataUrl}
                logoSize={logoSize}
                logoOpacity={logoOpacity}
                logoPadding={logoPadding}
                copied={copied}
                onCopy={handleCopy}
                onDownload={handleDownload}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 min-h-0 flex gap-6 overflow-hidden">
        <div className="w-[400px] shrink-0 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
          <InputControls
            value={value}
            size={size}
            fgColor={fgColor}
            bgColor={bgColor}
            ecLevel={ecLevel}
            logoDataUrl={logoDataUrl}
            logoSize={logoSize}
            logoOpacity={logoOpacity}
            logoPadding={logoPadding}
            onValueChange={handleValueChange}
            onSizeChange={handleSizeChange}
            onFgColorChange={handleFgColorChange}
            onBgColorChange={handleBgColorChange}
            onEcLevelChange={handleEcLevelChange}
            onLogoUpload={setLogoDataUrl}
            onLogoRemove={() => setLogoDataUrl(null)}
            onLogoSizeChange={setLogoSize}
            onLogoOpacityChange={setLogoOpacity}
            onLogoPaddingChange={setLogoPadding}
          />
        </div>
        <div className="flex-1 min-w-0">
          <OutputSection
            value={value}
            size={size}
            fgColor={fgColor}
            bgColor={bgColor}
            ecLevel={ecLevel}
            logoDataUrl={logoDataUrl}
            logoSize={logoSize}
            logoOpacity={logoOpacity}
            logoPadding={logoPadding}
            copied={copied}
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  );
}

// Route export
export const Route = createFileRoute('/generate/qr-code')({
  component: QrCodePage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const validEcLevels: ErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];
    return {
      value: typeof search.value === 'string' ? search.value : undefined,
      size:
        typeof search.size === 'number' && search.size >= 100 && search.size <= 2000
          ? search.size
          : typeof search.size === 'string' && !isNaN(Number(search.size))
            ? Math.min(2000, Math.max(100, Number(search.size)))
            : undefined,
      fg:
        typeof search.fg === 'string' && /^[0-9A-Fa-f]{6}$/.test(search.fg.replace('#', ''))
          ? search.fg.replace('#', '')
          : undefined,
      bg:
        typeof search.bg === 'string' && /^[0-9A-Fa-f]{6}$/.test(search.bg.replace('#', ''))
          ? search.bg.replace('#', '')
          : undefined,
      ec: validEcLevels.includes(search.ec as ErrorCorrectionLevel)
        ? (search.ec as ErrorCorrectionLevel)
        : undefined,
    };
  },
});
