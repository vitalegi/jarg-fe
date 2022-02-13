<template>
  <v-simple-table dense>
    <template v-slot:default>
      <thead>
        <tr>
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
        <tr>
          <td>
            <editable-integer-field
              :value="stats.maxHP"
              @change="(e) => change('hp', e)"
            />
          </td>
          <td>
            <editable-integer-field
              :value="stats.atk"
              @change="(e) => change('atk', e)"
            />
          </td>
          <td>
            <editable-integer-field
              :value="stats.def"
              @change="(e) => change('def', e)"
            />
          </td>
          <td>
            <editable-integer-field
              :value="stats.int"
              @change="(e) => change('int', e)"
            />
          </td>
          <td>
            <editable-integer-field
              :value="stats.res"
              @change="(e) => change('res', e)"
            />
          </td>
          <td>
            <editable-integer-field
              :value="stats.hit"
              @change="(e) => change('hit', e)"
            />
          </td>
          <td>
            <editable-integer-field
              :value="stats.dex"
              @change="(e) => change('dex', e)"
            />
          </td>
          <td>
            <editable-integer-field
              :value="stats.speed"
              @change="(e) => change('speed', e)"
            />
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
import Stats from "@/game-engine/model/monster/stats/Stats";
import EditableIntegerField from "@/components/EditableIntegerField.vue";
import Vue from "vue";

export default Vue.extend({
  name: "StatsEditor",
  components: { EditableIntegerField },
  props: {
    stats: Stats,
  },
  data: () => ({}),
  computed: {},
  methods: {
    change(prop: string, value: number): void {
      const stats = this.stats.clone();
      if (prop === "hp") {
        stats.maxHP = value;
      }
      if (prop === "atk") {
        stats.atk = value;
      }
      if (prop === "def") {
        stats.def = value;
      }
      if (prop === "int") {
        stats.int = value;
      }
      if (prop === "res") {
        stats.res = value;
      }
      if (prop === "hit") {
        stats.hit = value;
      }
      if (prop === "dex") {
        stats.dex = value;
      }
      if (prop === "speed") {
        stats.speed = value;
      }
      this.$emit("change", stats);
    },
  },
});
</script>

<style scoped lang="scss">
td {
  text-align: left;
}
</style>
