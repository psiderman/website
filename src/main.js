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
} from "@fortawesome/free-brands-svg-icons";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);

library.add();
library.add(faTwitter, faDribbble, faRedditAlien);

app.component("fa", FontAwesomeIcon);

app.mount("#app");
