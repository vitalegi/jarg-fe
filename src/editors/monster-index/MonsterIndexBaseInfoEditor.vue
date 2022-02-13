<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <EditableTextField label="ID" :value="id" @change="changeId" />
      </v-col>
      <v-col cols="4">
        <EditableTextField label="Name" :value="name" @change="changeName" />
      </v-col>
      <v-col cols="4">
        <TypesSelector label="Types" :values="types" @change="changeTypes" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import TypesSelector from "@/editors/type/TypesSelector.vue";
import EditableTextField from "@/components/EditableTextField.vue";
export default Vue.extend({
  name: "MonsterIndexBaseInfoEditor",
  props: ["id", "name", "types"],
  data: () => ({}),
  components: { TypesSelector, EditableTextField },
  computed: {},
  methods: {
    changeId(id: string): void {
      this.$emit("changeId", id);
    },
    changeName(name: string): void {
      this.$emit("changeName", name);
    },
    changeTypes(types: string[]): void {
      this.$emit("changeTypes", types);
    },
  },
});
</script>

<style scoped lang="scss">
td {
  text-align: left;
}
</style>
