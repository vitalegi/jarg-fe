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
        <v-checkbox v-model="onlyWithNotes" label="Only with notes" />
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
import Vue from "vue";
import StringUtil from "@/utils/StringUtil";
import Ability from "@/game-engine/model/ability/Ability";

export default Vue.extend({
  name: "AbilitySearch",
  components: {},
  props: { abilities: Array, size: { type: String, default: "LARGE" } },
  data: () => ({
    sortByOptions: [
      { text: "ID", key: "ID" },
      { text: "Name", key: "NAME" },
      { text: "Recharge", key: "RECHARGE" },
      { text: "Errors", key: "ERRORS" },
    ],
    sortBy: "ID",
    sortOrderAsc: true,
    search: "",
    onlyWithNotes: false,
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
      if (this.onlyWithNotes && StringUtil.isNullOrEmpty(m.notes)) {
        return false;
      }
      if (this.search.trim() === "") {
        return true;
      }
      const text =
        m.id.toLowerCase() +
        " " +
        m.label.toLowerCase() +
        " " +
        m.summary().toLowerCase();
      const search = this.search.toLowerCase().trim();
      if (text.indexOf(search) !== -1) {
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
        case "RECHARGE":
          return a.rechargeFamily - b.rechargeFamily;
        case "ERRORS":
          if (a.isValid() && !b.isValid()) {
            return 1;
          }
          if (!a.isValid() && b.isValid()) {
            return -1;
          }
          break;
      }
      return a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1;
    },
  },
});
</script>
