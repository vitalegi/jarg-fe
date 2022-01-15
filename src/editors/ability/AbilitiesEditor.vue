<template>
  <v-container>
    <v-row>
      <v-col>
        <ImportExportDialog :initialValue="exportJson" @change="importJson" />
        <v-btn color="primary" class="mx-2" @click="addAbility">
          Add ability
        </v-btn>
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
        <v-data-iterator :items="abilities" item-key="id">
          <template v-slot:default="{ items, isExpanded, expand }">
            <v-row>
              <v-col v-for="item in items" :key="item.id" cols="12">
                <AbilityEditor
                  :ability="item"
                  :expanded="isExpanded(item)"
                  :expand="expand"
                  @change="updateAbility"
                  @changeId="(e) => updateId(e.oldId, e.newId)"
                  @delete="(e) => deleteAbility(item.id)"
                ></AbilityEditor>
              </v-col>
            </v-row>
          </template>
        </v-data-iterator>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import AbilityEditor from "./AbilityEditor.vue";
import ImportExportDialog from "../../components/ImportExportDialog.vue";
import Ability from "@/game-engine/monster-action/ability/Ability";
import UuidUtil from "@/utils/UuidUtil";

export default Vue.extend({
  name: "AbilitiesEditor",
  components: { AbilityEditor, ImportExportDialog },
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
    abilities(): Ability[] {
      return this.getAbilities()
        .filter((m) => this.filter(m))
        .sort((a, b) => this.compare(a, b));
    },
    exportJson(): string {
      return JSON.stringify(
        this.getAbilities().map((a) => a.toJson()),
        undefined,
        4
      );
    },
  },
  methods: {
    getAbilities(): Ability[] {
      return this.$store.state.abilitiesEditor as Ability[];
    },
    addAbility(): void {
      const abilities = this.getAbilities().map((e) => e.clone());
      const ability = new Ability();
      ability.id = UuidUtil.nextId();
      abilities.push(ability);
      this.updateStorage(abilities);
    },
    updateAbility(ability: Ability): void {
      const abilities = this.getAbilities().map((e) => e.clone());
      const index = abilities.findIndex((e) => e.id === ability.id);
      if (index !== -1) {
        abilities[index] = ability;
      } else {
        abilities.push(ability);
      }
      this.updateStorage(abilities);
    },
    updateId(oldId: string, newId: string): void {
      const abilities = this.getAbilities().map((e) => e.clone());
      const oldIndex = abilities.findIndex((e) => e.id === oldId);
      if (oldIndex === -1) {
        throw Error(`Cannot find old entry ${oldId}.`);
      }
      const newIndex = abilities.findIndex((e) => e.id === newId);
      if (newIndex !== -1) {
        throw Error(`New Id ${newId} already in use.`);
      }
      abilities[oldIndex].id = newId;
      this.updateStorage(abilities);
    },
    deleteAbility(id: string): void {
      const abilities = this.getAbilities()
        .map((e) => e.clone())
        .filter((e) => e.id !== id);

      this.updateStorage(abilities);
    },
    filter(ability: Ability): boolean {
      if (this.search.trim() === "") {
        return true;
      }
      const search = this.search.toLowerCase().trim();
      if (ability.label.toLowerCase().indexOf(search) !== -1) {
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
      if (this.sortBy === "ID") {
        return a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1;
      }
      if (this.sortBy === "NAME") {
        return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1;
      }
      return a.id.toLowerCase() > b.id.toLowerCase() ? 1 : -1;
    },
    importJson(json: string): void {
      const list = JSON.parse(json);
      const abilities = list.map(Ability.fromJson);
      this.updateStorage(abilities);
    },
    updateStorage(abilities: Ability[]) {
      this.$store.commit("setAbilitiesEditor", abilities);
    },
  },
});
</script>
