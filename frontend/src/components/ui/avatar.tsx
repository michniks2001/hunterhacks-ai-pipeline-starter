import { forwardRef, type HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export const Avatar = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'relative flex size-10 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800',
        className,
      )}
      {...props}
    />
  ),
)
Avatar.displayName = 'Avatar'

export const AvatarFallback = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'flex size-full items-center justify-center rounded-full text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-200',
      className,
    )}
    {...props}
  />
))
AvatarFallback.displayName = 'AvatarFallback'
