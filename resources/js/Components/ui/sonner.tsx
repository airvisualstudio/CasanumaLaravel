import React from 'react';
import { Toaster as Sonner, toast } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl text-xs font-medium',
          description: 'group-[.toast]:text-muted-foreground text-xs',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs',
          success: 'group-[.toaster]:border-emerald-500/30 group-[.toaster]:text-emerald-700 dark:group-[.toaster]:text-emerald-300',
          error: 'group-[.toaster]:border-destructive/30 group-[.toaster]:text-destructive',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
