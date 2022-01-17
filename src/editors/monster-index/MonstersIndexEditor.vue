<template>
  <v-container>
    <v-row>
      <v-col>
        <ImportExportDialog :initialValue="exportJson" @change="importJson" />
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
import ImportExportDialog from "../../components/ImportExportDialog.vue";
import MonsterIndexSearch from "./MonsterIndexSearch.vue";

export default Vue.extend({
  name: "MonstersIndexEditor",
  components: { MonsterIndexEditor, ImportExportDialog, MonsterIndexSearch },
  data: () => ({
    monsters: new Array<MonsterIndex>(),
  }),
  computed: {
    exportJson(): string {
      return JSON.stringify(this.$store.state.monsterIndexEditor, undefined, 4);
    },
    storedMonsters(): MonsterIndex[] {
      return this.$store.state.monsterIndexEditor as MonsterIndex[];
    },
  },
  watch: {
    storedMonsters(monsters) {
      this.monsters.splice(0);
      this.monsters.push(...monsters);
    },
  },
  methods: {
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
