// Structural types for Vercel serverless handlers (avoids untyped `any`
// while keeping the handlers dependency-free).
export interface VercelRequest {
  body: unknown
  headers: Record<string, string | string[] | undefined>
  method?: string
  query: Record<string, string | string[] | undefined>
}

export interface VercelResponse {
  json(body: unknown): void
  setHeader(key: string, value: string): VercelResponse
  status(code: number): VercelResponse
}
