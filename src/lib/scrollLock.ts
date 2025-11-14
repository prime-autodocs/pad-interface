// Simple global scroll lock with reference counting across overlays
const GLOBAL_KEY_LOCKS = '__padScrollLocks__'
const GLOBAL_KEY_PREV = '__padPrevOverflow__'

function getLocks(): Set<string> {
  const w = window as any
  if (!w[GLOBAL_KEY_LOCKS]) {
    w[GLOBAL_KEY_LOCKS] = new Set<string>()
  }
  return w[GLOBAL_KEY_LOCKS] as Set<string>
}

export function lockScroll(sourceId: string): void {
  const w = window as any
  const locks = getLocks()
  if (locks.size === 0) {
    w[GLOBAL_KEY_PREV] = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  locks.add(sourceId)
}

export function unlockScroll(sourceId: string): void {
  const w = window as any
  const locks = getLocks()
  locks.delete(sourceId)
  if (locks.size === 0) {
    const prev: string | undefined = w[GLOBAL_KEY_PREV]
    document.body.style.overflow = prev ?? ''
    w[GLOBAL_KEY_PREV] = undefined
  }
}


