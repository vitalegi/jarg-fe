<template>
  <v-simple-table dense>
    <template v-slot:default>
      <thead>
        <tr>
          <th v-if="hasCol1">{{ headerCol1 }}</th>
          <th v-if="hasCol2">{{ headerCol2 }}</th>
          <th>HP</th>
          <th>ATK</th>
          <th>DEF</th>
          <th>INT</th>
          <th>RES</th>
          <th>HIT</th>
          <th>DEX</th>
          <th>Speed</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(stat, index) in stats" :key="index">
          <td v-if="hasCol1">{{ col1[index] }}</td>
          <td v-if="hasCol2">{{ col2[index] }}</td>
          <td>{{ stat.maxHP }}</td>
          <td>{{ stat.atk }}</td>
          <td>{{ stat.def }}</td>
          <td>{{ stat.int }}</td>
          <td>{{ stat.res }}</td>
          <td>{{ stat.hit }}</td>
          <td>{{ stat.dex }}</td>
          <td>{{ stat.speed }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "StatsOverview",
  props: {
    stats: Array,
    headerCol1: String,
    col1: Array,
    headerCol2: String,
    col2: Array,
  },
  data: () => ({}),
  computed: {
    hasCol1(): boolean {
      return this.col1 && this.col1.length > 0;
    },
    hasCol2(): boolean {
      return this.col2 && this.col2.length > 0;
    },
  },
});
</script>

<style scoped lang="scss">
td {
  text-align: left;
}
</style>
