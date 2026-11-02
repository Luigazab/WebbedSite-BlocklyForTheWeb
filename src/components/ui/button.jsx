import * as React from "react"
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-all! focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-wide",
  {
    variants: {
      variant: {
        locked: "bg-muted text-muted-foreground shadow-[0_4px_0_0_var(--border)] cursor-not-allowed opacity-75",
        default: "bg-card text-muted-foreground border border-border shadow-[0_4px_0_0_var(--border)] hover:shadow-[0_5px_0_0_var(--border)] hover:-translate-y-px hover:bg-muted active:translate-y-[4px] active:shadow-none",
        primary: "bg-primary text-primary-foreground shadow-[0_6px_0_0_var(--primary-depth)] hover:-translate-y-px hover:shadow-[0_7px_0_0_var(--primary-depth)] active:translate-y-[6px] active:shadow-none",
        primaryOutline: "bg-background border-2 border-primary text-primary hover:bg-brand-200 dark:hover:bg-brand-900/20",
        secondary: "bg-secondary text-secondary-foreground shadow-[0_6px_0_0_var(--secondary-depth)] hover:-translate-y-px hover:shadow-[0_7px_0_0_var(--secondary-depth)] active:translate-y-[6px] active:shadow-none",
        secondaryOutline: "bg-background border-2 border-sun-700 text-sun-700 hover:bg-sun-50 dark:hover:bg-sun-700/10",
        success: "bg-success text-white shadow-[0_6px_0_0_var(--success-depth)] hover:-translate-y-px hover:shadow-[0_7px_0_0_var(--success-depth)] active:translate-y-[6px] active:shadow-none",
        successOutline: "bg-background border-2 border-success text-success hover:bg-leaf-50 dark:hover:bg-leaf-700/10",
        danger: "bg-destructive text-white shadow-[0_6px_0_0_var(--destructive-depth)] hover:-translate-y-px hover:shadow-[0_7px_0_0_var(--destructive-depth)] active:translate-y-[6px] active:shadow-none",
        dangerOutline: "bg-background border-2 border-destructive text-destructive hover:bg-danger-50 dark:hover:bg-danger-700/10",
        super: "bg-[var(--special)] text-white shadow-[0_6px_0_0_var(--special-depth)] hover:-translate-y-px hover:shadow-[0_7px_0_0_var(--special-depth)] active:translate-y-[6px] active:shadow-none",
        superOutline: "bg-white text-indigo-500 hover:bg-slate-100",
        ghost: "bg-transparent text-slate-500 border-transparent border-0 hover:bg-slate-100",
        sidebar: "bg-transparent text-slate-500 border-2 border-transparent hover:bg-slate-100 transition-none",
        sidebarOutline: "bg-sky-500/15 text-sky-500 border-sky-300 border-2 hover:bg-sky-500/20 transition-none",
        formalPlain: "bg-card rounded-xl py-5 text-muted-foreground border border-border shadow hover:bg-muted hover:scale-101",
        formalPrimary: "bg-primary rounded-xl py-5 text-primary-foreground shadow hover:bg-primary-800 hover:scale-101"
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-10 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
