import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initI18n } from './i18n'
import { useAuthStore } from './stores/auth'
import './assets/main.css'

initI18n()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const authStore = useAuthStore()
authStore.initialize().then(() => {
  app.mount('#app')
})
