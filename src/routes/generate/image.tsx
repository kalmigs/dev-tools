import { useCallback, useEffect, useRef, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowDownIcon,
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  ArrowUpLeftIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CircleIcon,
  ClipboardIcon,
  DownloadIcon,
  PlusIcon,
  ShuffleIcon,
  XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn, generateRandomId, randomColor } from '@/lib/utils';

// Types
type BackgroundType = 'solid' | 'gradient';
type FillType = 'solid' | 'gradient' | 'pattern';
type ImageFormat = 'png' | 'jpeg' | 'webp';
type PatternType =
  | 'checkerboard'
  | 'dots'
  | 'grid'
  | 'noise'
  | 'stripes'
  | 'triangles'
  | 'waves'
  | 'zigzag';

interface ColorStop {
  color: string;
  id: string;
}

interface SizePreset {
  height: number;
  label: string;
  value: string;
  width: number;
}

interface SearchParams {
  bg_angle?: number;
  bg_color?: string;
  bg_colors?: string;
  bg_type?: BackgroundType;
  fill?: FillType;
  format?: ImageFormat;
  g_angle?: number;
  g_colors?: string;
  h?: number;
  p_angle?: number;
  p_color?: string;
  p_size?: number;
  p_type?: PatternType;
  s_color?: string;
  size?: string;
  w?: number;
}

// Constants
const SIZE_PRESETS: { group: string; presets: SizePreset[] }[] = [
  {
    group: 'Social Media',
    presets: [
      { height: 630, label: 'OG Image', value: 'og', width: 1200 },
      { height: 1080, label: 'Instagram Post', value: 'ig-post', width: 1080 },
      { height: 1920, label: 'Instagram Story', value: 'ig-story', width: 1080 },
      { height: 500, label: 'Twitter Header', value: 'twitter', width: 1500 },
      { height: 720, label: 'YouTube Thumbnail', value: 'youtube', width: 1280 },
    ],
  },
  {
    group: 'Desktop',
    presets: [
      { height: 720, label: 'HD', value: 'hd', width: 1280 },
      { height: 1080, label: 'Full HD', value: 'fhd', width: 1920 },
      { height: 1440, label: '2K', value: '2k', width: 2560 },
      { height: 2160, label: '4K', value: '4k', width: 3840 },
    ],
  },
  {
    group: 'Common Ratios',
    presets: [
      { height: 1080, label: 'Square (1:1)', value: 'square', width: 1080 },
      { height: 720, label: 'Landscape (16:9)', value: '16-9', width: 1280 },
      { height: 1280, label: 'Portrait (9:16)', value: '9-16', width: 720 },
      { height: 768, label: 'Classic (4:3)', value: '4-3', width: 1024 },
    ],
  },
];

const PATTERN_OPTIONS: { label: string; value: PatternType }[] = [
  { label: 'Stripes', value: 'stripes' },
  { label: 'Checkerboard', value: 'checkerboard' },
  { label: 'Dots', value: 'dots' },
  { label: 'Grid', value: 'grid' },
  { label: 'Waves', value: 'waves' },
  { label: 'Zigzag', value: 'zigzag' },
  { label: 'Triangles', value: 'triangles' },
  { label: 'Noise', value: 'noise' },
];

const DIRECTION_ANGLES: { angle: number; icon: React.ReactNode }[] = [
  { angle: 315, icon: <ArrowUpLeftIcon className="size-4" /> },
  { angle: 0, icon: <ArrowUpIcon className="size-4" /> },
  { angle: 45, icon: <ArrowUpRightIcon className="size-4" /> },
  { angle: 270, icon: <ArrowLeftIcon className="size-4" /> },
  { angle: -1, icon: <CircleIcon className="size-3" /> }, // Custom
  { angle: 90, icon: <ArrowRightIcon className="size-4" /> },
  { angle: 225, icon: <ArrowDownLeftIcon className="size-4" /> },
  { angle: 180, icon: <ArrowDownIcon className="size-4" /> },
  { angle: 135, icon: <ArrowDownRightIcon className="size-4" /> },
];

// Helper functions
function angleToGradientCoords(
  angle: number,
  width: number,
  height: number,
): { x1: number; x2: number; y1: number; y2: number } {
  const radians = ((angle - 90) * Math.PI) / 180;
  const diagonal = Math.sqrt(width * width + height * height);
  const centerX = width / 2;
  const centerY = height / 2;

  return {
    x1: centerX - (Math.cos(radians) * diagonal) / 2,
    x2: centerX + (Math.cos(radians) * diagonal) / 2,
    y1: centerY - (Math.sin(radians) * diagonal) / 2,
    y2: centerY + (Math.sin(radians) * diagonal) / 2,
  };
}

// Canvas drawing functions
function drawSolid(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: ColorStop[],
  angle: number,
) {
  const { x1, y1, x2, y2 } = angleToGradientCoords(angle, width, height);
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

  colors.forEach((stop, index) => {
    gradient.addColorStop(index / Math.max(colors.length - 1, 1), stop.color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgType: BackgroundType,
  bgColor: string,
  bgColors: ColorStop[],
  bgAngle: number,
) {
  if (bgType === 'solid') {
    drawSolid(ctx, width, height, bgColor);
  } else {
    drawGradient(ctx, width, height, bgColors, bgAngle);
  }
}

function drawStripes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number,
  angle: number,
  fgColor: string,
) {
  ctx.save();
  ctx.fillStyle = fgColor;
  ctx.translate(width / 2, height / 2);
  ctx.rotate((angle * Math.PI) / 180);

  const diagonal = Math.sqrt(width * width + height * height) * 2;
  for (let i = -diagonal; i < diagonal; i += size * 2) {
    ctx.fillRect(i, -diagonal, size, diagonal * 2);
  }
  ctx.restore();
}

function drawCheckerboard(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number,
  fgColor: string,
) {
  ctx.fillStyle = fgColor;
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      if (((x + y) / size) % 2 < 1) {
        ctx.fillRect(x, y, size, size);
      }
    }
  }
}

function drawDots(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number,
  fgColor: string,
) {
  ctx.fillStyle = fgColor;
  const spacing = size * 3;
  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number,
  fgColor: string,
) {
  ctx.strokeStyle = fgColor;
  ctx.lineWidth = Math.max(1, size / 10);

  for (let x = 0; x <= width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawWaves(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number,
  fgColor: string,
) {
  ctx.strokeStyle = fgColor;
  ctx.lineWidth = Math.max(2, size / 5);

  const amplitude = size / 2;
  const wavelength = size * 2;

  for (let y = size; y < height + size; y += size * 1.5) {
    ctx.beginPath();
    ctx.moveTo(0, y);

    for (let x = 0; x <= width; x += 5) {
      const offsetY = Math.sin((x / wavelength) * Math.PI * 2) * amplitude;
      ctx.lineTo(x, y + offsetY);
    }
    ctx.stroke();
  }
}

function drawZigzag(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number,
  fgColor: string,
) {
  ctx.strokeStyle = fgColor;
  ctx.lineWidth = Math.max(2, size / 5);

  for (let y = size; y < height + size; y += size * 1.5) {
    ctx.beginPath();
    ctx.moveTo(0, y);

    let up = true;
    for (let x = 0; x <= width; x += size / 2) {
      ctx.lineTo(x, y + (up ? -size / 2 : size / 2));
      up = !up;
    }
    ctx.stroke();
  }
}

function drawTriangles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  size: number,
  fgColor: string,
) {
  ctx.fillStyle = fgColor;
  const h = (size * Math.sqrt(3)) / 2;

  for (let row = 0; row * h < height + h; row++) {
    const offset = row % 2 === 0 ? 0 : size / 2;
    for (let col = -1; col * size < width + size; col++) {
      const x = col * size + offset;
      const y = row * h;

      if ((row + col) % 2 === 0) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size / 2, y + h);
        ctx.lineTo(x - size / 2, y + h);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  _size: number,
  fgColor: string,
) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Parse foreground color
  const r = parseInt(fgColor.slice(1, 3), 16);
  const g = parseInt(fgColor.slice(3, 5), 16);
  const b = parseInt(fgColor.slice(5, 7), 16);

  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() > 0.85) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = Math.floor(Math.random() * 100) + 50;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pattern: PatternType,
  size: number,
  angle: number,
  fgColor: string,
  bgType: BackgroundType,
  bgColor: string,
  bgColors: ColorStop[],
  bgAngle: number,
) {
  // Draw background first
  drawBackground(ctx, width, height, bgType, bgColor, bgColors, bgAngle);

  // Draw pattern on top
  switch (pattern) {
    case 'stripes':
      drawStripes(ctx, width, height, size, angle, fgColor);
      break;
    case 'checkerboard':
      drawCheckerboard(ctx, width, height, size, fgColor);
      break;
    case 'dots':
      drawDots(ctx, width, height, size, fgColor);
      break;
    case 'grid':
      drawGrid(ctx, width, height, size, fgColor);
      break;
    case 'waves':
      drawWaves(ctx, width, height, size, fgColor);
      break;
    case 'zigzag':
      drawZigzag(ctx, width, height, size, fgColor);
      break;
    case 'triangles':
      drawTriangles(ctx, width, height, size, fgColor);
      break;
    case 'noise':
      drawNoise(ctx, width, height, size, fgColor);
      break;
  }
}

// Subcomponents
interface ColorPickerProps {
  color: string;
  label?: string;
  onChange: (color: string) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

function ColorPicker({ color, label, onChange, onRemove, showRemove }: ColorPickerProps) {
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
      {showRemove && onRemove && (
        <Button variant="ghost" size="icon-sm" onClick={onRemove}>
          <XIcon className="size-4" />
        </Button>
      )}
    </div>
  );
}

interface DirectionGridProps {
  customAngle: number;
  isCustom: boolean;
  onAngleChange: (angle: number, isCustom: boolean) => void;
  selectedAngle: number;
}

