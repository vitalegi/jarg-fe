<template>
  <v-dialog v-model="dialog" persistent max-width="500px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon color="primary" class="mx-2" v-bind="attrs" v-on="on">
        <v-icon>mdi-plus-box-multiple</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title>Abilities Import</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-select
                label="Column separator"
                :items="separators()"
                v-model="columnSeparator"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                outlined
                v-model="csv"
                :error-messages="validateInput()"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn text @click="close()"> Close </v-btn>
        <v-btn
          color="primary"
          text
          @click="confirmAndClose"
          :disabled="hasErrors"
        >
          Import
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Ability from "@/game-engine/model/ability/Ability";
import AbilityLearnable from "@/game-engine/model/ability/AbilityLearnable";
import LoggerFactory from "@/logger/LoggerFactory";
import NumberUtil from "@/utils/NumberUtil";
import Container from "typedi";
import Vue from "vue";
import AbilityEditorRepository from "@/editors/ability/AbilityEditorRepository";

const DEFAULT_VALUE = "BY_LEVEL;Azione;1\nBY_LEVEL;Ruggito;5";

export default Vue.extend({
  name: "MonsterIndexAbilitiesImport",
  props: {},
  components: {},
  data: () => ({
    abilityEditorRepository: Container.get(AbilityEditorRepository),
    logger: LoggerFactory.getLogger(
      "Editors.MonsterIndex.MonsterIndexAbilitiesImport"
    ),
    dialog: false,
    allAbilities: new Array<Ability>(),
    columnSeparator: ";",
    csv: DEFAULT_VALUE,
  }),
  computed: {
    hasErrors(): boolean {
      return this.validateInput().length > 0;
    },
  },
  methods: {
    separators(): { text: string; value: string }[] {
      return [
        { value: "\t", text: "TAB" },
        { value: ";", text: "Semicolon (;)" },
      ];
    },
    validateInput(): string[] {
      try {
        this.processCsv(this.csv);
        return [];
      } catch (e) {
        return [(e as any).message as string];
      }
    },
    confirmAndClose(): void {
      this.$emit("select", this.processCsv(this.csv));
      this.csv = DEFAULT_VALUE;
      this.dialog = false;
    },
    close(): void {
      this.csv = DEFAULT_VALUE;
      this.dialog = false;
    },
    processCsv(value: string): AbilityLearnable[] {
      return this.getLines(value).map((line) =>
        this.lineToAbilityLearnable(line)
      );
    },
    getLines(value: string): string[] {
      const lines = value.split("\n");
      return lines.filter((line) => line.trim() !== "");
    },
    findAbilityByName(name: string): Ability | null {
      const ability = this.allAbilities.find(
        (a) => a.label.toLowerCase() === name.toLowerCase()
      );
      if (ability) {
        return ability;
      }
      return null;
    },
    lineToAbilityLearnable(line: string): AbilityLearnable {
      const content = line.split(this.columnSeparator);
      if (content.length < 2) {
        throw Error(`Line is missing mandatory fields, actual: ${content}`);
      }
      const type = content[0].trim();
      const name = content[1].trim();
      const out = new AbilityLearnable();
      const ability = this.findAbilityByName(name);
      if (!ability) {
        throw Error(`Ability ${name} not found`);
      }
      if (type === AbilityLearnable.BY_LEVEL) {
        if (content.length < 3) {
          throw Error(`Line is missing mandatory fields, actual: ${content}`);
        }
        out.type = AbilityLearnable.BY_LEVEL;
        out.abilityId = ability.id;
        const level = content[2];
        if (!NumberUtil.isNumber(level)) {
          throw Error(`Not a number ${level}`);
        }
        out.level = NumberUtil.parseAsInt(level);
      } else {
        throw Error(`Type ${type} not recognized`);
      }
      return out;
    },
  },
  beforeMount() {
    this.allAbilities.splice(0);
    this.allAbilities.push(...this.abilityEditorRepository.load());
  },
});
</script>

<style scoped lang="scss"></style>
