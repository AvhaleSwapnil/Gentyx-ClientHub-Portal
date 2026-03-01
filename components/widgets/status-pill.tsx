"use client"

import { cn } from "@/lib/utils"

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200",
    "In Review": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
    Approved: "bg-brand-accent/10 text-brand-accent dark:bg-brand-accent/20 dark:text-brand-accent",
    Rejected: "bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-200",
    "Not Started": "bg-muted text-foreground",
    "In Progress": "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
    Completed: "bg-brand-accent/10 text-brand-accent dark:bg-brand-accent/20 dark:text-brand-accent",
    "Needs Fix": "bg-red-100 text-red-900 dark:bg-red-900/20 dark:text-red-200",
    Uploaded: "bg-muted text-foreground",
    Reviewed: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  }
  return <span className={cn("rounded-full px-2 py-0.5 text-xs", map[status] || "bg-muted")}>{status}</span>
}
