export const EMOJI_GROUPS = [
  { emoji: '🤑', id: 'personal_finance' },
  { emoji: '💼', id: 'work' },
  { emoji: '🛠️', id: 'building' },
  { emoji: '🎵', id: 'music' },
  // { emoji: '🎮', id: 'gaming' },
  { emoji: '🗺️', id: 'travel' },
  { emoji: '🌻', id: 'life' },
] as const

export type EmojiGroupDef = (typeof EMOJI_GROUPS)[number]
export type EmojiGroupId = EmojiGroupDef['id']
