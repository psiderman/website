export function handleSmartApostrophes(e: Event, update: (val: string) => void) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  const original = target.value
  const transformed = original
    // Between letters (e.g. don't, it's, you're, we'll)
    .replace(/(\p{L})'(\p{L})/gu, '$1’$2')
    // Decades & 2-digit years (e.g. '26, '90s, '80)
    .replace(/(^|[\s(["'/{])'(\d{2})/g, '$1’$2')
    // Common leading contractions (e.g. 'tis, 'twas, 'cause, 'em, 'round, 'bout, 'til, 'n)
    .replace(/(^|[\s(["'/{])'(tis|twas|cause|em|round|bout|til|n)\b/gi, '$1’$2')
    // Trailing g-dropping contractions (e.g. rockin', walkin', nothin')
    .replace(/(\p{L})in'\b/gu, '$1in’')

  if (transformed !== original) {
    const start = target.selectionStart
    const end = target.selectionEnd
    target.value = transformed
    update(transformed)
    if (start !== null && end !== null) {
      target.setSelectionRange(start, end)
    }
  } else {
    update(original)
  }
}
