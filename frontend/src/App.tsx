import { useCallback, useEffect, useState, type FormEvent } from 'react'

import { DynamicNeighborhoodPage } from '@/components/DynamicNeighborhoodPage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  absoluteApiUrl,
  fetchNeighborhoods,
  generateNeighborhoodExperience,
  type ExperienceApiResponse,
  type NeighborhoodSummary,
} from '@/lib/api'

export default function App() {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodSummary[]>([])
  const [listError, setListError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)

  const [query, setQuery] = useState('')
  const [strictDatasetOnly, setStrictDatasetOnly] = useState(false)
  const [payload, setPayload] = useState<ExperienceApiResponse | null>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [genLoading, setGenLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchNeighborhoods()
      .then((rows) => {
        if (!cancelled) {
          setNeighborhoods(rows)
          setListError(null)
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setListError(e instanceof Error ? e.message : 'Failed to load list')
        }
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const runGenerate = useCallback(async (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) {
      setGenError('Enter a neighborhood name.')
      return
    }
    setGenLoading(true)
    setGenError(null)
    setPayload(null)
    try {
      const res = await generateNeighborhoodExperience(trimmed, {
        strictDatasetMatch: strictDatasetOnly,
      })
      setPayload(res)
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setGenLoading(false)
    }
  }, [strictDatasetOnly])

  const onSubmitForm = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      void runGenerate(query)
    },
    [query, runGenerate],
  )

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 text-left">
          <Badge variant="secondary" className="mb-3">
            NYC neighborhood studio
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Type a neighborhood — get a generated UI
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Names that match the small NYC sample list use that JSON as context. Any
            other place uses a freeform prompt so the model can lean on its general
            knowledge. You get the same structured layout blocks and long bio either way.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
          <aside className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Neighborhood</CardTitle>
                <CardDescription>
                  Sample list: Williamsburg, Flushing, Coney Island—or type any neighborhood
                  (e.g. Capitol Hill, Shibuya) when the strict option is off.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={onSubmitForm}>
                  <label className="sr-only" htmlFor="nb-search">
                    Neighborhood name
                  </label>
                  <input
                    id="nb-search"
                    className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-600"
                    placeholder="e.g. Williamsburg or Montmartre"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                  />
                  <label className="flex cursor-pointer items-start gap-2 text-left text-sm text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-950"
                      checked={strictDatasetOnly}
                      onChange={(e) => setStrictDatasetOnly(e.target.checked)}
                    />
                    <span>
                      Only allow neighborhoods from the curated JSON (404 if no match).
                    </span>
                  </label>
                  <Button type="submit" className="w-full" disabled={genLoading}>
                    {genLoading ? 'Calling model…' : 'Generate experience'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Quick fill
              </h2>
              {listLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              )}
              {listError && (
                <p className="text-sm text-red-600 dark:text-red-400">{listError}</p>
              )}
              {!listLoading && !listError && (
                <div className="flex flex-wrap gap-2">
                  {neighborhoods.map((n) => (
                    <Button
                      key={n.key}
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={genLoading}
                      onClick={() => {
                        setQuery(n.name)
                        void runGenerate(n.name)
                      }}
                    >
                      {n.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <section className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Generated page
              </h2>
              {payload && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">
                    {payload.source === 'cache' ? 'Cached' : 'Fresh from LLM'}
                  </Badge>
                  <Badge variant="secondary">Slug: {payload.matchedKey}</Badge>
                  {payload.mode === 'freeform' ? (
                    <Badge variant="outline">General knowledge</Badge>
                  ) : (
                    <Badge variant="outline">Sample JSON</Badge>
                  )}
                </div>
              )}
            </div>

            {genError && (
              <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
                <CardHeader>
                  <CardTitle className="text-red-800 dark:text-red-200">
                    Could not generate
                  </CardTitle>
                  <CardDescription className="text-red-700 dark:text-red-300">
                    {genError}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-800/90 dark:text-red-200/90">
                    {strictDatasetOnly
                      ? 'Turn off “only curated JSON” to generate any neighborhood, or pick a quick-fill chip. '
                      : ''}
                    Ensure{' '}
                    <code className="rounded bg-red-100 px-1 py-0.5 text-xs dark:bg-red-900/60">
                      GROQ_API_KEY
                    </code>{' '}
                    is set on the API for live LLM calls.
                  </p>
                </CardContent>
              </Card>
            )}

            {genLoading && (
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-2/3 max-w-md" />
                  <Skeleton className="mt-2 h-4 w-full max-w-lg" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                </CardContent>
              </Card>
            )}

            {!genLoading && payload && (
              <DynamicNeighborhoodPage
                experience={payload.experience}
                source={payload.source}
                htmlPageUrl={absoluteApiUrl(payload.pageUrl)}
                pageMode={payload.mode === 'freeform' ? 'freeform' : 'dataset'}
              />
            )}

            {!genLoading && !payload && !genError && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>Waiting for input</CardTitle>
                  <CardDescription>
                    Type a neighborhood and submit, or tap a quick-fill chip.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Separator />
                  <p className="pt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    The API returns <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">experience.bio</code> plus{' '}
                    <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">experience.blocks</code> with types like{' '}
                    <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">fact_grid</code>,{' '}
                    <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">timeline</code>, and{' '}
                    <code className="rounded bg-zinc-100 px-1 text-xs dark:bg-zinc-900">pull_quote</code>—each rendered with a distinct layout here.
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
