<template>
  <v-simple-table dense>
    <template v-slot:default>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <v-text-field dense v-model="modelId" @change="changeId" />
          </td>
          <td>
            <v-text-field dense v-model="modelName" @change="changeName" />
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "MonsterIndexBaseInfoEditor",
  props: ["id", "name"],
  data: () => ({
    modelId: "",
    modelName: "",
  }),
  computed: {},
  methods: {
    changeId(id: string): void {
      this.$emit("changeId", id);
    },
    changeName(name: string): void {
      this.$emit("changeName", name);
    },
  },
  mounted() {
    this.modelId = this.id;
    this.modelName = this.name;
  },
});
</script>

<style scoped lang="scss">
td {
  text-align: left;
}
</style>
