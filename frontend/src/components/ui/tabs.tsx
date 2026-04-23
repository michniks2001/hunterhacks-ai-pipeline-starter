import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

type TabsCtx = {
  value: string
  setValue: (v: string) => void
  baseId: string
}

const TabsContext = createContext<TabsCtx | null>(null)

function useTabs() {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>')
  return ctx
}

export function Tabs({
  defaultValue,
  className,
  children,
}: {
  defaultValue: string
  className?: string
  children: ReactNode
}) {
  const baseId = useId()
  const [value, setValue] = useState(defaultValue)
  const memo = useMemo(
    () => ({ value, setValue, baseId }),
    [value, baseId],
  )
  return (
    <TabsContext.Provider value={memo}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-9 items-center justify-start rounded-lg bg-zinc-100 p-1 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: ReactNode
}) {
  const { value: active, setValue, baseId } = useTabs()
  const selected = active === value
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setValue(value)
      }
    },
    [setValue, value],
  )
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      id={`${baseId}-tab-${value}`}
      tabIndex={selected ? 0 : -1}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-600',
        selected
          ? 'bg-white text-zinc-950 shadow dark:bg-zinc-950 dark:text-zinc-50'
          : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100',
        className,
      )}
      onClick={() => setValue(value)}
      onKeyDown={onKeyDown}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string
  className?: string
  children: ReactNode
}) {
  const { value: active, baseId } = useTabs()
  if (active !== value) return null
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      className={cn('mt-4 ring-offset-white focus-visible:outline-none dark:ring-offset-zinc-950', className)}
    >
      {children}
    </div>
  )
}
