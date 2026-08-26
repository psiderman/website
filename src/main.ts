import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import * as Sentry from '@sentry/vue'
import { VueQueryPlugin } from '@tanstack/vue-query'

import './style.css'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Setup FontAwesome
library.add(fab)
app.component('FA', FontAwesomeIcon)

// Initialize Sentry
if (import.meta.env.PROD && ['psiderman.com'].includes(window.location.hostname)) {
  Sentry.init({
    app,
    // Only send errors in production
    beforeSend(event) {
      if (import.meta.env.DEV) {
        return null
      }
      return event
    },
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    // Logs
    enableLogs: true,
    // Environment
    environment: import.meta.env.MODE,
    ignoreErrors: [
      "Unexpected token '<'",
      'loading chunk',
      'Failed to fetch dynamically imported module',
      'Unable to preload CSS',
      'AbortError: Lock broken',
    ],
    integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ['localhost', /^https:\/\/psiderman\.com\/api/],
    // Tracing
    tracesSampleRate: 1.0, // Capture 100% of the transactions
  })
}

import lazy from './directives/lazy'
import tooltip from './directives/tooltip'
import { queryClient } from './queryClient'

app.use(router)
app.directive('tooltip', tooltip)
app.directive('lazy', lazy)
app.use(VueQueryPlugin, { queryClient })

app.mount('#app')
