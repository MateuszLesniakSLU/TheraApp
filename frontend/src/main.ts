import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import {useAuthStore} from "./store/auth";
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    components,
    directives,
})

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(vuetify)
const auth = useAuthStore()
auth.initFromStorage()
app.mount('#app')
