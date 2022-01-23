<template>
  <v-app>
    <v-app-bar app color="primary" v-if="showHeaders">
      <div class="d-flex align-center title">JaRG - Just a RPG Game</div>

      <v-spacer></v-spacer>

      <div id="nav">
        <router-link to="/game">Game</router-link> |
        <router-link to="/monsters/editor">Monsters</router-link> |
        <router-link to="/abilities/editor">Abilities</router-link> |
        <router-link to="/monsters/comparator">Compare</router-link> |
        <router-link to="/about">About</router-link>
      </div>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",

  data: () => ({
    //
  }),
  computed: {
    showHeaders(): boolean {
      return !this.$store.state.gameMode;
    },
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

.title {
  font-weight: bolder;
  color: white;
}

#nav {
  padding: 30px;

  a {
    color: white;
    //font-weight: bold;

    &.router-link-exact-active {
      color: white;
      text-decoration-line: none;
    }
  }
}

.bolder {
  font-weight: bolder;
}
</style>
