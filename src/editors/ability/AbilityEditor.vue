<template>
  <v-card>
    <v-card-title>
      <h4>
        <v-btn icon color="primary" @click="expand(ability, !expanded)">
          <v-icon v-if="expanded">mdi-arrow-up-drop-circle</v-icon>
          <v-icon v-else>mdi-arrow-down-drop-circle</v-icon>
        </v-btn>
        {{ ability.id }} - {{ ability.label }}
      </h4>
      <v-spacer></v-spacer>
      <v-alert
        v-if="hasErrors"
        border="right"
        colored-border
        type="error"
        elevation="2"
      >
        {{ errors }}
      </v-alert>
      <ConfirmDeletion @delete="deleteAbility()" :text="deletionWarningText" />
    </v-card-title>
    <v-card-subtitle v-if="!expanded">
      {{ summary }}
    </v-card-subtitle>
    <v-card-text v-if="expanded">
      <v-container>
        <v-row>
          <v-col cols="3">
            <EditableTextField
              label="ID"
              :value="ability.id"
              @change="changeId"
            />
          </v-col>
          <v-col cols="9">
            <EditableTextField
              label="Name"
              :value="ability.label"
              @change="changeName"
            />
          </v-col>
          <v-col cols="9">
            <EditableTextField
              label="Description"
              :value="ability.description"
              @change="changeDescription"
            />
          </v-col>
          <v-col cols="9">
            <EditableTextField
              label="Notes"
              :value="ability.notes"
              @change="changeNotes"
            />
          </v-col>
          <v-col cols="3">
            <SwitchInput
              label="Has direct damage?"
              :value="ability.damage"
              @change="changeDamage"
            />
          </v-col>
          <v-col cols="3">
            <EditableIntegerField
              label="Power"
              :value="ability.power"
              @change="changePower"
              :disabled="!ability.damage"
            />
          </v-col>
          <v-col cols="3">
            <EditableIntegerField
              label="Precision"
              :value="ability.precision"
              @change="changePrecision"
              :disabled="!ability.damage"
            />
          </v-col>
          <v-col cols="3">
            <stat-selector
              label="Attacker stat"
              :value="ability.atkStat"
              :values="attackerStats"
              @change="changeAttackerStat"
              :disabled="!ability.damage"
            />
          </v-col>
          <v-col cols="3">
            <stat-selector
              label="Defender stat"
              :value="ability.defStat"
              :values="defenderStats"
              @change="changeDefenderStat"
              :disabled="!ability.damage"
            />
          </v-col>
          <v-col cols="3">
            <TypesSelector
              label="Types"
              :values="ability.types"
              @change="changeTypes"
            />
          </v-col>
          <v-col cols="3">
            <EditableIntegerField
              label="Recharge family (1=fastest, 8=slowest)"
              :value="ability.rechargeFamily"
              @change="changeRechargeFamily"
            />
          </v-col>
          <v-col cols="3">
            <EditableIntegerField
              label="Usages (initial value)"
              :value="ability.usages.current"
              @change="changeUsagesInitial"
            />
          </v-col>
          <v-col cols="3">
            <EditableIntegerField
              label="Usages (MAX)"
              :value="ability.usages.max"
              @change="changeUsagesMax"
            />
          </v-col>
          <v-col cols="12">
            <EditableIntegerField
              label="Range"
              :value="ability.abilityTarget.range"
              @change="changeRange"
            />
          </v-col>
        </v-row>
      </v-container>
      <v-divider></v-divider>
      <v-container>
        <v-row>
          <v-col cols="2"> Additional effects </v-col>
          <v-spacer></v-spacer>
          <v-col cols="2">
            <v-btn color="primary" @click="addEffect"> Add Effect </v-btn>
          </v-col>
          <v-col
            cols="12"
            v-for="(effect, index) in ability.additionalEffects"
            :key="effect.hash()"
          >
            <EffectEditor
              :effect="effect"
              @change="(e) => changeEffect(index, e)"
              @delete="(e) => deleteEffect(index)"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import ConfirmDeletion from "@/components/ConfirmDeletion.vue";
