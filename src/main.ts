import { createApp } from "vue";

import { GesturePlugin } from "@vueuse/gesture";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "./index.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(GesturePlugin);

app.mount("#app");
