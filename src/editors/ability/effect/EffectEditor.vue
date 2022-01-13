<template>
  <v-card>
    <v-card-title>
      <ConfirmDeletion
        :icon="false"
        label="Delete Effect"
        @delete="deleteEffect"
        :text="deletionWarningText"
      />
      <v-btn color="primary" @click="addCondition"> Add Condition </v-btn>
    </v-card-title>
    <ConditionsEditor
      :conditions="effect.conditions"
      @update="changeCondition"
      @delete="deleteCondition"
    />
    <v-container>
      <v-row>
        <v-col cols="1" style="text-align: left"> On </v-col>
        <v-col cols="2">
          <ComboBoxInput
            :allValues="targetType"
            label="Target type"
            :values="[effect.target.type]"
            @change="changeTarget"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="1" style="text-align: left"> Do </v-col>
        <v-col cols="4">
          <ComboBoxInput
            :allValues="effects"
            label="Effect"
            :values="[effect.type]"
            @change="changeEffect"
          />
        </v-col>
        <v-col v-if="isStatChangeEffect" cols="2">
          <ComboBoxInput
            :allValues="stats"
            label="Stat"
            :values="[effect.stat]"
            @change="changeStat"
          />
        </v-col>
        <v-col v-if="isStatChangeEffect" cols="2">
          <EditableIntegerField
            label="Percentage"
            :value="100 * effect.percentage"
            @change="(e) => changeStatPercentage(e / 100)"
          />
        </v-col>
        <v-col v-if="isHpDamageEffect"> hp damage </v-col>
      </v-row>
    </v-container>
  </v-card>
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
import ConditionsEditor from "./ConditionsEditor.vue";
import Condition from "@/game-engine/monster-action/effects/condition/Condition";
import Target from "@/game-engine/monster-action/effects/target/Target";
import HitCondition from "@/game-engine/monster-action/effects/condition/HitCondition";
import StatChangeEffect from "@/game-engine/monster-action/effects/effect/StatChangeEffect";
import HpDamageEffect from "@/game-engine/monster-action/effects/effect/HpDamageEffect";
import StatsConstants from "@/game-engine/monster/stats/StatsContants";

export default Vue.extend({
  name: "EffectEditor",
  components: {
    ConfirmDeletion,
    /*
    EditableTextField,
    TypesSelector,
    StatSelector,
    SwitchInput,*/
    EditableIntegerField,
    ComboBoxInput,
    ConditionsEditor,
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
    effects(): { text: string; value: string }[] {
      return [
        { value: StatChangeEffect.KEY, text: "Change stat" },
        { value: HpDamageEffect.KEY, text: "Change HP of fixed amount" },
      ];
    },
    isStatChangeEffect(): boolean {
      return this.getEffect().type === StatChangeEffect.KEY;
    },
    isHpDamageEffect(): boolean {
      return this.getEffect().type === HpDamageEffect.KEY;
    },
    targetType(): string[] {
      return [TargetType.SELF, TargetType.TARGET];
    },
    stats(): string[] {
      return StatsConstants.COLLECTION;
    },
  },
  methods: {
    getEffect(): Effect {
      return this.effect as Effect;
    },
    changeName(name: string): void {
      return; //this.update((a) => (a.label = name));
    },
    changeTarget(target: string): void {
      const t = new Target();
      t.type = target;
      this.update((e) => (e.target = t));
    },
    addCondition(): void {
      const effect = this.getEffect().clone();
      effect.conditions.push(new HitCondition());
      this.$emit("change", effect);
    },
    changeCondition(e: { index: number; condition: Condition }): void {
      const effect = this.getEffect().clone();
      effect.conditions[e.index] = e.condition;
      this.$emit("change", effect);
    },
    deleteCondition(index: number): void {
      const effect = this.getEffect().clone();
      effect.conditions.splice(index, 1);
      this.$emit("change", effect);
    },
    update(update: (e: Effect) => void): void {
      const effect = this.getEffect().clone();
      update(effect);
      this.$emit("change", effect);
    },
    deleteEffect(): void {
      this.$emit("delete", this.index);
    },
    changeEffect(type: { text: string; value: string }): void {
      if (type.value === this.getEffect().type) {
        return;
      }
      let newEffect = null;
      if (type.value === StatChangeEffect.KEY) {
        newEffect = new StatChangeEffect(StatsConstants.ATK, 0);
      }
      if (type.value === HpDamageEffect.KEY) {
        newEffect = new HpDamageEffect();
      }
      if (newEffect) {
        newEffect.target = this.getEffect().target.clone();
        newEffect.conditions = this.getEffect().conditions.map((c) =>
          c.clone()
        );
        this.$emit("change", newEffect);
      }
    },
    changeStat(stat: string): void {
      const e = this.getEffect().clone();
      (e as StatChangeEffect).stat = stat;
      this.$emit("change", e);
    },
    changeStatPercentage(percentage: number): void {
      const e = this.getEffect().clone();
      (e as StatChangeEffect).percentage = percentage;
      this.$emit("change", e);
    },
  },
});
</script>
