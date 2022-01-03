<template>
  <v-container>
    <v-row>
      <v-col>
        <v-select
          v-model="sortBy"
          :items="sortByOptions"
          item-text="text"
          item-value="key"
          label="Sort By"
        />
      </v-col>
      <v-col>
        <v-select
          v-model="sortOrder"
          :items="sortOrderOptions"
          item-text="text"
          item-value="key"
          label="Sort By"
        />
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
import { MonsterIndex } from "@/models/Character";
import Vue from "vue";
import MonsterIndexEditor from "./MonsterIndexEditor.vue";

export default Vue.extend({
  name: "MonstersIndexEditor",
  components: { MonsterIndexEditor },
  data: () => ({
    sortByOptions: [
      { text: "ID", key: "ID" },
      { text: "Name", key: "NAME" },
    ],
    sortOrderOptions: [
      { text: "Ascending", key: "ASC" },
      { text: "Descending", key: "DESC" },
    ],
    sortBy: "ID",
    sortOrder: "ASC",
  }),
  computed: {
    monsters(): MonsterIndex[] {
      return this.getMonsters().sort((a, b) => this.compare(a, b));
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
    compare(a: MonsterIndex, b: MonsterIndex): number {
      if (this.sortOrder === "ASC") {
        return this.doCompare(a, b);
      }
      return this.doCompare(b, a);
    },
    doCompare(a: MonsterIndex, b: MonsterIndex): number {
      if (this.sortBy === "ID") {
        return a.monsterId > b.monsterId ? 1 : -1;
      }
      if (this.sortBy === "NAME") {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
      }
      return a.monsterId > b.monsterId ? 1 : -1;
    },
  },
});
</script>
