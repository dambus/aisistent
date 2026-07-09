import { TOOL_CONFIG } from '@/lib/config/tools'

export const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(TOOL_CONFIG).map(([slug, config]) => [slug, config.label])
)
