export const EMOJI_GROUPS = [
  { emoji: '🌻', id: 'life', label: 'Life' },
  { emoji: '💼', id: 'work', label: 'Work' },
  { emoji: '🤑', id: 'personal_finance', label: 'Personal Finance' },
  { emoji: '🧱', id: 'building', label: 'Building' },
  // { emoji: '🕹️', id: 'gaming', label: 'Gaming' },
  { emoji: '🗺️', id: 'travel', label: 'Travel' },
  { emoji: '🎷', id: 'music', label: 'Music' },
] as const

export type EmojiGroupId = EmojiGroupDef['id']
type EmojiGroupDef = (typeof EMOJI_GROUPS)[number]
