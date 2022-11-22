import { createApp } from 'vue'
import { createPinia } from 'pinia';
import './style.css'
import App from './App.vue'

const piniaInstance = createPinia();

console.log(piniaInstance);

createApp(App).mount('#app')
