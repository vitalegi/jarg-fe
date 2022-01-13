<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-if="icon"
        icon
        color="error"
        v-bind="attrs"
        v-on="on"
        class="mx-2"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-btn v-else color="error" v-bind="attrs" v-on="on" class="mx-2">
        {{ label }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title> Confirm Deletion </v-card-title>
      <v-card-text>
        {{ text }}
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" text @click="confirm()"> Confirm </v-btn>
        <v-btn text @click="cancel()"> Cancel </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ConfirmDeletion",
  props: {
    text: String,
    icon: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: "",
    },
  },
  data: () => ({
    dialog: false,
  }),
  computed: {},
  methods: {
    confirm(): void {
      this.$emit("delete");
      this.dialog = false;
    },
    cancel(): void {
      this.dialog = false;
    },
  },
});
</script>

<style lang="scss" scoped>
.col {
  text-align: left;
}
</style>
