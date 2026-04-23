import type { NeighborhoodExperience, UIBlock } from '@/lib/api'
import { AccordionItem } from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type Palette = NeighborhoodExperience['colorPalette']

/** Stable 0..mod-1 from block fields + index so layouts vary but do not flicker on re-render. */
function layoutVariant(block: UIBlock, index: number, mod: number): number {
  const seed = `${block.type}\0${block.title}\0${block.kicker}\0${index}`
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) % mod
}

function decorativePercent(block: UIBlock, index: number): number {
  return 35 + (layoutVariant(block, index, 56) % 56)
}

function initialsFrom(text: string): string {
  const t = text.trim() || '?'
  const w = t.split(/\s+/).filter(Boolean)
  if (w.length >= 2) {
    return (w[0]!.slice(0, 1) + w[1]!.slice(0, 1)).toUpperCase()
  }
  return t.slice(0, 2).toUpperCase()
}

function BioBody({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\n\n+/).map((s) => s.trim()).filter(Boolean)
  return (
    <div className={cn('space-y-4 text-pretty leading-relaxed', className)}>
      {parts.map((para, idx) => (
        <p key={idx} className="text-[1.02rem] opacity-[0.95]">
          {para}
        </p>
      ))}
    </div>
  )
}

export function ExperienceBlockView({
  block,
  palette,
  blockIndex,
}: {
  block: UIBlock
  palette: Palette
  blockIndex: number
}) {
  const v = (mod: number) => layoutVariant(block, blockIndex, mod)
  const accentBorder = { borderColor: palette.secondary }

  switch (block.type) {
    case 'hero': {
      const variant = v(3)
      if (variant === 1) {
        return (
          <section
            className="rounded-2xl border px-6 py-10 sm:px-10"
            style={{
              ...accentBorder,
              background: `color-mix(in srgb, ${palette.primary} 10%, ${palette.background})`,
              color: palette.text,
            }}
          >
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <Avatar
                className="size-20 border-2 text-lg"
                style={{
                  borderColor: palette.accent,
                  background: `color-mix(in srgb, ${palette.accent} 15%, ${palette.background})`,
                }}
              >
                <AvatarFallback style={{ color: palette.text }}>
                  {initialsFrom(block.title || block.kicker || block.body)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                {block.kicker ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
                    {block.kicker}
                  </p>
                ) : null}
                {block.title ? (
                  <h2 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                    {block.title}
                  </h2>
                ) : null}
                {block.subtitle ? (
                  <p className="mt-2 max-w-2xl text-base opacity-85">{block.subtitle}</p>
                ) : null}
                {block.body ? <p className="mt-3 max-w-2xl text-sm">{block.body}</p> : null}
              </div>
            </div>
            <div className="mt-8 space-y-2">
              <Progress
                value={decorativePercent(block, blockIndex)}
                className="bg-zinc-200/80 dark:bg-zinc-800/80"
                indicatorStyle={{ background: palette.primary }}
              />
              <Progress
                value={30 + (v(41) % 41)}
                className="h-1.5 bg-zinc-200/60 dark:bg-zinc-800/60"
                indicatorStyle={{ background: palette.accent }}
              />
            </div>
          </section>
        )
      }
      if (variant === 2) {
        return (
          <section
            className="overflow-hidden rounded-2xl border"
            style={{
              ...accentBorder,
              background: palette.background,
              color: palette.text,
            }}
          >
            <div className="grid grid-cols-3 gap-0.5 p-1">
              {[72, 45, 88].map((base, i) => (
                <Progress
                  key={i}
                  value={(base + v(20)) % 100}
                  className="h-1 rounded-none bg-zinc-200 dark:bg-zinc-800"
                  indicatorStyle={{
                    background: i === 1 ? palette.accent : palette.primary,
                  }}
                />
              ))}
            </div>
            <div className="px-6 py-10 sm:px-12 sm:py-12">
              {block.kicker ? (
                <Badge variant="outline" className="border-current/30 bg-transparent">
                  {block.kicker}
                </Badge>
              ) : null}
              {block.title ? (
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  {block.title}
                </h2>
              ) : null}
              {block.subtitle ? (
                <p className="mt-2 max-w-2xl text-base opacity-85">{block.subtitle}</p>
              ) : null}
              {block.body ? <p className="mt-4 max-w-2xl text-sm leading-relaxed">{block.body}</p> : null}
            </div>
          </section>
        )
      }
      return (
        <section
          className="rounded-2xl border px-6 py-10 sm:px-12 sm:py-12"
          style={{
            ...accentBorder,
            background: `color-mix(in srgb, ${palette.primary} 12%, ${palette.background})`,
            color: palette.text,
          }}
        >
          {block.kicker ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
              {block.kicker}
            </p>
          ) : null}
          {block.title ? (
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{block.title}</h2>
          ) : null}
          {block.subtitle ? (
            <p className="mt-2 max-w-2xl text-base opacity-85">{block.subtitle}</p>
          ) : null}
          {block.body ? <p className="mt-4 max-w-2xl text-base">{block.body}</p> : null}
        </section>
      )
    }
    case 'intro_columns': {
      const variant = v(3)
      if (variant === 1) {
        return (
          <Tabs defaultValue="a" className="w-full">
            <TabsList className="w-full justify-start sm:w-auto">
              <TabsTrigger value="a">{block.title || 'Column A'}</TabsTrigger>
              <TabsTrigger value="b">{block.subtitle || 'Column B'}</TabsTrigger>
            </TabsList>
            <TabsContent value="a">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {block.body}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="b">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {block.bodySecondary}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )
      }
      if (variant === 2) {
        return (
          <div className="space-y-4">
            <Alert variant="info">
              <AlertTitle>Dual column</AlertTitle>
              <AlertDescription>{block.kicker || 'Two perspectives on the same place.'}</AlertDescription>
            </Alert>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-zinc-200/80 dark:border-zinc-800">
                <CardHeader>
                  {block.title ? <CardTitle>{block.title}</CardTitle> : null}
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {block.body}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-zinc-200/80 dark:border-zinc-800">
                <CardHeader>
                  {block.subtitle ? <CardTitle>{block.subtitle}</CardTitle> : null}
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    {block.bodySecondary}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
      }
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-zinc-200/80 bg-white/70 dark:border-zinc-800 dark:bg-zinc-950/50">
            <CardHeader>
              {block.title ? <CardTitle>{block.title}</CardTitle> : null}
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{block.body}</p>
            </CardContent>
          </Card>
          <Card className="border-zinc-200/80 bg-white/70 dark:border-zinc-800 dark:bg-zinc-950/50">
            <CardHeader>
              {block.subtitle ? <CardTitle>{block.subtitle}</CardTitle> : null}
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {block.bodySecondary}
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }
    case 'bio_panel': {
      const variant = v(3)
      if (variant === 1) {
        return (
          <div className="space-y-4">
            <Alert variant="default" className="border-zinc-300 dark:border-zinc-700">
              <AlertTitle>{block.title || 'Long read'}</AlertTitle>
              <AlertDescription>{block.kicker || 'Editorial panel'}</AlertDescription>
            </Alert>
            <Card
              className="border-0 shadow-md"
              style={{
                background: `color-mix(in srgb, ${palette.secondary} 10%, ${palette.background})`,
                color: palette.text,
              }}
            >
              <CardContent className="pt-6">
                <BioBody text={block.body} />
              </CardContent>
            </Card>
          </div>
        )
      }
      if (variant === 2) {
        return (
          <Card
            className="border-0 shadow-md"
            style={{
              background: `color-mix(in srgb, ${palette.secondary} 8%, ${palette.background})`,
              color: palette.text,
            }}
          >
            {block.title ? (
              <CardHeader>
                <CardTitle className="text-xl">{block.title}</CardTitle>
              </CardHeader>
            ) : null}
            <CardContent>
              <div className="columns-1 gap-8 sm:columns-2">
                <BioBody text={block.body} />
              </div>
            </CardContent>
          </Card>
        )
      }
      return (
        <Card
          className="border-0 shadow-md"
          style={{
            background: `color-mix(in srgb, ${palette.secondary} 10%, ${palette.background})`,
            color: palette.text,
          }}
        >
          <CardHeader>
            {block.title ? <CardTitle className="text-xl">{block.title}</CardTitle> : null}
          </CardHeader>
          <CardContent>
            <BioBody text={block.body} />
          </CardContent>
        </Card>
      )
    }
    case 'fact_grid': {
      const variant = v(3)
      if (variant === 1) {
        return (
          <Card>
            <CardContent className="p-0 pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Topic</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {block.items.map((item) => (
                    <TableRow key={`${item.label}-${item.text.slice(0, 20)}`}>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell>{item.text}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      }
      if (variant === 2) {
        return (
          <ul className="space-y-3">
            {block.items.map((item, i) => (
              <li
                key={`${item.label}-${item.text.slice(0, 20)}`}
                className="flex gap-4 rounded-xl border border-zinc-200/90 p-4 dark:border-zinc-800"
              >
                <Avatar
                  className="size-11 shrink-0"
                  style={{
                    borderColor: palette.accent,
                    background: `color-mix(in srgb, ${palette.accent} 12%, white)`,
                  }}
                >
                  <AvatarFallback className="text-[0.65rem]" style={{ color: palette.text }}>
                    {initialsFrom(item.label)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.text}</p>
                  <Progress
                    value={40 + ((i * 17 + v(30)) % 45)}
                    className="mt-3 max-w-xs"
                    indicatorStyle={{ background: palette.primary }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )
      }
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {block.items.map((item) => (
            <Card
              key={`${item.label}-${item.text.slice(0, 24)}`}
              className="overflow-hidden border-zinc-200/90 dark:border-zinc-800"
              style={{ borderTop: `3px solid ${palette.accent}` }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
                {item.text}
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }
    case 'split_story': {
      const variant = v(3)
      if (variant === 1) {
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                {block.title ? <CardTitle>{block.title}</CardTitle> : null}
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {block.body}
                </p>
              </CardContent>
            </Card>
            <div
              className="rounded-xl border-l-4 px-5 py-6"
              style={{ borderLeftColor: palette.accent, background: palette.background }}
            >
              {block.subtitle ? (
                <h3 className="text-lg font-semibold tracking-tight">{block.subtitle}</h3>
              ) : null}
              <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {block.bodySecondary}
              </p>
            </div>
          </div>
        )
      }
      if (variant === 2) {
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <Alert variant="info">
              <AlertTitle>{block.title || 'Thread A'}</AlertTitle>
              <AlertDescription>{block.body}</AlertDescription>
            </Alert>
            <Alert variant="default">
              <AlertTitle>{block.subtitle || 'Thread B'}</AlertTitle>
              <AlertDescription>{block.bodySecondary}</AlertDescription>
            </Alert>
          </div>
        )
      }
      return (
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div>
            {block.title ? (
              <h3 className="text-lg font-semibold tracking-tight">{block.title}</h3>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {block.body}
            </p>
          </div>
          <div>
            {block.subtitle ? (
              <h3 className="text-lg font-semibold tracking-tight">{block.subtitle}</h3>
            ) : null}
            <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {block.bodySecondary}
            </p>
          </div>
        </div>
      )
    }
    case 'pull_quote': {
      const variant = v(3)
      if (variant === 1) {
        return (
          <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800">
            <span
              className="pointer-events-none absolute left-3 top-0 select-none font-serif text-7xl leading-none opacity-10"
              style={{ color: palette.primary }}
              aria-hidden
            >
              “
            </span>
            <CardContent className="relative pt-10">
              <blockquote className="text-xl font-semibold leading-snug sm:text-2xl">
                {block.body}
              </blockquote>
              {block.kicker ? (
                <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{block.kicker}</p>
              ) : null}
            </CardContent>
          </Card>
        )
      }
      if (variant === 2) {
        return (
          <Alert variant="info" className="border-l-4" style={{ borderLeftColor: palette.accent }}>
            <AlertTitle>{block.kicker || 'Pull quote'}</AlertTitle>
            <AlertDescription className="text-base font-medium leading-snug text-zinc-900 dark:text-zinc-100">
              {block.body}
            </AlertDescription>
          </Alert>
        )
      }
      return (
        <figure
          className="rounded-2xl border-l-4 px-6 py-8 sm:px-10"
          style={{
            borderLeftColor: palette.accent,
            background: `color-mix(in srgb, ${palette.accent} 8%, ${palette.background})`,
            color: palette.text,
          }}
        >
          <blockquote className="text-xl font-semibold leading-snug sm:text-2xl">
            {block.body}
          </blockquote>
          {block.kicker ? (
            <figcaption className="mt-4 text-sm opacity-75">{block.kicker}</figcaption>
          ) : null}
        </figure>
      )
    }
    case 'timeline': {
      const variant = v(3)
      if (variant === 1) {
        return (
          <Card>
            <CardHeader>
              {block.title ? <CardTitle>{block.title}</CardTitle> : null}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beat</TableHead>
                    <TableHead>Narrative</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {block.items.map((item) => (
                    <TableRow key={`${item.label}-${item.text.slice(0, 16)}`}>
                      <TableCell className="whitespace-nowrap font-medium">{item.label}</TableCell>
                      <TableCell>{item.text}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )
      }
      if (variant === 2) {
        return (
          <Card>
            <CardHeader>
              {block.title ? <CardTitle>{block.title}</CardTitle> : null}
            </CardHeader>
            <CardContent>
              <ol className="space-y-5 border-l-2 border-dashed pl-6 dark:border-zinc-700">
                {block.items.map((item, i) => (
                  <li
                    key={`${item.label}-${item.text.slice(0, 16)}`}
                    className="relative -translate-x-px"
                  >
                    <span
                      className="absolute -left-[1.35rem] top-1 flex size-6 items-center justify-center rounded-full border-2 bg-white text-[10px] font-bold dark:bg-zinc-950"
                      style={{ borderColor: palette.accent, color: palette.accent }}
                    >
                      {i + 1}
                    </span>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.label}</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.text}</p>
                    <Progress
                      value={32 + ((i * 13 + v(40)) % 40)}
                      className="mt-3 max-w-sm"
                      indicatorStyle={{ background: palette.accent }}
                    />
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )
      }
      return (
        <Card>
          <CardHeader>
            {block.title ? <CardTitle>{block.title}</CardTitle> : null}
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
              {block.items.map((item) => (
                <div key={`${item.label}-${item.text.slice(0, 16)}`}>
                  <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.text}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )
    }
    case 'insight_list': {
      const variant = v(3)
      if (variant === 1 && block.bullets.length > 0) {
        const maxAcc = Math.min(block.bullets.length, 6)
        return (
          <Card>
            <CardHeader>
              {block.title ? <CardTitle>{block.title}</CardTitle> : null}
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {block.bullets.slice(0, maxAcc).map((b) => (
                <AccordionItem key={b.slice(0, 48)} title={b.slice(0, 72) + (b.length > 72 ? '…' : '')}>
                  <span className="text-zinc-600 dark:text-zinc-400">{b}</span>
                </AccordionItem>
              ))}
            </CardContent>
          </Card>
        )
      }
      if (variant === 2) {
        return (
          <Card>
            <CardHeader>
              {block.title ? <CardTitle>{block.title}</CardTitle> : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {block.bullets.map((b) => (
                  <Badge key={b.slice(0, 40)} variant="secondary" className="font-normal">
                    {b.slice(0, 40)}
                    {b.length > 40 ? '…' : ''}
                  </Badge>
                ))}
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {block.bullets.map((b) => (
                  <li key={b.slice(0, 40)}>{b}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      }
      return (
        <Card>
          <CardHeader>
            {block.title ? <CardTitle>{block.title}</CardTitle> : null}
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {block.bullets.map((b) => (
                <li key={b.slice(0, 40)}>{b}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )
    }
    case 'cta_band': {
      const variant = v(3)
      if (variant === 1) {
        return (
          <div
            className="rounded-2xl px-6 py-8 sm:px-10"
            style={{
              background: `color-mix(in srgb, ${palette.primary} 16%, ${palette.background})`,
              color: palette.text,
              border: `1px solid color-mix(in srgb, ${palette.primary} 35%, transparent)`,
            }}
          >
            {block.kicker ? (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                {block.kicker}
              </p>
            ) : null}
            {block.title ? (
              <h3 className="mt-2 text-2xl font-bold tracking-tight">{block.title}</h3>
            ) : null}
            <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-90">{block.body}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" size="sm" style={{ background: palette.primary, color: palette.background }}>
                Explore
              </Button>
              <Button type="button" size="sm" variant="outline" className="border-zinc-400 bg-white/80 dark:bg-zinc-950/80">
                Share
              </Button>
            </div>
          </div>
        )
      }
      if (variant === 2) {
        return (
          <Alert variant="destructive" className="border-2">
            <AlertTitle>{block.title || 'Call to action'}</AlertTitle>
            <AlertDescription className="text-base">{block.body}</AlertDescription>
            {block.kicker ? (
              <p className="mt-2 text-xs uppercase tracking-wide opacity-90">{block.kicker}</p>
            ) : null}
          </Alert>
        )
      }
      return (
        <div
          className="rounded-2xl px-6 py-8 sm:px-10"
          style={{
            background: `color-mix(in srgb, ${palette.primary} 16%, ${palette.background})`,
            color: palette.text,
            border: `1px solid color-mix(in srgb, ${palette.primary} 35%, transparent)`,
          }}
        >
          {block.kicker ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
              {block.kicker}
            </p>
          ) : null}
          {block.title ? (
            <h3 className="mt-2 text-2xl font-bold tracking-tight">{block.title}</h3>
          ) : null}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-90">{block.body}</p>
        </div>
      )
    }
    default:
      return null
  }
}
