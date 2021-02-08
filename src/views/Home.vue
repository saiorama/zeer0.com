<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <navbar/>
    <notifications/>
    <sidebar/>
    <thorax/>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue'
import Navbar from '@/components/Navbar.vue'
import Notifications from '@/components/Notifications.vue'
import Sidebar from '@/components/Sidebar.vue'
import Thorax from '../components/Thorax.vue'

export default {
  name: 'Home',
  components: {
    // HelloWorld,
    Navbar,
    Notifications,
    Sidebar,
    Thorax,
  }
}
</script>
