<template>
  <v-container>
    <v-row>
      <v-col :cols="colsSearch">
        <v-text-field v-model="search" label="Search" />
      </v-col>
      <v-col :cols="colsSortBy">
        <v-select
          v-model="sortBy"
          :items="sortByOptions"
          item-text="text"
          item-value="key"
          label="Sort By"
        />
      </v-col>
      <v-col :cols="colsOrder">
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
            <slot
              v-bind:items="items"
              v-bind:isExpanded="isExpanded"
              v-bind:expand="expand"
            ></slot>
          </template>
        </v-data-iterator>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import MonsterIndex from "@/game-engine/model/monster/MonsterIndex";
import Vue from "vue";
import Container from "typedi";

export default Vue.extend({
  name: "MonstersIndexSearch",
  components: {},
  props: { monsters: Array, size: { type: String, default: "LARGE" } },
  data: () => ({
    sortByOptions: [
      { text: "ID", key: "ID" },
      { text: "Name", key: "NAME" },
      { text: "Base HP", key: "BASE_HP" },
      { text: "Base ATK", key: "BASE_ATK" },
      { text: "Base DEF", key: "BASE_DEF" },
      { text: "Base INT", key: "BASE_INT" },
      { text: "Base RES", key: "BASE_RES" },
      { text: "Base HIT", key: "BASE_HIT" },
      { text: "Base DEX", key: "BASE_DEX" },
      { text: "Base SPEED", key: "BASE_SPEED" },
      { text: "# Abilities", key: "ABILITIES_COUNT" },
    ],
    sortBy: "ID",
    sortOrderAsc: true,
    search: "",
  }),
  computed: {
    isLarge(): boolean {
      return this.size.toUpperCase() === "LARGE";
    },
    isSmall(): boolean {
      return this.size.toUpperCase() === "SMALL";
    },
    colsSearch(): number {
      if (this.isLarge) {
        return 6;
      }
      return 12;
    },
    colsSortBy(): number {
      if (this.isLarge) {
        return 5;
      }
      return 8;
    },
    colsOrder(): number {
      if (this.isLarge) {
        return 1;
      }
      return 4;
    },
    filteredMonsters(): MonsterIndex[] {
      return this.getMonsters()
        .filter((m) => this.filter(m))
        .sort((a, b) => this.compare(a, b));
    },
  },
  methods: {
    getMonsters(): MonsterIndex[] {
      return this.monsters as MonsterIndex[];
    },
    filter(m: MonsterIndex): boolean {
      if (this.search.trim() === "") {
        return true;
      }
      const name = m.name.toLowerCase();
      const search = this.search.toLowerCase().trim();
      if (name.indexOf(search) !== -1) {
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
        case "ABILITIES_COUNT":
          return a.learnableAbilities.length - b.learnableAbilities.length;
      }
      return a.monsterId.toLowerCase() > b.monsterId.toLowerCase() ? 1 : -1;
    },
  },
});
</script>
