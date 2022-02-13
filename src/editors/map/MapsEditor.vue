<template>
  <v-container class="pa-0">
    <v-row>
      <v-col cols="12"> </v-col>
    </v-row>
    <v-data-iterator :items="maps" item-key="id">
      <template v-slot:header>
        <v-row>
          <v-col cols="1"><b>ID</b></v-col>
          <v-col cols="3"><b>Name</b></v-col>
          <v-col cols="4"><b>Url</b></v-col>
          <v-col cols="3"><b>Pre-requisites</b></v-col>
          <v-col cols="1"> </v-col>
        </v-row>
      </template>
      <template v-slot:default="{ items }">
        <v-row v-for="map in items" :key="map.id">
          <v-col cols="1" v-if="isEdit(map)">
            <v-text-field dense :value="map.id" @change="changeId" />
          </v-col>
          <v-col cols="1" v-else>
            {{ map.id }}
          </v-col>

          <v-col cols="3" v-if="isEdit(map)">
            <v-text-field dense :value="map.name" @change="changeName" />
          </v-col>
          <v-col cols="3" v-else>
            {{ map.name }}
          </v-col>

          <v-col cols="4" v-if="isEdit(map)">
            <v-text-field dense :value="map.url" @change="changeUrl" />
          </v-col>
          <v-col cols="4" v-else>
            {{ map.url }}
          </v-col>

          <v-col cols="3">
            {{ map.prerequisites }}
          </v-col>
          <v-col cols="1">
            <v-btn icon v-if="isEdit(map)" @click="editMap('')">
              <v-icon>mdi-content-save-outline</v-icon>
            </v-btn>
            <v-btn icon v-else @click="editMap(map.id)">
              <v-icon>mdi-note-edit-outline</v-icon>
            </v-btn>
            <v-btn icon>
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </v-data-iterator>
  </v-container>
</template>

<script lang="ts">
import LoggerFactory from "@/logger/LoggerFactory";
import Vue from "vue";
import GameAppDataLoader from "@/game-engine/GameAppDataLoader";
import Container from "typedi";
import MapModelRepository from "@/game-engine/map/MapModelRepository";
import MapIndex from "@/game-engine/model/map/MapIndex";

export default Vue.extend({
  name: "MapEditor",
  components: {},
  data: () => ({
    logger: LoggerFactory.getLogger("Editors.Map.MapsEditor"),
    maps: new Array<MapIndex>(),
    edit: "",
  }),
  methods: {
    isEdit(map: MapIndex): boolean {
      return map.id === this.edit;
    },
    editMap(mapId: string): void {
      this.edit = mapId;
    },
    saveEdit(): void {
      this.edit = "";
    },
    changeId(value: string): void {
      this.maps.filter((m) => m.id === this.edit)[0].id = value;
    },
    changeName(value: string): void {
      this.maps.filter((m) => m.id === this.edit)[0].name = value;
    },
    changeUrl(value: string): void {
      this.maps.filter((m) => m.id === this.edit)[0].url = value;
    },
  },
  async mounted(): Promise<void> {
    const loader = Container.get<GameAppDataLoader>(GameAppDataLoader);
    await loader.loadMaps();
    const repo = Container.get<MapModelRepository>(MapModelRepository);
    this.maps.push(...repo.getMaps());
  },
});
</script>

<style lang="scss" scoped></style>
