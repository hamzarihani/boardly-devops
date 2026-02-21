import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initI18n } from './i18n'
import './assets/main.css'

initI18n()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
