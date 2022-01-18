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
        <v-data-iterator :items="filteredAbilities" item-key="id">
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
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import Vue from "vue";
import Container from "typedi";
import Ability from "@/game-engine/monster-action/ability/Ability";

export default Vue.extend({
  name: "AbilitySearch",
  components: {},
  props: { abilities: Array, size: { type: String, default: "LARGE" } },
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
    isLarge(): boolean {
      console.log(this.size);
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
    filteredAbilities(): Ability[] {
      return this.getAbilities()
        .filter((m) => this.filter(m))
        .sort((a, b) => this.compare(a, b));
    },
  },
  methods: {
    getAbilities(): Ability[] {
      return this.abilities as Ability[];
    },
    filter(m: Ability): boolean {
      if (this.search.trim() === "") {
        return true;
      }
      const label = m.label.toLowerCase();
      const search = this.search.toLowerCase().trim();
      if (label.indexOf(search) !== -1) {
        return true;
      }
      return false;
    },
    compare(a: Ability, b: Ability): number {
      if (this.sortOrderAsc) {
        return this.doCompare(a, b);
      }
      return this.doCompare(b, a);
    },
    doCompare(a: Ability, b: Ability): number {
      switch (this.sortBy) {
        case "ID":
          return a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1;
        case "NAME":
          return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1;
      }
      return a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1;
    },
  },
});
</script>
