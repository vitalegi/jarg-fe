<template>
  <v-simple-table dense>
    <template v-slot:default>
      <thead>
        <tr>
          <th>{{ headerCol1 }}</th>
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
          <td>{{ col1[index] }}</td>
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
  },
  data: () => ({}),
});
</script>

<style scoped lang="scss">
td {
  text-align: left;
}
</style>
