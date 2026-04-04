import { createApp } from 'vue';
import App from './App.vue';
import './index.css';
import vConsole from 'vconsole';

// Initialize vConsole for debugging
new vConsole();
createApp(App).mount('#app');
