import Vue from 'vue'
import VueSocketIO from 'vue-socket.io'
import VueI18n from 'vue-i18n'
import App from './App.vue'


Vue.config.productionTip = false

Vue.use(VueI18n)
Vue.use(new VueSocketIO({
  debug: true,
  connection: 'http://localhost:3000',
}))

new Vue({
  render: h => h(App)
}).$mount('#app')