import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-600" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-500" />,
        error: <OctagonXIcon className="size-4 text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          description: '!text-current !opacity-80',
          error:
            '!bg-red-50 !border-red-200 !text-red-900 dark:!bg-red-950 dark:!border-red-800 dark:!text-red-100',
          success:
            '!bg-green-50 !border-green-200 !text-green-900 dark:!bg-green-950 dark:!border-green-800 dark:!text-green-100',
          warning:
            '!bg-amber-50 !border-amber-200 !text-amber-900 dark:!bg-amber-950 dark:!border-amber-800 dark:!text-amber-100',
        },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
