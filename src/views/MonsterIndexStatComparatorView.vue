<template>
  <MonsterIndexStatComparator />
</template>

<script lang="ts">
import Vue from "vue";
import MonsterIndexStatComparator from "@/editors/monster-index/MonsterIndexStatComparator.vue";

export default Vue.extend({
  name: "MonsterIndexStatComparatorView",

  components: {
    MonsterIndexStatComparator,
  },
});
</script>
