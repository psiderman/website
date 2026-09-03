import { global } from '@/composables/useGlobal'

import { resolveInputCoords } from './box'
import { activeUserId, userColor, userName } from './identity'
import { channel, hasOtherUsersOnRoom } from './presence'
import { isHomeView, isMobile, windowWidth } from './state'

const THROTTLE_MS = 2000
let lastSent = 0

const handleMouseMove = (e: MouseEvent) => {
  if (isMobile.value) return // Mobile uses touchstart
  if (!global.allowMultiplayer.value) return
  if (!isHomeView.value) return
  if (!hasOtherUsersOnRoom.value) return
  if (!channel) return

  const now = Date.now()
  if (now - lastSent < THROTTLE_MS) return
  lastSent = now

  const { box, x, y } = resolveInputCoords(
    e.target as Element,
    e.pageX,
    e.pageY,
    e.clientX,
    e.clientY,
    windowWidth.value,
  )

  channel.send({
    event: 'cursor',
    payload: {
      box,
      color: userColor.value,
      id: activeUserId.value,
      name: userName.value,
      x,
      y,
    },
    type: 'broadcast',
  })
}

const handleTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return
  if (!global.allowMultiplayer.value) return
  if (!isHomeView.value) return
  if (!hasOtherUsersOnRoom.value) return
  if (!channel) return
  if (e.changedTouches.length === 0) return

  const now = Date.now()
  if (now - lastSent < THROTTLE_MS) return
  lastSent = now

  const touch = e.changedTouches[0]
  const { box, x, y } = resolveInputCoords(
    e.target as Element,
    touch.pageX,
    touch.pageY,
    touch.clientX,
    touch.clientY,
    windowWidth.value,
  )

  channel.send({
    event: 'touch',
    payload: {
      box,
      color: userColor.value,
      id: activeUserId.value,
      name: userName.value,
      timestamp: now,
      x,
      y,
    },
    type: 'broadcast',
  })
}

export { handleMouseMove, handleTouchStart }
