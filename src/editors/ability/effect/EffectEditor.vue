<template>
  <v-container>
    <v-row>
      <v-col cols="2">
        <ComboBoxInput
          :allValues="targetType"
          label="Target type"
          :values="[effect.target.type]"
        />
      </v-col>
      <v-col cols="12">
        <ConditionEditor
          v-for="(condition, index) in effect.conditions"
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
import ConfirmDeletion from "@/components/ConfirmDeletion.vue";
import EditableTextField from "@/components/EditableTextField.vue";
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import Ability from "@/game-engine/monster-action/Ability";
import TypesSelector from "@/editors/type/TypesSelector.vue";
import StatSelector from "./StatSelector.vue";
import SwitchInput from "@/components/SwitchInput.vue";
import ComboBoxInput from "@/components/ComboBoxInput.vue";
import Effect from "@/game-engine/monster-action/effects/effect/Effect";
import TargetType from "@/game-engine/monster-action/effects/target/TargetType";
import ConditionEditor from "./ConditionEditor.vue";
import Condition from "@/game-engine/monster-action/effects/condition/Condition";

export default Vue.extend({
  name: "EffectEditor",
  components: {
    /*
    ConfirmDeletion,
    EditableTextField,
    EditableIntegerField,
    TypesSelector,
    StatSelector,
    SwitchInput,*/
    ComboBoxInput,
    ConditionEditor,
  },
  props: {
    index: Number,
    effect: Object,
    expanded: Boolean,
    expand: Function,
  },
  data: () => ({}),
  computed: {
    deletionWarningText(): string {
      return `Deletion of effect is an irreversible action. Are you sure you want to proceed?`;
    },
    targetType(): string[] {
      return [TargetType.SELF, TargetType.TARGET];
    },
  },
  methods: {
    getEffect(): Effect {
      return this.effect as Effect;
    },
    changeName(name: string): void {
      return; //this.update((a) => (a.label = name));
    },
    changeCondition(index: number, condition: Condition): void {
      const effect = this.getEffect().clone();
      effect.conditions[index] = condition;
      this.$emit("change", effect);
    },
    deleteCondition(index: number): void {
      const effect = this.getEffect().clone();
      effect.conditions = effect.conditions.splice(index, 1);
      this.$emit("change", effect);
    },
    update(update: (e: Effect) => void): void {
      const effect = this.getEffect().clone();
      update(effect);
      this.$emit("change", effect);
    },
    delete(): void {
      this.$emit("delete", this.index);
    },
  },
});
</script>
