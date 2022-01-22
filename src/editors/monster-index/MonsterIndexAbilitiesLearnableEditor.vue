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
      v-for="(ability, index) in alreadyAssignedAbilities"
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
        <SelectAbility
          :initialValue="findAbility(ability.abilityId)"
          @change="(a) => changeAbility(index, a)"
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
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import Ability from "@/game-engine/monster-action/ability/Ability";
import AbilityLearnable from "@/game-engine/monster-action/ability/AbilityLearnable";
import LoggerFactory from "@/logger/LoggerFactory";
import Container from "typedi";
import Vue from "vue";
import AbilityEditorRepository from "../ability/AbilityEditorRepository";
import SelectAbility from "../ability/SelectAbility.vue";

export default Vue.extend({
  name: "MonsterIndexAbilitiesLearnableEditor",
  props: {
    abilities: {
      type: Array,
    },
  },
  components: {
    EditableIntegerField,
    SelectAbility,
  },
  data: () => ({
    abilityEditorRepository: Container.get<AbilityEditorRepository>(
      AbilityEditorRepository
    ),
    logger: LoggerFactory.getLogger(
      "Editors.MonsterIndex.MonsterIndexAbilitiesLearnableEditor"
    ),
    allAbilities: new Array<Ability>(),
  }),
  computed: {
    alreadyAssignedAbilities(): AbilityLearnable[] {
      return this.getAbilities().sort((a, b) => a.level - b.level);
    },
    selectableAbilities(): {
      text: string;
      value: string;
      disabled: boolean;
    }[] {
      return this.allAbilities
        .map((a) => a.clone())
        .sort((a, b) => (a.label > b.label ? 1 : -1))
        .map((a) => {
          const disabled =
            this.getAbilities().findIndex(
              (ability) => ability.abilityId === a.id
            ) !== -1;
          return { value: a.id, text: a.label, disabled: disabled };
        });
    },
  },
  methods: {
    getAbilities(): AbilityLearnable[] {
      return this.abilities as AbilityLearnable[];
    },
    findAbility(abilityId: string): Ability | null {
      const ability = this.allAbilities.find((a) => a.id === abilityId);
      if (ability) {
        return ability;
      }
      return null;
    },
    changeAbility(index: number, newAbility: Ability | null): void {
      const abilities = this.getAbilities().map((a) => a.clone());
      const abilityId = newAbility ? newAbility.id : "";
      abilities[index].abilityId = abilityId;
      this.logger.info(`change ability ${index} to ${abilityId}`);
      this.$emit("changeAbilities", abilities);
    },
    changeLevel(index: number, level: number): void {
      const abilities = this.getAbilities().map((a) => a.clone());
      abilities[index].level = level;
      this.logger.info(`change ability ${index} ${level}`);
      this.$emit("changeAbilities", abilities);
    },
    deleteAbility(index: number): void {
      const abilities = this.getAbilities().map((a) => a.clone());
      abilities.splice(index, 1);
      this.logger.info(`delete ability ${index}`);
      this.$emit("changeAbilities", abilities);
    },
    addAbility(): void {
      const available = this.selectableAbilities.filter((a) => !a.disabled);
      if (available.length === 0) {
        return;
      }
      const dummy = available[0].value;
      const ability = AbilityLearnable.byLevel(dummy, 1);
      const abilities = this.getAbilities().map((a) => a.clone());
      abilities.push(ability);
      this.logger.info(`add ability ${JSON.stringify(ability)}`);
      this.$emit("changeAbilities", abilities);
    },
  },
  beforeMount() {
    this.allAbilities.splice(0);
    this.allAbilities.push(...this.abilityEditorRepository.load());
  },
});
</script>

<style scoped lang="scss"></style>
