<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on, attrs }">
      <v-btn class="mx-2" icon v-bind="attrs" v-on="on">
        <v-icon>mdi-folder-open-outline</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-card-title> {{ title }} </v-card-title>
      <v-card-text>
        <v-textarea outlined v-model="value" label="JSON value"></v-textarea>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" text @click="importData()"> Import </v-btn>
        <v-btn text @click="cancel()"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ImportDialog",
  props: {
    initialValue: String,
    title: String,
  },
  data: () => ({
    value: "",
    dialog: false,
  }),
  computed: {},
  methods: {
    importData(): void {
      this.$emit("change", this.value);
      this.dialog = false;
    },
    cancel(): void {
      this.dialog = false;
    },
  },
  mounted() {
    this.value = this.initialValue;
  },
});
</script>

<style lang="scss" scoped>
.col {
  text-align: left;
}
</style>
