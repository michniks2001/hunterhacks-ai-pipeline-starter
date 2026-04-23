import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function AccordionItem({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <details
      className={cn(
        'group border-b border-zinc-200 py-2 last:border-b-0 dark:border-zinc-800',
        className,
      )}
    >
      <summary className="cursor-pointer list-none font-medium text-zinc-900 outline-none marker:content-none dark:text-zinc-100 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          {title}
          <span className="text-xs text-zinc-400 transition-transform group-open:rotate-180">▼</span>
        </span>
      </summary>
      <div className="pb-1 pt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {children}
      </div>
    </details>
  )
}
