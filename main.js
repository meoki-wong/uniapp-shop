
// #ifndef VUE3
import Vue from 'vue'
import App from './App'
import uView from "uview";
Vue.use(uView);
Vue.config.productionTip = false
import NavBar from './components/NavBar/Navbar.vue'
App.mpType = 'app'
Vue.component('nav-bar', NavBar)
import './uni.scss'


const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif