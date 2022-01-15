<template>
  <v-container dense>
    <v-row>
      <v-col cols="12">
        By Level
        <v-btn icon color="primary" class="mx-2" @click="(e) => addAbility()">
          <v-icon>mdi-plus-box</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row
      v-for="(ability, index) in learnableByLevel"
      :key="`${ability.abilityId}_${index}`"
    >
      <v-col cols="1">
        <v-btn
          icon
          color="error"
          class="mx-2"
          @click="(e) => deleteAbility(index)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="6">
        <ComboBoxInput
          :allValues="selectableAbilities"
          label="Ability"
          :values="[getAbilityLabel(ability.abilityId)]"
          @change="(e) => changeAbility(index, e)"
        />
      </v-col>
      <v-col cols="5">
        <EditableIntegerField
          label="Level"
          :value="ability.level"
          @change="(level) => changeLevel(index, level)"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import ComboBoxInput from "@/components/ComboBoxInput.vue";
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import AbilityLearnable from "@/game-engine/monster-action/ability/AbilityLearnable";
import AbilityRepository from "@/game-engine/repositories/AbilityRepository";
import LoggerFactory from "@/logger/LoggerFactory";
import Container from "typedi";
import Vue from "vue";

export default Vue.extend({
  name: "MonsterIndexAbilitiesLearnableEditor",
  props: {
    abilities: {
      type: Array,
    },
  },
  components: {
    ComboBoxInput,
    EditableIntegerField,
  },
  data: () => ({
    abilityRepository: Container.get<AbilityRepository>(AbilityRepository),
    logger: LoggerFactory.getLogger(
      "Editors.MonsterIndex.MonsterIndexAbilitiesLearnableEditor"
    ),
    learnableByLevel: new Array<AbilityLearnable>(),
  }),
  computed: {
    selectableAbilities(): {
      text: string;
      value: string;
      disabled: boolean;
    }[] {
      return this.abilityRepository
        .getAbilities()
        .sort((a, b) => (a.label > b.label ? 1 : -1))
        .map((a) => {
          const disabled =
            this.learnableByLevel.findIndex(
              (ability) => ability.abilityId === a.id
            ) !== -1;
          return { value: a.id, text: a.label, disabled: disabled };
        });
    },
  },
  methods: {
    getAbilityLabel(abilityId: string): string {
      const ability = this.abilityRepository.getAbility(abilityId);
      return ability.label;
    },
    changeAbility(
      index: number,
      newAbility: { text: string; value: string }
    ): void {
      const abilities = this.learnableByLevel.map((a) => a.clone());
      abilities[index].abilityId = newAbility.value;
      this.logger.info(`change ability ${index} ${JSON.stringify(newAbility)}`);
      this.$emit("changeAbilities", abilities);
    },
    changeLevel(index: number, level: number): void {
      const abilities = this.learnableByLevel.map((a) => a.clone());
      abilities[index].level = level;
      this.logger.info(`change ability ${index} ${level}`);
      this.$emit("changeAbilities", abilities);
    },
    deleteAbility(index: number): void {
      const abilities = this.learnableByLevel.map((a) => a.clone());
      abilities.splice(index, 1);
      this.logger.info(`delete ability ${index}`);
      this.$emit("changeAbilities", abilities);
    },
    addAbility(): void {
      const dummy = this.selectableAbilities.filter((a) => !a.disabled)[0]
        .value;
      const ability = AbilityLearnable.byLevel(dummy, 0);
      this.learnableByLevel.push(ability);
    },
  },
  mounted(): void {
    (this.abilities as AbilityLearnable[])
      .filter((a) => a.type === AbilityLearnable.BY_LEVEL)
      .map((a) => a.clone())
      .sort((a, b) => a.level - b.level)
      .forEach((a) => this.learnableByLevel.push(a));
  },
});
</script>

<style scoped lang="scss"></style>
