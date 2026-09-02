// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function respondWithError(res: any, err: unknown): void {
  res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' })
}
