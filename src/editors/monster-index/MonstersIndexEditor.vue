<template>
  <v-container>
    <v-row>
      <v-col>
        <ImportExportDialog :initialValue="exportJson()" @change="importJson" />
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
        <v-data-iterator :items="monsters" item-key="monsterId">
          <template v-slot:default="{ items, isExpanded, expand }">
            <v-row>
              <v-col v-for="item in items" :key="item.name" cols="12">
                <monster-index-editor
                  :index="item"
                  :expanded="isExpanded(item)"
                  :expand="expand"
                  @change="updateIndex"
                  @changeId="(e) => updateIndexId(e.oldId, e.newId)"
                  @delete="deleteIndex"
                ></monster-index-editor>
              </v-col>
            </v-row>
          </template>
        </v-data-iterator>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import MonsterIndex from "@/models/MonsterIndex";
import Vue from "vue";
import MonsterIndexEditor from "./MonsterIndexEditor.vue";
import ImportExportDialog from "../../components/ImportExportDialog.vue";

export default Vue.extend({
  name: "MonstersIndexEditor",
  components: { MonsterIndexEditor, ImportExportDialog },
  data: () => ({
    sortByOptions: [
      { text: "ID", key: "ID" },
      { text: "Name", key: "NAME" },
    ],
    sortBy: "ID",
    sortOrderAsc: true,
    search: "",
  }),
  computed: {
    monsters(): MonsterIndex[] {
      return this.getMonsters()
        .filter((m) => this.filter(m))
        .sort((a, b) => this.compare(a, b));
    },
  },
  methods: {
    getMonsters(): MonsterIndex[] {
      return this.$store.state.monsterIndexEditor as MonsterIndex[];
    },
    updateIndex(monster: MonsterIndex): void {
      const monsters = this.getMonsters().map((m) => m.clone());
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
      const monsters = this.getMonsters().map((m) => m.clone());
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
      const monsters = this.getMonsters()
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
      if (this.sortBy === "ID") {
        return a.monsterId.toLowerCase() > b.monsterId.toLowerCase() ? 1 : -1;
      }
      if (this.sortBy === "NAME") {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
      }
      return a.monsterId.toLowerCase() > b.monsterId.toLowerCase() ? 1 : -1;
    },
    exportJson(): string {
      return JSON.stringify(this.getMonsters(), undefined, 4);
    },
    importJson(json: string): void {
      const list = JSON.parse(json);
      const monsters = list.map((m: any) => MonsterIndex.fromJson(m));

      this.$store.commit("setMonsterIndexEditor", monsters);
    },
  },
});
</script>
