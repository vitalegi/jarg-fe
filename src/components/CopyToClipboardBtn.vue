<template>
  <v-btn v-if="!done" icon @click="exportText()">
    <v-icon>mdi-content-copy</v-icon>
  </v-btn>
  <v-btn v-else icon color="green">
    <v-icon>mdi-check</v-icon>
  </v-btn>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "CopyToClipboardBtn",
  props: {
    value: String,
  },
  data: () => ({
    done: false,
  }),
  computed: {},
  methods: {
    exportText(): void {
      navigator.clipboard.writeText(this.value).then((v) => {
        this.done = true;
        setTimeout(() => {
          this.done = false;
        }, 1300);
      });
    },
  },
});
</script>

<style lang="scss" scoped></style>
