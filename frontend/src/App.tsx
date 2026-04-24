import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'

import { DynamicNeighborhoodPage } from '@/components/DynamicNeighborhoodPage'
import { AccordionItem } from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  absoluteApiUrl,
  clearCache,
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
  const [userContext, setUserContext] = useState('')
  const [strictDatasetOnly, setStrictDatasetOnly] = useState(false)
  const [payload, setPayload] = useState<ExperienceApiResponse | null>(null)
  const [genError, setGenError] = useState<string | null>(null)
  const [genLoading, setGenLoading] = useState(false)
  const [cacheMessage, setCacheMessage] = useState<string | null>(null)
  const [cacheBusy, setCacheBusy] = useState(false)
  const [cacheError, setCacheError] = useState<string | null>(null)

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
        userContext: userContext.trim() || undefined,
      })
      setPayload(res)
    } catch (e: unknown) {
      setGenError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setGenLoading(false)
    }
  }, [strictDatasetOnly, userContext])

  const onClearCache = useCallback(async () => {
    setCacheBusy(true)
    setCacheError(null)
    setCacheMessage(null)
    try {
      const res = await clearCache()
      setCacheMessage(res.message)
    } catch (e: unknown) {
      setCacheError(e instanceof Error ? e.message : 'Failed to clear cache')
    } finally {
      setCacheBusy(false)
    }
  }, [])

  const onSubmitForm = useCallback(
    (e: FormEvent) => {
      e.preventDefault()
      void runGenerate(query)
    },
    [query, runGenerate],
  )

  const prettyContext = useMemo(
    () => JSON.stringify(payload?.pipelineTrace.contextUsed ?? {}, null, 2),
    [payload?.pipelineTrace.contextUsed],
  )
  const prettyExperience = useMemo(
    () => JSON.stringify(payload?.experience ?? {}, null, 2),
    [payload?.experience],
  )

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 text-left">
          <Badge variant="secondary" className="mb-3">
            Neighborhood AI pipeline demo
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Type a neighborhood and watch the pipeline work
          </h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            This demo shows a real AI pipeline: user input, context lookup, model output,
            normalization checks, and rendered UI.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-start">
          <aside className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Neighborhood</CardTitle>
                <CardDescription>
                  Try sample NYC neighborhoods first (Astoria, Harlem, DUMBO), then compare
                  with a freeform place.
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
                  <div className="space-y-1">
                    <label
                      htmlFor="nb-context"
                      className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
                    >
                      Optional design direction
                    </label>
                    <textarea
                      id="nb-context"
                      className="min-h-24 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-600"
                      placeholder="Make it feel like a late-night food crawl with neon signs and bold colors."
                      value={userContext}
                      onChange={(e) => setUserContext(e.target.value)}
                    />
                  </div>
                  <label className="flex cursor-pointer items-start gap-2 text-left text-sm text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-950"
                      checked={strictDatasetOnly}
                      onChange={(e) => setStrictDatasetOnly(e.target.checked)}
                    />
                    <span>
                      Only use curated NYC sample data.
                    </span>
                  </label>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    When this is off, the app can use the model&apos;s general knowledge for
                    places outside the sample dataset. For the clearest pipeline demo, use
                    curated NYC examples.
                  </p>
                  <Button type="submit" className="w-full" disabled={genLoading}>
                    {genLoading ? 'Calling model…' : 'Generate experience'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={cacheBusy}
                    onClick={() => void onClearCache()}
                  >
                    {cacheBusy ? 'Clearing…' : 'Clear cache'}
                  </Button>
                </form>
              </CardContent>
              {(cacheMessage || cacheError) && (
                <CardFooter>
                  <p
                    className={`text-xs ${
                      cacheError
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {cacheError ?? cacheMessage}
                  </p>
                </CardFooter>
              )}
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
                    <Badge variant="outline">Model/general-knowledge fallback</Badge>
                  ) : (
                    <Badge variant="outline">Dataset mode</Badge>
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
              <>
                {payload.warnings.length > 0 && (
                  <Alert variant="info">
                    <AlertTitle>Pipeline warnings</AlertTitle>
                    <AlertDescription>
                      The app repaired parts of the model output before rendering.
                      <ul className="mt-2 list-disc space-y-1 pl-5">
                        {payload.warnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle>Pipeline Trace</CardTitle>
                    <CardDescription>
                      A beginner-friendly view of what happened for this request.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">User input</p>
                        <p className="text-sm">{payload.pipelineTrace.userInput}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Matched key</p>
                        <p className="text-sm">{payload.pipelineTrace.matchedKey}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Mode</p>
                        <p className="text-sm capitalize">{payload.pipelineTrace.mode}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Source</p>
                        <p className="text-sm capitalize">{payload.pipelineTrace.source}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500">
                        Optional design direction
                      </p>
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">
                        {payload.pipelineTrace.userDesignDirection || 'None provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Context used</p>
                      <pre className="mt-1 overflow-x-auto rounded-md bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
                        {prettyContext}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Steps</p>
                      <ul className="mt-2 space-y-2">
                        {payload.pipelineTrace.steps.map((step) => (
                          <li key={step.label} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                            <p className="text-sm font-semibold">{step.label}</p>
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                              {step.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
                <DynamicNeighborhoodPage
                  experience={payload.experience}
                  source={payload.source}
                  htmlPageUrl={absoluteApiUrl(payload.pageUrl)}
                  pageMode={payload.mode === 'freeform' ? 'freeform' : 'dataset'}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>View structured model output</CardTitle>
                    <CardDescription>
                      The model does not generate React. It generates structured data, and
                      the frontend renders that data into UI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AccordionItem title="Show raw experience JSON">
                      <pre className="overflow-x-auto rounded-md bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
                        {prettyExperience}
                      </pre>
                    </AccordionItem>
                  </CardContent>
                </Card>
              </>
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
