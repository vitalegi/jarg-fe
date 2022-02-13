<template>
  <v-container>
    <v-row>
      <v-col cols="6" style="text-align: left"> If </v-col>
      <v-col cols="6" style="text-align: right"> </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <ConditionEditor
          v-for="(condition, index) in getConditions()"
          :key="index"
          :condition="condition"
          @update="(e) => changeCondition(index, e)"
          @delete="(e) => deleteCondition(index)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ConditionEditor from "@/editors/ability/effect/ConditionEditor.vue";
import Condition from "@/game-engine/ability/effects/condition/Condition";

export default Vue.extend({
  name: "EffectEditor",
  components: {
    ConditionEditor,
  },
  props: {
    conditions: Array,
  },
  data: () => ({}),
  computed: {},
  methods: {
    getConditions(): Condition[] {
      return this.conditions as Condition[];
    },
    changeCondition(index: number, condition: Condition): void {
      this.$emit("update", { index: index, condition: condition });
    },
    deleteCondition(index: number): void {
      this.$emit("delete", index);
    },
  },
});
</script>
