const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  ''

export type NeighborhoodSummary = {
  key: string
  name: string
  borough: string
  pageUrl?: string
}

export type ColorPalette = {
  background: string
  primary: string
  secondary: string
  accent: string
  text: string
}

export type UIItem = {
  label: string
  text: string
}

export type UIBlockType =
  | 'hero'
  | 'intro_columns'
  | 'bio_panel'
  | 'fact_grid'
  | 'split_story'
  | 'pull_quote'
  | 'timeline'
  | 'insight_list'
  | 'cta_band'

export type UIBlock = {
  type: UIBlockType
  kicker: string
  title: string
  subtitle: string
  body: string
  bodySecondary: string
  bullets: string[]
  items: UIItem[]
}

export type NeighborhoodExperience = {
  neighborhoodName: string
  borough: string
  headline: string
  subheadline: string
  byline: string
  bio: string
  readingTimeNote: string
  visualStyle: string
  colorPalette: ColorPalette
  blocks: UIBlock[]
}

export type ExperienceApiResponse = {
  source: 'cache' | 'llm' | string
  matchedKey: string
  mode: 'dataset' | 'freeform' | string
  experience: NeighborhoodExperience
  pipelineTrace: PipelineTrace
  warnings: string[]
  pageUrl: string
}

export type PipelineTraceStep = {
  label: string
  description: string
}

export type PipelineTrace = {
  userInput: string
  matchedKey: string
  mode: 'dataset' | 'freeform' | string
  source: 'cache' | 'llm' | string
  strictDatasetMatch: boolean
  contextUsed: Record<string, unknown>
  userDesignDirection: string
  steps: PipelineTraceStep[]
}

function formatDetail(detail: unknown): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        if (
          typeof d === 'object' &&
          d !== null &&
          'msg' in d &&
          typeof (d as { msg: unknown }).msg === 'string'
        ) {
          return (d as { msg: string }).msg
        }
        return JSON.stringify(d)
      })
      .join('; ')
  }
  return JSON.stringify(detail)
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error('Invalid JSON from API')
  }
  if (!response.ok) {
    const detail =
      typeof data === 'object' &&
      data !== null &&
      'detail' in data &&
      (data as { detail: unknown }).detail !== undefined
        ? formatDetail((data as { detail: unknown }).detail)
        : response.statusText
    throw new Error(detail)
  }
  return data as T
}

export async function fetchNeighborhoods(): Promise<NeighborhoodSummary[]> {
  const res = await fetch(`${API_BASE}/api/neighborhoods`)
  const data = await parseJsonResponse<{ neighborhoods: NeighborhoodSummary[] }>(
    res,
  )
  return data.neighborhoods
}

export async function generateNeighborhoodExperience(
  neighborhood: string,
  options?: { strictDatasetMatch?: boolean; userContext?: string },
): Promise<ExperienceApiResponse> {
  const res = await fetch(`${API_BASE}/api/theme`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      neighborhood,
      strict_dataset_match: options?.strictDatasetMatch ?? false,
      user_context: options?.userContext ?? null,
    }),
  })
  return parseJsonResponse<ExperienceApiResponse>(res)
}

export async function clearCache(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/debug/cache/clear`, {
    method: 'POST',
  })
  return parseJsonResponse<{ message: string }>(res)
}

export function absoluteApiUrl(path: string): string {
  if (path.startsWith('http')) return path
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}
