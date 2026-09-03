import type { ClearanceLevel } from '@/types'

export const clearanceLevels: ClearanceLevel[] = ['auth', 'known', 'friends', 'close']
export const quoteClearanceLevels: ClearanceLevel[] = ['public', 'friends', 'close']

export const roleBadgeClasses: Record<ClearanceLevel, string> = {
  admin: 'bg-red-500 dark:bg-red-400',
  auth: 'bg-yellow-500 dark:bg-yellow-400',
  close: 'bg-green-500 dark:bg-green-400',
  friends: 'bg-purple-500 dark:bg-purple-400',
  known: 'bg-blue-500 dark:bg-blue-400',
  public: 'bg-dark',
}

export function getRoleBadgeClass(role: ClearanceLevel) {
  return roleBadgeClasses[role] || roleBadgeClasses.public
}