function DirectionGrid({
  customAngle,
  isCustom,
  onAngleChange,
  selectedAngle,
}: DirectionGridProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1 w-fit">
        {DIRECTION_ANGLES.map(({ angle, icon }) => {
          const isSelected = angle === -1 ? isCustom : !isCustom && selectedAngle === angle;
          return (
            <Button
              key={angle}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className="size-9 p-0"
              onClick={() => {
                if (angle === -1) {
                  onAngleChange(customAngle, true);
                } else {
                  onAngleChange(angle, false);
                }
              }}
            >
              {icon}
            </Button>
          );
        })}
      </div>
      {isCustom && (
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="flex items-center pl-2">
            <Slider
              value={[customAngle]}
              onValueChange={([v]) => onAngleChange(v, true)}
              min={0}
              max={360}
              className="w-full"
            />
          </div>
          <NumberInput
            value={customAngle}
            onValueChange={v => onAngleChange(v ?? 0, true)}
            min={0}
            max={360}
            suffix="°"
          />
        </div>
      )}
    </div>
  );
}

interface InputControlsProps {
  bgAngle: number;
  bgColor: string;
  bgColors: ColorStop[];
  bgIsCustomAngle: boolean;
  bgType: BackgroundType;
  customAngle: number;
  fillType: FillType;
  gradientColors: ColorStop[];
  height: number;
  isCustomAngle: boolean;
  onAddBgColor: () => void;
  onAddGradientColor: () => void;
  onBgAngleChange: (angle: number, isCustom: boolean) => void;
  onBgColorChange: (color: string) => void;
  onBgColorsChange: (colors: ColorStop[]) => void;
  onBgTypeChange: (type: BackgroundType) => void;
  onFillTypeChange: (type: FillType) => void;
  onGradientAngleChange: (angle: number, isCustom: boolean) => void;
  onGradientColorsChange: (colors: ColorStop[]) => void;
  onHeightChange: (height: number) => void;
  onPatternAngleChange: (angle: number, isCustom: boolean) => void;
  onPatternColorChange: (color: string) => void;
  onPatternSizeChange: (size: number) => void;
  onPatternTypeChange: (type: PatternType) => void;
  onRandomize: () => void;
  onRemoveBgColor: (id: string) => void;
  onRemoveGradientColor: (id: string) => void;
  onSizePresetChange: (preset: string) => void;
  onSolidColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  patternAngle: number;
  patternColor: string;
  patternIsCustomAngle: boolean;
  patternSize: number;
  patternType: PatternType;
  selectedAngle: number;
  sizePreset: string;
  solidColor: string;
  width: number;
}

