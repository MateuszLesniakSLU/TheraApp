import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'        // global CSS
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

export default createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
    }
})

