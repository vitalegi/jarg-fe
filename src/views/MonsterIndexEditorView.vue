<template>
  <monsters-index-editor />
</template>

<script lang="ts">
import Vue from "vue";
import MonstersIndexEditor from "@/editors/monster-index/MonstersIndexEditor.vue";

export default Vue.extend({
  name: "MonsterIndexEditorView",

  components: {
    MonstersIndexEditor,
  },
});
</script>
