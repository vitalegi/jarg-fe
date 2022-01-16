<template>
  <v-container>
    <v-row>
      <v-col>
        <ImportExportDialog :initialValue="exportJson" @change="importJson" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-text-field v-model="search" label="Search" />
      </v-col>
      <v-col cols="5">
        <v-select
          v-model="sortBy"
          :items="sortByOptions"
          item-text="text"
          item-value="key"
          label="Sort By"
        />
      </v-col>
      <v-col cols="1">
        <v-btn
          icon
          color="primary"
          x-large
          @click="sortOrderAsc = !sortOrderAsc"
        >
          <v-icon v-if="sortOrderAsc">mdi-arrow-down-drop-circle</v-icon>
          <v-icon v-else>mdi-arrow-up-drop-circle</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-iterator :items="filteredMonsters" item-key="monsterId">
          <template v-slot:default="{ items, isExpanded, expand }">
            <v-row>
              <v-col v-for="item in items" :key="item.name" cols="12">
                <MonsterIndexEditor
                  :index="item"
                  :expanded="isExpanded(item)"
                  :expand="expand"
                  @change="updateIndex"
                  @changeId="(e) => updateIndexId(e.oldId, e.newId)"
                  @delete="deleteIndex"
                />
              </v-col>
            </v-row>
          </template>
        </v-data-iterator>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import Vue from "vue";
import MonsterIndexEditor from "./MonsterIndexEditor.vue";
import ImportExportDialog from "../../components/ImportExportDialog.vue";
import Container from "typedi";
import GameAppDataLoader from "@/game-engine/GameAppDataLoader";

export default Vue.extend({
  name: "MonstersIndexEditor",
  components: { MonsterIndexEditor, ImportExportDialog },
  data: () => ({
    gameAppDataLoader: Container.get<GameAppDataLoader>(GameAppDataLoader),
    sortByOptions: [
      { text: "ID", key: "ID" },
      { text: "Name", key: "NAME" },
      { text: "Base HP", key: "BASE_HP" },
      { text: "Base ATK", key: "BASE_ATK" },
      { text: "Base DEF", key: "BASE_DEX" },
      { text: "Base INT", key: "BASE_INT" },
      { text: "Base RES", key: "BASE_RES" },
      { text: "Base HIT", key: "BASE_HIT" },
      { text: "Base DEX", key: "BASE_DEX" },
      { text: "Base SPEED", key: "BASE_SPEED" },
    ],
    sortBy: "ID",
    sortOrderAsc: true,
    search: "",
    monsters: new Array<MonsterIndex>(),
  }),
  computed: {
    filteredMonsters(): MonsterIndex[] {
      return this.monsters
        .filter((m) => this.filter(m))
        .sort((a, b) => this.compare(a, b));
    },
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
    filter(m: MonsterIndex): boolean {
      if (this.search.trim() === "") {
        return true;
      }
      if (m.name.indexOf(this.search.trim()) !== -1) {
        return true;
      }
      return false;
    },
    compare(a: MonsterIndex, b: MonsterIndex): number {
      if (this.sortOrderAsc) {
        return this.doCompare(a, b);
      }
      return this.doCompare(b, a);
    },
    doCompare(a: MonsterIndex, b: MonsterIndex): number {
      switch (this.sortBy) {
        case "ID":
          return a.monsterId.toLowerCase() > b.monsterId.toLowerCase() ? 1 : -1;
        case "NAME":
          return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
        case "BASE_HP":
          return a.baseStats.maxHP - b.baseStats.maxHP;
        case "BASE_ATK":
          return a.baseStats.atk - b.baseStats.atk;
        case "BASE_DEF":
          return a.baseStats.def - b.baseStats.def;
        case "BASE_INT":
          return a.baseStats.int - b.baseStats.int;
        case "BASE_RES":
          return a.baseStats.res - b.baseStats.res;
        case "BASE_HIT":
          return a.baseStats.hit - b.baseStats.hit;
        case "BASE_DEX":
          return a.baseStats.dex - b.baseStats.dex;
        case "BASE_SPEED":
          return a.baseStats.speed - b.baseStats.speed;
      }
      return a.monsterId.toLowerCase() > b.monsterId.toLowerCase() ? 1 : -1;
    },
    importJson(json: string): void {
      const list = JSON.parse(json);
      const monsters = list.map((m: any) => MonsterIndex.fromJson(m));

      this.$store.commit("setMonsterIndexEditor", monsters);
    },
  },
  mounted(): void {
    this.gameAppDataLoader.loadAbilities();
    this.monsters = this.$store.state.monsterIndexEditor as MonsterIndex[];
  },
});
</script>
