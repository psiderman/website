import tippy, { followCursor, type Instance, type Props } from 'tippy.js'
import { createSingleton, type CreateSingletonInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/animations/shift-away-subtle.css'

import type { ObjectDirective } from 'vue'

// ── Singleton registry ────────────────────────────────────────────────
interface GroupEntry {
  instances: Set<Instance>
  singleton: CreateSingletonInstance | null
}

interface TooltipElement extends HTMLElement {
  _lazyContent?: () => Element | string
  _tippy?: Instance
  _tooltipGroup?: string
}

/** Extended options: pass a `group` string to share a singleton tooltip. */
interface TooltipOptions extends Omit<Partial<Props>, 'content'> {
  content?: (() => Element | string) | Element | string
  group?: string
}

type TooltipValue = (() => Element | string) | null | string | TooltipOptions

const groups = new Map<string, GroupEntry>()

function resolveOptions(value: TooltipValue): {
  group: string | undefined
  props: Omit<Partial<Props>, 'content'> & { content?: (() => Element | string) | Element | string }
} {
  if (!value) return { group: undefined, props: {} }
  if (typeof value === 'string') return { group: undefined, props: { content: value } }
  if (typeof value === 'function') return { group: undefined, props: { content: value } }

  const { group, ...rest } = value as TooltipOptions
  return { group, props: rest }
}

const BASE_PROPS: Partial<Props> = {
  allowHTML: false,
  animation: 'shift-away-subtle',
  appendTo: () => document.body,
  delay: [100, 0],
  placement: 'top',
  theme: 'tippy-small',
}

// ── Directive ─────────────────────────────────────────────────────────
function initTippy(el: TooltipElement, value: TooltipValue) {
  const { group, props } = resolveOptions(value)

  // If there's no content, do not initialize tippy
  if (!props.content) return

  const plugins = props.followCursor ? [followCursor] : []

  if (typeof props.content === 'function') {
    el._lazyContent = props.content
  } else {
    delete el._lazyContent
  }

  const instance = tippy(el, {
    ...BASE_PROPS,
    plugins,
    ...props,
    content: el._lazyContent ? '' : (props.content as Element | string),
    onShow(instance) {
      if (el._lazyContent && !instance.props.content) {
        instance.setContent(el._lazyContent())
      }
      if (props.onShow) {
        props.onShow(instance)
      }
    },
  })

  el._tippy = instance

  if (group && el._tippy) {
    el._tooltipGroup = group
    registerInGroup(group, el._tippy)
  }
}

// ── Singleton helpers ─────────────────────────────────────────────────
function rebuildSingleton(groupId: string) {
  const entry = groups.get(groupId)
  if (!entry) return

  const arr = Array.from(entry.instances)

  if (entry.singleton) {
    entry.singleton.setInstances(arr)
  } else if (arr.length >= 2) {
    entry.singleton = createSingleton(arr, {
      allowHTML: false,
      appendTo: () => document.body,
      delay: [100, 0],
      moveTransition: 'transform 0.15s ease-out',
      overrides: ['content', 'placement', 'allowHTML'],
      theme: 'tippy-small',
    })
  }
}

function registerInGroup(groupId: string, instance: Instance) {
  let entry = groups.get(groupId)
  if (!entry) {
    entry = { instances: new Set(), singleton: null }
    groups.set(groupId, entry)
  }
  entry.instances.add(instance)
  rebuildSingleton(groupId)
}

function unregisterFromGroup(groupId: string, instance: Instance) {
  const entry = groups.get(groupId)
  if (!entry) return

  // Destroy singleton first so it releases the instances
  if (entry.singleton) {
    entry.singleton.destroy()
    entry.singleton = null
  }

  entry.instances.delete(instance)

  if (entry.instances.size === 0) {
    groups.delete(groupId)
  } else {
    rebuildSingleton(groupId)
  }
}

const tooltip: ObjectDirective<TooltipElement, TooltipValue> = {
  mounted(el, binding) {
    if (binding.value) {
      initTippy(el, binding.value)
    }
  },

  unmounted(el) {
    if (el._tooltipGroup && el._tippy) {
      unregisterFromGroup(el._tooltipGroup, el._tippy)
    }
    if (el._tippy) {
      el._tippy.destroy()
    }
  },

  updated(el, binding) {
    const { group, props } = resolveOptions(binding.value)

    // If there is no content, destroy the existing tippy instance (conditional tooltip)
    if (!props.content) {
      if (el._tippy) {
        if (el._tooltipGroup) {
          unregisterFromGroup(el._tooltipGroup, el._tippy)
          el._tooltipGroup = undefined
        }
        el._tippy.destroy()
        el._tippy = undefined
        delete el._lazyContent
      }
      return
    }

    // If there is no tippy instance yet, initialize it
    if (!el._tippy) {
      initTippy(el, binding.value)
      return
    }

    const next = props.content
    if (typeof next === 'function') {
      el._lazyContent = next
      if (el._tippy.props.content) {
        el._tippy.setContent(next())
      }
    } else {
      delete el._lazyContent
      if (next === el._tippy.props.content) return
      el._tippy.setProps({ content: next })
    }

    // Handle group transitions
    if (group !== el._tooltipGroup) {
      if (el._tooltipGroup) {
        unregisterFromGroup(el._tooltipGroup, el._tippy)
      }
      el._tooltipGroup = group
      if (group) {
        registerInGroup(group, el._tippy)
      }
    } else if (el._tooltipGroup) {
      rebuildSingleton(el._tooltipGroup)
    }
  },
}

export default tooltip
