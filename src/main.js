import { createApp, watch } from "vue";
import "./style.css";
import App from "./App.vue";

import router from "./router";
import { createPinia } from "pinia";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import {} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter,
  faDribbble,
  faRedditAlien,
  faGithub,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

import VueLazyload from "vue3-lazyload";
import * as Sentry from "@sentry/vue";

const app = createApp(App);
const pinia = createPinia();

Sentry.init({
  app,
  dsn: "https://f9fb333b90d33074087c3e73695cfd07@o447178.ingest.sentry.io/4506513102012416",
  trackComponents: true,
  integrations: [],
});

app.use(pinia);
app.use(router);

library.add();
library.add(faTwitter, faDribbble, faRedditAlien, faGithub, faInstagram);

watch(
  pinia.state,
  (state) => {
    localStorage.setItem("store", JSON.stringify(state.store));
  },
  { deep: true },
);

app.component("fa", FontAwesomeIcon);

app.use(VueLazyload);

app.mount("#app");
