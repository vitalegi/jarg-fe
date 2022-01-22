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
        <v-col v-if="isStatusChangeEffect" cols="2">
          <ComboBoxInput
            :allValues="statuses"
            label="Status"
            :multiple="false"
            :values="[effect.status]"
            @change="changeStatus"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="1" style="text-align: left"> Duration </v-col>
        <v-col cols="4">
          <ComboBoxInput
            :allValues="durations"
            label="Duration"
            :values="[effect.duration.type]"
            @change="changeDuration"
          />
        </v-col>
        <v-col v-if="isFixedDuration" cols="2">
          <EditableIntegerField
            label="Turns"
            :value="effect.duration.end"
            @change="(e) => changeFixedDuration(e)"
          />
        </v-col>
        <v-col v-if="isRandomDuration" cols="2">
          <EditableIntegerField
            label="Success completion %"
            :value="100 * effect.duration.threshold"
            @change="(e) => changeRandomDuration(e / 100)"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import Vue from "vue";
import ConfirmDeletion from "@/components/ConfirmDeletion.vue";
import EditableIntegerField from "@/components/EditableIntegerField.vue";
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
import StatusChangeEffect from "@/game-engine/monster-action/effects/effect/StatusChangeEffect";
import StatusContants from "@/game-engine/monster/status/StatusContants";
import { Immediate } from "@/game-engine/monster-action/effects/duration/Immediate";
import { FixedDuration } from "@/game-engine/monster-action/effects/duration/FixedDuration";
import { RandomDuration } from "@/game-engine/monster-action/effects/duration/RandomDuration";

export default Vue.extend({
  name: "EffectEditor",
  components: {
    ConfirmDeletion,
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
        { value: StatusChangeEffect.KEY, text: "Alter status" },
        { value: HpDamageEffect.KEY, text: "Change HP of fixed amount" },
      ];
    },
    durations(): { text: string; value: string }[] {
      const supported = this.getEffect().supportedDurations();
      return [
        { value: Immediate.TYPE, text: "Immediate" },
        { value: FixedDuration.TYPE, text: "Fixed" },
        { value: RandomDuration.TYPE, text: "Random duration" },
      ].filter((e) => supported.indexOf(e.value) !== -1);
    },
    isStatChangeEffect(): boolean {
      return this.getEffect().type === StatChangeEffect.KEY;
    },
    isStatusChangeEffect(): boolean {
      return this.getEffect().type === StatusChangeEffect.KEY;
    },
    isHpDamageEffect(): boolean {
      return this.getEffect().type === HpDamageEffect.KEY;
    },
    isImmediate(): boolean {
      return this.getEffect().duration.type === Immediate.TYPE;
    },
    isFixedDuration(): boolean {
      return this.getEffect().duration.type === FixedDuration.TYPE;
    },
    isRandomDuration(): boolean {
      return this.getEffect().duration.type === RandomDuration.TYPE;
    },
    targetType(): string[] {
      return [TargetType.SELF, TargetType.TARGET];
    },
    stats(): string[] {
      return StatsConstants.COLLECTION;
    },
    statuses(): string[] {
      return StatusContants.COLLECTION;
    },
  },
  methods: {
    getEffect(): Effect {
      return this.effect as Effect;
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
      if (type.value === StatusChangeEffect.KEY) {
        newEffect = new StatusChangeEffect(StatusContants.POISON);
      }
      if (newEffect) {
        newEffect.target = this.getEffect().target.clone();
        newEffect.conditions = this.getEffect().conditions.map((c) =>
          c.clone()
        );
        newEffect.duration = this.getEffect().duration.clone();
        const supportedDurations = newEffect.supportedDurations();
        if (supportedDurations.indexOf(newEffect.duration.type) === -1) {
          newEffect.duration = this.createDuration(supportedDurations[0]);
        }
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
    changeStatus(status: string): void {
      const e = this.getEffect().clone();
      (e as StatusChangeEffect).status = status;
      this.$emit("change", e);
    },
    changeDuration(type: { text: string; value: string }): void {
      if (type.value === this.getEffect().duration.type) {
        return;
      }
      const newDuration = this.createDuration(type.value);
      if (newDuration) {
        const e = this.getEffect().clone();
        e.duration = newDuration;
        this.$emit("change", e);
      }
    },
    createDuration(type: string) {
      if (type === Immediate.TYPE) {
        return new Immediate();
      }
      if (type === FixedDuration.TYPE) {
        return new FixedDuration(0);
      }
      if (type === RandomDuration.TYPE) {
        return new RandomDuration(0);
      }
      throw Error(`Unknown duration ${type}`);
    },
    changeFixedDuration(end: number): void {
      const e = this.getEffect().clone();
      (e.duration as FixedDuration).end = end;
      this.$emit("change", e);
    },
    changeRandomDuration(threshold: number): void {
      const e = this.getEffect().clone();
      (e.duration as RandomDuration).threshold = threshold;
      this.$emit("change", e);
    },
  },
});
</script>