function InputControls({
  bgAngle,
  bgColor,
  bgColors,
  bgIsCustomAngle,
  bgType,
  customAngle,
  fillType,
  gradientColors,
  height,
  isCustomAngle,
  onAddBgColor,
  onAddGradientColor,
  onBgAngleChange,
  onBgColorChange,
  onBgColorsChange,
  onBgTypeChange,
  onFillTypeChange,
  onGradientAngleChange,
  onGradientColorsChange,
  onHeightChange,
  onPatternAngleChange,
  onPatternColorChange,
  onPatternSizeChange,
  onPatternTypeChange,
  onRandomize,
  onRemoveBgColor,
  onRemoveGradientColor,
  onSizePresetChange,
  onSolidColorChange,
  onWidthChange,
  patternAngle,
  patternColor,
  patternIsCustomAngle,
  patternSize,
  patternType,
  selectedAngle,
  sizePreset,
  solidColor,
  width,
}: InputControlsProps) {
  const [sizeOpen, setSizeOpen] = useState(false);

  // Get display label for selected size
  const getSelectedSizeLabel = () => {
    if (sizePreset === 'custom') return 'Custom';
    for (const group of SIZE_PRESETS) {
      const preset = group.presets.find(p => p.value === sizePreset);
      if (preset) return `${preset.label} (${preset.width}×${preset.height})`;
    }
    return 'Select size...';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Size */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Size</label>
        <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={sizeOpen}
              className="w-full justify-between font-normal"
            >
              {getSelectedSizeLabel()}
              <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput placeholder="Search sizes..." />
              <CommandList>
                <CommandEmpty>No size found.</CommandEmpty>
                {SIZE_PRESETS.map(group => (
                  <CommandGroup key={group.group} heading={group.group}>
                    {group.presets.map(preset => (
                      <CommandItem
                        key={preset.value}
                        value={`${preset.label} ${preset.width}×${preset.height}`}
                        onSelect={() => {
                          onSizePresetChange(preset.value);
                          setSizeOpen(false);
                        }}
                      >
                        <CheckIcon
                          className={cn(
                            'mr-2 size-4',
                            sizePreset === preset.value ? 'opacity-100' : 'opacity-0',
                          )}
                        />
                        {preset.label} ({preset.width}×{preset.height})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
                <CommandGroup>
                  <CommandItem
                    value="custom"
                    onSelect={() => {
                      onSizePresetChange('custom');
                      setSizeOpen(false);
                    }}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 size-4',
                        sizePreset === 'custom' ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    Custom
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {sizePreset === 'custom' && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Width</span>
              <NumberInput
                value={width}
                onValueChange={v => onWidthChange(v ?? 100)}
                min={1}
                max={8192}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Height</span>
              <NumberInput
                value={height}
                onValueChange={v => onHeightChange(v ?? 100)}
                min={1}
                max={8192}
              />
            </div>
          </div>
        )}
      </div>

      {/* Fill Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Fill Type</label>
        <div className="flex gap-1">
          {(['solid', 'gradient', 'pattern'] as FillType[]).map(type => (
            <Button
              key={type}
              variant={fillType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFillTypeChange(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Solid Color */}
      {fillType === 'solid' && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-muted-foreground">Color</label>
          <ColorPicker color={solidColor} onChange={onSolidColorChange} />
        </div>
      )}

      {/* Gradient Colors */}
      {fillType === 'gradient' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Colors</label>
            <div className="flex flex-col gap-2">
              {gradientColors.map((stop, index) => (
                <ColorPicker
                  key={stop.id}
                  color={stop.color}
                  onChange={color => {
                    const newColors = [...gradientColors];
                    newColors[index] = { ...stop, color };
                    onGradientColorsChange(newColors);
                  }}
                  onRemove={() => onRemoveGradientColor(stop.id)}
                  showRemove={gradientColors.length > 2}
                />
              ))}
              <Button variant="outline" size="sm" onClick={onAddGradientColor} className="w-fit">
                <PlusIcon className="size-4 mr-1" />
                Add Color
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Direction</label>
            <DirectionGrid
              selectedAngle={selectedAngle}
              isCustom={isCustomAngle}
              customAngle={customAngle}
              onAngleChange={onGradientAngleChange}
            />
          </div>
        </>
      )}

      {/* Pattern Options */}
      {fillType === 'pattern' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Pattern Style</label>
            <Select value={patternType} onValueChange={v => onPatternTypeChange(v as PatternType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PATTERN_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Pattern Size</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center pl-2">
                <Slider
                  value={[patternSize]}
                  onValueChange={([v]) => onPatternSizeChange(v)}
                  min={5}
                  max={100}
                  className="w-full"
                />
              </div>
              <NumberInput
                value={patternSize}
                onValueChange={v => onPatternSizeChange(v ?? 20)}
                min={5}
                max={100}
                suffix="px"
              />
            </div>
          </div>

          {patternType === 'stripes' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-muted-foreground">Rotation</label>
              <DirectionGrid
                selectedAngle={patternAngle}
                isCustom={patternIsCustomAngle}
                customAngle={patternAngle}
                onAngleChange={onPatternAngleChange}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">Pattern Color</label>
            <ColorPicker color={patternColor} onChange={onPatternColorChange} />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-muted-foreground">Background</label>
            <RadioGroup
              value={bgType}
              onValueChange={v => onBgTypeChange(v as BackgroundType)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="solid" id="bg-solid" />
                <label htmlFor="bg-solid" className="text-sm cursor-pointer">
                  Solid
                </label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="gradient" id="bg-gradient" />
                <label htmlFor="bg-gradient" className="text-sm cursor-pointer">
                  Gradient
                </label>
              </div>
            </RadioGroup>

            {bgType === 'solid' && <ColorPicker color={bgColor} onChange={onBgColorChange} />}

            {bgType === 'gradient' && (
              <div className="flex flex-col gap-2">
                {bgColors.map((stop, index) => (
                  <ColorPicker
                    key={stop.id}
                    color={stop.color}
                    onChange={color => {
                      const newColors = [...bgColors];
                      newColors[index] = { ...stop, color };
                      onBgColorsChange(newColors);
                    }}
                    onRemove={() => onRemoveBgColor(stop.id)}
                    showRemove={bgColors.length > 2}
                  />
                ))}
                <Button variant="outline" size="sm" onClick={onAddBgColor} className="w-fit">
                  <PlusIcon className="size-4 mr-1" />
                  Add Color
                </Button>

                <div className="mt-2">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Direction
                  </label>
                  <DirectionGrid
                    selectedAngle={bgAngle}
                    isCustom={bgIsCustomAngle}
                    customAngle={bgAngle}
                    onAngleChange={onBgAngleChange}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Randomize Button */}
      <Button onClick={onRandomize} variant="outline" className="w-fit gap-2">
        <ShuffleIcon className="size-4" />
        Randomize Colors
      </Button>
    </div>
  );
}

interface OutputSectionProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  copied: boolean;
  fillType: FillType;
  format: ImageFormat;
  gradientAngle: number;
  gradientColors: ColorStop[];
  height: number;
  isMobile: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onFormatChange: (format: ImageFormat) => void;
  patternType: PatternType;
  solidColor: string;
  width: number;
}

function OutputSection({
  canvasRef,
  copied,
  fillType,
  format,
  gradientAngle,
  gradientColors,
  height,
  isMobile,
  onCopy,
  onDownload,
  onFormatChange,
  patternType,
  solidColor,
  width,
}: OutputSectionProps) {
  // Generate description text
  const getDescription = () => {
    if (fillType === 'solid') {
      return solidColor.toUpperCase();
    }
    if (fillType === 'gradient') {
      const colorStr = gradientColors.map(c => c.color.toUpperCase()).join(' → ');
      return `${colorStr} (${gradientAngle}°)`;
    }
    if (fillType === 'pattern') {
      return `${patternType} pattern`;
    }
    return '';
  };

  // Calculate display dimensions maintaining aspect ratio
  // Use smaller max dimensions on mobile to fit the viewport
  const maxDisplayWidth = isMobile ? 320 : 600;
  const maxDisplayHeight = isMobile ? 280 : 400;
  const aspectRatio = width / height;

  let displayWidth: number;
  let displayHeight: number;

  if (aspectRatio > maxDisplayWidth / maxDisplayHeight) {
    // Width constrained
    displayWidth = Math.min(width, maxDisplayWidth);
    displayHeight = displayWidth / aspectRatio;
  } else {
    // Height constrained
    displayHeight = Math.min(height, maxDisplayHeight);
    displayWidth = displayHeight * aspectRatio;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
        {/* Preview */}
        <div className="flex-1 flex items-center justify-center p-4 bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-size-[16px_16px]">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full"
            style={{
              width: displayWidth,
              height: displayHeight,
            }}
          />
        </div>

        {/* Info & Actions */}
        <div className="px-4 py-3 bg-muted/50 border-t flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {width} × {height} px
            </span>
            <span className="text-xs text-muted-foreground">{getDescription()}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={format} onValueChange={v => onFormatChange(v as ImageFormat)}>
              <SelectTrigger className="w-24 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={onCopy} className="gap-2 w-[88px]">
              {copied ? (
                <>
                  <CheckIcon className="size-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardIcon className="size-4" />
                  Copy
                </>
              )}
            </Button>

            <Button size="sm" onClick={onDownload} className="gap-2">
              <DownloadIcon className="size-4" />
              Download
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component
function ImagePage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate({ from: '/generate/image' });
  const search = Route.useSearch();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate initial random colors (only used if no URL params)
  const [initialColors] = useState(() => ({
    color1: randomColor(),
    color2: randomColor(),
    color3: randomColor(),
    color4: randomColor(),
  }));

  // Parse colors from URL or use random
  const parseColorsFromUrl = (colorsStr: string | undefined, defaults: string[]): ColorStop[] => {
    if (colorsStr) {
      return colorsStr
        .split(',')
        .map(c => ({ color: c.startsWith('#') ? c : `#${c}`, id: generateRandomId() }));
    }
    return defaults.map(c => ({ color: c, id: generateRandomId() }));
  };

  // Initialize from search params
  const initialSizePreset = search.size ?? 'og';
  const initialPreset = SIZE_PRESETS.flatMap(g => g.presets).find(
    p => p.value === initialSizePreset,
  );
  const initialWidth = search.w ?? initialPreset?.width ?? 1200;
  const initialHeight = search.h ?? initialPreset?.height ?? 630;
  const initialFillType = search.fill ?? 'gradient';
  const initialSolidColor = search.s_color
    ? `#${search.s_color.replace('#', '')}`
    : initialColors.color1;
  const initialGradientAngle = search.g_angle ?? 90;
  const initialPatternType = search.p_type ?? 'stripes';
  const initialPatternSize = search.p_size ?? 20;
  const initialPatternAngle = search.p_angle ?? 45;
  const initialPatternColor = search.p_color
    ? `#${search.p_color.replace('#', '')}`
    : initialColors.color3;
  const initialBgType = search.bg_type ?? 'solid';
  const initialBgColor = search.bg_color
    ? `#${search.bg_color.replace('#', '')}`
    : initialColors.color1;
  const initialBgAngle = search.bg_angle ?? 90;
  const initialFormat = search.format ?? 'png';

  // State
  const [activeTab, setActiveTab] = useState('input');
  const [bgAngle, setBgAngle] = useState(initialBgAngle);
  const [bgColor, setBgColor] = useState(initialBgColor);
  const [bgColors, setBgColors] = useState<ColorStop[]>(() =>
    parseColorsFromUrl(search.bg_colors, [initialColors.color1, initialColors.color2]),
  );
  const [bgIsCustomAngle, setBgIsCustomAngle] = useState(false);
  const [bgType, setBgType] = useState<BackgroundType>(initialBgType);
  const [copied, setCopied] = useState(false);
  const [customAngle, setCustomAngle] = useState(initialGradientAngle);
  const [fillType, setFillType] = useState<FillType>(initialFillType);
  const [format, setFormat] = useState<ImageFormat>(initialFormat);
  const [gradientColors, setGradientColors] = useState<ColorStop[]>(() =>
    parseColorsFromUrl(search.g_colors, [initialColors.color1, initialColors.color2]),
  );
  const [height, setHeight] = useState(initialHeight);
  const [isCustomAngle, setIsCustomAngle] = useState(search.g_angle !== undefined);
  const [patternAngle, setPatternAngle] = useState(initialPatternAngle);
  const [patternColor, setPatternColor] = useState(initialPatternColor);
  const [patternIsCustomAngle, setPatternIsCustomAngle] = useState(search.p_angle !== undefined);
  const [patternSize, setPatternSize] = useState(initialPatternSize);
  const [patternType, setPatternType] = useState<PatternType>(initialPatternType);
  const [selectedAngle, setSelectedAngle] = useState(initialGradientAngle);
  const [sizePreset, setSizePreset] = useState(initialSizePreset);
  const [solidColor, setSolidColor] = useState(initialSolidColor);
  const [width, setWidth] = useState(initialWidth);

  // Update URL when settings change
  const updateSearchParams = useCallback(
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

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (fillType === 'solid') {
      drawSolid(ctx, width, height, solidColor);
    } else if (fillType === 'gradient') {
      const angle = isCustomAngle ? customAngle : selectedAngle;
      drawGradient(ctx, width, height, gradientColors, angle);
    } else if (fillType === 'pattern') {
      drawPattern(
        ctx,
        width,
        height,
        patternType,
        patternSize,
        patternAngle,
        patternColor,
        bgType,
        bgColor,
        bgColors,
        bgAngle,
      );
    }
  }, [
    width,
    height,
    fillType,
    solidColor,
    gradientColors,
    selectedAngle,
    customAngle,
    isCustomAngle,
    patternType,
    patternSize,
    patternAngle,
    patternColor,
    bgType,
    bgColor,
    bgColors,
    bgAngle,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Redraw when switching to preview tab on mobile
  useEffect(() => {
    if (activeTab === 'preview') {
      // Small delay to ensure canvas is mounted
      const timer = setTimeout(() => {
        drawCanvas();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeTab, drawCanvas]);

  // Handlers
  const handleSizePresetChange = (preset: string) => {
    setSizePreset(preset);
    if (preset !== 'custom') {
      const found = SIZE_PRESETS.flatMap(g => g.presets).find(p => p.value === preset);
      if (found) {
        setWidth(found.width);
        setHeight(found.height);
        updateSearchParams({ size: preset, w: undefined, h: undefined });
      }
    } else {
      updateSearchParams({ size: 'custom', w: width, h: height });
    }
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (sizePreset === 'custom') {
      updateSearchParams({ w: newWidth });
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (sizePreset === 'custom') {
      updateSearchParams({ h: newHeight });
    }
  };

  const handleFillTypeChange = (type: FillType) => {
    setFillType(type);
    updateSearchParams({ fill: type });
  };

  const handleSolidColorChange = (color: string) => {
    setSolidColor(color);
    updateSearchParams({ s_color: color.replace('#', '') });
  };

  const handleGradientColorsChange = (colors: ColorStop[]) => {
    setGradientColors(colors);
    updateSearchParams({ g_colors: colors.map(c => c.color.replace('#', '')).join(',') });
  };

  const handleGradientAngleChange = (angle: number, isCustom: boolean) => {
    setIsCustomAngle(isCustom);
    if (isCustom) {
      setCustomAngle(angle);
    } else {
      setSelectedAngle(angle);
    }
    updateSearchParams({ g_angle: angle });
  };

  const handlePatternTypeChange = (type: PatternType) => {
    setPatternType(type);
    updateSearchParams({ p_type: type });
  };

  const handlePatternSizeChange = (size: number) => {
    setPatternSize(size);
    updateSearchParams({ p_size: size });
  };

  const handlePatternAngleChange = (angle: number, isCustom: boolean) => {
    setPatternIsCustomAngle(isCustom);
    setPatternAngle(angle);
    updateSearchParams({ p_angle: angle });
  };

  const handlePatternColorChange = (color: string) => {
    setPatternColor(color);
    updateSearchParams({ p_color: color.replace('#', '') });
  };

  const handleBgTypeChange = (type: BackgroundType) => {
    setBgType(type);
    updateSearchParams({ bg_type: type });
  };

  const handleBgColorChange = (color: string) => {
    setBgColor(color);
    updateSearchParams({ bg_color: color.replace('#', '') });
  };

  const handleBgColorsChange = (colors: ColorStop[]) => {
    setBgColors(colors);
    updateSearchParams({ bg_colors: colors.map(c => c.color.replace('#', '')).join(',') });
  };

  const handleBgAngleChange = (angle: number, isCustom: boolean) => {
    setBgIsCustomAngle(isCustom);
    setBgAngle(angle);
    updateSearchParams({ bg_angle: angle });
  };

  const handleFormatChange = (newFormat: ImageFormat) => {
    setFormat(newFormat);
    updateSearchParams({ format: newFormat });
  };

  const handleRandomize = () => {
    if (fillType === 'solid') {
      const color = randomColor();
      setSolidColor(color);
      updateSearchParams({ s_color: color.replace('#', '') });
    } else if (fillType === 'gradient') {
      const newColors = gradientColors.map(c => ({ ...c, color: randomColor() }));
      setGradientColors(newColors);
      updateSearchParams({ g_colors: newColors.map(c => c.color.replace('#', '')).join(',') });
    } else if (fillType === 'pattern') {
      const newPatternColor = randomColor();
      setPatternColor(newPatternColor);
      if (bgType === 'solid') {
        const newBgColor = randomColor();
        setBgColor(newBgColor);
        updateSearchParams({
          p_color: newPatternColor.replace('#', ''),
          bg_color: newBgColor.replace('#', ''),
        });
      } else {
        const newBgColors = bgColors.map(c => ({ ...c, color: randomColor() }));
        setBgColors(newBgColors);
        updateSearchParams({
          p_color: newPatternColor.replace('#', ''),
          bg_colors: newBgColors.map(c => c.color.replace('#', '')).join(','),
        });
      }
    }
  };

  const handleAddGradientColor = () => {
    const newColor = randomColor();
    const newColors = [...gradientColors, { color: newColor, id: generateRandomId() }];
    setGradientColors(newColors);
    updateSearchParams({ g_colors: newColors.map(c => c.color.replace('#', '')).join(',') });
  };

  const handleRemoveGradientColor = (id: string) => {
    if (gradientColors.length > 2) {
      const newColors = gradientColors.filter(c => c.id !== id);
      setGradientColors(newColors);
      updateSearchParams({ g_colors: newColors.map(c => c.color.replace('#', '')).join(',') });
    }
  };

  const handleAddBgColor = () => {
    const newColor = randomColor();
    const newColors = [...bgColors, { color: newColor, id: generateRandomId() }];
    setBgColors(newColors);
    updateSearchParams({ bg_colors: newColors.map(c => c.color.replace('#', '')).join(',') });
  };

  const handleRemoveBgColor = (id: string) => {
    if (bgColors.length > 2) {
      const newColors = bgColors.filter(c => c.id !== id);
      setBgColors(newColors);
      updateSearchParams({ bg_colors: newColors.map(c => c.color.replace('#', '')).join(',') });
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeType =
      format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
    const extension = format;

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${width}x${height}.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
    }, mimeType);
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if clipboard API with ClipboardItem is supported
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
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy image', {
        description:
          'This feature may not be supported in your browser. Please use the Download button instead.',
      });
    }
  };

  const gradientAngle = isCustomAngle ? customAngle : selectedAngle;

  // Mobile Layout
  if (isMobile) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
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
          <InputControls
            bgAngle={bgAngle}
            bgColor={bgColor}
            bgColors={bgColors}
            bgIsCustomAngle={bgIsCustomAngle}
            bgType={bgType}
            customAngle={customAngle}
            fillType={fillType}
            gradientColors={gradientColors}
            height={height}
            isCustomAngle={isCustomAngle}
            onAddBgColor={handleAddBgColor}
            onAddGradientColor={handleAddGradientColor}
            onBgAngleChange={handleBgAngleChange}
            onBgColorChange={handleBgColorChange}
            onBgColorsChange={handleBgColorsChange}
            onBgTypeChange={handleBgTypeChange}
            onFillTypeChange={handleFillTypeChange}
            onGradientAngleChange={handleGradientAngleChange}
            onGradientColorsChange={handleGradientColorsChange}
            onHeightChange={handleHeightChange}
            onPatternAngleChange={handlePatternAngleChange}
            onPatternColorChange={handlePatternColorChange}
            onPatternSizeChange={handlePatternSizeChange}
            onPatternTypeChange={handlePatternTypeChange}
            onRandomize={handleRandomize}
            onRemoveBgColor={handleRemoveBgColor}
            onRemoveGradientColor={handleRemoveGradientColor}
            onSizePresetChange={handleSizePresetChange}
            onSolidColorChange={handleSolidColorChange}
            onWidthChange={handleWidthChange}
            patternAngle={patternAngle}
            patternColor={patternColor}
            patternIsCustomAngle={patternIsCustomAngle}
            patternSize={patternSize}
            patternType={patternType}
            selectedAngle={selectedAngle}
            sizePreset={sizePreset}
            solidColor={solidColor}
            width={width}
          />
        </TabsContent>
        <TabsContent
          value="preview"
          forceMount
          className="flex-1 pt-4 min-h-0 overflow-auto data-[state=inactive]:hidden"
        >
          <OutputSection
            canvasRef={canvasRef}
            copied={copied}
            fillType={fillType}
            format={format}
            gradientAngle={gradientAngle}
            gradientColors={gradientColors}
            height={height}
            isMobile={true}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onFormatChange={handleFormatChange}
            patternType={patternType}
            solidColor={solidColor}
            width={width}
          />
        </TabsContent>
      </Tabs>
    );
  }

  // Desktop Layout
  return (
    <div className="h-full flex gap-8">
      <div className="w-[280px] shrink-0 overflow-y-auto max-h-[calc(100vh-6rem)] pb-4">
        <InputControls
          bgAngle={bgAngle}
          bgColor={bgColor}
          bgColors={bgColors}
          bgIsCustomAngle={bgIsCustomAngle}
          bgType={bgType}
          customAngle={customAngle}
          fillType={fillType}
          gradientColors={gradientColors}
          height={height}
          isCustomAngle={isCustomAngle}
          onAddBgColor={handleAddBgColor}
          onAddGradientColor={handleAddGradientColor}
          onBgAngleChange={handleBgAngleChange}
          onBgColorChange={handleBgColorChange}
          onBgColorsChange={handleBgColorsChange}
          onBgTypeChange={handleBgTypeChange}
          onFillTypeChange={handleFillTypeChange}
          onGradientAngleChange={handleGradientAngleChange}
          onGradientColorsChange={handleGradientColorsChange}
          onHeightChange={handleHeightChange}
          onPatternAngleChange={handlePatternAngleChange}
          onPatternColorChange={handlePatternColorChange}
          onPatternSizeChange={handlePatternSizeChange}
          onPatternTypeChange={handlePatternTypeChange}
          onRandomize={handleRandomize}
          onRemoveBgColor={handleRemoveBgColor}
          onRemoveGradientColor={handleRemoveGradientColor}
          onSizePresetChange={handleSizePresetChange}
          onSolidColorChange={handleSolidColorChange}
          onWidthChange={handleWidthChange}
          patternAngle={patternAngle}
          patternColor={patternColor}
          patternIsCustomAngle={patternIsCustomAngle}
          patternSize={patternSize}
          patternType={patternType}
          selectedAngle={selectedAngle}
          sizePreset={sizePreset}
          solidColor={solidColor}
          width={width}
        />
      </div>

      <div className="flex-1 min-w-0 max-h-[calc(100vh-6rem)]">
        <OutputSection
          canvasRef={canvasRef}
          copied={copied}
          fillType={fillType}
          format={format}
          gradientAngle={gradientAngle}
          gradientColors={gradientColors}
          height={height}
          isMobile={false}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onFormatChange={handleFormatChange}
          patternType={patternType}
          solidColor={solidColor}
          width={width}
        />
      </div>
    </div>
  );
}

// Route export
export const Route = createFileRoute('/generate/image')({
  component: ImagePage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const validFillTypes: FillType[] = ['solid', 'gradient', 'pattern'];
    const validPatternTypes: PatternType[] = [
      'stripes',
      'checkerboard',
      'dots',
      'grid',
      'waves',
      'zigzag',
      'triangles',
      'noise',
    ];
    const validFormats: ImageFormat[] = ['png', 'jpeg', 'webp'];
    const validBgTypes: BackgroundType[] = ['solid', 'gradient'];

    return {
      size: typeof search.size === 'string' ? search.size : undefined,
      w:
        typeof search.w === 'number'
          ? Math.min(8192, Math.max(1, search.w))
          : typeof search.w === 'string' && !isNaN(Number(search.w))
            ? Math.min(8192, Math.max(1, Number(search.w)))
            : undefined,
      h:
        typeof search.h === 'number'
          ? Math.min(8192, Math.max(1, search.h))
          : typeof search.h === 'string' && !isNaN(Number(search.h))
            ? Math.min(8192, Math.max(1, Number(search.h)))
            : undefined,
      fill: validFillTypes.includes(search.fill as FillType)
        ? (search.fill as FillType)
        : undefined,
      // Solid
      s_color: typeof search.s_color === 'string' ? search.s_color : undefined,
      // Gradient
      g_colors: typeof search.g_colors === 'string' ? search.g_colors : undefined,
      g_angle:
        typeof search.g_angle === 'number'
          ? search.g_angle
          : typeof search.g_angle === 'string' && !isNaN(Number(search.g_angle))
            ? Number(search.g_angle)
            : undefined,
      // Pattern
      p_type: validPatternTypes.includes(search.p_type as PatternType)
        ? (search.p_type as PatternType)
        : undefined,
      p_size:
        typeof search.p_size === 'number'
          ? Math.min(100, Math.max(5, search.p_size))
          : typeof search.p_size === 'string' && !isNaN(Number(search.p_size))
            ? Math.min(100, Math.max(5, Number(search.p_size)))
            : undefined,
      p_angle:
        typeof search.p_angle === 'number'
          ? search.p_angle
          : typeof search.p_angle === 'string' && !isNaN(Number(search.p_angle))
            ? Number(search.p_angle)
            : undefined,
      p_color: typeof search.p_color === 'string' ? search.p_color : undefined,
      // Pattern background
      bg_type: validBgTypes.includes(search.bg_type as BackgroundType)
        ? (search.bg_type as BackgroundType)
        : undefined,
      bg_color: typeof search.bg_color === 'string' ? search.bg_color : undefined,
      bg_colors: typeof search.bg_colors === 'string' ? search.bg_colors : undefined,
      bg_angle:
        typeof search.bg_angle === 'number'
          ? search.bg_angle
          : typeof search.bg_angle === 'string' && !isNaN(Number(search.bg_angle))
            ? Number(search.bg_angle)
            : undefined,
      format: validFormats.includes(search.format as ImageFormat)
        ? (search.format as ImageFormat)
        : undefined,
    };
  },
});
