<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <ComboBoxInput
          :allValues="conditions"
          label="Condition"
          :values="[condition.type]"
          @change="changeType"
        />
      </v-col>
      <v-col cols="8" v-if="isRandomCondition()">
        <EditableIntegerField
          label="Threshold"
          :value="100 * condition.threshold"
          @change="changeThreshold"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import Condition from "@/game-engine/monster-action/effects/condition/Condition";
import HitCondition from "@/game-engine/monster-action/effects/condition/HitCondition";
import RandomCondition from "@/game-engine/monster-action/effects/condition/RandomCondition";
import ComboBoxInput from "@/components/ComboBoxInput.vue";

export default Vue.extend({
  name: "ConditionEditor",
  components: {
    EditableIntegerField,
    ComboBoxInput,
    /*
    SwitchInput,
    ConfirmDeletion,
    EditableTextField,
    TypesSelector,
    StatSelector,
    SwitchInput,*/
  },
  props: {
    condition: Object,
  },
  data: () => ({
    type: "",
  }),
  computed: {
    deletionWarningText(): string {
      return `Deletion of condition is an irreversible action. Are you sure you want to proceed?`;
    },
    conditions(): { text: string; value: string }[] {
      return [
        { value: HitCondition.KEY, text: "Hit" },
        { value: RandomCondition.KEY, text: "Random" },
      ];
    },
  },
  methods: {
    isHitCondition(): boolean {
      return this.type === HitCondition.KEY;
    },
    isRandomCondition(): boolean {
      return this.type === RandomCondition.KEY;
    },
    getCondition(): Condition {
      return this.condition as Condition;
    },
    changeType(type: { text: string; value: string }): void {
      if (type.value === this.getCondition().type) {
        return;
      }
      if (type.value === HitCondition.KEY) {
        this.$emit("update", new HitCondition());
      }
      if (type.value === RandomCondition.KEY) {
        this.$emit("update", new RandomCondition(100));
      }
    },
    changeThreshold(value: number): void {
      this.$emit("update", new RandomCondition(value / 100));
    },
    delete(): void {
      this.$emit("delete");
    },
  },
  mounted() {
    this.type = this.getCondition().type;
  },
});
</script>
