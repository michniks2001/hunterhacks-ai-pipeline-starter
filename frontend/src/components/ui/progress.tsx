import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type ProgressProps = HTMLAttributes<HTMLDivElement> & {
  value: number
  indicatorClassName?: string
  indicatorStyle?: CSSProperties
}

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      indicatorClassName,
      indicatorStyle,
      style,
      ...props
    },
    ref,
  ) => {
    const clamped = Math.min(100, Math.max(0, value))
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800',
          className,
        )}
        style={style}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full bg-zinc-900 transition-all duration-500 ease-out dark:bg-zinc-100',
            indicatorClassName,
          )}
          style={{ width: `${clamped}%`, ...indicatorStyle }}
        />
      </div>
    )
  },
)
Progress.displayName = 'Progress'
