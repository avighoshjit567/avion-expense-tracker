import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@bhplugin/vue3-datatable/dist/style.css'
import './styles.css'

createApp(App).use(router).mount('#app')
