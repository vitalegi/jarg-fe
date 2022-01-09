<template>
  <AbilitiesEditor />
</template>

<script lang="ts">
import Vue from "vue";
import AbilitiesEditor from "@/editors/ability/AbilitiesEditor.vue";

export default Vue.extend({
  name: "AbilitiesEditorView",

  components: {
    AbilitiesEditor,
  },
});
</script>
