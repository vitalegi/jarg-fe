<template>
  <v-dialog v-model="dialog" max-width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="selected"
        :label="label"
        append-outer-icon="mdi-map-marker"
        readonly
        v-bind="attrs"
        v-on="on"
      >
        <template v-slot:append-outer>
          <v-btn color="primary" icon v-bind="attrs" v-on="on">
            <v-icon>mdi-account-search</v-icon>
          </v-btn>
        </template>
      </v-text-field>
    </template>
    <v-card>
      <MonsterIndexSearch :monsters="monsters" size="small" v-slot="slotProps">
        <v-container dense>
          <v-row>
            <v-col
              cols="12"
              v-for="item in slotProps.items"
              :key="item.monsterId"
            >
              <v-card @click="(e) => select(item)">
                <v-card-title>
                  <b>{{ item.monsterId }}</b
                  >&nbsp;-&nbsp;{{ item.name }}
                </v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </MonsterIndexSearch>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import MonsterIndex from "@/game-engine/monster/MonsterIndex";
import Vue from "vue";
import MonsterIndexSearch from "./MonsterIndexSearch.vue";

export default Vue.extend({
  name: "SelectMonsterIndex",
  components: { MonsterIndexSearch },
  props: {
    label: {
      type: String,
      default: "Monster",
    },
  },
  data: () => ({ dialog: false, selected: "" }),
  computed: {
    monsters(): MonsterIndex[] {
      return this.$store.state.monsterIndexEditor as MonsterIndex[];
    },
  },
  methods: {
    select(monster: MonsterIndex): void {
      this.dialog = false;
      this.selected = `${monster.monsterId} - ${monster.name}`;
      this.$emit("change", monster);
    },
  },
});
</script>
