import type { CSSProperties } from 'react'

import type { NeighborhoodExperience } from '@/lib/api'
import { ExperienceBlockView } from '@/components/experience-blocks'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type Palette = NeighborhoodExperience['colorPalette']

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

function paletteVars(p: Palette): CSSProperties {
  return {
    ['--nb-bg' as string]: p.background,
    ['--nb-fg' as string]: p.text,
    ['--nb-primary' as string]: p.primary,
    ['--nb-secondary' as string]: p.secondary,
    ['--nb-accent' as string]: p.accent,
  }
}

type DynamicNeighborhoodPageProps = {
  experience: NeighborhoodExperience
  source: string
  htmlPageUrl: string
  pageMode?: 'dataset' | 'freeform'
  className?: string
}

export function DynamicNeighborhoodPage({
  experience,
  source,
  htmlPageUrl,
  pageMode = 'dataset',
  className,
}: DynamicNeighborhoodPageProps) {
  const p = experience.colorPalette

  return (
    <div
      className={cn('min-w-0 rounded-2xl border shadow-lg', className)}
      style={{
        ...paletteVars(p),
        background: p.background,
        color: p.text,
        borderColor: `color-mix(in srgb, ${p.secondary} 55%, transparent)`,
      }}
    >
      <div className="border-b px-6 py-8 sm:px-10 sm:py-10" style={{ borderColor: p.secondary }}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-current/30 bg-transparent"
            style={{ color: p.accent }}
          >
            {experience.borough}
          </Badge>
          <Badge
            variant="outline"
            className="border-current/30 bg-transparent"
            style={{ color: p.text }}
          >
            {experience.visualStyle}
          </Badge>
          {pageMode === 'freeform' ? (
            <Badge variant="outline" className="border-amber-500/50 text-amber-900 dark:text-amber-200">
              Model knowledge
            </Badge>
          ) : (
            <Badge variant="outline" className="border-emerald-600/40 text-emerald-900 dark:text-emerald-200">
              Curated JSON
            </Badge>
          )}
          <Badge variant="secondary" className="ml-auto capitalize">
            {source}
          </Badge>
        </div>
        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-5xl">
          {experience.headline}
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-base opacity-90 sm:text-lg">
          {experience.subheadline}
        </p>
        <p className="mt-3 text-sm opacity-75">
          {experience.byline}
          {experience.readingTimeNote ? ` · ${experience.readingTimeNote}` : ''}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            className="inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium shadow"
            style={{ background: p.primary, color: p.background }}
            href={htmlPageUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open server-rendered HTML
          </a>
        </div>
      </div>

      <div className="space-y-10 px-6 py-10 sm:px-10 sm:py-12">
        <section aria-labelledby="longform-bio">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2
              id="longform-bio"
              className="text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: p.primary }}
            >
              In depth
            </h2>
            <span className="text-xs opacity-70">{experience.neighborhoodName}</span>
          </div>
          <Separator className="my-4 opacity-40" style={{ backgroundColor: p.secondary }} />
          <BioBody text={experience.bio} className="max-w-3xl" />
        </section>

        <section aria-labelledby="generated-ui" className="space-y-8">
          <div>
            <h2
              id="generated-ui"
              className="text-sm font-semibold uppercase tracking-[0.18em]"
              style={{ color: p.primary }}
            >
              Generated layout ({experience.blocks.length} blocks)
            </h2>
            <p className="mt-2 max-w-3xl text-sm opacity-80">
              Each block picks one of several component recipes (tabs, tables, avatars, alerts,
              accordions, …) using a stable hash of the block and its index—so the page stays
              dynamic but does not reshuffle on every render.
              {pageMode === 'freeform'
                ? ' Content is model knowledge for places outside the sample list.'
                : ' Content is grounded in the sample JSON where applicable.'}
            </p>
          </div>
          <div className="space-y-8">
            {experience.blocks.map((block, i) => (
              <div key={`${block.type}-${i}`}>
                <ExperienceBlockView block={block} palette={p} blockIndex={i} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
