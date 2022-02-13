<template>
  <v-dialog v-model="dialog" max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="model"
        :label="label"
        append-outer-icon="mdi-map-marker"
        readonly
        v-bind="attrs"
        v-on="on"
      >
        <template v-slot:prepend>
          <v-btn color="primary" icon v-bind="attrs" v-on="on">
            <v-icon>mdi-account-search</v-icon>
          </v-btn>
        </template>
        <template v-slot:append-outer>
          <v-btn color="primary" icon @click="reset">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </template>
    <v-card>
      <AbilitySearch :abilities="abilities" size="small" v-slot="slotProps">
        <v-container dense>
          <v-row>
            <v-col cols="12" v-for="item in slotProps.items" :key="item.id">
              <v-card @click="(e) => select(item)">
                <v-card-title>
                  <b>{{ item.id }}</b
                  >&nbsp;-&nbsp;{{ item.label }}
                </v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </AbilitySearch>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Ability from "@/game-engine/model/ability/Ability";
import Vue from "vue";
import AbilitySearch from "@/editors/ability/AbilitySearch.vue";

export default Vue.extend({
  name: "SelectAbility",
  components: { AbilitySearch },
  props: {
    label: {
      type: String,
      default: "Ability",
    },
    initialValue: {
      type: Ability,
    },
  },
  data: () => ({ dialog: false, model: "" }),
  computed: {
    abilities(): Ability[] {
      return this.$store.state.abilitiesEditor as Ability[];
    },
  },
  methods: {
    select(ability: Ability): void {
      this.dialog = false;
      this.model = this.getLabel(ability);
      this.$emit("change", ability);
    },
    reset(): void {
      this.dialog = false;
      this.model = "";
      this.$emit("change", null);
    },
    getLabel(ability: Ability | null): string {
      if (ability) {
        return `${ability.id} - ${ability.label}`;
      }
      return "";
    },
  },
  mounted(): void {
    if (this.initialValue) {
      this.model = this.getLabel(this.initialValue);
    }
  },
});
</script>
