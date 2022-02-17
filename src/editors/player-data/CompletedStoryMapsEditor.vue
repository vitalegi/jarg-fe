<template>
  <v-simple-table dense>
    <thead>
      <tr>
        <th class="text-center">Completed</th>
        <th class="text-center">ID</th>
        <th class="text-center">Name</th>
        <th class="text-center">Prerequisites</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="map in maps" :key="map.id">
        <td>
          <SwitchInput
            :value="isCompleted(map.id)"
            @change="(v) => changeCompletion(map.id, v)"
          />
        </td>
        <td>
          {{ map.id }}
        </td>
        <td>
          {{ map.name }}
        </td>
        <td>{{ getPrerequisites(map) }}</td>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<script lang="ts">
import Vue from "vue";
import LoggerFactory from "@/logger/LoggerFactory";
import GameAssetService from "@/services/GameAssetService";
import Container from "typedi";
import MapIndex from "@/game-engine/model/map/MapIndex";
import SwitchInput from "@/components/SwitchInput.vue";

export default Vue.extend({
  name: "CompletedStoryMapsEditor",
  props: {
    completedMaps: Array,
  },
  components: {
    SwitchInput,
  },
  data: () => ({
    logger: LoggerFactory.getLogger(
      "Editors.PlayerData.CompletedStoryMapsEditor"
    ),
    gameAssetService: Container.get(GameAssetService),
    maps: new Array<MapIndex>(),
  }),
  methods: {
    isCompleted(mapId: string): boolean {
      return this.getCompletedMaps().includes(mapId);
    },
    getCompletedMaps(): string[] {
      return this.completedMaps as string[];
    },
    getPrerequisites(map: MapIndex): string {
      return map.prerequisites.join(", ");
    },
    changeCompletion(id: string, completed: boolean): void {
      this.logger.info(`Set completion ${completed} on map ${id}`);
      const completedMaps = this.completedMaps.map((m) => m);
      if (completed) {
        if (!completedMaps.includes(id)) {
          completedMaps.push(id);
        }
        const preconditions = this.getAllPreconditions(id);
        preconditions.forEach((p) => {
          if (!completedMaps.includes(p)) {
            completedMaps.push(p);
          }
        });
      } else {
        if (completedMaps.includes(id)) {
          completedMaps.splice(completedMaps.indexOf(id), 1);
        }
      }
      this.$emit("change", completedMaps);
    },
    getAllPreconditions(mapId: string): string[] {
      const map = this.maps.find((m) => m.id === mapId);
      if (!map) {
        return [];
      }
      return map.prerequisites.flatMap((p) => [
        p,
        ...this.getAllPreconditions(p),
      ]);
    },
  },
  mounted(): void {
    this.gameAssetService.getMaps().then((maps) => {
      this.logger.info(`Loaded ${maps.length} maps.`);
      this.maps.push(...maps);
    });
  },
});
</script>