import EditableTextField from "@/components/EditableTextField.vue";
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import Ability from "@/game-engine/monster-action/ability/Ability";
import TypesSelector from "@/editors/type/TypesSelector.vue";
import StatSelector from "./StatSelector.vue";
import StatsConstants from "@/game-engine/monster/stats/StatsContants";
import SwitchInput from "@/components/SwitchInput.vue";
import EffectEditor from "@/editors/ability/effect/EffectEditor.vue";
import Effect from "@/game-engine/monster-action/effects/effect/Effect";
import StatChangeEffect from "@/game-engine/monster-action/effects/effect/StatChangeEffect";
import HitCondition from "@/game-engine/monster-action/effects/condition/HitCondition";

export default Vue.extend({
  name: "AbilityEditor",
  components: {
    ConfirmDeletion,
    EditableTextField,
    EditableIntegerField,
    TypesSelector,
    StatSelector,
    SwitchInput,
    EffectEditor,
  },
  props: {
    ability: Ability,
    expanded: Boolean,
    expand: Function,
  },
  data: () => ({}),
  computed: {
    hasErrors(): boolean {
      return !this.ability.isValid();
    },
    errors(): string {
      try {
        this.ability.validate();
        return "";
      } catch (e) {
        return (e as any).message;
      }
    },
    deletionWarningText(): string {
      return `Deletion of ability ${this.ability.id} - ${this.ability.label} is an irreversible action. Are you sure you want to proceed?`;
    },
    attackerStats(): { key: string; label: string }[] {
      return [
        { key: StatsConstants.ATK, label: "Atk" },
        { key: StatsConstants.INT, label: "Int" },
      ];
    },
    defenderStats(): { key: string; label: string }[] {
      return [
        { key: StatsConstants.DEF, label: "Def" },
        { key: StatsConstants.RES, label: "Res" },
      ];
    },
    summary(): string {
      return this.ability.summary();
    },
  },
  methods: {
    changeId(id: string): void {
      this.$emit("changeId", { oldId: this.ability.id, newId: id });
    },
    changeName(name: string): void {
      this.update((a) => (a.label = name));
    },
    changeDescription(description: string): void {
      this.update((a) => (a.description = description));
    },
    changeNotes(notes: string): void {
      this.update((a) => (a.notes = notes));
    },
    changePower(power: number): void {
      this.update((a) => (a.power = power));
    },
    changePrecision(precision: number): void {
      this.update((a) => (a.precision = precision));
    },
    changeTypes(types: string[]): void {
      this.update((a) => (a.types = types.map((t) => t)));
    },
    changeRechargeFamily(value: number): void {
      this.update((a) => (a.rechargeFamily = value));
    },
    changeAttackerStat(value: string): void {
      this.update((a) => (a.atkStat = value));
    },
    changeDefenderStat(value: string): void {
      this.update((a) => (a.defStat = value));
    },
    changeUsagesInitial(value: number): void {
      this.update((a) => (a.usages.current = value));
    },
    changeUsagesMax(value: number): void {
      this.update((a) => (a.usages.max = value));
    },
    changeRange(value: number): void {
      this.update((a) => (a.abilityTarget.range = value));
    },
    changeDamage(value: boolean): void {
      this.update((a) => (a.damage = value));
    },
    deleteAbility(): void {
      this.$emit("delete");
    },
    changeEffect(index: number, effect: Effect): void {
      this.update((a) => {
        a.additionalEffects[index] = effect;
      });
    },
    addEffect(): void {
      this.update((a) => {
        const effect = new StatChangeEffect(StatsConstants.ATK, 0);
        effect.conditions.push(new HitCondition());
        a.additionalEffects.push(effect);
      });
    },
    deleteEffect(index: number): void {
      this.update((a) => {
        a.additionalEffects.splice(index, 1);
      });
    },
    update(update: (a: Ability) => void): void {
      const ability = this.ability.clone();
      update(ability);
      this.$emit("change", ability);
    },
    deleteIndex(): void {
      this.$emit("delete", this.ability.id);
    },
  },
});
</script>

<style scoped lang="scss">
.v-card__subtitle {
  text-align: left;
}
</style>
