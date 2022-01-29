<template>
  <v-container>
    <v-row>
      <v-col style="text-align: right">
        <ImportDialog
          title="Import monsters"
          :initialValue="exportJson"
          @change="importJson"
        />
        <MonstersIndexAbilitiesImport @select="massiveAddAbilities" />
        <CopyToClipboardBtn :value="exportJson" />
      </v-col>
    </v-row>
    <v-row>
      <MonsterIndexSearch :monsters="monsters" v-slot="slotProps">
        <v-row>
          <v-col
            v-for="item in slotProps.items"
            :key="item.monsterId"
            cols="12"
          >
            <MonsterIndexEditor
              :index="item"
              :expanded="slotProps.isExpanded(item)"
              :expand="slotProps.expand"
              :monsters="monsters"
              :abilities="storedAbilities"
              @change="updateIndex"
              @changeId="(e) => updateIndexId(e.oldId, e.newId)"
              @delete="deleteIndex"
            />
          </v-col>
        </v-row>
      </MonsterIndexSearch>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import Vue from "vue";
import MonsterIndexEditor from "./MonsterIndexEditor.vue";
import ImportDialog from "../../components/ImportDialog.vue";
import MonsterIndexSearch from "./MonsterIndexSearch.vue";
import MonstersIndexAbilitiesImport from "./MonstersIndexAbilitiesImport.vue";
import LoggerFactory from "@/logger/LoggerFactory";
import AbilityLearnable from "@/game-engine/monster-action/ability/AbilityLearnable";
import CopyToClipboardBtn from "@/components/CopyToClipboardBtn.vue";
import Ability from "@/game-engine/monster-action/ability/Ability";

export default Vue.extend({
  name: "MonstersIndexEditor",
  components: {
    MonsterIndexEditor,
    ImportDialog,
    MonsterIndexSearch,
    MonstersIndexAbilitiesImport,
    CopyToClipboardBtn,
  },
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.MonsterIndex.MonstersIndexEditor"),
    monsters: new Array<MonsterIndex>(),
  }),
  computed: {
    exportJson(): string {
      return JSON.stringify(this.$store.state.monsterIndexEditor, undefined, 4);
    },
    storedMonsters(): MonsterIndex[] {
      return this.$store.state.monsterIndexEditor as MonsterIndex[];
    },
    storedAbilities(): Ability[] {
      return this.$store.state.abilitiesEditor;
    },
  },
  watch: {
    storedMonsters(monsters) {
      this.monsters.splice(0);
      this.monsters.push(...monsters);
    },
  },
  methods: {
    massiveAddAbilities(
      abilities: {
        monsterId: string;
        type: string;
        abilityId: string;
        level: number;
      }[]
    ): void {
      const monsters = this.monsters.map((m) => m.clone());
      let failures: string[] = [];
      for (const ability of abilities) {
        try {
          this.doAddAbility(monsters, ability);
        } catch (e) {
          failures.push(
            `Error while processing ability: monsterId=${ability.monsterId}, abilityId=${ability.abilityId}, type=${ability.type}, level=${ability.level}. Error: ${e}`
          );
        }
      }
      console.error(failures);
      this.$store.commit("setMonsterIndexEditor", monsters);
    },
    doAddAbility(
      monsters: MonsterIndex[],
      ability: {
        monsterId: string;
        type: string;
        abilityId: string;
        level: number;
      }
    ): void {
      const learnable = new AbilityLearnable();
      learnable.type = ability.type;
      learnable.abilityId = ability.abilityId;
      learnable.level = ability.level;

      const monster = monsters.filter(
        (m) => m.monsterId === ability.monsterId
      )[0];
      const index = monster.learnableAbilities.findIndex(
        (a) => a.abilityId === ability.abilityId
      );

      if (index === -1) {
        monster.learnableAbilities.push(learnable);
      } else {
        monster.learnableAbilities[index] = learnable;
      }
    },
    updateIndex(monster: MonsterIndex): void {
      const monsters = this.monsters.map((m) => m.clone());
      const index = monsters.findIndex(
        (m) => m.monsterId === monster.monsterId
      );
      if (index !== -1) {
        monsters[index] = monster;
      } else {
        monsters.push(monster);
      }
      this.$store.commit("setMonsterIndexEditor", monsters);
    },
    updateIndexId(oldId: string, newId: string): void {
      const monsters = this.monsters.map((m) => m.clone());
      const oldIndex = monsters.findIndex((m) => m.monsterId === oldId);
      if (oldIndex === -1) {
        throw Error(`Cannot find old index ${oldId}.`);
      }
      const newIndex = monsters.findIndex((m) => m.monsterId === newId);
      if (newIndex !== -1) {
        throw Error(`New Id ${newId} already in use.`);
      }
      monsters[oldIndex].monsterId = newId;
      this.$store.commit("setMonsterIndexEditor", monsters);
    },
    deleteIndex(monsterId: string): void {
      const monsters = this.monsters
        .map((m) => m.clone())
        .filter((m) => m.monsterId !== monsterId);

      this.$store.commit("setMonsterIndexEditor", monsters);
    },
    importJson(json: string): void {
      const list = JSON.parse(json);
      const monsters = list.map((m: any) => MonsterIndex.fromJson(m));

      this.$store.commit("setMonsterIndexEditor", monsters);
    },
  },
  mounted(): void {
    this.monsters = this.$store.state.monsterIndexEditor as MonsterIndex[];
  },
});
</script>
